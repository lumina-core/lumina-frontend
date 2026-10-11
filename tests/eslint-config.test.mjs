import assert from 'node:assert/strict';
import path from 'node:path';
import { test } from 'node:test';
import { ESLint } from 'eslint';

const eslint = new ESLint({ cwd: path.resolve(import.meta.dirname, '..') });
const invalidSyntax = 'const = ;';
const invalidAlias = 'export function example() { const self = this; return self; }';

test('generated browser downloads and isolated runtime caches are outside lint', async () => {
  for (const filePath of [
    '.cache/playwright-browsers/chromium-1208/chrome-linux64/resources/inspector_overlay/main.js',
    '.cache/playwright/download.js',
    '.cache/isolated-fixture/home/generated.js',
  ]) {
    assert.deepEqual(await eslint.lintText(invalidSyntax, { filePath, warnIgnored: false }), [], filePath);
  }
});

test('source, scripts and tests still reject JavaScript syntax and lint errors', async () => {
  for (const filePath of [
    'app/lint-control.js',
    'app/lint-control.tsx',
    'lib/lint-control.ts',
    'scripts/lint-control.mjs',
    'tests/lint-control.mjs',
    'tests/contracts/lint-control.js',
    'app/.cache/lint-control.js',
  ]) {
    const [syntax] = await eslint.lintText(invalidSyntax, { filePath });
    assert.equal(syntax.fatalErrorCount, 1, filePath);
    const [rules] = await eslint.lintText(invalidAlias, { filePath });
    assert(rules.messages.some(message => message.ruleId === '@typescript-eslint/no-this-alias' && message.severity === 2), filePath);
  }
});
