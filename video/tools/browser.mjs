/**
 * Browser launcher.
 *
 * The container ships Chromium at a fixed path (PLAYWRIGHT_BROWSERS_PATH), so
 * we point at it explicitly rather than letting Playwright try to download a
 * build that matches its own version.
 *
 * SwiftShader gives us a software GL context. It is slower than a GPU but it is
 * deterministic, which matters more here: the same seek must produce the same
 * pixels on every pass and on every machine.
 */
import { chromium } from 'playwright';
import { existsSync } from 'node:fs';

const CANDIDATES = [
  process.env.CHROMIUM_PATH,
  '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  '/opt/pw-browsers/chromium/chrome-linux/chrome',
  '/usr/bin/chromium',
  '/usr/bin/google-chrome',
].filter(Boolean);

export function chromiumPath() {
  const found = CANDIDATES.find((p) => existsSync(p));
  if (!found) throw new Error('No Chromium found. Set CHROMIUM_PATH.');
  return found;
}

export const FLAGS = [
  '--use-gl=angle',
  '--use-angle=swiftshader',
  '--enable-unsafe-swiftshader',
  '--force-color-profile=srgb',
  '--disable-lcd-text',
  '--hide-scrollbars',
  '--disable-dev-shm-usage',
  '--no-sandbox',
  '--font-render-hinting=none',
];

export async function launch() {
  return chromium.launch({ executablePath: chromiumPath(), args: FLAGS });
}

/** Open the film, wait for fonts and images, and return a page ready to seek. */
export async function openFilm(browser, port, { width = 1920, height = 1080 } = {}) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
  await page.goto(`http://localhost:${port}/index.html?render=1`, { waitUntil: 'load' });
  await page.waitForFunction('window.__ready === true', null, { timeout: 60000 });
  return { page, errors };
}
