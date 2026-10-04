// Assembles static-post/post.html from template.html, inlining the same
// Three.js scenes and models the website pages use (so the 3D matches).
//   node build-post.mjs && node render.mjs
import { readFileSync, writeFileSync } from 'node:fs';
const src = (f) => readFileSync(new URL(`../smartvalue-solutions/src/${f}`, import.meta.url), 'utf8');
const models = src('svp-models.mjs').replace(/^export /gm, '');
const hero = src('svp-hero-3d.js');
const pick = (start, end) => { const i = hero.indexOf(start); const j = hero.indexOf(end, i); if (i < 0 || j < 0) throw new Error('marker not found: ' + start); return hero.slice(i, j + end.length); };
const helpers = [
  pick('const clamp01', ';\n'),
  pick('const damp', ';\n'),
  pick('function dotTexture(THREE) {', '\n}\n'),
].join('\n');
const scenes = hero.slice(hero.indexOf('const SCENES = {'));
const tpl = readFileSync(new URL('./static-post/template.html', import.meta.url), 'utf8');
writeFileSync(new URL('./static-post/post.html', import.meta.url), tpl.replace('/*__SCENES__*/', `${models}\n${helpers}\n${scenes}`));
console.log('static-post/post.html written');
