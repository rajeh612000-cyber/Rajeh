#!/usr/bin/env python3
"""
Temp score for the Price Optimizer explainer.

This is a TEMP TRACK, deliberately so. It is written procedurally from the
film's own cue sheet, which makes it exactly the right length and exactly in
sync with the picture — so the edit can be judged with sound before anyone
spends money on a licence. Swap it for a licensed bed or a commissioned cue
before release; the cue sheet below is the brief for whoever writes it.

The design brief it implements:

  Key          D minor. Low, unhurried, no resolution until the end.
  Bed          A sub pad with slow-moving upper partials. Nothing percussive.
  Pulses       One soft mark per data event. They are the film's only rhythm,
               and they are irregular, because the data is.
  The chord    One warm settle at 0:56.4, when the recommended price locks and
               the only orange in the film appears. It is the single moment of
               resolution in the whole cue, and it has to be earned by the
               eleven quiet seconds before it.
  Level        Mixed low. This film is read, not watched; the sound is there so
               silence does not feel like a fault.

  python3 tools/score.py --out out/score.wav
"""

import argparse
import math
import struct
import wave

import numpy as np

SR = 48_000
DURATION = 78.0

# --------------------------------------------------------------------------
# Cue sheet. Times are the picture's, not a grid: the film has no tempo.
# --------------------------------------------------------------------------

#: Pad level across the film. (time, gain) breakpoints, linearly interpolated.
BED = [
    (0.0, 0.00), (1.2, 0.34), (7.0, 0.38), (8.6, 0.30),   # the flat shelf
    (10.0, 0.42), (18.0, 0.52), (20.6, 0.40),             # the hidden curve
    (21.4, 0.46), (28.0, 0.60), (31.6, 0.44),             # the standoff
    (32.4, 0.50), (41.0, 0.62), (44.0, 0.46),             # the machine
    (45.0, 0.52), (51.0, 0.66), (53.6, 0.40),             # scenarios
    (55.2, 0.30), (56.2, 0.34), (56.6, 0.78),             # the hold, then the lock
    (58.0, 0.62), (62.0, 0.66), (68.0, 0.58),             # ladder and retailers
    (69.0, 0.72), (74.0, 0.70), (77.2, 0.0),              # resolve
]

#: (time, kind, gain). 'tick' = a node lands. 'mark' = a section turns.
#: 'break' = R2 goes through the guardrail. 'lock' = the recommendation.
CUES = (
    [(0.45 + i * 0.055, 'tick', 0.22) for i in range(13)] +        # posts rise
    [(4.92, 'mark', 0.5)] +                                        # blanket increase
    [(5.72 + i * 0.16, 'tick', 0.3) for i in range(4)] +           # shoppers lost
    [(10.0, 'mark', 0.42), (10.65, 'tick', 0.3)] +                 # lens, hero curve
    [(15.1 + i * 0.1, 'tick', 0.13) for i in range(12)] +          # the field of curves
    [(21.3, 'mark', 0.34), (22.1, 'mark', 0.34), (22.9, 'mark', 0.34)] +
    [(28.4, 'mark', 0.4), (29.0, 'mark', 0.55)] +                  # lock, then the solid
    [(32.9, 'mark', 0.3)] +
    [(33.95, 'tick', 0.3), (35.85, 'tick', 0.3), (37.75, 'tick', 0.3), (39.65, 'tick', 0.3)] +
    [(40.25, 'mark', 0.45)] +                                      # one future solidifies
    [(45.05, 'mark', 0.3)] +                                       # guardrail
    [(46.45, 'tick', 0.34), (46.83, 'tick', 0.34), (47.21, 'tick', 0.34)] +   # R1
    [(49.35, 'tick', 0.34), (49.73, 'tick', 0.34), (50.11, 'tick', 0.34)] +   # R2
    [(51.31, 'break', 0.75)] +                                     # through the guardrail
    [(52.25, 'tick', 0.34), (52.63, 'tick', 0.34), (53.01, 'tick', 0.34)] +   # R3
    [(56.40, 'lock', 1.0)] +                                       # the recommendation
    [(58.7, 'mark', 0.3)] +
    [(58.9 + i * 0.16, 'tick', 0.22) for i in range(4)] +          # the ladder
    [(63.7, 'mark', 0.4), (64.1, 'tick', 0.2), (64.5, 'tick', 0.2), (64.9, 'tick', 0.2)] +
    [(68.8, 'mark', 0.5), (72.5, 'mark', 0.45)]                    # resolve, lock-up
)

# D minor.
D2, A2, D3, F3, A3, E4, D4 = 73.416, 110.000, 146.832, 174.614, 220.000, 329.628, 293.665


def breakpoints(points, n):
    """Linear interpolation of a (time, value) envelope onto the sample grid."""
    t = np.arange(n) / SR
    xs = np.array([p[0] for p in points])
    ys = np.array([p[1] for p in points])
    return np.interp(t, xs, ys)


def pad(n):
    """The bed: a stack of detuned partials, each drifting on its own slow LFO."""
    t = np.arange(n) / SR
    out = np.zeros(n)
    voices = [
        (D2, 1.00, 0.047), (D2 * 1.004, 0.75, 0.031),
        (A2, 0.52, 0.053), (A2 * 0.997, 0.40, 0.037),
        (D3, 0.30, 0.061), (F3, 0.26, 0.043),
        (A3, 0.13, 0.071), (D4, 0.07, 0.029),
    ]
    for freq, amp, lfo in voices:
        drift = 1 + 0.0016 * np.sin(2 * np.pi * lfo * t + freq)
        swell = 0.72 + 0.28 * np.sin(2 * np.pi * lfo * 0.6 * t)
        out += amp * swell * np.sin(2 * np.pi * freq * drift * t)
    return out / 3.2


def blip(freq, dur, attack=0.004, shape=3.2):
    """A single soft mark. Fast in, long out, no click."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    env = np.exp(-t * shape)
    a = int(attack * SR)
    if a:
        env[:a] *= np.linspace(0, 1, a)
    body = np.sin(2 * np.pi * freq * t) + 0.3 * np.sin(2 * np.pi * freq * 2 * t)
    return body * env


def chord(freqs, dur, shape=0.9):
    n = int(dur * SR)
    t = np.arange(n) / SR
    env = np.exp(-t * shape) * (1 - np.exp(-t * 26))
    out = np.zeros(n)
    for i, f in enumerate(freqs):
        out += (1.0 / (1 + i * 0.5)) * np.sin(2 * np.pi * f * t)
    return out * env / len(freqs)


def add(buf, sig, at, gain):
    i = int(at * SR)
    j = min(len(buf), i + len(sig))
    if i < len(buf):
        buf[i:j] += sig[: j - i] * gain


def reverb(x, taps=((0.031, 0.30), (0.047, 0.24), (0.071, 0.18), (0.113, 0.13), (0.167, 0.08))):
    """A few early reflections. Cheap, and all this room needs."""
    out = x.copy()
    for delay, gain in taps:
        d = int(delay * SR)
        out[d:] += x[:-d] * gain
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', default='out/score.wav')
    ap.add_argument('--duration', type=float, default=DURATION)
    args = ap.parse_args()

    n = int(args.duration * SR)
    bed = pad(n) * breakpoints(BED, n)

    cues = np.zeros(n)
    for at, kind, gain in CUES:
        if at >= args.duration:
            continue
        if kind == 'tick':
            add(cues, blip(A3 * 2, 0.5, shape=7.0), at, 0.10 * gain)
        elif kind == 'mark':
            add(cues, blip(D3, 1.4, shape=2.6), at, 0.13 * gain)
        elif kind == 'break':
            # The guardrail going. Low, short, and the only ugly sound in the film.
            add(cues, blip(D2 * 0.75, 1.9, attack=0.001, shape=2.2), at, 0.30 * gain)
            add(cues, blip(F3 * 0.5 * 1.06, 0.9, shape=5.0), at, 0.12 * gain)
        elif kind == 'lock':
            # The one resolution in the cue: D minor add9.
            add(cues, chord([D3, F3, A3, E4], 5.5, shape=0.55), at, 0.34 * gain)
            add(cues, blip(D4, 1.6, shape=2.0), at, 0.09 * gain)

    mix = bed * 0.46 + cues
    mix = reverb(mix)

    # Gentle head and tail, so the film never starts or stops on a hard edge.
    head, tail = int(0.8 * SR), int(2.4 * SR)
    mix[:head] *= np.linspace(0, 1, head)
    mix[-tail:] *= np.linspace(1, 0, tail)

    # Soft-clip, then land the peak at -3 dBFS. Mixed low on purpose.
    mix = np.tanh(mix * 1.15)
    peak = np.max(np.abs(mix)) or 1.0
    mix = mix / peak * 0.707

    # Narrow stereo: a few milliseconds of spread, mono-safe.
    spread = int(0.011 * SR)
    left = mix.copy()
    right = np.concatenate([np.zeros(spread), mix[:-spread]]) * 0.97 + mix * 0.03
    stereo = np.stack([left, right], axis=1)

    pcm = (np.clip(stereo, -1, 1) * 32767).astype('<i2')
    with wave.open(args.out, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print(f'wrote {args.out}  {args.duration:.1f}s  {SR} Hz stereo')


if __name__ == '__main__':
    main()
