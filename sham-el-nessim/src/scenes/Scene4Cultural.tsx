/**
 * Scene 4 — Cultural Words
 *
 * Visual:  Mid-blue (#255e91) background.  Five cultural keywords appear one
 *          by one in a staggered cascade (20-frame stagger each).  Each word
 *          is uppercase, white, with a yellow number prefix.  Decorative dots
 *          pulse subtly around the edges.
 *
 * Duration: 4 s (120 frames @ 30 fps)
 */

import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  useCurrentFrame,
} from "remotion";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { HorizontalRule } from "../components/HorizontalRule";
import { COLORS, TEXT } from "../constants";

const { fontFamily: playfair } = loadPlayfair("normal", {
  weights: ["700"],
  subsets: ["latin"],
});

const { fontFamily: inter } = loadInter("normal", {
  weights: ["600"],
  subsets: ["latin"],
});

/** Single cultural word row, slides in from left */
const CulturalWord: React.FC<{ index: number; word: string }> = ({
  index,
  word,
}) => {
  const frame = useCurrentFrame();
  const STAGGER = 18;
  const start = index * STAGGER;

  const progress = interpolate(frame, [start, start + 28], [0, 1], {
    easing: Easing.bezier(0.22, 1, 0.36, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const opacity = progress;
  const translateX = interpolate(progress, [0, 1], [-80, 0]);

  return (
    <div
      style={{
        opacity,
        transform: `translateX(${translateX}px)`,
        display: "flex",
        alignItems: "baseline",
        gap: 20,
        marginBottom: 8,
      }}
    >
      {/* Numeric prefix */}
      <span
        style={{
          fontFamily: inter,
          fontWeight: 600,
          fontSize: 22,
          color: COLORS.primaryYellow,
          minWidth: 36,
          letterSpacing: "0.06em",
        }}
      >
        {String(index + 1).padStart(2, "0")}
      </span>

      {/* Yellow dash */}
      <span
        style={{
          display: "block",
          width: 32,
          height: 3,
          backgroundColor: COLORS.primaryYellow,
          alignSelf: "center",
          borderRadius: 2,
          flexShrink: 0,
        }}
      />

      {/* Word */}
      <span
        style={{
          fontFamily: playfair,
          fontWeight: 700,
          fontSize: 72,
          lineHeight: 1.1,
          color: COLORS.white,
          letterSpacing: "0.02em",
        }}
      >
        {word}
      </span>
    </div>
  );
};

/** Corner decorative dots */
const CornerDots: React.FC<{
  top: number;
  left: number;
  columns: number;
  rows: number;
}> = ({ top, left, columns, rows }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30], [0, 0.4], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const dots: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      dots.push(
        <div
          key={`${r}-${c}`}
          style={{
            position: "absolute",
            top: top + r * 20,
            left: left + c * 20,
            width: 4,
            height: 4,
            borderRadius: "50%",
            backgroundColor: COLORS.primaryYellow,
            opacity,
          }}
        />
      );
    }
  }
  return <>{dots}</>;
};

export const Scene4Cultural: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.midBlue,
        justifyContent: "center",
        paddingLeft: 100,
        paddingRight: 60,
        overflow: "hidden",
      }}
    >
      {/* Corner dot patterns */}
      <CornerDots top={60} left={60} columns={5} rows={5} />
      <CornerDots top={860} left={820} columns={5} rows={5} />

      {/* Top accent line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 8,
          backgroundColor: COLORS.primaryYellow,
        }}
      />

      {/* Section label */}
      <div
        style={{
          position: "absolute",
          top: 68,
          left: 100,
        }}
      >
        <HorizontalRule
          color={COLORS.primaryYellow}
          delay={5}
          duration={20}
          thickness={3}
          style={{ width: 60, marginBottom: 12 }}
        />
        <div
          style={{
            fontFamily: inter,
            fontWeight: 600,
            fontSize: 18,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: COLORS.lightBlue,
          }}
        >
          The Spirit of
        </div>
      </div>

      {/* Cultural words stack */}
      <div style={{ marginTop: 40 }}>
        {TEXT.culturalWords.map((word, i) => (
          <CulturalWord key={word} index={i} word={word} />
        ))}
      </div>
    </AbsoluteFill>
  );
};
