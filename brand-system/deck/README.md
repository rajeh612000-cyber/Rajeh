# Smart Value™ — Brand System deck

A complete 40-slide brand presentation, built entirely on the design system.
Every slide is rendered to a pixel-perfect PNG through the Sora + palette + divider
system, then embedded **full-bleed** into a 16:9 PowerPoint — so fonts never
substitute and spacing never shifts on another machine.

**Deliverable:** [`../Smart_Value_Brand_System.pptx`](../Smart_Value_Brand_System.pptx) — 40 slides, 16:9, ready to present.

## Rebuild

```bash
npm run deck        # build slides → render PNGs → assemble the .pptx
# or step by step:
npm run deck:build  # slides.mjs  → deck/html/*.html
npm run deck:render # deck/html   → deck/png/*.png  (2560×1440)
npm run deck:pptx   # deck/png    → Smart_Value_Brand_System.pptx
```

## Edit content

All copy lives in **`slides.mjs`** — one object per slide. Change text there and
run `npm run deck`. `accent` renders a word/line in purple; the fixed logo mark
sits in the same top-left position on every content slide.

## What's inside (40 slides)

1. Cover · Contents
2. **The brand** — brand story, purpose/mission/vision, positioning, voice & tone
3. **Logo system** — two marks, anatomy, variations, clear space, misuse
4. **Colour** — palette (HEX/RGB), the 60/25/12/3 balance, combinations to avoid
5. **Typography** — the Sora system & scale
6. **Design language** — divider motif, isometric geometry & imagery
7. **Applications** — the social/content kit (blog, stat, quote, announcement, insight)
8. **Brand collateral** — business cards, letterhead, email signature, social
   profiles, app icon/favicon/virtual background, roll-up & flyer, billboard,
   merchandise, signage
9. Closing

> Contact details on the business-card / email / closing slides are example
> placeholders — swap them in `slides.mjs` before printing.
