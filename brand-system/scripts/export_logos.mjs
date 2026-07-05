// Export the full logo lockups (symbol + wordmark) as transparent, high-res PNGs.
// Reversed (white) for dark backgrounds; primary (navy/purple) for light.
import { chromium } from 'playwright-core';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { writeFileSync, readFileSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const LOGO = join(ROOT, 'assets', 'logo');
const CHROME = process.env.PW_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const symbol = readFileSync(join(LOGO, 'symbol.svg'), 'utf8');

const lockupHTML = (variant) => {
  const white = variant === 'reversed';
  const name = white ? '#FFFFFF' : '#1A1A4E';
  const value = white ? '#FFFFFF' : '#7751FF';
  const desc = white ? '#FFFFFF' : '#3A3A6B';
  return `<!doctype html><meta charset="utf-8">
<style>
  @font-face{font-family:'Sora';font-weight:500;src:url('${pathToFileURL(join(ROOT, 'assets/fonts/Sora-500.ttf')).href}')}
  @font-face{font-family:'Sora';font-weight:800;src:url('${pathToFileURL(join(ROOT, 'assets/fonts/Sora-800.ttf')).href}')}
  *{margin:0;box-sizing:border-box}
  html,body{background:transparent}
  #lockup{display:inline-flex;align-items:center;gap:30px;padding:24px;font-family:'Sora'}
  #lockup svg{width:150px;height:auto}
  .word{display:flex;flex-direction:column;line-height:1}
  .name{font-weight:800;font-size:60px;line-height:.92;letter-spacing:.004em}
  .name .s{color:${name}} .name .v{color:${value}}
  .name sup{font-size:.42em;font-weight:700;vertical-align:super;color:${value}}
  .desc{font-weight:500;font-size:18.5px;letter-spacing:.42em;color:${desc};opacity:${white ? .95 : .85};margin-top:.62em;padding-left:.14em}
</style>
<div id="lockup">
  ${symbol}
  <div class="word">
    <div class="name"><span class="s">SMART</span><br><span class="v">VALUE</span><sup>™</sup></div>
    <div class="desc">AI SOLUTIONS</div>
  </div>
</div>`;
};

const browser = await chromium.launch({ executablePath: CHROME });
for (const variant of ['reversed', 'primary']) {
  const html = lockupHTML(variant);
  const file = join(LOGO, `_tmp-${variant}.html`);
  writeFileSync(file, html);
  const page = await browser.newPage({ deviceScaleFactor: 4 });
  await page.goto(pathToFileURL(file).href, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const el = await page.$('#lockup');
  const out = join(LOGO, `logo-${variant}.png`);
  await el.screenshot({ path: out, omitBackground: true });
  const box = await el.boundingBox();
  console.log(`✓ logo-${variant}.png  ${Math.round(box.width * 4)}×${Math.round(box.height * 4)} (transparent)`);
  await page.close();
}
await browser.close();
// tidy temp files
import { unlinkSync } from 'node:fs';
for (const v of ['reversed', 'primary']) { try { unlinkSync(join(LOGO, `_tmp-${v}.html`)); } catch {} }
console.log('done.');
