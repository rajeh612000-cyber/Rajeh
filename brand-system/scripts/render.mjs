// Render brand templates to pixel-perfect PNGs with headless Chromium.
// Usage: node scripts/render.mjs [--scale N] [name ...]
import { chromium } from 'playwright-core';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { readFileSync, mkdirSync, readdirSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const TPL = join(ROOT, 'templates');
const OUT = join(ROOT, 'out');
const CHROME = process.env.PW_CHROME ||
  '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

// Each template declares its export size in a <meta name="export" content="WxH">.
function sizeOf(html) {
  const m = html.match(/name=["']export["']\s+content=["'](\d+)x(\d+)["']/i);
  if (!m) throw new Error('missing <meta name="export" content="WxH">');
  return { w: +m[1], h: +m[2] };
}

const args = process.argv.slice(2);
let scale = 2;
const si = args.indexOf('--scale');
if (si !== -1) { scale = +args[si + 1]; args.splice(si, 2); }

let files = readdirSync(TPL).filter(f => f.endsWith('.html'));
if (args.length) files = files.filter(f => args.some(a => f.includes(a)));

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: CHROME, args: ['--force-color-profile=srgb'] });

for (const file of files) {
  const html = readFileSync(join(TPL, file), 'utf8');
  const { w, h } = sizeOf(html);
  const page = await browser.newPage({
    viewport: { width: w, height: h },
    deviceScaleFactor: scale,
  });
  await page.goto(pathToFileURL(join(TPL, file)).href, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const name = file.replace(/\.html$/, '');
  const out = join(OUT, `${name}.png`);
  await page.screenshot({ path: out, clip: { x: 0, y: 0, width: w, height: h } });
  console.log(`✓ ${name.padEnd(22)} ${w}×${h}  @${scale}x  ->  out/${name}.png`);
  await page.close();
}
await browser.close();
console.log('done.');
