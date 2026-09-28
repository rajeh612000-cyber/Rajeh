import React from 'react';
import {random} from 'remotion';

// Far edge of the table top. The dog stands behind it.
export const TABLE_Y = 760;

const GRAIN = (() => {
	const lines: {d: string; w: number; c: string; o: number}[] = [];
	for (let i = 0; i < 70; i++) {
		const t = (i + random(`gr-t-${i}`)) / 70;
		const y0 = TABLE_Y + 6 + 330 * t ** 1.5;
		const amp = 1.5 + 5 * t + random(`gr-a-${i}`) * 3;
		const period = 260 + random(`gr-p-${i}`) * 300;
		const ph = random(`gr-ph-${i}`) * 10;
		const pts: string[] = [];
		for (let x = -220; x <= 2140; x += 40) {
			pts.push(`${x} ${(y0 + amp * Math.sin(x / period + ph)).toFixed(1)}`);
		}
		const dark = random(`gr-c-${i}`) > 0.35;
		lines.push({
			d: `M ${pts.join(' L ')}`,
			w: 0.8 + 2.2 * t,
			c: dark ? '#4E2E19' : '#C99462',
			o: dark ? 0.16 + 0.14 * random(`gr-o-${i}`) : 0.14,
		});
	}
	return lines;
})();

const SEAMS = [796, 852, 940, 1068];

const CONFETTI = Array.from({length: 70}).flatMap((_, i) => {
	const x = -120 + random(`cf-x-${i}`) * 2160;
	const y = TABLE_Y + 14 + random(`cf-y-${i}`) ** 1.2 * 300;
	// keep the plate area clear
	if (Math.abs(x - 1330) < 330 && y < 980) {
		return [];
	}
	const depth = (y - TABLE_Y) / 320;
	const s = 7 + 12 * depth;
	const colors = ['#F48FB1', '#81D4C8', '#FFD166', '#B39DDB', '#FFAB76', '#FFFFFF'];
	return [{x, y, s, rot: random(`cf-r-${i}`) * 180, c: colors[i % colors.length], round: random(`cf-k-${i}`) > 0.7}];
});

export const Table: React.FC = () => (
	<g>
		<defs>
			<linearGradient id="tb-wood" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stopColor="#AE7C4E" />
				<stop offset="0.12" stopColor="#9A683F" />
				<stop offset="0.5" stopColor="#7E5032" />
				<stop offset="1" stopColor="#5E3920" />
			</linearGradient>
			<radialGradient id="tb-sheen" cx="0.5" cy="0.5" r="0.5">
				<stop offset="0" stopColor="#FFF3DA" stopOpacity={0.32} />
				<stop offset="1" stopColor="#FFF3DA" stopOpacity={0} />
			</radialGradient>
		</defs>
		<rect x={-300} y={TABLE_Y} width={2520} height={620} fill="url(#tb-wood)" />
		{GRAIN.map((g, i) => (
			<path key={i} d={g.d} stroke={g.c} strokeWidth={g.w} opacity={g.o} fill="none" />
		))}
		{SEAMS.map((y, i) => (
			<g key={i}>
				<rect x={-300} y={y} width={2520} height={1.5 + i} fill="#3D2313" opacity={0.55} />
				<rect x={-300} y={y + 1.5 + i} width={2520} height={1 + i * 0.5} fill="#C08956" opacity={0.35} />
			</g>
		))}
		<ellipse cx={1480} cy={818} rx={760} ry={70} fill="url(#tb-sheen)" />
		{/* bevel on the far edge */}
		<rect x={-300} y={TABLE_Y} width={2520} height={4} fill="#DBAA7A" />
		<rect x={-300} y={TABLE_Y + 4} width={2520} height={3} fill="#6A4126" opacity={0.5} />
		{CONFETTI.map((c, i) =>
			c.round ? (
				<ellipse key={i} cx={c.x} cy={c.y} rx={c.s * 0.45} ry={c.s * 0.22} fill={c.c} opacity={0.92} />
			) : (
				<rect
					key={i}
					x={c.x - c.s / 2}
					y={c.y - c.s * 0.14}
					width={c.s}
					height={c.s * 0.28}
					rx={1}
					transform={`rotate(${c.rot * 0.25 - 20} ${c.x} ${c.y})`}
					fill={c.c}
					opacity={0.92}
				/>
			),
		)}
	</g>
);
