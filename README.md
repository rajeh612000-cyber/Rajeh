# Smart Shopper™ — Animated Intro Video (Remotion)

A fully animated 16:9 intro for **Smart Shopper™** by Marketeers Research, built with
[Remotion](https://remotion.dev) (React-based programmatic video). Horizontal 1920×1080 @ 30fps,
running the full length of the voice-over with burned-in, word-synced captions and continuous
motion graphics.

## Deliverables (`/deliverables`)
- `SmartShopper_Intro_1080p.mp4` — final cut (voice-over + subtle ducked music bed).
- `captions.json` — the timed caption data (chunks + per-word timing + highlights + scenes).

## Brand system
- Palette (`src/theme/palette.ts`): Navy `#08306B`, Yellow `#FBC210`, Medium blue `#255E91`,
  Red `#CD393B`, White `#FFFFFF`. Red used only as a sparing accent.
- Type: **Manrope** (self-hosted, `public/fonts`) as a free stand-in for PP Pangram Sans
  — swap in the licensed PP Pangram Sans woff2s and update `src/theme/fonts.ts` to match.
- Logo: `src/components/logo/SmartShopperMark.tsx` — the Smart Shopper mark rebuilt as pure
  vector SVG (never rasterizes), with `color` and `reversed` variants. Swap for the official
  transparent logo file when supplied.

## Structure
- Cold open (logo build-on) → 5 themed motion-graphic scenes synced to the transcript
  (price optimization → virtual-shop survey → market-data calibration → the engine →
  predictive strategy) → outro card (reversed logo + "Empowering Growth").
- `src/Composition.tsx` sequences the timeline; `src/components/Captions.tsx` renders the
  word-synced lower-third captions from `captions.json`.

## Transcription & sync (how the captions were built)
1. Exact audio duration via `ffprobe` → **37.525333s**.
2. Transcript via Gemini (proofread for brand terms: Smart Shopper, price-pack architecture,
   virtual shop, SKUs), cross-checked with a second pass.
3. Per-word timing via **aeneas** forced alignment (espeak MFCC/DTW), validated against
   `ffmpeg silencedetect` pause anchors.
4. Words grouped into 3–6-word caption chunks with 1–2 yellow-highlighted key terms.

## Render
```bash
npm install
# uses a headless Chromium; set your own path if needed
REMOTION_BROWSER_EXECUTABLE=/path/to/chrome-headless-shell \
  npx remotion render SmartShopperIntro out/video_silent.mp4 --muted
# then mux the untouched V/O (and optional music) — see scripts/finalize.sh
```
Preview live: `npm run studio`.

## Notes
- Captions are faithful to the spoken V/O; adjust `captions.json` for strict verbatim if preferred.
- The source V/O was recorded quietly (~-29 LUFS); the voice is loudness-normalized to
  ~-15 LUFS (a clean gain — no pitch/speed/character change) so it's audible on social.
- Final duration is 1126 frames = 37.53s — the tightest whole-frame envelope of the
  37.525s audio (30fps can't land exactly on 37.525; the audio plays in full).
