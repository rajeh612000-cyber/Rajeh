import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Easing } from "remotion";
import { SmartShopperLockup } from "../components/logo/SmartShopperLockup";
import { PALETTE } from "../theme/palette";
import { FONT, W } from "../theme/fonts";
import { drift } from "../motion/springs";

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const build = spring({ frame, fps, durationInFrames: 18, config: { damping: 200 } });
  const inP = interpolate(frame, [0, 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const tagP = interpolate(frame, [12, 26], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const barW = interpolate(frame, [20, 38], [0, 300], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const bob = drift(frame, fps, 4, 4);

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: inP }}>
      <div style={{ position: "absolute", width: 1100, height: 1100, borderRadius: "50%", background: `radial-gradient(circle, ${PALETTE.mediumBlue}44 0%, transparent 60%)` }} />
      <div style={{ transform: `translateY(${bob - 20}px) scale(${0.96 + build * 0.04})`, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <SmartShopperLockup markSize={260} variant="reversed" build={build} textReveal={build} />
        <div style={{ height: 6, width: barW, background: PALETTE.yellow, borderRadius: 3, margin: "40px 0 26px" }} />
        <div style={{ fontFamily: FONT, fontWeight: W.medium, fontSize: 46, color: PALETTE.white, letterSpacing: 2, opacity: tagP, transform: `translateY(${(1 - tagP) * 14}px)` }}>
          Empowering Growth
        </div>
      </div>
    </AbsoluteFill>
  );
};
