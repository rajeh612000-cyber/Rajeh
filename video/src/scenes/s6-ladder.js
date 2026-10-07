/**
 * Scene 6 — Pack-price ladder, then retailers.  0:58.5 – 1:08.5
 *
 * Two of the four questions from the page, in one move. First the ladder: the
 * gaps between pack sizes are measured, because the gap is the thing that
 * decides whether a shopper trades up or trades out. Then the whole ladder
 * fans back into depth, once per retailer, each landing differently.
 *
 * The fan into Z is the single clearest argument in the film for why a national
 * average is the wrong unit — you can see four different answers at once.
 */

import { THREE, makeNode, makePost, makeDashedLine, edgeMaterial } from '../world.js';
import { PRIMARY, DEEP, LIGHT, NUM, BORDER, EASE } from '../brand.js';
import { statement, kicker, chip } from '../type.js';
import { cam, inType, outType, in3D, addUpdater, pin } from '../stage.js';

const PACKS = [
  { label: '250 ml', h: 1.5 },
  { label: '500 ml', h: 2.6 },
  { label: '1 L',    h: 3.7 },
  { label: 'Multipack', h: 5.1 },
];
const X = [-6.6, -2.2, 2.2, 6.6];
/** Four retailers, four different responses to the same ladder. */
const ROWS = [
  { z: 3.0,  k: 1.00, color: PRIMARY },
  { z: 0.0,  k: 0.86, color: DEEP },
  { z: -3.0, k: 1.16, color: LIGHT },
  { z: -6.0, k: 0.93, color: NUM },
];

function buildRow({ k, color }) {
  const g = new THREE.Group();
  const nodes = [], posts = [], rules = [];

  PACKS.forEach((p, i) => {
    const h = p.h * k;
    const post = makePost(X[i], BORDER, 0.5);
    post.scale.y = h;

    const n = makeNode(color);
    n.position.set(X[i], h, 0);

    g.add(post, n);
    posts.push(post); nodes.push(n);
  });

  /* The measured gaps. These are the ladder. */
  for (let i = 0; i < PACKS.length - 1; i++) {
    const a = PACKS[i].h * k, b = PACKS[i + 1].h * k;
    const mid = (X[i] + X[i + 1]) / 2;
    const r = new THREE.Group();
    r.add(makeDashedLine(new THREE.Vector3(X[i], a, 0), new THREE.Vector3(mid, a, 0), NUM, 0.6, 0.16, 0.12));
    r.add(makeDashedLine(new THREE.Vector3(mid, a, 0), new THREE.Vector3(mid, b, 0), NUM, 0.75, 0.16, 0.12));
    r.add(makeDashedLine(new THREE.Vector3(mid, b, 0), new THREE.Vector3(X[i + 1], b, 0), NUM, 0.6, 0.16, 0.12));
    g.add(r);
    rules.push(r);
  }

  g.userData.setOpacity = (o) => {
    posts.forEach((p) => { p.material.opacity = 0.5 * o; });
    nodes.forEach((n) => n.userData.setOpacity(o));
    rules.forEach((r) => r.children.forEach((l) => { l.material.opacity = 0.65 * o; }));
  };
  g.userData.rules = rules;
  g.userData.nodes = nodes;
  g.userData.setRuleOpacity = (o) => rules.forEach((r) => r.children.forEach((l) => { l.material.opacity = 0.65 * o; }));
  g.userData.setOpacity(0);
  return g;
}

export function buildScene6(ctx) {
  const { scene, camera } = ctx;
  const tl = ctx.master;
  const T = 58.5;

  const group = new THREE.Group();
  group.visible = false;
  scene.add(group);

  const floor = new THREE.GridHelper(32, 22, BORDER, BORDER);
  floor.material = edgeMaterial(BORDER, 0.07);
  floor.position.z = -1.5;
  group.add(floor);

  const rows = ROWS.map((r) => {
    const g = buildRow(r);
    g.position.set(0, 0, r.z);
    group.add(g);
    return g;
  });
  const hero = rows[0];

  addUpdater((t) => { if (group.visible) group.position.y = Math.sin(t * 0.37) * 0.04; });

  /* ---------------- type ---------------- */
  const kLadder = kicker('Pack-price architecture', { x: 50, y: 12 });
  /* Pack labels are pinned to their own nodes. A fixed screen position drifts
     off the geometry as soon as the camera fans the ladder into depth. */
  const chips = PACKS.map((p, i) => {
    const c = chip(p.label, { x: 50, y: 50 });
    pin(c, hero.userData.nodes[i], camera, { dy: -52 });
    return c;
  });
  const sA = statement(
    'Keep the gaps logical, and shoppers trade <b>up</b>.<br>Get them wrong and they trade <b>out</b>.',
    { x: 50, y: 20, size: 42, weight: 300 }
  );
  const kRetail = kicker('Retailer &amp; channel view', { x: 50, y: 12 });
  const sB = statement(
    'The same move lands differently in every retailer.<br><b>So the price is set there &mdash; not as a national average.</b>',
    { x: 50, y: 85, size: 36, weight: 300, width: 76 }
  );

  /* ---------------- timeline ---------------- */
  tl.call(() => { group.visible = true; }, null, T - 0.2);
  camera.position.set(-1.5, 4.4, 20);
  cam(tl, camera, { x: 0.8, y: 3.6, z: 17.0, lx: 0, ly: 2.0, dur: 4.0, ease: EASE.move }, T);

  inType(tl, kLadder, T + 0.2, { dur: 0.6 });
  in3D(tl, hero, T + 0.3, { dur: 0.9 });
  hero.userData.setRuleOpacity(0);

  PACKS.forEach((p, i) => inType(tl, chips[i], T + 0.5 + i * 0.16, { dur: 0.5 }));

  /* The gaps are drawn only after the ladder exists — measure, don't decorate. */
  tl.to({ o: 0 }, {
    o: 1, duration: 1.0, ease: EASE.reveal,
    onUpdate: function () { hero.userData.setRuleOpacity(this.targets()[0].o); },
  }, T + 1.5);

  inType(tl, sA, T + 2.0);
  outType(tl, sA, T + 4.6);
  outType(tl, kLadder, T + 4.6, { dur: 0.5 });
  PACKS.forEach((p, i) => outType(tl, chips[i], T + 4.6 + i * 0.05, { dur: 0.5 }));

  /* The fan. Camera swings so depth reads as depth. */
  cam(tl, camera, { x: 6.4, y: 6.2, z: 20.5, lx: -1.8, ly: 2.6, lz: -1.5, dur: 5.0, ease: EASE.move }, T + 4.8);
  inType(tl, kRetail, T + 5.0, { dur: 0.6 });

  rows.slice(1).forEach((r, i) => {
    const at = T + 5.2 + i * 0.4;
    in3D(tl, r, at, { dur: 0.9, to: 0.82 });
    tl.fromTo(r.position, { z: ROWS[0].z }, { z: ROWS[i + 1].z, duration: 1.3, ease: EASE.settle }, at);
  });

  inType(tl, sB, T + 7.0);
  outType(tl, sB, T + 9.3, { dur: 0.6 });
  outType(tl, kRetail, T + 9.3, { dur: 0.6 });

  const fade = (o) => {
    floor.material.opacity = 0.07 * o;
    rows.forEach((r, i) => r.userData.setOpacity(o * (i === 0 ? 1 : 0.82)));
  };

  return { group, fade, end: T + 10 };
}
