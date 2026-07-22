import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import { PALETTE } from "../theme/palette";
import { FONT, W } from "../theme/fonts";
import { enter, sceneFade, drift } from "../motion/springs";
import { SceneKicker } from "../components/SceneKicker";
import { SmartShopperMark } from "../components/logo/SmartShopperMark";

const CX = 860;
const CY = 520;

const inputs = [
  { x: 300, y: 360, label: "Price" },
  { x: 250, y: 500, label: "Pack" },
  { x: 300, y: 640, label: "Demand" },
];

export const SceneSimulator: React.FC<{ life: number }> = ({ life }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const o = sceneFade(frame, life);

  const draw = interpolate(frame, [14, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const power = interpolate(frame, [42, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const chipE = enter({ frame, fps, delay: 6, duration: 22 });
  const bob = drift(frame, fps, 5, 3);

  // output prediction wave
  const wavePts = new Array(40).fill(0).map((_, i) => {
    const px = i / 39;
    const reveal = interpolate(frame, [60, 96], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (px > reveal) return null;
    const y = 40 - Math.sin(px * Math.PI * 2.4) * 26 * px - px * 10;
    return `${px * 240},${y}`;
  }).filter(Boolean).join(" ");

  return (
    <AbsoluteFill style={{ opacity: o }}>
      <SceneKicker label="Smart Shopper Simulator" local={frame} life={life} />
      <AbsoluteFill>
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          {inputs.map((n, i) => {
            const off = 500 * (1 - draw);
            return <path key={i} d={`M${n.x} ${n.y} C ${(n.x + CX) / 2} ${n.y}, ${(n.x + CX) / 2} ${CY}, ${CX - 90} ${CY}`} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={3} strokeDasharray="520" strokeDashoffset={off} />;
          })}
          {/* pulses into chip */}
          {inputs.map((n, i) => {
            const cyc = 1.3;
            const local = ((frame - 40 - i * 6) / fps) % cyc;
            if (frame < 40 + i * 6) return null;
            const p = Math.max(0, local / cyc);
            const x = interpolate(p, [0, 1], [n.x, CX - 90]);
            const y = interpolate(p, [0, 1], [n.y, CY]);
            const f = interpolate(p, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);
            return <circle key={i} cx={x} cy={y} r={8} fill={PALETTE.yellow} opacity={f} />;
          })}
          {/* output line */}
          <path d={`M${CX + 90} ${CY} L1480 ${CY}`} stroke="rgba(255,255,255,0.3)" strokeWidth={3} strokeDasharray="530" strokeDashoffset={530 * (1 - interpolate(frame, [50, 74], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }))} />
        </svg>

        {/* input nodes */}
        {inputs.map((n, i) => {
          const e = enter({ frame, fps, delay: 8 + i * 4, duration: 18 });
          return (
            <div key={i} style={{ position: "absolute", left: n.x - 70, top: n.y - 34, width: 140, height: 68, borderRadius: 14, background: "rgba(255,255,255,0.95)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontWeight: W.bold, fontSize: 24, color: PALETTE.navy, opacity: e, transform: `scale(${e})`, boxShadow: "0 10px 26px rgba(0,0,0,0.25)" }}>
              {n.label}
            </div>
          );
        })}

        {/* central simulator chip */}
        <div style={{ position: "absolute", left: CX - 130, top: CY - 130 + bob, width: 260, height: 260, opacity: chipE, transform: `scale(${chipE})` }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: 40, background: "rgba(8,24,54,0.75)", border: `4px solid ${power > 0.4 ? PALETTE.yellow : "rgba(255,255,255,0.3)"}`, boxShadow: power > 0.4 ? `0 0 60px ${PALETTE.yellow}55` : "none", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <SmartShopperMark size={120} variant="reversed" />
            <div style={{ fontFamily: FONT, fontWeight: W.extraBold, fontSize: 22, color: PALETTE.white, letterSpacing: 3 }}>SIMULATOR</div>
          </div>
        </div>

        {/* output prediction card */}
        <div style={{ position: "absolute", left: 1480, top: CY - 80, width: 300, height: 160, borderRadius: 18, background: "rgba(255,255,255,0.96)", padding: 20, opacity: power, boxShadow: "0 18px 44px rgba(0,0,0,0.3)" }}>
          <div style={{ fontFamily: FONT, fontWeight: W.bold, fontSize: 22, color: PALETTE.navy, marginBottom: 8 }}>Prediction</div>
          <svg width="240" height="90" viewBox="0 0 240 90">
            <polyline points={wavePts} fill="none" stroke={PALETTE.red} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
