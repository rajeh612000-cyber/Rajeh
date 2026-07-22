import React from "react";
import { PALETTE } from "../../theme/palette";

/**
 * Vector recreation of the Smart Shopper mark: an open circle with motion
 * "speed lines", a slatted shopping basket with a handle, and two item
 * triangles (red + blue) rising out of the basket. Built as SVG so it never
 * rasterizes / pixelates at any scale.
 *
 * NOTE: this is a faithful stand-in. When the official transparent logo file is
 * supplied, drop it into <SmartShopperMark asImage="logo/smart-shopper.png" />.
 */
const LIGHT_BLUE = "#8FC4E8"; // logo accent (a light tint in the brand's blue family)

type Variant = "color" | "reversed";

export const SmartShopperMark: React.FC<{
  size?: number;
  variant?: Variant;
  /** progress 0..1 of the draw-on build (ring sweep, basket rise, items pop) */
  build?: number;
  style?: React.CSSProperties;
}> = ({ size = 300, variant = "color", build = 1, style }) => {
  const c =
    variant === "reversed"
      ? {
          ring: PALETTE.white,
          basketFill: PALETTE.white,
          slat: PALETTE.mediumBlue,
          rim: PALETTE.white,
          handle: PALETTE.white,
          speed: PALETTE.white,
          triA: PALETTE.red,
          triB: PALETTE.mediumBlue,
        }
      : {
          ring: PALETTE.navy,
          basketFill: PALETTE.navy,
          slat: PALETTE.white,
          rim: PALETTE.navy,
          handle: PALETTE.navy,
          speed: LIGHT_BLUE,
          triA: PALETTE.red,
          triB: LIGHT_BLUE,
        };

  // Ring sweep: dasharray reveal
  const ringLen = 470;
  const ringDash = ringLen * Math.min(1, build * 1.15);

  const basketRise = (1 - Math.min(1, Math.max(0, (build - 0.25) / 0.5))) * 26;
  const itemPop = Math.min(1, Math.max(0, (build - 0.55) / 0.35));
  const speedIn = Math.min(1, Math.max(0, (build - 0.7) / 0.3));

  const slatXs = [80, 95, 110, 125, 140];

  return (
    <svg width={size} height={size} viewBox="0 0 220 220" style={style}>
      {/* open ring with a gap on the lower-left */}
      <path
        d="M 62 182 A 86 86 0 1 1 158 182"
        fill="none"
        stroke={c.ring}
        strokeWidth={9}
        strokeLinecap="round"
        strokeDasharray={`${ringDash} ${ringLen}`}
      />

      {/* speed lines lower-left */}
      <g opacity={speedIn} stroke={c.speed} strokeWidth={7} strokeLinecap="round">
        <line x1={14} y1={150} x2={46} y2={150} />
        <line x1={8} y1={166} x2={40} y2={166} />
        <line x1={16} y1={182} x2={44} y2={182} />
      </g>

      <g transform={`translate(0 ${basketRise})`}>
        {/* item triangles rising from the basket */}
        <g transform={`translate(0 ${(1 - itemPop) * 22})`} opacity={itemPop}>
          <polygon points="66,92 96,92 81,50" fill={c.triA} />
          <polygon points="100,92 124,92 112,62" fill={c.triB} />
        </g>

        {/* handle */}
        <path
          d="M 84 92 C 90 62 130 62 136 92"
          fill="none"
          stroke={c.handle}
          strokeWidth={7}
          strokeLinecap="round"
        />

        {/* basket body (trapezoid) */}
        <path
          d="M 60 100 L 160 100 L 146 162 Q 145 168 139 168 L 81 168 Q 75 168 74 162 Z"
          fill={c.basketFill}
        />
        {/* rim bar */}
        <rect x={50} y={88} width={120} height={16} rx={8} fill={c.rim} />

        {/* slats */}
        <g stroke={c.slat} strokeWidth={5} strokeLinecap="round">
          {slatXs.map((x, i) => {
            const lean = (x - 110) * 0.12;
            return <line key={i} x1={x} y1={110} x2={x + lean} y2={158} />;
          })}
        </g>
      </g>
    </svg>
  );
};
