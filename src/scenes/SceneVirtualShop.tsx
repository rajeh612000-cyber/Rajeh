import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import { PALETTE } from "../theme/palette";
import { FONT, W } from "../theme/fonts";
import { enter, sceneFade, drift } from "../motion/springs";
import { SceneKicker } from "../components/SceneKicker";

const COLS = 4;
const ROWS = 2;

const ShopperIcon: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const e = enter({ frame, fps, delay: 10, duration: 22 });
  const bob = drift(frame, fps, 5, 2.4);
  return (
    <div style={{ opacity: e, transform: `translateX(${(1 - e) * -60}px) translateY(${bob}px)` }}>
      <svg width="150" height="200" viewBox="0 0 150 200">
        <circle cx="75" cy="46" r="34" fill={PALETTE.white} />
        <path d="M18 200 Q18 108 75 108 Q132 108 132 200 Z" fill={PALETTE.mediumBlue} />
        <path d="M18 200 Q18 108 75 108 Q132 108 132 200 Z" fill="none" stroke={PALETTE.white} strokeWidth="4" opacity="0.4" />
      </svg>
    </div>
  );
};

const Tile: React.FC<{ frame: number; fps: number; delay: number; selected: boolean }> = ({ frame, fps, delay, selected }) => {
  const e = enter({ frame, fps, delay, duration: 18 });
  const pulse = selected ? 1 + Math.sin((frame / fps) * 6) * 0.03 : 1;
  return (
    <div
      style={{
        width: 128,
        height: 128,
        borderRadius: 16,
        background: selected ? "rgba(251,194,16,0.14)" : "rgba(37,94,145,0.55)",
        border: selected ? `4px solid ${PALETTE.yellow}` : "3px solid rgba(255,255,255,0.18)",
        opacity: e,
        transform: `scale(${e * pulse})`,
        boxShadow: selected ? `0 12px 34px ${PALETTE.yellow}44` : "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      <div style={{ width: 66, height: 78, borderRadius: 8, background: selected ? PALETTE.yellow : "rgba(255,255,255,0.55)" }} />
      {selected && (
        <div style={{ position: "absolute", top: -18, right: -18, width: 44, height: 44, borderRadius: "50%", background: PALETTE.yellow, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontWeight: W.extraBold, color: PALETTE.navy, fontSize: 26 }}>✓</div>
      )}
    </div>
  );
};

const SurveyPanel: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const e = enter({ frame, fps, delay: 26, duration: 20 });
  const rows = 4;
  return (
    <div style={{ opacity: e, transform: `translateX(${(1 - e) * 60}px)` }}>
      <div style={{ width: 300, borderRadius: 20, background: "rgba(255,255,255,0.96)", padding: "22px 22px", boxShadow: "0 20px 50px rgba(0,0,0,0.3)" }}>
        <div style={{ fontFamily: FONT, fontWeight: W.extraBold, fontSize: 26, color: PALETTE.navy, marginBottom: 16 }}>Survey</div>
        {new Array(rows).fill(0).map((_, i) => {
          const rp = interpolate(frame, [40 + i * 8, 52 + i * 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, opacity: rp, transform: `translateX(${(1 - rp) * 20}px)` }}>
              <div style={{ width: 26, height: 26, borderRadius: 7, background: i === 1 ? PALETTE.yellow : PALETTE.mediumBlue, display: "flex", alignItems: "center", justifyContent: "center", color: i === 1 ? PALETTE.navy : PALETTE.white, fontWeight: 800, fontSize: 16, fontFamily: FONT }}>✓</div>
              <div style={{ height: 16, flex: 1, borderRadius: 8, background: "rgba(8,48,107,0.14)" }} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const SceneVirtualShop: React.FC<{ life: number }> = ({ life }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const o = sceneFade(frame, life);
  const selectedIndex = 5; // which tile the respondent picks

  return (
    <AbsoluteFill style={{ opacity: o }}>
      <SceneKicker label="Virtual Shop Survey" local={frame} life={life} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "row", gap: 70, top: 10 }}>
        <ShopperIcon frame={frame} fps={fps} />
        {/* shelf */}
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${COLS}, 128px)`, gap: 18, padding: 22, borderRadius: 24, background: "rgba(8,24,54,0.35)", border: "1px solid rgba(255,255,255,0.08)" }}>
          {new Array(COLS * ROWS).fill(0).map((_, i) => (
            <Tile key={i} frame={frame} fps={fps} delay={6 + i * 3} selected={i === selectedIndex} />
          ))}
        </div>
        <SurveyPanel frame={frame} fps={fps} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
