import React from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {COLORS, MOTION, TYPE} from '../theme/tokens';
import {FONTS} from '../theme/fonts';

const ease = Easing.bezier(...MOTION.ease);

/** Progress 0–1 for an element entering `delay` frames into its scene. */
export const useEnter = (delay = 0, duration: number = MOTION.settle) => {
  const frame = useCurrentFrame();
  return interpolate(frame, [delay, delay + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });
};

/**
 * A headline line that rises out of a clipping mask. No fades, no bounce —
 * the mask does the work, which is what keeps it reading as editorial rather
 * than as a template.
 */
export const RevealLine: React.FC<{
  children: React.ReactNode;
  delay?: number;
  style?: React.CSSProperties;
  /**
   * Negative px pulled off the top of the mask. Display faces overflow their
   * line box, so the mask has to stay loose enough not to clip ascenders —
   * lines are tightened back up here instead of with a sub-1 line-height.
   */
  tighten?: number;
}> = ({children, delay = 0, style, tighten = 0}) => {
  const p = useEnter(delay);
  return (
    <div style={{overflow: 'hidden', display: 'block', marginTop: -tighten}}>
      <div
        style={{
          transform: `translateY(${(1 - p) * 104}%)`,
          ...style,
        }}
      >
        {children}
      </div>
    </div>
  );
};

/** Small all-caps label with mega tracking. The system's connective tissue. */
export const Kicker: React.FC<{
  children: React.ReactNode;
  delay?: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({children, delay = 0, color = COLORS.gold, style}) => {
  const p = useEnter(delay, 7);
  return (
    <div
      style={{
        fontFamily: FONTS.sans,
        fontWeight: TYPE.bold,
        fontSize: TYPE.sizes.micro,
        letterSpacing: TYPE.tracking.mega,
        textTransform: 'uppercase',
        color,
        opacity: p,
        transform: `translateX(${(1 - p) * -18}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** The gold rule that separates a kicker from a headline. Wipes in from left. */
export const GoldRule: React.FC<{delay?: number; width?: number; thickness?: number}> = ({
  delay = 0,
  width = 180,
  thickness = 6,
}) => {
  const p = useEnter(delay, 10);
  return (
    <div
      style={{
        width: width * p,
        height: thickness,
        background: COLORS.gold,
        flexShrink: 0,
      }}
    />
  );
};

export const displayStyle = (size: number): React.CSSProperties => ({
  fontFamily: FONTS.display,
  fontWeight: TYPE.display,
  fontSize: size,
  lineHeight: 1.12,
  letterSpacing: TYPE.tracking.tight,
  textTransform: 'uppercase',
  color: COLORS.white,
});

/**
 * Shrinks a headline's type size as the line gets longer, so a longer name in
 * a re-skin can't blow past the safe area.
 */
export const fitDisplaySize = (
  lines: string[],
  base: number = TYPE.sizes.xl,
  maxChars = 11,
) => {
  const longest = Math.max(...lines.map((l) => l.length), 1);
  return longest <= maxChars ? base : Math.max(base * (maxChars / longest), base * 0.5);
};
