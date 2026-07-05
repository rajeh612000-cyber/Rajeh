# Smart Value™ — Brand Design System

A working design system for Smart Value™ AI Solutions: the logo, the palette, the
Sora type system, the signature divider motif — and a **content engine** that turns
a few lines of text into pixel-perfect, on-brand social/blog images.

Rebuilt and polished from the original PowerPoint brand guide. Every template uses
the same logo lockup, divider line, palette and Sora type — only the message changes.

![Article template](out/article-blog.png)

---

## What's inside

```
brand-system/
├── tokens.css              Design tokens — colour, type scale, gradients (source of truth)
├── guidelines.html         The visual brand guidelines (open in a browser)
├── content.mjs             ← EDIT THIS: the deck of posts (headline, kicker, CTA…)
├── templates/
│   ├── base.css            Shared visual system (background, lockup, divider, CTA)
│   └── *.html              Generated templates (do not edit by hand)
├── assets/
│   ├── logo/
│   │   ├── symbol.svg          Scalable isometric mark
│   │   ├── logo-reversed.png   Full lockup, white — for dark backgrounds
│   │   └── logo-primary.png    Full lockup, navy/purple — for light backgrounds
│   └── fonts/              Sora 300–800 (self-contained)
├── out/                    ← Rendered PNGs land here
└── scripts/                Generators + Playwright renderer
```

## Make new images (the 30-second loop)

1. Open **`content.mjs`** and add or edit a post:

   ```js
   {
     name: 'article-pricing', layout: 'article', size: [1200, 627],
     kicker: 'Pricing that pays:',
     headline: [{ t: 'Stop guessing the price.' }, { t: 'Simulate it.', accent: true }],
     cta: 'Read the full article',
   }
   ```
   `accent: true` renders that line/word in **purple**. Keep headlines to 2–3 lines
   and **one amber CTA** per asset (brand rule).

2. Build + render:

   ```bash
   npm install          # first time only (installs the headless browser driver)
   npm run build        # content.mjs  ->  templates/*.html
   npm run render       # templates/*.html  ->  out/*.png  (retina @2x)
   ```

   Render one: `npm run render -- article-pricing`

## Layouts available

| `layout`       | Use for                              | Default size   |
|----------------|--------------------------------------|----------------|
| `article`      | Blog / link share, logo + orange CTA | 1200 × 627     |
| `statistic`    | One big number + source              | 1200 × 627     |
| `quote`        | Client quote / testimonial           | 1200 × 627     |
| `announcement` | Event / webinar + CTA (also 16:9)    | 1200 × 627 / 1280 × 720 |
| `insight`      | “Did you know?” stat card            | 1080 × 1080 / 1080 × 1350 |

## Regenerate logos

```bash
npm run logos        # assets/logo/symbol.svg  ->  logo-reversed.png + logo-primary.png
```

## The rules that keep it on-brand

- **Navy leads.** Purple accents, amber signals action. Ice & white create space.
- **One amber CTA** per asset — a rounded pill with a navy label. Never for decoration.
- **Sora only**, every weight. Emphasise key words/stats in **purple**.
- **Reversed (white) logo** on navy; **primary** logo on light.
- Headlines: short and decisive — 2–3 lines, then cut.

See **`guidelines.html`** for the full system.
