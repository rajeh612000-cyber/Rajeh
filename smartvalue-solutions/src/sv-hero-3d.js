/* ==========================================================================
   Smart Value – solution-page motion
   1) Scroll reveal for .sv-reveal blocks (progressive: content is visible
      without JS, so crawlers and no-JS users always see it).
   2) Three.js hero scenes, one per page:
        <canvas data-sv-scene="price|promo|category"></canvas>
      Three.js is imported only after window.load + idle, so it never
      competes with the page's LCP element (the H1), and the canvas sits in
      a fixed aspect-ratio box, so there is zero layout shift.
   ========================================================================== */

const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.181.0/build/three.module.min.js';
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- 1. Scroll reveal ---------- */
(() => {
  const els = document.querySelectorAll('.sv-page .sv-reveal');
  if (!els.length || !('IntersectionObserver' in window) || REDUCED) return;
  document.querySelectorAll('.sv-page').forEach((p) => p.classList.add('sv-js'));
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  els.forEach((el) => io.observe(el));
})();

/* ---------- 2. Hero scenes ---------- */
const canvases = document.querySelectorAll('canvas[data-sv-scene]');
if (canvases.length) {
  const start = () => (window.requestIdleCallback
    ? requestIdleCallback(boot, { timeout: 2500 })
    : setTimeout(boot, 1200));
  if (document.readyState === 'complete') start();
  else addEventListener('load', start, { once: true });
}

async function boot() {
  let THREE;
  try { THREE = await import(THREE_URL); } catch { return; } // static gradient stays as fallback
  canvases.forEach((c) => mount(THREE, c));
}

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const damp = (dt, rate) => 1 - Math.exp(-dt * rate);

function rng(seed) { // small deterministic PRNG so each cycle is varied but stable
  return () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
}

function dotTexture(THREE) {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, 'rgba(255,255,255,1)');
  grd.addColorStop(0.45, 'rgba(255,255,255,.9)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function mount(THREE, canvas) {
  const build = SCENES[canvas.dataset.svScene];
  if (!build) return;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
  } catch { return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setClearColor(0x000000, 0);

  const css = getComputedStyle(canvas);
  const col = (name, fallback) => new THREE.Color((css.getPropertyValue(name) || '').trim() || fallback);
  const pal = {
    ink: col('--sv-ink', '#1e1b4b'),
    primary: col('--sv-primary', '#6d4aff'),
    deep: col('--sv-deep', '#4f3cc9'),
    light: col('--sv-light', '#8b5cf6'),
    lilac: col('--sv-lilac', '#efebfe'),
    accent: col('--sv-accent', '#f5a524'),
    soft: new THREE.Color('#cdbfff'),
    pale: new THREE.Color('#e6e3f1'),
  };

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  scene.add(new THREE.HemisphereLight(0xffffff, pal.lilac, 1.6));
  const sun = new THREE.DirectionalLight(0xffffff, 1.5);
  sun.position.set(3, 6, 4);
  scene.add(sun);

  const s = build(THREE, scene, pal);
  const camDir = s.cam.clone().sub(s.target);
  let fit = 1;

  const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
  canvas.parentElement.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    pointer.y = ((e.clientY - r.top) / r.height) * 2 - 1;
  });
  canvas.parentElement.addEventListener('pointerleave', () => { pointer.x = pointer.y = 0; });

  const place = (dt) => {
    pointer.sx += (pointer.x - pointer.sx) * damp(dt, 3);
    pointer.sy += (pointer.y - pointer.sy) * damp(dt, 3);
    camera.position.copy(s.target).addScaledVector(camDir, fit);
    camera.position.x += pointer.sx * 0.5;
    camera.position.y -= pointer.sy * 0.3;
    camera.lookAt(s.target);
  };

  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    fit = camera.aspect < 1.15 ? 1.15 / camera.aspect : 1; // step back on narrow screens
    camera.updateProjectionMatrix();
    if (!running) { place(0); renderer.render(scene, camera); }
  };

  let running = false, visible = false, last = 0, t = 0;

  if (REDUCED) { // settle into one representative frame, no animation
    for (let i = 0; i < 120; i++) s.update((t += 1 / 30), 1 / 30);
    new ResizeObserver(resize).observe(canvas);
    resize();
    return;
  }

  const frame = (now) => {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    t += dt;
    s.update(t, dt);
    place(dt);
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  };
  const setRunning = () => {
    const should = visible && !document.hidden;
    if (should && !running) { running = true; last = performance.now(); requestAnimationFrame(frame); }
    else if (!should) running = false;
  };

  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; setRunning(); }).observe(canvas);
  document.addEventListener('visibilitychange', setRunning);
  resize();
}

/* ==========================================================================
   Scenes. Each returns { cam, target, update(t, dt) }.
   ========================================================================== */
const SCENES = {

  /* Price Optimizer: a revenue-response landscape across price points.
     The orange marker keeps finding the peak as demand conditions shift. */
  price(THREE, scene, pal) {
    const group = new THREE.Group();
    scene.add(group);

    const W = 6, D = 4, SX = 60, SZ = 40;
    const geo = new THREE.PlaneGeometry(W, D, SX, SZ);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    group.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
      vertexColors: true, transparent: true, opacity: 0.2, side: THREE.DoubleSide, depthWrite: false,
    })));
    group.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
      color: pal.light, wireframe: true, transparent: true, opacity: 0.14, depthWrite: false,
    })));
    group.add(new THREE.Points(geo, new THREE.PointsMaterial({
      size: 0.075, map: dotTexture(THREE), vertexColors: true, transparent: true, depthWrite: false,
    })));

    const FLOOR = -0.35;
    const grid = new THREE.GridHelper(W, 12, pal.soft, pal.soft);
    grid.position.y = FLOOR;
    grid.material.transparent = true;
    grid.material.opacity = 0.45;
    group.add(grid);

    const marker = new THREE.Mesh(new THREE.SphereGeometry(0.1, 32, 16), new THREE.MeshBasicMaterial({ color: pal.accent }));
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({
      map: dotTexture(THREE), color: pal.accent, transparent: true, opacity: 0.35, depthWrite: false,
    }));
    halo.scale.setScalar(0.6);
    marker.add(halo);
    group.add(marker);

    const dropGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
    const drop = new THREE.Line(dropGeo, new THREE.LineBasicMaterial({ color: pal.accent, transparent: true, opacity: 0.7 }));
    group.add(drop);
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.12, 0.16, 48), new THREE.MeshBasicMaterial({
      color: pal.accent, transparent: true, opacity: 0.8, side: THREE.DoubleSide, depthWrite: false,
    }));
    ring.rotation.x = -Math.PI / 2;
    group.add(ring);

    const A = 1.45, tmp = new THREE.Color(), peak = new THREE.Vector3(0.5, A, 0);
    marker.position.copy(peak);

    return {
      cam: new THREE.Vector3(0.4, 3.3, 7.3),
      target: new THREE.Vector3(0, 0.35, 0),
      update(t, dt) {
        const px = 0.4 + 0.95 * Math.sin(t * 0.23);         // where the optimum sits this "season"
        const pz = 0.55 * Math.sin(t * 0.17 + 1.3);
        let best = -Infinity;
        for (let i = 0; i < pos.count; i++) {
          const x = pos.getX(i), z = pos.getZ(i);
          const sx = x < px ? 1.3 : 0.75;                  // revenue falls faster above the optimum
          const h = A * Math.exp(-((x - px) ** 2) / (2 * sx * sx)) * Math.exp(-((z - pz) ** 2) / 5)
            + 0.05 * Math.sin(1.7 * x + t * 0.9) * Math.cos(1.3 * z + t * 0.6);
          pos.setY(i, h);
          tmp.copy(pal.soft).lerp(pal.primary, clamp01(h / A));
          if (h > A * 0.9) tmp.lerp(pal.deep, (h / A - 0.9) * 6);
          colors[i * 3] = tmp.r; colors[i * 3 + 1] = tmp.g; colors[i * 3 + 2] = tmp.b;
          if (h > best) { best = h; peak.set(x, h, z); }
        }
        pos.needsUpdate = true;
        geo.attributes.color.needsUpdate = true;

        marker.position.lerp(peak.setY(peak.y + 0.12), damp(dt, 4));
        halo.scale.setScalar(0.55 + 0.12 * Math.sin(t * 3));
        const p = dropGeo.attributes.position;
        p.setXYZ(0, marker.position.x, marker.position.y, marker.position.z);
        p.setXYZ(1, marker.position.x, FLOOR, marker.position.z);
        p.needsUpdate = true;
        ring.position.set(marker.position.x, FLOOR + 0.005, marker.position.z);
        ring.scale.setScalar(1 + 0.25 * Math.sin(t * 3));
        group.rotation.y = -0.18 + 0.2 * Math.sin(t * 0.12);
      },
    };
  },

  /* Promotion Planner: weeks × promotions. Lilac = baseline, purple =
     incremental uplift, orange = the best-ROI promotion this cycle. */
  promo(THREE, scene, pal) {
    const group = new THREE.Group();
    scene.add(group);
    const ROWS = 5, COLS = 12, GAP = 0.46, N = ROWS * COLS;
    const box = new THREE.BoxGeometry(0.3, 1, 0.3).translate(0, 0.5, 0);
    const mat = new THREE.MeshStandardMaterial({ roughness: 0.55, metalness: 0 });
    const base = new THREE.InstancedMesh(box, mat, N);
    const lift = new THREE.InstancedMesh(box, mat.clone(), N);
    group.add(base, lift);

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(COLS * GAP + 0.6, ROWS * GAP * 1.6 + 0.6),
      new THREE.MeshBasicMaterial({ color: pal.lilac, transparent: true, opacity: 0.9 }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.002;
    group.add(floor);
    const strip = new THREE.Mesh(new THREE.PlaneGeometry(COLS * GAP + 0.3, GAP * 1.2),
      new THREE.MeshBasicMaterial({ color: pal.accent, transparent: true, opacity: 0.16, depthWrite: false }));
    strip.rotation.x = -Math.PI / 2;
    strip.position.y = 0.002;
    group.add(strip);

    const cur = Array.from({ length: N }, () => ({ b: 0, u: 0 }));
    const tgt = Array.from({ length: N }, () => ({ b: 0, u: 0 }));
    const liftCol = Array.from({ length: ROWS }, () => pal.soft.clone());
    const liftTgt = Array.from({ length: ROWS }, () => pal.soft.clone());
    const baseCol = pal.soft.clone().lerp(new THREE.Color('#ffffff'), 0.35);
    let cycle = -1, bestRow = 0;
    const m = new THREE.Matrix4(), c = new THREE.Color();
    const xAt = (col) => (col - (COLS - 1) / 2) * GAP;
    const zAt = (row) => (row - (ROWS - 1) / 2) * GAP * 1.6;

    const plan = (k) => {
      const r = rng(7 + k * 97);
      const roi = [];
      for (let row = 0; row < ROWS; row++) {
        const start = 1 + Math.floor(r() * 7), len = 2 + Math.floor(r() * 2);
        const depth = 0.35 + r() * 1.1, cost = 0.6 + r() * 0.9;
        let inc = 0;
        for (let col = 0; col < COLS; col++) {
          const i = row * COLS + col;
          const on = col >= start && col < start + len;
          const dip = col === start + len;                 // post-promo dip (pantry loading)
          tgt[i].b = (0.55 + 0.12 * Math.sin(col * 0.7 + row)) * (dip ? 0.72 : 1);
          tgt[i].u = on ? depth * (0.75 + r() * 0.5) : 0;
          inc += tgt[i].u - (dip ? tgt[i].b * 0.39 : 0);
        }
        roi.push(inc / cost);
      }
      bestRow = roi.indexOf(Math.max(...roi));
      const sorted = [...roi].sort((a, b) => b - a);
      for (let row = 0; row < ROWS; row++) {
        liftTgt[row].copy(row === bestRow ? pal.accent : roi[row] >= sorted[2] ? pal.primary : pal.soft);
      }
    };

    return {
      cam: new THREE.Vector3(5.0, 5.2, 8.0),
      target: new THREE.Vector3(0, 0.75, 0),
      update(t, dt) {
        const k = Math.floor(t / 6);
        if (k !== cycle) { cycle = k; plan(k); }
        const a = damp(dt, 3.2);
        for (let row = 0; row < ROWS; row++) {
          liftCol[row].lerp(liftTgt[row], a);
          for (let col = 0; col < COLS; col++) {
            const i = row * COLS + col;
            const stagger = clamp01(t * 1.6 - col * 0.08 - row * 0.05); // grow-in on load
            cur[i].b += (tgt[i].b * stagger - cur[i].b) * a;
            cur[i].u += (tgt[i].u * stagger - cur[i].u) * a;
            m.makeScale(1, Math.max(cur[i].b, 0.001), 1).setPosition(xAt(col), 0, zAt(row));
            base.setMatrixAt(i, m);
            base.setColorAt(i, baseCol);
            const u = cur[i].u > 0.02 ? 0.94 : 0;                  // hide empty uplift caps
            m.makeScale(u, Math.max(cur[i].u, 0.001), u).setPosition(xAt(col), cur[i].b, zAt(row));
            lift.setMatrixAt(i, m);
            lift.setColorAt(i, c.copy(liftCol[row]));
          }
        }
        base.instanceMatrix.needsUpdate = lift.instanceMatrix.needsUpdate = true;
        base.instanceColor.needsUpdate = lift.instanceColor.needsUpdate = true;
        strip.position.z += (zAt(bestRow) - strip.position.z) * a;
        strip.material.opacity = 0.12 + 0.06 * Math.sin(t * 2.5);
        group.rotation.y = -0.1 + 0.12 * Math.sin(t * 0.15);
      },
    };
  },

  /* Category Management: a three-shelf fixture. SKUs are scored, low
     performers step out, and a new listing (orange) earns the space. */
  category(THREE, scene, pal) {
    const group = new THREE.Group();
    scene.add(group);
    const SHELVES = 3, SLOTS = 8, SW = 5.4, SH = 1.05, DEPTH = 0.9;
    const white = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 });
    const lil = new THREE.MeshStandardMaterial({ color: pal.lilac, roughness: 0.9 });

    const back = new THREE.Mesh(new THREE.BoxGeometry(SW + 0.2, SHELVES * SH + 0.3, 0.06), lil);
    back.position.set(0, (SHELVES * SH) / 2, -DEPTH / 2);
    group.add(back);
    for (let s = 0; s <= SHELVES; s++) {
      const board = new THREE.Mesh(new THREE.BoxGeometry(SW + 0.2, 0.07, DEPTH), white);
      board.position.set(0, s * SH, 0);
      group.add(board);
      const edge = new THREE.Mesh(new THREE.BoxGeometry(SW + 0.2, 0.09, 0.03), new THREE.MeshBasicMaterial({ color: pal.soft }));
      edge.position.set(0, s * SH, DEPTH / 2);
      group.add(edge);
    }
    for (const x of [-(SW / 2 + 0.1), SW / 2 + 0.1]) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.08, SHELVES * SH + 0.3, DEPTH), white);
      post.position.set(x, (SHELVES * SH) / 2, 0);
      group.add(post);
    }

    const N = SHELVES * SLOTS;
    const sku = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0),
      new THREE.MeshStandardMaterial({ roughness: 0.45 }), N);
    group.add(sku);
    const neutral = pal.soft.clone().lerp(new THREE.Color('#ffffff'), 0.25);
    const items = Array.from({ length: N }, (_, i) => ({
      shelf: Math.floor(i / SLOTS), slot: i % SLOTS,
      w: 0.5, h: 0.7, tw: 0.5, th: 0.7, score: 0.5, out: false,
      s: 0, z: 0, col: neutral.clone(),
    }));
    const m = new THREE.Matrix4(), tgtCol = new THREE.Color();
    const slotW = SW / SLOTS;
    let cycle = -1;

    const shuffle = (k) => {
      const r = rng(11 + k * 131);
      items.forEach((it) => {
        it.score = r();
        it.th = 0.45 + r() * 0.42;
        it.tw = slotW * (0.62 + r() * 0.2);
      });
      const order = [...items].sort((a, b) => a.score - b.score);
      items.forEach((it) => { it.out = false; it.rank = order.indexOf(it) / (N - 1); });
      order.slice(0, 4).forEach((it) => { it.out = true; });
    };

    return {
      cam: new THREE.Vector3(1.3, 2.5, 8.9),
      target: new THREE.Vector3(0, 1.45, 0),
      update(t, dt) {
        const k = Math.floor(t / 8), p = t % 8;
        if (k !== cycle) { cycle = k; shuffle(k); }
        const a = damp(dt, 4);
        items.forEach((it, i) => {
          let s = 1, z = 0;
          tgtCol.copy(neutral);
          if (p > 1.2) { // scored
            if (it.rank > 0.66) tgtCol.copy(pal.primary).lerp(pal.deep, (it.rank - 0.66) * 2);
            else if (it.out) tgtCol.copy(pal.pale);
            else tgtCol.copy(pal.soft);
          }
          if (it.out && p > 3.2 && p <= 4.8) { s = 0; z = 0.9; }      // delist
          if (it.out && p > 4.8) {                                    // new listing earns the slot
            if (it.s < 0.02 && it.z > 0.5) it.z = -0.6;
            tgtCol.copy(pal.accent);
          }
          if (p > 7.4) tgtCol.copy(neutral);
          it.s += (s - it.s) * a;
          it.h += (it.th - it.h) * a;
          it.w += (it.tw - it.w) * a;
          it.z += (z - it.z) * a;
          it.col.lerp(tgtCol, a);
          const boost = !it.out && it.rank > 0.66 && p > 1.2 && p < 7.4 ? 1.08 : 1;
          const x = (it.slot - (SLOTS - 1) / 2) * slotW;
          const y = it.shelf * SH + 0.035;
          m.makeScale(it.w * it.s, it.h * boost * Math.max(it.s, 0.001), 0.5 * it.s)
            .setPosition(x, y, it.z);
          sku.setMatrixAt(i, m);
          sku.setColorAt(i, it.col);
        });
        sku.instanceMatrix.needsUpdate = true;
        sku.instanceColor.needsUpdate = true;
        group.rotation.y = -0.16 + 0.14 * Math.sin(t * 0.14);
      },
    };
  },
};
