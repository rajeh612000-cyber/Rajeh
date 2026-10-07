/**
 * Build the delivery set from the silent master and the score.
 *
 *   node tools/deliver.mjs
 *
 * Produces:
 *   price-optimizer-78s-1080p.mp4   the hero cut, scored
 *   price-optimizer-20s-16x9.mp4    social, in-feed landscape
 *   price-optimizer-20s-9x16.mp4    social, vertical, in a branded frame
 *   price-optimizer-20s-1x1.mp4     social, square, in a branded frame
 *   poster-*.png                    thumbnails
 *
 * The cutdowns are not a crop. A scenario table cropped to 9:16 is unreadable
 * on a phone, and the table is the film — so the picture keeps its own aspect
 * inside brand furniture that carries the headline and the CTA. That is also
 * where a feed viewer with the sound off actually reads them.
 */
import { spawn } from 'node:child_process';
import { access, mkdir } from 'node:fs/promises';

const MASTER = 'out/price-optimizer-78s-1080p-silent.mp4';
const SCORE = 'out/score.wav';
const OUT = 'out';

/**
 * The 20s cut. Three passages, chosen because each works without the others:
 * the problem, the verdict, the brand.
 */
const SEGMENTS = [
  [1.2, 7.2],    // the blanket increase, and the four SKUs it costs
  [50.6, 58.2],  // the guardrail break, the settle, the recommendation
  [71.6, 78.0],  // the lattice becoming the mark, and the CTA
];
const JOIN = 0.22;  // a short dip to ink at each join

/** The window the picture plays through in the branded frames. */
const FRAMES = {
  '9x16': { w: 1080, h: 1920, x: 0, y: 656 },
  '1x1': { w: 1080, h: 1080, x: 0, y: 236 },
};

const run = (args, label) => new Promise((res, rej) => {
  const p = spawn('ffmpeg', ['-hide_banner', '-nostats', '-loglevel', 'error', '-y', ...args]);
  let err = '';
  p.stderr.on('data', (d) => { err += d; });
  p.on('close', (c) => c === 0 ? res() : rej(new Error(`${label} failed (${c})\n${err}`)));
});

/**
 * Trim one segment and fade it at both ends.
 *
 * The fades go on each segment BEFORE the concat, never on the joined stream.
 * Chained fade/afade filters multiply, so `fade=out@6s` followed by
 * `fade=in@6s` on one chain leaves the first filter holding everything after
 * 6s at zero and the second holding everything before it at zero — the result
 * is a uniformly black, silent clip. Which is exactly what the first build of
 * this script produced.
 */
function segmentChains(stream, label, kind) {
  const isV = kind === 'v';
  const trimOp = isV ? 'trim' : 'atrim';
  const ptsOp = isV ? 'setpts=PTS-STARTPTS' : 'asetpts=PTS-STARTPTS';
  const fadeOp = isV ? 'fade' : 'afade';

  return SEGMENTS.map(([a, b], i) => {
    const len = b - a;
    const inD = i === 0 ? 0.3 : JOIN;
    const outD = i === SEGMENTS.length - 1 ? 0.6 : JOIN;
    const fades = [
      `${fadeOp}=t=in:st=0:d=${inD}`,
      `${fadeOp}=t=out:st=${(len - outD).toFixed(3)}:d=${outD}`,
    ].join(',');
    return `[${stream}]${trimOp}=start=${a}:end=${b},${ptsOp},${fades}[${label}${i}]`;
  }).join(';');
}

const cutLength = SEGMENTS.reduce((n, [a, b]) => n + (b - a), 0);

const X264 = ['-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p',
  '-profile:v', 'high', '-level', '4.2', '-movflags', '+faststart'];
const AAC = ['-c:a', 'aac', '-b:a', '192k', '-ar', '48000'];
/** −16 LUFS: a web explainer with no voiceover sits a little hotter than broadcast.
    loudnorm resamples, so it is always followed back down to 48 kHz. */
const LOUDNORM = 'loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000';

await access(MASTER);
await access(SCORE);
await mkdir(OUT, { recursive: true });

console.log('1/5  scoring the master');
await run([
  '-i', MASTER, '-i', SCORE,
  '-map', '0:v:0', '-map', '1:a:0', '-shortest',
  ...X264, ...AAC, '-af', LOUDNORM,
  `${OUT}/price-optimizer-78s-1080p.mp4`,
], 'master');

console.log('2/5  cutting 20s landscape');
await run([
  '-i', MASTER, '-i', SCORE,
  '-filter_complex', [
    segmentChains('0:v', 'v', 'v'),
    segmentChains('1:a', 'a', 'a'),
    `${SEGMENTS.map((_, i) => `[v${i}]`).join('')}concat=n=${SEGMENTS.length}:v=1:a=0,format=yuv420p[vo]`,
    `${SEGMENTS.map((_, i) => `[a${i}]`).join('')}concat=n=${SEGMENTS.length}:v=0:a=1,${LOUDNORM}[ao]`,
  ].join(';'),
  '-map', '[vo]', '-map', '[ao]',
  ...X264, ...AAC,
  `${OUT}/price-optimizer-20s-16x9.mp4`,
], '16x9');

let step = 3;
for (const [name, f] of Object.entries(FRAMES)) {
  console.log(`${step++}/5  framing 20s ${name}`);
  await run([
    '-i', `${OUT}/price-optimizer-20s-16x9.mp4`,
    '-loop', '1', '-framerate', '30', '-i', `${OUT}/furniture/${name}.png`,
    '-filter_complex', [
      `[0:v]scale=${f.w}:-2[pic]`,
      `[1:v]format=yuv420p[bg]`,
      `[bg][pic]overlay=${f.x}:${f.y}:shortest=1,format=yuv420p[vo]`,
    ].join(';'),
    '-map', '[vo]', '-map', '0:a',
    '-r', '30', '-shortest',
    ...X264, '-c:a', 'copy',
    `${OUT}/price-optimizer-20s-${name}.mp4`,
  ], name);
}

console.log('5/5  poster frames');
for (const [name, t] of [['hero', 56.9], ['curves', 19.0], ['scenarios', 53.4]]) {
  await run(['-ss', String(t), '-i', MASTER, '-frames:v', '1', `${OUT}/poster-${name}.png`], 'poster');
}

