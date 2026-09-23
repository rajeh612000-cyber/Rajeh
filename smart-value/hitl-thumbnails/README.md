# Human in the Loop, Episode 1: thumbnails

| File | Use |
|---|---|
| `hitl-ep1-featured-1200x630.jpg` | WordPress featured image and LinkedIn / social share preview (1.91:1) |
| `hitl-ep1-vimeo-1920x1080.jpg` | Vimeo thumbnail (16:9) |
| `preview-400.jpg` | 400px check of the featured image, not for upload |
| `thumbnail.html` | Source for both sizes (`?size=featured` / `?size=vimeo`) |
| `render.py` | Renders both, fails if Sora falls back, writes sRGB JPG q85 |

Files prefixed `draft-` have an empty dashed box where the Smart Value logo goes.
The logo file has not been supplied yet.

## Adding the logo

1. Save the logo as `assets/smart-value-logo.png`.
2. In `thumbnail.html`, replace the comment inside `#logo-slot` with
   `<img src="assets/smart-value-logo.png" alt="Smart Value AI Solutions">`.
3. `python3 render.py` (no `--draft`).

## Notes

- Sora is bundled in `fonts/` (Google Fonts, SIL Open Font License). Headless
  Chromium here cannot fetch Google Fonts, and file:// paths block web fonts,
  so render.py serves this folder on localhost.
- Layout: Mariam in conversation with Susan. The two sit as equal circles on
  the back of the Human in the Loop ring (three.js, rendered live in the page);
  the front arc, with the quiet gap and amber light, sweeps between them.
  Portrait positions are projected from the ring in code, so both sizes line up.
- Susan: 330px square crop of the 365x547 source, shown at 192px (featured)
  and 307px (Vimeo), never enlarged. Mariam: head-and-shoulders crop of the
  1600px original, converted from its embedded profile to sRGB.
- Names and credentials live in the left column, Mariam first, so no text sits
  over the ring or near the cropped edges. Every mention of Smart Value carries TM.
- The centre of the 16:9 frame stays empty navy, where Vimeo draws its play button.
