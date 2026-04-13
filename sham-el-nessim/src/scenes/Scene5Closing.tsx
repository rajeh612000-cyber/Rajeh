/**
 * Scene 5 — Closing / Outro
 *
 * Visual:  Dark-blue background.  A yellow vertical stripe appears on the left.
 *          Three lines of text cascade in: closing message in white, two accent
 *          lines in yellow, then the social-media hashtag fades in last.
 *          Floating particles in the background echo Scene 2.
 *          Ends with a final full-bleed golden glow pulse.
 *
 * Duration: 5 s (150 frames @ 30 fps)
 */

import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { AnimatedText } from "../components/AnimatedText";
import { FloatingParticle } from "../components/FloatingParticle";
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

/** Yellow left stripe that scales up from the bottom */
const YellowStripe: React.FC = () => {
  const frame = useCurrentFrame();
  const scaleY = interpolate(frame, [0, 35], [0, 1], {
    easing: Easing.bezier(0.22, 1, 0.36, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 14,
        height: "100%",
        backgroundColor: COLORS.primaryYellow,
        transformOrigin: "left bottom",
        transform: `scaleY(${scaleY})`,
      }}
    />
  );
};

/** End-of-video golden shimmer — a radial pulse that fades in late */
const GoldenPulse: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [110, 140], [0, 0.18], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(ellipse 80% 70% at 50% 50%, ${COLORS.primaryYellow}, transparent)`,
        opacity,
        pointerEvents: "none",
      }}
    />
  );
};

const CLOSING_PARTICLES: {
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
  floatDistance: number;
  shape: "circle" | "diamond";
}[] = [
  { x: 60,   y: 900, size: 12, color: COLORS.primaryYellow, delay: 5,  duration: 120, floatDistance: 130, shape: "circle" },
  { x: 200,  y: 950, size: 8,  color: COLORS.white,         delay: 15, duration: 100, floatDistance: 150, shape: "circle" },
  { x: 950,  y: 880, size: 14, color: COLORS.primaryYellow, delay: 8,  duration: 110, floatDistance: 140, shape: "diamond" },
  { x: 1020, y: 940, size: 9,  color: COLORS.lightBlue,     delay: 20, duration: 95,  floatDistance: 120, shape: "circle" },
  { x: 820,  y: 820, size: 11, color: COLORS.white,         delay: 10, duration: 105, floatDistance: 115, shape: "circle" },
  { x: 120,  y: 780, size: 7,  color: COLORS.softRed,       delay: 25, duration: 85,  floatDistance: 100, shape: "diamond" },
  { x: 500,  y: 960, size: 16, color: COLORS.primaryYellow, delay: 3,  duration: 115, floatDistance: 160, shape: "circle" },
  { x: 700,  y: 910, size: 10, color: COLORS.lightBlue,     delay: 18, duration: 92,  floatDistance: 125, shape: "circle" },
];

export const Scene5Closing: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.darkBlue,
        overflow: "hidden",
      }}
    >
      {/* Subtle dot-grid background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `radial-gradient(${COLORS.midBlue}44 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      {/* Floating particles */}
      {CLOSING_PARTICLES.map((p, i) => (
        <FloatingParticle key={i} {...p} />
      ))}

      {/* Left yellow accent stripe */}
      <YellowStripe />

      {/* Central content block */}
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          paddingInline: 90,
          gap: 0,
        }}
      >
        {/* Top rule */}
        <HorizontalRule
          color={COLORS.primaryYellow}
          delay={12}
          duration={25}
          thickness={3}
          style={{ width: 80, marginBottom: 36 }}
        />

        {/* "May this season bring you" */}
        <AnimatedText delay={20} duration={28} slideDistance={40}>
          <div
            style={{
              fontFamily: inter,
              fontWeight: 400,
              fontSize: 34,
              color: COLORS.lightGray,
              letterSpacing: "0.06em",
              textAlign: "center",
            }}
          >
            {TEXT.closingLine1}
          </div>
        </AnimatedText>

        {/* "peace, joy &" — white, Playfair Display */}
        <AnimatedText delay={36} duration={30} slideDistance={50}>
          <div
            style={{
              fontFamily: playfair,
              fontWeight: 700,
              fontSize: 108,
              lineHeight: 1.0,
              color: COLORS.white,
              textAlign: "center",
            }}
          >
            {TEXT.closingLine2}
          </div>
        </AnimatedText>

        {/* "new beginnings" — yellow, Playfair Display */}
        <AnimatedText delay={50} duration={32} slideDistance={55}>
          <div
            style={{
              fontFamily: playfair,
              fontWeight: 700,
              fontSize: 108,
              lineHeight: 1.0,
              color: COLORS.primaryYellow,
              textAlign: "center",
            }}
          >
            {TEXT.closingLine3}
          </div>
        </AnimatedText>

        {/* Bottom rule */}
        <HorizontalRule
          color={COLORS.primaryYellow}
          delay={70}
          duration={20}
          thickness={2}
          style={{ width: 60, marginTop: 36 }}
        />

        {/* Hashtag */}
        <AnimatedText delay={80} duration={22} slideDistance={20}>
          <div
            style={{
              fontFamily: inter,
              fontWeight: 600,
              fontSize: 24,
              letterSpacing: "0.18em",
              color: COLORS.primaryYellow,
              marginTop: 16,
              textTransform: "uppercase",
            }}
          >
            {TEXT.closingTag}
          </div>
        </AnimatedText>
      </div>

      {/* Late golden pulse */}
      <GoldenPulse />

      {/* Bottom accent bar */}
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
