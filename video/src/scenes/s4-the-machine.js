/**
 * Scene 4 — The machine.  0:32 – 0:44.5
 *
 * The four steps from the site, built as one unbroken move rather than four
 * cuts: data streams in, the lattice lights, three futures branch, one
 * solidifies. Cutting here would turn a pipeline into a list, and the whole
 * claim is that it is a pipeline.
 *
 * The streams are a pure function of absolute time, so the flow is identical on
 * every render pass.
 */

import { THREE, makeMarkLattice, makeResponseCurve, deepOpacity, srand, reseed } from '../world.js';
import { PRIMARY, DEEP, NUM, BORDER, ACCENT, EASE } from '../brand.js';
import { statement, kicker, card } from '../type.js';
import { cam, inType, outType, in3D, addUpdater } from '../stage.js';

const STEPS = [
  ['01', 'Connect your data', 'Sell-out, shipments, list and net prices &mdash; and competitor prices where you have them.'],
  ['02', 'Model price response', 'How volume reacts to price, for every SKU, retailer and channel combination.'],
  ['03', 'Test scenarios', 'Compare moves side by side against revenue, margin and volume targets.'],
  ['04', 'Decide and track', 'A recommended price per SKU to take into pricing talks &mdash; then tracked against forecast.'],
];

const STREAM_COUNT = 4;
const PER_STREAM = 90;

function makeStream(laneY, laneZ, color) {
  const pos = new Float32Array(PER_STREAM * 3);
  const phase = new Float32Array(PER_STREAM);
  for (let i = 0; i < PER_STREAM; i++) {
    phase[i] = srand();
    pos[i * 3 + 0] = 0;
    pos[i * 3 + 1] = laneY + (srand() - 0.5) * 0.5;
    pos[i * 3 + 2] = laneZ + (srand() - 0.5) * 0.5;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    color, size: 0.085, transparent: true, opacity: 0, sizeAttenuation: true,
  });
  const pts = new THREE.Points(geo, mat);
  pts.userData.phase = phase;
  pts.userData.setOpacity = (o) => { mat.opacity = 0.8 * o; };
  return pts;
}

export function buildScene4(ctx) {
  const { scene, camera } = ctx;
  const tl = ctx.master;
  const T = 32;

  reseed(40404);

  const group = new THREE.Group();
  group.visible = false;
  scene.add(group);

  /* The core is the mark itself, three-quarters on. */
  const core = makeMarkLattice();
  core.scale.setScalar(0.74);
  core.position.set(0.2, 0.3, 0);
  core.rotation.set(0.22, -0.5, 0);
  group.add(core);
  const coreOpacity = deepOpacity(core);
  coreOpacity(0);

  /* Four lanes of data converging on the core. */
  const streams = [];
  for (let i = 0; i < STREAM_COUNT; i++) {
    const s = makeStream(-2.1 + i * 1.4, (i - 1.5) * 1.1, i % 2 ? NUM : PRIMARY);
    group.add(s);
    streams.push(s);
  }

  const START_X = -16, END_X = 0.1;
  addUpdater((t) => {
    if (!group.visible) return;
    core.rotation.y = -0.5 + t * 0.16;
    for (const s of streams) {
      const arr = s.geometry.attributes.position.array;
      const ph = s.userData.phase;
      for (let i = 0; i < PER_STREAM; i++) {
        const p = (ph[i] + t * 0.13) % 1;
        arr[i * 3] = START_X + (END_X - START_X) * p;
      }
      s.geometry.attributes.position.needsUpdate = true;
    }
  });

  /* Three futures branching off the core; one of them is taken. */
  const futures = [1.0, 1.8, 2.9].map((e, i) => {
    const c = makeResponseCurve(e, i === 0 ? PRIMARY : DEEP, 2.9, 1.35, 56);
    c.position.set(6.6, 1.1 + (1 - i) * 1.55, -1.2);
    c.userData.setOpacity(0);
    group.add(c);
    return c;
  });

  /* ---------------- type ---------------- */
  const cards = STEPS.map((s, i) => {
    const c = card({ x: 15.2 + i * 23.2, y: 79, w: 340, h: 196 });
    c.innerHTML = `<div class="st-n">${s[0]}</div><div class="st-t">${s[1]}</div><div class="st-d">${s[2]}</div>`;
    return c;
  });
  const k = kicker('How Price Optimizer works', { x: 50, y: 13 });
  const s1 = statement('From your data to a decision.', { x: 50, y: 20.5, size: 46, weight: 300 });
  const kHost = kicker('Runs on the Smart Value&trade; platform', { x: 50, y: 92.5, size: 13, color: 'rgba(160,157,232,.6)' });

  /* ---------------- timeline ---------------- */
  tl.call(() => { group.visible = true; }, null, T - 0.2);
  cam(tl, camera, { x: 0.4, y: 1.1, z: 21.5, lx: 1.6, ly: 0.1, dur: 6.0, ease: EASE.move }, T);

  inType(tl, k, T + 0.2, { dur: 0.7 });
  inType(tl, s1, T + 0.5, { dur: 0.8 });

  streams.forEach((s, i) => in3D(tl, s, T + 0.8 + i * 0.22, { dur: 1.0 }));
  tl.to({ o: 0 }, { o: 1, duration: 1.4, ease: EASE.reveal, onUpdate: function () { coreOpacity(this.targets()[0].o); } }, T + 2.0);

  inType(tl, cards[0], T + 1.9, { dur: 0.7, y: 28 });
  inType(tl, cards[1], T + 3.8, { dur: 0.7, y: 28 });
  inType(tl, cards[2], T + 5.7, { dur: 0.7, y: 28 });

  /* Scenarios branch before step 3's card has finished settling: the picture
     runs slightly ahead of the label, so the viewer reads rather than waits. */
  futures.forEach((f, i) => {
    in3D(tl, f, T + 6.0 + i * 0.2, { dur: 0.8, to: 0.45 });
    tl.fromTo(f.scale, { x: 0.01 }, { x: 1, duration: 1.1, ease: EASE.settle }, T + 6.0 + i * 0.2);
  });

  inType(tl, cards[3], T + 7.6, { dur: 0.7, y: 28 });

  /* One future solidifies. The first of the film's two orange moments is held
     back — this one is still violet. The buyer has not seen the evidence yet. */
  in3D(tl, futures[0], T + 8.2, { from: 0.45, to: 1, dur: 0.8 });
  out3DSoft(tl, futures[1], T + 8.2);
  out3DSoft(tl, futures[2], T + 8.3);

  inType(tl, kHost, T + 9.4, { dur: 0.7 });

  outType(tl, k, T + 11.3, { dur: 0.5 });
  outType(tl, s1, T + 11.35, { dur: 0.5 });
  outType(tl, kHost, T + 11.4, { dur: 0.5 });
  cards.forEach((c, i) => outType(tl, c, T + 11.4 + i * 0.05, { dur: 0.5 }));

  const fade = (o) => {
    coreOpacity(o);
    streams.forEach((s) => s.userData.setOpacity(o));
    futures.forEach((f, i) => f.userData.setOpacity(o * (i === 0 ? 1 : 0.08)));
  };

  return { group, core, fade, end: T + 12.5 };

  function out3DSoft(t2, obj, at) {
    const s = { o: 0.45 };
    t2.to(s, { o: 0.08, duration: 0.8, ease: EASE.move, onUpdate: () => obj.userData.setOpacity(s.o) }, at);
  }
}
