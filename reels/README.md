# Celebrity biography reels — Remotion

A reusable motion-graphics system for **unofficial, fan-made editorial**
biography reels, vertical for Instagram. The first cut in it is 50 Cent.

**1080×1920 · 30fps · 45.00s (1350 frames) · 35 beats · 1.29s average beat**

| | |
|---|---|
| Rendered reel | `out/fifty-cent-reel.mp4` |
| Storyboard of every beat | `out/contact-sheet.png` |
| Where each image/clip/track goes | [`ASSETS.md`](./ASSETS.md) |
| Every factual claim and its source | [`FACTS.md`](./FACTS.md) |
| The editable script | [`src/data/fifty-cent.ts`](./src/data/fifty-cent.ts) |

---

## Commands

```bash
npm install

npm run studio     # interactive preview — scrub, edit props, hot reload
npm run preview    # contact sheet of all 35 beats -> out/contact-sheet.png
npm run render     # the reel -> out/fifty-cent-reel.mp4
npm run cover      # a single still for the feed thumbnail -> out/cover.png

npm run docs       # regenerate ASSETS.md + FACTS.md from the script data
npm run textures   # re-bake the grain and halftone plates
npm run lint       # typecheck
```

`npm run render` takes options: `-- --chunk=100`, `-- --out=out/alt.mp4`,
`-- --composition=SomeOtherReel`.

---

## Editing the reel

**Everything that is specific to 50 Cent lives in one file:**
`src/data/fifty-cent.ts`. Copy, cut, timing, facts, sources and asset briefs
are all there. The components never mention the subject.

A scene looks like this:

```ts
{
  id: 'grodt-stat',
  type: 'stat',
  durationInFrames: s(1.5),      // s() converts seconds -> frames at 30fps
  value: '#1',
  label: 'Debuted atop the Billboard 200',
  source: 'Billboard 200 chart archive, February 2003.',
  caption: {text: 'Straight to number one.', highlight: ['number', 'one.']},
}
```

- **Re-time the edit** by changing `durationInFrames`. The composition asserts
  that the scenes add up to `durationInSeconds` and throws with the exact
  discrepancy if they don't, so the reel can never silently drift off 45s.
- **Change what's gold** with `caption.highlight` (captions), `goldWords`
  (headlines) and `goldLine` (titles).
- **Dial the feel** in `src/theme/tokens.ts` — palette, type scale, safe-area
  insets, grain/halftone/shake intensity, easing.

### Beat types

| `type` | Card | Use it for |
|---|---|---|
| `title` | `TitleCard` | The open, act breaks, the sign-off |
| `photo` | `PhotoCard` | Any image or clip beat, with a slow linear move |
| `headline` | `HeadlineCard` | Press-clipping statements; one or two gold words |
| `timeline` | `TimelineCard` | A year ladder with a marker travelling to one entry |
| `stat` | `StatCard` | One number carrying one claim |
| `quote` | `QuoteCard` | A sourced quotation (unused in this cut — see below) |
| `end` | `EndCard` | Sign-off plus the on-screen disclaimer |

Adding a beat type is three steps: extend the `Scene` union in
`src/data/types.ts`, write the card, add a branch to `SceneRenderer`.

---

## Making a reel about someone else

1. Copy `src/data/fifty-cent.ts` to `src/data/<subject>.ts` and rewrite the
   scenes. Keep a `source` on every factual claim.
2. Import it into `SCRIPTS` in `src/data/scripts.ts`. That alone gets you a
   reel composition, a contact sheet, and — on the next `npm run docs` — its
   own `ASSETS.<id>.md` and `FACTS.<id>.md`.
3. `npm run render -- --composition=<Id>` to render it.
4. Re-skin if you want a different look: `src/theme/tokens.ts` for palette and
   texture, `src/theme/fonts.ts` for the three faces. No card component
   hard-codes a colour or a font name.

---

## Assets

Every image and clip slot renders a labelled placeholder until you supply a
licensed file, so an unfinished cut tells you exactly what is missing.
[`ASSETS.md`](./ASSETS.md) lists all 13 slots with the timecode each lands on,
what it should show, and the rights note.

To supply one: drop the file at the path the manifest gives
(`public/images/img-queens.jpg`), then set that scene's `src` in the script to
the same path (`'images/img-queens.jpg'`). Nothing else changes.

The reel renders **silently** by default. `script.music.src` is `null` — point
it at a licensed production track to add a bed.

---

## Rights and accuracy

This is an unofficial fan edit and the code is built to keep it honest.

- **No copyrighted media ships with this repo.** Every slot is a placeholder.
  `ASSETS.md` spells out what may not be used: no commercial recordings, no
  broadcast/film/Super Bowl footage, no album art, no logos or wordmarks.
- **No invented biography.** Every claim on screen carries a `source` in the
  script data, and `FACTS.md` is generated from those fields — so the fact
  sheet cannot drift away from what the video actually says. Claims marked
  **VERIFY** must be confirmed against a named outlet, or cut, before publish.
- **No quotes.** The `quote` card exists in the library but is unused here: a
  quotation is a claim about what someone said and needs its own citation.
- The disclaimer is burned into the end card, not left to the caption.

---

## Design system

- **Palette** — black, white, one muted gold (`#C9A227`). Gold is reserved for
  emphasis; nothing else is coloured.
- **Typography** — Anton for display, Archivo for titling, Inter for captions.
  Self-hosted latin subsets (SIL OFL), inlined into the bundle so renders never
  touch the network. Headline sizes shrink automatically for longer lines, so a
  re-skin can't blow past the safe area.
- **Motion** — hard cuts only, no cross-dissolves. Lines rise out of clipping
  masks; photos move linearly, which reads as a locked-off documentary shot
  rather than a transition. Camera shake is seeded noise that decays after the
  cut: energy on the edit, stillness while you read.
- **Texture** — a grain plate (`overlay`) over the whole frame and a halftone
  dot screen (`multiply`) over photography, both baked by `npm run textures`.
- **Captions** — burned in, word by word, with key words in gold and a gold
  strike sweeping under them. Each word carries its own contrast slab so the
  line stays readable over a blown-out frame.
- **Safe areas** — `SAFE_AREA` in the tokens keeps content clear of Instagram's
  top bar, bottom caption and right-hand action rail, with a reserved band at
  the bottom of the well for captions. Turn on the `showSafeAreas` prop in the
  studio to see the zones drawn.

---

## Why rendering is chunked

`npm run render` doesn't call `remotion render`. It bundles once, renders the
frames in chunks of 150 with a fresh browser per chunk, then encodes the whole
sequence in a single pass.

On a GPU-less Linux container the render tab reliably wedges somewhere past
~800 frames of this reel, and the tab Remotion opens in its place never
finishes booting — so a straight `remotion render` fails near the end of a
45-second cut. Chunking bounds the damage to one chunk; encoding once at the
end keeps timing exactly constant (45.000s, 1350 frames) with no
concatenated-timestamp drift and no second-generation compression.

Two related fixes are baked into the components for the same reason: the film
grain and the halftone are pre-baked image plates rather than a live
`feTurbulence` filter and repeating CSS gradients. They look the same and cost
a fraction as much per frame.

If a chunk still wedges on your machine, run `npm run render -- --chunk=75`.

---

## Publishing checklist

- [ ] Work every **VERIFY** row in `FACTS.md` — confirm or cut.
- [ ] Fill the slots in `ASSETS.md` with licensed files, or ship the placeholders.
- [ ] Set the handle on the `end-card` scene (currently `@yourhandle`).
- [ ] Repeat the disclaimer and list your sources in the Instagram caption.
