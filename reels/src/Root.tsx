import React from 'react';
import {Composition} from 'remotion';
import {Reel, totalFrames} from './reel/Reel';
import {ContactSheet, contactSheetHeight} from './reel/ContactSheet';
import {SCRIPTS} from './data/scripts';
import type {ReelScript} from './data/types';

/** One reel composition and one contact sheet per registered script. */

/** Fails loudly if a script's scenes don't add up to its target runtime. */
const assertDuration = (script: ReelScript) => {
  const frames = totalFrames(script);
  const target = Math.round(script.durationInSeconds * script.fps);
  if (frames !== target) {
    throw new Error(
      `[${script.id}] scenes total ${frames} frames (${(frames / script.fps).toFixed(2)}s) ` +
        `but durationInSeconds is ${script.durationInSeconds} (${target} frames). ` +
        `Adjust scene durations in the script data file.`,
    );
  }
  return frames;
};

export const RemotionRoot: React.FC = () => (
  <>
    {SCRIPTS.map((script) => (
      <Composition
        key={script.id}
        id={script.id}
        component={Reel}
        durationInFrames={assertDuration(script)}
        fps={script.fps}
        width={script.width}
        height={script.height}
        defaultProps={{script, showSafeAreas: false}}
      />
    ))}

    {/* Storyboard stills: every beat of a reel on one page. */}
    {SCRIPTS.map((script) => (
      <Composition
        key={`${script.id}Sheet`}
        id={`${script.id}ContactSheet`}
        component={ContactSheet}
        /**
         * Freeze clamps to the composition's duration, so a 1-frame sheet
         * would render every cell at frame 0 — i.e. before any card has
         * animated in. Give it the reel's own length and render frame 0.
         */
        durationInFrames={totalFrames(script)}
        fps={script.fps}
        width={script.width}
        height={contactSheetHeight(script)}
        defaultProps={{script}}
      />
    ))}
  </>
);
