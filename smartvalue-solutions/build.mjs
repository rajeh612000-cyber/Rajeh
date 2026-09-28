// Builds the three solution pages from src/.
//   node build.mjs
// Outputs:
//   dist/elementor/<slug>.html  → paste into ONE Elementor "HTML" widget
//   dist/preview/<slug>.html    → full standalone page for review in a browser
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { SITE, ICONS, PAGES } from './src/content.mjs';

const css = readFileSync(new URL('./src/sv-solutions.css', import.meta.url), 'utf8');
const js = readFileSync(new URL('./src/sv-hero-3d.js', import.meta.url), 'utf8');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const strip = (s) => s.replace(/<[^>]+>/g, '');
const pathOf = (p) => `${SITE.base}${p.slug}/`;
const urlOf = (p) => SITE.origin + pathOf(p);
const icon = (k) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[k]}</svg>`;
const allSolutions = SITE.hub ? SITE.hub.path : '/';

function schema(p) {
  const graph = [
    {
      '@type': 'Service',
      '@id': `${urlOf(p)}#service`,
      name: p.name,
      description: p.metaDescription,
      url: urlOf(p),
      provider: { '@type': 'Organization', '@id': `${SITE.origin}/#organization`, name: SITE.legalName, url: SITE.origin },
    },
    {
      '@type': 'FAQPage',
      '@id': `${urlOf(p)}#faq`,
      mainEntity: p.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
    },
  ];
  return `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph })}</script>`;
}

function body(p) {
  const others = PAGES.filter((o) => o.key !== p.key);
  const crumbs = [
    `<li><a href="/">Home</a></li>`,
    SITE.hub ? `<li><a href="${SITE.hub.path}">${esc(SITE.hub.name)}</a></li>` : '',
    `<li><span aria-current="page">${esc(p.name)}</span></li>`,
  ].join('');

  const video = p.video ? `
  <section class="sv-section" aria-labelledby="sv-video-h">
    <div class="sv-wrap">
      <div class="sv-section__head sv-reveal"><h2 id="sv-video-h">${esc(p.video.title)}</h2><p>${esc(p.video.caption)}</p></div>
      <figure class="sv-hero__visual sv-reveal" style="aspect-ratio:16/9;max-width:960px;margin:0 auto">
        <video class="sv-hero__canvas" data-sv-video muted loop playsinline preload="none" poster="${esc(p.video.poster)}" width="1280" height="720" aria-label="${esc(p.video.caption)}">
          <source src="${esc(p.video.src)}" type="video/mp4">
        </video>
      </figure>
    </div>
  </section>` : '';

  return `
<div class="sv-page" data-sv-solution="${p.key}">
  <section class="sv-hero" aria-labelledby="sv-h1">
    <div class="sv-wrap">
      <nav class="sv-crumbs" aria-label="Breadcrumb"><ol>${crumbs}</ol></nav>
      <div class="sv-hero__grid">
        <div>
          <p class="sv-eyebrow"><span class="sv-dot"></span>${esc(p.eyebrow)}</p>
          <h1 id="sv-h1">${p.h1}</h1>
          <p class="sv-hero__lede">${esc(p.lede)}</p>
          <div class="sv-btns">
            <a class="sv-btn sv-btn--primary" href="${SITE.contact}">${esc(p.primaryCta)}</a>
            <a class="sv-btn sv-btn--ghost" href="#how-it-works">See how it works</a>
          </div>
          <p class="sv-hero__note"><span class="sv-dot"></span>Standalone module. No bundle, no full-suite commitment.</p>
        </div>
        <div class="sv-hero__visual">
          <canvas class="sv-hero__canvas" data-sv-scene="${p.scene}" role="img" aria-label="${esc(p.visualLabel)}"></canvas>
          <div class="sv-hero__legend">${p.legend.map(([c, t]) => `<span><i class="sv-sw sv-sw--${c}"></i>${esc(t)}</span>`).join('')}</div>
        </div>
      </div>
    </div>
  </section>

  <section class="sv-section" aria-labelledby="sv-problem-h">
    <div class="sv-wrap">
      <div class="sv-section__head sv-reveal"><h2 id="sv-problem-h">${esc(p.problem.h2)}</h2><p>${esc(p.problem.intro)}</p></div>
      <div class="sv-grid sv-grid--3">
        ${p.problem.items.map(([ic, h, t]) => `<article class="sv-card sv-reveal"><div class="sv-icon">${icon(ic)}</div><h3>${esc(h)}</h3><p>${esc(t)}</p></article>`).join('\n        ')}
      </div>
    </div>
  </section>

  <section class="sv-section sv-section--soft" aria-labelledby="sv-answers-h">
    <div class="sv-wrap">
      <div class="sv-section__head sv-reveal"><h2 id="sv-answers-h">${esc(p.answers.h2)}</h2><p>${esc(p.answers.intro)}</p></div>
      <div class="sv-grid sv-grid--2">
        ${p.answers.items.map(([q, a], i) => `<article class="sv-card sv-q sv-reveal"><span class="sv-card__num">0${i + 1}</span><h3>${esc(q)}</h3><p>${esc(a)}</p></article>`).join('\n        ')}
      </div>
    </div>
  </section>

  <section class="sv-section" id="how-it-works" aria-labelledby="sv-how-h">
    <div class="sv-wrap">
      <div class="sv-section__head sv-reveal"><h2 id="sv-how-h">How ${esc(p.name)} works</h2><p>From your data to a decision in four steps.</p></div>
      <ol class="sv-steps">
        ${p.steps.map(([h, t]) => `<li class="sv-reveal"><h3>${esc(h)}</h3><p>${esc(t)}</p></li>`).join('\n        ')}
      </ol>
    </div>
  </section>
${video}
  <section class="sv-section sv-section--soft" aria-labelledby="sv-who-h">
    <div class="sv-wrap sv-split">
      <div class="sv-reveal">
        <h2 id="sv-who-h">${esc(p.audience.h2)}</h2>
        <ul class="sv-checks">
          ${p.audience.items.map(([h, t]) => `<li><div><strong>${esc(h)}</strong><span>${esc(t)}</span></div></li>`).join('\n          ')}
        </ul>
      </div>
      <aside class="sv-quote sv-reveal">
        <span class="sv-pill"><span class="sv-dot"></span>${esc(p.name)}</span>
        <h3 style="margin-top:20px">${esc(p.audience.panelTitle)}</h3>
        <p>${esc(p.audience.panelText)}</p>
      </aside>
    </div>
  </section>

  <section class="sv-section" aria-labelledby="sv-faq-h">
    <div class="sv-wrap">
      <div class="sv-section__head sv-reveal"><h2 id="sv-faq-h">Questions about ${esc(p.name)}</h2></div>
      <div class="sv-faq">
        ${p.faq.map(([q, a]) => `<details class="sv-reveal"><summary>${esc(q)}</summary><div><p>${esc(a)}</p></div></details>`).join('\n        ')}
      </div>
    </div>
  </section>

  <section class="sv-section sv-section--soft sv-related" aria-labelledby="sv-related-h">
    <div class="sv-wrap">
      <div class="sv-section__head sv-reveal"><h2 id="sv-related-h">Pair it with another module</h2><p>Every Smart Value module works on its own. Take one, or take all four.</p></div>
      <div class="sv-grid sv-grid--2">
        ${others.map((o) => `<a class="sv-card sv-reveal" href="${pathOf(o)}"><span class="sv-card__num">${o.num}</span><div class="sv-icon">${icon(o.icon)}</div><h3>${esc(o.name)}</h3><p>${esc(o.card)}</p><span class="sv-more">Explore ${esc(o.name)} →</span></a>`).join('\n        ')}
      </div>
    </div>
  </section>

  <section class="sv-section">
    <div class="sv-wrap">
      <div class="sv-cta sv-reveal">
        <h2>See ${esc(p.name)} on your own data</h2>
        <p>Bring your categories, your retailers and your questions. We will show you what the answers look like.</p>
        <div class="sv-btns">
          <a class="sv-btn sv-btn--primary" href="${SITE.contact}">${esc(p.primaryCta)}</a>
          <a class="sv-btn sv-btn--ghost" href="${allSolutions}">See all solutions</a>
        </div>
      </div>
    </div>
  </section>
</div>`;
}

const videoJs = `
/* Lazy-play optional North Noir loops: never downloaded until on screen. */
document.querySelectorAll('video[data-sv-video]').forEach((v) => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  new IntersectionObserver(([e]) => { e.isIntersecting ? v.play().catch(() => {}) : v.pause(); }, { threshold: 0.35 }).observe(v);
});`;

function snippet(p) {
  return `<!-- Smart Value · ${p.name} · generated by build.mjs – paste into one Elementor HTML widget -->
<style>${css}</style>
${body(p)}
${schema(p)}
<script type="module">${js}${p.video ? videoJs : ''}</script>
`;
}

function preview(p) {
  const nav = PAGES.map((o) => `<a href="./${o.slug}.html"${o.key === p.key ? ' aria-current="page"' : ''}>${esc(o.name)}</a>`).join('');
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
<link href="https://fonts.googleapis.com/css2?family=Lexend:wght@400;500&family=Sora:wght@600;700&display=swap" rel="stylesheet">
<style>
  body { margin: 0; background: #fff; }
  .pv-bar { position: sticky; top: 0; z-index: 10; background: #fff; box-shadow: 0 6px 20px -12px rgba(30,27,75,.35);
    font-family: Sora, system-ui, sans-serif; }
  .pv-bar__in { max-width: 1180px; margin: 0 auto; padding: 14px 24px; display: flex; flex-wrap: wrap; gap: 8px 22px; align-items: center; }
  .pv-bar strong { color: #1e1b4b; margin-right: auto; }
  .pv-bar a { color: #1e1b4b; text-decoration: none; font-weight: 600; font-size: .9375rem; }
  .pv-bar a[aria-current] { color: #4f3cc9; box-shadow: inset 0 -2px #4f3cc9; }
  .pv-note { background: #1e1b4b; color: #fff; font: 13px/1.5 system-ui, sans-serif; text-align: center; padding: 6px 16px; }
</style>
</head>
<body>
<div class="pv-note">Preview only. On WordPress, your theme's header and footer wrap the content below.</div>
<header class="pv-bar"><div class="pv-bar__in"><strong>Smart Value · Solutions</strong>${nav}</div></header>
${snippet(p)}
</body>
</html>
`;
}

mkdirSync(new URL('./dist/elementor/', import.meta.url), { recursive: true });
mkdirSync(new URL('./dist/preview/', import.meta.url), { recursive: true });
for (const p of PAGES) {
  writeFileSync(new URL(`./dist/elementor/${p.slug}.html`, import.meta.url), snippet(p));
  writeFileSync(new URL(`./dist/preview/${p.slug}.html`, import.meta.url), preview(p));
  const t = strip(p.seoTitle).length, d = p.metaDescription.length;
  console.log(`${p.slug.padEnd(22)} title ${t} chars${t > 60 ? ' ⚠' : ''} · description ${d} chars${d > 160 ? ' ⚠' : ''} · ${urlOf(p)}`);
}
