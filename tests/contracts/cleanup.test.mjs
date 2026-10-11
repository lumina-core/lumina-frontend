// Real child_process states, not mocks; the watchdog always cleans failed probes.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'node:http';
import { cleanupIntegration } from './cleanup.mjs';

const exited = child => child.exitCode !== null || child.signalCode !== null || !child.pid;
async function bounded(promise, ms = 1000) {
  let timer;
  try {
    return await Promise.race([promise, new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error('cleanup watchdog expired')), ms);
    })]);
  } finally { clearTimeout(timer); }
}

for (const mode of ['normal', 'early-SIGKILL', 'startup-failure', 'test-failure']) {
  test(`node:test hooks close real loopback servers after ${mode}`, async () => {
    const env = { ...process.env, CLEANUP_FIXTURE_MODE: mode };
    // Do not inherit node:test's worker protocol into an independent runner.
    delete env.NODE_TEST_CONTEXT;
    const runner = spawn(process.execPath, ['--test', 'tests/contracts/fixtures/lifecycle.mjs'], {
      env,
      detached: true, stdio: ['ignore', 'pipe', 'pipe'],
    });
    let output = '';
    runner.stdout.on('data', data => { output += data; });
    runner.stderr.on('data', data => { output += data; });
    try {
      const [code] = await bounded(once(runner, 'exit'), 3000);
      assert.equal(code, mode.endsWith('failure') ? 1 : 0, output);
      assert.match(output, /CLEANUP_VERIFIED/);
      const ports = [...output.matchAll(/(?:PROVIDER|CHILD)_PORT=(\d+)/g)].map(m => m[1]);
      assert.equal(ports.length, 2, output);
      for (const port of ports) await assert.rejects(fetch(`http://127.0.0.1:${port}`, { signal: AbortSignal.timeout(300) }));
      const pid = Number(output.match(/CHILD_PID=(\d+)/)?.[1]);
      assert.throws(() => process.kill(pid, 0), { code: 'ESRCH' });
    } finally {
      // If the regression fails, terminate the whole fixture group, not just
      // the test runner (its grandchild also owns a listening socket).
      try { process.kill(-runner.pid, 'SIGKILL'); } catch (error) {
        if (error.code !== 'ESRCH') throw error;
      }
      if (!exited(runner)) await bounded(once(runner, 'exit'));
    }
  });
}

for (const mode of ['normal', 'already-SIGKILL', 'already-exited', 'spawn-error', 'ignores-SIGTERM', 'test-failure']) {
  test(`teardown closes child and loopback provider: ${mode}`, async () => {
    const provider = createServer((req, res) => res.end('synthetic'));
    provider.listen(0, '127.0.0.1');
    await once(provider, 'listening');
    const url = `http://127.0.0.1:${provider.address().port}`;
    const command = mode === 'spawn-error' ? '/nonexistent/lumina-synthetic-node' : process.execPath;
    const code = (mode === 'ignores-SIGTERM' ? "process.on('SIGTERM', () => {});" : '') +
      "process.stdout.write('ready');" + (mode === 'already-exited' ? '' : 'setInterval(() => {}, 1000);');
    const child = spawn(command, ['-e', code], { stdio: ['ignore', 'pipe', 'ignore'] });
    try {
      if (mode === 'spawn-error') await once(child, 'error');
      else {
        const exit = once(child, 'exit');
        await once(child.stdout, 'data');
        if (mode === 'already-SIGKILL') { child.kill('SIGKILL'); await exit; }
        if (mode === 'already-exited') await exit;
      }
      assert.equal(await (await fetch(url)).text(), 'synthetic');
      const cleanup = () => cleanupIntegration(child, provider, { graceMs: 50, killMs: 300 });
      if (mode === 'test-failure') {
        await assert.rejects(bounded((async () => {
          try { assert.fail('synthetic test failed'); }
          finally { await cleanup(); }
        })()), /synthetic test failed/);
      } else await bounded(cleanup());
      assert(exited(child));
      if (mode === 'ignores-SIGTERM') assert.equal(child.signalCode, 'SIGKILL');
      assert.equal(provider.listening, false);
      await assert.rejects(fetch(url, { signal: AbortSignal.timeout(300) }));
      await bounded(cleanup()); // repeat teardown remains safe
    } finally {
      if (!exited(child)) {
        const exit = once(child, 'exit');
        child.kill('SIGKILL');
        await bounded(exit);
      }
      provider.closeAllConnections();
      if (provider.listening) await new Promise(resolve => provider.close(resolve));
    }
  });
}
