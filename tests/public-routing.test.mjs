import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadTs } from './load-ts.mjs';

test('the exact public allowlist includes home in the sitemap and sanitized pageviews', () => {
  const { PUBLIC_PATHS, SITE_URL } = loadTs('lib/site.ts');
  const { default: sitemap } = loadTs('app/sitemap.ts');
  const { sanitizePageview } = loadTs('lib/analytics-policy.ts');
  assert.deepEqual(PUBLIC_PATHS, ['/', '/pricing', '/privacy']);
  assert.deepEqual(sitemap(), PUBLIC_PATHS.map(path => ({ url: SITE_URL + path })));
  for (const path of PUBLIC_PATHS) {
    assert.deepEqual(sanitizePageview({ type: 'pageview', url: `${SITE_URL}${path}?email=fixture@example.org#private` }), {
      type: 'pageview', url: SITE_URL + path,
    });
  }
});
