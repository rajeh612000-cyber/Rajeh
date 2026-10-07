/**
 * Frame grabber.
 *
 * Seeks the film to an exact time, captures the composited page (3D canvas plus
 * the DOM type layer), and pipes the PNG straight into ffmpeg's stdin. Nothing
 * touches disk between the browser and the encoder, which matters in a
 * container with a fixed disk allowance — 2,340 frames of 1080p PNG would be
 * several gigabytes of scratch we never need.
 *
 *   node tools/render.mjs                         full 1080p master
 *   node tools/render.mjs --out out/cut.mp4 --from 0 --to 20
 *   node tools/render.mjs --w 1080 --h 1920       vertical
 */
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { launch, openFilm } from './browser.mjs';
import { serve } from './serve.mjs';

const arg = (name, fallback) => {
  const i = process.argv.indexOf('--' + name);
  return i === -1 ? fallback : process.argv[i + 1];
};

const OUT = arg('out', 'out/price-optimizer-75s-1080p.mp4');
const W = Number(arg('w', 1920));
const H = Number(arg('h', 1080));
const FPS = Number(arg('fps', 30));
const CRF = arg('crf', '16');
const FROM = arg('from', null);
const TO = arg('to', null);

const { server, port } = await serve(0);
const browser = await launch();
const { page, errors } = await openFilm(browser, port, { width: W, height: H });

const film = await page.evaluate(() => ({ duration: window.__film.duration, fps: window.__film.fps }));
const from = FROM === null ? 0 : Number(FROM);
const to = TO === null ? film.duration : Number(TO);
const first = Math.round(from * FPS);
const last = Math.round(to * FPS);
const total = last - first;

await mkdir(dirname(OUT), { recursive: true });

const ff = spawn('ffmpeg', [
  '-y',
  '-f', 'image2pipe', '-c:v', 'png', '-r', String(FPS), '-i', 'pipe:0',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', CRF,
  '-pix_fmt', 'yuv420p',
  '-profile:v', 'high', '-level', '4.2',
  '-movflags', '+faststart',
  '-r', String(FPS),
  OUT,
], { stdio: ['pipe', 'ignore', 'pipe'] });

let ffErr = '';
ff.stderr.on('data', (d) => { ffErr += d.toString(); if (ffErr.length > 8000) ffErr = ffErr.slice(-4000); });
const ffDone = new Promise((res, rej) => {
  ff.on('close', (code) => code === 0 ? res() : rej(new Error('ffmpeg exited ' + code + '\n' + ffErr)));
});

/** Respect backpressure: the encoder is slower than the grabber on a cold start. */
const write = (buf) => new Promise((res) => ff.stdin.write(buf) ? res() : ff.stdin.once('drain', res));

const t0 = Date.now();
for (let f = first; f < last; f++) {
  await page.evaluate((n) => window.__film.seekFrame(n), f);
  await write(await page.screenshot({ type: 'png' }));

  if ((f - first) % 60 === 0 || f === last - 1) {
    const done = f - first + 1;
    const rate = done / ((Date.now() - t0) / 1000);
    const eta = Math.round((total - done) / Math.max(rate, 0.01));
    process.stdout.write(`\r  ${done}/${total} frames  ${rate.toFixed(1)} fps  eta ${eta}s   `);
  }
}
ff.stdin.end();
process.stdout.write('\n');

await ffDone;
await browser.close();
server.close();

if (errors.length) {
  console.log('--- console errors during render ---');
  for (const e of [...new Set(errors)]) console.log(e);
}
console.log(`wrote ${OUT}  (${total} frames, ${(total / FPS).toFixed(1)}s, ${W}x${H}@${FPS})`);
