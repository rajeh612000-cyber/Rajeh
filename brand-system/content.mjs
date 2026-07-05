// ============================================================================
// Smart Value(TM) — content deck.
// Edit this file and run `npm run build && npm run render` to regenerate posts.
// `accent:` marks the words shown in purple.  Keep headlines to 2–3 lines and
// exactly one amber CTA per asset (brand rule).
// ============================================================================

export const posts = [
  // ---- article / blog / link share (the hero template) --------------------
  {
    name: 'article-blog', layout: 'article', size: [1200, 627],
    tag: 'SMART VALUE™ · FMCG',
    kicker: 'Maximizing your revenue growth:',
    headline: [{ t: 'How AI turns RGM data' }, { t: 'into daily decisions.', accent: true }],
    cta: 'Read the full article',
  },
  {
    name: 'article-dashboards', layout: 'article', size: [1200, 627],
    kicker: 'Data analytics for FMCG:',
    headline: [{ t: 'From dashboards' }, { t: 'to decisions.', accent: true }],
    cta: 'Read the full article',
  },

  // ---- single statistic ---------------------------------------------------
  {
    name: 'stat-margin', layout: 'statistic', size: [1200, 627],
    stat: '2–4%',
    sub: 'margin uplift in year one for brands that deploy AI-driven Revenue Growth Management.',
    source: '— Smart Value™ RGM benchmark, 2026',
  },

  // ---- quote / testimonial ------------------------------------------------
  {
    name: 'quote-elmasry', layout: 'quote', size: [1200, 627],
    quote: 'Smart Value™ turned our quarterly pricing debates into a 20-minute decision — we act, not argue.',
    author: 'Nadia El-Masry',
    role: 'Commercial Director · FMCG Manufacturer',
    disclaimer: 'Illustrative example — not a real client quote',
  },

  // ---- announcement / event ----------------------------------------------
  {
    name: 'announce-webinar', layout: 'announcement', size: [1200, 627],
    kicker: 'Stay tuned:',
    headline: [{ t: '“AI-Powered RGM” that works' }],
    detail: '5 March · 12 PM · Online',
    cta: 'Register now',
  },

  // ---- 16:9 webinar / market pulse ----------------------------------------
  {
    name: 'webinar-169', layout: 'announcement', size: [1280, 720],
    kicker: 'Market Pulse · Live webinar',
    headline: [{ t: 'Pricing in inflation:' }, { t: 'protect margin, keep volume.', accent: true }],
    detail: '5 March · 12 PM GST · Online',
    cta: 'Save your seat',
  },

  // ---- square insight ("Did you know?") -----------------------------------
  {
    name: 'insight-promos', layout: 'insight', size: [1080, 1080],
    pill: 'Did you know?',
    claim: [{ t: 'Over ' }, { t: '70%', accent: true }, { t: ' of trade promotions drive zero incremental volume.' }],
    source: 'Smart Value™ finds the promotions that actually pay — and kills the ones that don’t.',
    note: '— Illustrative RGM benchmark',
  },

  // ---- portrait insider (4:5) ---------------------------------------------
  {
    name: 'insight-portrait', layout: 'insight', size: [1080, 1350],
    pill: 'RGM insight',
    claim: [{ t: 'The right price is a ' }, { t: 'decision', accent: true }, { t: ', not a guess.' }],
    source: 'Simulate every price × pack combination and ship the one cell that grows revenue without losing volume.',
    note: '— Smart Value™ price-pack engine',
  },
];
