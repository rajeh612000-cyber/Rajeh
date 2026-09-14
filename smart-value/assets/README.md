# Assets

## amsterdam-hero.jpg

The hero illustration. Amsterdam canal houses drawn with the four gable types
you actually see on the Herengracht: step (trapgevel), bell (klokgevel), neck
(halsgevel) and spout. Two depth layers, a canal reflection under the waterline,
a few windows lit in amber, and a scrim over the left two thirds so white
headline type stays legible over it.

Generated, not stock. `build-amsterdam.py` writes the SVG from a fixed seed, so
rebuilding gives identical output and the palette can be changed in one place.

```
python3 build-amsterdam.py
/opt/pw-browsers/chromium-1194/chrome-linux/chrome --headless --no-sandbox \
  --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
  --window-size=1200,660 --screenshot=amsterdam-hero.png "file://$PWD/shot.html"
```

| File | Size | Use |
|---|---|---|
| `amsterdam-hero.jpg` | 22 KB | ship this one |
| `amsterdam-hero.png` | 330 KB | lossless master, do not email |
| `amsterdam-hero.svg` | 120 KB | source, for reprints or recolouring |

1200x660, displayed at 600x330, so it is 2x for retina.

JPEG rather than PNG because the file is fifteen times smaller and the artwork
is flat colour at low contrast, where JPEG artefacts are invisible. Do not email
the PNG.

## How it is used

The hero cell carries both a `background` attribute and a CSS
`background-image`. Outlook desktop honours neither and falls back to solid
`#1A1A4E`, which is the design the hero had before the illustration existed, so
nothing looks broken. Every other client shows the illustration.

The usual way to force Outlook to render a background image is a VML
`<v:rect>`, and that is exactly the markup GetResponse rejects. The fallback is
the better trade.
