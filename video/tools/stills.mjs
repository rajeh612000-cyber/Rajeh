/**
 * Grab reference stills at chosen times. This is the dailies pass — look at
 * frames before spending minutes on a full render.
 *
 *   node tools/stills.mjs 2 10 16 24 30 36 42 48 53 56 61 66 71 75
 */
import { launch, openFilm } from './browser.mjs';
import { serve } from './serve.mjs';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const OUT = fileURLToPath(new URL('../out/stills/', import.meta.url));
const times = process.argv.slice(2).map(Number).filter((n) => !Number.isNaN(n));
if (!times.length) times.push(2, 10, 16, 24, 30, 36, 42, 48, 53, 56, 61, 66, 71, 75);

const { server, port } = await serve(0);
const browser = await launch();
const { page, errors } = await openFilm(browser, port);

await mkdir(OUT, { recursive: true });
for (const t of times) {
  await page.evaluate((tt) => window.__film.seek(tt), t);
  const buf = await page.screenshot({ type: 'png' });
  const name = `t${String(t).padStart(5, '0').replace('.', '_')}.png`;
  await writeFile(OUT + name, buf);
  process.stdout.write(`${name} `);
}
console.log('');

if (errors.length) {
  console.log('\n--- CONSOLE ERRORS ---');
  for (const e of [...new Set(errors)]) console.log(e);
  process.exitCode = 1;
} else {
  console.log('no console errors');
}

await browser.close();
server.close();
