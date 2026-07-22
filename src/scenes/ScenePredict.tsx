import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import { PALETTE } from "../theme/palette";
import { FONT, W } from "../theme/fonts";
import { enter, sceneFade } from "../motion/springs";
import { SceneKicker } from "../components/SceneKicker";

const ROOT = { x: 470, y: 520 };
const L1 = [
  { x: 820, y: 380 },
  { x: 820, y: 660 },
];
const LEAVES = [
  { x: 1210, y: 300, v: "+12%", best: true },
  { x: 1210, y: 452, v: "+4%", best: false },
  { x: 1210, y: 588, v: "-3%", best: false },
  { x: 1210, y: 740, v: "+7%", best: false },
];

const DecisionTree: React.FC<{ frame: number; fps: number; vis: number }> = ({ frame, fps, vis }) => {
  const draw1 = interpolate(frame, [10, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const draw2 = interpolate(frame, [28, 54], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const bestGlow = interpolate(frame, [66, 84], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });

  const line = (a: { x: number; y: number }, b: { x: number; y: number }, prog: number, best: boolean) => {
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    return (
      <path
        d={`M${a.x} ${a.y} C ${(a.x + b.x) / 2} ${a.y}, ${(a.x + b.x) / 2} ${b.y}, ${b.x} ${b.y}`}
        fill="none"
        stroke={best && bestGlow > 0.5 ? PALETTE.yellow : "rgba(255,255,255,0.4)"}
        strokeWidth={best && bestGlow > 0.5 ? 6 : 4}
        strokeDasharray={len}
        strokeDashoffset={len * (1 - prog)}
      />
    );
  };

  return (
    <div style={{ opacity: vis }}>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {line(ROOT, L1[0], draw1, true)}
        {line(ROOT, L1[1], draw1, false)}
        {line(L1[0], LEAVES[0], draw2, true)}
        {line(L1[0], LEAVES[1], draw2, false)}
        {line(L1[1], LEAVES[2], draw2, false)}
        {line(L1[1], LEAVES[3], draw2, false)}
      </svg>
      {/* root */}
      <Node x={ROOT.x} y={ROOT.y} frame={frame} fps={fps} delay={4} label="What-if" big />
      {L1.map((n, i) => (
        <Node key={i} x={n.x} y={n.y} frame={frame} fps={fps} delay={22 + i * 4} label={i === 0 ? "Scenario A" : "Scenario B"} />
      ))}
      {LEAVES.map((n, i) => (
        <Leaf key={i} x={n.x} y={n.y} frame={frame} fps={fps} delay={48 + i * 4} v={n.v} best={n.best} glow={bestGlow} />
      ))}
    </div>
  );
};

const Node: React.FC<{ x: number; y: number; frame: number; fps: number; delay: number; label: string; big?: boolean }> = ({ x, y, frame, fps, delay, label, big }) => {
  const e = enter({ frame, fps, delay, duration: 16 });
  const w = big ? 190 : 170;
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y - 34, width: w, height: 68, borderRadius: 14, background: big ? PALETTE.mediumBlue : "rgba(255,255,255,0.95)", color: big ? PALETTE.white : PALETTE.navy, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontWeight: W.bold, fontSize: 24, opacity: e, transform: `scale(${e})`, boxShadow: "0 10px 24px rgba(0,0,0,0.22)" }}>
      {label}
    </div>
  );
};

const Leaf: React.FC<{ x: number; y: number; frame: number; fps: number; delay: number; v: string; best: boolean; glow: number }> = ({ x, y, frame, fps, delay, v, best, glow }) => {
  const e = enter({ frame, fps, delay, duration: 16 });
  const on = best && glow > 0.5;
  return (
    <div style={{ position: "absolute", left: x - 80, top: y - 40, width: 160, height: 80, borderRadius: 14, background: on ? PALETTE.yellow : "rgba(255,255,255,0.95)", color: PALETTE.navy, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: FONT, fontWeight: W.extraBold, fontSize: 30, opacity: e, transform: `scale(${e * (on ? 1.06 : 1)})`, boxShadow: on ? `0 14px 40px ${PALETTE.yellow}66` : "0 10px 24px rgba(0,0,0,0.22)" }}>
      {on && <span style={{ fontSize: 26 }}>★</span>}
      {v}
    </div>
  );
};

const PortfolioGrid: React.FC<{ frame: number; fps: number; vis: number }> = ({ frame, fps, vis }) => {
  const cells = new Array(15).fill(0);
  const winners = new Set([2, 6, 11]);
  return (
    <div style={{ opacity: vis, position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", top: -170 }}>
      <div style={{ fontFamily: FONT, fontWeight: W.bold, fontSize: 30, letterSpacing: 4, color: PALETTE.white, marginBottom: 24, textTransform: "uppercase", opacity: 0.9 }}>
        Portfolio · Brands &amp; SKUs
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 116px)", gap: 18 }}>
        {cells.map((_, i) => {
          const e = enter({ frame, fps, delay: 4 + i * 2.2, duration: 16 });
          const win = winners.has(i);
          return (
            <div key={i} style={{ width: 116, height: 116, borderRadius: 15, background: win ? PALETTE.yellow : "rgba(37,94,145,0.6)", border: win ? `3px solid ${PALETTE.yellow}` : "3px solid rgba(255,255,255,0.18)", opacity: e, transform: `scale(${e})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: win ? `0 12px 30px ${PALETTE.yellow}44` : "none" }}>
              <div style={{ width: 54, height: 66, borderRadius: 8, background: win ? PALETTE.navy : "rgba(255,255,255,0.5)" }} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const ScenePredict: React.FC<{ life: number }> = ({ life }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const o = sceneFade(frame, life);

  // Phase A (tree) -> Phase B (portfolio) crossfade around local frame ~270 (9s)
  const split = 270;
  const treeVis = interpolate(frame, [split - 24, split], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const gridVis = interpolate(frame, [split - 6, split + 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ opacity: o }}>
      {treeVis > 0.01 && <SceneKicker label="Predictive Strategy" local={frame} life={life} />}
      <AbsoluteFill>
        {treeVis > 0.01 && <DecisionTree frame={frame} fps={fps} vis={treeVis} />}
        {gridVis > 0.01 && <PortfolioGrid frame={frame - split + 20} fps={fps} vis={gridVis} />}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
