# Smart Value: solution pages

A `/solutions/` hub plus three product pages that replace the Solutions dropdown items. They're styled with the live
Elementor kit (kit #13 global colours, Sora) and your homepage's own card system: asymmetric 14/4 px corners, the
lilac corner fade, the numbered cards, the violet gradient pills with the orange dot, and the hover bar. Each page has
an animated Three.js hero.

| Page | URL | Hero scene |
|---|---|---|
| Solutions hub | `/solutions/` | One shared data core feeding four solution nodes. Data pulses flow out, and the solution in focus turns orange. |
| Price Optimizer | `/solutions/price-optimizer/` | Revenue landscape across price points. An orange marker keeps finding the peak. Includes the `#scenario-testing` section that replaces Strategic Acceleration. |
| Promotion Planner | `/solutions/promotion-planner/` | Weeks × promotions: baseline, incremental uplift, and the best-ROI promotion in orange. |
| Category Management | `/solutions/category-management/` | Three-shelf fixture. SKUs are scored, low performers step out, and a new listing takes the slot. |

## Files

```
src/content.mjs          copy, SEO titles/descriptions, FAQ, hub, platform links (single source of truth)
src/svp-solutions.css    kit tokens + components, all classes prefixed "svp-" (no clash with the homepage's "sv-")
src/svp-hero-3d.js       Three.js scenes + scroll reveal
build.mjs                node build.mjs → dist/
dist/elementor/*.html    paste each into ONE Elementor HTML widget on its page
dist/preview/*.html      open in a browser to review (start with solutions.html)
seo/SEO-MIGRATION-PLAN.md   decisions, launch runbook, Search Console steps, site issues found
seo/SITE-EDITS.md        exact find/replace edits for the homepage, header, menu and blog post
seo/redirects.csv        the one redirect, in Redirection-plugin CSV format (Rank Math users add it by hand)
```

## Rank Math fields

| Page | SEO title | Focus keyword |
|---|---|---|
| Solutions | Solutions for FMCG Pricing, Promotions & Range \| Smart Value | FMCG revenue growth management solutions |
| Price Optimizer | Price Optimizer: Price Elasticity Analytics \| Smart Value | price optimization software |
| Promotion Planner | Promotion Planner: Trade Promotion ROI \| Smart Value | trade promotion optimization |
| Category Management | Category Management: SKU & Range Analytics \| Smart Value | assortment optimization |

Meta descriptions are the `metaDescription` fields in `src/content.mjs` (136–156 characters). Each preview file's `<head>` shows them too.

## Before publishing

1. **Copy review.** Capability claims were drafted from your homepage and the Strategic Acceleration page. No results or
   testimonials were invented. The scenario table on Price Optimizer is labelled "Illustrative example, not client
   data". Its R1 row reuses your homepage demo's numbers (+4.2% / +6.8% / −0.6%). Have the product team confirm
   each claim, especially the pack-price and retailer/channel scenario points.
2. **Proof points.** A real client result or logo row is the biggest conversion lever these pages still lack. Add one when you have it.
3. **Search Console check.** Before adding the Strategic Acceleration redirect, run the check in section 1 of the plan.

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
