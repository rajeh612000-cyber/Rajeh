# Price Optimizer — "What If" · 0:58 · edit plan

## Timing spine (locked to the shooting script)

| # | Section | In–Out | Dur | Treatment |
|---|---------|--------|-----|-----------|
| 1 | Hook — **on camera** | 0:00–0:08 | 8s | Mariam to lens. Locked wide, then a punch-in on "Will it?" |
| 2 | Four shoppers — **VO** | 0:08–0:31 | 23s | Her voice over the Smart Shopper shelf chart. No on-camera. |
| 3 | Price Optimizer — **VO** | 0:31–0:49 | 18s | VO over the simulator moving. No on-camera. |
| 4 | Close — **on camera** | 0:49–0:58 | 9s | Back to lens. Tightest framing of the film. |
| — | End card | 0:56–0:58 | 2s | Over the tail of §4. |

**The read that matters:** only §1 and §4 are on camera — **17 seconds of face**. §2 and §3 are
41 seconds of voice-over. So 15 clips are not 15 shots; they are takes and pickups. The job is
*selection*, not assembly: pick the two best hook takes and the two best close takes, and use the
remaining clips as the VO bed for §2–§3 (audio only, picture discarded).

Open question the footage will answer: whether the §2/§3 VO lines were read to camera in these
clips (then I strip the audio off and bin the picture) or still need recording.

## Punch-in on Mariam (the zoom you asked for)

Not one continuous creep — that reads as a drift. Three deliberate moves:

- **0:04 → 0:08** — push to **1.22×** under "Will it?" The question is the hook; the frame tightens with it.
- **0:49 → 0:54** — open on a gentle **1.16×** for "the question was never…".
- **0:54 → 0:58** — hard tighten to **1.30×** on "Simulate it first." Tightest frame of the film, then the end card.

§2 and §3 get no push at all. Nothing moves on her face while she is off camera — the graphics carry
those 41 seconds, and a zoom there would fight them.

Aim is set per-clip in `manifest.tsv` via `fx`/`fy` (face centre as a fraction of frame). I set those
once I can see where she sits in frame; the eyeline wants to land on the upper third, not dead centre.

## On-screen text (verbatim from the script)

Driven by `titles.tsv`, already timed:

- 0:00 `One SKU price change can shift the whole category.`
- 0:05 replaces it with `+5% on your best seller.`
- 0:09–0:28 the four shoppers, cut in as each line lands: `Stay loyal` · `Switch pack` ·
  `Switch within portfolio or brand` · `Leave category`
- 0:28.5 `One price change could impact the whole revenue.`
- 0:45 `Simulate. Then decide.`
- 0:56 end card: `Smart Value AI Solutions / Price Optimizer / Predict before you decide.`
  with `Models validated against real market outcomes.` beneath.

## Motion graphics — North Noir

North Noir takes **one assembled video** and plans graphics against its own transcript, so it runs
*after* the cut above, not before. Brief: full-screen cutaways for §2 (the four-shopper shelf chart,
one line at a time) and §3 (price moving, volume/share/margin/cannibalisation reacting); side overlays
only, never full-screen, across §1 and §4 so Mariam stays on camera through the hook and the close.

HyperFrames is not usable from this session — HeyGen disables `compose` and `render_video` for
CLI-based agents by design. It stays available from the claude.ai web app if you want it.

## Running it

    cd edit && ./build.sh          # vertical 1080x1920, 30fps
    ASPECT=horizontal ./build.sh   # 1920x1080

Passes: normalise → trim + push-in → join → burn titles → loudnorm to **-16 LUFS / -1.5 dBTP**
(social delivery standard) → H.264, faststart. Output: `edit/out/price_optimizer_v1.mp4`.

**Status:** pipeline built and test-run end-to-end on stand-in clips — output landed at 58.035s
against the 0:58 target, titles rendering correctly. Waiting on the real footage to fill
`manifest.tsv` and set the punch-in aim.
