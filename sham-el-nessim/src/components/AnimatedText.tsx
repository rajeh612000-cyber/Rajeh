import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";

type Props = {
  children: React.ReactNode;
  /** Frame at which the animation starts (local frame inside the Sequence) */
  delay?: number;
  /** How many frames the entrance animation takes */
  duration?: number;
  /** Pixels to travel on the Y-axis (positive = slide up from below) */
  slideDistance?: number;
  style?: React.CSSProperties;
};

/**
 * Reusable animated text block — fades in and slides from below.
 * All animation driven by useCurrentFrame(); no CSS transitions.
 */
export const AnimatedText: React.FC<Props> = ({
  children,
  delay = 0,
  duration = 25,
  slideDistance = 40,
  style,
}) => {
  const frame = useCurrentFrame();

  // Single eased progress [0 → 1]
  const progress = interpolate(frame, [delay, delay + duration], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1), // crisp ease-out (deceleration curve)
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const opacity = progress;
  const translateY = interpolate(progress, [0, 1], [slideDistance, 0]);

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
