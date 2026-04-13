import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";

type Props = {
  color: string;
  delay?: number;
  duration?: number;
  thickness?: number;
  style?: React.CSSProperties;
};

/**
 * Animated horizontal rule that grows from left to right.
 */
export const HorizontalRule: React.FC<Props> = ({
  color,
  delay = 0,
  duration = 30,
  thickness = 3,
  style,
}) => {
  const frame = useCurrentFrame();

  const scaleX = interpolate(frame, [delay, delay + duration], [0, 1], {
    easing: Easing.bezier(0.22, 1, 0.36, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        height: thickness,
        backgroundColor: color,
        transformOrigin: "left center",
        transform: `scaleX(${scaleX})`,
        borderRadius: thickness / 2,
        ...style,
      }}
    />
  );
};
