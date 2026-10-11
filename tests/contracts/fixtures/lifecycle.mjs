// Executed only by cleanup.test.mjs to exercise node:test's actual hooks.
import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { cleanupIntegration } from '../cleanup.mjs';

let child, provider;
const mode = process.env.CLEANUP_FIXTURE_MODE;
before(async () => {
  provider = createServer((req, res) => res.end('fixture'));
  provider.listen(0, '127.0.0.1');
  await once(provider, 'listening');
  console.log(`PROVIDER_PORT=${provider.address().port}`);
  child = spawn(process.execPath, ['-e', `
    const server = require('node:http').createServer((req,res) => res.end('fixture'));
    server.listen(0,'127.0.0.1', () => console.log(server.address().port));
  `], { stdio: ['ignore', 'pipe', 'ignore'] });
  console.log(`CHILD_PID=${child.pid}`);
  const exit = once(child, 'exit');
  const [data] = await once(child.stdout, 'data');
  console.log(`CHILD_PORT=${String(data).trim()}`);
  if (mode === 'early-SIGKILL' || mode === 'startup-failure') {
    child.kill('SIGKILL');
    await exit;
  }
  if (mode === 'startup-failure') throw new Error('synthetic startup failure');
});
after(async () => {
  await cleanupIntegration(child, provider, { graceMs: 50, killMs: 300 });
  assert(!provider.listening);
  assert(child.exitCode !== null || child.signalCode !== null);
  console.log('CLEANUP_VERIFIED');
});
test('synthetic lifecycle', () => {
  if (mode === 'test-failure') assert.fail('synthetic test failure');
});
