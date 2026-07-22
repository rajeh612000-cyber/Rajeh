import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { PALETTE } from "../theme/palette";
import { FONT, W } from "../theme/fonts";
import type { Chunk } from "../types";

const FS = 48; // caption font size (sized so 6-word chunks stay one line)

const Line: React.FC<{ chunk: Chunk; fps: number; frame: number }> = ({ chunk, fps, frame }) => {
  const t = frame / fps;
  const inP = interpolate(t, [chunk.start - 0.02, chunk.start + 0.2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  // fade out quickly right around the end so consecutive captions don't stack
  const outP = interpolate(t, [chunk.end - 0.05, chunk.end + 0.1], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });
  const vis = Math.min(inP, outP);
  if (vis <= 0.001) return null;

  // enter from below, exit upward → the brief overlap reads as motion, not clutter
  const rise = (1 - inP) * 30 - (1 - outP) * 40;
  const words = chunk.text.split(" ");

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        bottom: 132,
        transform: `translate(-50%, ${rise}px)`,
        opacity: vis,
        display: "flex",
        flexWrap: "nowrap",
        whiteSpace: "nowrap",
        justifyContent: "center",
        alignItems: "baseline",
        gap: "0 14px",
        padding: "20px 44px",
        borderRadius: 20,
        background: "rgba(6,18,42,0.44)",
        boxShadow: "0 20px 60px rgba(3,10,26,0.35)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {words.map((wtext, i) => {
        const wd = chunk.words[i];
        const ws = wd ? wd.start : chunk.start;
        const spoken = interpolate(t, [ws - 0.06, ws + 0.14], [0.34, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const wy = interpolate(t, [ws - 0.06, ws + 0.14], [9, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.cubic),
        });
        const isHi = chunk.highlight.includes(i);
        return (
          <span
            key={i}
            style={{
              fontFamily: FONT,
              fontWeight: isHi ? W.extraBold : W.bold,
              fontSize: FS,
              lineHeight: 1.1,
              color: isHi ? PALETTE.yellow : PALETTE.white,
              opacity: spoken,
              transform: `translateY(${wy}px)`,
              display: "inline-block",
              textShadow: isHi ? "0 2px 18px rgba(251,194,16,0.35)" : "0 2px 14px rgba(0,0,0,0.45)",
              letterSpacing: -0.3,
            }}
          >
            {wtext}
          </span>
        );
      })}
    </div>
  );
};

export const Captions: React.FC<{ chunks: Chunk[] }> = ({ chunks }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  return (
    <AbsoluteFill>
      {chunks
        .filter((c) => t >= c.start - 0.08 && t <= c.end + 0.14)
        .map((c) => (
          <Line key={c.index} chunk={c} fps={fps} frame={frame} />
        ))}
    </AbsoluteFill>
  );
};
