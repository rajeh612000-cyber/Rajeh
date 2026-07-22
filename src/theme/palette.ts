// Marketeers Research — confirmed current brand palette (overrides older 2023 deck values)
export const PALETTE = {
  navy: "#08306B",
  yellow: "#FBC210",
  mediumBlue: "#255E91",
  red: "#CD393B",
  white: "#FFFFFF",
  black: "#0A0F1A", // near-black used only within gradients, never as a flat dark-on-dark block
} as const;

// Highlight colour for key stats / important words in captions (brand convention)
export const HIGHLIGHT = PALETTE.yellow;

export type PaletteKey = keyof typeof PALETTE;
