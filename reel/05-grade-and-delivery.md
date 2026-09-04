# Grade, typography and delivery

## The grade

The grade is doing two jobs. It carries the mood, and it hides the seams between nine clips from different generators. Build it as one node tree and apply it to everything except the gym.

Cold base, all shots except 4

- White balance read: shoot for 5600 K and read it at 4300 K so everything leans blue.
- Shadows: lift toward teal blue, hue around 215, low saturation. Never crush to pure black. There should always be something in the blacks.
- Midtones: slight cyan push.
- Highlights: desaturate 20 percent, roll off softly. Practicals get a small bloom.
- Contrast: gentle S curve. This is a quiet image.
- Print emulation: a subtle film print LUT at 40 to 60 percent opacity. Any of the common Kodak print emulations works.

Warm break, shot 4 only

- White balance read at 3200 K. Everything goes amber.
- Saturation up 25 percent. Contrast up 15 percent. Crush the blacks here and only here.
- Halation on every bright edge. Heavier grain than the rest.

Unifiers, over everything

- **Grain.** One fine 35 mm grain layer at the same intensity across all nine shots. This is the single biggest trick for making AI clips cut together. Apply it last.
- **Flare.** One anamorphic streak pass on every practical light, same blue, same length, added in post. Do not trust the generator to be consistent.
- **Vignette.** Subtle, off centre, darker at the top for the tall frame.
- **Sharpen.** None. Generated footage often arrives oversharp. If anything, soften the edges very slightly and let the grain restore the bite.

## Typography for the comped elements

Only three pieces of text exist, and they all belong to the world of the film.

| Element | Face | Treatment |
|---|---|---|
| "Senior" on the nameplate | An engraved sans, tight tracking, all caps | Slightly lighter than the plate, bevelled, with a specular that catches the monitor light |
| Inbox counter "0" | A UI mono or a plain UI sans | Small, top right of the screen, low contrast, matches the app UI around it. The point is that nobody would notice it unless they looked |
| Render bar and "100%" | Plain terminal or UI mono | Thin bar, dim text at 62, brighter on the snap |

No titles, no lower thirds, no name, no watermark. If you want to sign it, sign it in the caption.

## Screens

Every screen is a comp. Build them once as a flat 16:9 composition, then corner pin onto the tracked monitor.

- Add a 2 pixel screen edge glow, a very slight barrel curve, and a low opacity scanline or pixel grid to marry it to the plate.
- Brand marks on shot 2 and 7: place them at 60 percent opacity in the screen's own light, not as stickers.
- Application cards on shot 6: 12 to 16 cards, stacking from the bottom, each with a small check and the word "Sent". Keep them soft. Nobody should be able to read a company name.
- Inbox counter: fixed at 0. Do not animate it. Do not highlight it.

## Delivery to Instagram

| Setting | Value |
|---|---|
| Frame size | 1080 x 1920 |
| Frame rate | 24 fps native. Export at 24. If the platform asks for 30, conform with frame blending off and let it duplicate |
| Codec | H.264, High profile, level 4.2 |
| Bitrate | 20 to 25 Mbps VBR 2 pass. Instagram will recompress, so start high |
| Colour | Rec.709, full range tagged correctly. Check the export against the timeline on a phone |
| Audio | AAC, 48 kHz, 256 kbps stereo, minus 14 LUFS, true peak minus 1 dB |
| Length | 10.000 s exactly, 240 frames |
| Cover | Frame 0 exported as a still. The lit window must be visible in it |

Safe zones on a 1080 x 1920 frame

- Top 250 pixels: username and audio label overlay. Keep nothing important here.
- Bottom 340 pixels: caption, buttons and progress bar. Keep nothing important here.
- Right 120 pixels: like, comment, share stack. Keep the nameplate, the counter and the render bar out of this column.
- The lit window in shot 1, the arc's stopping point in shot 9, and all three text elements live inside the centre 1080 x 1350.

Loop check

Export, then watch it loop five times on a phone before posting. The cut from frame 239 back to frame 0 should feel like a breath, not a hiccup. If it hiccups, the black is too long or the drone is tailing over the loop point.
