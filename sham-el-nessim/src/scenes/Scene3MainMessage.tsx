/**
 * Scene 3 — Main Message (Hero)
 *
 * Visual:  White background.  A large yellow block slides in from the left as
 *          the "stage", then "Happy" (dark blue) and "Sham El-Nessim" (red)
 *          appear in sequence with scale + fade.  The Arabic greeting fades in
 *          last.  A small yellow accent strip at the bottom anchors the layout.
 *
 * Duration: 5 s (150 frames @ 30 fps)
 */

import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
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
  subsets: ["latin", "arabic"],
});

/**
 * Yellow accent panel that slides in from the left and covers ~40% of the
 * canvas width.  Acts as a decorative color block behind the Arabic text.
 */
const YellowPanel: React.FC = () => {
  const frame = useCurrentFrame();

  const scaleX = interpolate(frame, [0, 30], [0, 1], {
    easing: Easing.bezier(0.22, 1, 0.36, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        bottom: 0,
        width: "44%",
        height: "36%",
        backgroundColor: COLORS.primaryYellow,
        transformOrigin: "left bottom",
        transform: `scaleX(${scaleX})`,
      }}
    />
  );
};

/** Scale-in entrance for a single element */
const ScaleIn: React.FC<{
  delay: number;
  duration: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ delay, duration, children, style }) => {
  const frame = useCurrentFrame();

  const progress = interpolate(frame, [delay, delay + duration], [0, 1], {
    easing: Easing.bezier(0.34, 1.56, 0.64, 1), // playful overshoot
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity: interpolate(progress, [0, 0.4], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        transform: `scale(${interpolate(progress, [0, 1], [0.7, 1])})`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const Scene3MainMessage: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.white, overflow: "hidden" }}>
      {/* Decorative yellow panel — bottom-left quarter */}
      <YellowPanel />

      {/* Dark-blue right strip */}
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          width: 12,
          height: "100%",
          backgroundColor: COLORS.darkBlue,
        }}
      />

      {/* Main centred content */}
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          gap: 0,
          paddingInline: 60,
        }}
      >
        {/* "Happy" — large display, dark blue */}
        <ScaleIn delay={10} duration={30}>
          <div
            style={{
              fontFamily: playfair,
              fontWeight: 700,
              fontSize: 140,
              lineHeight: 1.0,
              color: COLORS.darkBlue,
              textAlign: "center",
            }}
          >
            {TEXT.greetingLine1}
          </div>
        </ScaleIn>

        {/* Yellow rule between lines */}
        <HorizontalRule
          color={COLORS.primaryYellow}
          delay={28}
          duration={20}
          thickness={6}
          style={{ width: 340, marginBlock: 12 }}
        />

        {/* "Sham El-Nessim" — red, slides up */}
        <AnimatedText delay={32} duration={32} slideDistance={55}>
          <div
            style={{
              fontFamily: playfair,
              fontWeight: 700,
              fontSize: 96,
              lineHeight: 1.05,
              color: COLORS.red,
              textAlign: "center",
            }}
          >
            {TEXT.greetingLine2}
          </div>
        </AnimatedText>

        {/* Arabic greeting — inter, mid-blue, fades last */}
        <AnimatedText delay={58} duration={28} slideDistance={30}>
          <div
            style={{
              fontFamily: inter,
              fontWeight: 600,
              fontSize: 42,
              color: COLORS.midBlue,
              marginTop: 28,
              letterSpacing: "0.04em",
              direction: "rtl",
            }}
          >
            {TEXT.arabicGreeting}
          </div>
        </AnimatedText>
      </div>

      {/* Bottom accent strip */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 10,
          background: `linear-gradient(90deg, ${COLORS.primaryYellow} 0%, ${COLORS.red} 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};
