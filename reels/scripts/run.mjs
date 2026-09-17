// Bundles a TS script with esbuild (already a Remotion dependency) and runs it,
// so the repo needs no extra TS runtime just to generate its docs.
import {build} from 'esbuild';
import {mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';

const entry = process.argv[2];
if (!entry) {
  console.error('usage: node scripts/run.mjs <entry.ts>');
  process.exit(1);
}

const out = join(mkdtempSync(join(tmpdir(), 'reel-scripts-')), 'bundle.mjs');

await build({
  entryPoints: [entry],
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node22',
  outfile: out,
  packages: 'external',
});

await import(pathToFileURL(out).href);
