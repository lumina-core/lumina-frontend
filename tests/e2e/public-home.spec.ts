import { expect, test } from "@playwright/test";

const origin = "https://lumina-news-agent.vercel.app";

test.beforeEach(async ({ context }) => {
  // Explicit anonymous fixtures: browser requests never reach a real account,
  // model, archive or analytics service. Unexpected external requests fail.
  await context.route("**/*", async route => {
    const url = new URL(route.request().url());
    if (url.origin !== "http://127.0.0.1:3100") {
      await route.abort();
      throw new Error(`Unexpected external request: ${url.origin}${url.pathname}`);
    }
    if (url.pathname.startsWith("/api/")) {
      return route.fulfill({ status: 401, json: { detail: "Anonymous browser test fixture" } });
    }
    return route.continue();
  });
});

test('anonymous home is a bilingual 200 with correct SEO even without JavaScript', async ({ browser }, testInfo) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  try {
    const response = await page.goto('http://127.0.0.1:3100/');
    expect(response?.status()).toBe(200);
    await expect(page).toHaveURL('http://127.0.0.1:3100/');
    await expect(page).toHaveTitle('新闻联播检索与分析 | Lumina');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('新闻原文');
    await expect(page.locator('#english')).toHaveAttribute('lang', 'en');
    await expect(page.locator('#english')).toContainText('Email login and credits are required');
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
    // Next normalizes the root canonical by omitting its trailing slash.
    expect(new URL((await page.locator('link[rel="canonical"]').getAttribute('href'))!).href).toBe(origin + '/');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'index, follow');
    expect(new URL((await page.locator('meta[property="og:url"]').getAttribute('content'))!).href).toBe(origin + '/');
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', '新闻联播检索与分析 | Lumina');
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary');
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /Xinwen Lianbo/);
    await expect(page.locator('meta[name="google-site-verification"]')).toHaveAttribute('content', 'oRful_sYpY7YjApxwjoJMXQQbFEZFEqeQG7a9V4vMcQ');
    expect(response?.headers()['x-robots-tag']).toBeUndefined();
    await expect(page.getByRole('link', { name: '进入分析' })).toHaveAttribute('href', '/chat');
    await expect(page.getByRole('link', { name: 'English', exact: true })).toHaveAttribute('href', '#english');
    await page.screenshot({ path: testInfo.outputPath('home-desktop-no-js.png'), fullPage: true });
  } finally {
    await context.close();
  }
});

for (const outcome of ['unauthorized', 'network failure', 'signed in'] as const) {
  test(`home stays visible while auth is delayed and after ${outcome}`, async ({ page }) => {
    let release!: () => void;
    const gate = new Promise<void>(resolve => { release = resolve; });
    await page.route('**/api/v1/auth/me', async route => {
      await gate;
      if (outcome === 'network failure') return route.abort('failed');
      return route.fulfill(outcome === 'signed in'
        ? { json: { id: 1, email: 'fixture@example.org', name: 'Browser fixture' } }
        : { status: 401, json: { detail: 'Anonymous fixture' } });
    });
    await page.route('**/api/v1/credits/balance', route => route.fulfill({ json: { credits: 100 } }));
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    const meRequested = page.waitForRequest('**/api/v1/auth/me');
    await page.goto('/');
    await meRequested; // The client has hydrated; auth is still unresolved.
    await expect(page.getByRole('heading', { level: 1 })).toContainText('新闻原文');
    await expect(page.locator('#english')).toContainText('Xinwen Lianbo');
    await expect(page).toHaveURL(/\/$/);
    const meSettled = outcome === 'network failure'
      ? page.waitForEvent('requestfailed', request => request.url().endsWith('/api/v1/auth/me'))
      : page.waitForResponse('**/api/v1/auth/me');
    release();
    await meSettled;
    // Let React flush the fetch result and both auth effects before asserting.
    await page.waitForTimeout(250);
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('新闻原文');
    await expect(page.locator('script[src*="vercel-insights"], script[src*="/insights/"]')).toHaveCount(0);
    expect(errors).toEqual([]);
    if (outcome === 'unauthorized') {
      await page.getByRole('link', { name: '进入分析' }).click();
      await expect(page).toHaveURL(/\/login$/);
    } else if (outcome === 'signed in') {
      await page.getByRole('link', { name: '进入分析' }).click();
      await expect(page).toHaveURL(/\/chat$/);
      await expect(page.getByRole('heading', { level: 1 })).toContainText('读懂新闻联播里的信号');
    }
  });
}

for (const path of ['/pricing', '/privacy']) {
  test(`${path} remains public through hydration and links home`, async ({ page }) => {
    const me = page.waitForResponse('**/api/v1/auth/me');
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await me;
    await expect(page).toHaveURL(new RegExp(`${path}$`));
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'index, follow');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', origin + path);
    await page.getByRole('link', { name: path === '/pricing' ? 'Lumina' : '返回 Lumina', exact: true }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('新闻原文');
  });
}

for (const path of ['/chat', '/chat/00000000-0000-4000-8000-000000000000', '/history', '/settings', '/cards']) {
  test(`anonymous ${path} stays noindex and redirects to login`, async ({ page, request }) => {
    const response = await request.get(path);
    expect(response.headers()['x-robots-tag']).toBe('noindex, nofollow');
    const html = await response.text();
    expect(html).toMatch(/<meta name="robots" content="noindex, nofollow"/);
    if (path === '/chat') {
      // Preserve the existing static chat canonical; dynamic sessions must not
      // inherit either it or the public homepage's canonical/social URL.
      expect(html).toContain(`<link rel="canonical" href="${origin}/chat"`);
      expect(html).toContain(`<meta property="og:url" content="${origin}/chat"`);
    } else {
      expect(html).not.toMatch(/<link rel="canonical"|<meta property="og:url"/);
    }
    await page.goto(path);
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
  });
}

for (const path of ['/login', '/register', '/forgot-password', '/share/public-test-fixture']) {
  test(`${path} remains anonymous-accessible but noindex`, async ({ page }) => {
    if (path.startsWith('/share/')) {
      await page.route('**/api/v1/history/shared/public-test-fixture', route => route.fulfill({
        json: { title: 'Explicit bearer-share test fixture', created_at: '2026-01-01T00:00:00Z', messages: [] },
      }));
    }
    const me = page.waitForResponse('**/api/v1/auth/me');
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    expect(response?.headers()['x-robots-tag']).toBe('noindex, nofollow');
    await me;
    await expect(page).toHaveURL(new RegExp(`${path}$`));
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
    await expect(page.locator('link[rel="canonical"], meta[property="og:url"]')).toHaveCount(0);
    if (path.startsWith('/share/')) {
      await expect(page.getByRole('heading', { name: 'Explicit bearer-share test fixture' })).toBeVisible();
    }
  });
}

test('sitemap is exactly the public canonical allowlist and API remains noindex', async ({ request }) => {
  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.status()).toBe(200);
  expect(sitemap.headers()['content-type']).toContain('xml');
  const xml = await sitemap.text();
  expect([...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1])).toEqual([
    origin + '/', origin + '/pricing', origin + '/privacy',
  ]);
  expect(xml).not.toContain('<lastmod>');
  const robots = await request.get('/robots.txt');
  expect(await robots.text()).toContain('Allow: /');
  expect(await robots.text()).toContain(`Sitemap: ${origin}/sitemap.xml`);
  const api = await request.get('/api/v1/unknown-test-route');
  expect(api.headers()['x-robots-tag']).toBe('noindex, nofollow');

  // This is the real local handler, not a browser fixture. With no session
  // cookie it must stop before reserving credits or contacting any backend.
  const chat = await request.post('/api/chat/stream', {
    data: {
      query: 'Unauthenticated test request; must not run analysis.',
      session_id: '00000000-0000-4000-8000-000000000000',
    },
  });
  expect(chat.status()).toBe(401);
  expect(chat.headers()['x-robots-tag']).toBe('noindex, nofollow');
});

test('320px home has no overflow, usable touch targets and keyboard navigation', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 320, height: 760 });
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: '跳至正文 / Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main')).toBeFocused();
  await page.getByRole('link', { name: 'English', exact: true }).click();
  await expect(page).toHaveURL(/#english$/);
  await expect(page.locator('#english')).toBeInViewport();
  const layout = await page.evaluate(() => ({
    width: innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    links: [...document.querySelectorAll('a')]
      .filter(a => !a.classList.contains('sr-only'))
      .map(a => ({ name: a.textContent, width: a.getBoundingClientRect().width, height: a.getBoundingClientRect().height })),
  }));
  expect(layout.scrollWidth).toBeLessThanOrEqual(layout.width);
  for (const link of layout.links) {
    expect(link.height, link.name || '').toBeGreaterThanOrEqual(44);
    expect(link.width, link.name || '').toBeGreaterThanOrEqual(44);
  }
  await page.screenshot({ path: testInfo.outputPath('home-320px.png'), fullPage: true });
});
