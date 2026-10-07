/**
 * Price Optimizer — 3D animated explainer.
 * Smart Value AI Solutions.
 *
 * Master assembly. One paused GSAP timeline drives every scene; the renderer
 * seeks it to an exact time and asks for one frame. Nothing here reads the
 * wall clock, so the film is byte-identical on every pass — which is the whole
 * point: when a figure in the scenario table changes, this is a re-render, not
 * a re-shoot.
 */

import gsap from 'gsap';
import { THREE, createWorld, makeDust, reseed } from './world.js';
import { runUpdaters, look, applyLook } from './stage.js';
import { buildScene1 } from './scenes/s1-flat-shelf.js';
import { buildScene2 } from './scenes/s2-hidden-curve.js';
import { buildScene3 } from './scenes/s3-standoff.js';
import { buildScene4 } from './scenes/s4-the-machine.js';
import { buildScene5 } from './scenes/s5-scenarios.js';
import { buildScene6 } from './scenes/s6-ladder.js';
import { buildScene7 } from './scenes/s7-resolve.js';

export const DURATION = 78;   // seconds
export const FPS = 30;

const canvas = document.getElementById('gl');
const { renderer, scene, camera } = createWorld(canvas);

reseed(20260507);
const dust = makeDust(300, 54);
scene.add(dust);

const master = gsap.timeline({ paused: true });
const ctx = { scene, camera, renderer, master };

const s1 = buildScene1(ctx);
const s2 = buildScene2(ctx, s1);
const s3 = buildScene3(ctx);
const s4 = buildScene4(ctx);
const s5 = buildScene5(ctx);
const s6 = buildScene6(ctx);
const s7 = buildScene7(ctx);

/**
 * Hand-offs.
 *
 * The camera never cuts, so the scenes have to overlap at the seam: the
 * outgoing world is still fading as the incoming one arrives. 0.8s each —
 * long enough to feel continuous, short enough that nothing muddles.
 */
function handoff(scn, at, dur = 0.9) {
  const s = { o: 1 };
  master.to(s, { o: 0, duration: dur, ease: 'power2.inOut', onUpdate: () => scn.fade(s.o) }, at);
}
handoff(s1, 20.9);
handoff(s3, 31.9);
handoff(s4, 43.7);
handoff(s5, 57.9);
handoff(s6, 68.1);

/* Visibility is derived from absolute time rather than from callbacks, so a
   seek to any frame lands in the right state regardless of how it got there. */
const WINDOWS = [
  [s1.group, 0, 21.4],
  [s3.group, 20.8, 33.0],
  [s4.group, 31.5, 44.8],
  [s5.group, 44.0, 59.0],
  [s6.group, 58.1, 69.2],
  [s7.group, 68.0, DURATION],
];

/* Dust drifts; it is the only thing in frame with no argument to make. */
function applyAmbient(t) {
  dust.rotation.y = t * 0.012;
  dust.position.y = Math.sin(t * 0.21) * 0.35;
}

/** Seek to an absolute time and render exactly one frame. */
function renderAt(t) {
  const clamped = Math.max(0, Math.min(DURATION, t));
  master.time(clamped, false);
  for (const [g, a, b] of WINDOWS) g.visible = clamped >= a && clamped <= b;
  applyAmbient(clamped);
  runUpdaters(clamped);
  applyLook(camera);
  renderer.render(scene, camera);
}

/* ---- Render harness API, consumed by tools/render.mjs ---- */
window.__film = {
  duration: DURATION,
  fps: FPS,
  frames: Math.round(DURATION * FPS),
  seek: (t) => renderAt(t),
  seekFrame: (f) => renderAt(f / FPS),
};

/* Fonts must be resolved before the first frame or the type layer reflows
   mid-render and the cut jumps. */
Promise.all([
  document.fonts.ready,
  ...Array.from(document.images).map((img) => img.complete
    ? Promise.resolve()
    : new Promise((r) => { img.onload = img.onerror = r; })),
]).then(() => {
  renderAt(0);
  window.__ready = true;
});

/* Local preview only. The frame grabber never uses this path. */
if (!location.search.includes('render')) {
  let t0 = null;
  const loop = (ms) => {
    if (t0 === null) t0 = ms;
    const t = ((ms - t0) / 1000) % DURATION;
    if (window.__ready) renderAt(t);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

export { renderAt, master, scene, camera, renderer };
