import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {AssetSlot} from '../AssetSlot';
import {Halftone, Vignette} from '../Halftone';
import {COLORS, SAFE_AREA, TYPE} from '../../theme/tokens';
import {FONTS} from '../../theme/fonts';
import type {PhotoScene} from '../../data/types';

const MOVES = {
  in: {scale: [1.06, 1.2], x: [0, 0]},
  out: {scale: [1.2, 1.06], x: [0, 0]},
  left: {scale: [1.14, 1.14], x: [40, -40]},
  right: {scale: [1.14, 1.14], x: [-40, 40]},
} as const;

/**
 * Full-bleed photo/clip beat with a slow continuous move under it. The move is
 * linear on purpose: eased Ken Burns reads as a transition, linear reads as a
 * locked-off documentary shot.
 */
export const PhotoCard: React.FC<{scene: PhotoScene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const move = MOVES[scene.move ?? 'in'];
  const t = [0, durationInFrames];

  const scale = interpolate(frame, t, move.scale, {extrapolateRight: 'clamp'});
  const x = interpolate(frame, t, move.x, {extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.black}}>
      <AbsoluteFill style={{transform: `scale(${scale}) translateX(${x}px)`}}>
        <AssetSlot asset={scene.asset} />
      </AbsoluteFill>

      {/* Texture sits above the image but below any type. */}
      <Halftone />
      <Vignette />

      {scene.overlayYear ? <YearStamp year={scene.overlayYear} /> : null}
      {scene.label ? (
        <div
          style={{
            position: 'absolute',
            left: SAFE_AREA.left,
            bottom: SAFE_AREA.bottom + SAFE_AREA.captionBand + 24,
            fontFamily: FONTS.sans,
            fontWeight: TYPE.bold,
            fontSize: TYPE.sizes.xs,
            letterSpacing: TYPE.tracking.wide,
            textTransform: 'uppercase',
            color: COLORS.white,
            background: 'rgba(10,10,10,0.8)',
            padding: '10px 18px',
            borderLeft: `6px solid ${COLORS.gold}`,
          }}
        >
          {scene.label}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

/** Big outlined year, top-left of the safe area. Wipes up on entry. */
const YearStamp: React.FC<{year: string}> = ({year}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [1, 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  return (
    <div
      style={{
        position: 'absolute',
        left: SAFE_AREA.left,
        top: SAFE_AREA.top + 30,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          fontFamily: FONTS.display,
          fontSize: TYPE.sizes.lg,
          lineHeight: 1.12,
          letterSpacing: TYPE.tracking.tight,
          color: 'transparent',
          WebkitTextStroke: `3px ${COLORS.gold}`,
          transform: `translateY(${(1 - p) * 110}%)`,
        }}
      >
        {year}
      </div>
    </div>
  );
};
