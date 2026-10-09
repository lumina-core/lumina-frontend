import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
function load(file) {
  const exports = {};
  const js = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  new Function('exports', 'require', js)(exports, name => load(path.resolve(path.dirname(file), name + '.ts')));
  return exports;
}
const { analyticsAllowed, sanitizePageview } = load(path.resolve('lib/analytics-policy.ts'));
const origin = 'https://lumina-news-agent.vercel.app';
test('production-only and browser privacy controls', () => {
  assert.equal(analyticsAllowed({ origin }, {}), true);
  for (const preferences of [{ doNotTrack: '1' }, { globalPrivacyControl: true }]) assert.equal(analyticsAllowed({ origin }, preferences), false);
  for (const other of ['http://lumina-news-agent.vercel.app', 'https://preview.vercel.app', 'http://localhost:3000']) assert.equal(analyticsAllowed({ origin: other }, {}), false);
});
test('redacts query and fragment; refuses private paths and custom events', () => {
  assert.deepEqual(sanitizePageview({ type: 'pageview', url: origin + '/chat?email=private@example.org#secret' }), { type: 'pageview', url: origin + '/chat' });
  for (const p of ['/chat/secret', '/share/token', '/settings', '/login', '/api/chat/stream']) assert.equal(sanitizePageview({ type: 'pageview', url: origin + p }), null);
  assert.equal(sanitizePageview({ type: 'event', url: origin + '/chat' }), null);
  assert.equal(sanitizePageview({ type: 'pageview', url: 'not a url' }), null);
  assert.equal(sanitizePageview({ type: 'pageview', url: 'https://evil.example/chat' }), null);
});
