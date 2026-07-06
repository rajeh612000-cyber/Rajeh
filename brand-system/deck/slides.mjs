// ============================================================================
// Smart Value(TM) — Brand System presentation deck (content).
// Every slide renders through the design system to a pixel-perfect PNG.
// Copy is real and presentation-ready. `accent` = purple, `amber` = amber.
// ============================================================================

export const slides = [
  // ---------------------------------------------------------------- OPEN ----
  { layout: 'cover',
    title: [{ t: 'Better decisions,' }, { t: 'not more data.', accent: true }],
    sub: 'The Smart Value™ brand system — one logo, one palette, one typeface and one signature line, applied everywhere the brand shows up.',
    meta: 'Visual Identity Guidelines · Version 1.0 · 2026' },

  { layout: 'contents', kicker: "What's inside",
    items: [
      ['01', 'The brand', 'Who Smart Value™ is and what it stands for'],
      ['02', 'Logo system', 'Marks, anatomy, clear space & misuse'],
      ['03', 'Colour', 'Navy, purple, amber & the balance'],
      ['04', 'Typography', 'The Sora system'],
      ['05', 'Design language', 'Divider, geometry & imagery'],
      ['06', 'Applications', 'The social & content kit'],
      ['07', 'Brand collateral', 'Stationery, digital, print & merch'],
    ] },

  // ------------------------------------------------------------ 01 BRAND ----
  { layout: 'section', num: '01', name: 'The brand',
    line: 'Who we are, and why we exist.' },

  { layout: 'statement', num: '01', sect: 'The brand',
    head: [{ t: 'Decisions over ' }, { t: 'dashboards.', accent: true }],
    lead: 'Smart Value™ is an AI-powered Revenue Growth Management platform built for FMCG brand manufacturers. It turns <b>pricing, promotions, pack architecture, assortment, trade efficiency and forecasting</b> into clear, confident decisions — every day. Commercially live and pilot-ready across the Middle East and Europe.',
    stats: [['6+', 'RGM decision domains'], ['2', 'priority regions · ME & Europe'], ['1', 'platform, every decision']] },

  { layout: 'cards', num: '01', sect: 'The brand', head: 'Purpose, mission, vision.',
    cols: [
      { n: 'Purpose', h: 'Turn data into decisions', p: 'Commercial teams don’t need another report. They need the answer — priced, planned and ready to act on.' },
      { n: 'Mission', h: 'AI-powered RGM for FMCG', p: 'Replace gut-feel and static spreadsheets with defensible, fast decisions across every revenue lever.' },
      { n: 'Vision', h: 'The default RGM brain', p: 'Become the decision layer every FMCG commercial team in ME & Europe runs their day on.' },
    ] },

  { layout: 'cards', num: '01', sect: 'Positioning', head: 'What Smart Value™ stands for.',
    cols: [
      { n: '01', h: 'Decisions over dashboards', p: 'We don’t add another report. We deliver the answer — priced, planned and ready to act on.' },
      { n: '02', h: 'Built for FMCG RGM', p: 'Purpose-built for the realities of pricing, promo, pack and assortment in fast-moving goods.' },
      { n: '03', h: 'Confidence at speed', p: 'AI diagnostics and simulations turn slow debates into fast, defensible calls.' },
    ] },

  { layout: 'cards', num: '01', sect: 'Voice & tone', head: 'How the brand speaks.',
    cols: [
      { n: 'Clear', h: 'Plain, not jargon', p: 'Say the decision in a sentence. If it needs a paragraph, cut it.' },
      { n: 'Confident', h: 'Evidence, not hype', p: 'Back every claim with a number or a simulation. Never oversell.' },
      { n: 'Decisive', h: 'Answers, not options', p: 'Lead with the recommendation, then the reasoning.' },
      { n: 'Human', h: 'For commercial teams', p: 'We speak to marketers and sales leaders, not data scientists.' },
    ] },

  // ------------------------------------------------------------- 02 LOGO ----
  { layout: 'section', num: '02', name: 'Logo system', line: 'Primary and reversed marks.' },

  { layout: 'logoShowcase', num: '02', sect: 'Logo system', head: 'Two versions, one mark.',
    lead: 'The mark pairs an isometric symbol — structured decisions emerging from connected data — with the wordmark and the AI Solutions descriptor.' },

  { layout: 'anatomy', num: '02', sect: 'Logo system', head: 'Anatomy of the mark.',
    points: [
      ['Isometric symbol', 'Connected nodes resolving into a single decision hub — data becoming a decision.'],
      ['Wordmark', 'SMART in the lead weight, VALUE carrying the accent, set in Sora ExtraBold.'],
      ['Descriptor', 'AI SOLUTIONS, letter-spaced, locked to the wordmark baseline.'],
      ['The hub', 'The white centre node is the fixed optical centre — never move or recolour it.'],
    ] },

  { layout: 'variations', num: '02', sect: 'Logo system', head: 'Approved variations.',
    lead: 'Use the fullest version that fits. Every variation keeps the same proportions and spacing.' },

  { layout: 'clearspace', num: '02', sect: 'Logo system', head: 'Clear space & minimum size.',
    lead: 'Keep clear space around the logo equal to half the mark’s height — the “x” unit shown in amber. Never let text, images or edges intrude.' },

  { layout: 'misuse', num: '02', sect: 'Logo system', head: 'Logo misuse.',
    lead: 'Consistency protects recognition. Never do any of the following to the mark.',
    dont: ['Don’t recolour the logo or symbol', 'Don’t stretch or distort proportions', 'Don’t rotate or tilt the mark',
           'Don’t add shadows or effects', 'Don’t place on low-contrast grounds', 'Don’t rearrange symbol & wordmark'] },

  // ----------------------------------------------------------- 03 COLOUR ----
  { layout: 'section', num: '03', name: 'Colour', line: 'The Smart Value™ spectrum.' },

  { layout: 'palette', num: '03', sect: 'Colour palette', head: 'The colour system.',
    lead: 'Navy leads. Purple accents. Amber signals action. Ice and white create space. Green appears rarely, only for growth.',
    swatches: [
      ['Navy', '#1A1A4E', '26 · 26 · 78', 'Dominant · backgrounds', 'd'],
      ['Purple', '#7751FF', '119 · 81 · 255', 'Accent · highlights', 'd'],
      ['Amber', '#F19526', '241 · 149 · 38', 'CTA · action only', 'l'],
      ['Ice Blue', '#E8F3FE', '232 · 243 · 254', 'Light fields · space', 'l'],
      ['Deep Navy', '#0E337B', '14 · 51 · 123', 'Gradient depth', 'd'],
      ['Growth', '#61CE70', '97 · 206 · 112', 'Growth only · rare', 'l'],
    ] },

  { layout: 'balance', num: '03', sect: 'Colour palette', head: 'How to balance the palette.',
    lead: 'A dominant navy foundation keeps the brand premium. Let purple and amber punctuate — never compete.',
    bars: [['Navy', 60, '#1A1A4E', '#fff', 'Backgrounds & large fields'],
           ['Ice / White', 25, '#E8F3FE', '#1A1A4E', 'Breathing room & light areas'],
           ['Purple', 12, '#7751FF', '#fff', 'Accents, highlights & links'],
           ['Amber', 3, '#F19526', '#1A1A4E', 'The single CTA only']] },

  { layout: 'combos', num: '03', sect: 'Colour palette', head: 'Combinations to avoid.',
    lead: 'These pairings vibrate, muddy or fail contrast. Avoid them — especially for text on fills.',
    combos: [['#7751FF', '#1A1A4E', 'Purple on navy', 'Too little contrast for text'],
             ['#F19526', '#E8F3FE', 'Amber on ice', 'Amber washes out on light'],
             ['#61CE70', '#F19526', 'Green on amber', 'Clashes; never pair accents'],
             ['#1A1A4E', '#0E337B', 'Navy on deep navy', 'Near-invisible; no depth'],
             ['#E8F3FE', '#FFFFFF', 'Ice on white', 'Disappears; no separation'],
             ['#F19526', '#1A1A4E', 'Amber body text', 'Amber is for CTAs, not copy']] },

  // ------------------------------------------------------- 04 TYPOGRAPHY ----
  { layout: 'section', num: '04', name: 'Typography', line: 'The Sora system.' },

  { layout: 'typeScale', num: '04', sect: 'Typography', head: 'Sora — one family, every weight.',
    lead: 'A geometric sans with the clean, engineered feel of an AI product. Emphasise key words and stats in purple.',
    scale: [['Display', '40 / 800', 'font:800 40px/1 var(--f)', 'Better decisions'],
            ['Title', '32 / 800', 'font:800 30px/1 var(--f)', 'Find the cell where margin compounds'],
            ['Subhead', '20 / 600', 'font:600 20px/1.2 var(--f)', 'What Smart Value™ stands for'],
            ['Body', '16 / 400', 'font:400 17px/1.4 var(--f)', 'Turns pricing and pack architecture into confident decisions.'],
            ['Caption', '12 / 500', 'font:500 13px/1.3 var(--f);letter-spacing:.05em', '— Smart Value™ RGM benchmark, 2026']] },

  // -------------------------------------------------- 05 DESIGN LANGUAGE ----
  { layout: 'section', num: '05', name: 'Design language', line: 'Divider, geometry & imagery.' },

  { layout: 'motif', num: '05', sect: 'Design language', head: 'The signature divider line.',
    lead: 'A gradient line — blue flowing into purple into amber — carries the brand’s spectrum and separates the logo from the message. Amber is reserved for one action.' },

  { layout: 'imagery', num: '05', sect: 'Design language', head: 'Isometric geometry & data made tangible.',
    points: [
      ['Isometric & 3D geometry', 'All illustration follows the logo’s isometric language — cubes, hex prisms and connected nodes with real depth.'],
      ['Colour-matched vectors', 'Build from navy, purple and blue. Use amber only as a single highlight, never a fill field.'],
      ['Data made tangible', 'Prefer visuals that turn data into decisions — charts resolving to a highlighted node.'],
      ['No generic clip-art', 'Avoid cartoon mascots and stock 3D people. Geometry and restraint keep the brand premium.'],
    ] },

  // ---------------------------------------------------- 06 APPLICATIONS ----
  { layout: 'section', num: '06', name: 'Applications', line: 'The social & content kit.' },

  { layout: 'showcaseGrid', num: '06', sect: 'Applications', head: 'One system, many formats.',
    lead: 'Every asset uses the same logo lockup, divider line, palette and Sora type — sized to platform specs. Only the message and format change.',
    shots: ['article-blog', 'stat-margin', 'quote-elmasry', 'announce-webinar', 'webinar-169', 'insight-promos'] },

  { layout: 'showcase', num: '06', sect: 'Applications', head: 'Blog & link share.',
    shot: 'article-blog', spec: '1200 × 627 · 1.91:1',
    notes: ['Reversed logo locked left', 'Signature vertical divider', 'Amber kicker · purple emphasis', 'One amber CTA, bottom-right'] },

  { layout: 'showcase', num: '06', sect: 'Applications', head: 'Single statistic.',
    shot: 'stat-margin', spec: '1200 × 627 · 1.91:1',
    notes: ['One number, set in amber', 'Short benefit line beneath', 'Clear source attribution', 'No CTA — the stat is the message'] },

  { layout: 'showcase', num: '06', sect: 'Applications', head: 'Quote & testimonial.',
    shot: 'quote-elmasry', spec: '1200 × 627 · 1.91:1',
    notes: ['Quote in white, author in amber', 'Geometric avatar where no photo', 'Purple quotation mark', 'Illustrative quotes always labelled'] },

  { layout: 'showcase2', num: '06', sect: 'Applications', head: 'Announcements & events.',
    shots: [['announce-webinar', 'Announcement · 1200 × 627'], ['webinar-169', 'Webinar · 1280 × 720']],
    note: 'Lead with the headline, set the detail row in purple, close with a single amber CTA.' },

  { layout: 'showcase2', num: '06', sect: 'Applications', head: 'Insight cards.',
    shots: [['insight-promos', 'Square · 1080 × 1080'], ['insight-portrait', 'Portrait · 1080 × 1350']],
    note: 'Logo locks top-left over a horizontal divider; a tagged claim, a source line and an isometric glyph.' },

  // ------------------------------------------------------ 07 COLLATERAL ----
  { layout: 'section', num: '07', name: 'Brand collateral', line: 'Stationery, digital, print & merch.' },

  { layout: 'bizcard', num: '07', sect: 'Stationery', head: 'Business cards.',
    lead: 'Navy face carries the reversed mark; the reverse carries details in Sora with a single purple accent. 85 × 55 mm, rounded 3 mm.',
    person: ['Rajeh Hazem', 'Founder', 'rajeh@smartvalueaisolutions.com', '+20 100 000 0000', 'smartvalueaisolutions.com'] },

  { layout: 'letterhead', num: '07', sect: 'Stationery', head: 'Letterhead & documents.',
    lead: 'A4 with the primary mark top-left, the divider under the header, and Sora body at 16/24. Amber reserved for a single action or highlight.' },

  { layout: 'emailsig', num: '07', sect: 'Digital', head: 'Email signature.',
    lead: 'A compact horizontal lockup: reversed mark, name and role, contact row with purple links and one amber action.',
    person: ['Rajeh Hazem', 'Founder & CEO · Smart Value™', 'rajeh@smartvalue.ai', 'smartvalue.ai'] },

  { layout: 'social', num: '07', sect: 'Digital', head: 'Social profiles & banners.',
    lead: 'Symbol-only avatar on navy; banners carry the reversed lockup, the divider and one line of message. Sized per platform.' },

  { layout: 'appicon', num: '07', sect: 'Digital', head: 'App icon, favicon & virtual background.',
    lead: 'The symbol sits on a navy rounded tile — never the full lockup. The favicon drops to the hub node at 16 px. Video backgrounds keep the centre clear for the speaker.' },

  { layout: 'largeformat', num: '07', sect: 'Print & events', head: 'Roll-up banner & flyer.',
    lead: 'Keep the key message in the upper two-thirds at eye level. Roll-up ≈ 850 × 2000 mm; flyer A4, export print-ready PDF at 300 dpi with bleed.' },

  { layout: 'billboard', num: '07', sect: 'Out of home', head: 'Billboard & out-of-home.',
    lead: 'One idea, three words, read in three seconds. Reversed mark, a bold claim, the divider — nothing else competes.',
    message: [{ t: 'Stop guessing ' }, { t: 'the price.', accent: true }] },

  { layout: 'merch', num: '07', sect: 'Merchandise', head: 'Merchandise.',
    lead: 'One-colour and two-colour marks for embroidery and screen-print. Thicker lines, simplified shapes, navy or white only.',
    items: [['tee', 'T-shirt'], ['tote', 'Tote bag'], ['mug', 'Mug'], ['cap', 'Cap'], ['notebook', 'Notebook'], ['lanyard', 'Lanyard'], ['sticker', 'Stickers'], ['bottle', 'Bottle']] },

  { layout: 'signage', num: '07', sect: 'Environmental', head: 'Signage & office.',
    lead: 'Reversed mark on a navy panel for reception and wall graphics; the isometric geometry scales up as an architectural pattern.' },

  // --------------------------------------------------------------- CLOSE ----
  { layout: 'closing',
    head: [{ t: 'Better decisions,' }, { t: 'not more data.', accent: true }],
    sub: 'Smart Value™ — AI-powered commercial decisions for FMCG.',
    contact: ['smartvalue.ai', 'hello@smartvalue.ai'] },
];
