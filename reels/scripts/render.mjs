/**
 * Chunked renderer.
 *
 * Remotion renders a composition in a single Chromium tab. On a GPU-less
 * container that tab reliably wedges somewhere past ~800 frames of this reel,
 * and the tab Remotion reloads in its place never finishes booting — so a
 * straight `remotion render` fails near the end of a 45-second cut.
 *
 * So: bundle once, render the frames in fixed-size chunks with a fresh browser
 * per chunk, then encode the complete image sequence in a single pass. One
 * encode means exact CFR timing and no generation loss, and a wedged tab costs
 * one chunk instead of the whole job.
 *
 *   npm run render                   # full reel
 *   npm run render -- --chunk=100    # smaller chunks, if one still wedges
 *   npm run render -- --out=out/alt.mp4
 *   npm run render -- --composition=SomeOtherReel
 */
import {bundle} from '@remotion/bundler';
import {renderFrames, selectComposition} from '@remotion/renderer';
import {execFileSync} from 'node:child_process';
import {mkdirSync, readdirSync, renameSync, rmSync} from 'node:fs';
import {dirname, join, resolve} from 'node:path';

const arg = (name, fallback) => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split('=').slice(1).join('=') : fallback;
};

const COMPOSITION = arg('composition', 'FiftyCentReel');
const OUT = resolve(arg('out', 'out/fifty-cent-reel.mp4'));
const CHUNK = Number(arg('chunk', '150'));
const FRAMES_DIR = resolve('out/frames');

console.log(`Bundling ${COMPOSITION}…`);
const serveUrl = await bundle({
  entryPoint: resolve('src/index.ts'),
  webpackOverride: (config) => ({
    ...config,
    module: {
      ...config.module,
      rules: [...(config.module?.rules ?? []), {test: /\.(woff2|png)$/, type: 'asset/inline'}],
    },
  }),
});

const composition = await selectComposition({serveUrl, id: COMPOSITION});
const {durationInFrames, fps, width, height} = composition;
console.log(
  `${COMPOSITION}: ${width}x${height} @ ${fps}fps, ${durationInFrames} frames ` +
    `(${(durationInFrames / fps).toFixed(2)}s), chunks of ${CHUNK}`,
);

rmSync(FRAMES_DIR, {recursive: true, force: true});
mkdirSync(FRAMES_DIR, {recursive: true});
mkdirSync(dirname(OUT), {recursive: true});

for (let start = 0; start < durationInFrames; start += CHUNK) {
  const end = Math.min(start + CHUNK, durationInFrames) - 1;
  await renderFrames({
    composition,
    serveUrl,
    outputDir: FRAMES_DIR,
    frameRange: [start, end],
    concurrency: 1,
    imageFormat: 'jpeg',
    jpegQuality: 95,
    chromiumOptions: {gl: 'angle-egl'},
    timeoutInMilliseconds: 120000,
    onStart: () => undefined,
    onFrameUpdate: () => undefined,
  });
  console.log(`  frames ${start}-${end} rendered`);
}

// Remotion zero-pads frame filenames to the width of the highest frame in
// each call, so chunked rendering produces a mix of `element-899.jpeg` and
// `element-0900.jpeg`. Normalise to one fixed width the encoder can glob.
const PAD = 5;
const frames = readdirSync(FRAMES_DIR).filter((f) => f.endsWith('.jpeg'));
if (frames.length !== durationInFrames) {
  throw new Error(`Expected ${durationInFrames} frames, found ${frames.length} in ${FRAMES_DIR}`);
}
for (const file of frames) {
  const n = Number(file.match(/(\d+)\.jpeg$/)[1]);
  renameSync(join(FRAMES_DIR, file), join(FRAMES_DIR, `f-${String(n).padStart(PAD, '0')}.jpeg`));
}

// One encode over the whole sequence: exact constant frame rate, no
// concatenated-timestamp drift, and no second-generation compression.
console.log(`Encoding ${frames.length} frames…`);
execFileSync(
  resolve('node_modules/.bin/remotion'),
  [
    'ffmpeg',
    '-y',
    '-framerate', String(fps),
    '-start_number', '0',
    '-i', join(FRAMES_DIR, `f-%${String(PAD).padStart(2, '0')}d.jpeg`),
    '-c:v', 'libx264',
    '-crf', '18',
    '-preset', 'slow',
    '-pix_fmt', 'yuv420p',
    '-color_range', 'tv',
    '-movflags', '+faststart',
    OUT,
  ],
  {stdio: ['ignore', 'ignore', 'pipe']},
);

rmSync(FRAMES_DIR, {recursive: true, force: true});
console.log(`\nWrote ${OUT}`);
