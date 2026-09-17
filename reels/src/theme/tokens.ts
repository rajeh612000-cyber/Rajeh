/**
 * Design tokens for the editorial biography-reel system.
 *
 * Everything visual in the reel reads from here, so a new subject can be
 * re-skinned (palette / type scale / texture intensity) without touching
 * component code.
 */

export const COLORS = {
  black: '#0A0A0A',
  ink: '#121212',
  charcoal: '#1C1C1C',
  smoke: '#2A2A2A',
  white: '#F5F3EF',
  pureWhite: '#FFFFFF',
  grey: '#8C8880',
  /** Muted gold — the only accent in the system. */
  gold: '#C9A227',
  goldBright: '#E3BE4A',
  goldDeep: '#8A6E1B',
} as const;

export const SAFE_AREA = {
  /**
   * Instagram overlays UI at the top (status/handle) and bottom
   * (caption, action rail). Keep all legible content inside these insets.
   */
  top: 220,
  bottom: 380,
  left: 90,
  right: 90,
  /** The action rail on the right edge of a reel. */
  rightRail: 190,
  /**
   * Height reserved at the bottom of the content well for burned-in captions,
   * so card content and captions can never collide.
   */
  captionBand: 210,
} as const;

export const TYPE = {
  display: 900,
  bold: 800,
  medium: 600,
  regular: 400,
  sizes: {
    mega: 176,
    xl: 128,
    lg: 96,
    md: 68,
    sm: 46,
    xs: 34,
    micro: 26,
  },
  tracking: {
    tight: '-0.035em',
    normal: '-0.01em',
    wide: '0.16em',
    mega: '0.34em',
  },
} as const;

export const TEXTURE = {
  /** 0–1. Film grain opacity over the whole frame. */
  grain: 0.11,
  /** 0–1. Halftone dot-screen opacity over photos. */
  halftone: 0.3,
  /** Pixels of peak camera shake amplitude. */
  shake: 6,
  /** Vignette strength, 0–1. */
  vignette: 0.55,
} as const;

export const MOTION = {
  /** Frames a typical element takes to settle. */
  settle: 9,
  /** Editorial ease — fast out, soft landing. No bounce. */
  ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
  easeIn: [0.7, 0, 0.84, 0] as [number, number, number, number],
} as const;

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;
