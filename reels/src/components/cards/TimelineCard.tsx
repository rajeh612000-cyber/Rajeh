import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {SafeArea} from '../SafeArea';
import {Vignette} from '../Halftone';
import {GoldRule, Kicker, RevealLine, useEnter} from '../Type';
import {COLORS, TYPE} from '../../theme/tokens';
import {FONTS} from '../../theme/fonts';
import type {TimelineScene} from '../../data/types';

/**
 * Year ladder. A gold spine draws down the left edge and a marker travels to
 * the `focus` entry, which lifts to full contrast while the rest sit back —
 * the cheapest way to show sequence without a transition.
 */
export const TimelineCard: React.FC<{scene: TimelineScene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const focus = scene.focus ?? scene.entries.length - 1;
  const rowHeight = 168;
  const spine = useEnter(2, 14);

  // Marker steps entry-by-entry, arriving at `focus` by ~70% of the scene.
  const travel = interpolate(frame, [6, scene.durationInFrames * 0.7], [0, focus], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.black}}>
      <Vignette strength={0.4} />
      <SafeArea justify="center">
        <Kicker delay={0}>Timeline</Kicker>
        <div style={{height: 26}} />
        <GoldRule delay={1} width={200} />
        <div style={{height: 46}} />

        <div style={{position: 'relative', paddingLeft: 58}}>
          {/* Spine */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 10,
              width: 4,
              height: (scene.entries.length * rowHeight - 40) * spine,
              background: COLORS.smoke,
            }}
          />
          {/* Travelling marker */}
          <div
            style={{
              position: 'absolute',
              left: -12,
              top: 10 + travel * rowHeight,
              width: 28,
              height: 28,
              background: COLORS.gold,
              transform: 'rotate(45deg)',
            }}
          />

          {scene.entries.map((entry, i) => {
            const active = Math.round(travel) === i;
            return (
              <div key={entry.year + entry.label} style={{height: rowHeight}}>
                <RevealLine delay={4 + i * 3}>
                  <div
                    style={{
                      fontFamily: FONTS.display,
                      fontSize: TYPE.sizes.md,
                      lineHeight: 1.12,
                      letterSpacing: TYPE.tracking.tight,
                      color: active ? COLORS.gold : COLORS.smoke,
                    }}
                  >
                    {entry.year}
                  </div>
                </RevealLine>
                <RevealLine delay={6 + i * 3}>
                  <div
                    style={{
                      marginTop: 14,
                      fontFamily: FONTS.sans,
                      fontWeight: active ? TYPE.display : TYPE.medium,
                      fontSize: TYPE.sizes.xs,
                      lineHeight: 1.25,
                      letterSpacing: TYPE.tracking.normal,
                      textTransform: 'uppercase',
                      color: active ? COLORS.white : COLORS.grey,
                      maxWidth: 700,
                    }}
                  >
                    {entry.label}
                  </div>
                </RevealLine>
              </div>
            );
          })}
        </div>
      </SafeArea>
    </AbsoluteFill>
  );
};
