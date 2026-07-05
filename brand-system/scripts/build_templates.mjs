// Generate template HTML files from content.mjs using shared layouts.
// Usage: node scripts/build_templates.mjs
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { writeFileSync } from 'node:fs';
import { posts } from '../content.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TPL = resolve(__dirname, '..', 'templates');

const SYMBOL = '../assets/logo/symbol.png';

// reversed logo lockup (white wordmark) — the standard mark on navy
const lockup = (vars = '') => `
    <div class="lockup" style="${vars}">
      <img class="sym" src="${SYMBOL}" alt="">
      <div class="word">
        <div class="name">SMART<br>VALUE<sup>™</sup></div>
        <div class="desc">AI SOLUTIONS</div>
      </div>
    </div>`;

const rich = (parts) =>
  parts.map(p => p.accent ? `<span class="accent">${p.t}</span>` : p.t).join('');

// isometric layered hex-stack glyph — the brand's "data made tangible" motif
const shade = (hex, f) => {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 255) * f), g = Math.round(((n >> 8) & 255) * f), b = Math.round((n & 255) * f);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};
const hexStack = (size = 210) => {
  const cx = size / 2, cy0 = size * 0.60, R = size * 0.34, hh = size * 0.075, sq = 0.5;
  const P = (cx, cy, r, a) => [cx + r * Math.cos(a * Math.PI / 180), cy + r * sq * Math.sin(a * Math.PI / 180)];
  const layer = (cy, r, top) => {
    const v = {}; [0, 60, 120, 180, 240, 300].forEach(a => v[a] = P(cx, cy, r, a));
    const down = p => [p[0], p[1] + hh];
    const poly = (pts, f) => `<polygon points="${pts.map(p => p.map(n => n.toFixed(1)).join(',')).join(' ')}" fill="${f}"/>`;
    const top6 = [v[0], v[60], v[120], v[180], v[240], v[300]];
    const fR = [v[0], v[60], down(v[60]), down(v[0])];
    const fM = [v[60], v[120], down(v[120]), down(v[60])];
    const fL = [v[120], v[180], down(v[180]), down(v[120])];
    return poly(fR, shade(top, .78)) + poly(fM, shade(top, .62)) + poly(fL, shade(top, .70)) + poly(top6, top);
  };
  return `<svg class="glyph" viewBox="0 0 ${size} ${size}" fill="none">
    ${layer(cy0, R, '#3B6FE0')}
    ${layer(cy0 - hh * 2.0, R * 0.66, '#7751FF')}
    ${layer(cy0 - hh * 4.0, R * 0.40, '#F19526')}
  </svg>`;
};

const page = (post, body, styles = '') => {
  const [w, h] = post.size;
  return `<!-- generated from content.mjs — do not edit by hand -->
<meta charset="utf-8">
<meta name="export" content="${w}x${h}">
<link rel="stylesheet" href="base.css">
<style>
  .canvas{width:${w}px;height:${h}px}
${styles}
</style>
<div class="canvas">
${body}
</div>`;
};

// ---- layouts ---------------------------------------------------------------
const layouts = {
  // logo left · divider · kicker + headline right · amber CTA bottom-right
  article(post) {
    const styles = `
  .split{grid-template-columns:34% 2px 1fr; column-gap:38px; padding:56px 58px}
  .kicker{--kick:26px}
  .headline{--head:48px}
  .cta{--cta:25px; position:absolute; right:64px; bottom:52px}`;
    const body = `  <div class="split">
    <div class="left-zone">${lockup()}</div>
    <div class="divider-v"></div>
    <div class="right-zone">
      <div class="stack">
        ${post.kicker ? `<div class="kicker">${post.kicker}</div>` : ''}
        <div class="headline">${post.headline.map(l => `<div>${l.accent ? `<span class="accent">${l.t}</span>` : l.t}</div>`).join('\n        ')}</div>
      </div>
    </div>
  </div>
  ${post.cta ? `<a class="cta">${post.cta}</a>` : ''}`;
    return page(post, body, styles);
  },

  // logo left · divider · giant amber stat · sub · source (no CTA)
  statistic(post) {
    const styles = `
  .split{grid-template-columns:34% 2px 1fr; column-gap:38px; padding:56px 58px}
  .stat{font-weight:800; color:var(--amber); font-size:150px; line-height:.9; letter-spacing:-.01em}
  .sub{--sub:30px; margin-top:26px; max-width:15ch; color:#E7ECFB}
  .source{color:var(--muted); font-size:22px; margin-top:26px}`;
    const body = `  <div class="split">
    <div class="left-zone">${lockup()}</div>
    <div class="divider-v"></div>
    <div class="right-zone">
      <div class="stack">
        <div class="stat">${post.stat}</div>
        <div class="sub">${post.sub}</div>
        <div class="source">${post.source}</div>
      </div>
    </div>
  </div>`;
    return page(post, body, styles);
  },

  // logo left · divider · big quote · author (amber) · role · disclaimer + avatar
  quote(post) {
    const styles = `
  .split{grid-template-columns:33% 2px 1fr; column-gap:34px; padding:52px 58px}
  .qmark{font-family:Georgia,serif; font-weight:700; color:var(--purple); font-size:120px; line-height:.5; height:52px}
  .quote{font-weight:700; color:var(--white); font-size:40px; line-height:1.22; max-width:20ch; margin-top:6px}
  .author{font-weight:700; color:var(--amber); font-size:30px; margin-top:30px}
  .role{color:#D4DBF0; font-size:23px; margin-top:8px}
  .disc{color:var(--muted); font-size:19px; margin-top:14px}
  .avatar{position:absolute; right:64px; top:50%; transform:translateY(-50%);
    width:210px; height:210px; border-radius:50%;
    border:2px solid rgba(139,123,242,.55);
    box-shadow:0 0 0 14px rgba(119,81,255,.08), inset 0 0 40px rgba(119,81,255,.15);
    display:flex; align-items:center; justify-content:center}
  .avatar svg{width:96px; height:96px; opacity:.9}
  .avatar .dot{position:absolute; top:16px; right:22px; width:20px; height:20px; border-radius:50%; background:var(--amber)}`;
    const body = `  <div class="split">
    <div class="left-zone">${lockup()}</div>
    <div class="divider-v"></div>
    <div class="right-zone" style="padding-right:250px">
      <div class="stack">
        <div class="qmark">&ldquo;</div>
        <div class="quote">${post.quote}</div>
        <div class="author">${post.author}</div>
        <div class="role">${post.role}</div>
        <div class="disc">${post.disclaimer}</div>
      </div>
    </div>
  </div>
  <div class="avatar"><span class="dot"></span>
    <svg viewBox="0 0 64 64" fill="#C9D4F5"><circle cx="32" cy="23" r="13"/><path d="M8 60c0-14 11-22 24-22s24 8 24 22z"/></svg>
  </div>`;
    return page(post, body, styles);
  },

  // logo left · divider · kicker + headline · detail row (purple) · amber CTA
  announcement(post) {
    const big = post.size[0] >= 1280;
    const styles = `
  .split{grid-template-columns:34% 2px 1fr; column-gap:${big ? 46 : 38}px; padding:${big ? '64px 78px' : '56px 58px'}}
  .kicker{--kick:${big ? 28 : 26}px}
  .headline{--head:${big ? 56 : 50}px}
  .detail{font-weight:800; color:var(--purple-lt); font-size:${big ? 46 : 40}px; margin-top:26px; letter-spacing:-.01em}
  .cta{--cta:${big ? 27 : 25}px; position:absolute; right:${big ? 84 : 70}px; bottom:${big ? 60 : 52}px}`;
    const body = `  <div class="split">
    <div class="left-zone">${lockup()}</div>
    <div class="divider-v"></div>
    <div class="right-zone">
      <div class="stack">
        ${post.kicker ? `<div class="kicker">${post.kicker}</div>` : ''}
        <div class="headline">${post.headline.map(l => `<div>${l.accent ? `<span class="accent">${l.t}</span>` : l.t}</div>`).join('\n        ')}</div>
        ${post.detail ? `<div class="detail">${post.detail}</div>` : ''}
      </div>
    </div>
  </div>
  ${post.cta ? `<a class="cta">${post.cta}</a>` : ''}`;
    return page(post, body, styles);
  },

  // logo top-left · horizontal divider · amber pill · big claim · source · note
  insight(post) {
    const tall = post.size[1] >= 1300;
    const pad = tall ? 92 : 84;
    const glyphSize = tall ? 300 : 250;
    const styles = `
  .wrap{position:absolute; inset:0; padding:${pad}px; display:flex; flex-direction:column}
  .lockup{--sym:112px; --word:44px; --lg-gap:24px}
  .divider-h{margin:${tall ? 54 : 46}px 0 ${tall ? 58 : 50}px}
  .pill{--pill:23px; align-self:flex-start; margin-bottom:${tall ? 50 : 44}px}
  .claim{font-weight:800; color:var(--white); font-size:${tall ? 70 : 76}px; line-height:1.05; letter-spacing:-.01em; max-width:${tall ? '13ch' : '12ch'}; position:relative; z-index:2}
  .claim .accent{color:var(--purple-lt)}
  .source{color:#C7D0EC; font-size:${tall ? 32 : 33}px; line-height:1.4; margin-top:auto; max-width:24ch; position:relative; z-index:2}
  .note{color:var(--amber); font-size:${tall ? 24 : 26}px; margin-top:22px}
  .glyph{position:absolute; right:${pad - 6}px; ${tall ? `top:47%` : `bottom:${pad + 150}px`}; width:${glyphSize}px; height:${glyphSize}px;
    filter:drop-shadow(0 24px 40px rgba(0,0,0,.35))}`;
    const body = `  <div class="wrap">
    ${lockup()}
    <div class="divider-h"></div>
    <span class="pill">${post.pill}</span>
    <div class="claim">${rich(post.claim)}</div>
    ${hexStack(glyphSize)}
    <div class="source">${post.source}</div>
    <div class="note">${post.note}</div>
  </div>`;
    return page(post, body, styles);
  },
};

let n = 0;
for (const post of posts) {
  const fn = layouts[post.layout];
  if (!fn) { console.warn('no layout:', post.layout); continue; }
  writeFileSync(join(TPL, `${post.name}.html`), fn(post));
  n++;
  console.log(`· ${post.name}.html  (${post.layout}, ${post.size.join('×')})`);
}
console.log(`generated ${n} templates.`);
