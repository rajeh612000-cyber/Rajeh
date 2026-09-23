# Human in the Loop hero (email 3)

A conversation drawn as a loop of sound. The ring is the loop in "Human in the
Loop". The bars are two voices taking turns, purple and lavender. One arc at the
front is silent, and a soft amber light sits in it: the insight Susan heard in
what nobody put into words, which both AI reports missed.

Built in three.js and rendered to a still, because email clients strip
JavaScript and none of the major ones render WebGL. The email ships the JPG.

| File | Use |
|---|---|
| `hitl-hero.jpg` | 1200x660, 20 KB. The asset to upload to GetResponse. |
| `hitl-hero-preview.jpg` | Same art with placeholder copy laid over it, for sign-off only. |
| `scene.html` | Source. Seeded, so every render is identical. |

## Rebuild

```
npm install three@0.169.0          # next to scene.html
python3 -m http.server 8765 &
chrome --headless --no-sandbox --use-angle=swiftshader --enable-unsafe-swiftshader \
  --window-size=1200,660 --force-device-scale-factor=1 --virtual-time-budget=6000 \
  --screenshot=hero.png http://localhost:8765/scene.html
```

Append `#preview` to the URL to render with the copy overlay.

The silent arc is anchored to the camera-facing side of the ring in code
(`FRONT - 0.42`), not to a fixed bar index, so moving the camera or the ring
keeps the light in view.
