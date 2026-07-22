const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUT_DIR = path.resolve(__dirname, 'video-out');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const VIEWPORT = { width: 1680, height: 1050 };

// ---------- fake cursor injected purely for visual clarity in the recording ----------
const CURSOR_CSS = `
#__fakeCursor{
  position:fixed; width:22px; height:22px; border-radius:50%;
  background:rgba(205,57,59,.30); border:2px solid #A82E32;
  box-shadow:0 2px 10px rgba(8,48,107,.45), 0 0 0 4px rgba(205,57,59,.12);
  pointer-events:none; z-index:2147483647; left:-40px; top:-40px;
  transform:translate(-50%,-50%) scale(1);
  transition:left .5s cubic-bezier(.4,0,.2,1), top .5s cubic-bezier(.4,0,.2,1), transform .16s ease;
}
`;

async function injectCursor(page) {
  await page.evaluate((css) => {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
    const c = document.createElement('div');
    c.id = '__fakeCursor';
    document.body.appendChild(c);
  }, CURSOR_CSS);
}

async function moveCursor(page, x, y) {
  await page.evaluate(({ x, y }) => {
    const c = document.getElementById('__fakeCursor');
    if (c) { c.style.left = x + 'px'; c.style.top = y + 'px'; }
  }, { x, y });
  await page.waitForTimeout(520);
}

async function pulseCursor(page) {
  await page.evaluate(() => {
    const c = document.getElementById('__fakeCursor');
    if (!c) return;
    c.style.transform = 'translate(-50%,-50%) scale(1.8)';
    setTimeout(() => { c.style.transform = 'translate(-50%,-50%) scale(1)'; }, 170);
  });
  await page.waitForTimeout(340);
}

async function centerOf(locator) {
  const box = await locator.boundingBox();
  if (!box) return null;
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

async function smoothScrollTo(page, targetY, steps = 9, stepDelay = 45) {
  const startY = await page.evaluate(() => window.scrollY);
  const dist = targetY - startY;
  if (Math.abs(dist) < 4) { await page.waitForTimeout(150); return; }
  for (let i = 1; i <= steps; i++) {
    const y = startY + dist * (i / steps);
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(stepDelay);
  }
  await page.waitForTimeout(350);
}

async function scrollElementIntoView(page, selector, offset = 90) {
  const targetY = await page.$eval(selector, (el, off) => {
    return el.getBoundingClientRect().top + window.scrollY - off;
  }, offset).catch(() => null);
  if (targetY !== null) await smoothScrollTo(page, Math.max(0, targetY));
}

async function clickWithCursor(page, locator, opts = {}) {
  await locator.scrollIntoViewIfNeeded();
  const c = await centerOf(locator);
  if (c) { await moveCursor(page, c.x, c.y); await pulseCursor(page); }
  await locator.click(opts);
  await page.waitForTimeout(500);
}

async function selectWithCursor(page, locator, valueOrOpts) {
  await locator.scrollIntoViewIfNeeded();
  const c = await centerOf(locator);
  if (c) await moveCursor(page, c.x, c.y);
  await locator.selectOption(valueOrOpts);
  await page.waitForTimeout(650);
}

async function typeWithCursor(page, locator, text) {
  await locator.scrollIntoViewIfNeeded();
  const c = await centerOf(locator);
  if (c) { await moveCursor(page, c.x, c.y); await pulseCursor(page); }
  await locator.click();
  await locator.type(text, { delay: 55 });
  await page.waitForTimeout(500);
}

async function dragSlider(page, id, fromV, toV, min, max, steps = 8) {
  const handle = page.locator('#' + id);
  await handle.scrollIntoViewIfNeeded();
  for (let i = 1; i <= steps; i++) {
    const v = Math.round(fromV + (toV - fromV) * (i / steps));
    const box = await handle.boundingBox();
    const frac = (v - min) / (max - min);
    const x = box.x + frac * box.width;
    const y = box.y + box.height / 2;
    await moveCursor(page, x, y);
    await page.evaluate(({ id, v }) => {
      const el = document.getElementById(id);
      el.value = v;
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }, { id, v });
    await page.waitForTimeout(160);
  }
  await page.waitForTimeout(700); // let chart animation settle
}

async function hoverWithCursor(page, locator, holdMs = 1400) {
  await locator.scrollIntoViewIfNeeded();
  const c = await centerOf(locator);
  if (c) await moveCursor(page, c.x, c.y);
  await locator.hover();
  await page.waitForTimeout(holdMs);
}

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: VIEWPORT,
    recordVideo: { dir: OUT_DIR, size: VIEWPORT }
  });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);

  page.on('pageerror', (e) => console.log('PAGE ERROR:', e.message));
  page.on('console', (m) => { if (m.type() === 'error') console.log('CONSOLE ERROR:', m.text()); });

  const filePath = 'file://' + path.resolve(__dirname, 'render.html');
  await page.goto(filePath, { waitUntil: 'networkidle' });
  await injectCursor(page);
  await page.waitForTimeout(1200);

  console.log('--- Section 1: Price Optimization ---');
  await page.waitForTimeout(900);

  await dragSlider(page, 'guardVol', 10, 17, 0, 20);
  await dragSlider(page, 'guardCM', 34, 27, 20, 50);
  await clickWithCursor(page, page.locator('#runOpt'));
  await page.waitForTimeout(700);

  await hoverWithCursor(page, page.locator('.model-confidence'), 1500);
  await moveCursor(page, VIEWPORT.width / 2, 140);

  await selectWithCursor(page, page.locator('#focusBrand'), 'abadia');
  await scrollElementIntoView(page, '#anchorTableBody');
  await clickWithCursor(page, page.locator('#anchorTableBody button').nth(1));

  await scrollElementIntoView(page, '#corridorChart');
  await page.waitForTimeout(900);

  await scrollElementIntoView(page, '#ppaTable');
  await page.waitForTimeout(700);

  await scrollElementIntoView(page, '#compMovesBody');
  const compSelects = page.locator('.compMoveSel');
  await selectWithCursor(page, compSelects.nth(0), '5');
  await selectWithCursor(page, compSelects.nth(1), '-5');
  await clickWithCursor(page, page.locator('#runReaction'));
  await page.waitForTimeout(900);

  await scrollElementIntoView(page, '#pathChart');
  await page.waitForTimeout(900);

  console.log('--- Section 2: Price Simulation "What If?" ---');
  await clickWithCursor(page, page.locator('.nav-item[data-panel="whatif"]'));
  await page.waitForTimeout(700);

  await clickWithCursor(page, page.locator('.scenario-tab[data-s="B"]'));

  await selectWithCursor(page, page.locator('#bulkBrand'), 'Super Bock');
  await selectWithCursor(page, page.locator('#bulkFormat'), 'Original');
  await typeWithCursor(page, page.locator('#bulkPct'), '');
  await page.fill('#bulkPct', '-4');
  await clickWithCursor(page, page.locator('#applyBulk'));
  await page.waitForTimeout(700);

  await scrollElementIntoView(page, '#skuTableBody');
  await selectWithCursor(page, page.locator('#filterChanged'), 'changed');
  await page.waitForTimeout(600);
  await selectWithCursor(page, page.locator('#filterChanged'), 'all');

  await scrollElementIntoView(page, '#scenChart');
  await clickWithCursor(page, page.locator('#viewToggle button[data-view="manufacturer"]'));
  await page.waitForTimeout(700);

  await scrollElementIntoView(page, '.kpi-row');
  await page.waitForTimeout(600);

  await scrollElementIntoView(page, '#volumeTransferCard');
  await page.waitForTimeout(1000);

  await scrollElementIntoView(page, '#whatifTableBody');
  await page.waitForTimeout(800);

  console.log('--- Section 3: Price-Pack Architecture ---');
  await clickWithCursor(page, page.locator('.nav-item[data-panel="ppa"]'));
  await page.waitForTimeout(700);

  await selectWithCursor(page, page.locator('#ppaPrimary'), 'brand');
  await selectWithCursor(page, page.locator('#ppaObjective'), { label: 'Maximize brand value share' });
  await clickWithCursor(page, page.locator('#runLadderOpt'));
  await page.waitForTimeout(900);

  await scrollElementIntoView(page, '#ladderImpactRow');
  await page.waitForTimeout(700);

  await scrollElementIntoView(page, '#ladderChart');
  await page.waitForTimeout(900);

  await scrollElementIntoView(page, '#tierChart');
  await selectWithCursor(page, page.locator('#tierCount'), '4');
  await clickWithCursor(page, page.locator('#applyBands'));
  await page.waitForTimeout(900);

  console.log('--- Section 4: Data Hub & Trust ---');
  await clickWithCursor(page, page.locator('.nav-item[data-panel="hub"]'));
  await page.waitForTimeout(700);

  await scrollElementIntoView(page, '.source-row');
  await page.waitForTimeout(700);

  await scrollElementIntoView(page, '#validationChart');
  await selectWithCursor(page, page.locator('#validationContext'), 'moderate');
  await clickWithCursor(page, page.locator('#uploadRecalibrate'));
  await page.waitForTimeout(1400);

  await moveCursor(page, VIEWPORT.width / 2, VIEWPORT.height / 2);
  await page.waitForTimeout(1200);

  await page.close();
  const videoPath = await page.video().path();
  await context.close();
  await browser.close();

  const finalPath = path.join(OUT_DIR, 'walkthrough.webm');
  fs.renameSync(videoPath, finalPath);
  console.log('VIDEO SAVED AT:', finalPath);
})();
