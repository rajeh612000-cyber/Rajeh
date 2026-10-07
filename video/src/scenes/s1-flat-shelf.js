/**
 * Scene 1 — The flat shelf.  0:00 – 0:08.5
 *
 * Open on the thing the buyer already does. Thirteen SKUs, one height, one
 * decision. The blanket increase lifts every post by exactly the same amount,
 * which is the point: it is a move made without information. Then four of them
 * lose their shoppers, and only those four pay for it.
 *
 * No product, no logo, no promise. Thirty years of this says you earn the right
 * to show the solution by showing the problem honestly first.
 */

import { THREE, makeNode, makePost, makeDashedLine } from '../world.js';
import { PRIMARY, NUM, BORDER, ROSE, ROSE_SOFT, EASE } from '../brand.js';
import { statement, kicker } from '../type.js';
import { cam, inType, outType, in3D, addUpdater } from '../stage.js';

const COUNT = 13;
const SPAN = 17;
const SHELF = 2.3;
/** The four that lose shoppers. Chosen to read as scattered, not patterned. */
const LOSERS = [1, 4, 7, 11];

export function buildScene1(ctx) {
  const { scene, camera } = ctx;
  const group = new THREE.Group();
  scene.add(group);

  const posts = [];

  /* Baseline: the shelf everything is measured from. */
  const base = makeDashedLine(
    new THREE.Vector3(-SPAN / 2 - 1, 0, 0),
    new THREE.Vector3(SPAN / 2 + 1, 0, 0),
    NUM, 0.55
  );
  group.add(base);

  for (let i = 0; i < COUNT; i++) {
    const x = -SPAN / 2 + (SPAN / (COUNT - 1)) * i;
    const g = new THREE.Group();
    g.position.x = x;

    const post = makePost(0, BORDER, 0.55);
    post.scale.y = SHELF;

    const node = makeNode(PRIMARY);
    node.position.y = SHELF;

    g.add(post, node);
    group.add(g);
    posts.push({ g, post, node, x });
  }

  group.userData.setOpacity = (o) => {
    base.material.opacity = 0.55 * o;
    posts.forEach((p) => { p.post.material.opacity = 0.55 * o; p.node.userData.setOpacity(o); });
  };
  group.userData.setOpacity(0);

  /* A barely-there breath on the whole row. Pure function of absolute time. */
  addUpdater((t) => {
    if (!group.visible) return;
    group.position.y = Math.sin(t * 0.42) * 0.045;
  });

  /* ---------------- type ---------------- */
  const s1 = statement(
    'Most price decisions still start from<br><b>last year&rsquo;s list price.</b>',
    { x: 50, y: 74, size: 50 }
  );
  const k1 = kicker('Blanket +5% across the range', { x: 50, y: 20, color: 'var(--num)' });
  const s2 = statement(
    'Easy to agree on.<br><b>Expensive to get wrong.</b>',
    { x: 50, y: 74, size: 54 }
  );

  /* ---------------- timeline ---------------- */
  const tl = ctx.master;
  const T = 0;

  camera.position.set(-2.4, 2.9, 31);
  tl.call(() => { group.visible = true; }, null, T);

  in3D(tl, group, T + 0.25, { dur: 1.4 });
  cam(tl, camera, { x: 2.0, y: 3.1, z: 23.5, ly: 2.0, dur: 8.2, ease: 'none' }, T + 0.2);

  /* Posts rise left to right. They all land at the same height — that identity
     is the whole opening statement. */
  posts.forEach((p, i) => {
    tl.fromTo(p.post.scale, { y: 0.001 }, { y: SHELF, duration: 0.85, ease: EASE.settle }, T + 0.4 + i * 0.055);
    tl.fromTo(p.node.position, { y: 0 }, { y: SHELF, duration: 0.85, ease: EASE.settle }, T + 0.4 + i * 0.055);
  });

  inType(tl, s1, T + 2.5);
  outType(tl, s1, T + 4.6);

  /* The blanket move: every post, the same lift, at the same instant. */
  inType(tl, k1, T + 4.5, { dur: 0.6 });
  posts.forEach((p) => {
    tl.to(p.post.scale, { y: SHELF + 0.5, duration: 0.7, ease: EASE.snap }, T + 4.9);
    tl.to(p.node.position, { y: SHELF + 0.5, duration: 0.7, ease: EASE.snap }, T + 4.9);
  });

  /* And four of them lose their shoppers. The move was uniform; the damage is not. */
  LOSERS.forEach((i, n) => {
    const p = posts[i];
    const at = T + 5.7 + n * 0.16;
    tl.call(() => p.node.userData.setColor(n === 0 ? ROSE : ROSE_SOFT), null, at);
    tl.to(p.post.scale, { y: 0.55, duration: 0.9, ease: 'power3.in' }, at);
    tl.to(p.node.position, { y: 0.55, duration: 0.9, ease: 'power3.in' }, at);
    tl.to(p.post.material, { opacity: 0.22, duration: 0.9 }, at);
  });

  inType(tl, s2, T + 6.5);
  outType(tl, k1, T + 7.9);
  outType(tl, s2, T + 8.0);

  /* Scene-level fade, used by the assembler at the hand-off to scene 3.
     Each scene owns the list of things it must take off screen. */
  const fade = (o) => {
    group.userData.setOpacity(o);
    group.userData._extra?.forEach((f) => f(o));
  };
  group.userData._extra = [];

  return { group, posts, fade, end: T + 8.5 };
}
