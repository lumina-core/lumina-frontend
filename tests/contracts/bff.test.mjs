// Public CI boundary tests. Only Next's request-cookie context is substituted.
// BFF, persistence, credit transport, retry code and SDK factory are real.
// The local origin supplies explicit responses, NOT real account/ledger logic;
// tests/contracts/integration.mjs is the opt-in real private-backend check.
import assert from 'node:assert/strict';
import { after, before, beforeEach, test } from 'node:test';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { NextRequest } from 'next/server.js';
import { loadTs } from '../load-ts.mjs';

let origin, bff, chat, token, respond;
const calls = [];
const sid = '00000000-0000-4000-8000-000000000001';
const request = (pathname, method = 'GET', body, headers = {}) => new NextRequest(`http://127.0.0.1${pathname}`, {
  method, headers: { 'content-type': 'application/json', ...headers },
  ...(body === undefined ? {} : { body: JSON.stringify(body) }),
});
const proxy = (parts, method = 'GET', body, headers) => bff[method](request(`/api/v1/${parts.join('/')}`, method, body, headers), { params: Promise.resolve({ path: parts }) });
const analyze = () => chat.POST(request('/api/chat/stream', 'POST', { query: 'Synthetic test', session_id: sid }));

before(async () => {
  origin = createServer(async (req, res) => {
    let body = '';
    for await (const data of req) body += data;
    const call = { path: req.url, method: req.method, headers: req.headers, body: body ? JSON.parse(body) : null };
    calls.push(call);
    const answer = respond(call);
    res.writeHead(answer.status ?? 200, { 'content-type': 'application/json' });
    res.end(JSON.stringify(answer.body));
  });
  origin.listen(0, '127.0.0.1');
  await once(origin, 'listening');
  process.env.LUMINA_CONTROL_URL = `http://127.0.0.1:${origin.address().port}`;
  process.env.LUMINA_INTERNAL_KEY = 'synthetic-internal-key';
  process.env.OPENROUTER_API_KEY = '';
  process.env.OPENAI_API_KEY = '';
  process.env.OPENROUTER_BASE_URL = 'http://127.0.0.1:9';
  process.env.DATA_HUB_URL = 'http://127.0.0.1:9';
  process.env.NODE_ENV = 'production';
  const context = { 'next/headers': { cookies: async () => ({ get: () => token ? { value: token } : undefined }) } };
  const cache = new Map();
  bff = loadTs('app/api/v1/[...path]/route.ts', cache, context);
  chat = loadTs('app/api/chat/stream/route.ts', cache, context);
});
after(async () => { origin.closeAllConnections(); await new Promise(resolve => origin.close(resolve)); });
beforeEach(() => { calls.length = 0; token = 'synthetic-user-token'; respond = () => { throw new Error('Unexpected origin request'); }; });

test('network sandbox refuses non-loopback connections before opening a socket', () => {
  const net = process.getBuiltinModule('node:net');
  assert.throws(() => net.connect({ host: 'example.org', port: 443 }), /External socket prohibited/);
});

test('anonymous chat exits before any account or model request', async () => {
  token = undefined;
  assert.equal((await analyze()).status, 401);
  assert.equal(calls.length, 0);
});

test('cross-origin mutations and unknown API scopes never reach the backend', async () => {
  assert.equal((await proxy(['history'], 'POST', { title: 'test' }, { origin: 'https://untrusted.example' })).status, 403);
  assert.equal((await proxy(['usage', 'settle'], 'POST', {})).status, 404);
  assert.equal(calls.length, 0);
});

test('decoded path segments and residual encodings are rejected before any origin request', async () => {
  respond = () => ({ body: {} });
  for (const segment of ['../usage/reserve', '..\\usage\\reserve', '.', '..', '', '%2e%2e%2fusage%2freserve', '%252e%252e%252fusage', 'a?x', 'a#x', 'a\u0000']) {
    assert.equal((await proxy(['history', segment], 'POST', {})).status, 404, JSON.stringify(segment));
  }
  assert.equal((await proxy(['auth', 'logout', 'extra'], 'POST')).status, 404);
  assert.equal((await proxy(['auth', 'keys'])).status, 404);
  assert.equal((await proxy(['history', sid], 'PUT', {})).status, 405);
  assert.equal(calls.length, 0);
});

test('explicit route/method allowlist preserves every supported auth, history, credit and invite operation', async () => {
  respond = () => ({ body: {} });
  const routes = [
    ['auth/me', ['GET', 'PATCH'], '/portal/me'],
    ...['send-code', 'change-password', 'forgot-password', 'reset-password'].map(p => [`auth/${p}`, ['POST'], `/portal/${p}`]),
    ['credits/balance', ['GET'], '/lumina/credits/balance'],
    ['credits/checkin', ['POST'], '/lumina/credits/checkin'],
    ...['', '/me', '/stats'].map(p => [`invites${p}`, ['GET'], `/lumina/invites${p}`]),
    ['history', ['GET', 'POST'], '/lumina/history'],
    ...[sid, '123'].flatMap(id => [
      [`history/${id}`, ['GET', 'PATCH', 'DELETE'], `/lumina/history/${id}`],
      [`history/${id}/messages`, ['GET', 'POST'], `/lumina/history/${id}/messages`],
      [`history/${id}/share`, ['POST', 'DELETE'], `/lumina/history/${id}/share`],
    ]),
    ['history/shared/safe_Token-123', ['GET'], '/lumina/history/shared/safe_Token-123'],
  ];
  for (const [route, methods, upstream] of routes) for (const method of methods) {
    assert.equal((await proxy(route.split('/'), method)).status, 200, `${method} ${route}`);
    assert.equal(calls.at(-1).path, upstream);
    assert.equal(calls.at(-1).method, method);
  }
});

test('login wraps token in secure HttpOnly cookie and logout clears it without origin request', async () => {
  respond = () => ({ body: { access_token: 'fixture-jwt', expires_in: 3600, user: { id: 123 } } });
  const login = await proxy(['auth', 'login'], 'POST', { email: 'fixture@example.org', password: 'synthetic-only' });
  assert.equal(login.status, 200);
  assert.deepEqual(await login.json(), { expires_in: 3600, user: { id: 123 } });
  for (const attr of ['HttpOnly', 'Secure', 'SameSite=lax']) assert(login.headers.get('set-cookie').includes(attr));
  const logout = await proxy(['auth', 'logout'], 'POST');
  assert(logout.headers.get('set-cookie').includes('Max-Age=0'));
  assert.equal(calls.length, 1);
});

test('origin 401 clears stale cookies; credit 402 short-circuits before persistence', async () => {
  respond = () => ({ status: 401, body: { detail: 'Expired synthetic session' } });
  const expired = await proxy(['auth', 'me']);
  assert.equal(expired.status, 401);
  assert(expired.headers.get('set-cookie').includes('Max-Age=0'));
  calls.length = 0;
  respond = () => ({ status: 402, body: { error: { message: 'Insufficient synthetic credits' } } });
  assert.equal((await analyze()).status, 402);
  assert.deepEqual(calls.map(c => c.path), ['/lumina/usage/reserve']);
});

test('unsafe BFF mutations are not repeated after an ambiguous upstream failure', async () => {
  respond = () => calls.length === 1
    ? { status: 503, body: { detail: 'Committed but response unavailable' } }
    : { body: { id: 'duplicate-message' } };
  const response = await proxy(['history', sid, 'messages'], 'POST', { role: 'user', content: 'Once only' });
  assert.equal(calls.length, 1, 'No idempotency key: proxy retries could duplicate persisted messages');
  assert.equal(response.status, 503);
});

test('read-only BFF requests retain bounded transient retries', async () => {
  respond = () => calls.length === 1 ? { status: 503, body: {} } : { body: { id: sid } };
  assert.equal((await proxy(['history', sid])).status, 200);
  assert.equal(calls.length, 2);
});

test('failed cancellation preserves the original hold in saved error usage', async () => {
  const reserved = { request_id: 'ambiguous-cancel', credits_reserved: 1, credits_remaining: 99, daily_remaining: 1999, status: 'pending' };
  respond = call => {
    if (call.path === '/lumina/usage/reserve') return { body: reserved };
    if (call.path === '/lumina/usage/cancel') return { status: 503, body: { detail: 'synthetic unavailable' } };
    if (call.method === 'GET') return { body: { items: [{ role: 'user', content: 'Synthetic test' }], total: 1 } };
    return { body: { id: sid } };
  };
  assert.match(await (await analyze()).text(), /"type":"error"/);
  assert.equal(calls.filter(c => c.path === '/lumina/usage/cancel').length, 2);
  const usage = JSON.parse(calls.find(c => c.body?.role === 'assistant').body.tool_calls).usage;
  assert.equal(usage.credits_deducted, 1);
  assert.equal(usage.credits_remaining, 99);
});

for (const method of ['PUT', 'PATCH', 'DELETE']) test(`${method} never transparently replays writes`, async () => {
  respond = () => ({ status: 502, body: { detail: 'synthetic commit with lost reply' } });
  const response = await proxy(['history', sid], method, { title: 'once' });
  // PUT is not a supported history method; reject it before forwarding at all.
  assert.equal(response.status, method === 'PUT' ? 405 : 502);
  assert.equal(calls.length, method === 'PUT' ? 0 : 1);
});

test('failed model creation confirms cancellation before persisting refunded error usage', async () => {
  const reserved = { request_id: 'server-owned-fixture-request', credits_reserved: 1, credits_remaining: 99, daily_remaining: 1999, status: 'pending' };
  respond = call => {
    if (call.path === '/lumina/usage/reserve') return { body: reserved };
    if (call.path === '/lumina/usage/cancel') return { body: { request_id: reserved.request_id, status: 'cancelled', credits_deducted: 0, credits_remaining: 100 } };
    if (call.method === 'GET') return { body: { items: [{ role: 'user', content: 'Synthetic test' }], total: 1 } };
    return { body: { id: sid } };
  };
  const result = await analyze();
  const data = await result.text();
  assert.match(data, /"type":"error"/);
  assert.doesNotMatch(data, /"type":"done"/);
  const refund = calls.find(c => c.path === '/lumina/usage/cancel');
  assert.equal(refund.headers['x-lumina-internal-key'], 'synthetic-internal-key');
  const saved = calls.find(c => c.body?.role === 'assistant');
  assert.equal(JSON.parse(saved.body.tool_calls).usage.credits_deducted, 0);
  assert.equal(JSON.parse(saved.body.tool_calls).usage.credits_remaining, 100);
  assert(calls.indexOf(refund) < calls.indexOf(saved));
});
