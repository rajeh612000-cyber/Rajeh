import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {TEXTURE} from '../theme/tokens';
import grainTile from '../theme/textures/grain.png';

const TILE = 256;
/** Frames between grain reseeds. Half-rate reads as film; full-rate as video noise. */
const HOLD = 2;

/**
 * Film grain, as a tiled noise plate offset pseudo-randomly each beat.
 *
 * The tile is baked by `npm run textures` and inlined into the bundle. The
 * obvious implementation — an SVG feTurbulence filter — looks the same but
 * evaluates 2 megapixels of noise per frame and takes the render tab down a
 * few hundred frames in.
 */
export const Grain: React.FC<{opacity?: number; scale?: number}> = ({
  opacity = TEXTURE.grain,
  scale = 1,
}) => {
  const frame = useCurrentFrame();
  const step = Math.floor(frame / HOLD);

  // Cheap deterministic hash -> a fresh sub-pixel offset per step, so the tile
  // never sits still and the repeat is invisible in motion.
  const hash = (n: number) => {
    const x = Math.sin(n * 127.1) * 43758.5453;
    return x - Math.floor(x);
  };
  const x = Math.round(hash(step) * TILE);
  const y = Math.round(hash(step + 99) * TILE);

  return (
    <AbsoluteFill
      style={{
        pointerEvents: 'none',
        opacity,
        mixBlendMode: 'overlay',
        backgroundImage: `url(${grainTile})`,
        backgroundSize: `${TILE * scale}px ${TILE * scale}px`,
        backgroundPosition: `${x}px ${y}px`,
        backgroundRepeat: 'repeat',
      }}
    />
  );
};
