import React from 'react';
import {AbsoluteFill} from 'remotion';
import {COLORS, SAFE_AREA} from '../theme/tokens';

/**
 * Content well. Everything legible lives inside this box so Instagram's
 * chrome (handle + top bar, caption + action rail) never covers it.
 */
export const SafeArea: React.FC<{
  children: React.ReactNode;
  justify?: React.CSSProperties['justifyContent'];
  align?: React.CSSProperties['alignItems'];
  style?: React.CSSProperties;
  /** Set false on cards that carry no caption, to use the full well. */
  reserveCaptionBand?: boolean;
}> = ({children, justify = 'center', align = 'flex-start', style, reserveCaptionBand = true}) => (
  <AbsoluteFill
    style={{
      paddingTop: SAFE_AREA.top,
      paddingBottom:
        SAFE_AREA.bottom + (reserveCaptionBand ? SAFE_AREA.captionBand : 0),
      paddingLeft: SAFE_AREA.left,
      paddingRight: SAFE_AREA.rightRail,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: justify,
      alignItems: align,
      ...style,
    }}
  >
    {children}
  </AbsoluteFill>
);

/**
 * Dev-only overlay drawing the Instagram-unsafe zones. Toggle from the
 * composition's props panel in Remotion Studio; never enabled on render.
 */
export const SafeAreaGuides: React.FC = () => {
  const band: React.CSSProperties = {
    position: 'absolute',
    background: 'rgba(255,0,80,0.14)',
  };
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{...band, top: 0, left: 0, right: 0, height: SAFE_AREA.top}} />
      <div style={{...band, bottom: 0, left: 0, right: 0, height: SAFE_AREA.bottom}} />
      <div style={{...band, top: 0, bottom: 0, left: 0, width: SAFE_AREA.left}} />
      <div style={{...band, top: 0, bottom: 0, right: 0, width: SAFE_AREA.rightRail}} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          border: `2px dashed ${COLORS.gold}`,
          margin: `${SAFE_AREA.top}px ${SAFE_AREA.rightRail}px ${SAFE_AREA.bottom}px ${SAFE_AREA.left}px`,
        }}
      />
      {/* Caption band: card content stays above this line. */}
      <div
        style={{
          position: 'absolute',
          left: SAFE_AREA.left,
          right: SAFE_AREA.rightRail,
          bottom: SAFE_AREA.bottom,
          height: SAFE_AREA.captionBand,
          border: `2px dashed ${COLORS.grey}`,
        }}
      />
    </AbsoluteFill>
  );
};
