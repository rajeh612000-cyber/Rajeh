import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import { PALETTE } from "../theme/palette";
import { FONT, W } from "../theme/fonts";
import { enter, sceneFade } from "../motion/springs";
import { SceneKicker } from "../components/SceneKicker";

const CX = 960;
const CY = 520;

const SourceCard: React.FC<{ x: number; title: string; frame: number; fps: number; delay: number; kind: "dots" | "bars" }> = ({ x, title, frame, fps, delay, kind }) => {
  const e = enter({ frame, fps, delay, duration: 20 });
  const side = x < CX ? -1 : 1;
  return (
    <div style={{ position: "absolute", left: x - 150, top: CY - 110, width: 300, opacity: e, transform: `translateX(${(1 - e) * side * -50}px)` }}>
      <div style={{ borderRadius: 20, background: "rgba(255,255,255,0.96)", padding: 22, boxShadow: "0 18px 44px rgba(0,0,0,0.3)" }}>
        <div style={{ fontFamily: FONT, fontWeight: W.extraBold, fontSize: 24, color: PALETTE.navy, marginBottom: 16 }}>{title}</div>
        {kind === "dots" ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10 }}>
            {new Array(18).fill(0).map((_, i) => {
              const dp = interpolate(frame, [delay + 8 + i, delay + 16 + i], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              return <div key={i} style={{ width: 22, height: 22, borderRadius: "50%", background: i % 5 === 0 ? PALETTE.red : PALETTE.mediumBlue, opacity: dp, transform: `scale(${dp})` }} />;
            })}
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 96 }}>
            {[40, 68, 52, 88, 62].map((h, i) => {
              const bp = interpolate(frame, [delay + 8 + i * 2, delay + 20 + i * 2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
              return <div key={i} style={{ width: 34, height: h * bp, borderRadius: 6, background: i === 3 ? PALETTE.yellow : PALETTE.mediumBlue }} />;
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const Pulse: React.FC<{ from: number; frame: number; fps: number; delay: number }> = ({ from, frame, fps, delay }) => {
  const cycle = 1.4;
  const local = ((frame - delay) / fps) % cycle;
  if (frame < delay) return null;
  const p = local / cycle;
  const x = interpolate(p, [0, 1], [from, CX]);
  const y = interpolate(p, [0, 0.5, 1], [CY, CY - 40 * Math.sign(CX - from), CY]);
  const fade = interpolate(p, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);
  return <circle cx={x} cy={y} r={9} fill={PALETTE.yellow} opacity={fade} />;
};

export const SceneMarketData: React.FC<{ life: number }> = ({ life }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const o = sceneFade(frame, life);

  const calibrated = interpolate(frame, [80, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const ringPulse = 1 + Math.sin((frame / fps) * 4) * 0.04;
  const draw = interpolate(frame, [18, 46], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ opacity: o }}>
      <SceneKicker label="Market Data Calibration" local={frame} life={life} />
      <AbsoluteFill>
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          {/* connectors */}
          <path d={`M510 ${CY} Q735 ${CY - 60} ${CX} ${CY}`} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={4} strokeDasharray="600" strokeDashoffset={600 * (1 - draw)} />
          <path d={`M1410 ${CY} Q1185 ${CY - 60} ${CX} ${CY}`} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={4} strokeDasharray="600" strokeDashoffset={600 * (1 - draw)} />
          <Pulse from={510} frame={frame} fps={fps} delay={46} />
          <Pulse from={1410} frame={frame} fps={fps} delay={52} />

          {/* calibration hub */}
          <g transform={`translate(${CX} ${CY}) scale(${ringPulse})`}>
            <circle r={92} fill="rgba(8,24,54,0.6)" stroke="rgba(255,255,255,0.25)" strokeWidth={3} />
            <circle r={64} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth={3} />
            <circle r={36} fill="none" stroke={calibrated > 0.5 ? PALETTE.yellow : "rgba(255,255,255,0.5)"} strokeWidth={5} />
            <line x1={-110} y1={0} x2={-96} y2={0} stroke="rgba(255,255,255,0.5)" strokeWidth={3} />
            <line x1={110} y1={0} x2={96} y2={0} stroke="rgba(255,255,255,0.5)" strokeWidth={3} />
            <line x1={0} y1={-110} x2={0} y2={-96} stroke="rgba(255,255,255,0.5)" strokeWidth={3} />
            <line x1={0} y1={110} x2={0} y2={96} stroke="rgba(255,255,255,0.5)" strokeWidth={3} />
            <circle r={12} fill={calibrated > 0.5 ? PALETTE.yellow : PALETTE.white} opacity={calibrated > 0.5 ? 1 : 0.6} />
          </g>
        </svg>
        {/* calibrated label */}
        <div style={{ position: "absolute", left: CX - 120, top: CY + 110, width: 240, textAlign: "center", opacity: calibrated, fontFamily: FONT, fontWeight: W.bold, fontSize: 28, color: PALETTE.yellow, letterSpacing: 2 }}>
          CALIBRATED
        </div>
        <SourceCard x={360} title="Survey" frame={frame} fps={fps} delay={6} kind="dots" />
        <SourceCard x={1560} title="Market Data" frame={frame} fps={fps} delay={12} kind="bars" />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
