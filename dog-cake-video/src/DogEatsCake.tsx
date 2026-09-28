import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import {cameraTransform, getCamera, getPose} from './lib/pose';
import {Background} from './scene/Background';
import {Cake} from './scene/Cake';
import {Crumbs} from './scene/Crumbs';
import {DogBody, DogDefs, DogHead, DogPaws} from './scene/Dog';
import {Dust, Foreground, GradeBloom, GradeTint, GradeVignette, LightRays} from './scene/Effects';
import {Table} from './scene/Table';
import timing from './timing.json';

const {width: W, height: H} = timing;
const layer: React.CSSProperties = {position: 'absolute', left: 0, top: 0, width: W, height: H};
const viewBox = `0 0 ${W} ${H}`;

export const DogEatsCake: React.FC<{withAudio: boolean}> = ({withAudio}) => {
	const frame = useCurrentFrame();
	const pose = getPose(frame);
	const cam = getCamera(frame);

	return (
		<AbsoluteFill style={{backgroundColor: '#E6CFAA'}}>
			{/* far background: out of focus, moves less than the subject */}
			<svg viewBox={viewBox} style={{...layer, filter: 'blur(9px)'}}>
				<g transform={cameraTransform(cam, 0.45)}>
					<Background frame={frame} />
				</g>
			</svg>

			{/* subject plane: table, dog, cake */}
			<svg viewBox={viewBox} style={layer}>
				<defs>
					{[4, 8, 14].map((s) => (
						<filter key={s} id={`blur-${s}`} x="-50%" y="-50%" width="200%" height="200%">
							<feGaussianBlur stdDeviation={s} />
						</filter>
					))}
				</defs>
				<DogDefs />
				<g transform={cameraTransform(cam, 1)}>
					<Table />
					<DogBody pose={pose} frame={frame} />
					<DogPaws pose={pose} frame={frame} />
					<Cake frame={frame} />
					<DogHead pose={pose} frame={frame} />
					<Crumbs frame={frame} />
				</g>
			</svg>

			<svg viewBox={viewBox} style={{...layer, mixBlendMode: 'screen'}}>
				<g transform={cameraTransform(cam, 0.8)}>
					<LightRays frame={frame} />
					<Dust frame={frame} />
				</g>
			</svg>

			{/* foreground props: very out of focus, move more than the subject */}
			<svg viewBox={viewBox} style={{...layer, filter: 'blur(8px)'}}>
				<g transform={cameraTransform(cam, 1.6)}>
					<Foreground />
				</g>
			</svg>

			<svg viewBox={viewBox} style={{...layer, mixBlendMode: 'screen'}}>
				<GradeBloom />
			</svg>
			<svg viewBox={viewBox} style={{...layer, mixBlendMode: 'soft-light'}}>
				<GradeTint />
			</svg>
			<svg viewBox={viewBox} style={layer}>
				<GradeVignette />
			</svg>

			{withAudio ? <Audio src={staticFile('soundtrack.wav')} /> : null}
		</AbsoluteFill>
	);
};
