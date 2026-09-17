import React from 'react';
import {AbsoluteFill} from 'remotion';
import {SafeArea} from '../SafeArea';
import {AssetSlot} from '../AssetSlot';
import {Halftone, Vignette} from '../Halftone';
import {GoldRule, Kicker, RevealLine, displayStyle, fitDisplaySize} from '../Type';
import {COLORS, TYPE} from '../../theme/tokens';
import {FONTS} from '../../theme/fonts';
import type {StatScene} from '../../data/types';

/**
 * One number, one claim. The value is the only thing at display size, which is
 * what makes these beats survive at 1 second.
 */
export const StatCard: React.FC<{scene: StatScene}> = ({scene}) => {
  const size = fitDisplaySize([scene.value], TYPE.sizes.mega, 5);

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.black}}>
      {scene.asset ? (
        <>
          <AbsoluteFill style={{opacity: 0.22}}>
            <AssetSlot asset={scene.asset} />
          </AbsoluteFill>
          <Halftone opacity={0.18} />
        </>
      ) : null}
      <Vignette strength={0.5} />

      <SafeArea justify="center">
        <Kicker delay={0}>By the numbers</Kicker>
        <div style={{height: 30}} />

        <div style={{display: 'flex', alignItems: 'baseline', gap: 26, flexWrap: 'wrap'}}>
          <RevealLine delay={2}>
            <div style={{...displayStyle(size), color: COLORS.gold}}>{scene.value}</div>
          </RevealLine>
          {scene.unit ? (
            <RevealLine delay={6}>
              <div
                style={{
                  fontFamily: FONTS.sans,
                  fontWeight: TYPE.display,
                  fontSize: TYPE.sizes.md,
                  letterSpacing: TYPE.tracking.wide,
                  textTransform: 'uppercase',
                  color: COLORS.white,
                }}
              >
                {scene.unit}
              </div>
            </RevealLine>
          ) : null}
        </div>

        <div style={{height: 34}} />
        <GoldRule delay={8} width={300} />
        <div style={{height: 26}} />

        <RevealLine delay={9}>
          <div
            style={{
              fontFamily: FONTS.sans,
              fontWeight: TYPE.medium,
              fontSize: TYPE.sizes.xs,
              lineHeight: 1.3,
              letterSpacing: TYPE.tracking.normal,
              textTransform: 'uppercase',
              color: COLORS.white,
              maxWidth: 740,
            }}
          >
            {scene.label}
          </div>
        </RevealLine>
      </SafeArea>
    </AbsoluteFill>
  );
};
