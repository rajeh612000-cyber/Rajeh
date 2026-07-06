// Generate deck slide HTML from slides.mjs using shared layouts.
// Usage: node deck/build.mjs   ->  deck/html/NN-layout.html
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { writeFileSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { slides } from '../deck/slides.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const HTML = resolve(__dirname, 'html');
rmSync(HTML, { recursive: true, force: true }); mkdirSync(HTML, { recursive: true });

const SYM = '../../assets/logo/symbol.png';
const OUT = (n) => `../../out/${n}.png`;
const rich = (a) => a.map(p => p.accent ? `<span class="accent">${p.t}</span>` : (p.amber ? `<span class="amber">${p.t}</span>` : p.t)).join('');
const lines = (a) => a.map(p => `<div>${p.accent ? `<span class="accent">${p.t}</span>` : (p.amber ? `<span class="amber">${p.t}</span>` : p.t)}</div>`).join('');

// reversed lockup (white). form: full | stacked | symbol | word
const lock = (sym = 66, word = 27, { form = 'full', primary = false } = {}) => {
  const nCol = primary ? '#1A1A4E' : '#fff';
  const vCol = primary ? '#7751FF' : '#fff';
  const dCol = primary ? '#7751FF' : '#fff';
  const w = `<span class="lw" style="--w:${word}px"><span class="ln" style="color:${nCol}">SMART<br><span style="color:${vCol}">VALUE</span><sup>™</sup></span><span class="ld" style="color:${dCol}">AI SOLUTIONS</span></span>`;
  const s = `<img class="ls" style="width:${sym}px" src="${SYM}" alt="">`;
  if (form === 'symbol') return `<span class="lock">${s}</span>`;
  if (form === 'word') return `<span class="lock">${w}</span>`;
  if (form === 'stacked') return `<span class="lock stacked">${s}${w}</span>`;
  return `<span class="lock">${s}${w}</span>`;
};

const mark = () => `<div class="mark"><img src="${SYM}" alt="">
  <div class="w"><div class="n">SMART<br>VALUE<sup>™</sup></div><div class="d">AI SOLUTIONS</div></div></div>`;
const foot = (n, total) => `<div class="foot"><span>SMART&nbsp;VALUE™ · BRAND SYSTEM</span><span class="pg">${String(n).padStart(2, '0')} / ${String(total).padStart(2, '0')}</span></div>`;
const eyebrow = (num, sect) => `<div class="eyebrow"><span class="num">${num}</span><span class="ttl">${sect}</span></div>`;

const LOCK_CSS = `
  .lock{display:inline-flex;align-items:center;gap:20px;vertical-align:middle}
  .lock.stacked{flex-direction:column;align-items:flex-start;gap:14px}
  .ls{height:auto;filter:drop-shadow(0 6px 16px rgba(0,0,0,.3))}
  .lw{display:flex;flex-direction:column;line-height:1}
  .ln{font-weight:800;font-size:var(--w);line-height:.9}
  .ln sup{font-size:.42em;font-weight:700;vertical-align:super}
  .ld{font-weight:500;font-size:calc(var(--w)*.31);letter-spacing:.4em;margin-top:.6em;padding-left:.12em;opacity:.92}`;

const page = (i, total, cls, styles, body, { withMark = true, withFoot = true } = {}) => `<!-- generated · do not edit -->
<meta charset="utf-8"><meta name="export" content="1280x720">
<link rel="stylesheet" href="../slide-base.css">
<style>${LOCK_CSS}${styles}</style>
<div class="slide ${cls || ''}">
${withMark ? mark() : ''}
${body}
${withFoot ? foot(i + 1, total) : ''}
</div>`;

// ============================================================================
const L = {};

L.cover = (s, i, t) => page(i, t, '', `
  .cv{position:absolute;inset:0;display:grid;grid-template-columns:auto 2px 1fr;gap:56px;align-items:center;padding:0 96px}
  .cv .dv{align-self:stretch;margin:150px 0}
  .cv h1{font-weight:800;font-size:74px;line-height:1;letter-spacing:-.015em;color:#F5F7FF}
  .cv h1 .accent{color:var(--purple-lt)}
  .cv p{margin-top:24px;max-width:46ch;color:#C4CBE6;font-size:20px;line-height:1.5}
  .cv .meta{position:absolute;left:96px;bottom:52px;color:var(--muted);font-weight:500;font-size:14px;letter-spacing:.16em;text-transform:uppercase}`,
  `<div class="cv">
     ${lock(150, 58, { form: 'stacked' })}
     <div class="dv"></div>
     <div><h1>${lines(s.title)}</h1><p>${s.sub}</p></div>
     <div class="meta">${s.meta}</div>
   </div>`, { withMark: false, withFoot: false });

L.contents = (s, i, t) => page(i, t, '', `
  .c-list{display:grid;grid-template-columns:1fr 1fr;gap:14px 40px;margin-top:8px}
  .ci{display:flex;gap:18px;align-items:baseline;padding:14px 0;border-bottom:1px solid var(--line)}
  .ci .cn{font-weight:800;font-size:20px;color:var(--amber);width:34px;flex:none}
  .ci .ct{font-weight:700;font-size:21px;color:#fff}
  .ci .cd{color:var(--muted);font-size:15px;margin-top:3px}`,
  `<div class="body">
     ${eyebrow('', 'Contents')}
     <h2 class="head">${s.kicker}</h2>
     <div class="c-list">${s.items.map(([n, ttl, d]) => `<div class="ci"><span class="cn">${n}</span><div><div class="ct">${ttl}</div><div class="cd">${d}</div></div></div>`).join('')}</div>
   </div>`);

L.section = (s, i, t) => page(i, t, '', `
  .sec{position:absolute;left:64px;right:64px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center}
  .sec .snum{font-weight:800;font-size:150px;line-height:.9;color:transparent;-webkit-text-stroke:2px rgba(142,123,242,.55);letter-spacing:-.02em}
  .sec .dh{width:120px;margin:18px 0 26px}
  .sec .sname{font-weight:800;font-size:62px;color:#F5F7FF;letter-spacing:-.01em}
  .sec .sline{color:var(--muted);font-size:22px;margin-top:14px}`,
  `<div class="sec"><div class="snum">${s.num}</div><div class="dh"></div>
     <div class="sname">${s.name}</div><div class="sline">${s.line}</div></div>`);

L.statement = (s, i, t) => page(i, t, '', `
  .st-grid{display:grid;grid-template-columns:1.15fr 1fr;gap:56px;align-items:center;height:100%}
  .st h2{font-weight:800;font-size:52px;line-height:1.03;letter-spacing:-.01em;color:#F5F7FF;margin-bottom:22px}
  .stats{display:flex;flex-direction:column;gap:16px}
  .stat{border:1px solid var(--line);border-radius:16px;padding:22px 26px;background:rgba(255,255,255,.03)}
  .stat b{font-weight:800;font-size:44px;color:#fff;line-height:1}
  .stat span{display:block;color:var(--muted);font-size:15px;margin-top:8px}`,
  `<div class="body"><div class="st-grid">
     <div class="st">${eyebrow(s.num, s.sect)}<h2>${rich(s.head)}</h2><p class="lead">${s.lead}</p></div>
     <div class="stats">${s.stats.map(([b, sp]) => `<div class="stat"><b>${b}</b><span>${sp}</span></div>`).join('')}</div>
   </div></div>`);

L.cards = (s, i, t) => page(i, t, '', `
  .cg{display:grid;grid-template-columns:repeat(${s.cols.length},1fr);gap:20px;margin-top:34px}
  .cc{background:linear-gradient(180deg,rgba(119,81,255,.10),rgba(119,81,255,.02));border:1px solid var(--line);border-radius:18px;padding:28px 26px}
  .cc .cn{font-weight:800;font-size:14px;color:var(--amber);letter-spacing:.06em;margin-bottom:14px}
  .cc h3{font-weight:800;font-size:22px;color:#fff;margin-bottom:10px;line-height:1.1}
  .cc p{color:var(--muted);font-size:15.5px;line-height:1.5}`,
  `<div class="body">${eyebrow(s.num, s.sect)}<h2 class="head">${s.head}</h2>
     <div class="cg">${s.cols.map(c => `<div class="cc"><div class="cn">${c.n}</div><h3>${c.h}</h3><p>${c.p}</p></div>`).join('')}</div>
   </div>`);

L.logoShowcase = (s, i, t) => page(i, t, '', `
  .lg{display:grid;grid-template-columns:1fr 1fr;gap:22px;margin-top:26px}
  .lgc{border-radius:20px;padding:0 46px;min-height:300px;display:flex;flex-direction:column;justify-content:center;gap:26px;border:1px solid var(--line)}
  .lgc.dark{background:linear-gradient(160deg,#1C1C52,#12122f)}
  .lgc.light{background:linear-gradient(160deg,#F4F8FE,#E1ECFB)}
  .lgc .cap{font-weight:600;font-size:12px;letter-spacing:.2em;text-transform:uppercase}
  .lgc.dark .cap{color:var(--purple-lt)} .lgc.light .cap{color:#5A5F86}`,
  `<div class="body">${eyebrow(s.num, s.sect)}<h2 class="head">${s.head}</h2><p class="lead" style="max-width:80ch">${s.lead}</p>
     <div class="lg">
       <div class="lgc dark"><span class="cap">Reversed — for dark</span>${lock(84, 34, { form: 'full' })}</div>
       <div class="lgc light"><span class="cap">Primary — for light</span>${lock(84, 34, { form: 'full', primary: true })}</div>
     </div>
   </div>`);

L.anatomy = (s, i, t) => page(i, t, '', `
  .an{display:grid;grid-template-columns:1fr 1fr;gap:50px;align-items:center;height:100%}
  .an .big{display:flex;align-items:center;justify-content:center}
  .an .big img{width:340px;filter:drop-shadow(0 20px 40px rgba(0,0,0,.35))}
  .ap{display:flex;flex-direction:column;gap:18px}
  .apr{display:flex;gap:16px}
  .apr .dot{width:11px;height:11px;border-radius:50%;background:var(--amber);margin-top:7px;flex:none;box-shadow:0 0 10px rgba(241,149,38,.6)}
  .apr b{font-weight:700;font-size:18px;color:#fff}
  .apr span{display:block;color:var(--muted);font-size:15px;margin-top:4px;line-height:1.45}`,
  `<div class="body"><div class="an">
     <div class="big"><img src="${SYM}" alt=""></div>
     <div><div style="margin-bottom:8px">${eyebrow(s.num, s.sect)}<h2 class="head" style="font-size:34px">${s.head}</h2></div>
       <div class="ap">${s.points.map(([b, p]) => `<div class="apr"><span class="dot"></span><div><b>${b}</b><span>${p}</span></div></div>`).join('')}</div></div>
   </div></div>`);

L.variations = (s, i, t) => page(i, t, '', `
  .vg{display:grid;grid-template-columns:repeat(4,1fr);gap:18px;margin-top:26px}
  .vc{border:1px solid var(--line);border-radius:16px;background:rgba(255,255,255,.03);min-height:150px;display:flex;align-items:center;justify-content:center;padding:20px}
  .vc.lite{background:#EAF2FC}
  .vlabel{text-align:center;color:var(--muted);font-size:13px;margin-top:10px;letter-spacing:.04em}
  .vwrap{display:flex;flex-direction:column}`,
  `<div class="body">${eyebrow(s.num, s.sect)}<h2 class="head">${s.head}</h2><p class="lead" style="max-width:82ch">${s.lead}</p>
     <div class="vg">
       <div class="vwrap"><div class="vc">${lock(58, 22)}</div><div class="vlabel">Primary lockup</div></div>
       <div class="vwrap"><div class="vc">${lock(70, 22, { form: 'stacked' })}</div><div class="vlabel">Stacked</div></div>
       <div class="vwrap"><div class="vc">${lock(96, 0, { form: 'symbol' })}</div><div class="vlabel">Symbol only</div></div>
       <div class="vwrap"><div class="vc lite">${lock(58, 22, { primary: true })}</div><div class="vlabel">On light</div></div>
     </div>
   </div>`);

L.clearspace = (s, i, t) => page(i, t, '', `
  .cs{display:grid;grid-template-columns:1.1fr 1fr;gap:48px;align-items:center;height:100%}
  .csbox{position:relative;border:1.5px dashed rgba(142,123,242,.5);border-radius:8px;padding:56px;display:inline-flex}
  .csbox .xu{position:absolute;background:rgba(241,149,38,.9);border-radius:2px}
  .csbox .top{top:0;left:56px;right:56px;height:6px}.csbox .bot{bottom:0;left:56px;right:56px;height:6px}
  .csbox .lft{left:0;top:56px;bottom:56px;width:6px}.csbox .rgt{right:0;top:56px;bottom:56px;width:6px}
  .minrow{margin-top:26px;display:flex;gap:14px;align-items:flex-end}
  .minrow img{width:150px}.minrow .mx{width:70px}.minrow .cap{color:var(--muted);font-size:14px}`,
  `<div class="body"><div class="cs">
     <div>${eyebrow(s.num, s.sect)}<h2 class="head" style="font-size:34px">${s.head}</h2><p class="lead">${s.lead}</p>
       <div class="minrow"><img src="${SYM}"><img class="mx" src="${SYM}"><span class="cap">Never below <b style="color:#fff">240 px</b> digital / <b style="color:#fff">25 mm</b> print</span></div>
     </div>
     <div style="display:flex;justify-content:center"><div class="csbox"><span class="xu top"></span><span class="xu bot"></span><span class="xu lft"></span><span class="xu rgt"></span>${lock(70, 28)}</div></div>
   </div></div>`);

L.misuse = (s, i, t) => page(i, t, '', `
  .mg{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:22px}
  .mc{border:1px solid var(--line);border-radius:16px;background:rgba(255,255,255,.03);padding:18px;display:flex;flex-direction:column;gap:12px}
  .mv{height:78px;display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative}
  .mv img{width:120px}
  .m1 img{filter:hue-rotate(120deg) saturate(2)} .m2 img{transform:scaleX(1.9)} .m3 img{transform:rotate(18deg)}
  .m4 img{filter:drop-shadow(6px 8px 4px rgba(0,0,0,.8))} .m5{background:#33356a;border-radius:8px} .m5 img{opacity:.5}
  .m6 img{transform:scaleX(-1)}
  .mc .lbl{display:flex;gap:9px;align-items:flex-start;color:var(--muted);font-size:14px;line-height:1.35}
  .mc .x{color:#FF6B6B;font-weight:800;flex:none}`,
  `<div class="body">${eyebrow(s.num, s.sect)}<h2 class="head">${s.head}</h2><p class="lead" style="max-width:80ch">${s.lead}</p>
     <div class="mg">${s.dont.map((d, k) => `<div class="mc"><div class="mv m${k + 1}"><img src="${SYM}"></div><div class="lbl"><span class="x">✕</span>${d}</div></div>`).join('')}</div>
   </div>`);

L.palette = (s, i, t) => page(i, t, '', `
  .pg{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:18px}
  .pc{border:1px solid var(--line);border-radius:14px;overflow:hidden;background:rgba(255,255,255,.03);display:flex}
  .pc .chip{width:78px;flex:none}
  .pc .m{padding:12px 16px;display:flex;flex-direction:column;justify-content:center}
  .pc .m b{font-weight:700;font-size:16px;color:#fff}
  .pc .m .hex{font-weight:600;font-size:12px;color:var(--purple-lt);margin-top:3px;letter-spacing:.01em}
  .pc .m .role{font-size:12.5px;color:var(--muted);margin-top:4px}`,
  `<div class="body">${eyebrow(s.num, s.sect)}<h2 class="head">${s.head}</h2><p class="lead" style="max-width:84ch">${s.lead}</p>
     <div class="pg">${s.swatches.map(([n, hex, rgb, role]) => `<div class="pc"><div class="chip" style="background:${hex}"></div><div class="m"><b>${n}</b><div class="hex">${hex} · RGB ${rgb}</div><div class="role">${role}</div></div></div>`).join('')}</div>
   </div>`);

L.balance = (s, i, t) => page(i, t, '', `
  .bwrap{margin-top:30px;border:1px solid var(--line);border-radius:18px;overflow:hidden}
  .brow{display:flex;height:96px;font-weight:700;font-size:18px}
  .brow>div{display:flex;align-items:center;padding-left:22px;color:#fff;overflow:hidden;white-space:nowrap}
  .bleg{display:grid;grid-template-columns:repeat(2,1fr);gap:12px 40px;padding:22px 24px;border-top:1px solid var(--line)}
  .blr{display:flex;gap:12px;align-items:baseline;color:var(--muted);font-size:15px}
  .blr b{color:#fff;font-weight:700;width:52px}`,
  `<div class="body">${eyebrow(s.num, s.sect)}<h2 class="head">${s.head}</h2><p class="lead" style="max-width:84ch">${s.lead}</p>
     <div class="bwrap"><div class="brow">${s.bars.map(([n, f, bg, fg]) => `<div style="flex:${f};background:${bg};color:${fg}">${f < 6 ? '' : n + ' · ' + f + '%'}</div>`).join('')}</div>
       <div class="bleg">${s.bars.map(([n, f, , , d]) => `<div class="blr"><b>~${f}%</b><span><b style="color:#fff">${n}</b> — ${d}</span></div>`).join('')}</div>
     </div>
   </div>`);

L.combos = (s, i, t) => page(i, t, '', `
  .kg{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:24px}
  .kc{border:1px solid var(--line);border-radius:16px;overflow:hidden;background:rgba(255,255,255,.03)}
  .kv{height:80px;display:flex;align-items:center;padding:0 20px;font-weight:800;font-size:26px;position:relative}
  .kx{position:absolute;right:14px;top:12px;color:#FF6B6B;font-weight:800;font-size:20px;background:rgba(0,0,0,.25);border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center}
  .km{padding:12px 18px}.km b{font-weight:700;font-size:15px;color:#fff}.km span{display:block;color:var(--muted);font-size:13px;margin-top:3px}`,
  `<div class="body">${eyebrow(s.num, s.sect)}<h2 class="head">${s.head}</h2><p class="lead" style="max-width:82ch">${s.lead}</p>
     <div class="kg">${s.combos.map(([fg, bg, ttl, why]) => `<div class="kc"><div class="kv" style="background:${bg};color:${fg}">Aa text<span class="kx">✕</span></div><div class="km"><b>${ttl}</b><span>${why}</span></div></div>`).join('')}</div>
   </div>`);

L.typeScale = (s, i, t) => page(i, t, '', `
  .spec{display:flex;gap:14px;margin-top:14px}
  .sw{flex:1;border:1px solid var(--line);border-radius:14px;background:rgba(255,255,255,.03);padding:11px 18px}
  .sw .g{font-size:32px;color:#fff;line-height:1}.sw .l{font-size:12.5px;color:var(--muted);margin-top:6px}
  .ty{margin-top:12px;border:1px solid var(--line);border-radius:16px;overflow:hidden}
  .tr{display:grid;grid-template-columns:150px 1fr;gap:20px;padding:10px 24px;align-items:center;border-bottom:1px solid var(--line)}
  .tr:last-child{border-bottom:0}.tr .tg b{display:block;font-weight:700;font-size:14px;color:#fff}.tr .tg span{font-size:12px;color:var(--muted)}
  .tr .td{color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}`,
  `<div class="body">${eyebrow(s.num, s.sect)}<h2 class="head" style="font-size:36px">${s.head}</h2><p class="lead" style="max-width:82ch">${s.lead}</p>
     <div class="spec"><div class="sw"><div class="g" style="font-weight:800">Aa</div><div class="l">ExtraBold 800 · display</div></div>
       <div class="sw"><div class="g" style="font-weight:700">Aa</div><div class="l">Bold 700 · headlines</div></div>
       <div class="sw"><div class="g" style="font-weight:400">Aa</div><div class="l">Regular 400 · body</div></div></div>
     <div class="ty">${s.scale.map(([n, sp, css, dm]) => `<div class="tr"><div class="tg"><b>${n}</b><span>${sp}</span></div><div class="td" style="${css}">${dm}</div></div>`).join('')}</div>
   </div>`);

L.motif = (s, i, t) => page(i, t, '', `
  .mo{display:grid;grid-template-columns:1fr 1fr;gap:22px;margin-top:26px}
  .moc{border:1px solid var(--line);border-radius:18px;background:rgba(255,255,255,.03);padding:30px;min-height:230px;position:relative;overflow:hidden}
  .moc h3{font-weight:700;font-size:18px;color:#fff;margin-bottom:8px}.moc p{color:var(--muted);font-size:14.5px;line-height:1.5;max-width:32ch}
  .mdemo{position:absolute;right:34px;top:30px;bottom:30px;width:3px;border-radius:3px;background:linear-gradient(180deg,#4B8DF8,#7751FF 50%,#F19526)}
  .mdh{height:3px;border-radius:3px;margin:22px 0 18px;background:linear-gradient(90deg,#4B8DF8,#7751FF 46%,#B36BB0 72%,#F19526)}`,
  `<div class="body">${eyebrow(s.num, s.sect)}<h2 class="head">${s.head}</h2><p class="lead" style="max-width:84ch">${s.lead}</p>
     <div class="mo">
       <div class="moc"><div class="mdemo"></div><h3>Vertical — landscape</h3><p>Splits the reversed logo from the headline on link shares, blog covers and event cards.</p></div>
       <div class="moc"><h3>Horizontal — square & portrait</h3><p>Sits under the logo lockup on insight cards. Amber is reserved for one action.</p><div class="mdh"></div><span class="cta">Read the full article</span></div>
     </div>
   </div>`);

L.imagery = (s, i, t) => page(i, t, '', `
  .im{display:grid;grid-template-columns:1.2fr .8fr;gap:44px;align-items:center;height:100%}
  .ip{display:grid;grid-template-columns:1fr 1fr;gap:18px}
  .ipc{border:1px solid var(--line);border-radius:16px;background:rgba(255,255,255,.03);padding:22px}
  .ipc b{font-weight:700;font-size:17px;color:#fff}.ipc span{display:block;color:var(--muted);font-size:14px;margin-top:7px;line-height:1.45}
  .iglyph{display:flex;align-items:center;justify-content:center}`,
  `<div class="body"><div style="margin-bottom:22px">${eyebrow(s.num, s.sect)}<h2 class="head" style="font-size:34px;margin-bottom:0">${s.head}</h2></div>
     <div class="im">
       <div class="ip">${s.points.map(([b, p]) => `<div class="ipc"><b>${b}</b><span>${p}</span></div>`).join('')}</div>
       <div class="iglyph">${hexStack(280)}</div>
     </div>
   </div>`);

// showcase: one big template image + notes
L.showcase = (s, i, t) => page(i, t, '', `
  .sh{display:grid;grid-template-columns:1.5fr 1fr;gap:44px;align-items:center;height:100%}
  .frame{border:1px solid var(--line);border-radius:14px;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,.4);background:#10102c}
  .frame img{width:100%;display:block}
  .spec{color:var(--purple-lt);font-weight:600;font-size:13px;letter-spacing:.1em;margin-bottom:16px}
  .nlist{display:flex;flex-direction:column;gap:14px;margin-top:6px}
  .nl{display:flex;gap:12px;color:#C4CBE6;font-size:16px;line-height:1.4}.nl .d{color:var(--amber);font-weight:800}`,
  `<div class="body"><div class="sh">
     <div class="frame"><img src="${OUT(s.shot)}" alt=""></div>
     <div>${eyebrow(s.num, s.sect)}<h2 class="head" style="font-size:34px">${s.head}</h2><div class="spec">${s.spec}</div>
       <div class="nlist">${s.notes.map(n => `<div class="nl"><span class="d">→</span>${n}</div>`).join('')}</div></div>
   </div></div>`);

L.showcase2 = (s, i, t) => page(i, t, '', `
  .s2{display:grid;grid-template-columns:1fr 1fr;gap:26px;margin-top:26px;align-items:start;justify-items:center}
  .s2c{display:flex;flex-direction:column;align-items:center}
  .s2c .frame{display:inline-block;line-height:0;border-radius:12px;overflow:hidden;box-shadow:0 18px 44px rgba(0,0,0,.38)}
  .s2c .frame img{display:block;width:auto;height:auto;max-width:520px;max-height:260px}
  .s2c .cap{color:var(--muted);font-size:14px;margin-top:12px;letter-spacing:.03em}
  .s2note{color:#C4CBE6;font-size:16px;margin-top:22px;text-align:center}.s2note b{color:#fff}`,
  `<div class="body">${eyebrow(s.num, s.sect)}<h2 class="head">${s.head}</h2>
     <div class="s2">${s.shots.map(([sh, cap]) => `<div class="s2c"><div class="frame"><img src="${OUT(sh)}"></div><div class="cap">${cap}</div></div>`).join('')}</div>
     <div class="s2note">${s.note}</div>
   </div>`);

L.showcaseGrid = (s, i, t) => page(i, t, '', `
  .gg{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:24px}
  .gc{border:1px solid var(--line);border-radius:12px;overflow:hidden;background:#10102c;height:150px;display:flex;align-items:center;justify-content:center}
  .gc img{max-width:100%;max-height:100%;display:block}`,
  `<div class="body">${eyebrow(s.num, s.sect)}<h2 class="head">${s.head}</h2><p class="lead" style="max-width:88ch">${s.lead}</p>
     <div class="gg">${s.shots.map(sh => `<div class="gc"><img src="${OUT(sh)}"></div>`).join('')}</div>
   </div>`);

// ---- collateral mockups ----
L.bizcard = (s, i, t) => page(i, t, '', `
  .bz{display:grid;grid-template-columns:1fr 1.1fr;gap:48px;align-items:center;height:100%}
  .cards{position:relative;height:360px}
  .bc{position:absolute;width:400px;height:258px;border-radius:16px;box-shadow:0 30px 60px rgba(0,0,0,.45);overflow:hidden}
  .bc.front{left:0;top:20px;transform:rotate(-5deg);background:linear-gradient(150deg,#20205a,#141438);display:flex;align-items:center;justify-content:center}
  .bc.back{right:0;top:80px;transform:rotate(4deg);background:linear-gradient(150deg,#1C1C52,#101030);padding:34px;display:flex;flex-direction:column;justify-content:space-between}
  .bc .dh2{height:2px;width:64px;border-radius:2px;background:linear-gradient(90deg,#4B8DF8,#7751FF,#F19526);margin:6px 0 12px}
  .bc .nm{font-weight:800;font-size:24px;color:#fff}.bc .rl{color:var(--purple-lt);font-weight:600;font-size:14px;margin-top:4px}
  .bc .det{color:#C4CBE6;font-size:13.5px;line-height:1.7}.bc .det .a{color:var(--amber)}`,
  `<div class="body"><div class="bz">
     <div>${eyebrow(s.num, s.sect)}<h2 class="head" style="font-size:34px">${s.head}</h2><p class="lead">${s.lead}</p></div>
     <div class="cards">
       <div class="bc front">${lock(64, 26, { form: 'stacked' })}</div>
       <div class="bc back"><div>${lock(40, 0, { form: 'symbol' })}</div>
         <div><div class="nm">${s.person[0]}</div><div class="rl">${s.person[1]}</div><div class="dh2"></div>
           <div class="det"><span class="a">${s.person[2]}</span><br>${s.person[3]}<br>${s.person[4]}</div></div></div>
     </div>
   </div></div>`);

L.letterhead = (s, i, t) => page(i, t, '', `
  .lh{display:grid;grid-template-columns:1fr 420px;gap:48px;align-items:center;height:100%}
  .sheet{background:#fff;color:#1A1A4E;border-radius:8px;box-shadow:0 30px 70px rgba(0,0,0,.5);padding:40px 44px;height:420px;display:flex;flex-direction:column}
  .sheet .dh2{height:2px;border-radius:2px;background:linear-gradient(90deg,#4B8DF8,#7751FF 50%,#F19526);margin:22px 0}
  .sheet .phl{height:9px;border-radius:5px;background:#E3E9F5;margin-bottom:12px}
  .sheet .phl.s{width:55%}.sheet .phl.h{height:14px;width:70%;background:#C9D3EA;margin-bottom:18px}
  .sheet .ft{margin-top:auto;font-size:11px;color:#8791B0;letter-spacing:.04em}`,
  `<div class="body"><div class="lh">
     <div>${eyebrow(s.num, s.sect)}<h2 class="head" style="font-size:34px">${s.head}</h2><p class="lead">${s.lead}</p></div>
     <div class="sheet">${lock(46, 20, { primary: true })}<div class="dh2"></div>
       <div class="phl h"></div><div class="phl"></div><div class="phl"></div><div class="phl s"></div>
       <div class="phl" style="margin-top:16px"></div><div class="phl"></div><div class="phl s"></div>
       <div class="ft">Smart Value™ AI Solutions · smartvalue.ai · hello@smartvalue.ai</div></div>
   </div></div>`);

L.emailsig = (s, i, t) => page(i, t, '', `
  .es{display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center;height:100%}
  .mail{background:#fff;border-radius:12px;box-shadow:0 26px 60px rgba(0,0,0,.4);overflow:hidden}
  .mail .bar{background:#F1F4FA;padding:14px 20px;border-bottom:1px solid #E3E9F5;color:#8791B0;font-size:13px}
  .mail .bd{padding:22px 24px;color:#3A4066;font-size:14px;line-height:1.6}
  .sig{display:flex;gap:18px;align-items:center;margin-top:22px;padding-top:20px;border-top:2px solid #EEF1F8}
  .sig .sd{border-left:2px solid #E3E9F5;padding-left:16px}
  .sig .nm{font-weight:800;color:#1A1A4E;font-size:16px}.sig .rl{color:#7751FF;font-weight:600;font-size:12.5px;margin:2px 0 6px}
  .sig .ct{color:#6A6F95;font-size:12px}.sig .ct a{color:#7751FF}.sig .amber{color:#F19526;font-weight:700}`,
  `<div class="body"><div class="es">
     <div>${eyebrow(s.num, s.sect)}<h2 class="head" style="font-size:34px">${s.head}</h2><p class="lead">${s.lead}</p></div>
     <div class="mail"><div class="bar">Re: Q2 pricing review — recommendation</div>
       <div class="bd">Hi team, the simulation is ready and my recommendation is attached.<br>Best,
         <div class="sig">${lock(50, 0, { form: 'symbol', primary: true })}
           <div class="sd"><div class="nm">${s.person[0]}</div><div class="rl">${s.person[1]}</div>
             <div class="ct"><a>${s.person[2]}</a> · ${s.person[3]} · <span class="amber">Book a demo →</span></div></div></div>
       </div></div>
   </div></div>`);

L.social = (s, i, t) => page(i, t, '', `
  .so{display:grid;grid-template-columns:250px 1fr;gap:44px;align-items:center;height:100%}
  .av{width:180px;height:180px;border-radius:50%;background:linear-gradient(150deg,#20205a,#141438);display:flex;align-items:center;justify-content:center;box-shadow:0 20px 44px rgba(0,0,0,.4);margin:0 auto 14px}
  .av img{width:110px}.avc{text-align:center;color:var(--muted);font-size:13px}
  .banners{display:flex;flex-direction:column;gap:18px}
  .bn{border-radius:14px;overflow:hidden;background:linear-gradient(120deg,#1C1C52,#101030);border:1px solid var(--line);display:grid;grid-template-columns:auto 2px 1fr;gap:24px;align-items:center;padding:0 34px}
  .bn.li{height:150px}.bn.tw{height:120px}
  .bn .dv{align-self:stretch;margin:24px 0}
  .bn .msg{font-weight:800;font-size:24px;color:#fff}.bn .msg .accent{color:var(--purple-lt)}
  .bn .tag{position:absolute;color:var(--muted);font-size:11px}`,
  `<div class="body"><div class="so">
     <div><div class="av"><img src="${SYM}"></div><div class="avc">Profile · symbol only</div></div>
     <div>${eyebrow(s.num, s.sect)}<h2 class="head" style="font-size:32px;margin-bottom:8px">${s.head}</h2>
       <div class="banners">
         <div class="bn li">${lock(56, 22)}<div class="dv"></div><div class="msg">Better decisions,<br><span class="accent">not more data.</span></div></div>
         <div class="bn tw">${lock(46, 18)}<div class="dv"></div><div class="msg" style="font-size:20px">AI-powered RGM for FMCG.</div></div>
       </div></div>
   </div></div>`);

L.appicon = (s, i, t) => page(i, t, '', `
  .ai{display:grid;grid-template-columns:1fr 1fr;gap:44px;align-items:center;height:100%}
  .icons{display:flex;align-items:flex-end;gap:22px}
  .ic{background:linear-gradient(150deg,#20205a,#101030);border-radius:26%;display:flex;align-items:center;justify-content:center;box-shadow:0 16px 36px rgba(0,0,0,.42)}
  .ic img{width:64%}
  .i1{width:132px;height:132px}.i2{width:92px;height:92px}.i3{width:64px;height:64px}
  .fav{width:34px;height:34px;border-radius:8px;background:#1A1A4E;display:flex;align-items:center;justify-content:center}.fav img{width:70%}
  .favrow{display:flex;align-items:center;gap:12px;margin-top:24px;color:var(--muted);font-size:14px}
  .vbg{margin-top:24px;height:150px;border-radius:14px;border:1px solid var(--line);background:linear-gradient(150deg,#1C1C52,#101030);position:relative;overflow:hidden}
  .vbg .mk{position:absolute;left:22px;top:18px}.vbg .cc{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.25);font-size:13px;letter-spacing:.2em}`,
  `<div class="body"><div class="ai">
     <div>${eyebrow(s.num, s.sect)}<h2 class="head" style="font-size:32px">${s.head}</h2><p class="lead">${s.lead}</p>
       <div class="favrow"><span class="fav"><img src="${SYM}"></span> Favicon drops to the mark at 16–32 px.</div></div>
     <div><div class="icons"><div class="ic i1"><img src="${SYM}"></div><div class="ic i2"><img src="${SYM}"></div><div class="ic i3"><img src="${SYM}"></div></div>
       <div class="vbg"><div class="mk">${lock(40, 16)}</div><div class="cc">SPEAKER AREA KEPT CLEAR</div></div></div>
   </div></div>`);

L.largeformat = (s, i, t) => page(i, t, '', `
  .lf{display:grid;grid-template-columns:1fr auto auto;gap:40px;align-items:center;height:100%}
  .rollup{width:190px;height:440px;border-radius:12px;background:linear-gradient(170deg,#1C1C52,#0E0E2A);box-shadow:0 26px 56px rgba(0,0,0,.5);padding:26px 22px;display:flex;flex-direction:column;align-items:center;text-align:center;border:1px solid var(--line)}
  .rollup .msg{font-weight:800;font-size:24px;color:#fff;margin-top:26px;line-height:1.1}.rollup .msg .accent{color:var(--purple-lt)}
  .rollup .cta{font-size:13px;padding:8px 16px;margin-top:auto}
  .flyer{width:210px;height:300px;border-radius:10px;background:linear-gradient(160deg,#20205a,#101030);box-shadow:0 22px 50px rgba(0,0,0,.48);padding:24px;display:flex;flex-direction:column;border:1px solid var(--line)}
  .flyer .dh2{height:2px;border-radius:2px;background:linear-gradient(90deg,#4B8DF8,#7751FF,#F19526);margin:16px 0}
  .flyer .fh{font-weight:800;font-size:19px;color:#fff;line-height:1.1}.flyer .fp{color:var(--muted);font-size:12px;margin-top:10px;line-height:1.5}`,
  `<div class="body"><div class="lf">
     <div>${eyebrow(s.num, s.sect)}<h2 class="head" style="font-size:32px">${s.head}</h2><p class="lead">${s.lead}</p></div>
     <div class="rollup">${lock(50, 20, { form: 'stacked' })}<div class="msg">Stop guessing<br><span class="accent">the price.</span></div><span class="cta">Book a demo</span></div>
     <div class="flyer">${lock(40, 16)}<div class="dh2"></div><div class="fh">AI-powered RGM for FMCG</div><div class="fp">Pricing, promotion and pack architecture — built on integrated commercial data.</div></div>
   </div></div>`);

L.billboard = (s, i, t) => page(i, t, '', `
  .bb{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:22px}
  .board{width:820px;height:340px;border-radius:14px;background:linear-gradient(150deg,#1C1C52,#101030);box-shadow:0 30px 70px rgba(0,0,0,.5);border:1px solid var(--line);display:grid;grid-template-columns:auto 2px 1fr;gap:44px;align-items:center;padding:0 56px}
  .board .dv{align-self:stretch;margin:56px 0}
  .board .msg{font-weight:800;font-size:56px;color:#fff;line-height:1;letter-spacing:-.01em}.board .msg .accent{color:var(--purple-lt)}
  .stand{width:120px;height:26px;background:linear-gradient(180deg,#2A2A55,#15153a);border-radius:0 0 8px 8px}
  .bhead{align-self:flex-start}`,
  `<div class="body"><div style="position:absolute;left:0;top:0" class="bhead">${eyebrow(s.num, s.sect)}<h2 class="head" style="font-size:32px">${s.head}</h2><p class="lead" style="max-width:80ch">${s.lead}</p></div>
     <div class="bb" style="padding-top:70px">
       <div class="board">${lock(90, 34, { form: 'stacked' })}<div class="dv"></div><div class="msg">${rich(s.message)}</div></div>
       <div class="stand"></div>
     </div>
   </div></div>`);

L.merch = (s, i, t) => page(i, t, '', `
  .mm{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:24px}
  .mi{border:1px solid var(--line);border-radius:16px;background:rgba(255,255,255,.03);height:150px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px}
  .mi .obj{width:100px;height:82px;display:flex;align-items:center;justify-content:center}
  .mi .lab{color:var(--muted);font-size:13px;letter-spacing:.04em}
  .shape{background:linear-gradient(150deg,#22225c,#141438);position:relative;display:flex;align-items:center;justify-content:center}
  .shape img{width:44%}
  .tee{width:92px;height:80px;clip-path:polygon(20% 12%,35% 0,65% 0,80% 12%,100% 26%,84% 42%,84% 100%,16% 100%,16% 42%,0 26%)}
  .tote{width:70px;height:74px;border-radius:6px 6px 8px 8px}
  .mug{width:74px;height:64px;border-radius:8px 8px 10px 10px}
  .cap{width:86px;height:52px;border-radius:44px 44px 8px 8px}
  .nb{width:60px;height:80px;border-radius:6px}
  .lan{width:34px;height:84px;border-radius:6px}
  .stk{width:70px;height:70px;border-radius:16px;transform:rotate(-8deg)}
  .btl{width:40px;height:86px;border-radius:16px 16px 10px 10px}`,
  `<div class="body">${eyebrow(s.num, s.sect)}<h2 class="head">${s.head}</h2><p class="lead" style="max-width:84ch">${s.lead}</p>
     <div class="mm">${s.items.map(([cls, lab]) => `<div class="mi"><div class="obj"><span class="shape ${cls}"><img src="${SYM}"></span></div><span class="lab">${lab}</span></div>`).join('')}</div>
   </div>`);

L.signage = (s, i, t) => page(i, t, '', `
  .sg{display:grid;grid-template-columns:1fr 1fr;gap:44px;align-items:center;height:100%}
  .wall{height:400px;border-radius:14px;background:linear-gradient(160deg,#20205a,#0E0E2A);box-shadow:inset 0 0 120px rgba(0,0,0,.5),0 26px 56px rgba(0,0,0,.4);border:1px solid var(--line);position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center}
  .wall .panel{background:rgba(255,255,255,.04);border:1px solid var(--line);border-radius:12px;padding:44px 54px;backdrop-filter:blur(2px)}
  .wall .glow{position:absolute;width:340px;height:340px;border-radius:50%;background:radial-gradient(circle,rgba(119,81,255,.22),transparent 65%);right:-80px;bottom:-80px}
  .wall .desk{position:absolute;left:0;right:0;bottom:0;height:60px;background:linear-gradient(180deg,#15153a,#0b0b22)}`,
  `<div class="body"><div class="sg">
     <div>${eyebrow(s.num, s.sect)}<h2 class="head" style="font-size:34px">${s.head}</h2><p class="lead">${s.lead}</p></div>
     <div class="wall"><span class="glow"></span><div class="panel">${lock(70, 30, { form: 'stacked' })}</div><span class="desk"></span></div>
   </div></div>`);

L.closing = (s, i, t) => page(i, t, '', `
  .cl{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:26px;padding:0 90px}
  .cl .dh{width:120px;height:2px}
  .cl h1{font-weight:800;font-size:66px;line-height:1;letter-spacing:-.015em;color:#F5F7FF}.cl h1 .accent{color:var(--purple-lt)}
  .cl p{color:#C4CBE6;font-size:20px}
  .cl .contact{color:var(--amber);font-weight:700;font-size:17px;letter-spacing:.04em;display:flex;gap:22px}`,
  `<div class="cl">${lock(120, 46, { form: 'stacked' })}<div class="dh"></div>
     <h1>${lines(s.head)}</h1><p>${s.sub}</p>
     <div class="contact">${s.contact.map(c => `<span>${c}</span>`).join('<span style="color:var(--muted)">·</span>')}</div>
   </div>`, { withMark: false, withFoot: false });

// isometric hex-stack glyph (shared with the templates engine)
function hexStack(size) {
  const cx = size / 2, cy0 = size * 0.60, R = size * 0.34, hh = size * 0.075, sq = 0.5;
  const shade = (hex, f) => { const n = parseInt(hex.slice(1), 16); const r = Math.round(((n >> 16) & 255) * f), g = Math.round(((n >> 8) & 255) * f), b = Math.round((n & 255) * f); return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`; };
  const P = (cy, r, a) => [cx + r * Math.cos(a * Math.PI / 180), cy + r * sq * Math.sin(a * Math.PI / 180)];
  const layer = (cy, r, top) => { const v = {}; [0, 60, 120, 180, 240, 300].forEach(a => v[a] = P(cy, r, a)); const dn = p => [p[0], p[1] + hh]; const poly = (pts, f) => `<polygon points="${pts.map(p => p.map(n => n.toFixed(1)).join(',')).join(' ')}" fill="${f}"/>`; const top6 = [v[0], v[60], v[120], v[180], v[240], v[300]]; return poly([v[0], v[60], dn(v[60]), dn(v[0])], shade(top, .78)) + poly([v[60], v[120], dn(v[120]), dn(v[60])], shade(top, .62)) + poly([v[120], v[180], dn(v[180]), dn(v[120])], shade(top, .70)) + poly(top6, top); };
  return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" style="filter:drop-shadow(0 24px 40px rgba(0,0,0,.35))">${layer(cy0, R, '#3B6FE0')}${layer(cy0 - hh * 2, R * 0.66, '#7751FF')}${layer(cy0 - hh * 4, R * 0.40, '#F19526')}</svg>`;
}

// ---- generate ----
const total = slides.length;
let n = 0;
for (const s of slides) {
  const fn = L[s.layout];
  if (!fn) { console.warn('! no layout:', s.layout); continue; }
  const idx = String(n).padStart(2, '0');
  writeFileSync(join(HTML, `${idx}-${s.layout}.html`), fn(s, n, total));
  console.log(`· ${idx}-${s.layout}`);
  n++;
}
console.log(`generated ${n} / ${total} slides.`);
