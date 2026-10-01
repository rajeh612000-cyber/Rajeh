/* ==========================================================================
   Smart Value – solution-page motion and hands-on controls
   1) Scroll reveal for .svp-reveal blocks (progressive: content is visible
      without JS, so crawlers and no-JS users always see it).
   2) Hands-on controls (.svp-sim): a price slider and a promotion picker.
      They update the readouts in the HTML at once, then tell the 3D scene.
   3) Three.js hero scenes, one per page:
        <canvas data-svp-scene="price|promo"></canvas>
      Three.js is imported only after window.load + idle, so it never
      competes with the page's LCP element (the H1), and the canvas sits in
      a fixed aspect-ratio box, so there is zero layout shift.
   PRICE_MODEL, PROMO_MODEL and fmtPct come from svp-models.mjs, which
   build.mjs inlines ahead of this file.
   ========================================================================== */

const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.181.0/build/three.module.min.js';
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- 1. Scroll reveal ---------- */
(() => {
  const els = document.querySelectorAll('.svp-page .svp-reveal');
  if (!els.length || !('IntersectionObserver' in window) || REDUCED) return;
  document.querySelectorAll('.svp-page').forEach((p) => p.classList.add('svp-js'));
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  els.forEach((el) => io.observe(el));
})();

/* ---------- 2. Hands-on controls ---------- */
document.querySelectorAll('.svp-sim').forEach((sim) => {
  const canvas = sim.closest('.svp-hero__side')?.querySelector('canvas[data-svp-scene]');
  const send = (v) => {                       // the scene may mount later, so keep the latest value on the canvas
    if (!canvas) return;
    canvas.dataset.svpValue = String(v);
    canvas.dispatchEvent(new CustomEvent('svp:value', { detail: v }));
  };
  const set = (k, text, cls) => {
    const el = sim.querySelector(`[data-k="${k}"]`);
    if (!el) return;
    el.textContent = text;
    if (cls !== undefined) el.className = cls;
  };
  const tone = (x) => (x > 0.05 ? 'is-up' : x < -0.05 ? 'is-down' : '');

  if (sim.dataset.svpSim === 'price') {
    const input = sim.querySelector('input[type="range"]');
    const update = () => {
      const r = PRICE_MODEL.at(parseFloat(input.value));
      set('p', fmtPct(r.p));
      set('rev', fmtPct(r.rev), tone(r.rev));
      set('mar', fmtPct(r.mar), tone(r.mar));
      set('vol', fmtPct(r.vol), tone(r.vol));
      set('verdict', PRICE_MODEL.verdict(r));
      input.setAttribute('aria-valuetext', `${fmtPct(r.p)} price change`);
      send(r.p);
    };
    input.addEventListener('input', update);
    sim.querySelector('[data-svp-best]')?.addEventListener('click', () => {
      input.value = String(PRICE_MODEL.best().p);
      update();
    });
    update();
  }

  if (sim.dataset.svpSim === 'promo') {
    const radios = [...sim.querySelectorAll('input[type="radio"]')];
    const update = () => {
      const i = Number((radios.find((r) => r.checked) || {}).value ?? PROMO_MODEL.bestIndex());
      const pr = PROMO_MODEL.promos[i];
      set('inc', fmtPct(pr.uplift, 0), 'is-up');
      set('dip', fmtPct(-pr.dip, 0), 'is-down');
      set('roi', `${pr.roi.toFixed(1)}×`, pr.roi >= 1 ? 'is-up' : 'is-down');
      set('verdict', pr.note);
      send(i);
    };
    radios.forEach((r) => r.addEventListener('change', update));
    update();
  }
});

/* ---------- 3. Hero scenes ---------- */
const canvases = document.querySelectorAll('canvas[data-svp-scene]');
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
  const build = SCENES[canvas.dataset.svpScene];
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
    ink: col('--svp-ink', '#1a1a4e'),
    primary: col('--svp-primary', '#7751ff'),
    deep: col('--svp-deep', '#534ab7'),
    light: col('--svp-light', '#8c5fd6'),
    lilac: col('--svp-lilac', '#eeedfe'),
    accent: col('--svp-accent', '#f19526'),
    soft: new THREE.Color('#c6bbea'),   // kit global lilac
    pale: new THREE.Color('#e0dff8'),   // kit card-border lilac
    rose: new THREE.Color('#e8c3d3'),   // "beyond the guardrail" tint
  };

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  scene.add(new THREE.HemisphereLight(0xffffff, pal.lilac, 1.6));
  const sun = new THREE.DirectionalLight(0xffffff, 1.5);
  sun.position.set(3, 6, 4);
  scene.add(sun);

  const s = build(THREE, scene, pal);
  const camDir = s.cam.clone().sub(s.target);
  let fit = 1, running = false, visible = false, last = 0, t = 0;

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
  const settle = () => {                     // one still frame, for reduced motion or an off-screen change
    for (let i = 0; i < 60; i++) s.update((t += 1 / 30), 1 / 30);
    place(1);
    renderer.render(scene, camera);
  };

  // Hands-on controls: pick up the current value now, then follow every change.
  if (canvas.dataset.svpValue !== undefined) s.setValue(Number(canvas.dataset.svpValue));
  canvas.addEventListener('svp:value', (e) => {
    s.setValue(Number(e.detail));
    if (!running) settle();
  });

  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    fit = camera.aspect < 1.15 ? 1.15 / camera.aspect : 1; // step back on narrow screens
    camera.updateProjectionMatrix();
    if (!running) { place(1); renderer.render(scene, camera); }
  };

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
   Scenes. Each returns { cam, target, setValue(v), update(t, dt) }.
   ========================================================================== */
const SCENES = {

  /* Price Optimizer: a value landscape across price changes (−10% … +15%).
     Orange = the recommended price, ink = the visitor's price from the slider,
     rose = beyond the volume guardrail, marked by a dashed line on the floor. */
  price(THREE, scene, pal) {
    const M = PRICE_MODEL, best = M.best(), guard = M.guardrailPrice();
    const group = new THREE.Group();
    scene.add(group);

    const W = 6, D = 4, SX = 60, SZ = 40, A = 1.45, FLOOR = -0.35;
    const xOf = (p) => ((p - M.min) / (M.max - M.min)) * W - W / 2;
    const pOf = (x) => M.min + ((x + W / 2) / W) * (M.max - M.min);
    const ridge = (p) => { const s = p < best.p ? 7 : 4; return A * Math.exp(-((p - best.p) ** 2) / (2 * s * s)); };
    const height = (x, z, t) => ridge(pOf(x)) * Math.exp(-(z * z) / 5)
      + 0.035 * Math.sin(1.7 * x + t * 0.9) * Math.cos(1.3 * z + t * 0.6);

    const geo = new THREE.PlaneGeometry(W, D, SX, SZ);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const dot = dotTexture(THREE);

    group.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
      vertexColors: true, transparent: true, opacity: 0.22, side: THREE.DoubleSide, depthWrite: false,
    })));
    group.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
      color: pal.light, wireframe: true, transparent: true, opacity: 0.13, depthWrite: false,
    })));
    group.add(new THREE.Points(geo, new THREE.PointsMaterial({
      size: 0.075, map: dot, vertexColors: true, transparent: true, depthWrite: false,
    })));

    const grid = new THREE.GridHelper(W, 12, pal.soft, pal.soft);
    grid.position.y = FLOOR;
    grid.material.transparent = true;
    grid.material.opacity = 0.45;
    group.add(grid);

    // Volume guardrail: dashed line across the floor
    const xg = xOf(guard);
    const guardLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(xg, FLOOR + 0.01, -D / 2), new THREE.Vector3(xg, FLOOR + 0.01, D / 2)]),
      new THREE.LineDashedMaterial({ color: new THREE.Color('#c97a95'), dashSize: 0.12, gapSize: 0.08, transparent: true, opacity: 0.9 }));
    guardLine.computeLineDistances();
    group.add(guardLine);
    const zone = new THREE.Mesh(new THREE.PlaneGeometry(W / 2 - xg, D),   // rose band beyond the guardrail
      new THREE.MeshBasicMaterial({ color: pal.rose, transparent: true, opacity: 0.4, depthWrite: false }));
    zone.rotation.x = -Math.PI / 2;
    zone.position.set((xg + W / 2) / 2, FLOOR + 0.004, 0);
    group.add(zone);

    // A marker = sphere + halo + drop line + floor ring
    const marker = (color, radius, haloOpacity) => {
      const m = new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 16), new THREE.MeshBasicMaterial({ color }));
      const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: dot, color, transparent: true, opacity: haloOpacity, depthWrite: false }));
      halo.scale.setScalar(radius * 6);
      m.add(halo);
      const dropGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
      const drop = new THREE.Line(dropGeo, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.6 }));
      const ring = new THREE.Mesh(new THREE.RingGeometry(radius * 1.2, radius * 1.6, 48),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8, side: THREE.DoubleSide, depthWrite: false }));
      ring.rotation.x = -Math.PI / 2;
      group.add(m, drop, ring);
      return {
        m, halo, ring,
        at(x, y, z) {
          m.position.set(x, y, z);
          const p = dropGeo.attributes.position;
          p.setXYZ(0, x, y, z);
          p.setXYZ(1, x, FLOOR, z);
          p.needsUpdate = true;
          ring.position.set(x, FLOOR + 0.005, z);
        },
      };
    };
    const rec = marker(pal.accent, 0.1, 0.35);
    const you = marker(pal.ink, 0.075, 0.18);

    const tmp = new THREE.Color();
    let target = 0, cur = 0;

    return {
      cam: new THREE.Vector3(0.4, 3.3, 7.3),
      target: new THREE.Vector3(0, 0.35, 0),
      setValue(p) { if (Number.isFinite(p)) target = Math.min(M.max, Math.max(M.min, p)); },
      update(t, dt) {
        for (let i = 0; i < pos.count; i++) {
          const x = pos.getX(i), z = pos.getZ(i), h = height(x, z, t);
          pos.setY(i, h);
          tmp.copy(pal.soft).lerp(pal.primary, clamp01(h / A));
          if (h > A * 0.9) tmp.lerp(pal.deep, (h / A - 0.9) * 6);
          if (pOf(x) > guard) tmp.lerp(pal.rose, 0.75);
          colors[i * 3] = tmp.r; colors[i * 3 + 1] = tmp.g; colors[i * 3 + 2] = tmp.b;
        }
        pos.needsUpdate = true;
        geo.attributes.color.needsUpdate = true;

        const xr = xOf(best.p);
        rec.at(xr, height(xr, 0, t) + 0.12, 0);
        const pulse = Math.sin(t * 3);
        rec.halo.scale.setScalar(0.55 + 0.12 * pulse);
        rec.ring.scale.setScalar(1 + 0.25 * pulse);

        cur += (target - cur) * damp(dt, 6);
        const xu = xOf(cur);
        you.at(xu, height(xu, 0, t) + 0.1, 0);

        group.rotation.y = -0.18 + 0.12 * Math.sin(t * 0.12);
      },
    };
  },

  /* Promotion Planner: weeks × four promotions. Lilac = baseline, violet =
     incremental uplift, orange = the promotion picked in the controls.
     The week after each promotion shows its dip. */
  promo(THREE, scene, pal) {
    const P = PROMO_MODEL.promos;
    const group = new THREE.Group();
    scene.add(group);
    const ROWS = P.length, COLS = 12, GAP = 0.46, N = ROWS * COLS;
    const box = new THREE.BoxGeometry(0.3, 1, 0.3).translate(0, 0.5, 0);
    const mat = new THREE.MeshStandardMaterial({ roughness: 0.55, metalness: 0 });
    const base = new THREE.InstancedMesh(box, mat, N);
    const lift = new THREE.InstancedMesh(box, mat.clone(), N);
    group.add(base, lift);

    const xAt = (col) => (col - (COLS - 1) / 2) * GAP;
    const zAt = (row) => (row - (ROWS - 1) / 2) * GAP * 1.6;
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

    // Fixed bar heights from the model: baseline every week, uplift during the
    // promotion, and a shorter baseline the week after (the dip, exaggerated to read).
    const maxUp = Math.max(...P.map((p) => p.uplift));
    const tgt = [];
    P.forEach((pr, row) => {
      for (let col = 0; col < COLS; col++) {
        const on = col >= pr.start && col < pr.start + pr.len;
        const dip = col === pr.start + pr.len;
        const b = (0.55 + 0.08 * Math.sin(col * 0.7 + row)) * (dip ? 1 - (pr.dip / 100) * 2.2 : 1);
        tgt.push({ b, u: on ? (pr.uplift / maxUp) * 1.15 * (0.88 + 0.12 * Math.sin(col + row)) : 0 });
      }
    });
    const cur = tgt.map(() => ({ b: 0, u: 0 }));

    const baseCol = pal.soft.clone().lerp(new THREE.Color('#ffffff'), 0.35);
    const other = pal.primary.clone().lerp(pal.soft, 0.35);
    const rowCol = P.map(() => other.clone());
    const m = new THREE.Matrix4();
    let sel = PROMO_MODEL.bestIndex();
    strip.position.z = zAt(sel);

    return {
      cam: new THREE.Vector3(5.0, 5.2, 8.0),
      target: new THREE.Vector3(0, 0.75, 0),
      setValue(i) { if (Number.isInteger(i) && i >= 0 && i < ROWS) sel = i; },
      update(t, dt) {
        const a = damp(dt, 3.2);
        for (let row = 0; row < ROWS; row++) {
          rowCol[row].lerp(row === sel ? pal.accent : other, a);
          const boost = row === sel ? 1.06 : 1;
          for (let col = 0; col < COLS; col++) {
            const i = row * COLS + col;
            const grow = clamp01(t * 1.6 - col * 0.08 - row * 0.05); // grow-in on load
            cur[i].b += (tgt[i].b * grow - cur[i].b) * a;
            cur[i].u += (tgt[i].u * grow * boost - cur[i].u) * a;
            m.makeScale(1, Math.max(cur[i].b, 0.001), 1).setPosition(xAt(col), 0, zAt(row));
            base.setMatrixAt(i, m);
            base.setColorAt(i, baseCol);
            const w = cur[i].u > 0.02 ? 0.94 : 0;              // hide empty uplift caps
            m.makeScale(w, Math.max(cur[i].u, 0.001), w).setPosition(xAt(col), cur[i].b, zAt(row));
            lift.setMatrixAt(i, m);
            lift.setColorAt(i, rowCol[row]);
          }
        }
        base.instanceMatrix.needsUpdate = lift.instanceMatrix.needsUpdate = true;
        base.instanceColor.needsUpdate = lift.instanceColor.needsUpdate = true;
        strip.position.z += (zAt(sel) - strip.position.z) * a;
        strip.material.opacity = 0.12 + 0.06 * Math.sin(t * 2.5);
        group.rotation.y = -0.1 + 0.12 * Math.sin(t * 0.15);
      },
    };
  },
};
