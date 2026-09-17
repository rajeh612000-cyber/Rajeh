import React from 'react';
import {AbsoluteFill} from 'remotion';
import {SafeArea} from '../SafeArea';
import {Vignette} from '../Halftone';
import {GoldRule, RevealLine, displayStyle, fitDisplaySize} from '../Type';
import {COLORS, TYPE} from '../../theme/tokens';
import {FONTS} from '../../theme/fonts';
import type {EndScene} from '../../data/types';

/**
 * Sign-off. The disclaimer is part of the card, not an afterthought — this is
 * fan-made editorial and the frame has to say so without anyone reading the
 * Instagram caption.
 */
export const EndCard: React.FC<{scene: EndScene}> = ({scene}) => {
  const size = fitDisplaySize(scene.lines, TYPE.sizes.xl, 14);

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.black}}>
      <Vignette strength={0.7} />
      <SafeArea justify="center">
        {scene.lines.map((line, i) => (
          <RevealLine key={line} delay={2 + i * 4} tighten={i === 0 ? 0 : size * 0.14}>
            <div
              style={{
                ...displayStyle(size),
                color: i === 0 ? COLORS.gold : COLORS.white,
              }}
            >
              {line}
            </div>
          </RevealLine>
        ))}

        <div style={{height: 36}} />
        <GoldRule delay={10} width={520} thickness={4} />
        <div style={{height: 30}} />

        {scene.handle ? (
          <RevealLine delay={12}>
            <div
              style={{
                fontFamily: FONTS.sans,
                fontWeight: TYPE.display,
                fontSize: TYPE.sizes.xs,
                letterSpacing: TYPE.tracking.wide,
                color: COLORS.white,
              }}
            >
              {scene.handle}
            </div>
          </RevealLine>
        ) : null}

        <RevealLine delay={14} style={{marginTop: 28}}>
          <div
            style={{
              fontFamily: FONTS.caption,
              fontWeight: TYPE.regular,
              fontSize: TYPE.sizes.micro,
              lineHeight: 1.45,
              color: COLORS.grey,
              maxWidth: 760,
            }}
          >
            {scene.disclaimer}
          </div>
        </RevealLine>
      </SafeArea>
    </AbsoluteFill>
  );
};
