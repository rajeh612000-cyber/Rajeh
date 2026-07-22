import { interpolate, spring, Easing } from "remotion";

type SpringArgs = { frame: number; fps: number; delay?: number; duration?: number };

/** Smooth spring 0..1 used for entrances (scale/opacity/slide). */
export const enter = ({ frame, fps, delay = 0, duration = 22 }: SpringArgs) =>
  spring({
    frame: frame - delay,
    fps,
    durationInFrames: duration,
    config: { damping: 200, mass: 0.9 },
  });

/** Slightly bouncy spring for accent pops. */
export const pop = ({ frame, fps, delay = 0, duration = 20 }: SpringArgs) =>
  spring({
    frame: frame - delay,
    fps,
    durationInFrames: duration,
    config: { damping: 12, mass: 0.7, stiffness: 140 },
  });

/**
 * Entrance+exit envelope for an element that lives within a local window.
 * Returns { o: opacity, y: translateY, s: scale-ish } — every element moves.
 */
export const inOut = (
  frame: number,
  fps: number,
  lifeFrames: number,
  opts: { inDur?: number; outDur?: number; delay?: number; rise?: number } = {}
) => {
  const { inDur = 16, outDur = 14, delay = 0, rise = 40 } = opts;
  const f = frame - delay;
  const eIn = enter({ frame: f, fps, duration: inDur });
  const out = interpolate(f, [lifeFrames - outDur, lifeFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });
  const o = Math.min(eIn, out);
  const y = (1 - eIn) * rise;
  return { o, y, s: 0.92 + eIn * 0.08, eIn, out };
};

/** Continuous drift value (never static): smooth looping sine in px. */
export const drift = (frame: number, fps: number, amp = 6, periodSec = 4, phase = 0) =>
  Math.sin((frame / fps) * (Math.PI * 2) / periodSec + phase) * amp;

/** Scene-level fade in/out envelope by local frame. */
export const sceneFade = (frame: number, life: number, inF = 10, outF = 12) =>
  Math.min(
    interpolate(frame, [0, inF], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    interpolate(frame, [life - outF, life], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
  );
