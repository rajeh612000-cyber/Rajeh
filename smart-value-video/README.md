# The Decisions Behind Growth — storyboard → video

Turns the HTML storyboard into a real MP4, with live speaker footage playing
inside Scene 1.

```
storyboard.html / .css / .js   the storyboard (preview + render modes)
assets/                        fonts, logos, and the speaker clip(s)
render/prep-footage.sh         screen recording → clean clip
render/render.mjs              storyboard → MP4
render/make-standin.sh         generates a placeholder clip for testing
out/                           rendered video
```

## Quick start

```bash
cd render
npm install

# 1. clean up the screen recording (see "Preparing footage" below)
./prep-footage.sh /path/to/recording.mp4 --start 4.5 --duration 12 \
                  --crop 1536x864+192+238

# 2. render scene 1
node render.mjs --scene 1
# → out/scene1.mp4
```

To just look at the storyboard in a browser:

```bash
node serve.mjs 8080
# http://127.0.0.1:8080/storyboard.html          preview, with annotations
# http://127.0.0.1:8080/storyboard.html?render=1 exactly what gets rendered
```

## Preparing footage

The raw capture is a recording of a browser window, so it contains the browser
chrome, the Synthesia editor UI (including the word "Synthesia"), and any
glitches from the capture itself. `prep-footage.sh` removes all three: crop
away everything except the player rectangle, and trim to a clean span.

Start by looking at the frames:

```bash
./prep-footage.sh --inspect /path/to/recording.mp4
```

That writes stills to `out/inspect/` and prints a `cropdetect` suggestion.
`cropdetect` only finds *uniform* borders, so it will catch black bars but not
the Synthesia UI — open the stills, read off the player rectangle, and pass it
as `--crop WxH+X+Y`:

| flag | meaning |
|---|---|
| `--crop 1536x864+192+238` | keep a 1536×864 region whose top-left corner is at (192, 238) |
| `--start 4.5` | begin 4.5s in — skip the glitchy opening |
| `--duration 12` | Scene 1 is 12s long |
| `--size 1280x720` | output resolution (default) |
| `--fade 0.3` | optional fade in/out, hides a rough cut |
| `--delogo 220x70+1020+620` | blur out a watermark *inside* the player |

`--crop` and `--delogo` handle two different "Synthesia" problems:

- The wordmark in the **editor UI** (sidebar, tab title, toolbar) is outside the
  player rectangle, so `--crop` removes it.
- A watermark burned into the **exported video** sits inside the player
  rectangle and survives the crop. `--delogo` interpolates it away from
  surrounding pixels — its coordinates are relative to the already-cropped
  frame. It's a smudge, not a clean removal, so prefer exporting without the
  watermark if your plan allows it.

If the good footage is split across several spans, export each one and
concatenate before running the render.

### Why the clip is WebM, not MP4

Playwright's Chromium is the open-source build, which ships **without
proprietary codecs**. An H.264 `.mp4` asset silently fails to load — the page
falls back to the placeholder card and the render looks like nothing happened.
`prep-footage.sh` therefore always writes VP9/Opus in a `.webm` container,
which that build always supports. The *rendered output* is normal H.264 MP4.

## Rendering

```bash
node render.mjs --scene 1                    # one scene
node render.mjs --from 0 --to 6              # arbitrary window
node render.mjs --all                        # the whole 96s
node render.mjs --scene 1 --fps 25 --crf 16  # quality / framerate
```

| flag | default | notes |
|---|---|---|
| `--scene N` | 1 | 1-based |
| `--from` / `--to` | — | seconds; overrides `--scene` |
| `--fps` | 30 | |
| `--scale` | 2 | 960×540 design × 2 = 1920×1080 output |
| `--crf` | 18 | lower = better quality, bigger file |
| `--out` | `../out/<label>.mp4` | |
| `--audio FILE` | scene's own clip | audio source |
| `--no-audio` | | silent output |

Audio is taken from whichever clip is on screen, offset to the right point, and
muxed after the frames are captured — so a bad audio source can't cost you the
expensive part.

## How the render stays frame-exact

Frames are **not** captured in real time. For every frame the page is pinned to
an exact timestamp and then screenshotted:

- **CSS animations** — every animation inside the active scene is paused and its
  `currentTime` set via the Web Animations API. Because `currentTime` is measured
  from the start of the animation *including* `animation-delay`, it is just
  scene-local time in ms. The Scene 1 text beats at 7.8s and 9.9s land on the
  exact frame every run.
- **Video** — `video.currentTime` is set explicitly and the render waits for
  `seeked`. Nothing depends on playback keeping up.
- **Serving** — `serve.mjs` implements HTTP range requests. Without 206
  responses Chromium refuses to seek and *every* frame shows t=0 of the clip.

Consequence: output is identical whether the machine is fast or slow, and a
12s scene takes as long as it takes without dropping or duplicating frames.

Budget roughly **0.5s per frame** — Scene 1 (12s @ 30fps = 360 frames) takes
about 3 minutes; the full 96s takes 20-25 minutes. Most of that is video
seeking and PNG encoding, so scenes with no footage render faster.

### Traps worth knowing about

Four things silently produce a wrong-but-plausible video. All are handled in the
code; this is a record of why those lines are there.

1. **`page.screenshot({ animations: 'disabled' })`** fast-forwards finite
   animations to completion and cancels infinite ones. It looks like the right
   flag for reproducible captures, but it throws away the `currentTime` we just
   pinned — every frame renders as if the scene had finished. Symptom: the
   Scene 1 text is fully visible from frame 0 instead of appearing at 7.8s.
2. **`--disable-threaded-compositing`** hangs headless screenshot capture
   outright — the process sits at 0% CPU forever. `--disable-threaded-animation`
   on its own is fine and is what we want.
3. **No HTTP range support** → Chromium refuses to seek and every frame shows
   t=0 of the clip. `serve.mjs` answers 206.
4. **H.264 assets** don't load at all in Playwright's Chromium — you get the
   placeholder card and no error.

A short keyframe interval (`-g 15`) on the clip matters too: with VP9's default
long GOP, every seek decodes from far back and the render crawls.

## Render mode

`?render=1` adds `.render-mode` to `<html>`, which drops the storyboard
scaffolding so only the 16:9 stage remains:

- hidden: header, play/restart controls, caption bar, timeline
- hidden: everything marked `.storyboard-only` — the scene badges
  ("Scene 1 · 0:00–0:12 · Live speaker"), the direction notes
  ("Sync sound · speaker on camera, medium shot"), and the "On-screen text"
  eyebrow label
- the dashed "insert footage" frame is dropped once real footage is present

The on-screen text beats themselves are part of the film and stay.

To keep something out of the final video, add `class="storyboard-only"`.

## Scene 1 slot

```html
<div class="ph-card ph-card--video is-empty" data-video-slot>
  <video class="ph-video" data-src="assets/scene1-speaker.webm" muted playsinline preload="auto"></video>
  <div class="ph-fallback"> … original placeholder … </div>
</div>
```

`is-empty` is removed once the clip loads, which hides the fallback. If the file
is missing the storyboard still works and the renderer prints
`clip MISSING scene 1` rather than failing — so a missing asset is always
visible, never silent.

Other speaker scenes (2 and 6) can take footage the same way: give the card
`ph-card--video is-empty` + `data-video-slot`, and add a `<video data-src="…">`.

## Notes

- Fonts (Sora, Inter) are vendored in `assets/fonts/` so renders don't depend on
  the network and are byte-stable.
- `assets/logo-marketeers.png` and `assets/logo-smartvalue.png` are currently
  transparent stand-ins — drop the real files in to fix Scene 7.
- Timeline is 96s total; the preview label reads 1:36.
