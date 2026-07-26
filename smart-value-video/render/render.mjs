/* Deterministic storyboard → MP4 renderer.
 *
 * Frames are not captured in real time. For each frame we pin the page to an
 * exact timestamp (CSS animations via the Web Animations API, <video> via
 * explicit seeks) and screenshot. Output is therefore frame-exact and
 * reproducible regardless of how slow the machine is.
 *
 * Usage:
 *   node render.mjs --scene 1
 *   node render.mjs --from 0 --to 12 --fps 30 --out ../out/scene1.mp4
 *   node render.mjs --all --fps 25
 */
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

import { startServer, ROOT } from './serve.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright-core');
const FFMPEG = process.env.FFMPEG_PATH || require('ffmpeg-static');
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/* ------------------------------------------------------------------ args */

function parseArgs(argv) {
  const a = { fps: 30, width: 960, height: 540, scale: 2, crf: 18, preset: 'slow' };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    const next = () => argv[++i];
    switch (k) {
      case '--scene':       a.scene = parseInt(next(), 10); break;
      case '--from':        a.from = parseFloat(next()); break;
      case '--to':          a.to = parseFloat(next()); break;
      case '--fps':         a.fps = parseFloat(next()); break;
      case '--out':         a.out = next(); break;
      case '--width':       a.width = parseInt(next(), 10); break;
      case '--height':      a.height = parseInt(next(), 10); break;
      case '--scale':       a.scale = parseFloat(next()); break;
      case '--crf':         a.crf = parseInt(next(), 10); break;
      case '--preset':      a.preset = next(); break;
      case '--audio':       a.audio = next(); break;
      case '--audio-start': a.audioStart = parseFloat(next()); break;
      case '--all':         a.all = true; break;
      case '--no-audio':    a.noAudio = true; break;
      default:
        if (k.startsWith('--')) throw new Error('unknown flag: ' + k);
    }
  }
  return a;
}

const args = parseArgs(process.argv.slice(2));
const OUT_W = Math.round(args.width * args.scale);
const OUT_H = Math.round(args.height * args.scale);

/* ------------------------------------------------------------------ main */

const { port, close } = await startServer({ port: 0 });
const url = `http://127.0.0.1:${port}/storyboard.html?render=1`;

const browser = await chromium.launch({
  args: [
    '--no-sandbox',
    '--autoplay-policy=no-user-gesture-required',
    '--disable-lcd-text',                 // uniform AA between runs
    '--force-color-profile=srgb',
    '--hide-scrollbars',
    // Keep animations on the main thread so a pinned currentTime is guaranteed
    // to be reflected in the very next composited frame. Do NOT also pass
    // --disable-threaded-compositing: headless screenshot capture depends on
    // the compositor and simply hangs without it.
    '--disable-threaded-animation'
  ]
});

let exitCode = 0;
try {
  const page = await browser.newPage({
    viewport: { width: args.width, height: args.height },
    deviceScaleFactor: args.scale
  });
  page.on('console', m => { if (m.type() === 'error') console.warn('  [page]', m.text()); });

  await page.goto(url, { waitUntil: 'networkidle' });

  const info = await page.evaluate(() => window.__SVP.ready());
  const scenes = await page.evaluate(() => window.__SVP.scenes);
  const total = await page.evaluate(() => window.__SVP.total);

  for (const v of info.videos) {
    if (v.ok) {
      console.log(`  clip ok   scene ${v.scene + 1}: ${v.src} ` +
                  `(${v.width}x${v.height}, ${v.duration.toFixed(2)}s)`);
    } else {
      console.warn(`  clip MISSING scene ${v.scene + 1}: ${v.src} ` +
                   `— rendering the placeholder card instead`);
    }
  }

  // Resolve the render window.
  let from, to, label;
  if (args.all) {
    from = 0; to = total; label = 'full';
  } else if (args.from !== undefined || args.to !== undefined) {
    from = args.from ?? 0; to = args.to ?? total; label = `${from}-${to}s`;
  } else {
    const idx = (args.scene ?? 1) - 1;
    if (!scenes[idx]) throw new Error(`no scene ${idx + 1}; have 1..${scenes.length}`);
    from = scenes[idx].start; to = scenes[idx].end; label = `scene${idx + 1}`;
  }

  const outPath = path.resolve(__dirname, args.out || `../out/${label}.mp4`);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });

  const frames = Math.max(1, Math.round((to - from) * args.fps));
  console.log(`\n  window   ${from}s → ${to}s  (${(to - from).toFixed(2)}s)`);
  console.log(`  output   ${OUT_W}x${OUT_H} @ ${args.fps}fps → ${frames} frames`);
  console.log(`  file     ${outPath}\n`);

  // Video-only pass; audio is muxed afterwards so a bad audio source can never
  // cost us the (expensive) frame capture.
  const silentPath = outPath.replace(/\.mp4$/, '.silent.mp4');
  const ff = spawn(FFMPEG, [
    '-hide_banner', '-loglevel', 'error', '-y',
    '-f', 'image2pipe', '-c:v', 'png', '-framerate', String(args.fps), '-i', '-',
    '-c:v', 'libx264', '-preset', args.preset, '-crf', String(args.crf),
    '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
    '-r', String(args.fps),
    silentPath
  ], { stdio: ['pipe', 'inherit', 'inherit'] });

  const ffDone = once(ff, 'close');
  const t0 = Date.now();

  for (let i = 0; i < frames; i++) {
    const t = from + i / args.fps;
    await page.evaluate(tt => window.__SVP.seek(tt), t);
    // NOT animations:'disabled' — that fast-forwards finite animations to their
    // end state and cancels infinite ones, which would throw away the exact
    // currentTime we just pinned. We control animation state ourselves.
    const buf = await page.screenshot({ type: 'png' });
    if (!ff.stdin.write(buf)) await once(ff.stdin, 'drain');

    if (i % Math.max(1, Math.round(args.fps)) === 0 || i === frames - 1) {
      const pct = ((i + 1) / frames * 100).toFixed(0);
      const el = (Date.now() - t0) / 1000;
      process.stdout.write(`\r  frame ${i + 1}/${frames}  ${pct}%  ${el.toFixed(1)}s   `);
    }
  }
  ff.stdin.end();
  const [code] = await ffDone;
  process.stdout.write('\n');
  if (code !== 0) throw new Error('ffmpeg (video) exited ' + code);

  /* -------------------------------------------------------------- audio */

  // Default: pull audio from whichever clip is on screen at `from`, offset to
  // the right point inside that clip.
  let audioFile = args.audio;
  let audioStart = args.audioStart;
  if (!audioFile && !args.noAudio) {
    const hit = info.videos.find(v => v.ok && scenes[v.scene] &&
                                 from < scenes[v.scene].end && to > scenes[v.scene].start);
    if (hit) {
      audioFile = path.resolve(ROOT, hit.src);
      audioStart = Math.max(0, from - scenes[hit.scene].start);
    }
  }

  if (audioFile && fs.existsSync(audioFile)) {
    const hasAudio = await probeHasAudio(audioFile);
    if (hasAudio) {
      console.log(`  audio    ${path.relative(ROOT, audioFile)} @ +${(audioStart || 0).toFixed(2)}s`);
      const mux = spawn(FFMPEG, [
        '-hide_banner', '-loglevel', 'error', '-y',
        '-i', silentPath,
        '-ss', String(audioStart || 0), '-i', audioFile,
        '-map', '0:v:0', '-map', '1:a:0',
        '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k',
        '-shortest', '-movflags', '+faststart',
        outPath
      ], { stdio: ['ignore', 'inherit', 'inherit'] });
      const [mc] = await once(mux, 'close');
      if (mc !== 0) throw new Error('ffmpeg (mux) exited ' + mc);
      fs.unlinkSync(silentPath);
    } else {
      console.log('  audio    source has no audio track — writing silent video');
      fs.renameSync(silentPath, outPath);
    }
  } else {
    if (!args.noAudio) console.log('  audio    none available — writing silent video');
    fs.renameSync(silentPath, outPath);
  }

  const size = (fs.statSync(outPath).size / 1048576).toFixed(2);
  console.log(`\n  done     ${outPath}  (${size} MB, ${((Date.now() - t0) / 1000).toFixed(1)}s)\n`);
} catch (err) {
  console.error('\nrender failed:', err.message);
  exitCode = 1;
} finally {
  await browser.close();
  close();
}
process.exit(exitCode);

/* ----------------------------------------------------------------- utils */

async function probeHasAudio(file) {
  const p = spawn(FFMPEG, ['-hide_banner', '-i', file], { stdio: ['ignore', 'ignore', 'pipe'] });
  let err = '';
  p.stderr.on('data', d => { err += d; });
  await once(p, 'close');
  return /Stream #\d+:\d+.*: Audio:/.test(err);
}
