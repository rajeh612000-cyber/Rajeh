const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(width, height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setClearColor(0x000000, 0);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.5;
camera.position.set(0, 5.4, 12.5);
controls.target.set(0, 0.5, 0);

scene.add(new THREE.HemisphereLight(0xffffff, 0xeeedfe, 1.6));
const sun = new THREE.DirectionalLight(0xffffff, 1.5);
sun.position.set(3, 6, 4);
scene.add(sun);

// Smart Value palette
const C = { ink: '#1a1a4e', primary: '#7751ff', deep: '#534ab7', light: '#8c5fd6', lilac: '#eeedfe', accent: '#f19526', soft: '#c6bbea', rose: '#e8c3d3' };
const col = (h) => new THREE.Color(h);

const dot = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d'), r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.45, 'rgba(255,255,255,.9)'); r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r; g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
})();

const label = (text, color) => {                       // floating title above each half
  const c = document.createElement('canvas'); c.width = 1024; c.height = 160;
  const g = c.getContext('2d');
  g.font = '700 84px Sora, system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillStyle = color; g.fillText(text, 512, 84);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false }));
  s.scale.set(4, 0.625, 1); return s;
};

/* ---- Price Optimizer: value landscape across price changes (−10% … +15%) ---- */
const price = new THREE.Group(); price.position.x = -3.7; scene.add(price);
const W = 5, D = 3.4, A = 1.3, FLOOR = -0.3, BEST = 4, GUARD = 4.21;
const xOf = (p) => ((p + 10) / 25) * W - W / 2, pOf = (x) => -10 + ((x + W / 2) / W) * 25;
const ridge = (p) => { const s = p < BEST ? 7 : 4; return A * Math.exp(-((p - BEST) ** 2) / (2 * s * s)); };
const hAt = (x, z, t) => ridge(pOf(x)) * Math.exp(-(z * z) / 4) + 0.03 * Math.sin(1.7 * x + t * 0.9) * Math.cos(1.3 * z + t * 0.6);
const geo = new THREE.PlaneGeometry(W, D, 50, 34); geo.rotateX(-Math.PI / 2);
const pos = geo.attributes.position, cols = new Float32Array(pos.count * 3);
geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
price.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.22, side: THREE.DoubleSide, depthWrite: false })));
price.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: col(C.light), wireframe: true, transparent: true, opacity: 0.13, depthWrite: false })));
price.add(new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.07, map: dot, vertexColors: true, transparent: true, depthWrite: false })));
const grid = new THREE.GridHelper(W, 10, col(C.soft), col(C.soft));
grid.position.y = FLOOR; grid.material.transparent = true; grid.material.opacity = 0.45; price.add(grid);
const zone = new THREE.Mesh(new THREE.PlaneGeometry(W / 2 - xOf(GUARD), D), new THREE.MeshBasicMaterial({ color: col(C.rose), transparent: true, opacity: 0.4, depthWrite: false }));
zone.rotation.x = -Math.PI / 2; zone.position.set((xOf(GUARD) + W / 2) / 2, FLOOR + 0.004, 0); price.add(zone);
const marker = new THREE.Mesh(new THREE.SphereGeometry(0.1, 32, 16), new THREE.MeshBasicMaterial({ color: col(C.accent) }));
const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: dot, color: col(C.accent), transparent: true, opacity: 0.35, depthWrite: false }));
marker.add(halo); price.add(marker);
const dropGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
price.add(new THREE.Line(dropGeo, new THREE.LineBasicMaterial({ color: col(C.accent), transparent: true, opacity: 0.6 })));
const pl = label('Price Optimizer', C.ink); pl.position.set(0, 2.25, 0); price.add(pl);

/* ---- Promotion Planner: weeks × four promotions, best-ROI row in orange ---- */
const promo = new THREE.Group(); promo.position.x = 3.7; scene.add(promo);
const PROMOS = [{ s: 2, l: 2, up: 38, dip: 12 }, { s: 5, l: 3, up: 29, dip: 8 }, { s: 3, l: 2, up: 21, dip: 3 }, { s: 7, l: 2, up: 14, dip: 2 }];
const SEL = 2, COLS = 10, GAP = 0.42;
const box = new THREE.BoxGeometry(0.27, 1, 0.27).translate(0, 0.5, 0);
const baseMat = new THREE.MeshStandardMaterial({ color: col(C.soft).lerp(col('#ffffff'), 0.35), roughness: 0.55 });
const liftMat = new THREE.MeshStandardMaterial({ color: col(C.primary).lerp(col(C.soft), 0.35), roughness: 0.55 });
const selMat = new THREE.MeshStandardMaterial({ color: col(C.accent), roughness: 0.5 });
const selBars = [];
PROMOS.forEach((pr, row) => {
  const z = (row - 1.5) * GAP * 1.6;
  for (let c = 0; c < COLS; c++) {
    const x = (c - (COLS - 1) / 2) * GAP, on = c >= pr.s && c < pr.s + pr.l, dip = c === pr.s + pr.l;
    const b = (0.55 + 0.08 * Math.sin(c * 0.7 + row)) * (dip ? 1 - (pr.dip / 100) * 2.2 : 1);
    const base = new THREE.Mesh(box, baseMat); base.scale.y = b; base.position.set(x, 0, z); promo.add(base);
    if (on) {
      const u = (pr.up / 38) * 1.15;
      const lift = new THREE.Mesh(box, row === SEL ? selMat : liftMat);
      lift.scale.set(0.94, u, 0.94); lift.position.set(x, b, z); promo.add(lift);
      if (row === SEL) selBars.push({ m: lift, u });
    }
  }
});
const floor = new THREE.Mesh(new THREE.PlaneGeometry(COLS * GAP + 0.5, 4 * GAP * 1.6 + 0.5), new THREE.MeshBasicMaterial({ color: col(C.lilac), transparent: true, opacity: 0.9 }));
floor.rotation.x = -Math.PI / 2; floor.position.y = -0.002; promo.add(floor);
const ppl = label('Promotion Planner', C.ink); ppl.position.set(0, 2.25, 0); promo.add(ppl);

const tmp = new THREE.Color();
let t = 0;
function animate() {
  requestAnimationFrame(animate);
  t += 0.016;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i), h = hAt(x, z, t);
    pos.setY(i, h);
    tmp.copy(col(C.soft)).lerp(col(C.primary), Math.min(1, Math.max(0, h / A)));
    if (pOf(x) > GUARD) tmp.lerp(col(C.rose), 0.75);
    cols[i * 3] = tmp.r; cols[i * 3 + 1] = tmp.g; cols[i * 3 + 2] = tmp.b;
  }
  pos.needsUpdate = true; geo.attributes.color.needsUpdate = true;
  const xr = xOf(BEST), yr = hAt(xr, 0, t) + 0.12;
  marker.position.set(xr, yr, 0);
  halo.scale.setScalar(0.55 + 0.12 * Math.sin(t * 3));
  const dp = dropGeo.attributes.position; dp.setXYZ(0, xr, yr, 0); dp.setXYZ(1, xr, FLOOR, 0); dp.needsUpdate = true;
  selBars.forEach((s, i) => { s.m.scale.y = s.u * (1 + 0.06 * Math.sin(t * 2.4 + i)); });
  controls.update();
  renderer.render(scene, camera);
}
animate();
