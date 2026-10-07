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

function trimChain(label, stream, kind) {
  const trimOp = kind === 'v' ? 'trim' : 'atrim';
  const ptsOp = kind === 'v' ? 'setpts=PTS-STARTPTS' : 'asetpts=PTS-STARTPTS';
  return SEGMENTS
    .map(([a, b], i) => `[${stream}]${trimOp}=start=${a}:end=${b},${ptsOp}[${label}${i}]`)
    .join(';');
}

const cutLength = SEGMENTS.reduce((n, [a, b]) => n + (b - a), 0);
const joins = SEGMENTS.slice(0, -1).reduce((acc, [a, b]) => {
  acc.push((acc.length ? acc[acc.length - 1] : 0) + (b - a));
  return acc;
}, []);

/** Dip to ink at each join, plus a head and tail fade. */
const videoFades = [
  `fade=t=in:st=0:d=0.3`,
  ...joins.flatMap((t) => [
    `fade=t=out:st=${(t - JOIN).toFixed(3)}:d=${JOIN}`,
    `fade=t=in:st=${t.toFixed(3)}:d=${JOIN}`,
  ]),
  `fade=t=out:st=${(cutLength - 0.5).toFixed(3)}:d=0.5`,
].join(',');

const audioFades = [
  `afade=t=in:st=0:d=0.3`,
  ...joins.flatMap((t) => [
    `afade=t=out:st=${(t - JOIN).toFixed(3)}:d=${JOIN}`,
    `afade=t=in:st=${t.toFixed(3)}:d=${JOIN}`,
  ]),
  `afade=t=out:st=${(cutLength - 0.6).toFixed(3)}:d=0.6`,
].join(',');

const X264 = ['-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p',
  '-profile:v', 'high', '-level', '4.2', '-movflags', '+faststart'];
/** −16 LUFS: a web explainer with no voiceover sits a little hotter than broadcast. */
const AAC = ['-c:a', 'aac', '-b:a', '192k', '-ar', '48000',
  '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11'];

await access(MASTER);
await access(SCORE);
await mkdir(OUT, { recursive: true });

console.log('1/5  scoring the master');
await run([
  '-i', MASTER, '-i', SCORE,
  '-map', '0:v:0', '-map', '1:a:0', '-shortest',
  ...X264, ...AAC,
  `${OUT}/price-optimizer-78s-1080p.mp4`,
], 'master');

console.log('2/5  cutting 20s landscape');
await run([
  '-i', MASTER, '-i', SCORE,
  '-filter_complex', [
    trimChain('v', '0:v', 'v'),
    trimChain('a', '1:a', 'a'),
    `${SEGMENTS.map((_, i) => `[v${i}]`).join('')}concat=n=${SEGMENTS.length}:v=1:a=0[vc]`,
    `${SEGMENTS.map((_, i) => `[a${i}]`).join('')}concat=n=${SEGMENTS.length}:v=0:a=1[ac]`,
    `[vc]${videoFades}[vo]`,
    `[ac]${audioFades}[ao]`,
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
    '-i', `${OUT}/furniture/${name}.png`,
    '-filter_complex', [
      `[0:v]scale=${f.w}:-2[pic]`,
      `[1:v][pic]overlay=${f.x}:${f.y}:format=auto,format=yuv420p[vo]`,
    ].join(';'),
    '-map', '[vo]', '-map', '0:a',
    ...X264, '-c:a', 'copy',
    `${OUT}/price-optimizer-20s-${name}.mp4`,
  ], name);
}

console.log('5/5  poster frames');
for (const [name, t] of [['hero', 56.9], ['curves', 19.0], ['scenarios', 53.4]]) {
  await run(['-ss', String(t), '-i', MASTER, '-frames:v', '1', `${OUT}/poster-${name}.png`], 'poster');
}

