// Builds the /solutions/ hub and the three solution pages from src/.
//   node build.mjs
// Outputs:
//   dist/elementor/<slug>.html  → paste into ONE Elementor "HTML" widget
//   dist/preview/<slug>.html    → full standalone page for review in a browser
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { SITE, ICONS, PAGES, HUB } from './src/content.mjs';

const css = readFileSync(new URL('./src/svp-solutions.css', import.meta.url), 'utf8');
const js = readFileSync(new URL('./src/svp-hero-3d.js', import.meta.url), 'utf8');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const strip = (s) => s.replace(/<[^>]+>/g, '');
const pathOf = (p) => (p === HUB ? SITE.hub.path : `${SITE.base}${p.slug}/`);
const urlOf = (p) => SITE.origin + pathOf(p);
const icon = (k) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[k]}</svg>`;
const allSolutions = SITE.hub ? SITE.hub.path : '/';
const bySlug = Object.fromEntries(PAGES.map((p) => [p.slug, p]));
const provider = { '@type': 'Organization', '@id': `${SITE.origin}/#organization`, name: SITE.legalName, url: SITE.origin };

/* ---------- shared sections ---------- */

function hero(p, crumbs, secondary, note) {
  return `
  <section class="svp-hero" aria-labelledby="svp-h1">
    <div class="svp-wrap">
      <nav class="svp-crumbs" aria-label="Breadcrumb"><ol>${crumbs}</ol></nav>
      <div class="svp-hero__grid">
        <div>
          <p class="svp-eyebrow">${esc(p.eyebrow)}</p>
          <h1 id="svp-h1">${p.h1}</h1>
          <p class="svp-hero__lede">${esc(p.lede)}</p>
          <div class="svp-btns">
            <a class="svp-btn svp-btn--primary" href="${SITE.contact}">${esc(p.primaryCta)}</a>
            <a class="svp-btn svp-btn--ghost" href="${secondary[0]}">${esc(secondary[1])}</a>
          </div>
          <p class="svp-hero__note"><span class="svp-dot"></span>${esc(note)}</p>
        </div>
        <div class="svp-hero__visual">
          <canvas class="svp-hero__canvas" data-svp-scene="${p.scene}" role="img" aria-label="${esc(p.visualLabel)}"></canvas>
          <div class="svp-hero__legend">${p.legend.map(([c, t]) => `<span><i class="svp-sw svp-sw--${c}"></i>${esc(t)}</span>`).join('')}</div>
        </div>
      </div>
    </div>
  </section>`;
}

const faqSection = (name, faq, soft) => `
  <section class="svp-section${soft ? ' svp-section--soft' : ''}" aria-labelledby="svp-faq-h">
    <div class="svp-wrap">
      <div class="svp-section__head svp-reveal"><h2 id="svp-faq-h">Questions about ${esc(name)}</h2></div>
      <div class="svp-faq">
        ${faq.map(([q, a]) => `<details class="svp-reveal"><summary>${esc(q)}</summary><div><p>${esc(a)}</p></div></details>`).join('\n        ')}
      </div>
    </div>
  </section>`;

const ctaSection = (h2, text, primary, ghost) => `
  <section class="svp-section">
    <div class="svp-wrap">
      <div class="svp-cta svp-reveal">
        <h2>${esc(h2)}</h2>
        <p>${esc(text)}</p>
        <div class="svp-btns">
          <a class="svp-btn svp-btn--primary" href="${SITE.contact}">${esc(primary)}</a>
          <a class="svp-btn svp-btn--ghost" href="${ghost[0]}">${esc(ghost[1])}</a>
        </div>
      </div>
    </div>
  </section>`;

const solutionCard = (o) => `<a class="svp-card svp-reveal" href="${pathOf(o)}"><span class="svp-card__num">${o.num}</span><div class="svp-icon">${icon(o.icon)}</div><h3>${esc(o.name)}</h3><p>${esc(o.card)}</p><span class="svp-more">Explore ${esc(o.name)} →</span></a>`;

const platformNote = () => `
      <p class="svp-platform-note svp-reveal">Runs on the Smart Value™ platform: start from your data with <a href="${SITE.platform[0].path}">Commercial Analytics</a>, and ask questions in plain language with <a href="${SITE.platform[1].path}">SmartBot</a>.</p>`;

/* ---------- solution page ---------- */

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
  const others = PAGES.filter((o) => o.key !== p.key);
  const crumbs = [
    `<li><a href="/">Home</a></li>`,
    SITE.hub ? `<li><a href="${SITE.hub.path}">${esc(SITE.hub.name)}</a></li>` : '',
    `<li><span aria-current="page">${esc(p.name)}</span></li>`,
  ].join('');

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
<div class="svp-page" data-svp-solution="${p.key}">${hero(p, crumbs, ['#how-it-works', 'See how it works'], 'Standalone solution. No bundle, no full-suite commitment.')}

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
      </ol>${platformNote()}
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
${faqSection(p.name, p.faq, !!p.scenario)}

  <section class="svp-section${p.scenario ? '' : ' svp-section--soft'} svp-related" aria-labelledby="svp-related-h">
    <div class="svp-wrap">
      <div class="svp-section__head svp-reveal"><h2 id="svp-related-h">Pair it with another solution</h2><p>Each Smart Value™ solution is built, sold and used on its own. Take one, or take all four.</p></div>
      <div class="svp-grid svp-grid--2">
        ${others.map(solutionCard).join('\n        ')}
      </div>
    </div>
  </section>
${ctaSection(`See ${p.name} on your own data`, 'Bring your categories, your retailers and your questions. We will show you what the answers look like.', p.primaryCta, [allSolutions, 'See all solutions'])}
</div>`;
}

/* ---------- /solutions/ hub ---------- */

function hubSchema() {
  const graph = [
    { '@type': 'ItemList', '@id': `${urlOf(HUB)}#solutions`, name: 'Smart Value™ solutions',
      itemListElement: PAGES.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: urlOf(p), name: p.name })) },
    { '@type': 'FAQPage', '@id': `${urlOf(HUB)}#faq`,
      mainEntity: HUB.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
  ];
  return `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph })}</script>`;
}

function hubBody() {
  const h = HUB, l = h.launch;
  const crumbs = `<li><a href="/">Home</a></li><li><span aria-current="page">${esc(h.name)}</span></li>`;
  const guideRow = ([q, target]) => {
    const p = bySlug[target];
    const link = p
      ? `<a class="svp-guide__to" href="${pathOf(p)}">${esc(p.name)} →</a>`
      : `<a class="svp-guide__to" href="${SITE.contact}">${esc(l.name)}: talk to us →</a>`;
    return `<li class="svp-reveal"><h3>“${esc(q)}”</h3>${link}</li>`;
  };
  return `
<div class="svp-page" data-svp-solution="${h.key}">${hero(h, crumbs, ['#which-first', 'Which one first?'], 'Standalone solutions. No bundle, no full-suite commitment.')}

  <section class="svp-section svp-related" id="all-solutions" aria-labelledby="svp-all-h">
    <div class="svp-wrap">
      <div class="svp-section__head svp-reveal"><h2 id="svp-all-h">Four solutions, one decision each</h2><p>Not one answer, but <strong class="svp-hl">the right decision</strong> for each product, channel, and customer.</p></div>
      <div class="svp-grid svp-grid--4">
        ${PAGES.map(solutionCard).join('\n        ')}
        <article class="svp-card svp-reveal"><span class="svp-card__num">${l.num}</span><div class="svp-icon">${icon(l.icon)}</div><h3>${esc(l.name)}</h3><p>${esc(l.card)}</p><span class="svp-pill" style="margin-top:16px"><span class="svp-dot"></span>${esc(l.pill)}</span></article>
      </div>
    </div>
  </section>

  <section class="svp-section svp-section--soft" id="which-first" aria-labelledby="svp-guide-h">
    <div class="svp-wrap">
      <div class="svp-section__head svp-reveal"><h2 id="svp-guide-h">${esc(h.guide.h2)}</h2><p>${esc(h.guide.intro)}</p></div>
      <ul class="svp-guide">
        ${h.guide.items.map(guideRow).join('\n        ')}
      </ul>
    </div>
  </section>

  <section class="svp-section svp-related" aria-labelledby="svp-platform-h">
    <div class="svp-wrap">
      <div class="svp-section__head svp-reveal"><h2 id="svp-platform-h">${esc(h.platform.h2)}</h2><p>${esc(h.platform.intro)}</p></div>
      <div class="svp-grid svp-grid--2">
        ${SITE.platform.map((x) => `<a class="svp-card svp-reveal" href="${x.path}"><div class="svp-icon">${icon(x.icon)}</div><p class="svp-tag">${esc(x.tag)}</p><h3>${esc(x.name)}</h3><p>${esc(x.text)}</p><span class="svp-more">Explore ${esc(x.name.replace(/ \(.*\)/, ''))} →</span></a>`).join('\n        ')}
      </div>
    </div>
  </section>
${faqSection('the solutions', h.faq, true)}
${ctaSection('Not sure where to start?', 'Tell us the decision on your desk this quarter. We will show you which solution answers it, using your own data.', h.primaryCta, ['#all-solutions', 'Compare the solutions'])}
</div>`;
}

/* ---------- output ---------- */

const videoJs = `
/* Lazy-play optional North Noir loops: never downloaded until on screen. */
document.querySelectorAll('video[data-svp-video]').forEach((v) => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  new IntersectionObserver(([e]) => { e.isIntersecting ? v.play().catch(() => {}) : v.pause(); }, { threshold: 0.35 }).observe(v);
});`;

function snippet(p) {
  const isHub = p === HUB;
  return `<!-- Smart Value · ${p.name} · generated by build.mjs – paste into one Elementor HTML widget -->
<style>${css}</style>
${isHub ? hubBody() : body(p)}
${isHub ? hubSchema() : schema(p)}
<script type="module">${js}${p.video ? videoJs : ''}</script>
`;
}

function preview(p) {
  const file = (o) => `./${o === HUB ? 'solutions' : o.slug}.html`;
  const nav = [HUB, ...PAGES].map((o) => `<a href="${file(o)}"${o === p ? ' aria-current="page"' : ''}>${esc(o === HUB ? 'All solutions' : o.name)}</a>`).join('');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(p.seoTitle)}</title>
<meta name="description" content="${esc(p.metaDescription)}">
<link rel="canonical" href="${urlOf(p)}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(p.seoTitle)}">
<meta property="og:description" content="${esc(p.metaDescription)}">
<meta property="og:url" content="${urlOf(p)}">
<meta name="robots" content="noindex">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&display=swap" rel="stylesheet">
<style>
  body { margin: 0; background: #fff; }
  .pv-bar { position: sticky; top: 0; z-index: 10; background: #fff; box-shadow: 0 6px 20px -12px rgba(26,26,78,.35);
    font-family: Sora, system-ui, sans-serif; }
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
${snippet(p)}
</body>
</html>
`;
}

mkdirSync(new URL('./dist/elementor/', import.meta.url), { recursive: true });
mkdirSync(new URL('./dist/preview/', import.meta.url), { recursive: true });
for (const p of [HUB, ...PAGES]) {
  const slug = p === HUB ? 'solutions' : p.slug;
  writeFileSync(new URL(`./dist/elementor/${slug}.html`, import.meta.url), snippet(p));
  writeFileSync(new URL(`./dist/preview/${slug}.html`, import.meta.url), preview(p));
  const t = strip(p.seoTitle).length, d = p.metaDescription.length;
  console.log(`${slug.padEnd(22)} title ${t} chars${t > 60 ? ' ⚠' : ''} · description ${d} chars${d > 160 ? ' ⚠' : ''} · ${urlOf(p)}`);
}
