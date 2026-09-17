import type {ReelScript} from './types';
import {fiftyCent} from './fifty-cent';

/**
 * Every reel in the project.
 *
 * Adding a subject is: write `src/data/<subject>.ts` exporting a ReelScript,
 * import it here. That gets you a reel composition, a contact sheet and a
 * generated asset manifest + fact sheet — no other file needs touching.
 */
export const SCRIPTS: ReelScript[] = [fiftyCent];

/** Doc filenames: the first script owns the root ASSETS.md / FACTS.md. */
export const docNames = (script: ReelScript, index: number) =>
  index === 0
    ? {assets: 'ASSETS.md', facts: 'FACTS.md'}
    : {assets: `ASSETS.${script.id}.md`, facts: `FACTS.${script.id}.md`};
