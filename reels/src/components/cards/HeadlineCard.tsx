import React from 'react';
import {AbsoluteFill} from 'remotion';
import {SafeArea} from '../SafeArea';
import {AssetSlot} from '../AssetSlot';
import {Halftone, Vignette} from '../Halftone';
import {GoldRule, Kicker, RevealLine, displayStyle, fitDisplaySize, useEnter} from '../Type';
import {COLORS, TYPE} from '../../theme/tokens';
import type {HeadlineScene} from '../../data/types';

const strip = (word: string) => word.replace(/[^\p{L}\p{N}'’#$.-]/gu, '').toUpperCase();

/**
 * Press-clipping beat. Words listed in `goldWords` get a gold block that wipes
 * in behind them and knocks the type out to black — the reel's loudest device,
 * so it is deliberately limited to one or two words per card.
 */
export const HeadlineCard: React.FC<{scene: HeadlineScene}> = ({scene}) => {
  const size = fitDisplaySize(scene.lines, TYPE.sizes.xl, 13);
  const gold = new Set((scene.goldWords ?? []).map(strip));

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.ink}}>
      {scene.asset ? (
        <>
          <AbsoluteFill style={{opacity: 0.26}}>
            <AssetSlot asset={scene.asset} />
          </AbsoluteFill>
          <Halftone opacity={0.2} />
        </>
      ) : null}
      <Vignette strength={0.45} />

      <SafeArea justify="center">
        <GoldRule delay={0} width={860} thickness={4} />
        <div style={{height: 40}} />

        {scene.lines.map((line, i) => (
          <RevealLine key={line} delay={3 + i * 5} tighten={i === 0 ? 0 : size * 0.14}>
            <div style={{...displayStyle(size), display: 'flex', flexWrap: 'wrap', gap: '0 0.26em'}}>
              {line.split(/\s+/).map((word, j) => (
                <HeadlineWord
                  key={`${word}-${j}`}
                  word={word}
                  gold={gold.has(strip(word))}
                  delay={5 + i * 5 + j * 2}
                />
              ))}
            </div>
          </RevealLine>
        ))}

        <div style={{height: 40}} />
        <GoldRule delay={6 + scene.lines.length * 5} width={420} thickness={4} />

        {scene.attribution ? (
          <Kicker delay={9 + scene.lines.length * 5} color={COLORS.grey} style={{marginTop: 28}}>
            {scene.attribution}
          </Kicker>
        ) : null}
      </SafeArea>
    </AbsoluteFill>
  );
};

const HeadlineWord: React.FC<{word: string; gold: boolean; delay: number}> = ({
  word,
  gold,
  delay,
}) => {
  const p = useEnter(delay, 8);
  if (!gold) {
    return <span>{word}</span>;
  }
  return (
    <span style={{position: 'relative', display: 'inline-block', padding: '0 0.08em'}}>
      <span
        style={{
          position: 'absolute',
          inset: '0.06em 0 0.02em 0',
          background: COLORS.gold,
          transform: `scaleX(${p})`,
          transformOrigin: 'left center',
        }}
      />
      <span style={{position: 'relative', color: p > 0.5 ? COLORS.black : COLORS.gold}}>
        {word}
      </span>
    </span>
  );
};
