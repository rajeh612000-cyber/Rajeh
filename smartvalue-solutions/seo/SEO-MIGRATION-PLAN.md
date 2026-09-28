# SEO migration plan: Solutions menu → Price Optimizer, Promotion Planner, Category Management

Based on a crawl of smartvalueaisolutions.com on 2026-09-28: 15 URLs from the Rank Math sitemaps,
WordPress + Hello Elementor + Elementor Pro, Rank Math SEO.

## 1. Decisions

The three current Solutions pages aren't older versions of the new products. They describe a maturity ladder
("See → Decide → Act"). Each one got the outcome that keeps its search value:

| Current URL | What it is | Decision | Why |
|---|---|---|---|
| `/strategic-acceleration/` (~700 words) | Scenario testing across price, promo, pack and trade mix | **301 → `/solutions/price-optimizer/`** | Your homepage price demo already links to it as "See how scenario testing works". Price Optimizer now has a scenario-testing section (`#scenario-testing`) that answers the same intent. |
| `/commercial-analytics/` (~570 words) | "See what is happening": E-POS data and dashboards | **Keep live**, moves to a new **Platform** menu item | No new page covers it, so a redirect would be a mismatch and would lose its value. |
| `/ai-decision-support-smart-bot/` (~980 words) | SmartBot, a chatbot product the homepage still features | **Keep live**, under **Platform** | Same reason: a redirect to Category Management would read as a soft 404. |

New URLs (all currently return 404, so they're free):

```
/solutions/                       hub: all four solutions + the platform, replaces the "#" menu link
/solutions/price-optimizer/
/solutions/promotion-planner/
/solutions/category-management/
```

**Check before redirecting:** in Search Console → Performance → Pages → `/strategic-acceleration/` → Queries,
look at what it ranks for.
- **Mostly price or scenario queries:** keep the plan.
- **Mostly promotion or trade-spend queries:** point the redirect at `/solutions/promotion-planner/` instead.
- **Mostly broad RGM or strategy queries:** point it at `/solutions/`.

Also note its clicks and impressions, and check Links → Top linked pages for backlinks. That is the equity you're protecting.

## 2. Why this keeps the equity

- A 301 passes PageRank with no loss (Google Search Central). The value only survives if the target answers the same intent. That's why only one page is redirected.
- One hop only. Internal links point straight at the new URLs (see `SITE-EDITS.md`), never through the redirect.
- Keep the redirect permanently. Google's stated minimum is one year.
- Never block `/strategic-acceleration/` in robots.txt. Google must crawl it to see the 301.
- Expect some ranking movement for 2–6 weeks while Google recrawls.

## 3. Launch runbook

Follow the phases in order. There is no moment where a live link points at a 404.

**Phase A: Prepare**
1. Complete the Search Console check in section 1.
2. Take a full backup (host snapshot or UpdraftPlus).

**Phase B: Build (the new pages go live, but nothing links to them yet)**

3. **Pages → Add New → "Solutions"**, slug `solutions`.
   - Template: **Elementor Full Width**, with Page Settings → **Hide Title** on.
   - Add one HTML widget containing `dist/elementor/solutions.html`.
   - Enter the Rank Math title and description from `README.md`, then Publish.
4. Repeat for **Price Optimizer**, **Promotion Planner** and **Category Management**.
   - Set **Page Attributes → Parent: Solutions**.
   - Use slugs `price-optimizer`, `promotion-planner` and `category-management`.
   - Paste the matching file from `dist/elementor/`.
5. Check each page while logged out:
   - Status 200.
   - View Source, search `<h1`: exactly one result.
   - The 3D hero animates.
   - Rank Math shows the page as index, follow, with a self-canonical.

**Phase C: Switch**

6. **Menu:** use the structure in `SITE-EDITS.md`.
7. **Redirect:** Rank Math → Redirections → Add New.
   - Source `strategic-acceleration/`, match type Exact.
   - Destination `https://smartvalueaisolutions.com/solutions/price-optimizer/`.
   - Type **301 Permanent**.
   - (If the Redirections module is off: Rank Math → Dashboard → Modules.)
8. Set the **Strategic Acceleration** page to **Draft**. Don't trash it, so the copy stays recoverable.
9. **Homepage, header and blog edits:** every find/replace in `SITE-EDITS.md`.
10. **Elementor → Tools → Regenerate CSS & Data**, then purge all caches (plugin, host, CDN).
11. Test with `curl -I https://smartvalueaisolutions.com/strategic-acceleration/`. Expect exactly one `301` whose
    `location:` is the Price Optimizer URL.

**Phase D: Search Console, same day**
12. Open `https://smartvalueaisolutions.com/sitemap_index.xml`. Check that the four new URLs are in `page-sitemap.xml` and
    `/strategic-acceleration/` is gone. Resubmit the sitemap index under GSC → Sitemaps.
13. **URL Inspection → Test live URL → Request indexing** for `/solutions/`, the three product pages and the homepage.
    The homepage is included because its links changed.
14. **URL Inspection** on `/strategic-acceleration/`: the live test should report the redirect.
15. Don't use the Removals tool, and don't use Change of Address (it's only for domain moves).

## 4. Monitoring

| When | Check |
|---|---|
| Days 1–3 | Pages report: the four new URLs move to Indexed. `/strategic-acceleration/` appears under "Page with redirect", which is expected. No new 404s. |
| Weeks 1–2 | Performance → compare `/strategic-acceleration/` (before) with `/solutions/price-optimizer/` (after), filtered by page. |
| Weeks 2–6 | Its old queries should now show Price Optimizer. If one drops to nothing, add a paragraph to the page that answers it. |
| Month 3 | Links report: backlinks credited to the new URL. Ask the owners of any real backlinks to update them. |

If a new URL still isn't indexed after 14 days, open URL Inspection to see why. The usual causes are a noindex tag, a canonical pointing elsewhere, or no internal links.

## 5. Issues found on the current site (fix alongside the migration)

| # | Priority | Issue | Fix |
|---|---|---|---|
| 1 | High | **Two H1s on every page.** Hello Elementor prints the page title as `h1.entry-title` above each design's own H1 (for example "Commercial Analytics" + "See What Is Happening."). | Elementor → edit each page → ⚙ Page Settings → **Hide Title** on. Then View Source to confirm only one `<h1>` remains. |
| 2 | High | **Placeholder pages indexed:** `/features/` (23 words) and `/use-cases/` (25 words) say "Coming Soon" and are in the sitemap. `/sample-page/` is WordPress's default page. | Set `/features/` and `/use-cases/` to Draft until they have content. Delete `/sample-page/`: a 404 is correct for it. |
| 3 | Medium | **Duplicate blog listings:** `/blog/` and `/category/blog/` list the same posts. The Blog page's meta description still reads "Coming Soon…". | Rank Math → Titles & Meta → Categories → Robots Meta **noindex**, and Sitemap Settings → Categories **off**. Rewrite the Blog page description. |
| 4 | Medium | **Partner with Us has an empty meta description.** | Suggested: "Partner with Smart Value™ to bring AI-powered pricing, promotion and range analytics to your FMCG consulting clients." |
| 5 | Medium | **Blog post "Contact us" link points to `/commercial-analytics/`.** | See `SITE-EDITS.md`. |
| 6 | Low | **Pages are marked up as `Article` written by "admin"** (Rank Math's default for Pages). | Rank Math → Titles & Meta → Pages → Schema Type **None**; WebPage and Organization remain. Give the posting user a real display name for blog-post authorship. |
| 7 | Low | **Redirect hops in internal links:** logo → `http://`, and `/contact-us` / `/partner-with-us` without a trailing slash. | See `SITE-EDITS.md`. |
| 8 | Low | `/human-in-the-loop/` has two identical H1s, and its meta description is about an interview, not the page. | Fixing #1 solves the H1s. Review the description. |

## 6. What's built into the new pages

- **One H1 per page**, a clean H2/H3 outline, a visible breadcrumb (Home › Solutions › Page), and descriptive
  internal links. Each product page links to:
  - the other two products;
  - the hub;
  - Commercial Analytics and SmartBot, through a "Runs on the Smart Value™ platform" line.

  The hub links to all of them.
- **FMCG terminology** that matches your homepage and blog ("FMCG", "RGM", retailer, channel, SKU), plus question-led
  sections and a visible FAQ written as direct answers. This is the format AI Overviews, ChatGPT search and Perplexity quote.
- **Structured data:**
  - Product pages: `Service` with `provider` set to your existing Rank Math `@id`
    (`https://smartvalueaisolutions.com/#organization`).
  - Hub: an `ItemList` of the three solutions.
  - Every page: `FAQPage`. Google stopped showing FAQ rich results on 7 May 2026, so this no longer earns a Google rich result. It's kept because other engines and assistants still read it. Validate at validator.schema.org.
- **Core Web Vitals:**
  - The H1 is text, so it is the LCP element.
  - Three.js loads only after `window.load` plus browser idle.
  - Each canvas sits in a fixed aspect-ratio box, so CLS is 0.
  - Rendering pauses off screen and in hidden tabs.
  - `prefers-reduced-motion` gets one still frame.
  - If WebGL or the CDN fails, a static gradient shows instead.
- **No style clashes:** every class uses the `svp-` prefix. Your homepage's unscoped `sv-` classes (for example
  `.sv-card { opacity: 0 }`) can't touch these pages, and these pages can't touch your homepage.

## 7. Video (North Noir clips)

- Google indexes a video only when it is the page's main content. On these pages, clips are supporting visuals, so
  "No video indexed" in Search Console is expected and harmless.
- Keep the Three.js scene as the hero. Add a clip lower down through the `video` field in `src/content.mjs`.
  - It renders with `preload="none"`, a poster frame, and explicit width and height.
  - It only plays when on screen.
- Export an MP4 (H.264) at 720p, under about 2 MB for a 12 s loop, plus a WebP poster frame. If you want video search visibility, publish the clip on YouTube as well, since a YouTube page is a watch page.

## Sources

- [Google Search Central: Site moves and migrations](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes)
- [Search Engine Journal: Google, keep 301 redirects in place for a year](https://www.searchenginejournal.com/google-keep-301-redirects-in-place-for-a-year/428998/)
- [Search Engine Land: Google to no longer support FAQ rich results](https://searchengineland.com/google-to-no-longer-support-faq-rich-results-476957)
- [Google Search Central Blog: Video mode only shows pages where video is the main content](https://developers.google.com/search/blog/2023/12/video-is-the-main-content)
- [Search Console Help: Video indexing report](https://support.google.com/webmasters/answer/9495631?hl=en)
