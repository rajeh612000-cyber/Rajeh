# SEO plan: Solutions menu → Commercial Analytics, Price Optimizer, Promotion Planner

Based on a crawl of smartvalueaisolutions.com (WordPress + Hello Elementor + Elementor Pro, Rank Math SEO).
Updated 2026-10-01 for the final plan.

## 1. Decisions

| URL | What happens | Why |
|---|---|---|
| `/commercial-analytics/` | **Stays**, first in the Solutions menu and the homepage grid | Unchanged page, so there's no risk. |
| `/price-optimizer/` | **New page** | Short URL, same pattern as `/commercial-analytics/`. |
| `/promotion-planner/` | **New page** | As above. |
| `/strategic-acceleration/` | **301 → `/price-optimizer/`**, then the page goes to Draft | Your homepage price demo already links to it as "See how scenario testing works", and Price Optimizer's `#scenario-testing` section answers the same intent. |
| `/ai-decision-support-smart-bot/` | **Stays live**, out of the menu | Linked from the homepage SmartBot section and from both new pages, so it isn't orphaned. |
| `/solutions/` (hub built on 2026-09-29) | **Back to Draft** | Not needed with short URLs. It was live and unlinked for two days, so a 404 is fine. |
| Category Management, Innovation Launch | **No pages**, and removed from the homepage grid | Final scope. |

**Check before adding the redirect:** go to Search Console → Performance → Pages → `/strategic-acceleration/` → Queries.
- **Mostly price or scenario queries:** keep the target `/price-optimizer/`.
- **Mostly promotion or trade-spend queries:** use `/promotion-planner/` instead.

## 2. Why this keeps the equity

- A 301 passes PageRank with no loss (Google Search Central), as long as the target answers the same intent. That's why only one page is redirected, and to its closest match.
- One hop only. Internal links point straight at the new URLs (`SITE-EDITS.md`), never through the redirect.
- Keep the redirect permanently. Google's stated minimum is one year.
- Never block `/strategic-acceleration/` in robots.txt. Google must crawl it to see the 301.
- Expect some ranking movement for 2–6 weeks while Google recrawls.

## 3. Launch runbook

**Phase A: Clean up**
1. Pages → hover **Solutions** → **Quick Edit** → Status **Draft** → Update.

**Phase B: Build the two pages (they can go live before the menu changes)**

2. **Pages → Add New Page.** Leave **Parent** empty and use slug `price-optimizer`.
   - Hide Title on, layout Default.
   - Add one HTML widget containing `dist/elementor/price-optimizer.html`.
   - Enter the Rank Math fields from `README.md`, then Publish.
3. Repeat for **Promotion Planner** (slug `promotion-planner`).
4. Check each page while logged out:
   - Status 200.
   - View Source, search `<h1`: exactly one result.
   - The 3D scene animates and the controls respond.

**Phase C: Switch**

5. **Menu:** use the structure in `SITE-EDITS.md`.
6. **Homepage:** replace the solutions-grid widget code, change the price demo link, and add the SmartBot link (`SITE-EDITS.md`).
7. **Redirect:** Rank Math → Redirections → Add New.
   - Source `strategic-acceleration/`, match type Exact.
   - Destination `https://smartvalueaisolutions.com/price-optimizer/`.
   - Type **301 Permanent**.
8. Set the **Strategic Acceleration** page to **Draft**. Don't trash it.
9. **Blog post link fixes** (`SITE-EDITS.md`).
10. **Elementor → Tools → Regenerate CSS & Data**, then purge caches.
11. Test with `curl -I https://smartvalueaisolutions.com/strategic-acceleration/`. Expect one `301` to `/price-optimizer/`.

**Phase D: Search Console, same day**

12. Open `sitemap_index.xml`. Check that `page-sitemap.xml` lists the two new URLs and no longer lists `/solutions/` or
    `/strategic-acceleration/`. Resubmit the sitemap under GSC → Sitemaps.
13. **URL Inspection → Test live URL → Request indexing** for `/price-optimizer/`, `/promotion-planner/` and the homepage.
14. **URL Inspection** on `/strategic-acceleration/`: the live test should report the redirect.
15. Don't use the Removals tool, and don't use Change of Address (it's only for domain moves).

## 4. Monitoring

| When | Check |
|---|---|
| Days 1–3 | Pages report: both new URLs move to Indexed. `/strategic-acceleration/` shows as "Page with redirect", which is expected. No new 404s apart from `/solutions/`. |
| Weeks 1–2 | Performance → compare `/strategic-acceleration/` (before) with `/price-optimizer/` (after). |
| Weeks 2–6 | Its old queries should now show Price Optimizer. If one drops to nothing, add a paragraph to the page that answers it. |
| Month 3 | Links report: backlinks credited to the new URL. Ask the owners of any real backlinks to update them. |

## 5. Issues found on the current site (fix alongside)

| # | Priority | Issue | Fix |
|---|---|---|---|
| 1 | High | **Two H1s on every page.** Hello Elementor prints the page title as `h1.entry-title` above each design's own H1. | Elementor → ⚙ Page Settings → **Hide Title** on, page by page. Then View Source to confirm one `<h1>`. |
| 2 | High | **Placeholder pages indexed:** `/features/` and `/use-cases/` ("Coming Soon"), and WordPress's default `/sample-page/`. | Set the first two to Draft until they have content. Delete `/sample-page/`. |
| 3 | Medium | **Duplicate blog listings:** `/blog/` and `/category/blog/`. The Blog page's description still says "Coming Soon…". | Rank Math → Titles & Meta → Categories → **noindex**, and Sitemap → Categories **off**. Rewrite the Blog description. |
| 4 | Medium | **Partner with Us has an empty meta description.** | Suggested: "Partner with Smart Value™ to bring AI-powered pricing, promotion and range analytics to your FMCG consulting clients." |
| 5 | Medium | **Blog post "Contact us" link points to `/commercial-analytics/`.** | See `SITE-EDITS.md`. |
| 6 | Low | **Pages marked up as `Article` by "admin"** (Rank Math's default for Pages). | Rank Math → Titles & Meta → Pages → Schema Type **None**. Give the posting user a real display name. |
| 7 | Low | **Redirect hops in internal links** (logo `http://`, slashless `/contact-us`). | See `SITE-EDITS.md`. |

## 6. What's built into the new pages

- **One H1 per page**, a clean H2/H3 outline, a breadcrumb (Home › Page), and descriptive internal links:
  - each page links to the other new page and to Commercial Analytics, through the "Pair it with another solution" cards;
  - each page links to SmartBot, through the "Runs on the Smart Value™ platform" line;
  - "See all solutions" goes to the homepage grid (`/#modules`).
- **Hands-on controls**, written into the HTML with their first readouts, so crawlers and no-JS visitors see real text.
  - Price Optimizer has a price slider: revenue, margin and volume update, and the 3D "your price" marker moves.
    "Show recommended" jumps to the best margin inside a −2% volume guardrail.
  - Promotion Planner has a promotion picker: incremental volume, the dip afterwards and return on spend update, and the selected row turns orange.
  - Both are native controls (range input, radio buttons), so they work with a keyboard and screen readers. Both are labelled as illustrative, not client data.
- **FMCG terminology** that matches your homepage and blog, plus question-led sections and a visible FAQ written as direct
  answers. This is the format AI Overviews, ChatGPT search and Perplexity quote.
- **Structured data:** `Service` (provider = your Rank Math `#organization`) and `FAQPage`. Google stopped showing FAQ rich
  results on 7 May 2026, so FAQPage is kept only for other engines and assistants. Validate at validator.schema.org.
- **Core Web Vitals:**
  - The H1 is text, so it is the LCP element.
  - Three.js loads only after `window.load` plus browser idle.
  - Each canvas sits in a fixed aspect-ratio box, so CLS is 0.
  - Rendering pauses off screen and in hidden tabs. The controls update text at once and the scene catches up on the next frame, which keeps INP low.
  - `prefers-reduced-motion` gets still frames that still respond to the controls.
- **No style clashes:** every class uses the `svp-` prefix, and the Elementor container reset only touches containers that hold these pages.

## 7. Video (North Noir clips)

- Google indexes a video only when it's the page's main content. On these pages a clip is a supporting visual, so
  "No video indexed" in Search Console is expected and harmless.
- To add one, use the `video` field in `src/content.mjs`. It renders with `preload="none"` and a poster frame, and plays only on screen.

## Sources

- [Google Search Central: Site moves and migrations](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes)
- [Search Engine Journal: Google, keep 301 redirects in place for a year](https://www.searchenginejournal.com/google-keep-301-redirects-in-place-for-a-year/428998/)
- [Search Engine Land: Google to no longer support FAQ rich results](https://searchengineland.com/google-to-no-longer-support-faq-rich-results-476957)
- [Google Search Central Blog: Video mode only shows pages where video is the main content](https://developers.google.com/search/blog/2023/12/video-is-the-main-content)
