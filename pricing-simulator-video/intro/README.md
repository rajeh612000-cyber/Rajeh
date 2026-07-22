# Smart Shopper™ — animated intro scene

`output/smart-shopper-intro.mp4` is a silent, 16-second, 1920×1080 branded intro
for the Smart Shopper™ product (by Marketeers Research), built in the same color
system and fonts as the pricing-simulator dashboard.

## What it shows

1. **0–3.5s — comprehension gate.** Marketeers logo animates in top-left (and
   stays pinned the whole scene); "Smart Shopper™" resolves in Fraunces serif with
   an amber underline sweep and the one-liner *"Shopper Analytics for Smarter
   Pricing, Distribution & Growth"* — so a first-time viewer knows what it is by ~3.4s.
2. **3.5–7s — four benefit cards** stagger in (dashboard-white cards on navy),
   each with a hand-drawn SVG icon:
   - 🛒 Shopper — real consumer choice
   - 🏷️ Price — pricing & promotion scenarios (icon micro-motion)
   - 🎚️ Simulator — test commercial decisions (slider knobs glide)
   - 📈 Growth — predict impact & the best action (chart line draws in)
3. **7–10s — climax.** The cards dim, then each word of **"Shop. Test. Predict.
   Decide."** lands in sequence and *re-lights its matching card* with an amber
   flare, tying the promise back to the four capabilities.
4. **10–16s — closing lockup.** Smart Shopper™ + the full one-liner + a
   "Download Now →" CTA + `marketeersresearch.com/smart-shopper`.

## Palette / fonts

Identical to the dashboard: ink navy `#08306B`, amber/rust `#CD393B` / `#A82E32`,
teal `#2A86B8`; Fraunces (display), Inter (body), IBM Plex Mono (accents) — all
vendored locally under `fonts/`.

## How it was built (fully deterministic)

`intro.html` contains a pure `render(t)` animation engine: every element's
opacity/transform is a function of time `t` (with cubic / back-ease easing
helpers), so frames are reproducible and independent of capture timing.

```
node render_frames.js     # seeks render(t) for 480 frames (16s @ 30fps) -> frames/*.png
ffmpeg -framerate 30 -i frames/f_%04d.png -c:v libx264 -profile:v high \
  -pix_fmt yuv420p -crf 17 -preset slow -movflags +faststart -an \
  output/smart-shopper-intro.mp4
```

Open `intro.html?live` directly in a browser to preview the animation in real time.

## Note on the logo

The Marketeers wordmark is recreated as clean inline SVG (gray "Marketeers" with
the red triangle M-peak and "Analytics • Insights • Impact", Impact in red) so the
scene stays fully self-contained. Swap in the official logo asset if preferred —
replace the `<svg>` inside `#logoCard` in `intro.html`.
