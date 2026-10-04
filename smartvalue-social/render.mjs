// Renders static-post/post.html to a JPG with headless Chromium.
//   node render.mjs   (set NODE_USE_ENV_PROXY=1 behind a proxy)
import { chromium } from 'playwright';
const here = new URL('./static-post/', import.meta.url);
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 2 });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
// Fetch fonts and Three.js through Node (which trusts the sandbox proxy's certificate).
await page.route(/cdn\.jsdelivr\.net|fonts\.(googleapis|gstatic)\.com/, async (r) => {
  const res = await fetch(r.request().url(), { headers: { 'user-agent': 'Mozilla/5.0 Chrome/128.0' } });
  r.fulfill({ status: res.status, headers: { 'content-type': res.headers.get('content-type') || '', 'access-control-allow-origin': '*' }, body: Buffer.from(await res.arrayBuffer()) });
});
await page.goto(new URL('post.html', here).href);
await page.waitForFunction(() => window.__ready === true, null, { timeout: 60000 });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(300);
const out = process.argv[2] || 'smartvalue-static-post.jpg';
await page.screenshot({ path: new URL(out, here).pathname, type: 'jpeg', quality: 92, clip: { x: 0, y: 0, width: 1080, height: 1350 } });
const fit = await page.evaluate(() => {             // layout guards: nothing past the side margins, room above the footer
  const right = 1080 - 64 + 1, tooWide = [];
  document.querySelectorAll('.post *').forEach((e) => {
    const r = e.getBoundingClientRect();
    if (r.width && r.right > right && !e.closest('.split')) tooWide.push(`${e.tagName.toLowerCase()}.${e.className || ''}`);
  });
  const h1 = document.querySelector('h1'), range = document.createRange(); range.selectNodeContents(h1);
  const lineRight = Math.max(...[...range.getClientRects()].map((r) => r.right));
  const last = document.querySelector('.aud') || document.querySelector('.who'), foot = document.querySelector('.foot');
  return { tooWide, h1Right: Math.round(lineRight), gapAboveFooter: last && foot ? Math.round(foot.getBoundingClientRect().top - last.getBoundingClientRect().bottom) : null };
});
console.log('rendered', out, '| overflow:', JSON.stringify(fit), '| errors:', errors);
await browser.close();
