# Smart Value™ explainer: Price Optimizer & Promotion Planner

An 82-second, 1920×1080, 30 fps motion-graphics explainer with no voice-over. It is built as one HyperFrames HTML composition (`index.html`). The two 3D scenes, a value landscape and a set of promotion bars, are rendered with three.js. All other data visuals are animated SVG and DOM driven by GSAP.

**Output:** `renders/smart-value-explainer.mp4`

## Scene map (cuts land on the music's bar lines)

The music is ~117.5 BPM, so one bar is 2.043 s. The first downbeat falls at 0.07 s and the track lifts in energy at 16.4 s.

| # | Time | Bars | Scene | Visual |
|---|------|------|-------|--------|
| 1 | 0.0–8.2 | 0–4 | **How it's done today:** "Next year's prices. Next year's promotions… still set from last year's numbers." | Last year's weekly sales line draws itself, then gets copied and pasted into next year |
| 2 | 8.2–16.4 | 4–8 | **The problem:** "AI should help. Signal or noise? Nobody bets the promotion budget on a black box." | 170 jittering noise dots get pulled into a navy black-box cube, which then opens into the Smart Value™ wireframe mark |
| 3 | 16.4–24.6 | 8–12 | **Brand promise** (lands on the music lift) | Logo, "Predict before you decide", "Test every move on your own sales data", three standalone solutions with the two covered here highlighted |
| 4 | 24.6–28.7 | 12–14 | **Which price? Which promotion?** | Recreates the static post: both 3D scenes rendered live in split panels with the orange VS badge |
| 5a | 28.7–36.9 | 14–18 | **Price Optimizer:** sets the everyday price, SKU by SKU | 3D value landscape, navy "Your price" marker, pink 2% volume guardrail, a scan trail to the orange "Recommended price" peak |
| 5b | 36.9–45.0 | 18–22 | **Price scenario demo + proof** | Price slider moves revenue/margin/volume, goes past the guardrail, then a click on "Show recommended" snaps to €2.59. A **92% model confidence\*** ring counts up |
| 6a | 45.0–53.2 | 22–26 | **Promotion Planner:** tests every deal before the budget is spent | 3D bars (13 weeks × 4 mechanics) grow in a wave. A scan plane scores each event and the best mechanic turns orange |
| 6b | 53.2–61.4 | 26–30 | **Promotion picker demo + proof** | Picker cycles through −20%, 3 for 2, −10% and Feature + display, updating uplift, dip after and return on spend. **2.7× blended ROI (simulated)** with ROI ranked by mechanic and a break-even line |
| 7 | 61.4–67.5 | 30–33 | **The difference in one line** | 52-week strip: everyday-price weeks in navy, deal weeks rise, worthwhile deals turn orange and the rest fade |
| 8 | 67.5–73.6 | 33–36 | **Who it's for:** Commercial & Sales, Finance, Marketing | Three role cards |
| 9 | 73.6–81.8 | 36–40 | **CTA:** "You don't need both. Start with whichever decision comes first." | Logo, tagline, URL, claim footnotes and music credit. Music fades out over the last 2.5 s |

## Brand and claims checks
- Fonts: Sora at 800 for headlines and 400 for body, shipped locally in `assets/fonts`
- Colours: navy #1A1A4E, grey #555555, violet #534AB7, bright violet #7751FF, lilac #EEEDFE and #F8F6FF. Orange #F19526 is used only for the recommended price and the best promotion
- Always "Smart Value™" with the ™ (logo artwork)
- "92% model confidence", never "accurate". The footnote reads *Validated against real market outcomes on an actual pricing recommendation*
- 2.7× ROI is always labelled **simulated**
- Demo screens carry an "Illustrative data/figures" tag. No client names, logos or testimonials

## Music
**"Digital Lemonade"** by Kevin MacLeod (incompetech.com), licensed under **Creative Commons Attribution 4.0** (http://creativecommons.org/licenses/by/4.0/). It is free for commercial use as long as the credit is kept. The credit appears on the end card, so keep it in any posted description too.

I chose it from six free candidates by tempo, brightness and steady energy, using a librosa analysis. Its bright electronic texture suits a tech/data explainer, and the lift at bar 8 is where the brand reveal sits.

## Rebuild
```bash
npx hyperframes lint .
npx hyperframes snapshot . --at 12,27,34,42,50,59
npx hyperframes render . -q delivery --fps 30 -o renders/smart-value-explainer.mp4
```
three.js 0.181.2 and GSAP 3.14.2 are vendored in `assets/vendor`, so renders do not depend on a CDN.

## Tooling notes
- **HyperFrames** (HeyGen) local skills and CLI are installed in `.claude/skills`. The HyperFrames MCP blocks compose/render from CLI agents and points to these local skills instead.
- **three.js** draws both 3D scenes into one WebGL canvas, using scissored viewports for the split screen. Each frame is driven by HyperFrames' `hf-seek` time, which keeps the render deterministic.
- The **video-editing** skill (awesome-genmedia) is installed in `.claude/skills/video-editing`. It edits *existing* footage through the each::labs API and needs an `EACHLABS_API_KEY`, so it was not part of building this video. It can be used later for colour or format passes on the rendered MP4 if a key is added.
