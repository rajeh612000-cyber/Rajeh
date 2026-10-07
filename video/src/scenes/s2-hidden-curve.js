/**
 * Scene 2 — The hidden curve.  0:08.5 – 0:21
 *
 * The camera descends from the shelf to a single SKU. That descent IS the
 * product's argument: an average hides the thing you need, and you only see it
 * at SKU level. The lens ring from the mark opens on the node, the response
 * curve unfurls — and then we pull back and every other node has a curve of a
 * different shape.
 *
 * The elasticities below are deliberately irregular. A tidy progression would
 * look designed; real portfolios are lumpy, and a pricing director knows it.
 */

import { THREE, makeResponseCurve, makeLensRing } from '../world.js';
import { PRIMARY, DEEP, LIGHT, NUM, EASE } from '../brand.js';
import { statement, kicker, chip } from '../type.js';
import { cam, inType, outType, in3D, addUpdater } from '../stage.js';

const ELASTICITIES = [1.15, 2.40, 0.85, 1.70, 3.10, 1.05, 1.95, 2.75, 0.95, 1.45, 2.20, 3.40, 1.30];
const HERO = 6; // the centre SKU, at x = 0

/** Anchor a response curve so it unfurls rightward from its node. */
function anchoredCurve(elasticity, color) {
  const span = 3.4, height = 1.9;
  const curve = makeResponseCurve(elasticity, color, span, height, 64);
  curve.position.set(span / 2, height / 2, 0);
  const holder = new THREE.Group();
  holder.add(curve);
  holder.userData.setOpacity = (o) => curve.userData.setOpacity(o);
  holder.userData.setColor = (c) => curve.userData.setColor(c);
  return holder;
}

export function buildScene2(ctx, s1) {
  const { camera } = ctx;
  const tl = ctx.master;
  const T = 8.5;

  const curves = s1.posts.map((p, i) => {
    const c = anchoredCurve(ELASTICITIES[i], i === HERO ? PRIMARY : (i % 2 ? LIGHT : DEEP));
    c.position.set(0.12, 0, 0);
    c.userData.setOpacity(0);
    p.g.add(c);
    return c;
  });

  const lens = makeLensRing(0.42, PRIMARY, 0.35);
  lens.position.set(0, 0, 0);
  lens.userData.setOpacity(0);
  s1.posts[HERO].node.add(lens);

  /* The lens breathes. It is the only object in the film allowed to idle. */
  addUpdater((t) => {
    const s = 1 + Math.sin(t * 1.5) * 0.035;
    lens.scale.setScalar(s);
  });

  /* ---------------- type ---------------- */
  const c1 = chip('500 ml', { x: 35.5, y: 72 });
  const c2 = chip('Retailer A', { x: 45, y: 72 });
  const c3 = chip('Modern trade', { x: 56.5, y: 72 });
  const s_a = statement('Everyone knows price moves volume.', { x: 50, y: 24, size: 46, weight: 300 });
  const s_b = statement('Almost nobody knows <b>by how much.</b>', { x: 50, y: 24, size: 52, weight: 300 });
  const k = kicker('Elasticity by SKU &middot; pack &middot; retailer &middot; channel', { x: 50, y: 14 });
  const s_c = statement(
    'Every pack has its own curve.<br><b>One average has none of them.</b>',
    { x: 50, y: 25, size: 46 }
  );

  /* ---------------- timeline ---------------- */

  /* Down to the node. Slow — this is the film's first real idea. */
  cam(tl, camera, { x: 0.15, y: 2.75, z: 8.4, lx: 0, ly: 2.5, dur: 3.4, ease: EASE.move }, T);

  /* The rest of the shelf recedes so one SKU can be read. */
  s1.posts.forEach((p, i) => {
    if (i === HERO) return;
    tl.to(p.post.material, { opacity: 0.12, duration: 1.2, ease: EASE.move }, T + 0.3);
    tl.to({ o: 1 }, {
      o: 0.22, duration: 1.2, ease: EASE.move,
      onUpdate: function () { p.node.userData.setOpacity(this.targets()[0].o); },
    }, T + 0.3);
  });

  in3D(tl, lens, T + 1.5, { dur: 0.8 });
  in3D(tl, curves[HERO], T + 2.1, { dur: 0.9 });
  tl.fromTo(curves[HERO].scale, { x: 0.001 }, { x: 1, duration: 1.6, ease: EASE.settle }, T + 2.1);

  inType(tl, c1, T + 2.7, { dur: 0.5 });
  inType(tl, c2, T + 2.85, { dur: 0.5 });
  inType(tl, c3, T + 3.0, { dur: 0.5 });

  inType(tl, s_a, T + 3.3);
  outType(tl, s_a, T + 5.0);
  inType(tl, s_b, T + 5.1);

  /* Pull all the way back out. Now the comparison can be made. */
  cam(tl, camera, { x: 0, y: 5.0, z: 30.5, lx: 0, ly: 1.3, dur: 4.2, ease: EASE.move }, T + 6.2);

  outType(tl, c1, T + 6.2, { dur: 0.5 });
  outType(tl, c2, T + 6.3, { dur: 0.5 });
  outType(tl, c3, T + 6.4, { dur: 0.5 });
  outType(tl, s_b, T + 7.4);

  /* Every node sprouts its own shape. Thirteen different answers to one question. */
  s1.posts.forEach((p, i) => {
    if (i === HERO) return;
    const at = T + 6.6 + Math.abs(i - HERO) * 0.1;
    tl.to(p.post.material, { opacity: 0.45, duration: 0.8 }, at);
    tl.to({ o: 0.22 }, {
      o: 0.9, duration: 0.8,
      onUpdate: function () { p.node.userData.setOpacity(this.targets()[0].o); },
    }, at);
    in3D(tl, curves[i], at, { dur: 0.7, to: 0.85 });
    tl.fromTo(curves[i].scale, { x: 0.001 }, { x: 1, duration: 1.0, ease: EASE.settle }, at);
  });

  inType(tl, k, T + 8.4, { dur: 0.7 });
  inType(tl, s_c, T + 9.0);

  outType(tl, k, T + 11.6);
  outType(tl, s_c, T + 11.7);
  in3D(tl, lens, T + 11.3, { from: 1, to: 0, dur: 0.6 });

  /* Scene 2 lives inside scene 1's group, so it hands its fade up rather than
     owning one: one hand-off, not two. */
  s1.group.userData._extra.push((o) => {
    curves.forEach((c) => c.userData.setOpacity(o * 0.85));
    lens.userData.setOpacity(0);
  });

  return { curves, lens, end: T + 12.5 };
}
