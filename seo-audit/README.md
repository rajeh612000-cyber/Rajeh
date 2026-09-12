# Marketeers Research – Technical SEO Audit (12 September 2026)

- `Marketeers-Research-Technical-SEO-Audit-2026-09-12.pdf` – the deliverable (28 pages, brand-styled, A4).
- `source/` – HTML/CSS used to build the PDF. Rebuild with headless Chromium:
  `chrome --headless=new --print-to-pdf=body.pdf --no-pdf-header-footer body.html` (same for `cover.html`), then merge cover + body.

Audit basis: Google's index of the site, DNS lookups and the Canva brand system. Direct fetches of
marketeersresearch.com were blocked by the workspace network policy; Section 5 of the PDF lists the checks to
run once access or Google Search Console is available.
