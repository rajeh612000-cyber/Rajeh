import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, staticFile} from 'remotion';
import {COLORS, TYPE} from '../theme/tokens';
import {FONTS} from '../theme/fonts';
import type {AssetRef} from '../data/types';

/**
 * Renders a licensed asset if one has been dropped in, otherwise a labelled
 * placeholder carrying the asset id and its brief — so an unfinished cut still
 * tells you exactly which file is missing and what it should contain.
 */
export const AssetSlot: React.FC<{
  asset: AssetRef;
  style?: React.CSSProperties;
}> = ({asset, style}) => {
  if (asset.src) {
    const src = staticFile(asset.src);
    return (
      <AbsoluteFill style={style}>
        {asset.kind === 'video' ? (
          <OffthreadVideo
            src={src}
            muted
            style={{width: '100%', height: '100%', objectFit: 'cover'}}
          />
        ) : (
          <Img src={src} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        )}
      </AbsoluteFill>
    );
  }

  return <AssetPlaceholder asset={asset} style={style} />;
};

export const AssetPlaceholder: React.FC<{
  asset: AssetRef;
  style?: React.CSSProperties;
}> = ({asset, style}) => (
  <AbsoluteFill
    style={{
      ...style,
      background: `repeating-linear-gradient(135deg, ${COLORS.charcoal} 0 26px, ${COLORS.ink} 26px 52px)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <AbsoluteFill
      style={{
        margin: 28,
        border: `3px dashed ${COLORS.goldDeep}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 26,
        padding: 64,
        textAlign: 'center',
        fontFamily: FONTS.sans,
      }}
    >
      <div
        style={{
          fontSize: TYPE.sizes.micro,
          letterSpacing: TYPE.tracking.mega,
          color: COLORS.gold,
          fontWeight: TYPE.bold,
        }}
      >
        {asset.kind === 'video' ? 'VIDEO SLOT' : 'IMAGE SLOT'}
      </div>
      <div
        style={{
          fontSize: TYPE.sizes.sm,
          fontWeight: TYPE.display,
          color: COLORS.white,
          letterSpacing: TYPE.tracking.normal,
        }}
      >
        {asset.id}
      </div>
      <div
        style={{
          fontSize: TYPE.sizes.micro,
          lineHeight: 1.5,
          color: COLORS.grey,
          maxWidth: 620,
          fontWeight: TYPE.regular,
        }}
      >
        {asset.brief}
      </div>
    </AbsoluteFill>
  </AbsoluteFill>
);
