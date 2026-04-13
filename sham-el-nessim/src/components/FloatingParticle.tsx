import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";

type Props = {
  /** Left position in pixels */
  x: number;
  /** Top position in pixels */
  y: number;
  size: number;
  color: string;
  /** Frame at which this particle appears */
  delay: number;
  /** How many frames to live */
  duration: number;
  /** How far up (in pixels) the particle floats */
  floatDistance?: number;
  /** 'circle' | 'diamond' — shape variant */
  shape?: "circle" | "diamond";
};

/**
 * Single animated particle — fades in, floats upward, fades out.
 * No CSS animations; fully driven by useCurrentFrame().
 */
export const FloatingParticle: React.FC<Props> = ({
  x,
  y,
  size,
  color,
  delay,
  duration,
  floatDistance = 50,
  shape = "circle",
}) => {
  const frame = useCurrentFrame();

  // Normalised lifetime [0 → 1]
  const progress = interpolate(frame, [delay, delay + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Fade in quickly, hold, fade out at end
  const opacity = interpolate(progress, [0, 0.08, 0.75, 1], [0, 0.9, 0.9, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Float upward with a sinusoidal ease
  const floatY = interpolate(progress, [0, 1], [0, -floatDistance], {
    easing: Easing.inOut(Easing.sin),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Pop in, hold full, shrink out
  const scale = interpolate(progress, [0, 0.08, 0.85, 1], [0, 1, 1, 0.4], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const diamondTransform =
    shape === "diamond"
      ? `translateY(${floatY}px) scale(${scale}) rotate(45deg)`
      : `translateY(${floatY}px) scale(${scale})`;

  return (
    <div
      style={{
        position: "absolute",
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        borderRadius: shape === "circle" ? "50%" : "4px",
        backgroundColor: color,
        opacity,
        transform: diamondTransform,
      }}
    />
  );
};
