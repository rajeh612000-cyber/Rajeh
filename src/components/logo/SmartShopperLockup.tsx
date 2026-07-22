import React from "react";
import { PALETTE } from "../../theme/palette";
import { FONT, W } from "../../theme/fonts";
import { SmartShopperMark } from "./SmartShopperMark";

type Variant = "color" | "reversed";

/** Mark + "Smart Shopper" wordmark, horizontal lockup. */
export const SmartShopperLockup: React.FC<{
  markSize?: number;
  variant?: Variant;
  build?: number;
  textReveal?: number; // 0..1 wordmark reveal
  tm?: boolean;
  style?: React.CSSProperties;
}> = ({ markSize = 200, variant = "color", build = 1, textReveal = 1, tm = true, style }) => {
  const wordColor = variant === "reversed" ? PALETTE.white : PALETTE.navy;
  const accent = variant === "reversed" ? PALETTE.yellow : PALETTE.yellow;
  const fontSize = markSize * 0.46;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: markSize * 0.14, ...style }}>
      <SmartShopperMark size={markSize} variant={variant} build={build} />
      <div
        style={{
          overflow: "hidden",
          clipPath: `inset(0 ${(1 - textReveal) * 100}% 0 0)`,
        }}
      >
        <div
          style={{
            fontFamily: FONT,
            fontWeight: W.extraBold,
            fontSize,
            lineHeight: 0.98,
            color: wordColor,
            letterSpacing: -fontSize * 0.02,
            whiteSpace: "nowrap",
          }}
        >
          Smart
        </div>
        <div
          style={{
            fontFamily: FONT,
            fontWeight: W.extraBold,
            fontSize,
            lineHeight: 0.98,
            color: wordColor,
            letterSpacing: -fontSize * 0.02,
            whiteSpace: "nowrap",
            position: "relative",
          }}
        >
          Shopper
          {tm && (
            <span
              style={{
                fontSize: fontSize * 0.2,
                fontWeight: W.bold,
                verticalAlign: "top",
                marginLeft: 4,
                color: accent,
              }}
            >
              ™
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
