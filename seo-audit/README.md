# Marketeers Research – Technical SEO

## v2 (14 Sep 2026) — current
`Marketeers-Research-Critical-Technical-SEO-Report-v2.pdf` (23 pages)

Diagnosis from real data: a Screaming Frog crawl of 475 URLs, Search Console index and
Core Web Vitals exports, and the live robots.txt. 12 critical issues, each with
step-by-step fixes, verification tests and hour estimates. Supersedes v1.

Headline findings: 131 URLs unindexed, 4.9s LCP on 27 blog URLs, 74 date-archive
redirects to the homepage, 343 KB median HTML across 90 stylesheets, 13.4 MB of images,
87 of 147 pages missing a meta description, 9 pages with no H1.

## v1 (12 Sep 2026) — superseded
`Marketeers-Research-Technical-SEO-Audit-2026-09-12.pdf` — outside-in audit written when
the site could not be fetched. Kept for the dead-subdomain finding only.

## Rebuilding
`source/` holds the HTML/CSS. Render with headless Chromium
(`chrome --headless=new --print-to-pdf=out.pdf --no-pdf-header-footer body2.html`),
then merge cover + body.
