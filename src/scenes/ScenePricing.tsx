import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import { PALETTE } from "../theme/palette";
import { FONT, W } from "../theme/fonts";
import { pop, enter } from "../motion/springs";
import { SceneKicker } from "../components/SceneKicker";

const sceneFade = (frame: number, life: number) =>
  Math.min(
    interpolate(frame, [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    interpolate(frame, [life - 12, life], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
  );

const PriceTag: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const s = pop({ frame, fps, delay: 4, duration: 24 });
  const rot = interpolate(s, [0, 1], [-14, -6]);
  // number optimizes: settles to 3.49 with a small search
  const val = interpolate(frame, [10, 22, 34, 46], [4.99, 3.19, 3.69, 3.49], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const locked = frame > 48;
  const tagColor = locked ? PALETTE.yellow : PALETTE.white;
  return (
    <div style={{ transform: `scale(${s}) rotate(${rot}deg)`, opacity: s, transformOrigin: "center center", position: "relative", width: 300, height: 300 }}>
      <svg width="300" height="300" viewBox="0 0 300 300" style={{ position: "absolute", inset: 0 }}>
        {/* tag body: rounded square rotated 45 */}
        <rect x="70" y="70" width="160" height="160" rx="28" transform="rotate(45 150 150)" fill={tagColor} />
        {/* eyelet hole */}
        <circle cx="106" cy="106" r="16" fill={PALETTE.navy} />
        {/* string */}
        <path d="M96 96 Q60 60 44 44" fill="none" stroke={PALETTE.white} strokeWidth="6" strokeLinecap="round" opacity="0.6" />
        {locked && <path d="M150 150 m34 8 l10 12 l22 -30" fill="none" stroke={PALETTE.navy} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" transform="translate(-24 6)" opacity="0" />}
      </svg>
      <div
        style={{
          position: "absolute",
          top: 128,
          left: 0,
          width: 300,
          textAlign: "center",
          fontFamily: FONT,
          fontWeight: W.extraBold,
          fontSize: 58,
          color: PALETTE.navy,
        }}
      >
        ${val.toFixed(2)}
      </div>
    </div>
  );
};

const Pack: React.FC<{ frame: number; fps: number; delay: number; h: number; label: string; best?: boolean }> = ({ frame, fps, delay, h, label, best }) => {
  const e = enter({ frame, fps, delay, duration: 20 });
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", opacity: e, transform: `translateY(${(1 - e) * 40}px)` }}>
      <div style={{ fontFamily: FONT, fontWeight: W.bold, fontSize: 26, color: best ? PALETTE.yellow : PALETTE.white, marginBottom: 10 }}>{label}</div>
      <div
        style={{
          width: 92,
          height: h,
          borderRadius: "10px 10px 6px 6px",
          background: best ? PALETTE.yellow : PALETTE.mediumBlue,
          border: `3px solid ${best ? PALETTE.yellow : "rgba(255,255,255,0.25)"}`,
          boxShadow: best ? `0 12px 30px ${PALETTE.yellow}55` : "none",
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", top: 12, left: 12, right: 12, height: 14, borderRadius: 4, background: "rgba(255,255,255,0.35)" }} />
      </div>
    </div>
  );
};

export const ScenePricing: React.FC<{ life: number }> = ({ life }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const o = sceneFade(frame, life);

  return (
    <AbsoluteFill style={{ opacity: o }}>
      <SceneKicker label="Price Optimization" local={frame} life={life} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "row", gap: 130, top: -30 }}>
        <div style={{ position: "relative", width: 300, height: 330 }}>
          <PriceTag frame={frame} fps={fps} />
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 34 }}>
          <Pack frame={frame} fps={fps} delay={16} h={120} label="S" />
          <Pack frame={frame} fps={fps} delay={24} h={180} label="M" best />
          <Pack frame={frame} fps={fps} delay={32} h={240} label="L" />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
