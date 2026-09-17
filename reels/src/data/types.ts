/**
 * Scene + script schema for the biography-reel system.
 *
 * A reel is a flat list of scenes. Each scene declares its own duration in
 * frames, so re-timing the edit is a data change, never a code change.
 */

/** A slot in the asset manifest. `null` renders the built-in placeholder. */
export type AssetRef = {
  /** Stable id, referenced by ASSETS.md and the manifest. */
  id: string;
  /** Path under public/, e.g. "images/subject-01.jpg". Null = placeholder. */
  src: string | null;
  /** What the final licensed asset should show. Shown inside the placeholder. */
  brief: string;
  kind: 'image' | 'video';
  /** Where the licensed file must come from, for rights clearance. */
  sourceNote?: string;
};

export type Caption = {
  /** Spoken/on-screen line. Words are split on whitespace. */
  text: string;
  /**
   * Words rendered in gold. Matched case-insensitively after stripping
   * punctuation, so "Queens," in the text matches "queens" here.
   */
  highlight?: string[];
  /** Frames before the caption starts animating, relative to scene start. */
  delay?: number;
};

/**
 * Every factual claim carries its own provenance so nothing is asserted
 * without a source. `verify` marks a line a human must confirm before publish.
 */
export type Sourced = {
  source: string;
  verify?: boolean;
};

type Base = {
  id: string;
  durationInFrames: number;
  caption?: Caption;
  /** Camera-shake multiplier for this scene. 0 disables. Default 1. */
  shake?: number;
};

export type TitleScene = Base & {
  type: 'title';
  kicker?: string;
  lines: string[];
  /** Index of the line rendered in gold. */
  goldLine?: number;
  subtitle?: string;
  backdrop?: AssetRef;
} & Partial<Sourced>;

export type PhotoScene = Base & {
  type: 'photo';
  asset: AssetRef;
  label?: string;
  /** Slow push-in ("in"), pull-out ("out") or lateral drift. */
  move?: 'in' | 'out' | 'left' | 'right';
  overlayYear?: string;
};

export type HeadlineScene = Base & {
  type: 'headline';
  /** Press-clipping style words; one array entry per typeset line. */
  lines: string[];
  goldWords?: string[];
  attribution?: string;
  asset?: AssetRef;
} & Partial<Sourced>;

export type TimelineScene = Base & {
  type: 'timeline';
  entries: ({year: string; label: string} & Sourced)[];
  /** Index of the entry that lands highlighted at the end of the scene. */
  focus?: number;
};

export type StatScene = Base & {
  type: 'stat';
  value: string;
  unit?: string;
  label: string;
  asset?: AssetRef;
} & Partial<Sourced>;

export type QuoteScene = Base & {
  type: 'quote';
  quote: string;
  attribution: string;
  asset?: AssetRef;
} & Partial<Sourced>;

export type EndScene = Base & {
  type: 'end';
  lines: string[];
  disclaimer: string;
  handle?: string;
};

export type Scene =
  | TitleScene
  | PhotoScene
  | HeadlineScene
  | TimelineScene
  | StatScene
  | QuoteScene
  | EndScene;

export type ReelScript = {
  /** Composition id and output filename stem. */
  id: string;
  subject: string;
  /** Rendered into the end card. Keep the unofficial/fan-made framing. */
  disclaimer: string;
  fps: number;
  width: number;
  height: number;
  /** Target runtime in seconds. Validated against the sum of scene durations. */
  durationInSeconds: number;
  /** Optional licensed music bed. Null = silent render. */
  music: AssetRef | null;
  /** Optional licensed voice-over. Null = captions carry the edit. */
  voiceover: AssetRef | null;
  scenes: Scene[];
};
