# Price Optimizer — 3D animated explainer

A deterministic Three.js film. One paused GSAP timeline drives every scene;
Playwright seeks it to an exact time and grabs one composited frame; ffmpeg
encodes. Nothing reads the wall clock, so the same seek always produces the same
pixels — which means **a changed figure is a re-render, not a re-shoot.**

Creative direction, brand tokens, shot list and sound brief:
[`../docs/price-optimizer-explainer-brief.md`](../docs/price-optimizer-explainer-brief.md).

## Build

```bash
npm install                       # three, gsap, playwright
node tools/stills.mjs 2 16 28 53 71   # dailies — look at frames before rendering minutes
node tools/render.mjs             # 1080p silent master  (~11 min)
python3 tools/score.py --out out/score.wav
node tools/furniture.mjs          # social frame furniture
node tools/deliver.mjs            # scored master + 16:9 / 9:16 / 1:1 cutdowns + posters
```

Chromium comes from `CHROMIUM_PATH` or the container's pre-installed build;
`tools/browser.mjs` resolves it. Rendering runs on SwiftShader — slower than a
GPU, and deterministic, which is the trade we want.

Other resolutions are a flag, not a rebuild: `node tools/render.mjs --w 3840 --h 2160`.

## Where things are

| Path | What |
|---|---|
| `src/brand.js` | Brand tokens read off the live site, the scenario figures, the guardrail |
| `src/world.js` | Renderer, materials, lattice primitives, the mark |
| `src/type.js` | Sora type layer (DOM over canvas) |
| `src/stage.js` | Camera moves, time-pure updaters, reveals, screen-space label pinning |
| `src/scenes/` | One file per scene |
| `src/main.js` | Master timeline, scene hand-offs, visibility windows |
| `index.html` | Host page, brand CSS, end lock-up |
| `frame.html` | Social frame furniture |

## Changing the numbers

Edit `SCENARIOS` and `GUARDRAIL` in `src/brand.js` and re-render. The bars, the
counters and the guardrail break all derive from those values; nothing is
animated by hand.

## Preview

`node tools/serve.mjs`, then open `http://localhost:8099/`. The page loops in
real time. Append `?render=1` to hold on frame 0 for frame-grabbing.

## Note on the score

`out/score.wav` is a **temp track**, generated from the film's cue sheet so the
edit can be judged with sound. Replace it with licensed or commissioned music
before release; `tools/score.py` documents the brief.
