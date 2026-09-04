# The Unlanded Arc

A ten second Instagram reel. Nine shots, 240 frames at 24 fps, one warm break, no dialogue, no captions, one note of music.

This folder is the full production package. Read it in order.

| File | What it is |
|---|---|
| `01-editors-notes.md` | The critique and the decisions. Why the cut is shaped the way it is. Read first. |
| `02-edit-decision-list.md` | Frame accurate EDL. In and out points, camera, lens, motion, transition, what each shot has to say. |
| `03-generation-prompts.md` | Per shot prompts for still first frames and for video, with negatives and settings. Paste ready. |
| `04-sound-design.md` | The sound map, beat by beat. Half of this reel is audio. |
| `05-grade-and-delivery.md` | Colour grade, grain, typography, Instagram delivery spec, safe zones. |
| `06-build-order.md` | The order to do the work in so nothing gets thrown away. |

## Interactive storyboard

Scrubbable 24 fps previz with the timeline, sound lane and EDL cards: https://claude.ai/code/artifact/46593523-68fc-42c6-ae30-ccf19c34f86a

Source for that page is `storyboard.html` in this folder.

## Animatic

`the-unlanded-arc-animatic.mp4` is the storyboard rendered as a real video file at delivery spec: 1080 x 1920, 24 fps, 240 frames, H.264, AAC, with a soundtrack synthesized from the sound map (`synth-soundtrack.py`). It is the timing reference. Drop it on the timeline as the bottom track, then replace each shot with generated footage on top of it. It is not the final look.

## The idea in one line

A man doing more than anyone can see, in a room nobody else is in, aiming at a place he has not reached yet.

## The three rules that make it work

1. **Never show the face.** Reflection, back, silhouette only. This is what makes nine AI generated shots read as one person, and it is what makes the viewer lean in.
2. **One warm shot, cut short.** The gym is the only place with heat and speed. If it feels good, it is too long.
3. **Every screen is comped in post.** Generate blank glowing screens. Add the logos, the cards, the counter, the render bar, the nameplate in After Effects or Resolve. AI text is never sharp enough and never says what you need.
