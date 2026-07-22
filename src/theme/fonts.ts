import { continueRender, delayRender, staticFile } from "remotion";

export const FONT = "Manrope";

// Manrope weight scale (mapped to the DM Guide weight intent):
export const W = {
  extraLight: 200, // ~ Extra Light
  light: 300, // ~ Light
  regular: 400, // ~ Regular
  medium: 500, // ~ Medium
  semiBold: 600,
  bold: 700, // ~ Extra Bold intent
  extraBold: 800, // ~ Black intent (Manrope tops out at 800)
} as const;

const WEIGHTS = [200, 300, 400, 500, 600, 700, 800];

let injected = false;

/** Inject Manrope @font-face rules and block render until the glyphs are loaded. */
export const ensureFonts = () => {
  if (injected || typeof document === "undefined") return;
  injected = true;

  const css = WEIGHTS.map(
    (w) =>
      `@font-face{font-family:"${FONT}";font-style:normal;font-weight:${w};font-display:block;src:url(${staticFile(
        "fonts/Manrope-" + w + ".woff2"
      )}) format("woff2");}`
  ).join("\n");

  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  const handle = delayRender("Loading Manrope");
  Promise.all(
    WEIGHTS.map((w) => (document as any).fonts.load(`${w} 48px "${FONT}"`))
  )
    .then(() => (document as any).fonts.ready)
    .then(() => continueRender(handle))
    .catch(() => continueRender(handle));
};
