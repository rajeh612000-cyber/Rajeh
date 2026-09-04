# Generation prompts

## How to use these

1. Generate a **still first frame** for each shot first. Use an image model with good realism. Pick the frame you love. This is where you control composition, palette and continuity.
2. Feed that frame into the video model as image to video. The video prompt describes only motion and change, because the image already carries the look.
3. Generate 4 to 6 variants per shot at the longest clip length the tool allows. You need only 24 to 29 frames from each. Choose the best second, not the best clip.
4. Generate 9:16 natively. Do not crop 16:9.
5. Every screen, sign and counter is generated **blank or as a soft glow** and comped in post. Never ask a generator for readable text.
6. Turn off any built in audio generation. The sound is designed separately.

## Global style block

Prepend this to every still prompt.

```
Cinematic 3D realism, vertical 9:16, anamorphic character with oval bokeh and faint horizontal blue lens streaks on practical lights, shallow depth of field, volumetric haze, fine 35mm film grain, cold blue-black palette with teal midtones and desaturated highlights, no visible faces, no text, no logos, no watermark
```

Global negative.

```
readable text, letters, numbers, logos, watermark, visible face, eye contact, cartoon, illustration, oversaturated, warm colour cast, flat lighting, daylight, crowds in foreground, extra limbs, duplicate person, low resolution
```

For the gym shot only, replace the palette clause with the warm one given below.

## Character reference

Generate this once and use it as a reference image wherever the tool accepts references.

```
Man seen from behind and slightly to the side, dark short hair, charcoal grey overshirt over a black tee, steel watch on the left wrist, seated at a desk, no face visible, cinematic low key lighting from two monitors, vertical 9:16
```

## Shot 1. The fall

Still prompt

```
[global style] Aerial view straight down through pre-dawn haze over Cairo, dense apartment blocks, hundreds of dark windows, one single window lit warm amber in the lower centre of frame, faint sodium street lamps far below, no cars, no people, deep blue-black night, thick atmospheric haze at the top thinning toward the buildings
```

Video prompt

```
Camera descends steadily toward the single lit window, haze thins as it falls, the lit window grows from a point of light to fill the lower frame, slight forward tilt as it approaches, smooth, no shake, dark windows slide past on both sides
```

Notes: generate at the longest length. The usable 29 frames are the last third of the descent. Add a speed ramp in post, 1.5x to 1.0x.

## Shot 2. The orbit

Still prompt

```
[global style] Interior of a large open plan office at night, rows of empty desks with chairs pushed in and black monitors, one desk in the middle distance lit only by two glowing monitors, a man seated at it seen from behind and to the side, charcoal overshirt, watch on left wrist, monitors show only a soft blank glow, empty desks soft and dark in the foreground, cold blue ambient
```

Video prompt

```
Slow smooth orbit around the occupied desk, about 40 degrees, chest height, foreground empty desks drift past out of focus, the seated man stays centred and does not turn, the two monitors are the only light source, no camera shake
```

Notes: use the character reference. Slow it to 0.8x in post. Comp the two brand marks onto the screens with a soft glow and a slight screen curvature.

## Shot 3. The glass room

Still prompt

```
[global style] Long office corridor lit by cold blue ceiling strips, at the far end a glass walled meeting room glowing warm, six silhouettes inside mid laughter, one leaning back, arms gesturing, the camera in the corridor outside, foreground right an out of focus reflection of a man's shoulder and jaw on the glass, no face detail, strong vertical composition
```

Video prompt

```
Camera creeps forward very slightly along the corridor, the silhouettes inside the meeting room move naturally, laughing, gesturing, the reflection on the glass stays still, cold and quiet outside, warm and lively inside, no camera shake
```

Notes: if the reflection is too clear, blur it in post. The reflection must remain a shape. Generate with extra length so the last 6 frames can be smeared into the whip.

## Shot 4. The gym

Palette clause for this shot only

```
warm amber and tungsten palette, high saturation, high contrast, heavy film grain, dust particles in a strong vertical shaft of light
```

Still prompt

```
Cinematic 3D realism, vertical 9:16, anamorphic character, [warm palette clause], low angle inside a dim gym, a single vertical shaft of light through dust, a loaded barbell mid lift with the bar flexing under the plates, chalk dust in the air, a forearm and a steel watch on the left wrist gripping the bar, sweat, no face visible, the background falls into black
```

Video prompt

```
Handheld energy, the barbell rises through the shaft of light, plates blur with motion, dust swirls, chalk puffs from the grip, the camera drifts upward with the bar, then the bar begins to come down fast
```

Notes: the only handheld shot. Keep the motion blur. Cut out on the first downward frame of the bar.

## Shot 5. The keeper

Still prompt

```
[global style] Night football pitch under floodlights with low mist, a goalkeeper alone in his penalty box seen from behind the goal, gloves on knees, sixty yards upfield a group of teammates celebrating in a pile with their backs turned, heavily blurred by distance, long lens compression, the keeper sharp and small in the vast frame, cold blue green grass
```

Video prompt

```
Very slow push in from behind the goal toward the keeper, the keeper stays still and then straightens up slowly, the distant celebration moves as a blur, mist drifts across the floodlights, no camera shake
```

Notes: if the generator puts the keeper's face toward camera, regenerate. Back or profile only.

## Shot 6. The day

Still prompt

```
[global style] Same open plan office desk as before, three quarter view from behind the seated man, two monitors glowing soft blank, a hard bar of sunlight on the wall behind the desk, dawn light through tall windows, empty desks around, charcoal overshirt, watch on left wrist
```

Video prompt

```
Time lapse across a full day, the bar of sunlight sweeps across the wall and floor from left to right and fades to blue dusk, the man stays at the desk with small quick movements, the monitors glow constant, clouds flicker in the windows, locked off camera
```

Notes: comp the stacking "Sent" cards and the zero inbox counter onto the left monitor in post. Track the screen with four corner pins. The counter never changes.

## Shot 7. The nameplate

Still prompt A (macro)

```
[global style] Extreme close up of a brushed dark metal nameplate on a desk edge, blank face, shallow depth of field, cool light from a monitor, a dark keyboard soft in the background
```

Still prompt B (wide)

Reuse the shot 2 still, same framing.

Video prompt

```
Camera starts tight on the nameplate and pulls straight back smoothly to reveal the full desk, the seated man from behind, two glowing monitors, and the empty office around, nothing else moves
```

Notes: the word "Senior" is comped onto the blank plate with a tracked surface and a subtle engraved look. The slide in of the plate is done in post on the first 6 frames with a motion blur trail.

## Shot 8. The render

Still prompt

```
[global style] Over the shoulder view of a man at a desk at night, charcoal overshirt, one monitor filling most of the frame with a soft blank glow, a hand resting near a dark keyboard with a steel watch on the left wrist, office dark and empty behind, cool light on the desk
```

Video prompt

```
Locked off, the hand moves to the keyboard and types briefly, then rests, the monitor glow flickers slightly brighter, then a slow gentle push in toward the screen, no camera shake
```

Notes: the render bar, the 62 percent crawl, and the snap to 100 are comped. Time the snap to the exact frame where the hand hits enter, or cheat the hand in post.

## Shot 9. The arc

This shot is two generations and one comp.

Generation A, still prompt

```
[global style] Interior of the dark office at night, the seated man begins to stand from the desk, seen from behind, tall window behind the desk showing the Cairo night skyline with haze
```

Generation A, video prompt

```
The man stands, and the camera pulls back fast through the window into the night air, the office becomes a single lit rectangle in a dark building, the building shrinks into a block of dark buildings, the city lights spread across the frame, accelerating pull back, smooth
```

Generation B, still prompt

```
[global style] High altitude night view of the eastern Mediterranean, city lights as fine warm points, Cairo as a bright cluster at the bottom, the sea a dark band, the coast of Europe as faint lights at the top, haze, no text, no borders, no labels
```

Generation B, video prompt

```
Very slow drift upward, the city lights twinkle faintly, the haze moves, nothing else changes
```

Comp: cross dissolve A into B over 6 frames as the pull back reaches altitude. Draw the arc as a stroked path with trim paths, ease out over 8 frames, stopping two thirds across the sea. Add a 2 frame overshoot back. Add one faint pulse on the tip at frame 236. Keep the line thin, one to two pixels at delivery, a slightly warmer white than the city lights.

## Tool notes

Do not treat these as rankings. Use whichever current tool gives you the best frame for a given shot, and expect to mix.

- **Image to video with references** (Runway, Kling, Veo, Sora and their successors): use the character reference and the desk still as references on shots 2, 6, 7, 8, 9A. This is where continuity is won or lost.
- **Aerials and pull backs** (shots 1 and 9A): the models are good at these. Ask for smooth, ask for no shake, and generate long.
- **Crowds and silhouettes** (shots 3 and 5): keep the people small and blurred. Generators fail on hands and faces at mid distance, which is exactly why these shots keep them far away or behind glass.
- **The gym**: generate more variants here than anywhere else. The bar flex and the dust are what sell it.
- **Stills first**: any strong image model. Nail the still, then animate. A weak still never becomes a strong clip.
