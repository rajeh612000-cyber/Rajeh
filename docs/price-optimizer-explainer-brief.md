# Price Optimizer — 3D animated explainer
## Director's brief and build spec

**Client** Smart Value AI Solutions
**Subject** Price Optimizer (`smartvalueaisolutions.com/pricing-optimizer/`)
**Master** 78 s, 1920×1080, 30 fps, H.264
**Cutdown** ~20 s, 16:9 / 1:1 / 9:16
**Voice** Kinetic type and music. No voiceover.
**Date** 2026-10-07

---

## 1. The idea

The Smart Value mark is already a 3D object: an isometric translucent polyhedron
with glass faces, hairline edges, lit nodes, a dashed sightline and a lens ring.
We did not invent a visual language for this film. We extruded the one the brand
already owns, and one rule governs every object in it:

> **A SKU is a node. Price is the node's height. The portfolio is a field of
> nodes. An elasticity curve is a surface stretched between them. The
> recommended price is where the lens ring lands.**

The film ends by rotating that lattice square to camera, at which point it *is*
the logo. The payoff costs nothing because the geometry was always the brand's.

## 2. Brand system

Every value below was read off the live stylesheet (`--svp-*` custom
properties), not matched by eye.

| Token | Value | Role in the film |
|---|---|---|
| `--svp-ink` | `#1A1A4E` | Deep-space ground, primary type |
| `--svp-primary` | `#7751FF` | The live line, hero accent |
| `--svp-deep` | `#534AB7` | Structure, secondary volume |
| `--svp-light` / `--svp-num` | `#8C5FD6` / `#A09DE8` | Mid-tones, particles |
| `--svp-border` / `--svp-lilac` / `--svp-bg-soft` | `#E0DFF8` / `#EEEDFE` / `#F8F6FF` | Glass, fog, light panels |
| `--svp-accent` | `#F19526` | **Rationed. Two uses in the whole film.** |
| rose | `#9B3D5A` / `#C97A95` | The losing scenario only |
| `--svp-radius` | `14px 14px 14px 4px` | Three soft corners, one sharp |
| type | **Sora** 300 / 400 / 600 / 700 / 800 | Everything |

`#0A0A23` ("void") is ink pushed down for vignette depth — the film is darker
than the website, because a screen in a dark room is not a screen in a browser.

**The signature.** That `14px 14px 14px 4px` radius — three rounded corners and
one sharp cut at bottom-left — is carried by every card, chip, panel and glass
facet, in CSS and in modelled geometry. Nobody names it; everybody feels it.
It is the difference between the client's film and a stock template.

**Material.** Frosted glass at 0.12–0.25 opacity, emissive hairline edges, no
chrome specular, diffuse violet light rather than a hard key. Data under glass,
not a toy.

**Orange discipline.** The accent appears exactly twice: on the recommended
price at 0:56.4, and on the end-card CTA. Scarcity is the entire reason it reads
as a recommendation rather than a colour.

## 3. Grammar

- **One continuous camera.** The dolly never cuts. Scenes hand over through
  0.9 s overlaps while the move carries on. We cut only when the meaning
  changes, and in this film the meaning does not stop.
- **Three camera heights** — macro (one SKU), portfolio (the field), decision
  (the cards). The descent from field to node *is* the product's argument:
  averages hide, SKU level reveals.
- **Pace is the credibility lever.** RGM directors and commercial finance
  distrust hype, so: `power2.inOut` throughout, no bounce anywhere, one idea per
  shot, numbers counted up rather than cut to, each figure held before the
  camera moves, and a beat of near-silence immediately before the
  recommendation.
- **Colour steps are decisions, not transitions.** A bar turns rose the instant
  it breaks the guardrail. A crossfade would soften a verdict.

## 4. Shot list

| # | Time | Beat |
|---|---|---|
| 1 | 0:00–0:08.5 | **The flat shelf.** Thirteen SKUs at one height. The blanket increase lifts every post identically; four of them then lose their shoppers and drop to rose. *"Easy to agree on. Expensive to get wrong."* |
| 2 | 0:08.5–0:21 | **The hidden curve.** Camera descends to one node; the lens ring opens and a response surface unfurls. Pull back: every node's curve is a different shape. *"Every pack has its own curve. One average has none of them."* |
| 3 | 0:21–0:32 | **The standoff.** Three glass facets — revenue, margin, volume — pinwheeled around one hub. They flex against each other, then lock square and a solid appears where they agree. |
| 4 | 0:32–0:44.5 | **The machine.** Four data lanes stream into the lattice core, curves fit, three futures branch, one solidifies. The site's four steps, built as one unbroken move rather than four cuts. |
| 5 | 0:44.5–0:58.5 | **Scenario comparison.** R1 `+4.2 / +6.8 / −0.6`, R2 `+1.1 / +3.9 / −4.8`, R3 `+2.0 / −1.5 / +3.2`. R2's volume bar physically breaks the −2% guardrail plane. Camera settles on R1; the orange lands. |
| 6 | 0:58.5–1:08.5 | **Ladder and retailers.** Measured gaps across the pack-price ladder, then the whole ladder fans into depth once per retailer — four different answers visible at once. |
| 7 | 1:08.5–1:18 | **Resolve.** The lattice rotates square to camera and becomes the mark. Lock-up, then the second and last orange: the CTA. |

All figures are the client's own illustrative scenario table. The film carries
the same footing the page does: illustrative, not client data.

## 5. Sound

Temp score only, written procedurally from the film's cue sheet so it is exactly
in sync and exactly the right length — the edit can be judged with sound before
anyone buys a licence. **Replace before release.** `tools/score.py` is the brief
for whoever writes the final cue.

- D minor. A sub pad with slow upper partials. Nothing percussive.
- One soft mark per data event. Irregular, because the data is.
- The guardrail break at 0:51.3 is the only ugly sound in the film.
- One warm settle — D minor add9 — at 0:56.4, on the orange. It is the single
  resolution in the cue, and the eleven quiet seconds before it are what earn it.
- Bed mixed at roughly −17.6 LUFS integrated, −3 dBTP; the master is normalised
  to −16 LUFS. Low on purpose: this film is read, not watched, and the sound is
  there so that silence does not feel like a fault.

## 6. How it is built

Three.js for the world, GSAP for a single paused master timeline, a DOM layer
over the canvas for typography, Playwright to seek and grab frames, ffmpeg to
encode.

**Why a DOM type layer.** Real Sora at real kerning at any size, and the
`--svp-radius` cut corner as an exact CSS value rather than a modelled
approximation. The grabber captures the composited page, so canvas and type land
as one image.

**Why it is deterministic.** Nothing reads the wall clock. Continuous motion —
rotations, drifts, particle flow — is registered as an updater that is a pure
function of the timeline's absolute time, and randomness runs off a fixed seed.
Seek to *t* and the frame is identical whether it took 4 ms or 400 ms to get
there. This is the commercial point of the whole approach: **when a figure in
the scenario table changes, this is a re-render, not a re-shoot.**

```
video/
  index.html            host page, brand CSS, lock-up
  src/brand.js          tokens, scenario figures, guardrail
  src/world.js          renderer, materials, lattice primitives
  src/type.js           Sora type layer
  src/stage.js          camera, updaters, reveals, screen-space label pinning
  src/scenes/s1..s7.js  one file per scene
  src/main.js           master timeline, hand-offs, visibility windows
  tools/render.mjs      frame grabber → ffmpeg
  tools/stills.mjs      dailies
  tools/score.py        temp score
  tools/cutdown.mjs     social cutdowns
```

```bash
cd video && npm install
node tools/stills.mjs 2 16 28 53 71      # dailies
node tools/render.mjs                    # 1080p master
python3 tools/score.py --out out/score.wav
node tools/cutdown.mjs                   # 20s social cutdowns
```

## 7. What this does not do yet

- The score is a temp track. It is in sync and in key; it is not licensed music.
- 4K is a re-render (`--w 3840 --h 2160`), roughly 4× the wall-clock time; the
  scene is resolution-independent.
- Nothing in the film is client data. Swapping in real figures means editing
  `SCENARIOS` in `src/brand.js` and re-rendering — no re-animation.
