/**
 * Smart Value AI — brand tokens.
 *
 * Every value here was read off the live stylesheet at
 * smartvalueaisolutions.com/pricing-optimizer/ (the --svp-* custom properties).
 * Nothing in this film is an approximation of the brand; it is the brand.
 */

export const INK        = 0x1a1a4e; // --svp-ink      deep space, primary type
export const PRIMARY    = 0x7751ff; // --svp-primary  the live line
export const DEEP       = 0x534ab7; // --svp-deep     structure
export const LIGHT      = 0x8c5fd6; // --svp-light
export const NUM        = 0xa09de8; // --svp-num      particles, mid tone
export const BORDER     = 0xe0dff8; // --svp-border   glass edge
export const LILAC      = 0xeeedfe; // --svp-lilac
export const BG_SOFT    = 0xf8f6ff; // --svp-bg-soft
export const WHITE      = 0xffffff;

/** Rationed. Two uses in the entire film: the recommended price, and the CTA. */
export const ACCENT     = 0xf19526; // --svp-accent

/**
 * The mark's own palette, sampled from the supplied artwork.
 *
 * The lattice in the logo is blue, not violet — the violet belongs to the
 * wordmark. The film's 3D mark is built in these values so the dissolve into
 * the real lock-up has nothing to give itself away.
 */
export const MARK_NODE  = 0x3281ff; // the lit vertices
export const MARK_FACE_A = 0x6068e9; // lavender-blue facet
export const MARK_FACE_B = 0xb8c6ff; // pale periwinkle facet
export const MARK_EDGE  = 0x8fb4ff; // hairline
export const MARK_LENS  = 0x3b6ff5; // lens ring
/** The artwork's own backdrop. One level off --svp-ink, so the lock-up blends. */
export const MARK_BG    = 0x191a4e;

/** The losing scenario only. Never decorative. */
export const ROSE       = 0x9b3d5a;
export const ROSE_SOFT  = 0xc97a95;
export const ROSE_TINT  = 0xe8c3d3;

/** Void is ink pushed down for vignette depth — the film is darker than the site. */
export const VOID       = 0x0a0a23;

export const hex = (n) => '#' + n.toString(16).padStart(6, '0');

/**
 * The signature. --svp-radius is `14px 14px 14px 4px`: three soft corners and
 * one sharp cut at bottom-left. Every card, chip and panel in this film carries
 * it. Nobody names it; everybody feels it.
 */
export const RADIUS = {
  card: '22px 22px 22px 6px',
  panel: '14px 14px 14px 4px',
  chip: '8px 8px 8px 3px',
  pill: '999px 999px 999px 999px',
};

export const FONT = "'Sora', sans-serif";

/** Easing. No bounce anywhere — RGM directors distrust bounce. */
export const EASE = {
  move: 'power2.inOut',
  settle: 'power3.out',
  reveal: 'power2.out',
  snap: 'power4.out',
};

/** The real numbers from the scenario table on the page. Illustrative, per their footnote. */
export const SCENARIOS = [
  { id: 'R1', label: 'Targeted increase on core packs', revenue: 4.2, margin: 6.8, volume: -0.6, recommended: true },
  { id: 'R2', label: 'Blanket +5% across the range',    revenue: 1.1, margin: 3.9, volume: -4.8, recommended: false },
  { id: 'R3', label: 'Hold price, deepen promotions',   revenue: 2.0, margin: -1.5, volume: 3.2, recommended: false },
];

/** Guardrail from the hero simulator: volume no worse than −2%. */
export const GUARDRAIL = -2.0;
