const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const FPS = 30;
const FRAMES_DIR = path.resolve(__dirname, 'frames');

(async () => {
  for (const f of fs.readdirSync(FRAMES_DIR)) {
    if (f.endsWith('.png')) fs.unlinkSync(path.join(FRAMES_DIR, f));
  }

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', e => errors.push('PAGE ERROR: ' + e.message));

  await page.goto('file://' + path.resolve(__dirname, 'intro.html'), { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);

  const DUR = await page.evaluate(() => window.__DUR);
  const total = Math.round(DUR * FPS);
  console.log(`Rendering ${total} frames (${DUR}s @ ${FPS}fps)…`);

  for (let f = 0; f < total; f++) {
    const t = f / FPS;
    await page.evaluate(tt => window.__seek(tt), t);
    await page.screenshot({ path: path.join(FRAMES_DIR, 'f_' + String(f).padStart(4, '0') + '.png') });
    if (f % 60 === 0) console.log(`  frame ${f}/${total}`);
  }

  console.log('ERRORS(' + errors.length + '):'); errors.forEach(e => console.log(e));
  console.log('Done. Frames in', FRAMES_DIR);
  await browser.close();
})();
