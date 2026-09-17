import React from 'react';
import {AbsoluteFill} from 'remotion';
import {SafeArea} from '../SafeArea';
import {AssetSlot} from '../AssetSlot';
import {Halftone, Vignette} from '../Halftone';
import {GoldRule, Kicker, RevealLine, displayStyle, fitDisplaySize} from '../Type';
import {COLORS, TYPE} from '../../theme/tokens';
import {FONTS} from '../../theme/fonts';
import type {TitleScene} from '../../data/types';

/**
 * The system's anchor card: kicker, gold rule, stacked display lines with one
 * line in gold, optional subtitle. Used for the open, act breaks and the sign-off.
 */
export const TitleCard: React.FC<{scene: TitleScene}> = ({scene}) => {
  const size = fitDisplaySize(scene.lines, TYPE.sizes.mega, 8);

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.black}}>
      {scene.backdrop ? (
        <>
          <AbsoluteFill style={{opacity: 0.32}}>
            <AssetSlot asset={scene.backdrop} />
          </AbsoluteFill>
          <Halftone opacity={0.18} />
        </>
      ) : null}
      <Vignette strength={0.7} />

      <SafeArea justify="center">
        {scene.kicker ? (
          <div style={{display: 'flex', alignItems: 'center', gap: 24, marginBottom: 34}}>
            <GoldRule delay={1} width={120} />
            <Kicker delay={3}>{scene.kicker}</Kicker>
          </div>
        ) : null}

        {scene.lines.map((line, i) => (
          <RevealLine key={line} delay={4 + i * 4} tighten={i === 0 ? 0 : size * 0.14}>
            <div
              style={{
                ...displayStyle(size),
                color: i === scene.goldLine ? COLORS.gold : COLORS.white,
              }}
            >
              {line}
            </div>
          </RevealLine>
        ))}

        {scene.subtitle ? (
          <RevealLine delay={10 + scene.lines.length * 4} style={{marginTop: 30}}>
            <div
              style={{
                fontFamily: FONTS.sans,
                fontWeight: TYPE.medium,
                fontSize: TYPE.sizes.xs,
                letterSpacing: TYPE.tracking.wide,
                textTransform: 'uppercase',
                color: COLORS.grey,
              }}
            >
              {scene.subtitle}
            </div>
          </RevealLine>
        ) : null}
      </SafeArea>
    </AbsoluteFill>
  );
};
