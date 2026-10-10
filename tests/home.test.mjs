import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { loadTs } from './load-ts.mjs';

test('home server-renders a bilingual product introduction with honest access and evidence boundaries', () => {
  const { default: HomePage } = loadTs('app/(public)/page.tsx');
  const html = renderToStaticMarkup(createElement(HomePage));
  assert.match(html, /<h1[^>]*>.*新闻原文/s);
  for (const text of ['新闻联播', '2016', '关键词', '短语', '日期', '年', '月', '日', '原文', '示例问题', '邮箱登录', '积分', 'token', '报道频次', '现实世界']) {
    assert.ok(html.includes(text), `Missing Chinese product information: ${text}`);
  }
  assert.match(html, /id="english"[^>]*lang="en"/);
  for (const text of ['Xinwen Lianbo', 'Chinese', 'keywords', 'phrases', 'date', 'day, month or year', 'source links', 'Email login', 'credits', 'actual token', 'coverage frequency', 'real-world', 'Sample questions']) {
    assert.ok(html.includes(text), `Missing English product information: ${text}`);
  }
  for (const href of ['#main', '#english', '/chat', '/pricing', '/privacy', 'mailto:lumina_dev@163.com']) {
    assert.ok(html.includes(`href="${href}"`), `Missing navigation: ${href}`);
  }
  assert.doesNotMatch(html, /<form|href="\/(?:chat|share)\/|href="[^\"]*\?(?:query|prompt)=/);
});

test('home alone declares canonical indexable metadata and honest text-only social previews', () => {
  const { metadata } = loadTs('app/(public)/page.tsx');
  assert.ok(metadata, 'Homepage must explicitly override the private root metadata');
  assert.deepEqual(metadata.alternates, { canonical: '/' });
  assert.deepEqual(metadata.robots, { index: true, follow: true });
  assert.match(metadata.title, /新闻联播/);
  assert.match(metadata.description, /Xinwen Lianbo/);
  assert.equal(metadata.openGraph.url, '/');
  assert.match(metadata.openGraph.title, /Lumina/);
  assert.equal(metadata.openGraph.description, metadata.description);
  assert.equal(metadata.twitter.card, 'summary');
  assert.equal(metadata.twitter.title, metadata.openGraph.title);
  assert.equal(metadata.twitter.description, metadata.description);
});

test('public pricing and privacy return to home while the product CTA still opens chat', () => {
  const { default: PricingPage } = loadTs('app/(public)/pricing/page.tsx');
  const pricing = renderToStaticMarkup(createElement(PricingPage));
  assert.match(pricing, /<a[^>]*aria-label="Lumina"[^>]*href="\/"/);
  assert.match(pricing, /<a[^>]*href="\/chat"[^>]*>进入产品<\/a>/);
  const { default: PrivacyPage } = loadTs('app/(public)/privacy/page.tsx');
  const privacy = renderToStaticMarkup(createElement(PrivacyPage));
  assert.match(privacy, /<a[^>]*href="\/"[^>]*>返回 Lumina<\/a>/);
});

test('privacy disclosure names all three public analytics paths', () => {
  const { default: PrivacyPage } = loadTs('app/(public)/privacy/page.tsx');
  const html = renderToStaticMarkup(createElement(PrivacyPage));
  assert.ok(html.includes('产品首页（/）、积分方案（/pricing）和本页（/privacy）'));
});
