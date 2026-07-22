import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { GradientBackground } from "./GradientBackground";
import type { Scene } from "../types";

/** Crossfades between the navy→blue and navy→black gradient per scene bg. */
export const BackgroundController: React.FC<{ scenes: Scene[] }> = ({ scenes }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  // Determine "blackness" target with 0.6s ramps around scene boundaries.
  let black = 0;
  for (const s of scenes) {
    if (t >= s.start && t <= s.end) {
      black = s.bg === "navyBlack" ? 1 : 0;
    }
  }
  // Smooth by sampling neighboring boundaries
  const ramp = 0.6;
  let target = 0;
  for (const s of scenes) {
    const val = s.bg === "navyBlack" ? 1 : 0;
    if (t >= s.start - ramp && t <= s.end + ramp) {
      const a = interpolate(t, [s.start - ramp, s.start], [target, val], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      target = a;
      if (t >= s.start && t <= s.end) target = val;
    }
  }
  black = target;

  return (
    <AbsoluteFill>
      <GradientBackground mode="navyBlue" cycle={16} />
      <AbsoluteFill style={{ opacity: black }}>
        <GradientBackground mode="navyBlack" cycle={13} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
