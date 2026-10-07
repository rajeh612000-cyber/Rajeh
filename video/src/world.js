/**
 * The world.
 *
 * One rule governs every object in this film: it is built from the lattice in
 * the Smart Value mark. The logo is already an isometric translucent polyhedron
 * — glass faces, hairline emissive edges, glowing nodes, a dashed sightline and
 * a lens ring. We did not invent a visual language for this film. We extruded
 * the one the brand already owns.
 *
 *   A SKU is a node.  Price is the node's height.  The portfolio is a field of
 *   nodes.  An elasticity curve is a surface stretched between them.  The
 *   recommended price is where the lens ring lands.
 */

import * as THREE from 'three';
import { INK, VOID, PRIMARY, DEEP, LIGHT, NUM, BORDER, LILAC, WHITE, ACCENT, ROSE } from './brand.js';

/* Seeded RNG — the render must be byte-identical on every pass. */
let _seed = 20260507 >>> 0;
export function srand() {
  _seed = (_seed * 1664525 + 1013904223) >>> 0;
  return _seed / 4294967296;
}
export function reseed(s = 20260507) { _seed = s >>> 0; }

export const WIDTH = 1920;
export const HEIGHT = 1080;

export function createWorld(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    preserveDrawingBuffer: true,
  });
  renderer.setPixelRatio(1);
  renderer.setSize(WIDTH, HEIGHT, false);
  renderer.setClearColor(VOID, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  /* Fog in ink, not black: depth reads as brand, not as absence. */
  scene.fog = new THREE.Fog(VOID, 26, 92);

  const camera = new THREE.PerspectiveCamera(34, WIDTH / HEIGHT, 0.1, 400);
  camera.position.set(0, 3.2, 26);
  camera.lookAt(0, 0, 0);

  /* Soft, large, low-contrast. The site's shadow is 0 10px 28px rgba(83,74,183,.12):
     diffuse violet light, never a hard key. */
  scene.add(new THREE.AmbientLight(LILAC, 0.55));

  const key = new THREE.DirectionalLight(WHITE, 1.15);
  key.position.set(-8, 14, 12);
  scene.add(key);

  const fill = new THREE.DirectionalLight(PRIMARY, 0.9);
  fill.position.set(12, 4, 8);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(LIGHT, 0.7);
  rim.position.set(0, -6, -14);
  scene.add(rim);

  return { renderer, scene, camera };
}

/* ------------------------------------------------------------------ *
 * Materials — frosted glass and emissive hairlines. No chrome specular.
 * This should read as data under glass, not as a toy.
 * ------------------------------------------------------------------ */

export function glassMaterial(color = PRIMARY, opacity = 0.16) {
  return new THREE.MeshPhysicalMaterial({
    color,
    transparent: true,
    opacity,
    roughness: 0.32,
    metalness: 0.0,
    transmission: 0.0,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
}

export function edgeMaterial(color = BORDER, opacity = 0.9) {
  return new THREE.LineBasicMaterial({ color, transparent: true, opacity });
}

/**
 * Emissive fill. depthWrite is off: these are all transparent, and letting them
 * write depth makes nodes clip each other into hemispheres depending on draw
 * order — which is precisely what the first dailies pass showed.
 */
export function glowMaterial(color = PRIMARY, opacity = 1) {
  return new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false });
}

/**
 * A price post. A line, not a cylinder: a sub-pixel cylinder breaks into
 * dashes as the camera pulls back, and this camera pulls back a lot.
 */
export function makePost(x, color = BORDER, opacity = 0.55) {
  const geo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(x, 0, 0), new THREE.Vector3(x, 1, 0),
  ]);
  const line = new THREE.Line(geo, new THREE.LineBasicMaterial({
    color, transparent: true, opacity, depthWrite: false,
  }));
  line.userData.setHeight = (h) => { line.scale.y = Math.max(0.0001, h); };
  return line;
}

/* ------------------------------------------------------------------ *
 * Lattice primitives
 * ------------------------------------------------------------------ */

const NODE_GEO = new THREE.SphereGeometry(0.17, 20, 16);
const HALO_GEO = new THREE.SphereGeometry(0.34, 20, 16);

/** A node is a SKU. Core plus a soft halo so it reads at any camera height. */
export function makeNode(color = PRIMARY) {
  const g = new THREE.Group();
  const core = new THREE.Mesh(NODE_GEO, glowMaterial(color, 1));
  const halo = new THREE.Mesh(HALO_GEO, glowMaterial(color, 0.22));
  g.add(core, halo);
  g.userData.core = core;
  g.userData.halo = halo;
  g.userData.setColor = (c) => { core.material.color.setHex(c); halo.material.color.setHex(c); };
  g.userData.setOpacity = (o) => { core.material.opacity = o; halo.material.opacity = 0.22 * o; };
  return g;
}

/** A hairline edge between two points. */
export function makeEdge(a, b, color = BORDER, opacity = 0.75) {
  const geo = new THREE.BufferGeometry().setFromPoints([a, b]);
  return new THREE.Line(geo, edgeMaterial(color, opacity));
}

/** The mark's dashed sightline. */
export function makeDashedLine(a, b, color = NUM, opacity = 0.8, dash = 0.26, gap = 0.2) {
  const geo = new THREE.BufferGeometry().setFromPoints([a, b]);
  const mat = new THREE.LineDashedMaterial({ color, transparent: true, opacity, dashSize: dash, gapSize: gap });
  const line = new THREE.Line(geo, mat);
  line.computeLineDistances();
  return line;
}

/** The lens ring at the centre of the mark. This is what lands on a price. */
export function makeLensRing(radius = 0.62, color = PRIMARY, discOpacity = 0.5) {
  const g = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.045, 14, 56), glowMaterial(color, 1));
  const disc = new THREE.Mesh(new THREE.CircleGeometry(radius - 0.1, 40), glowMaterial(WHITE, discOpacity));
  disc.position.z = 0.001;
  const bar = new THREE.Mesh(new THREE.PlaneGeometry(radius * 0.62, 0.075), glowMaterial(color, 1));
  bar.position.z = 0.004;
  g.add(ring, disc, bar);
  g.userData.setOpacity = (o) => {
    ring.material.opacity = o; disc.material.opacity = discOpacity * o; bar.material.opacity = o;
  };
  return g;
}

/**
 * A translucent glass panel carrying the signature cut corner
 * (three rounded, one sharp at bottom-left) — the --svp-radius shape, in 3D.
 */
export function makeCutPanel(w, h, color = PRIMARY, opacity = 0.15, r = 0.34) {
  const s = new THREE.Shape();
  const x = -w / 2, y = -h / 2;
  s.moveTo(x, y);                                    // sharp bottom-left
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y);

  const geo = new THREE.ShapeGeometry(s, 12);
  const mesh = new THREE.Mesh(geo, glassMaterial(color, opacity));

  const pts = s.getPoints(64).map((p) => new THREE.Vector3(p.x, p.y, 0));
  const outline = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(pts),
    edgeMaterial(BORDER, 0.55)
  );
  outline.position.z = 0.002;

  const g = new THREE.Group();
  g.add(mesh, outline);
  g.userData.setOpacity = (o) => { mesh.material.opacity = opacity * o; outline.material.opacity = 0.55 * o; };
  return g;
}

/**
 * A price-response surface: volume falling as price rises, with a per-SKU
 * elasticity. The whole argument of the product is that this shape is
 * different for every node — so the shape is a parameter, never a constant.
 */
export function makeResponseCurve(elasticity = 1.4, color = PRIMARY, span = 4.2, height = 2.4, segments = 72) {
  const pts = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const x = (t - 0.5) * span;
    const y = Math.pow(1 - t, elasticity) * height - height * 0.5;
    pts.push(new THREE.Vector3(x, y, 0));
  }
  const curve = new THREE.CatmullRomCurve3(pts);
  const geo = new THREE.TubeGeometry(curve, segments, 0.035, 8, false);
  const line = new THREE.Mesh(geo, glowMaterial(color, 0.95));

  /* The skirt under the curve: the volume it is giving up. */
  const skirtPts = [];
  for (let i = 0; i <= segments; i++) {
    const p = pts[i];
    skirtPts.push(p.x, p.y, 0, p.x, -height * 0.5, 0);
  }
  const skirtGeo = new THREE.BufferGeometry();
  skirtGeo.setAttribute('position', new THREE.Float32BufferAttribute(skirtPts, 3));
  const idx = [];
  for (let i = 0; i < segments; i++) {
    const a = i * 2, b = a + 1, c = a + 2, d = a + 3;
    idx.push(a, b, c, b, d, c);
  }
  skirtGeo.setIndex(idx);
  skirtGeo.computeVertexNormals();
  const skirt = new THREE.Mesh(skirtGeo, glassMaterial(color, 0.12));

  const g = new THREE.Group();
  g.add(line, skirt);
  g.userData.setOpacity = (o) => { line.material.opacity = 0.95 * o; skirt.material.opacity = 0.12 * o; };
  g.userData.setColor = (c) => { line.material.color.setHex(c); skirt.material.color.setHex(c); };
  return g;
}

/** A measured bar. Grows from its base, never from its centre. */
export function makeBar(w = 0.5, d = 0.5, color = PRIMARY, opacity = 0.42) {
  const geo = new THREE.BoxGeometry(w, 1, d);
  geo.translate(0, 0.5, 0);
  const mesh = new THREE.Mesh(geo, glassMaterial(color, opacity));
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), edgeMaterial(BORDER, 0.5));

  const g = new THREE.Group();
  g.add(mesh, edges);
  g.userData.setValue = (v) => { g.scale.y = Math.max(0.0001, Math.abs(v)); g.rotation.x = v < 0 ? Math.PI : 0; };
  g.userData.setColor = (c) => { mesh.material.color.setHex(c); };
  g.userData.setOpacity = (o) => { mesh.material.opacity = opacity * o; edges.material.opacity = 0.5 * o; };
  return g;
}

/** The dashed guardrail plane: volume no worse than −2%. */
export function makeGuardrail(w = 16, d = 9, color = NUM) {
  const g = new THREE.Group();
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(w, d), glassMaterial(color, 0.07));
  plane.rotation.x = -Math.PI / 2;
  g.add(plane);
  for (let i = -4; i <= 4; i++) {
    const z = (i / 4) * (d / 2);
    const l = makeDashedLine(new THREE.Vector3(-w / 2, 0, z), new THREE.Vector3(w / 2, 0, z), color, 0.5, 0.3, 0.26);
    g.add(l);
  }
  g.userData.setOpacity = (o) => {
    g.traverse((c) => { if (c.material) c.material.opacity = (c.isMesh ? 0.07 : 0.5) * o; });
  };
  g.userData.setColor = (c) => { g.traverse((o) => { if (o.material) o.material.color.setHex(c); }); };
  return g;
}

/**
 * The mark itself: an isometric hexagonal lattice with four lit nodes and a
 * dashed sightline through the middle. The film resolves into this.
 */
export function makeMarkLattice() {
  const g = new THREE.Group();
  const R = 2.6;
  const hex = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i + Math.PI / 6;
    hex.push(new THREE.Vector3(Math.cos(a) * R, Math.sin(a) * R, 0));
  }
  const depth = 1.15;
  const back = hex.map((p) => new THREE.Vector3(p.x, p.y, -depth));

  for (let i = 0; i < 6; i++) {
    const j = (i + 1) % 6;
    g.add(makeEdge(hex[i], hex[j], BORDER, 0.85));
    g.add(makeEdge(back[i], back[j], BORDER, 0.22));
    g.add(makeEdge(hex[i], back[i], BORDER, 0.2));
  }

  /* Translucent faces, alternating the two tints of the mark. */
  for (let i = 0; i < 6; i++) {
    const j = (i + 1) % 6;
    const geo = new THREE.BufferGeometry().setFromPoints([hex[i], hex[j], new THREE.Vector3(0, 0, 0)]);
    geo.setIndex([0, 1, 2]);
    geo.computeVertexNormals();
    g.add(new THREE.Mesh(geo, glassMaterial(i % 2 ? LIGHT : DEEP, 0.24)));
  }

  const lit = [0, 2, 3, 5];
  lit.forEach((i) => {
    const n = makeNode(PRIMARY);
    n.position.copy(hex[i]);
    g.add(n);
  });

  g.add(makeDashedLine(hex[3], hex[0], NUM, 0.85));
  const lens = makeLensRing(0.55, PRIMARY, 0.9);
  lens.position.set(-R * 0.42, 0, 0.02);
  g.add(lens);

  return g;
}

/** Ambient dust. Depth cue only — never a particle show. */
export function makeDust(count = 260, spread = 46) {
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i * 3 + 0] = (srand() - 0.5) * spread;
    pos[i * 3 + 1] = (srand() - 0.5) * spread * 0.5;
    pos[i * 3 + 2] = (srand() - 0.5) * spread;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ color: NUM, size: 0.055, transparent: true, opacity: 0.5, sizeAttenuation: true });
  return new THREE.Points(geo, mat);
}

/**
 * Build an opacity setter for a whole subtree.
 *
 * Two rules, both learned the hard way in dailies:
 *  - Stop descending at any object that owns a setOpacity. Walking past it
 *    double-applies the fade, and if that object was built hidden, the walker
 *    captures a base of 0 and the thing never comes back.
 *  - Capture base opacities once, at construction, before anything animates.
 */
export function deepOpacity(root) {
  const owners = [];
  const mats = [];
  (function walk(o) {
    for (const c of o.children) {
      if (c.userData.setOpacity) { owners.push(c); continue; }
      if (c.material && 'opacity' in c.material) mats.push({ m: c.material, base: c.material.opacity });
      walk(c);
    }
  })(root);
  return (v) => {
    for (const o of owners) o.userData.setOpacity(v);
    for (const { m, base } of mats) m.opacity = base * v;
  };
}

export { THREE };
