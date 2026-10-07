/**
 * Scene 7 — Resolve.  1:08.5 – 1:18
 *
 * The payoff was free. The Smart Value mark is already an isometric translucent
 * lattice with lit nodes, a dashed sightline and a lens ring — the exact world
 * this film has been built in for seventy seconds. So the end is not a logo
 * bumper stuck on the back. The scene simply rotates the lattice square to
 * camera, and it is the logo.
 *
 * The second and last orange moment is the CTA.
 */

import { THREE, makeMarkLattice, deepOpacity } from '../world.js';
import { EASE } from '../brand.js';
import { cam, inType, addUpdater } from '../stage.js';

export function buildScene7(ctx) {
  const { scene, camera } = ctx;
  const tl = ctx.master;
  const T = 68.5;

  const group = new THREE.Group();
  group.visible = false;
  scene.add(group);

  const mark = makeMarkLattice();
  mark.scale.setScalar(1.15);
  mark.rotation.set(0.5, -0.9, 0.1);
  group.add(mark);

  const setOpacity = deepOpacity(mark);
  setOpacity(0);
  group.userData.setOpacity = setOpacity;

  /* The only idle left in the film: a slow settle rather than a spin. */
  addUpdater((t) => {
    if (!group.visible) return;
    group.position.y = Math.sin(t * 0.4) * 0.06;
  });

  const lockup = document.getElementById('lockup');
  const sub = lockup.querySelector('.sub');
  const cta = lockup.querySelector('.cta');
  const host = lockup.querySelector('.host');

  /* ---------------- timeline ---------------- */
  tl.call(() => { group.visible = true; }, null, T - 0.3);
  camera.position.set(4, 2.4, 20);
  cam(tl, camera, { x: 0, y: 0, z: 13.5, lx: 0, ly: 0, dur: 4.6, ease: EASE.move }, T);

  tl.to({ o: 0 }, { o: 1, duration: 1.3, ease: EASE.reveal, onUpdate: function () { setOpacity(this.targets()[0].o); } }, T + 0.2);

  /* Square to camera. The mark assembles itself out of the film's own geometry. */
  tl.to(mark.rotation, { x: 0, y: 0, z: 0, duration: 2.8, ease: EASE.move }, T + 1.0);
  tl.to(mark.scale, { x: 0.92, y: 0.92, z: 0.92, duration: 2.8, ease: EASE.move }, T + 1.0);

  /* Hand off from the 3D mark to the real lock-up. */
  tl.to({ o: 1 }, { o: 0, duration: 1.2, ease: EASE.move, onUpdate: function () { setOpacity(this.targets()[0].o); } }, T + 3.9);
  tl.fromTo(lockup, { opacity: 0 }, { opacity: 1, duration: 1.1, ease: EASE.reveal }, T + 4.1);
  tl.fromTo(lockup.querySelector('img'), { y: 18 }, { y: 0, duration: 1.2, ease: EASE.reveal }, T + 4.1);

  inType2(sub, T + 5.0);
  inType2(cta, T + 5.9);
  inType2(host, T + 6.6);

  /* Out on ink, not on black. */
  tl.to(lockup, { opacity: 0, duration: 1.0, ease: 'power2.in' }, T + 8.4);

  return { group, fade: setOpacity, end: T + 9.5 };

  function inType2(el, at) {
    tl.fromTo(el, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.8, ease: EASE.reveal }, at);
  }
}
