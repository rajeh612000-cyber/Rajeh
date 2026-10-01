# Smart Value: solution pages

Two product pages in the Solutions menu, next to the existing Commercial Analytics page. They're styled with the live
Elementor kit (kit #13 global colours, Sora) and your homepage's own card system: asymmetric 14/4 px corners, the lilac
corner fade, the numbered cards, the violet gradient pills with the orange dot, and the hover bar. Each page has an
interactive Three.js hero.

| Page | URL | Hero |
|---|---|---|
| Price Optimizer | `/price-optimizer/` | A value landscape across price changes. Drag the price slider and the "your price" marker moves, while revenue, margin and volume update. "Show recommended" jumps to the best margin inside a −2% volume guardrail. Includes the `#scenario-testing` section that replaces Strategic Acceleration. |
| Promotion Planner | `/promotion-planner/` | Weeks × four promotions. Pick a promotion and its row turns orange, while incremental volume, the dip afterwards and return on spend update. |

The numbers in both controls come from an illustrative model (`src/svp-models.mjs`), and the pages say so.

## Files

```
src/content.mjs                 copy, SEO titles/descriptions, FAQ, related cards (single source of truth)
src/svp-models.mjs              the illustrative price and promotion models behind the controls
src/svp-solutions.css           kit tokens + components, all classes prefixed "svp-" (no clash with the homepage's "sv-")
src/svp-hero-3d.js              Three.js scenes, controls and scroll reveal
src/homepage-solutions-grid.html  your homepage grid widget, updated to the three solutions
build.mjs                       node build.mjs → dist/
dist/elementor/*.html           paste each into ONE Elementor HTML widget on its page
dist/homepage/solutions-grid.html  replaces the code of the homepage solutions-grid widget
dist/preview/*.html             open in a browser to review
seo/SEO-MIGRATION-PLAN.md       decisions, launch runbook, Search Console steps, site issues found
seo/SITE-EDITS.md               menu, homepage, blog and header edits, with exact find/replace strings
seo/redirects.csv               the one redirect, in Redirection-plugin CSV format (Rank Math users add it by hand)
```

## Rank Math fields

| Page | SEO title | Description | Focus keyword |
|---|---|---|---|
| Price Optimizer | Price Optimizer: Price Elasticity Analytics \| Smart Value | Price Optimizer helps FMCG brands find the price that improves revenue and margin while protecting volume, by SKU, retailer and channel. | price optimization software |
| Promotion Planner | Promotion Planner: Trade Promotion ROI \| Smart Value | See which FMCG promotions drive incremental growth and better ROI. Promotion Planner separates true uplift from baseline sales, event by event. | trade promotion optimization |

## Before publishing

1. **Copy review.** Capability claims were drafted from your homepage and the Strategic Acceleration page. No results or
   testimonials were invented. The scenario table and both controls are labelled illustrative. Have the product team confirm each claim.
2. **Proof points.** A real client result or logo row is the biggest conversion lever these pages still lack.

## Adding a North Noir clip later

Add a `video` field to a page in `src/content.mjs`, then run `node build.mjs`:

```js
video: {
  title: 'Price Optimizer in 12 seconds',
  caption: 'How Price Optimizer finds the price point that balances revenue, margin and volume.',
  src: 'https://smartvalueaisolutions.com/wp-content/uploads/price-optimizer-loop.mp4',
  poster: 'https://smartvalueaisolutions.com/wp-content/uploads/price-optimizer-loop.webp',
},
```
