import React from 'react';
import {noise2D} from '@remotion/noise';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {TEXTURE} from '../theme/tokens';

/**
 * Controlled handheld drift. Deterministic (seeded value noise), so a re-render
 * is frame-identical, and biased to settle after the scene's first beat —
 * documentary energy on the cut, stillness while you read.
 */
export const CameraShake: React.FC<{
  children: React.ReactNode;
  /** Scene-local intensity multiplier. 0 disables. */
  intensity?: number;
  seed?: string;
  /** Frames over which the shake decays to its resting level. */
  settle?: number;
}> = ({children, intensity = 1, seed = 'shake', settle = 14}) => {
  const frame = useCurrentFrame();

  if (intensity === 0) {
    return <AbsoluteFill>{children}</AbsoluteFill>;
  }

  const decay = interpolate(frame, [0, settle], [1, 0.32], {
    extrapolateRight: 'clamp',
  });
  const amp = TEXTURE.shake * intensity * decay;

  const x = noise2D(`${seed}-x`, frame / 9, 0) * amp;
  const y = noise2D(`${seed}-y`, frame / 11, 0) * amp;
  const rotate = noise2D(`${seed}-r`, frame / 17, 0) * 0.22 * intensity * decay;
  // Scale up slightly so the drift never exposes an edge.
  const scale = 1 + (TEXTURE.shake * intensity) / 500;

  return (
    <AbsoluteFill
      style={{
        transform: `translate3d(${x}px, ${y}px, 0) rotate(${rotate}deg) scale(${scale})`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
