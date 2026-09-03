# Smart Value™ homepage — §3 code vs. amendment doc

Source: `Smart_Value_Website_Amends.docx`, section **3. PLATFORM CAPABILITIES SECTION**
Target: `section-03-how-smart-value-works.html`

The doc states: *"This is the section from the last screenshot you sent. I would replace
the current wording with: HOW SMART VALUE WORKS…"* — so §3 governs this component.
No CSS rule or DOM block was deleted; copy and structure were amended and new rules
appended.

---

## 1. Matched changes (doc → code)

| Element | Before | After |
|---|---|---|
| Eyebrow | `PLATFORM CAPABILITIES` | `HOW SMART VALUE WORKS` |
| H2 | "Commercial analytics, planning, and AI decision support — in one place" | "From performance to better decisions — in one place" |
| Card 1 H3 | Commercial Analytics | **Understand Performance** |
| Card 1 lead | *(none)* | "See what's driving your results — and where the opportunities are." |
| Card 1 body | "See what's happening across sales, pricing, distribution, category, brand, SKU, retailer, and channel performance." | "Bring together sales, pricing, promotions, distribution and market data to understand what is changing, where and why." |
| Card 1 label | *(none)* | `Commercial Analytics` (chip) |
| Card 2 H3 | Strategic Acceleration | **Test Your Options** |
| Card 2 lead | *(none)* | "Compare different decisions before choosing your next move." |
| Card 2 body | "Test pricing, promotion, assortment, distribution, and innovation scenarios before execution." | "Test pricing, promotion, portfolio and distribution scenarios and compare their expected impact on volume, revenue and margin." |
| Card 2 label | *(none)* | `Scenario Planning & Simulation` (chip) |
| Card 3 H3 | AI Decision Support — SmartBot | **Decide Faster** |
| Card 3 lead | *(none)* | "Ask the question. Get to the answer faster." |
| Card 3 body | "Ask questions. Get recommendations. Identify risks. Receive alerts. Generate decision-ready outputs." | "Use SmartBot to explore your data, compare scenarios, identify risks and opportunities, and support your next commercial decision." |
| Card 3 label | *(none)* | `AI Decision Support` (chip) |

**The structural change:** the H3 was the *capability name*; it is now the *outcome verb*,
with the capability name demoted to a chip beneath the copy. This is what turns three
parallel features into one sequence — Understand → Test → Decide — which is the spine of
the doc's "complete website story".

---

## 2. Unmatched / contradictory items found

### 2.1 "Strategic Acceleration" — term does not exist in the doc
The doc never uses it. The card is now "Test Your Options / Scenario Planning &
Simulation", but the link still points at `/strategic-acceleration/`.
**Open decision:** rename the destination page and 301 the old URL, or keep the URL and
retitle the page only. Left as-is pending your call.

### 2.2 Scenario numbers were arithmetically impossible
Old mock: **+2% price → Revenue +12.6%, Volume −3.4%, Margin +9.2%.**
A 2% price rise with a 3.4% volume drop yields roughly **−1.5% revenue**, not +12.6%.
The doc's §4 set is internally consistent (1.05 × 0.988 = **+3.8%**), so the card now
carries **+5% price on a £3.50 base → Revenue +3.8%, Margin +6.1%, Volume −1.2%**.
Metric order also follows the doc: Revenue, Margin, Volume.

This matters commercially, not just cosmetically: the audience is RGM and pricing
teams who read elasticity for a living.

### 2.3 Currency
Code used `$`; the doc uses `£` throughout. Switched to `£`.
Also fixed `980K`, which carried no currency symbol at all.

### 2.4 SmartBot example contradicted §6
Old: *"What's the best promo for SKU 250g?"* → 10% discount, 3.8x ROI.
Doc §6: *"Which pricing scenario improves margin while keeping volume decline below 2%?"*
→ *"Scenario B offers the strongest balance…"*. Replaced, so the card preview and the
full §6 section tell the same story.

### 2.5 Card mocks are now previews, not the main event
Doc §4 promotes scenario simulation and §6 promotes SmartBot to full sections of their
own. The mocks inside cards 2 and 3 must therefore stay numerically identical to §4 and
§6 — they now are. If §4's numbers change, change them here too.

### 2.6 CTA wording
Cards use "Explore more"; the doc's page-level CTA is "See Smart Value™ in action".
Kept "Explore more" for the per-card navigation links — the doc's CTA belongs to §1 and
§10 — but flagging in case you want one consistent verb.

---

## 3. SEO / accessibility work done alongside

- `<div class="pc-wrap">` → `<section aria-labelledby>` with `id="how-smart-value-works"`,
  giving the section a linkable anchor and a proper landmark.
- **Rendering insurance:** `.pc-card` starts at `opacity:0`. If JS fails or
  `IntersectionObserver` is missing, the entire section previously rendered invisible.
  Added a `<noscript>` fallback, a feature-detect fallback class, and a
  `prefers-reduced-motion` override.
- `observer.unobserve()` after reveal — the original observer kept firing forever.
- Three identical "Explore more" links are a known a11y/SEO weakness; each now carries a
  visually-hidden suffix naming its destination. Visible design unchanged.
- Decorative SVGs marked `aria-hidden="true" focusable="false"`.
- H2 → H3 hierarchy preserved and now keyword-bearing on outcomes rather than internal
  product names.

---

## 4. Open questions

1. **Currency** — is £ correct site-wide, or is the site multi-market?
2. **`/strategic-acceleration/`** — rename the page/URL to match "Scenario Planning &
   Simulation", or keep the URL?
3. **Capability chips** — should they be links to the same destination as the button, or
   stay as plain labels? (Links would strengthen internal linking; also risks two links
   per card.)
4. **Step numbers 01/02/03** — added to make the sequence explicit. Say the word and
   they come out.
5. §4, §5, §7–§10 of the doc are not yet built. Want me to take those next?
