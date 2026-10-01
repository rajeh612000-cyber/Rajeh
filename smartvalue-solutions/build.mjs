// Builds the two solution pages and the homepage grid replacement from src/.
//   node build.mjs
// Outputs:
//   dist/elementor/<slug>.html            → paste into ONE Elementor "HTML" widget on that page
//   dist/homepage/solutions-grid.html     → replaces the homepage "standalone solutions" widget code
//   dist/preview/*.html                   → standalone previews for review in a browser
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { SITE, ICONS, PAGES } from './src/content.mjs';
import { PRICE_MODEL, PROMO_MODEL, fmtPct } from './src/svp-models.mjs';

const read = (f) => readFileSync(new URL(f, import.meta.url), 'utf8');
const css = read('./src/svp-solutions.css');
// The browser gets the models inlined ahead of the scene code (one module, no extra request).
const js = read('./src/svp-models.mjs').replace(/^export /gm, '') + '\n' + read('./src/svp-hero-3d.js');
const homeGrid = read('./src/homepage-solutions-grid.html');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const strip = (s) => s.replace(/<[^>]+>/g, '');
const pathOf = (p) => p.path || `${SITE.base}${p.slug}/`;
const urlOf = (p) => SITE.origin + pathOf(p);
const icon = (k) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[k]}</svg>`;
const provider = { '@type': 'Organization', '@id': `${SITE.origin}/#organization`, name: SITE.legalName, url: SITE.origin };
const tone = (x) => (x > 0.05 ? 'is-up' : x < -0.05 ? 'is-down' : '');

/* ---------- hands-on controls (first state written into the HTML) ---------- */

function priceSim() {
  const M = PRICE_MODEL, r = M.at(0), today = ((0 - M.min) / (M.max - M.min)) * 100;
  return `
          <div class="svp-sim" data-svp-sim="price">
            <div class="svp-sim__head">
              <label for="svp-price">Try a price change</label>
              <output for="svp-price" data-k="p">${fmtPct(r.p)}</output>
            </div>
            <input class="svp-range" type="range" id="svp-price" min="${M.min}" max="${M.max}" step="${M.step}" value="0" aria-describedby="svp-sim-note">
            <div class="svp-sim__scale" aria-hidden="true"><span>${fmtPct(M.min, 0)}</span><span style="left:${today}%">Today</span><span>${fmtPct(M.max, 0)}</span></div>
            <dl class="svp-sim__stats">
              <div><dt>Revenue</dt><dd data-k="rev" class="${tone(r.rev)}">${fmtPct(r.rev)}</dd></div>
              <div><dt>Margin</dt><dd data-k="mar" class="${tone(r.mar)}">${fmtPct(r.mar)}</dd></div>
              <div><dt>Volume</dt><dd data-k="vol" class="${tone(r.vol)}">${fmtPct(r.vol)}</dd></div>
            </dl>
            <p class="svp-sim__verdict" data-k="verdict" aria-live="polite">${esc(M.verdict(r))}</p>
            <div class="svp-sim__foot">
              <p class="svp-sim__note" id="svp-sim-note">Illustrative category model, not client data. Guardrail: volume no worse than ${fmtPct(M.guardrail, 0)}.</p>
              <button type="button" class="svp-sim__best" data-svp-best>Show recommended</button>
            </div>
          </div>`;
}

function promoSim() {
  const P = PROMO_MODEL, b = P.bestIndex(), pr = P.promos[b];
  return `
          <fieldset class="svp-sim" data-svp-sim="promo">
            <legend>Pick a promotion</legend>
            <div class="svp-seg">
              ${P.promos.map((x, i) => `<input type="radio" name="svp-promo" id="svp-promo-${i}" value="${i}"${i === b ? ' checked' : ''}><label for="svp-promo-${i}">${esc(x.label)}</label>`).join('\n              ')}
            </div>
            <dl class="svp-sim__stats">
              <div><dt>Incremental volume</dt><dd data-k="inc" class="is-up">${fmtPct(pr.uplift, 0)}</dd></div>
              <div><dt>Dip afterwards</dt><dd data-k="dip" class="is-down">${fmtPct(-pr.dip, 0)}</dd></div>
              <div><dt>Return on spend</dt><dd data-k="roi" class="${pr.roi >= 1 ? 'is-up' : 'is-down'}">${pr.roi.toFixed(1)}×</dd></div>
            </dl>
            <p class="svp-sim__verdict" data-k="verdict" aria-live="polite">${esc(pr.note)}</p>
            <p class="svp-sim__note">Illustrative promotions on one SKU, not client data.</p>
          </fieldset>`;
}

/* ---------- sections ---------- */

function hero(p) {
  return `
  <section class="svp-hero" aria-labelledby="svp-h1">
    <div class="svp-wrap">
      <nav class="svp-crumbs" aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li><li><span aria-current="page">${esc(p.name)}</span></li></ol></nav>
      <div class="svp-hero__grid">
        <div>
          <p class="svp-eyebrow">${esc(p.eyebrow)}</p>
          <h1 id="svp-h1">${p.h1}</h1>
          <p class="svp-hero__lede">${esc(p.lede)}</p>
          <div class="svp-btns">
            <a class="svp-btn svp-btn--primary" href="${SITE.contact}">${esc(p.primaryCta)}</a>
            <a class="svp-btn svp-btn--ghost" href="#how-it-works">See how it works</a>
          </div>
          <p class="svp-hero__note"><span class="svp-dot"></span>Standalone solution. No bundle, no full-suite commitment.</p>
        </div>
        <div class="svp-hero__side">
          <div class="svp-hero__visual">
            <canvas class="svp-hero__canvas" data-svp-scene="${p.scene}" role="img" aria-label="${esc(p.visualLabel)}"></canvas>
          </div>
          <div class="svp-hero__legend">${p.legend.map(([c, t]) => `<span><i class="svp-sw svp-sw--${c}"></i>${esc(t)}</span>`).join('')}</div>${p.sim === 'price' ? priceSim() : p.sim === 'promo' ? promoSim() : ''}
        </div>
      </div>
    </div>
  </section>`;
}

const solutionCard = (o) => `<a class="svp-card svp-reveal" href="${pathOf(o)}"><span class="svp-card__num">${o.num}</span><div class="svp-icon">${icon(o.icon)}</div><h3>${esc(o.name)}</h3><p>${esc(o.card)}</p><span class="svp-more">Explore ${esc(o.name)} →</span></a>`;

function schema(p) {
  const graph = [
    { '@type': 'Service', '@id': `${urlOf(p)}#service`, name: p.name, description: p.metaDescription, url: urlOf(p), provider },
    { '@type': 'FAQPage', '@id': `${urlOf(p)}#faq`,
      mainEntity: p.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
  ];
  return `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph })}</script>`;
}

function scenarioSection(sc) {
  return `
  <section class="svp-section" id="${sc.id}" aria-labelledby="svp-scenario-h">
    <div class="svp-wrap svp-split">
      <div class="svp-reveal">
        <h2 id="svp-scenario-h">${esc(sc.h2)}</h2>
        <p>${esc(sc.intro)}</p>
        <ul class="svp-checks">
          ${sc.points.map(([h, t]) => `<li><div><strong>${esc(h)}</strong><span>${esc(t)}</span></div></li>`).join('\n          ')}
        </ul>
      </div>
      <figure class="svp-scenarios svp-reveal">
        <div class="svp-scenarios__scroll">
          <table>
            <caption>Price scenarios compared on revenue, margin and volume</caption>
            <thead><tr><th scope="col">Scenario</th><th scope="col">Revenue</th><th scope="col">Margin</th><th scope="col">Volume</th></tr></thead>
            <tbody>
              ${sc.rows.map(([id, label, r, m, v, best]) => `<tr${best ? ' class="is-best"' : ''}><th scope="row"><span class="svp-scn">${esc(id)}</span>${esc(label)}${best ? ' <span class="svp-pill">Recommended</span>' : ''}</th>${[r, m, v].map((x) => `<td class="${x.startsWith('+') ? 'is-up' : 'is-down'}">${esc(x)}</td>`).join('')}</tr>`).join('\n              ')}
            </tbody>
          </table>
        </div>
        <figcaption>${esc(sc.note)}</figcaption>
      </figure>
    </div>
  </section>`;
}

function body(p) {
  const related = [SITE.related, ...PAGES].filter((o) => o.key !== p.key);
  const video = p.video ? `
  <section class="svp-section" aria-labelledby="svp-video-h">
    <div class="svp-wrap">
      <div class="svp-section__head svp-reveal"><h2 id="svp-video-h">${esc(p.video.title)}</h2><p>${esc(p.video.caption)}</p></div>
      <figure class="svp-hero__visual svp-reveal" style="aspect-ratio:16/9;max-width:960px;margin:0 auto">
        <video class="svp-hero__canvas" data-svp-video muted loop playsinline preload="none" poster="${esc(p.video.poster)}" width="1280" height="720" aria-label="${esc(p.video.caption)}">
          <source src="${esc(p.video.src)}" type="video/mp4">
        </video>
      </figure>
    </div>
  </section>` : '';

  return `
<div class="svp-page" data-svp-solution="${p.key}">${hero(p)}

  <section class="svp-section" aria-labelledby="svp-problem-h">
    <div class="svp-wrap">
      <div class="svp-section__head svp-reveal"><h2 id="svp-problem-h">${esc(p.problem.h2)}</h2><p>${esc(p.problem.intro)}</p></div>
      <div class="svp-grid svp-grid--3">
        ${p.problem.items.map(([ic, h, t]) => `<article class="svp-card svp-reveal"><div class="svp-icon">${icon(ic)}</div><h3>${esc(h)}</h3><p>${esc(t)}</p></article>`).join('\n        ')}
      </div>
    </div>
  </section>

  <section class="svp-section svp-section--soft" aria-labelledby="svp-answers-h">
    <div class="svp-wrap">
      <div class="svp-section__head svp-reveal"><h2 id="svp-answers-h">${esc(p.answers.h2)}</h2><p>${esc(p.answers.intro)}</p></div>
      <div class="svp-grid svp-grid--2">
        ${p.answers.items.map(([q, a], i) => `<article class="svp-card svp-q svp-reveal"><span class="svp-card__num">0${i + 1}</span><h3>${esc(q)}</h3><p>${esc(a)}</p></article>`).join('\n        ')}
      </div>
    </div>
  </section>
${p.scenario ? scenarioSection(p.scenario) : ''}
  <section class="svp-section${p.scenario ? ' svp-section--soft' : ''}" id="how-it-works" aria-labelledby="svp-how-h">
    <div class="svp-wrap">
      <div class="svp-section__head svp-reveal"><h2 id="svp-how-h">How ${esc(p.name)} works</h2><p>From your data to a decision in four steps.</p></div>
      <ol class="svp-steps">
        ${p.steps.map(([h, t]) => `<li class="svp-reveal"><h3>${esc(h)}</h3><p>${esc(t)}</p></li>`).join('\n        ')}
      </ol>
      <p class="svp-platform-note svp-reveal">Runs on the Smart Value™ platform: start from your data with <a href="${SITE.platform[0].path}">Commercial Analytics</a>, and ask questions in plain language with <a href="${SITE.platform[1].path}">SmartBot</a>.</p>
    </div>
  </section>
${video}
  <section class="svp-section${p.scenario ? '' : ' svp-section--soft'}" aria-labelledby="svp-who-h">
    <div class="svp-wrap svp-split">
      <div class="svp-reveal">
        <h2 id="svp-who-h">${esc(p.audience.h2)}</h2>
        <ul class="svp-checks">
          ${p.audience.items.map(([h, t]) => `<li><div><strong>${esc(h)}</strong><span>${esc(t)}</span></div></li>`).join('\n          ')}
        </ul>
      </div>
      <aside class="svp-quote svp-reveal">
        <span class="svp-pill"><span class="svp-dot"></span>${esc(p.name)}</span>
        <h3 style="margin-top:20px">${esc(p.audience.panelTitle)}</h3>
        <p>${esc(p.audience.panelText)}</p>
      </aside>
    </div>
  </section>

  <section class="svp-section${p.scenario ? ' svp-section--soft' : ''}" aria-labelledby="svp-faq-h">
    <div class="svp-wrap">
      <div class="svp-section__head svp-reveal"><h2 id="svp-faq-h">Questions about ${esc(p.name)}</h2></div>
      <div class="svp-faq">
        ${p.faq.map(([q, a]) => `<details class="svp-reveal"><summary>${esc(q)}</summary><div><p>${esc(a)}</p></div></details>`).join('\n        ')}
      </div>
    </div>
  </section>

  <section class="svp-section${p.scenario ? '' : ' svp-section--soft'} svp-related" aria-labelledby="svp-related-h">
    <div class="svp-wrap">
      <div class="svp-section__head svp-reveal"><h2 id="svp-related-h">Pair it with another solution</h2><p>Each Smart Value™ solution is built, sold and used on its own. Take one, or take all three.</p></div>
      <div class="svp-grid svp-grid--2">
        ${related.map(solutionCard).join('\n        ')}
      </div>
    </div>
  </section>

  <section class="svp-section">
    <div class="svp-wrap">
      <div class="svp-cta svp-reveal">
        <h2>See ${esc(p.name)} on your own data</h2>
        <p>Bring your categories, your retailers and your questions. We will show you what the answers look like.</p>
        <div class="svp-btns">
          <a class="svp-btn svp-btn--primary" href="${SITE.contact}">${esc(p.primaryCta)}</a>
          <a class="svp-btn svp-btn--ghost" href="${SITE.allSolutions}">See all solutions</a>
        </div>
      </div>
    </div>
  </section>
</div>`;
}

/* ---------- output ---------- */

const videoJs = `
/* Lazy-play optional North Noir loops: never downloaded until on screen. */
document.querySelectorAll('video[data-svp-video]').forEach((v) => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  new IntersectionObserver(([e]) => { e.isIntersecting ? v.play().catch(() => {}) : v.pause(); }, { threshold: 0.35 }).observe(v);
});`;

const snippet = (p) => `<!-- Smart Value · ${p.name} · generated by build.mjs – paste into one Elementor HTML widget -->
<style>${css}</style>
${body(p)}
${schema(p)}
<script type="module">${js}${p.video ? videoJs : ''}</script>
`;

const shell = ({ title, description, canonical, nav, content }) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
${description ? `<meta name="description" content="${esc(description)}">\n` : ''}${canonical ? `<link rel="canonical" href="${canonical}">\n` : ''}<meta name="robots" content="noindex">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&display=swap" rel="stylesheet">
<style>
  body { margin: 0; background: #fff; }
  .pv-bar { position: sticky; top: 0; z-index: 10; background: #fff; box-shadow: 0 6px 20px -12px rgba(26,26,78,.35); font-family: Sora, system-ui, sans-serif; }
  .pv-bar__in { max-width: 1180px; margin: 0 auto; padding: 14px 24px; display: flex; flex-wrap: wrap; gap: 8px 22px; align-items: center; }
  .pv-bar strong { color: #1a1a4e; margin-right: auto; }
  .pv-bar a { color: #1a1a4e; text-decoration: none; font-weight: 600; font-size: .9375rem; }
  .pv-bar a[aria-current] { color: #534ab7; box-shadow: inset 0 -2px #534ab7; }
  .pv-note { background: #1a1a4e; color: #fff; font: 13px/1.5 system-ui, sans-serif; text-align: center; padding: 6px 16px; }
</style>
</head>
<body>
<div class="pv-note">Preview only. On WordPress, your theme's header and footer wrap the content below.</div>
<header class="pv-bar"><div class="pv-bar__in"><strong>Smart Value™ · Solutions</strong>${nav}</div></header>
${content}
</body>
</html>
`;

const navFor = (current) => [...PAGES.map((o) => [`./${o.slug}.html`, o.name, o.key]), ['./homepage-grid.html', 'Homepage grid', 'grid']]
  .map(([href, label, key]) => `<a href="${href}"${key === current ? ' aria-current="page"' : ''}>${esc(label)}</a>`).join('');

const out = (f, s) => writeFileSync(new URL(f, import.meta.url), s);
rmSync(new URL('./dist/', import.meta.url), { recursive: true, force: true });   // no stale pages left to paste by mistake
for (const d of ['elementor', 'preview', 'homepage']) mkdirSync(new URL(`./dist/${d}/`, import.meta.url), { recursive: true });

for (const p of PAGES) {
  out(`./dist/elementor/${p.slug}.html`, snippet(p));
  out(`./dist/preview/${p.slug}.html`, shell({ title: p.seoTitle, description: p.metaDescription, canonical: urlOf(p), nav: navFor(p.key), content: snippet(p) }));
  const t = strip(p.seoTitle).length, d = p.metaDescription.length;
  console.log(`${p.slug.padEnd(20)} title ${t} chars${t > 60 ? ' ⚠' : ''} · description ${d} chars${d > 160 ? ' ⚠' : ''} · ${urlOf(p)}`);
}
out('./dist/homepage/solutions-grid.html', homeGrid);
out('./dist/preview/homepage-grid.html', shell({ title: 'Homepage solutions grid (preview)', nav: navFor('grid'), content: homeGrid }));
console.log('homepage grid → dist/homepage/solutions-grid.html');
