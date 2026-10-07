/**
 * Scene 5 — Scenario comparison.  0:44.5 – 0:58.5
 *
 * The money shot, and the reason the film exists. Three real scenarios from the
 * page, three metrics each, one guardrail.
 *
 * Direction notes that matter here:
 *  - Numbers count up. They are never cut to. The buyer has to watch each
 *    figure be computed, because the claim is that it was computed.
 *  - R2's volume bar is allowed to physically break the guardrail plane. That
 *    is the only violence in the film, and it is doing an argument's work:
 *    a blanket +5% looks fine on revenue and margin until you see what it costs.
 *  - The orange lands once, here, on R1 — and once more on the end card.
 *    Scarcity is what makes it read as a recommendation rather than a colour.
 */

import { THREE, makeBar, makeGuardrail, makeLensRing, edgeMaterial } from '../world.js';
import { PRIMARY, DEEP, NUM, BORDER, ACCENT, ROSE, ROSE_SOFT, EASE, SCENARIOS, GUARDRAIL } from '../brand.js';
import { statement, kicker, card, counter, marker } from '../type.js';
import { cam, inType, outType, in3D, countTo, addUpdater } from '../stage.js';

/** Units per percentage point. Small enough that +6.8% stays inside the frame. */
const U = 0.56;
const COL_X = [-7.4, 0, 7.4];
const METRIC_Z = [-1.15, 0, 1.15];
const METRIC_COLOR = [PRIMARY, DEEP, NUM];
const METRIC_KEY = ['revenue', 'margin', 'volume'];

export function buildScene5(ctx) {
  const { scene, camera } = ctx;
  const tl = ctx.master;
  const T = 44.5;

  const group = new THREE.Group();
  group.visible = false;
  /* The bar field sits low: the cards own the top third of the frame. */
  group.position.y = -1.3;
  scene.add(group);

  /* The floor everything is measured from. */
  const floor = new THREE.GridHelper(30, 12, BORDER, BORDER);
  floor.material = edgeMaterial(BORDER, 0.055);
  group.add(floor);

  const rail = makeGuardrail(26, 7, NUM);
  rail.position.y = GUARDRAIL * U;
  rail.userData.setOpacity(0);
  group.add(rail);

  const cols = SCENARIOS.map((sc, i) => {
    const g = new THREE.Group();
    g.position.x = COL_X[i];
    const bars = METRIC_KEY.map((k, m) => {
      const b = makeBar(0.95, 0.95, METRIC_COLOR[m], 0.4);
      b.position.z = METRIC_Z[m];
      b.userData.setValue(0);
      b.userData.setOpacity(0);
      g.add(b);
      return b;
    });
    group.add(g);
    return { g, bars, sc };
  });

  /* The lens ring lands on the recommendation. Same object as the mark's. */
  const lens = makeLensRing(0.46, ACCENT, 0.3);
  lens.position.set(COL_X[0] - 1.5, 3.3, 1.3);
  lens.userData.setOpacity(0);
  group.add(lens);
  addUpdater((t) => { lens.scale.setScalar(1 + Math.sin(t * 1.7) * 0.04); });

  /* ---------------- type ---------------- */
  const kTitle = kicker('Scenarios compared on revenue, margin and volume', { x: 50, y: 10 });
  const kRail = kicker('Volume guardrail &middot; no worse than &minus;2%', { x: 50, y: 88, size: 13, color: 'rgba(160,157,232,.72)' });

  const counters = [];
  const cards = SCENARIOS.map((sc, i) => {
    const c = card({ x: 19 + i * 31, y: 20, w: 390, h: 200, accent: i === 0 ? 'var(--accent)' : null });
    const metrics = METRIC_KEY.map((k) => {
      const ctr = counter(0, { decimals: 1, suffix: '%' });
      counters.push(ctr);
      return { k, ctr };
    });
    c.innerHTML =
      `<div class="sc-id">${sc.id}</div><div class="sc-label">${sc.label}</div>` +
      `<div class="sc-rows">${metrics.map((m) =>
        `<div class="sc-metric"><div class="k">${m.k}</div><div class="v" data-v="${i}-${m.k}"></div></div>`
      ).join('')}</div>`;
    metrics.forEach((m) => c.querySelector(`[data-v="${i}-${m.k}"]`).appendChild(m.ctr.el));
    return { el: c, metrics };
  });

  const mark = marker('Recommended', { x: 19, y: 35.5 });
  const sVerdict = statement(
    'The only scenario that clears the guardrail.',
    { x: 50, y: 83, size: 42, weight: 300 }
  );

  /* ---------------- timeline ---------------- */
  tl.call(() => { group.visible = true; }, null, T - 0.2);
  camera.position.set(0, 6.4, 27);
  cam(tl, camera, { x: 0, y: 4.3, z: 21.0, lx: 0, ly: 1.2, dur: 4.0, ease: EASE.move }, T);

  inType(tl, kTitle, T + 0.2, { dur: 0.7 });
  in3D(tl, rail, T + 0.5, { dur: 1.0 });
  inType(tl, kRail, T + 0.9, { dur: 0.7 });

  /* Each scenario is built in turn, metric by metric, so no figure is skimmed. */
  cols.forEach((col, i) => {
    const at = T + 1.6 + i * 2.9;
    inType(tl, cards[i].el, at, { dur: 0.7, y: -26 });

    col.bars.forEach((b, m) => {
      const key = METRIC_KEY[m];
      const target = col.sc[key];
      const ctr = cards[i].metrics[m].ctr;
      const bAt = at + 0.35 + m * 0.38;

      in3D(tl, b, bAt, { dur: 0.5 });
      const s = { v: 0 };
      tl.to(s, {
        v: target, duration: 1.25, ease: EASE.settle,
        onUpdate: () => b.userData.setValue(s.v * U),
      }, bAt);
      countTo(tl, ctr, target, bAt, { dur: 1.25 });

      /* A negative metric is stated in rose the moment it goes negative — no
         crossfade. A number below zero is a different kind of number. */
      if (target < 0) {
        tl.call(() => b.userData.setColor(target <= GUARDRAIL ? ROSE : ROSE_SOFT), null, bAt + 0.55);
      }
    });
  });

  /* R2 breaks the guardrail. The plane registers the hit, then settles back. */
  const breakAt = T + 1.6 + 2.9 + 0.35 + 2 * 0.38 + 0.8;
  tl.call(() => rail.userData.setColor(ROSE), null, breakAt);
  tl.fromTo(rail.scale, { y: 1 }, { y: 1, duration: 0.01 }, breakAt);
  tl.to(rail.position, { y: GUARDRAIL * U - 0.16, duration: 0.14, ease: 'power3.out' }, breakAt);
  tl.to(rail.position, { y: GUARDRAIL * U, duration: 0.9, ease: 'power2.out' }, breakAt + 0.14);
  tl.call(() => rail.userData.setColor(NUM), null, breakAt + 1.5);

  /* Settle on the recommendation. Everything else steps back, it does not vanish:
     the comparison has to stay visible for the choice to mean anything. */
  const settleAt = T + 10.4;
  cam(tl, camera, { x: -5.4, y: 3.0, z: 13.5, lx: -7.2, ly: 1.5, dur: 3.4, ease: EASE.move }, settleAt);

  [1, 2].forEach((i) => {
    cols[i].bars.forEach((b) => in3D(tl, b, settleAt + 0.3, { from: 1, to: 0.3, dur: 1.0 }));
    tl.to(cards[i].el, { opacity: 0.28, duration: 1.0, ease: EASE.move }, settleAt + 0.3);
  });
  outType(tl, kTitle, settleAt + 0.3, { dur: 0.6 });
  outType(tl, kRail, settleAt + 0.3, { dur: 0.6 });

  /* The orange moment. One beat of silence before it, by design. */
  in3D(tl, lens, settleAt + 1.5, { dur: 0.6, ease: EASE.snap });
  tl.fromTo(lens.scale, { x: 2.2, y: 2.2, z: 2.2 }, { x: 1, y: 1, z: 1, duration: 0.7, ease: EASE.snap }, settleAt + 1.5);
  tl.call(() => cols[0].bars[0].userData.setColor(ACCENT), null, settleAt + 1.6);
  inType(tl, mark, settleAt + 1.7, { dur: 0.5, y: 10 });

  inType(tl, sVerdict, settleAt + 2.4);

  const endAt = T + 13.4;
  outType(tl, sVerdict, endAt, { dur: 0.6 });
  outType(tl, mark, endAt, { dur: 0.6 });
  cards.forEach((c) => tl.to(c.el, { opacity: 0, duration: 0.6, ease: 'power2.in' }, endAt));
  in3D(tl, lens, endAt, { from: 1, to: 0, dur: 0.5 });

  const fade = (o) => {
    rail.userData.setOpacity(o);
    floor.material.opacity = 0.055 * o;
    cols.forEach((c, i) => c.bars.forEach((b) => b.userData.setOpacity(o * (i === 0 ? 1 : 0.3))));
    lens.userData.setOpacity(0);
  };

  return { group, fade, end: T + 14 };
}
