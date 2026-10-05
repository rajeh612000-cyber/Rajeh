# Series thumbnail builder

Renders a 1280x720 YouTube thumbnail that still reads at feed-card size,
which is about 210px wide and where nearly every impression actually happens.

```bash
python make_thumbnail.py --guest susan.png --host mariam.png \
    --line1 "TWO AI REPORTS" --line2 "MISSED IT" --variant A --out ep01.png
```

Two files come out: the thumbnail, and `*_card.png` at 210px. Look at the small
one first. If the hook does not survive there, it does not matter how good the
big one looks.

## Variants

**A** stacks both faces as staggered portrait cards. It signals a conversation,
which is what makes people click on an interview.

**B** runs the guest full-bleed with the host as a circular inset. One large
face reads from further away. Use it when the guest carries name recognition.

## Supplying the portraits

Pull frames from the recording at full resolution rather than cropping a
screenshot:

```bash
ffmpeg -ss 00:04:12 -i recording.mov -frames:v 1 susan_raw.png
```

Pick the moment, not just a face. Mid-sentence and mid-gesture beats a neutral
listening pose by a wide margin. Scrub for a frame where the expression is
doing something, crop to head and shoulders with a little headroom, and save
around 800px wide or larger.

## Options

| Flag | What it does |
|---|---|
| `--line1` / `--line2` | The hook. Line 2 is the big amber one. |
| `--eyebrow` | Series label, top left. |
| `--brand` / `--sub` | The lockup, bottom left. |
| `--variant A\|B` | Layout. |
| `--chrome` | Path to Chromium if the script cannot find one. |

## House rules for the copy

Five words across both lines, maximum. The thumbnail is read in about a fifth
of a second, and every extra word shrinks the type.

Keep the bottom right corner empty. YouTube stamps the duration badge there,
and it will cover whatever you put underneath.

Say something the title does not. A thumbnail that repeats the title wastes
half the card.

## Colours and type

The palette at the top of the script was sampled from the episode's own title
background, so the thumbnail and the video match:

```
INK    #0B1038    deep indigo, carries the frame
INDIGO #2C2181    brand violet
BLUE   #17428C    brand blue
AMBER  #FFC53D    accent, sits opposite indigo so it survives a busy feed
```

The script embeds a font from `FONT_CANDIDATES` directly in the page, so it
renders the same everywhere. Put the brand `.ttf` at the top of that list. A
heavy condensed face such as Anton or Archivo Black will hit harder than the
Arial-metric fallback.
