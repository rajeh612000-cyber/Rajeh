import React from 'react';
import {Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, MOTION, SAFE_AREA, TYPE} from '../theme/tokens';
import {FONTS} from '../theme/fonts';
import type {Caption} from '../data/types';

const normalise = (word: string) =>
  word.toLowerCase().replace(/[^\p{L}\p{N}'’#$.-]/gu, '');

export type TimedWord = {
  text: string;
  /** Frame, relative to the scene, at which this word lands. */
  at: number;
  /** Key word — rendered gold for the whole scene once it has landed. */
  key: boolean;
};

/**
 * Builds a word-level track from a plain caption line.
 *
 * Words are spread across the first 60% of the scene and the line then holds,
 * so the reader always gets a still frame to finish on — the thing that breaks
 * most fast-cut captions.
 */
export const buildWordTrack = (
  caption: Caption,
  sceneDuration: number,
): TimedWord[] => {
  const words = caption.text.split(/\s+/).filter(Boolean);
  const highlights = new Set((caption.highlight ?? []).map(normalise));
  const delay = caption.delay ?? 2;
  const window = Math.max(sceneDuration * 0.6 - delay, words.length);
  const step = words.length > 1 ? window / words.length : 0;

  return words.map((text, i) => ({
    text,
    at: Math.round(delay + i * step),
    key: highlights.has(normalise(text)),
  }));
};

/**
 * Burned-in captions with per-word entry and gold key-word highlighting.
 * Sits above Instagram's bottom chrome and carries its own contrast slab, so
 * it stays readable over a bright photo or a blown-out video frame.
 */
export const Captions: React.FC<{
  caption: Caption;
  sceneDuration: number;
}> = ({caption, sceneDuration}) => {
  const frame = useCurrentFrame();
  const {width} = useVideoConfig();
  const words = buildWordTrack(caption, sceneDuration);

  return (
    <div
      style={{
        position: 'absolute',
        left: SAFE_AREA.left,
        right: SAFE_AREA.rightRail,
        bottom: SAFE_AREA.bottom + 24,
        width: width - SAFE_AREA.left - SAFE_AREA.rightRail,
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.18em 0.30em',
        alignItems: 'flex-end',
      }}
    >
      {words.map((word, i) => (
        <Word key={`${word.text}-${i}`} word={word} frame={frame} />
      ))}
    </div>
  );
};

const Word: React.FC<{word: TimedWord; frame: number}> = ({word, frame}) => {
  const p = interpolate(frame, [word.at, word.at + 5], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(...MOTION.ease),
  });
  // A short gold "strike" sweeps under a key word just after it lands.
  const strike = word.key
    ? interpolate(frame, [word.at + 2, word.at + 11], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: Easing.bezier(...MOTION.ease),
      })
    : 0;

  return (
    <span
      style={{
        position: 'relative',
        display: 'inline-block',
        fontFamily: FONTS.caption,
        fontWeight: word.key ? TYPE.display : TYPE.bold,
        fontSize: TYPE.sizes.sm,
        lineHeight: 1.18,
        letterSpacing: TYPE.tracking.normal,
        color: word.key ? COLORS.goldBright : COLORS.pureWhite,
        textTransform: 'uppercase',
        opacity: p,
        transform: `translateY(${(1 - p) * 14}px)`,
        padding: '0.10em 0.22em',
        background: `rgba(10,10,10,${0.78 * p})`,
        textShadow: '0 2px 10px rgba(0,0,0,0.85)',
      }}
    >
      {word.text}
      {word.key ? (
        <span
          style={{
            position: 'absolute',
            left: '0.22em',
            right: '0.22em',
            bottom: '0.04em',
            height: 5,
            background: COLORS.gold,
            transform: `scaleX(${strike})`,
            transformOrigin: 'left center',
          }}
        />
      ) : null}
    </span>
  );
};
