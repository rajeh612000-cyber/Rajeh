// ─── Brand Colors ────────────────────────────────────────────────────────────
export const COLORS = {
  primaryYellow: "#fbc210",
  white: "#ffffff",
  red: "#cd393b",
  darkBlue: "#08306b",
  lightBlue: "#8acaec",
  midBlue: "#255e91",
  gray: "#929292",
  softRed: "#de7c7e",
  lightGray: "#d3d3d3",
} as const;

// ─── Composition Config ───────────────────────────────────────────────────────
export const FPS = 30;
export const COMP_WIDTH = 1080;
export const COMP_HEIGHT = 1080;

// ─── Scene Durations (frames) ─────────────────────────────────────────────────
// Each scene length in seconds × FPS. Adjust freely.
export const SCENE_DURATION = {
  opening: 5 * FPS,      // 150f — dark blue opener
  nature: 4 * FPS,       // 120f — spring/particle field
  mainMessage: 5 * FPS,  // 150f — "Happy Sham El-Nessim" hero
  cultural: 4 * FPS,     // 120f — staggered cultural words
  closing: 5 * FPS,      // 150f — brand outro
} as const;

// Transition duration in frames (used for both slide & fade transitions)
export const TRANSITION_DURATION = 20;

// Total composition frames = sum(scenes) - (4 transitions × 20f) = 690 - 80 = 610
export const TOTAL_FRAMES =
  SCENE_DURATION.opening +
  SCENE_DURATION.nature +
  SCENE_DURATION.mainMessage +
  SCENE_DURATION.cultural +
  SCENE_DURATION.closing -
  TRANSITION_DURATION * 4;

// ─── Text Content ─────────────────────────────────────────────────────────────
// Edit any copy here without touching the scene components.
export const TEXT = {
  // Scene 1 — Opening
  openingTagline: "A Season of",
  openingHighlight: "Joy & Renewal",

  // Scene 2 — Nature
  natureHeadline: "Spring is here",
  natureSub: "Feel the warmth, breathe the air",

  // Scene 3 — Main Message (hero)
  greetingLine1: "Happy",
  greetingLine2: "Sham El-Nessim",
  arabicGreeting: "شم النسيم مبارك",

  // Scene 4 — Cultural Words (displayed staggered)
  culturalWords: ["Spring", "Renewal", "Joy", "Family", "Nature"],

  // Scene 5 — Closing
  closingLine1: "May this season bring you",
  closingLine2: "peace, joy &",
  closingLine3: "new beginnings",
  closingTag: "#ShamElNessim",
} as const;
