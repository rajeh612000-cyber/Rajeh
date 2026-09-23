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
- Susan's photo is 365x547. Her frame is 320px wide in the featured image
  (0.88x) and 460px in the Vimeo image (1.26x), under the 1.3x limit.
- Mariam is cropped to head and shoulders from the 1600px original and
  converted from its embedded profile to sRGB.
