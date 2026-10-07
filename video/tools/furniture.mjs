/**
 * Render the cutdown frame furniture to PNG.
 *
 * The social cuts are not a crop of the 16:9 master. Cropping a scenario table
 * to 9:16 makes the numbers unreadable on a phone, and the numbers are the
 * film. So the picture keeps its own aspect inside a branded frame, and the
 * frame carries the headline and the CTA — which is also where a feed viewer
 * with the sound off actually reads them.
 */
import { launch } from './browser.mjs';
import { serve } from './serve.mjs';
import { mkdir, writeFile } from 'node:fs/promises';

const { server, port } = await serve(0);
const browser = await launch();
await mkdir('out/furniture', { recursive: true });

for (const [name, w, h, cls] of [['9x16', 1080, 1920, ''], ['1x1', 1080, 1080, 'square']]) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  await page.goto(`http://localhost:${port}/frame.html`, { waitUntil: 'load' });
  if (cls) await page.evaluate((c) => document.body.classList.add(c), cls);
  await page.waitForFunction('document.fonts.status === "loaded"');
  await page.waitForFunction('[...document.images].every(i => i.complete)');
  await writeFile(`out/furniture/${name}.png`, await page.screenshot({ type: 'png' }));
  console.log(`out/furniture/${name}.png  ${w}x${h}`);
  await page.close();
}

await browser.close();
server.close();
