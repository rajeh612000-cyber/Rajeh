import React from 'react';
import {random} from 'remotion';

// Sunbeams from the window, drawn with a screen blend.
export const LightRays: React.FC<{frame: number}> = ({frame}) => {
	const rays = [
		{pts: '1480 30 L 1630 30 L 1060 1120 L 760 1120', o: 0.9},
		{pts: '1700 30 L 1790 30 L 1330 1120 L 1160 1120', o: 0.65},
		{pts: '1880 50 L 2000 50 L 1600 1120 L 1440 1120', o: 0.8},
	];
	return (
		<g>
			<defs>
				<linearGradient id="fx-ray" gradientUnits="userSpaceOnUse" x1={1700} y1={30} x2={1100} y2={1120}>
					<stop offset="0" stopColor="#FFF0CC" stopOpacity={0.34} />
					<stop offset="0.55" stopColor="#FFE6B8" stopOpacity={0.1} />
					<stop offset="1" stopColor="#FFE6B8" stopOpacity={0} />
				</linearGradient>
				<filter id="fx-soft" x="-30%" y="-30%" width="160%" height="160%">
					<feGaussianBlur stdDeviation={18} />
				</filter>
			</defs>
			<g filter="url(#fx-soft)">
				{rays.map((r, i) => (
					<path key={i} d={`M ${r.pts} Z`} fill="url(#fx-ray)" opacity={r.o * (0.8 + 0.2 * Math.sin(frame / 40 + i * 2))} />
				))}
			</g>
		</g>
	);
};

// Dust drifting through the sunbeams.
export const Dust: React.FC<{frame: number}> = ({frame}) => (
	<g>
		{Array.from({length: 90}).map((_, i) => {
			const r = (s: string) => random(`dust-${i}-${s}`);
			const t = r('t');
			const x0 = 1480 + r('c') * 440 - t * 600;
			const y0 = 50 + t * 880;
			const x = x0 + 26 * Math.sin(frame / (70 + r('p1') * 60) + r('ph') * 6) + frame * 0.12;
			const y = y0 + 18 * Math.sin(frame / (50 + r('p2') * 40) + r('ph2') * 6) - frame * 0.05;
			const twinkle = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(frame / (12 + r('tw') * 18) + r('ph3') * 6));
			return <circle key={i} cx={x} cy={y} r={0.8 + r('s') * 2.4} fill="#FFF6DC" opacity={twinkle * (0.35 + 0.5 * r('o'))} />;
		})}
	</g>
);

// Out-of-focus props close to the camera.
export const Foreground: React.FC = () => (
	<g>
		<g transform="translate(-60 868) rotate(-4)">
			<rect x={0} y={44} width={340} height={280} rx={6} fill="#4FA79A" />
			{[
				[40, 110],
				[120, 190],
				[260, 120],
				[210, 250],
				[60, 260],
			].map(([x, y], i) => (
				<circle key={i} cx={x} cy={y} r={14} fill="#FFFFFF" opacity={0.45} />
			))}
			<rect x={-12} y={0} width={364} height={60} rx={6} fill="#62BBAD" />
			<rect x={148} y={0} width={46} height={324} fill="#F27A9B" />
			<path d="M 171 4 C 100 -70 64 -8 124 12 Z" fill="#F58BA8" />
			<path d="M 171 4 C 242 -70 278 -8 218 12 Z" fill="#F58BA8" />
			<circle cx={171} cy={4} r={16} fill="#E0678A" />
		</g>
		{[
			[1700, 1050, '#FFD166'],
			[1810, 1020, '#81D4C8'],
			[1560, 1070, '#F48FB1'],
			[1880, 1075, '#B39DDB'],
		].map(([x, y, c], i) => (
			<rect key={i} x={Number(x) - 16} y={Number(y) - 6} width={32} height={12} rx={2} transform={`rotate(${i * 37 - 20} ${x} ${y})`} fill={String(c)} />
		))}
	</g>
);

export const GradeBloom: React.FC = () => (
	<>
		<defs>
			<radialGradient id="gr-bloom" gradientUnits="userSpaceOnUse" cx={1660} cy={200} r={820}>
				<stop offset="0" stopColor="#FFF3D6" stopOpacity={0.38} />
				<stop offset="1" stopColor="#FFF3D6" stopOpacity={0} />
			</radialGradient>
		</defs>
		<rect width={1920} height={1080} fill="url(#gr-bloom)" />
	</>
);

export const GradeTint: React.FC = () => <rect width={1920} height={1080} fill="#FFB060" opacity={0.28} />;

export const GradeVignette: React.FC = () => (
	<>
		<defs>
			<radialGradient id="gr-vignette" cx="0.5" cy="0.5" r="0.72">
				<stop offset="0.55" stopColor="#1E0E04" stopOpacity={0} />
				<stop offset="1" stopColor="#1E0E04" stopOpacity={0.5} />
			</radialGradient>
		</defs>
		<rect width={1920} height={1080} fill="url(#gr-vignette)" />
	</>
);
