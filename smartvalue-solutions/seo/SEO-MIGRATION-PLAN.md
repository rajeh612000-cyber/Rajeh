# SEO migration plan: Solutions menu → Price Optimizer, Promotion Planner, Category Management

Goal: replace the three Solutions dropdown pages (Commercial Analytics, Strategic
Acceleration, AI Decision Support) with three new product pages, without losing
rankings, backlinks or traffic.

## 1. Will the old URLs lose equity?

Not if the redirects are done right. Google states that 301/308 redirects do not
lose PageRank. Equity **is** lost in these cases, so avoid all of them:

| Mistake | What Google does |
|---|---|
| Redirecting to a page about something else (or to the homepage) | Treats it as a **soft 404**: the old page's signals are dropped |
| Using 302/307 (temporary) | Keeps the old URL indexed, and the new one doesn't inherit its signals |
| Chains (A → B → C) | Slower to process, and each hop is a chance to break |
| Removing the redirect after a few months | Google recommends keeping it **at least one year**. Keep it permanently: it costs nothing |
| Blocking the old URL in robots.txt | Google can't crawl it, so it never sees the 301 |
| Leaving internal links and menus pointing at old URLs | Wastes crawl budget and weakens the signal that the new URL is the canonical one |

Expect some ranking movement for 2–6 weeks while Google recrawls. That is normal.

## 2. The mapping decision (the part that protects equity)

A 301 only passes value when the new page answers the same search intent as the
old one. Decide each mapping with GSC data, not by the page name:

1. **GSC → Performance → Search results**, last 16 months, **Pages** tab. Export it.
2. Click an old URL, then open the **Queries** tab. Export its top queries.
3. Read those queries and pick the new page that answers them best:
   - Queries about pricing, price elasticity or revenue → **Price Optimizer**
   - Queries about promotions, trade spend or ROI → **Promotion Planner**
   - Queries about range, assortment, SKUs or shelf → **Category Management**
   - Broad queries ("commercial analytics", "AI decision support", brand terms) → the **Solutions hub** (`/solutions/`), not a product page
4. **GSC → Links → Top linked pages.** Note which old URLs have external backlinks.
   Those are the ones where the mapping matters most.

Fill this in, then copy it into `redirects.csv`:

| Old URL (confirm exact path) | Clicks / impressions (16 mo) | Top queries | Backlinks | New target |
|---|---|---|---|---|
| /…commercial-analytics…/ | | | | provisional: `/solutions/price-optimizer/` or hub |
| /…strategic-acceleration…/ | | | | provisional: `/solutions/promotion-planner/` or hub |
| /…ai-decision-support…/ | | | | provisional: `/solutions/category-management/` or hub |

The provisional targets are placeholders only. The old page names don't map 1:1 to the
new products, which is exactly why the queries decide.

## 3. URL structure

```
/solutions/                       ← hub page (lists all four modules; can reuse the homepage card grid)
/solutions/price-optimizer/
/solutions/promotion-planner/
/solutions/category-management/
```

Why a hub: it gives broad old pages a relevant redirect target, it gives the breadcrumb
a real parent, and it concentrates internal links. If you'd rather not have a hub, set
`base: '/'` and `hub: null` in `src/content.mjs` and rebuild.
The URLs are then flat (`/price-optimizer/`).

## 4. Launch runbook (WordPress + Elementor + Rank Math/Yoast)

Do the steps in this order. It avoids any window where a URL 404s.

**Before launch**
1. Complete the GSC exports in section 2. Also take a crawl (Screaming Frog, free up to 500 URLs)
   and keep it as a baseline.
2. Take a full backup (UpdraftPlus or your host's snapshot).

**Build the new pages (they can go live before the swap: nothing links to them yet)**

3. **Pages → Add New → "Solutions"** (the hub). Publish.
4. For each product: **Pages → Add New**, title = product name, **Page Attributes → Parent = Solutions**,
   slug = `price-optimizer` / `promotion-planner` / `category-management`.
5. **Edit with Elementor.** In page settings, set **Template: Elementor Full Width** (this keeps your
   header and footer) and turn on **Hide Title**. Otherwise the theme prints a second H1.
6. Drag in one **HTML** widget and paste the whole file from `dist/elementor/<slug>.html`. Update.
7. **Rank Math / Yoast** on each page: SEO title, meta description and focus keyword from the table
   in `README.md`. Check that the canonical is the page's own URL and that the page is **index, follow**.
8. Open each page logged out and check that it loads with status 200, that there is **one** H1, and that the 3D hero animates.

**The swap**

9. **Redirects.** Choose one of these:
   - Rank Math: **Rank Math → Redirections → Add New**, type **301 Permanent**, one per row of the
     worksheet.
   - Redirection plugin: **Tools → Redirection → Import/Export**, import `redirects.csv`
     (columns: source, target, regex, code).

   Don't run both plugins' redirects at the same time.
10. Set the three old pages to **Draft**. Don't trash them, so their copy stays recoverable.
    Rank Math's redirect fires before WordPress returns a 404.
11. **Menu:** in Appearance → Menus (or your Elementor header's Nav Menu), replace the three Solutions items with
    the three new pages. Link the "Solutions" parent to `/solutions/`.
12. **Homepage cards:** point "Preview the concept →" on Price Optimizer and Promotion Planner, and
    the pill on Category Management, straight at the new URLs. Use descriptive anchor text, for example
    "Explore Price Optimizer →", instead of the generic "Preview the concept".
13. **Other internal links:** use Better Search Replace to swap each old URL for its new one across the database.
    Elementor stores links JSON-escaped, so search for both forms:
    `https://smartvalueaisolutions.com/old-slug/` and `https:\/\/smartvalueaisolutions.com\/old-slug\/`.
    Run it as a dry run first.
14. **Elementor → Tools → Regenerate CSS & Data**, then purge every cache (plugin, host, Cloudflare).
15. Test each old URL with `curl -I https://smartvalueaisolutions.com/old-slug/`.
    Expect a **single** `301` whose `location:` is the final new URL.

## 5. Google Search Console, launch day

1. **Sitemaps:** open your sitemap (`/sitemap_index.xml` for Rank Math/Yoast). Confirm the new pages are
   listed and the old ones are gone. Resubmit it in GSC → Sitemaps.
2. **URL Inspection** → paste each new URL → **Test live URL** → **Request indexing**. Do this for the hub and the three products.
3. **URL Inspection** on each old URL → **Test live URL**. It should report the redirect.
4. Don't use the **Removals** tool on the old URLs. Don't use **Change of Address**: it only applies to domain moves.

## 6. Monitoring

| When | Check |
|---|---|
| Day 1–3 | Pages report: new URLs moving to "Indexed". Old URLs appear under "Page with redirect", which is expected and good. No new "Not found (404)". |
| Week 1–2 | Performance → compare each old URL's clicks with its new URL's clicks (filter by page, 7-day windows). |
| Week 2–6 | Queries that ranked the old URL should now show the new URL. If a query has dropped to nothing, the mapping missed its intent: add a section on the new page that answers it. |
| Month 3 | Links report: backlinks should be credited to the new URLs. Ask the owners of your top 5–10 backlinks to update their links directly. |

**Rollback trigger:** if a new URL still isn't indexed after 14 days, open URL Inspection to see why
(usually noindex, a canonical pointing elsewhere, or a robots block).

## 7. What's built into the pages

- **One H1 per page**, a logical H2/H3 outline, a visible breadcrumb, and descriptive internal links between the
  three modules. Every page links to the other two and to the hub.
- **Question-led sections and a visible FAQ.** They are written so the question and a direct answer sit next to each other. This is
  what AI Overviews, ChatGPT search and Perplexity quote (AEO/GEO).
- **Structured data:** `Service` (linked to your Rank Math organisation `@id`) and `FAQPage`.
  Google stopped showing FAQ rich results on 7 May 2026, so FAQPage no longer earns a Google rich result.
  It is kept because it is valid schema.org and other engines and assistants read it. Delete it if you prefer.
  Validate with the Schema Markup Validator (validator.schema.org); the Rich Results Test no longer covers FAQ.
  If Rank Math also outputs a `Service` or `FAQPage` block for these pages, keep only one.
- **Core Web Vitals:**
  - The H1 is plain text, so it is the LCP element.
  - Three.js is imported only after `window.load` and browser idle, so it never delays LCP.
  - The canvas sits in a fixed `aspect-ratio` box, so CLS is 0.
  - Rendering pauses when the hero is off screen or the tab is hidden, which helps INP and battery.
  - Pixel ratio is capped at 1.75.
  - `prefers-reduced-motion` gets one still frame.
  - If WebGL or the CDN fails, a static gradient shows instead.
- **Scroll reveals** are progressive: content is visible without JavaScript, so crawlers always see it.
- The 3D scenes are decorative with an `aria-label`. All meaning is also in HTML text and the legend.

## 8. Video (North Noir clips)

- Google only indexes a video as a video result when the video is the **main content** of the page. On
  these product pages, clips are supporting visuals and will show as "No video indexed" in GSC. That is
  expected and doesn't harm the page.
- Keep the Three.js scene as the hero. Put a clip lower down (the build supports a `video` field per page).
  It renders as `<video muted loop playsinline preload="none" poster=…>` with explicit width and height, and plays only on screen,
  so it costs nothing at page load.
- Export as MP4 (H.264), 720p, under about 2 MB for a 12 s loop, plus a WebP poster frame.
- If you want video search visibility, publish the clip on YouTube as well, since a YouTube page is a watch page.

## Sources

- [Google Search Central: Site moves and migrations](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes)
- [Search Engine Journal: Google, keep 301 redirects in place for a year](https://www.searchenginejournal.com/google-keep-301-redirects-in-place-for-a-year/428998/)
- [Search Engine Land: Google to no longer support FAQ rich results](https://searchengineland.com/google-to-no-longer-support-faq-rich-results-476957)
- [Google Search Central Blog: Video mode only shows pages where video is the main content](https://developers.google.com/search/blog/2023/12/video-is-the-main-content)
- [Search Console Help: Video indexing report](https://support.google.com/webmasters/answer/9495631?hl=en)
