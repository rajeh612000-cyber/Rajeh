/**
 * Scene 1 — Opening
 *
 * Visual:  Deep dark-blue background with a radial glow at center.
 *          A golden horizontal rule grows from left, then the tagline and
 *          highlight text slide up in sequence. A subtle dot grid fills the
 *          background for texture.
 *
 * Duration: 5 s (150 frames @ 30 fps)
 */

import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { AnimatedText } from "../components/AnimatedText";
import { HorizontalRule } from "../components/HorizontalRule";
import { COLORS, TEXT } from "../constants";

const { fontFamily: playfair } = loadPlayfair("normal", {
  weights: ["700"],
  subsets: ["latin"],
});

const { fontFamily: inter } = loadInter("normal", {
  weights: ["400", "600"],
  subsets: ["latin"],
});

/** Dot-grid background texture */
const DotGrid: React.FC = () => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      backgroundImage: `radial-gradient(${COLORS.midBlue}55 1px, transparent 1px)`,
      backgroundSize: "48px 48px",
    }}
  />
);

/** Radial center glow */
const CenterGlow: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30], [0, 0.35], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(ellipse 70% 60% at 50% 55%, ${COLORS.midBlue}, transparent)`,
        opacity,
      }}
    />
  );
};

export const Scene1Opening: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.darkBlue,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      {/* Texture layers */}
      <DotGrid />
      <CenterGlow />

      {/* Top golden accent bar */}
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

      {/* Main content */}
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0,
          paddingInline: 80,
          width: "100%",
        }}
      >
        {/* Animated growing rule — appears first */}
        <HorizontalRule
          color={COLORS.primaryYellow}
          delay={10}
          duration={30}
          thickness={4}
          style={{ width: 120, marginBottom: 36 }}
        />

        {/* "A Season of" — first text in */}
        <AnimatedText delay={20} duration={30} slideDistance={50}>
          <div
            style={{
              fontFamily: inter,
              fontWeight: 600,
              fontSize: 32,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: COLORS.lightBlue,
            }}
          >
            {TEXT.openingTagline}
          </div>
        </AnimatedText>

        {/* "Joy & Renewal" — big display word, delayed */}
        <AnimatedText delay={35} duration={35} slideDistance={60}>
          <div
            style={{
              fontFamily: playfair,
              fontWeight: 700,
              fontSize: 112,
              lineHeight: 1.0,
              color: COLORS.white,
              textAlign: "center",
            }}
          >
            {TEXT.openingHighlight}
          </div>
        </AnimatedText>

        {/* Divider after headline */}
        <HorizontalRule
          color={COLORS.primaryYellow}
          delay={60}
          duration={25}
          thickness={2}
          style={{ width: 80, marginTop: 32 }}
        />

        {/* Sham El-Nessim label */}
        <AnimatedText delay={70} duration={25} slideDistance={30}>
          <div
            style={{
              fontFamily: inter,
              fontWeight: 400,
              fontSize: 26,
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              color: COLORS.primaryYellow,
              marginTop: 20,
            }}
          >
            Sham El-Nessim
          </div>
        </AnimatedText>
      </div>

      {/* Bottom golden bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 8,
          backgroundColor: COLORS.primaryYellow,
        }}
      />
    </AbsoluteFill>
  );
};
