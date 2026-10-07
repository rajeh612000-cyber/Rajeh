#!/usr/bin/env python3
"""
Lay the voiceover against picture.

The read is generated as ONE continuous take, which is what you want from a
narrator — the tone and pace stay consistent in a way that ten separate renders
never do. It is then cut into phrases and each phrase is placed at its own cue,
so the words land on the pictures they describe rather than drifting a little
further out of step with every sentence.

The phrase boundaries come from silence detection on the take; the mapping from
phrase to cue is the cue sheet below, which is the same spine the picture and
the score were built on.

  python3 tools/vo_track.py --vo out/vo/raw.mp3 --out out/vo/vo-track.wav
"""

import argparse
import subprocess
import wave

import numpy as np

SR = 48_000
DURATION = 78.0

#: (speech start, speech end) in the take, and the time in the film it lands on.
#: Each block is one paragraph of the script, except the third, which carries
#: two — scene 2 makes one argument across two sentences and they belong together.
PLACEMENTS = [
    ((0.000,  4.097), 1.70,  "Most price decisions still start from last year's list price."),
    ((4.975,  7.713), 6.30,  "Easy to agree on. Expensive to get wrong."),
    ((8.452, 18.020), 10.80, "Everyone knows price moves volume... Every pack has its own curve."),
    ((18.862, 27.891), 22.30, "Finance pushes margin. Sales defends volume..."),
    ((29.376, 40.675), 33.00, "Connect your data. It models how volume reacts to price..."),
    ((41.524, 47.781), 45.60, "So you can see what a targeted increase on core packs really does..."),
    ((48.534, 51.575), 56.60, "Only one scenario clears your volume guardrail."),
    ((52.423, 64.025), 60.30, "Keep the pack-price ladder logical..."),
    ((65.049, 69.486), 72.70, "Price Optimizer. From Smart Value. Book a walkthrough."),
]

HEAD = 0.10   # a little air before each phrase, so nothing is clipped on the attack
TAIL = 0.18   # and after, so the last consonant is not cut


def decode(path):
    """Decode to mono float32 at the project rate."""
    raw = subprocess.run(
        ['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', str(SR),
         '-f', 's16le', '-'],
        check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype='<i2').astype(np.float32) / 32768.0


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--vo', default='out/vo/raw.mp3')
    ap.add_argument('--out', default='out/vo/vo-track.wav')
    args = ap.parse_args()

    take = decode(args.vo)
    n = int(DURATION * SR)
    track = np.zeros(n, dtype=np.float32)

    last_end = 0.0
    for (a, b), at, label in PLACEMENTS:
        i0 = max(0, int((a - HEAD) * SR))
        i1 = min(len(take), int((b + TAIL) * SR))
        seg = take[i0:i1].copy()

        # Short ramps at the splice points: the cut is inside silence, but a
        # hard edge on a noise floor still ticks.
        ramp = int(0.02 * SR)
        seg[:ramp] *= np.linspace(0, 1, ramp)
        seg[-ramp:] *= np.linspace(1, 0, ramp)

        j0 = int(at * SR)
        j1 = min(n, j0 + len(seg))
        track[j0:j1] += seg[: j1 - j0]

        dur = (i1 - i0) / SR
        gap = at - last_end
        flag = '  <-- OVERLAP' if gap < 0 else ''
        print(f'  {at:6.2f} +{dur:5.2f}s  (gap {gap:+5.2f}s){flag}  {label[:54]}')
        last_end = at + dur

    peak = float(np.max(np.abs(track))) or 1.0
    track = track / peak * 0.89

    pcm = (np.clip(np.stack([track, track], axis=1), -1, 1) * 32767).astype('<i2')
    with wave.open(args.out, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print(f'\nwrote {args.out}  {DURATION:.0f}s  (VO ends at {last_end:.2f}s)')


if __name__ == '__main__':
    main()
