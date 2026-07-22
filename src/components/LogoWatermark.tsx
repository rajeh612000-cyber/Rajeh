import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import { SmartShopperMark } from "./logo/SmartShopperMark";
import { FONT, W } from "../theme/fonts";
import { PALETTE } from "../theme/palette";
import { drift } from "../motion/springs";

/** Small persistent brand mark, top-left, during the body scenes. */
export const LogoWatermark: React.FC<{ appearAt: number; hideAt?: number }> = ({ appearAt, hideAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const inRaw = interpolate(t, [appearAt, appearAt + 0.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const outP = hideAt
    ? interpolate(t, [hideAt, hideAt + 0.4], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 1;
  const inP = Math.min(inRaw, outP);
  if (inP <= 0) return null;
  const y = drift(frame, fps, 3, 5);
  return (
    <div
      style={{
        position: "absolute",
        left: 64,
        top: 52 + y,
        display: "flex",
        alignItems: "center",
        gap: 14,
        opacity: inP,
        transform: `translateX(${(1 - inP) * -30}px)`,
      }}
    >
      <SmartShopperMark size={64} variant="reversed" />
      <div style={{ fontFamily: FONT, fontWeight: W.extraBold, fontSize: 26, color: PALETTE.white, lineHeight: 1 }}>
        Smart<br />Shopper
        <span style={{ fontSize: 11, color: PALETTE.yellow, verticalAlign: "top" }}>™</span>
      </div>
    </div>
  );
};
