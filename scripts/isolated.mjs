// Credential-free local delivery. Dependencies must already be installed with
// the lockfile; running project commands never inherits the developer's HOME.
import { mkdtempSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '..');
if (readdirSync(root).some(name => name.startsWith('.env') && name !== '.env.example')) {
  throw new Error('Use a clean checkout without .env files for isolated verification');
}
const mode = process.argv[2];
if (!['verify', 'demo'].includes(mode)) throw new Error('Usage: node scripts/isolated.mjs verify|demo');
const cache = path.join(root, '.cache');
mkdirSync(cache, { recursive: true });
const temp = mkdtempSync(path.join(cache, 'isolated-'));
const home = path.join(temp, 'home');
mkdirSync(home);
const env = {
  PATH: process.env.PATH, HOME: home, TMPDIR: temp,
  CI: process.env.CI || '', NEXT_TELEMETRY_DISABLED: '1',
  NODE_OPTIONS: `--require=${path.join(root, 'tests/contracts/loopback-only.cjs')}`,
  BACKEND_URL: '', LUMINA_CONTROL_URL: 'http://127.0.0.1:9',
  DATA_HUB_URL: 'http://127.0.0.1:9', DATA_HUB_API_KEY: '',
  OPENROUTER_BASE_URL: 'http://127.0.0.1:9', OPENROUTER_API_KEY: '', OPENAI_API_KEY: '',
  LUMINA_INTERNAL_KEY: '',
  PLAYWRIGHT_CHANNEL: process.env.PLAYWRIGHT_CHANNEL || '',
  PLAYWRIGHT_BROWSERS_PATH: process.env.PLAYWRIGHT_BROWSERS_PATH || path.join(cache, 'playwright-browsers'),
};
const next = 'node_modules/next/dist/bin/next';
const commands = mode === 'demo' ? [[next, 'build'], [next, 'start', '--hostname', '127.0.0.1', '--port', '3100']] : [
  ['--test', ...readdirSync(path.join(root, 'tests')).filter(f => f.endsWith('.test.mjs')).map(f => `tests/${f}`)],
  ['--test', ...readdirSync(path.join(root, 'tests/contracts')).filter(f => f.endsWith('.test.mjs')).map(f => `tests/contracts/${f}`)],
  ['node_modules/eslint/bin/eslint.js', '.'],
  [next, 'build'],
  ['node_modules/typescript/bin/tsc', '--noEmit'],
  ['node_modules/@playwright/test/cli.js', 'test'],
];
try {
  for (const command of commands) {
    console.log(`\n[isolated] node ${command.join(' ')}`);
    const result = spawnSync(process.execPath, command, { cwd: root, env, stdio: 'inherit' });
    if (result.error) throw result.error;
    if (result.status !== 0) { process.exitCode = result.status || 1; break; }
  }
} finally {
  rmSync(temp, { recursive: true, force: true });
}
