import React from 'react';
import {AbsoluteFill} from 'remotion';
import {SafeArea} from '../SafeArea';
import {AssetSlot} from '../AssetSlot';
import {Halftone, Vignette} from '../Halftone';
import {GoldRule, Kicker, RevealLine} from '../Type';
import {COLORS, TYPE} from '../../theme/tokens';
import {FONTS} from '../../theme/fonts';
import type {QuoteScene} from '../../data/types';

/**
 * Pull-quote beat.
 *
 * Not used in the 50 Cent cut — a quote is a factual claim about what someone
 * said, so only drop one in when you can put a real citation in `source`.
 */
export const QuoteCard: React.FC<{scene: QuoteScene}> = ({scene}) => (
  <AbsoluteFill style={{backgroundColor: COLORS.ink}}>
    {scene.asset ? (
      <>
        <AbsoluteFill style={{opacity: 0.2}}>
          <AssetSlot asset={scene.asset} />
        </AbsoluteFill>
        <Halftone opacity={0.18} />
      </>
    ) : null}
    <Vignette strength={0.5} />

    <SafeArea justify="center">
      <div
        style={{
          fontFamily: FONTS.display,
          fontSize: 190,
          lineHeight: 0.6,
          color: COLORS.gold,
          marginBottom: 18,
        }}
      >
        &ldquo;
      </div>

      <RevealLine delay={2}>
        <div
          style={{
            fontFamily: FONTS.sans,
            fontWeight: TYPE.display,
            fontSize: TYPE.sizes.md,
            lineHeight: 1.16,
            letterSpacing: TYPE.tracking.tight,
            color: COLORS.white,
            maxWidth: 760,
          }}
        >
          {scene.quote}
        </div>
      </RevealLine>

      <div style={{height: 32}} />
      <GoldRule delay={8} width={220} />
      <Kicker delay={10} color={COLORS.grey} style={{marginTop: 22}}>
        {scene.attribution}
      </Kicker>
    </SafeArea>
  </AbsoluteFill>
);
