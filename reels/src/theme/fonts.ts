import {continueRender, delayRender} from 'remotion';
import anton from '../../public/fonts/anton-latin.woff2';
import archivo from '../../public/fonts/archivo-latin.woff2';
import inter from '../../public/fonts/inter-latin.woff2';

/**
 * Fonts are self-hosted (latin subsets from Google Fonts — Anton, Archivo and
 * Inter, all SIL Open Font License) and inlined into the bundle as data URIs,
 * so a render never depends on the network or on the static file server.
 * Swap a family by dropping a new woff2 in public/fonts and changing the
 * import — nothing else in the system names a font directly.
 */
export const FONTS = {
  /** Display / headlines. Condensed, heavy, editorial. */
  display: 'Anton',
  /** Titling and UI-scale copy. Variable weight 100–900. */
  sans: 'Archivo',
  /** Captions. Tuned for small-size legibility on phones. */
  caption: 'Inter',
} as const;

const FACES = [
  {family: FONTS.display, url: anton, weight: '400'},
  {family: FONTS.sans, url: archivo, weight: '100 900'},
  {family: FONTS.caption, url: inter, weight: '100 900'},
];

/** How long to hold the render waiting for faces before drawing anyway. */
const FONT_WAIT_MS = 15000;

let loaded: Promise<void> | null = null;

/**
 * Registers the faces as CSS and holds frame 0 until they are ready.
 *
 * Two deliberate choices here, both learned the hard way on long renders:
 *
 *  - The faces go in as a plain `@font-face` stylesheet rather than through
 *    the FontFace JS API, so they are registered synchronously with the
 *    document and are available even if the readiness promise misbehaves.
 *  - The wait is bounded and always clears its delayRender handle. Remotion
 *    reloads the render tab if it dies mid-render, and on that fresh page a
 *    font-readiness promise can simply never settle — an unbounded wait turns
 *    a recoverable blip into a failed 45-second render.
 */
export const loadFonts = (): Promise<void> => {
  if (loaded) {
    return loaded;
  }

  const style = document.createElement('style');
  style.textContent = FACES.map(
    ({family, url, weight}) => `@font-face {
  font-family: '${family}';
  src: url(${url}) format('woff2');
  font-weight: ${weight};
  font-style: normal;
  font-display: block;
}`,
  ).join('\n');
  document.head.appendChild(style);

  const handle = delayRender('Loading reel fonts');
  const ready = Promise.all(
    FACES.map(({family, weight}) =>
      document.fonts.load(`${weight.split(' ')[0]} 100px '${family}'`),
    ),
  );
  const bounded = new Promise<void>((resolve) => setTimeout(resolve, FONT_WAIT_MS));

  loaded = Promise.race([ready.then(() => undefined), bounded]).then(() => {
    continueRender(handle);
  });

  return loaded;
};
