import React from 'react';
import {AbsoluteFill} from 'remotion';
import {CameraShake} from '../components/CameraShake';
import {Captions} from '../components/Captions';
import {TitleCard} from '../components/cards/TitleCard';
import {PhotoCard} from '../components/cards/PhotoCard';
import {HeadlineCard} from '../components/cards/HeadlineCard';
import {TimelineCard} from '../components/cards/TimelineCard';
import {StatCard} from '../components/cards/StatCard';
import {QuoteCard} from '../components/cards/QuoteCard';
import {EndCard} from '../components/cards/EndCard';
import type {Scene} from '../data/types';

/**
 * Maps a scene to its card. Adding a new beat type is: extend the Scene union
 * in data/types.ts, write the card, add a branch here. Nothing else changes.
 */
const Card: React.FC<{scene: Scene}> = ({scene}) => {
  switch (scene.type) {
    case 'title':
      return <TitleCard scene={scene} />;
    case 'photo':
      return <PhotoCard scene={scene} />;
    case 'headline':
      return <HeadlineCard scene={scene} />;
    case 'timeline':
      return <TimelineCard scene={scene} />;
    case 'stat':
      return <StatCard scene={scene} />;
    case 'quote':
      return <QuoteCard scene={scene} />;
    case 'end':
      return <EndCard scene={scene} />;
  }
};

export const SceneRenderer: React.FC<{scene: Scene}> = ({scene}) => (
  <AbsoluteFill>
    <CameraShake intensity={scene.shake ?? 1} seed={scene.id}>
      <Card scene={scene} />
    </CameraShake>

    {/* Captions live outside the shake so the text never smears. */}
    {scene.caption ? (
      <Captions caption={scene.caption} sceneDuration={scene.durationInFrames} />
    ) : null}
  </AbsoluteFill>
);
