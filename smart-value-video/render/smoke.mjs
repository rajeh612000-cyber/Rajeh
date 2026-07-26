/* Screenshots one representative frame per scene, in both preview and render
 * mode, so a CSS/markup change can be eyeballed across the whole storyboard
 * without sitting through a full render.
 *
 *   node smoke.mjs            → out/smoke/
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { startServer } from './serve.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright-core');
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const OUT = path.resolve(__dirname, '../out/smoke');
fs.mkdirSync(OUT, { recursive: true });

const { port, close } = await startServer({ port: 0 });
const browser = await chromium.launch({
  args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required',
         '--disable-lcd-text', '--force-color-profile=srgb',
         '--disable-threaded-animation']
});

try {
  for (const mode of ['render', 'preview']) {
    const isRender = mode === 'render';
    const page = await browser.newPage({
      viewport: isRender ? { width: 960, height: 540 } : { width: 1040, height: 900 },
      deviceScaleFactor: isRender ? 2 : 1
    });
    await page.goto(
      `http://127.0.0.1:${port}/storyboard.html${isRender ? '?render=1' : ''}`,
      { waitUntil: 'networkidle' }
    );
    await page.evaluate(() => window.__SVP.ready());
    const scenes = await page.evaluate(() => window.__SVP.scenes);

    for (let i = 0; i < scenes.length; i++) {
      // Late enough in each scene that its entrance animations have played.
      const t = Math.min(scenes[i].start + 9, scenes[i].end - 0.1);
      await page.evaluate(tt => window.__SVP.seek(tt), t);
      const file = path.join(OUT, `${mode}-scene${i + 1}.png`);
      await page.screenshot({ path: file, fullPage: !isRender });
      console.log(`  ${mode} scene ${i + 1} @ ${t}s → ${path.basename(file)}`);
    }
    await page.close();
  }
  console.log(`\nstills → ${OUT}`);
} finally {
  await browser.close();
  close();
}
