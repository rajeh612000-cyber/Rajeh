import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {SceneRenderer} from './SceneRenderer';
import {sceneOffsets} from './timing';
import {Grain} from '../components/Grain';
import {SafeAreaGuides} from '../components/SafeArea';
import {COLORS} from '../theme/tokens';
import {loadFonts} from '../theme/fonts';
import type {ReelScript} from '../data/types';

loadFonts();

export {sceneOffsets, totalFrames} from './timing';

export type ReelProps = {
  script: ReelScript;
  /** Studio-only: draw the Instagram-unsafe zones. Leave false when rendering. */
  showSafeAreas: boolean;
};

/**
 * The reel. Hard cuts only — every scene is an independent Sequence and there
 * are no cross-dissolves, which is what lets 1-second beats read as an edit
 * rather than as a slideshow.
 */
export const Reel: React.FC<ReelProps> = ({script, showSafeAreas}) => (
  <AbsoluteFill style={{backgroundColor: COLORS.black}}>
    {sceneOffsets(script).map(({scene, from}) => (
      <Sequence
        key={scene.id}
        from={from}
        durationInFrames={scene.durationInFrames}
        name={`${scene.type}: ${scene.id}`}
        layout="none"
      >
        <SceneRenderer scene={scene} />
      </Sequence>
    ))}

    {/* Grain is global so it doesn't reset on every cut. */}
    <Grain />

    {script.music?.src ? <Audio src={staticFile(script.music.src)} volume={0.8} /> : null}
    {script.voiceover?.src ? <Audio src={staticFile(script.voiceover.src)} /> : null}

    {showSafeAreas ? <SafeAreaGuides /> : null}
  </AbsoluteFill>
);
