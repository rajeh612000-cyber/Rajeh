# Dog eats cake

A 14-second 1080p animated short of a golden retriever in a party hat eating a
birthday cake. It is built entirely in code with [Remotion](https://www.remotion.dev)
(React/SVG animation) and finished with ffmpeg, with no paid services or stock assets.

- `dog-eats-cake.mp4` is the finished video (1920×1080, 30 fps, H.264 + AAC).
- `poster.jpg` is a still from it.

## What's in it

- A living-room party scene with depth of field: a blurred background (kitchen, window light,
  bunting, balloons, bokeh), a sharp subject plane and an out-of-focus gift box in front.
- A slow camera push-in with handheld drift and a small bump on every chomp.
- Three bites, each with wind-up, lunge, chomp, tug and spring-back. The cake loses a scalloped
  chunk with sponge, cream and jam showing, crumbs fall and settle on the plate and table, and
  frosting ends up on the dog's nose. The dog also chews, licks and pants happily at the end.
- A synthesized soundtrack: a music-box "Happy Birthday" (public domain), munches, chews, a lick,
  pattering crumbs, panting, birdsong and room tone, all timed to the animation.

## Rebuild it

Requires Node 18+ and ffmpeg.

```bash
npm install
npm run build     # soundtrack → Remotion render → ffmpeg finish
```

Or step by step:

```bash
npm run audio     # scripts/make-audio.mjs → public/soundtrack.wav
npm run render    # Remotion → out/dog-eats-cake-raw.mp4
npm run finish    # scripts/finish.sh → dog-eats-cake.mp4 + poster.jpg
npm run studio    # live preview in the browser
```

Timing for the bites, chews, lick, blinks and music lives in `src/timing.json` and drives both
the animation and the soundtrack.
