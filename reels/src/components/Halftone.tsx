import React from 'react';
import {AbsoluteFill} from 'remotion';
import {TEXTURE} from '../theme/tokens';
import halftoneTile from '../theme/textures/halftone.png';

/** CSS px the baked dot cell is displayed at. Smaller = finer screen. */
const PITCH = 12;

/**
 * Print-style dot screen laid over photography.
 *
 * The plate is baked by `npm run textures` and inlined into the bundle —
 * the equivalent CSS (two offset repeating radial-gradients) has to rasterise
 * ~57,000 gradient tiles per frame and takes the render tab down mid-render.
 */
export const Halftone: React.FC<{
  opacity?: number;
  /** Dot pitch in px. */
  pitch?: number;
}> = ({opacity = TEXTURE.halftone, pitch = PITCH}) => (
  <AbsoluteFill
    style={{
      pointerEvents: 'none',
      opacity,
      mixBlendMode: 'multiply',
      backgroundImage: `url(${halftoneTile})`,
      backgroundSize: `${pitch}px ${pitch}px`,
      backgroundRepeat: 'repeat',
    }}
  />
);

/** Soft corner falloff so white type never fights a bright photo edge. */
export const Vignette: React.FC<{strength?: number}> = ({
  strength = TEXTURE.vignette,
}) => (
  <AbsoluteFill
    style={{
      pointerEvents: 'none',
      background: `radial-gradient(120% 78% at 50% 44%, transparent 38%, rgba(0,0,0,${strength}) 100%)`,
    }}
  />
);
