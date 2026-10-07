/**
 * Scene 3 — The standoff.  0:21 – 0:32
 *
 * Three blades of glass meeting on one axis: revenue, margin, volume.
 *
 * The first cut used three mutually perpendicular planes — the obvious diagram —
 * and it failed in the dailies: a camera that never stops moving will always
 * catch one of them edge-on, and an edge-on plane is a sliver. Vertical vanes at
 * 120 degrees failed the same way for the same reason.
 *
 * So they are tilted outward from the spine, like the facets of the mark. Seen
 * from above the horizon all three read at once, whatever the dolly is doing,
 * and the arrangement is the brand's own isometric geometry rather than a
 * borrowed chart. They say the thing the scene needs: one move, measured three
 * ways, by three people who do not agree.
 *
 * Then they flex against each other. Push margin and volume bends. The scene
 * resolves not by one axis winning but by all three locking square, and a solid
 * appearing at the hub where they finally agree. That solid is the product, and
 * this is the first time the film shows it.
 */

import { THREE, glassMaterial, edgeMaterial, makeCutPanel, makeEdge } from '../world.js';
import { PRIMARY, DEEP, NUM, BORDER, EASE } from '../brand.js';
import { statement, kicker } from '../type.js';
import { cam, inType, outType, in3D, addUpdater, pin } from '../stage.js';

const W = 4.6, H = 5.2;

/**
 * How far the outer edge of each facet drops below the hub.
 *
 * Kept shallow on purpose. Steepen it and the facet pointing away from camera
 * goes edge-on again — the angle between the camera and a facet's normal swings
 * by twice the tilt as the bearing turns, so a near-flat pinwheel is the only
 * arrangement where all three stay readable through a moving shot. It also puts
 * the scene in the mark's own flat isometric geometry.
 */
const TILT = -0.25;

/**
 * One facet.
 *
 * Three nested pivots rather than one Euler triple, because the order matters
 * and nesting makes it readable: swing to the bearing, tip the arm down, then
 * lay the panel flat so it behaves like a roof facet instead of a diamond
 * spinning in its own plane. (The diamond is what one combined Euler gave us,
 * and it looked exactly as wrong as it sounds.)
 */
function blade(color, bearing) {
  const pivot = new THREE.Group();      // bearing around the spine
  pivot.rotation.y = bearing;

  const arm = new THREE.Group();        // tip the outward arm down
  arm.rotation.z = TILT;
  pivot.add(arm);

  const flat = new THREE.Group();       // lay the panel into the horizontal
  flat.rotation.x = -Math.PI / 2;
  arm.add(flat);

  const panel = makeCutPanel(W, H, color, 0.17, 0.42);
  panel.position.x = W / 2 + 0.9;
  flat.add(panel);

  /* A few hairline ribs instead of a grid: measurement, not graph paper. */
  const ribs = new THREE.Group();
  for (let i = 1; i <= 3; i++) {
    const y = -H / 2 + (H / 4) * i;
    ribs.add(makeEdge(
      new THREE.Vector3(0.9, y, 0),
      new THREE.Vector3(W + 0.9, y, 0),
      BORDER, 0.16
    ));
  }
  flat.add(ribs);

  /* The anchor the label is pinned to, so the name tracks its own blade. */
  const anchor = new THREE.Object3D();
  anchor.position.set(W + 0.9, 0, 0);
  flat.add(anchor);

  pivot.userData.anchor = anchor;
  pivot.userData.setOpacity = (o) => {
    panel.userData.setOpacity(o);
    ribs.children.forEach((l) => { l.material.opacity = 0.16 * o; });
  };
  pivot.userData.setOpacity(0);
  return pivot;
}

export function buildScene3(ctx) {
  const { scene, camera } = ctx;
  const tl = ctx.master;
  const T = 21;

  const group = new THREE.Group();
  group.visible = false;
  scene.add(group);

  const BEARING = [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3];
  const revenue = blade(PRIMARY, BEARING[0]);
  const margin  = blade(DEEP,    BEARING[1]);
  const volume  = blade(NUM,     BEARING[2]);
  group.add(revenue, margin, volume);

  /* The spine they all hinge on. */
  const spine = makeEdge(new THREE.Vector3(0, -1.4, 0), new THREE.Vector3(0, 1.4, 0), BORDER, 0.22);
  group.add(spine);

  /* Where all three agree. Appears only once they stop fighting. */
  const solidGeo = new THREE.BoxGeometry(2.7, 2.7, 2.7);
  const solid = new THREE.Mesh(solidGeo, glassMaterial(PRIMARY, 0.34));
  const solidEdges = new THREE.LineSegments(new THREE.EdgesGeometry(solidGeo), edgeMaterial(BORDER, 0.9));
  const solidGroup = new THREE.Group();
  solidGroup.add(solid, solidEdges);
  solidGroup.userData.setOpacity = (o) => { solid.material.opacity = 0.34 * o; solidEdges.material.opacity = 0.9 * o; };
  solidGroup.position.y = 1.8;
  solidGroup.userData.setOpacity(0);
  group.add(solidGroup);

  addUpdater((t) => {
    if (!group.visible) return;
    solidGroup.rotation.y = t * 0.22;
    solidGroup.rotation.x = Math.sin(t * 0.3) * 0.16;
    /* The whole assembly turns slowly, so no vane is ever lost to the camera. */
    group.rotation.y = -0.2 + Math.sin((t - T) * 0.13) * 0.2;
  });

  /* ---------------- type ---------------- */
  const kRev = kicker('Revenue', { x: 50, y: 50, color: '#9b8dff' });
  const kMar = kicker('Margin',  { x: 50, y: 50, color: '#8f86e8' });
  const kVol = kicker('Volume',  { x: 50, y: 50, color: 'var(--num)' });
  pin(kRev, revenue.userData.anchor, camera, { dy: -24 });
  pin(kMar, margin.userData.anchor, camera, { dy: -24 });
  pin(kVol, volume.userData.anchor, camera, { dy: -24 });

  const sA = statement('Finance pushes margin.<br>Sales defends volume.', { x: 50, y: 17, size: 44, weight: 300 });
  const sB = statement('And nobody can put the trade-off in numbers<br><b>both sides accept.</b>', { x: 50, y: 17, size: 42 });
  const kOut = kicker('One model. One set of numbers.', { x: 50, y: 88, color: 'var(--border)', size: 17 });

  /* ---------------- timeline ---------------- */
  cam(tl, camera, { x: 7.5, y: 12.0, z: 12.0, lx: 0, ly: -0.3, dur: 5.6, ease: EASE.move }, T);

  in3D(tl, revenue, T + 0.2, { dur: 1.0 });
  inType(tl, kRev, T + 0.6, { dur: 0.6 });
  in3D(tl, margin, T + 1.0, { dur: 1.0 });
  inType(tl, kMar, T + 1.4, { dur: 0.6 });
  in3D(tl, volume, T + 1.8, { dur: 1.0 });
  inType(tl, kVol, T + 2.2, { dur: 0.6 });

  inType(tl, sA, T + 2.9);

  /* The fight. Each push on one blade bends another. Two rounds, no winner. */
  tl.to(margin.rotation,  { y: BEARING[1] + 0.34, duration: 1.0, ease: EASE.move }, T + 4.3);
  tl.to(volume.rotation,  { y: BEARING[2] - 0.30, duration: 1.0, ease: EASE.move }, T + 4.5);
  tl.to(revenue.rotation, { y: BEARING[0] - 0.26, duration: 1.0, ease: EASE.move }, T + 5.1);
  tl.to(margin.rotation,  { y: BEARING[1] - 0.22, duration: 1.0, ease: EASE.move }, T + 5.6);
  tl.to(volume.rotation,  { y: BEARING[2] + 0.28, duration: 1.0, ease: EASE.move }, T + 6.0);

  outType(tl, sA, T + 5.6);
  inType(tl, sB, T + 5.9);

  /* They lock square. */
  cam(tl, camera, { x: -6.0, y: 10.5, z: 11.5, lx: 0, ly: -0.3, dur: 4.2, ease: EASE.move }, T + 6.4);
  tl.to(revenue.rotation, { y: BEARING[0], duration: 1.1, ease: EASE.snap }, T + 7.3);
  tl.to(margin.rotation,  { y: BEARING[1], duration: 1.1, ease: EASE.snap }, T + 7.3);
  tl.to(volume.rotation,  { y: BEARING[2], duration: 1.1, ease: EASE.snap }, T + 7.3);

  in3D(tl, solidGroup, T + 7.9, { dur: 1.1, ease: EASE.settle });
  tl.fromTo(solidGroup.scale, { x: 0.01, y: 0.01, z: 0.01 }, { x: 1, y: 1, z: 1, duration: 1.2, ease: EASE.settle }, T + 7.9);

  outType(tl, sB, T + 8.4);
  inType(tl, kOut, T + 8.9, { dur: 0.8 });

  outType(tl, kRev, T + 10.1, { dur: 0.5 });
  outType(tl, kMar, T + 10.15, { dur: 0.5 });
  outType(tl, kVol, T + 10.2, { dur: 0.5 });
  outType(tl, kOut, T + 10.3, { dur: 0.5 });

  const fade = (o) => {
    revenue.userData.setOpacity(o);
    margin.userData.setOpacity(o);
    volume.userData.setOpacity(o);
    solidGroup.userData.setOpacity(o);
    spine.material.opacity = 0.35 * o;
  };

  return { group, solidGroup, fade, end: T + 11 };
}
