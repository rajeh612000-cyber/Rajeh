// Render deck slides (deck/html/*.html) to high-res PNG (deck/png/*.png).
import { chromium } from 'playwright-core';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { readFileSync, mkdirSync, readdirSync, rmSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const HTML = resolve(__dirname, 'html');
const PNG = resolve(__dirname, 'png');
const CHROME = process.env.PW_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const SCALE = +(process.env.SCALE || 2);

const only = process.argv.slice(2);
if (!only.length) rmSync(PNG, { recursive: true, force: true });
mkdirSync(PNG, { recursive: true });
let files = readdirSync(HTML).filter(f => f.endsWith('.html')).sort();
if (only.length) files = files.filter(f => only.some(o => f.includes(o)));

const browser = await chromium.launch({ executablePath: CHROME, args: ['--force-color-profile=srgb'] });
for (const f of files) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: SCALE });
  await page.goto(pathToFileURL(join(HTML, f)).href, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const name = f.replace(/\.html$/, '');
  await page.screenshot({ path: join(PNG, `${name}.png`), clip: { x: 0, y: 0, width: 1280, height: 720 } });
  console.log(`✓ ${name}  1280×720 @${SCALE}x`);
  await page.close();
}
await browser.close();
console.log('rendered', files.length, 'slides ->', PNG);
