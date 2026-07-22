const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', e => errors.push('PAGE ERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });

  await page.goto('file://' + path.resolve(__dirname, 'intro.html'), { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);

  const times = [3.4, 6.4, 7.1, 7.6, 8.6, 9.6, 13.0];
  for (const t of times) {
    await page.evaluate(tt => window.__seek(tt), t);
    await page.waitForTimeout(120);
    const name = 'prev_' + String(t).replace('.', '_') + 's.png';
    await page.screenshot({ path: path.join(__dirname, name) });
  }
  console.log('ERRORS(' + errors.length + '):'); errors.forEach(e => console.log(e));
  await browser.close();
})();
