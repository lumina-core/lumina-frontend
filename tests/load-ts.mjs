import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import ts from 'typescript';

// Small CommonJS loader for the repo's node:test suite. Packages use Node's real
// resolver; only local TS/TSX modules and the app's @/ alias are transpiled.
export function loadTs(filename, cache = new Map()) {
  const file = path.resolve(filename);
  if (cache.has(file)) return cache.get(file).exports;
  const loadedModule = { exports: {} };
  cache.set(file, loadedModule);
  const require = createRequire(file);
  const js = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    fileName: file,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  }).outputText;
  new Function('module', 'exports', 'require', js)(loadedModule, loadedModule.exports, name => {
    if (!name.startsWith('.') && !name.startsWith('@/')) return require(name);
    const base = name.startsWith('@/')
      ? path.resolve(name.slice(2))
      : path.resolve(path.dirname(file), name);
    const resolved = [base, `${base}.ts`, `${base}.tsx`, `${base}/index.ts`]
      .find(candidate => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
    if (!resolved) throw new Error(`Cannot resolve ${name} from ${file}`);
    return loadTs(resolved, cache);
  });
  return loadedModule.exports;
}
