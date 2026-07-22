import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { PALETTE } from "../theme/palette";

type Mode = "navyBlue" | "navyBlack";

/**
 * Never-static background: a slow-moving 35deg linear gradient with a lighter
 * tone drifting in from the top-right, cycling between navy->medium-blue and
 * navy->black depending on the scene. Per brand guide motion direction.
 */
export const GradientBackground: React.FC<{
  mode?: Mode;
  /** seconds for one full drift cycle */
  cycle?: number;
}> = ({ mode = "navyBlue", cycle = 12 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const phase = (t % cycle) / cycle; // 0..1
  const drift = Math.sin(phase * Math.PI * 2); // -1..1 smooth

  const light = mode === "navyBlack" ? PALETTE.black : PALETTE.mediumBlue;

  // The lighter tone origin drifts around the top-right corner.
  const cx = interpolate(drift, [-1, 1], [62, 88]);
  const cy = interpolate(drift, [-1, 1], [8, 26]);
  const shift = interpolate(drift, [-1, 1], [26, 46]);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(35deg, ${PALETTE.navy} 0%, ${PALETTE.navy} ${shift}%, ${light} 118%)`,
      }}
    >
      {/* Soft light bloom drifting from the top-right for extra depth */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(60% 60% at ${cx}% ${cy}%, ${light}66 0%, transparent 60%)`,
          mixBlendMode: "screen",
          opacity: 0.7,
        }}
      />
    </AbsoluteFill>
  );
};
