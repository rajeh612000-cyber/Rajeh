# Interview film assembler

Turns the raw screen recordings into one finished, branded film:

```
[ branded intro + music ]  ->  meeting, subtitles burned in  ->  [ branded outro + music ]
```

The meeting footage itself is left alone — only the intro and outro carry the
branded background, and the subtitles sit over the footage. That is what makes
the cut read as a film rather than a decorated screen capture.

Everything is generated locally. No stock footage, no licensed music, nothing
to buy: the intro/outro score is synthesised, so it is clean to publish.

---

## Run it

You need Python 3.9+ ([python.org](https://www.python.org/downloads/) — tick
**Add Python to PATH** during install). Everything else installs itself on the
first run.

**Windows:** put `edit.py`, `run.bat`, your `logo.png` and the two `.mov` files
in one folder, open `run.bat` and check the filenames at the top match yours,
then double-click it.

**Any platform:**

```bash
python edit.py "recording-1.mov" "recording-2.mov" \
    --logo logo.png \
    --title "Susan Interview" \
    --subtitle "Marketeers Research  |  Smart Value"
```

Output: `final_film.mp4`, 1920x1080.

First run downloads the speech model (~500 MB for `small`) and takes a while.
Later runs reuse it.

---

## Check the subtitles before you commit to a render

Transcription is good, not perfect — names, brands and product terms are where
it slips. So do this first:

```bash
python edit.py "recording-1.mov" "recording-2.mov" --srt-only
```

That writes a `.srt` next to each recording. Open them in Notepad, fix anything
wrong, then run the full command. The corrected files are picked up
automatically — it will not re-transcribe.

This costs five minutes and is the difference between subtitles that are
roughly right and subtitles that are right.

---

## Options

| Flag | What it does |
|---|---|
| `--logo logo.png` | Logo on the intro/outro cards. Transparent PNG, wide, ~900px. |
| `--title` / `--subtitle` | Intro card copy. |
| `--outro` / `--outro-subtitle` | Outro card copy. |
| `--model` | `tiny` `base` `small` `medium` `large-v3`. Bigger = more accurate, slower. `small` is the sweet spot; go `medium` if the audio is noisy. |
| `--language ar` | Skip auto-detect and force a language. |
| `--translate` | Arabic (or whatever was spoken) in, English subtitles out. |
| `--srt-only` | Subtitles only, no render. |
| `--no-subs` | Render without subtitles. |
| `--out name.mp4` | Output filename. |

Videos are joined in the order you list them, so put them in running order.

---

## Brand colours

Open `edit.py` and edit the `BRAND` block at the top. The placeholders are a
navy / petrol / gold scheme — **replace them with the real Smart Value hex
values** and the whole film re-skins itself.

```python
BRAND = {
    "bg_deep":   "0A1E3C",   # darkest, carries most of the frame
    "bg_mid":    "125E7A",
    "bg_accent": "E8B04B",   # highlight
    ...
}
```

Other things worth knowing:

- `CARD_SECONDS` — intro/outro length, default 6s.
- `sub_box_opacity` — set to `0` for outline-only subtitles with no box.
- `sub_margin_v` — raise it if the footage has anything along the bottom edge.
- `font_file_bold` / `font_file_regular` — point at brand `.ttf` files if you
  have them; otherwise Arial / Segoe UI / DejaVu is picked automatically.

---

## Notes

- Arabic subtitles render correctly, right-to-left and properly shaped.
- Re-running is cheap. The `build_film/` folder caches the transcripts; delete
  a `build_film/segN.srt` to force a re-transcribe of that video.
- Mixed source resolutions are fine — everything is conformed to 1080p and
  letterboxed rather than cropped, so nothing on screen gets cut off.
