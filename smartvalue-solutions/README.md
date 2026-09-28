# Smart Value: solution pages

Three internal product pages that replace the Solutions dropdown items, styled to match
the homepage cards (lilac corner, numbered cards, violet gradient pills, orange accent dot).
Each page has an animated Three.js hero:

| Page | URL | Hero scene |
|---|---|---|
| Price Optimizer | `/solutions/price-optimizer/` | Revenue landscape across price points. An orange marker keeps finding the peak. |
| Promotion Planner | `/solutions/promotion-planner/` | Weeks × promotions. Baseline, incremental uplift, and the best-ROI promotion in orange. |
| Category Management | `/solutions/category-management/` | Three-shelf fixture. SKUs are scored, low performers step out, and a new listing takes the slot. |

## Files

```
src/content.mjs        copy, SEO titles/descriptions, FAQ (single source of truth)
src/sv-solutions.css   brand tokens + components, scoped under .sv-page
src/sv-hero-3d.js      Three.js scenes + scroll reveal
build.mjs              node build.mjs → dist/
dist/elementor/*.html  paste into ONE Elementor HTML widget per page
dist/preview/*.html    open in a browser to review
seo/SEO-MIGRATION-PLAN.md   redirects, GSC steps, monitoring
seo/redirects.csv      import into the Redirection plugin (fill in real old URLs first)
```

## Before publishing

1. **Brand colours.** The hex values at the top of `src/sv-solutions.css` were sampled from screenshots.
   Replace them with your Elementor Global Colors and rebuild.
2. **Copy.** Every capability claim was drafted from your homepage card text. No stats or testimonials
   were invented. Have the product team check each one. If you have real proof points, such as a client result or a logo,
   add them. They are the biggest conversion lever still missing.
3. **Old URLs.** Fill in the worksheet in `seo/SEO-MIGRATION-PLAN.md` from GSC before creating any
   redirect.

## Rank Math / Yoast fields

| Page | SEO title | Focus keyword |
|---|---|---|
| Price Optimizer | Price Optimizer: Price Elasticity Analytics \| Smart Value | price optimization software |
| Promotion Planner | Promotion Planner: Trade Promotion ROI \| Smart Value | trade promotion optimization |
| Category Management | Category Management: SKU & Range Analytics \| Smart Value | assortment optimization |

Meta descriptions are in `src/content.mjs` (`metaDescription`, 148–154 characters) and in the `<head>`
of each preview file.

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
