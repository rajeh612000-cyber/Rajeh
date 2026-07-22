import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import { FONT, W } from "../theme/fonts";
import { PALETTE } from "../theme/palette";

/** Small uppercase scene label with an animated accent underline. */
export const SceneKicker: React.FC<{ label: string; local: number; life: number }> = ({ label, local, life }) => {
  const { fps } = useVideoConfig();
  const t = local / fps;
  const inP = interpolate(t, [0.1, 0.5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const outP = interpolate(local, [life - 12, life], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const o = Math.min(inP, outP);
  const barW = interpolate(t, [0.2, 0.8], [0, 54], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  return (
    <div style={{ position: "absolute", top: 150, left: "50%", transform: `translateX(-50%) translateY(${(1 - inP) * -16}px)`, opacity: o, textAlign: "center" }}>
      <div style={{ height: 6, width: barW, background: PALETTE.yellow, borderRadius: 3, margin: "0 auto 16px" }} />
      <div style={{ fontFamily: FONT, fontWeight: W.bold, fontSize: 30, letterSpacing: 8, color: PALETTE.white, textTransform: "uppercase", opacity: 0.92 }}>
        {label}
      </div>
    </div>
  );
};
