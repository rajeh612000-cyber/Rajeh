/**
 * Bakes the two texture plates the reel tiles over every frame:
 *
 *   grain.png    — 256x256 greyscale value noise, blended `overlay`
 *   halftone.png — one supersampled dot-screen cell, blended `multiply`
 *
 * Both were originally live CSS/SVG (feTurbulence, repeating radial-gradients).
 * They looked identical but had to be rasterised from scratch on every one of
 * 1350 frames, which exhausts the render tab part-way through a full render.
 * Baking them turns each into a cached image the compositor just tiles.
 *
 * Deterministic — re-running produces byte-identical files. `npm run textures`.
 */
import {deflateSync} from 'node:zlib';
import {writeFileSync} from 'node:fs';
import {join} from 'node:path';

const crcTable = Array.from({length: 256}, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
};

/** colourType 0 = greyscale (1 byte/px), 6 = RGBA (4 bytes/px). */
const writePng = (path, size, colourType, rows) => {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = colourType;
  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(Buffer.concat(rows), {level: 9})),
    chunk('IEND', Buffer.alloc(0)),
  ]);
  writeFileSync(path, png);
  console.log(`  ${path.split('/').pop().padEnd(14)} ${size}x${size}  ${(png.length / 1024).toFixed(1)} KB`);
};

// ---------------------------------------------------------------- grain ----

const GRAIN = 256;
let state = 0x5eed1e;
// xorshift32 — small, fast, reproducible across platforms.
const rand = () => {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  state >>>= 0;
  return state / 0xffffffff;
};

const grainRows = [];
for (let y = 0; y < GRAIN; y++) {
  const row = Buffer.alloc(GRAIN + 1); // +1 for the per-row filter byte (0 = none)
  for (let x = 0; x < GRAIN; x++) {
    // Sum of four uniforms ≈ normal. Centred on 128, which is `overlay`'s
    // no-op value, so the plate only lifts or crushes by a bounded amount.
    const n = (rand() + rand() + rand() + rand()) / 4;
    row[x + 1] = Math.max(0, Math.min(255, Math.round(128 + (n - 0.5) * 300)));
  }
  grainRows.push(row);
}

// ------------------------------------------------------------- halftone ----

/** Displayed cell size in CSS px. Two dots per cell give the 45° rosette. */
export const HALFTONE_PITCH = 12;
const SS = 4; // supersample factor, for anti-aliased dot edges
const HALF = HALFTONE_PITCH * SS;
const RADIUS = HALFTONE_PITCH * 0.19 * SS;

const coverage = (px, py, cx, cy) => {
  // Analytic-ish antialiasing: distance to the dot edge, clamped to one pixel.
  const d = Math.hypot(px - cx, py - cy);
  return Math.max(0, Math.min(1, RADIUS + 0.5 - d));
};

const halftoneRows = [];
for (let y = 0; y < HALF; y++) {
  const row = Buffer.alloc(HALF * 4 + 1);
  for (let x = 0; x < HALF; x++) {
    const px = x + 0.5;
    const py = y + 0.5;
    // Dot at the cell corner and one at its centre — the offset grid.
    const a = Math.max(
      coverage(px, py, 0, 0),
      coverage(px, py, HALF, 0),
      coverage(px, py, 0, HALF),
      coverage(px, py, HALF, HALF),
      coverage(px, py, HALF / 2, HALF / 2),
    );
    const i = 1 + x * 4;
    row[i] = 10; // near-black dots; `multiply` darkens the plate underneath
    row[i + 1] = 10;
    row[i + 2] = 10;
    row[i + 3] = Math.round(a * 255);
  }
  halftoneRows.push(row);
}

const dir = join(process.cwd(), 'src/theme/textures');
console.log('Baking textures:');
writePng(join(dir, 'grain.png'), GRAIN, 0, grainRows);
writePng(join(dir, 'halftone.png'), HALF, 6, halftoneRows);
