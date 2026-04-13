/**
 * Scene 2 — Nature / Spring
 *
 * Visual:  Light-blue sky-like background with a soft gradient.
 *          24 floating particles (circles + diamonds) in brand colors drift
 *          upward at different speeds and stagger.  "Spring is here" slides
 *          in from below after the particles establish.
 *
 * Duration: 4 s (120 frames @ 30 fps)
 */

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { FloatingParticle } from "../components/FloatingParticle";
import { AnimatedText } from "../components/AnimatedText";
import { HorizontalRule } from "../components/HorizontalRule";
import { COLORS, TEXT, COMP_WIDTH, COMP_HEIGHT } from "../constants";

const { fontFamily: playfair } = loadPlayfair("normal", {
  weights: ["700"],
  subsets: ["latin"],
});

const { fontFamily: inter } = loadInter("normal", {
  weights: ["400"],
  subsets: ["latin"],
});

/**
 * Deterministic particle seed — avoids Math.random() which would produce
 * different values on each frame render.
 */
const PARTICLES: {
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
  floatDistance: number;
  shape: "circle" | "diamond";
}[] = [
  { x: 80,  y: 820, size: 18, color: COLORS.primaryYellow, delay: 0,  duration: 100, floatDistance: 160, shape: "circle" },
  { x: 200, y: 900, size: 12, color: COLORS.white,         delay: 5,  duration: 95,  floatDistance: 200, shape: "circle" },
  { x: 340, y: 850, size: 22, color: COLORS.softRed,       delay: 8,  duration: 90,  floatDistance: 140, shape: "diamond" },
  { x: 460, y: 880, size: 10, color: COLORS.primaryYellow, delay: 3,  duration: 105, floatDistance: 180, shape: "circle" },
  { x: 600, y: 860, size: 16, color: COLORS.white,         delay: 12, duration: 100, floatDistance: 150, shape: "circle" },
  { x: 720, y: 920, size: 14, color: COLORS.lightBlue,     delay: 6,  duration: 90,  floatDistance: 170, shape: "diamond" },
  { x: 850, y: 870, size: 20, color: COLORS.primaryYellow, delay: 2,  duration: 108, floatDistance: 160, shape: "circle" },
  { x: 970, y: 810, size: 11, color: COLORS.softRed,       delay: 10, duration: 95,  floatDistance: 190, shape: "circle" },
  { x: 130, y: 700, size: 8,  color: COLORS.white,         delay: 15, duration: 85,  floatDistance: 120, shape: "circle" },
  { x: 300, y: 750, size: 15, color: COLORS.primaryYellow, delay: 4,  duration: 100, floatDistance: 135, shape: "diamond" },
  { x: 540, y: 780, size: 9,  color: COLORS.softRed,       delay: 18, duration: 80,  floatDistance: 110, shape: "circle" },
  { x: 780, y: 740, size: 13, color: COLORS.white,         delay: 7,  duration: 95,  floatDistance: 145, shape: "circle" },
  { x: 920, y: 720, size: 19, color: COLORS.primaryYellow, delay: 11, duration: 88,  floatDistance: 165, shape: "diamond" },
  { x: 50,  y: 600, size: 7,  color: COLORS.lightBlue,     delay: 20, duration: 75,  floatDistance: 100, shape: "circle" },
  { x: 420, y: 650, size: 14, color: COLORS.softRed,       delay: 9,  duration: 92,  floatDistance: 130, shape: "circle" },
  { x: 660, y: 620, size: 10, color: COLORS.white,         delay: 14, duration: 87,  floatDistance: 115, shape: "diamond" },
  { x: 170, y: 550, size: 16, color: COLORS.primaryYellow, delay: 16, duration: 80,  floatDistance: 125, shape: "circle" },
  { x: 490, y: 520, size: 8,  color: COLORS.softRed,       delay: 22, duration: 70,  floatDistance: 105, shape: "circle" },
  { x: 840, y: 560, size: 12, color: COLORS.lightBlue,     delay: 13, duration: 85,  floatDistance: 118, shape: "diamond" },
  { x: 1000,y: 580, size: 17, color: COLORS.primaryYellow, delay: 17, duration: 78,  floatDistance: 140, shape: "circle" },
  { x: 260, y: 480, size: 9,  color: COLORS.white,         delay: 25, duration: 65,  floatDistance: 95,  shape: "circle" },
  { x: 610, y: 460, size: 13, color: COLORS.softRed,       delay: 19, duration: 75,  floatDistance: 108, shape: "diamond" },
  { x: 760, y: 440, size: 7,  color: COLORS.primaryYellow, delay: 28, duration: 60,  floatDistance: 90,  shape: "circle" },
  { x: 380, y: 400, size: 11, color: COLORS.white,         delay: 23, duration: 70,  floatDistance: 112, shape: "circle" },
];

/** Gradient sky background */
const SkyBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `linear-gradient(180deg, ${COLORS.lightBlue} 0%, #c9eaf8 60%, ${COLORS.white} 100%)`,
        opacity,
      }}
    />
  );
};

export const Scene2Nature: React.FC = () => {
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <SkyBackground />

      {/* Floating particles — the nature/spring element field */}
      {PARTICLES.map((p, i) => (
        <FloatingParticle key={i} {...p} />
      ))}

      {/* Text overlay — positioned in upper third */}
      <div
        style={{
          position: "absolute",
          top: 120,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0,
        }}
      >
        <HorizontalRule
          color={COLORS.midBlue}
          delay={15}
          duration={25}
          thickness={3}
          style={{ width: 80, marginBottom: 28 }}
        />
        <AnimatedText delay={20} duration={28} slideDistance={40}>
          <div
            style={{
              fontFamily: playfair,
              fontWeight: 700,
              fontSize: 88,
              color: COLORS.darkBlue,
              textAlign: "center",
              lineHeight: 1.05,
            }}
          >
            {TEXT.natureHeadline}
          </div>
        </AnimatedText>
        <AnimatedText delay={38} duration={22} slideDistance={30}>
          <div
            style={{
              fontFamily: inter,
              fontWeight: 400,
              fontSize: 28,
              color: COLORS.midBlue,
              letterSpacing: "0.06em",
              marginTop: 16,
              textAlign: "center",
            }}
          >
            {TEXT.natureSub}
          </div>
        </AnimatedText>
      </div>
    </AbsoluteFill>
  );
};
