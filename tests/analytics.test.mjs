import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadTs } from './load-ts.mjs';
const { analyticsAllowed, sanitizePageview } = loadTs('lib/analytics-policy.ts');
const origin = 'https://lumina-news-agent.vercel.app';
test('production-only and browser privacy controls', () => {
  assert.equal(analyticsAllowed({ origin }, {}), true);
  for (const preferences of [{ doNotTrack: '1' }, { globalPrivacyControl: true }]) assert.equal(analyticsAllowed({ origin }, preferences), false);
  for (const other of ['http://lumina-news-agent.vercel.app', 'https://preview.vercel.app', 'http://localhost:3000']) assert.equal(analyticsAllowed({ origin: other }, {}), false);
});
test('redacts query and fragment; refuses private paths and custom events', () => {
  assert.deepEqual(sanitizePageview({ type: 'pageview', url: origin + '/pricing?email=private@example.org#secret' }), { type: 'pageview', url: origin + '/pricing' });
  for (const p of ['/chat', '/chat/secret', '/share/token', '/settings', '/login', '/api/chat/stream']) assert.equal(sanitizePageview({ type: 'pageview', url: origin + p }), null);
  assert.equal(sanitizePageview({ type: 'event', url: origin + '/chat' }), null);
  assert.equal(sanitizePageview({ type: 'pageview', url: 'not a url' }), null);
  assert.equal(sanitizePageview({ type: 'pageview', url: 'https://evil.example/chat' }), null);
});

test('rejects credential-bearing URLs instead of leaking URL userinfo', () => {
  for (const credentials of ['fixture-user@', 'fixture-user:fixture-password@']) {
    assert.equal(sanitizePageview({ type: 'pageview', url: `https://${credentials}lumina-news-agent.vercel.app/` }), null);
  }
});

test('refuses dynamic, near-match, malformed and non-production pageviews', () => {
  for (const url of [
    ...['/chat', '/chat/00000000-0000-4000-8000-000000000000', '/history', '/cards', '/settings', '/share/fixture',
      '/login', '/register', '/forgot-password', '/api/v1/auth/me', '/about', '/docs', '/examples', '/changelog',
      '/pricing/', '/pricing-extra', '/privacy/child', '/Privacy', '/%70ricing', '//pricing', '/%2f'].map(path => origin + path),
    'not a url', '/', 'https://', 'https://[invalid]/',
    'http://lumina-news-agent.vercel.app/', 'https://lumina-news-agent.vercel.app.evil.example/',
    'https://lumina-news-agent.vercel.app:444/', 'https://preview.vercel.app/', 'http://127.0.0.1:3100/',
  ]) assert.equal(sanitizePageview({ type: 'pageview', url }), null, url);
  for (const path of ['/', '/pricing', '/privacy']) {
    assert.equal(sanitizePageview({ type: 'event', url: origin + path }), null);
    assert.deepEqual(sanitizePageview({ type: 'pageview', url: origin + path + '?q=fixture#fixture', email: 'fixture@example.org' }), {
      type: 'pageview', url: origin + path,
    });
  }
});
