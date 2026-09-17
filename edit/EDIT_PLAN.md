# Price Optimizer — "What If" · 0:58 · edit plan

Everything below comes from Mariam's shooting script. Where the script is silent, it is
marked **[not in script]** and left for her to set, not filled in with an editor's preference.

## Timing spine — as her script states it

| # | Section | In–Out | Dur | Script says |
|---|---------|--------|-----|-------------|
| 1 | Hook | 0:00–0:08 | 8s | ON CAMERA |
| 2 | The four shoppers | 0:08–0:31 | 23s | VOICE-OVER |
| 3 | Introducing Price Optimizer | 0:31–0:49 | 18s | VOICE-OVER |
| 4 | Close | 0:49–0:58 | 9s | ON CAMERA |
| — | End card | 0:56–0:58 | 2s | over the tail of §4 |

## On-screen text — verbatim, at her stated timings

**§1** — "On screen from frame one": `One SKU price change can shift the whole category.`
"At 0:05, replacing it": `+5% on your best seller.`

**§2** — her note reads *"the existing Smart Shopper shelf chart, animated in the order the lines
are spoken"*, and the text is *"On screen, **from the chart**"*. So these four are states of the
chart, not title cards over picture: `Stay loyal` · `Switch pack` ·
`Switch within portfolio or brand` · `Leave category`, then `One price change could impact the
whole revenue.` They are built in the chart animation and are **not** burned in by `build.sh`.

**§3** — "On screen:" `Simulate. Then decide.`

**§4 / end card** — `Smart Value AI Solutions / Price Optimizer / Predict before you decide.`
with `Models validated against real market outcomes.` small beneath.

## Motion graphics — North Noir

Scope is what her script asks for and nothing beyond it: **§2** is the *existing* Smart Shopper
shelf chart, animated in the order the lines are spoken — her wording is "the existing" chart, so
that asset is hers and should be supplied rather than regenerated. **§3** carries the simulator:
"Watch volume, share, margin and cannibalisation move with it."

North Noir takes one assembled video and transcribes it itself, so it runs after the cut below.

## Zoom on Mariam **[not in script]**

Her script specifies no camera move — the zoom is your request, so the amount is yours to set.
It is applied only across the two ON CAMERA sections (§1, §4); §2 and §3 are voice-over and
carry no push. Values live in `manifest.tsv` (`punch`, `fx`, `fy`, `zoom_end`) and I aim `fx`/`fy`
at her face once I can see the frames.

## Running it

    cd edit && ./build.sh          # vertical 1080x1920, 30fps
    ASPECT=horizontal ./build.sh   # 1920x1080

Passes: normalise → trim + push → join → burn the titles above → loudnorm to -16 LUFS / -1.5 dBTP
→ H.264 faststart. Output: `edit/out/price_optimizer_v1.mp4`.

**Status:** pipeline test-run end-to-end on stand-in clips — 58.035s against the 0:58 target.
Awaiting the real footage to fill `manifest.tsv`.
