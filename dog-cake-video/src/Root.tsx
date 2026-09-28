import React from 'react';
import {Composition} from 'remotion';
import {DogEatsCake} from './DogEatsCake';
import timing from './timing.json';

export const RemotionRoot: React.FC = () => (
	<Composition
		id="DogEatsCake"
		component={DogEatsCake}
		durationInFrames={timing.durationInFrames}
		fps={timing.fps}
		width={timing.width}
		height={timing.height}
		defaultProps={{withAudio: true}}
	/>
);
