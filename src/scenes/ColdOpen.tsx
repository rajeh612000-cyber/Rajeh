import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Easing } from "remotion";
import { SmartShopperLockup } from "../components/logo/SmartShopperLockup";
import { PALETTE } from "../theme/palette";

export const ColdOpen: React.FC<{ life: number }> = ({ life }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Build completes ~1.4s to land on "Smart Shopper"
  const build = spring({ frame, fps, durationInFrames: 42, config: { damping: 200 } });
  const textReveal = spring({ frame: frame - 24, fps, durationInFrames: 26, config: { damping: 200 } });

  // Exit: scale down + fade as the watermark takes over
  const exit = interpolate(frame, [life - 18, life], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
  const exitScale = interpolate(frame, [life - 18, life], [1, 0.6], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
  const exitX = interpolate(frame, [life - 18, life], [0, -560], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
  const exitY = interpolate(frame, [life - 18, life], [0, -300], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });

  const glow = interpolate(build, [0, 1], [0, 0.5]);

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: exit }}>
      {/* soft brand glow */}
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${PALETTE.mediumBlue}55 0%, transparent 60%)`,
          opacity: glow,
          filter: "blur(20px)",
        }}
      />
      <div style={{ transform: `translate(${exitX}px, ${exitY}px) scale(${exitScale})` }}>
        <SmartShopperLockup markSize={300} variant="reversed" build={build} textReveal={textReveal} />
      </div>
    </AbsoluteFill>
  );
};
