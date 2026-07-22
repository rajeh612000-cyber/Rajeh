import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { PALETTE } from "../theme/palette";

// Deterministic pseudo-random (no Math.random — reproducible renders).
const rand = (i: number, salt = 1) => {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

type Shape = "dot" | "ring" | "tri" | "plus";

/** Ambient drifting shapes for constant background motion (never static). */
export const FloatingField: React.FC<{ count?: number; seed?: number; accent?: boolean }> = ({
  count = 16,
  seed = 3,
  accent = false,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;

  const shapes: Shape[] = ["dot", "ring", "tri", "plus"];
  const items = new Array(count).fill(0).map((_, i) => {
    const bx = rand(i + seed, 1) * width;
    const by = rand(i + seed, 2) * height;
    const size = 8 + rand(i + seed, 3) * 30;
    const speed = 0.15 + rand(i + seed, 4) * 0.5;
    const phase = rand(i + seed, 5) * Math.PI * 2;
    const dx = Math.sin(t * speed + phase) * 40;
    const dy = Math.cos(t * speed * 0.8 + phase) * 30;
    const rot = (t * speed * 20 + i * 40) % 360;
    const op = 0.05 + rand(i + seed, 6) * 0.10;
    const shape = shapes[Math.floor(rand(i + seed, 7) * shapes.length)];
    const redAccent = accent && rand(i + seed, 8) > 0.82;
    const color = redAccent ? PALETTE.red : rand(i + seed, 9) > 0.5 ? PALETTE.mediumBlue : PALETTE.white;
    return { bx, by, size, dx, dy, rot, op, shape, color, i };
  });

  return (
    <AbsoluteFill>
      {items.map((it) => {
        const common: React.CSSProperties = {
          position: "absolute",
          left: it.bx + it.dx,
          top: it.by + it.dy,
          opacity: it.op,
          transform: `rotate(${it.rot}deg)`,
        };
        if (it.shape === "dot")
          return <div key={it.i} style={{ ...common, width: it.size * 0.5, height: it.size * 0.5, borderRadius: "50%", background: it.color }} />;
        if (it.shape === "ring")
          return <div key={it.i} style={{ ...common, width: it.size, height: it.size, borderRadius: "50%", border: `2px solid ${it.color}` }} />;
        if (it.shape === "plus")
          return (
            <div key={it.i} style={{ ...common, width: it.size, height: it.size }}>
              <div style={{ position: "absolute", left: "45%", top: 0, width: "10%", height: "100%", background: it.color }} />
              <div style={{ position: "absolute", top: "45%", left: 0, height: "10%", width: "100%", background: it.color }} />
            </div>
          );
        // triangle
        return (
          <div
            key={it.i}
            style={{
              ...common,
              width: 0,
              height: 0,
              borderLeft: `${it.size * 0.5}px solid transparent`,
              borderRight: `${it.size * 0.5}px solid transparent`,
              borderBottom: `${it.size * 0.86}px solid ${it.color}`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
