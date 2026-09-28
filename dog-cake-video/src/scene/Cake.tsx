import React from 'react';
import {random} from 'remotion';
import timing from '../timing.json';
import {rad} from '../lib/anim';
import type {Bite} from '../lib/pose';

export const CAKE = {cx: 1330, top: 630, base: 880, rx: 230, ryTop: 44, ryBase: 54};
const {cx: CX, top: TOP, base: BASE, rx: RX, ryTop: RYT, ryBase: RYB} = CAKE;
const LEFT = CX - RX;
const RIGHT = CX + RX;

// y of the front (camera-facing) half of an ellipse on the cake's axis
export const frontY = (x: number, cy: number, ry: number) =>
	cy + ry * Math.sqrt(Math.max(0, 1 - ((x - CX) / RX) ** 2));

const SIDE = `M ${LEFT} ${TOP} L ${LEFT} ${BASE} A ${RX} ${RYB} 0 0 0 ${RIGHT} ${BASE} L ${RIGHT} ${TOP} A ${RX} ${RYT} 0 0 1 ${LEFT} ${TOP} Z`;
export const CAKE_SILHOUETTE = `M ${LEFT} ${TOP} A ${RX} ${RYT} 0 0 1 ${RIGHT} ${TOP} L ${RIGHT} ${BASE} A ${RX} ${RYB} 0 0 1 ${LEFT} ${BASE} Z`;

// Pink glaze running down the side in drips.
const DRIPS = Array.from({length: 17}).map((_, i) => {
	const t = (i + 0.5 + (random(`drip-x-${i}`) - 0.5) * 0.6) / 17;
	const x = LEFT + 8 + t * (RX * 2 - 16);
	const facing = Math.sqrt(Math.max(0.05, 1 - ((x - CX) / RX) ** 2));
	return {
		x,
		w: (9 + random(`drip-w-${i}`) * 8) * (0.45 + 0.55 * facing),
		len: 14 + random(`drip-l-${i}`) ** 1.4 * 72,
	};
});

const dripBottom = (x: number) => {
	let d = 0;
	for (const dr of DRIPS) {
		const u = (x - dr.x) / dr.w;
		if (Math.abs(u) < 1) {
			d = Math.max(d, dr.len * Math.sqrt(1 - u * u));
		}
	}
	return frontY(x, TOP, RYT) + 12 + 2.5 * Math.sin(x / 11) + d;
};

const GLAZE_SIDE = (() => {
	const pts: string[] = [];
	for (let x = LEFT; x <= RIGHT; x += 3) {
		pts.push(`${x.toFixed(1)} ${dripBottom(x).toFixed(1)}`);
	}
	return `M ${LEFT} ${TOP} L ${pts.join(' L ')} L ${RIGHT} ${TOP} A ${RX} ${RYT} 0 0 1 ${LEFT} ${TOP} Z`;
})();

const SPRINKLE_COLORS = ['#FF6B8B', '#5EC2FF', '#FFD45C', '#7ED67A', '#B98CFF', '#FF9F5A', '#FFFFFF'];

const SPRINKLES = (() => {
	const byColor: string[][] = SPRINKLE_COLORS.map(() => []);
	for (let i = 0; i < 130; i++) {
		const r = Math.sqrt(random(`sp-r-${i}`)) * 0.92;
		const th = random(`sp-t-${i}`) * Math.PI * 2;
		const x = CX + Math.cos(th) * r * RX;
		const y = TOP + Math.sin(th) * r * RYT;
		const a = random(`sp-a-${i}`) * Math.PI;
		const dx = Math.cos(a) * 5.5;
		const dy = Math.sin(a) * 5.5 * 0.42;
		byColor[i % SPRINKLE_COLORS.length].push(`M ${(x - dx).toFixed(1)} ${(y - dy).toFixed(1)} L ${(x + dx).toFixed(1)} ${(y + dy).toFixed(1)}`);
	}
	for (let i = 0; i < 26; i++) {
		const x = LEFT + 14 + random(`sps-x-${i}`) * (RX * 2 - 28);
		const y = frontY(x, TOP, RYT) + 6 + random(`sps-y-${i}`) * 18;
		const a = random(`sps-a-${i}`) * Math.PI;
		const dx = Math.cos(a) * 5;
		const dy = Math.sin(a) * 5;
		byColor[i % SPRINKLE_COLORS.length].push(`M ${(x - dx).toFixed(1)} ${(y - dy).toFixed(1)} L ${(x + dx).toFixed(1)} ${(y + dy).toFixed(1)}`);
	}
	return byColor.map((d) => d.join(' '));
})();

const ROSETTES = Array.from({length: 12})
	.map((_, i) => {
		const th = (i / 12) * Math.PI * 2 + 0.2;
		return {
			x: CX + Math.cos(th) * RX * 0.84,
			y: TOP + Math.sin(th) * RYT * 0.8,
			s: 1 + 0.1 * Math.sin(th),
			dot: SPRINKLE_COLORS[(i * 3) % 6],
		};
	})
	.sort((a, b) => a.y - b.y);

const BEADS = Array.from({length: 30})
	.map((_, i) => {
		const th = (i / 29) * Math.PI;
		return {x: CX + Math.cos(th) * RX, y: BASE + Math.sin(th) * RYB, r: 11 + 3 * Math.sin(th)};
	})
	.sort((a, b) => a.y - b.y);

const SPATULA = Array.from({length: 11}).map((_, i) => {
	const y = TOP + 44 + i * 20 + random(`spt-${i}`) * 8;
	const ry = RYT + (RYB - RYT) * ((y - TOP) / (BASE - TOP));
	return {y, ry, light: i % 2 === 0};
});

const PORES = (() => {
	const d: string[] = [];
	for (let i = 0; i < 420; i++) {
		const x = LEFT - 20 + random(`po-x-${i}`) * (RX + 60);
		const y = TOP - 50 + random(`po-y-${i}`) * (BASE - TOP + 60);
		const r = 1.2 + random(`po-r-${i}`) * 2.6;
		d.push(`M ${(x - r).toFixed(1)} ${y.toFixed(1)} a ${r.toFixed(1)} ${(r * 0.8).toFixed(1)} 0 1 0 ${(2 * r).toFixed(1)} 0 a ${r.toFixed(1)} ${(r * 0.8).toFixed(1)} 0 1 0 ${(-2 * r).toFixed(1)} 0`);
	}
	return d.join(' ');
})();

const CANDLES = [
	{x: 1422, y: 612, h: 72, c: '#8FD3F4'},
	{x: 1490, y: 626, h: 62, c: '#FFB3C8'},
];

type Circle = {x: number; y: number; r: number};

// A bite: a scalloped scoop whose tooth marks face into the cake,
// opening outward past the cake's edge toward the dog.
const biteCircles = (b: Bite): Circle[] => {
	const [bx, by] = b.center;
	const R = b.radius;
	const [ox, oy] = b.open;
	const cs: Circle[] = [
		{x: bx - R * 0.1, y: by, r: R * 0.74},
		{x: bx + ox * R * 0.9, y: by + oy * R * 0.9, r: R * 0.85},
	];
	const inward = Math.atan2(-oy, -ox);
	for (let k = 0; k < 7; k++) {
		const a = inward + rad(-78 + (156 * k) / 6);
		cs.push({x: bx + Math.cos(a) * R * 0.6, y: by + Math.sin(a) * R * 0.6, r: R * 0.32});
	}
	return cs;
};

const Circles: React.FC<{cs: Circle[]; fill: string}> = ({cs, fill}) => (
	<>
		{cs.map((c, i) => (
			<circle key={i} cx={c.x} cy={c.y} r={c.r} fill={fill} />
		))}
	</>
);

const Candle: React.FC<{i: number; frame: number}> = ({i, frame}) => {
	const {x, y, h, c} = CANDLES[i];
	const flick = 1 + 0.08 * Math.sin(frame * 1.7 + i * 2) + 0.05 * Math.sin(frame * 3.1 + i);
	const sway = 4 * Math.sin(frame / 7 + i * 1.3) + 2 * Math.sin(frame / 3.3 + i);
	const stripes: string[] = [];
	for (let k = -2; k < 10; k++) {
		stripes.push(`M ${x - 8} ${y - h + k * 12} L ${x + 8} ${y - h + k * 12 - 10}`);
	}
	return (
		<g>
			<clipPath id={`ck-candle-${i}`}>
				<rect x={x - 6} y={y - h} width={12} height={h} rx={3} />
			</clipPath>
			<rect x={x - 6} y={y - h} width={12} height={h} rx={3} fill={c} />
			<path d={stripes.join(' ')} stroke="#FFFFFF" strokeWidth={4} opacity={0.85} clipPath={`url(#ck-candle-${i})`} />
			<rect x={x - 6} y={y - h} width={4} height={h} fill="#000" opacity={0.08} clipPath={`url(#ck-candle-${i})`} />
			<path d={`M ${x} ${y - h} l 0 -9`} stroke="#3A2A20" strokeWidth={2} />
			<g transform={`translate(${x} ${y - h - 8}) skewX(${sway}) scale(1 ${flick})`}>
				<circle r={46} fill="url(#ck-glow)" opacity={0.9} />
				<path d="M 0 -32 C 9 -19 11 -6 7.5 2 C 4 8 -4 8 -7.5 2 C -11 -6 -9 -19 0 -32 Z" fill="url(#ck-flame)" />
				<ellipse cx={0} cy={-3} rx={3} ry={7.5} fill="#FFFFFF" opacity={0.9} />
			</g>
		</g>
	);
};

export const Cake: React.FC<{frame: number}> = ({frame}) => {
	const active = timing.bites.filter((b) => frame > b.chomp);
	const cut = active.flatMap(biteCircles);
	const box = {x: -500, y: -500, width: 3000, height: 2200};

	return (
		<g>
			<defs>
				<linearGradient id="ck-side" gradientUnits="userSpaceOnUse" x1={LEFT} y1={0} x2={RIGHT} y2={0}>
					<stop offset="0" stopColor="#D2BA99" />
					<stop offset="0.1" stopColor="#E8D7BF" />
					<stop offset="0.35" stopColor="#F8EEE0" />
					<stop offset="0.62" stopColor="#FFFDF7" />
					<stop offset="0.86" stopColor="#EEE0CC" />
					<stop offset="1" stopColor="#CBB290" />
				</linearGradient>
				<linearGradient id="ck-side-ao" gradientUnits="userSpaceOnUse" x1={0} y1={TOP} x2={0} y2={BASE + RYB}>
					<stop offset="0" stopColor="#7A5A32" stopOpacity={0} />
					<stop offset="0.75" stopColor="#7A5A32" stopOpacity={0.06} />
					<stop offset="1" stopColor="#7A5A32" stopOpacity={0.22} />
				</linearGradient>
				<linearGradient id="ck-glaze-side" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#F7A3C4" />
					<stop offset="1" stopColor="#E26C9C" />
				</linearGradient>
				<linearGradient id="ck-edge" gradientUnits="userSpaceOnUse" x1={LEFT} y1={0} x2={RIGHT} y2={0}>
					<stop offset="0" stopColor="#5A2A38" stopOpacity={0.3} />
					<stop offset="0.18" stopColor="#5A2A38" stopOpacity={0} />
					<stop offset="0.85" stopColor="#5A2A38" stopOpacity={0} />
					<stop offset="1" stopColor="#5A2A38" stopOpacity={0.26} />
				</linearGradient>
				<radialGradient id="ck-glaze-top" gradientUnits="userSpaceOnUse" cx={CX + 70} cy={TOP - 14} r={270}>
					<stop offset="0" stopColor="#FFD3E4" />
					<stop offset="0.5" stopColor="#F7A5C5" />
					<stop offset="1" stopColor="#E97EAA" />
				</radialGradient>
				<linearGradient id="ck-sponge" gradientUnits="userSpaceOnUse" x1={0} y1={TOP - 40} x2={0} y2={BASE}>
					<stop offset="0" stopColor="#F7D992" />
					<stop offset="1" stopColor="#E3B465" />
				</linearGradient>
				<radialGradient id="ck-sponge-dark">
					<stop offset="0.45" stopColor="#8A5518" stopOpacity={0.5} />
					<stop offset="1" stopColor="#8A5518" stopOpacity={0} />
				</radialGradient>
				<radialGradient id="ck-bead" cx="0.62" cy="0.32" r="0.75">
					<stop offset="0" stopColor="#FFFFFF" />
					<stop offset="0.55" stopColor="#F4EADC" />
					<stop offset="1" stopColor="#CDB797" />
				</radialGradient>
				<radialGradient id="ck-rosette" cx="0.6" cy="0.35" r="0.7">
					<stop offset="0" stopColor="#FFFFFF" />
					<stop offset="0.6" stopColor="#F6ECDF" />
					<stop offset="1" stopColor="#D7C4AA" />
				</radialGradient>
				<linearGradient id="ck-plate" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#FFFFFF" />
					<stop offset="1" stopColor="#E3E5E1" />
				</linearGradient>
				<radialGradient id="ck-flame" cx="0.5" cy="0.75" r="0.75">
					<stop offset="0" stopColor="#FFFFFF" />
					<stop offset="0.3" stopColor="#FFF1A8" />
					<stop offset="0.7" stopColor="#FFB84D" />
					<stop offset="1" stopColor="#FF7A2E" stopOpacity={0.6} />
				</radialGradient>
				<radialGradient id="ck-glow">
					<stop offset="0" stopColor="#FFE6A6" stopOpacity={0.55} />
					<stop offset="1" stopColor="#FFB85C" stopOpacity={0} />
				</radialGradient>
				<clipPath id="ck-clip">
					<path d={CAKE_SILHOUETTE} />
				</clipPath>
				<clipPath id="ck-side-clip">
					<path d={SIDE} />
				</clipPath>
				{/* The bitten area, shrunk as a whole: a thin rim of frosting... */}
				<filter id="ck-erode-rim" x="-20%" y="-20%" width="140%" height="140%">
					<feMorphology operator="erode" radius={7} />
				</filter>
				{/* ...and the see-through part, pushed up and out so a band of sponge
				    stays visible along the inner, tooth-marked edge. */}
				<filter id="ck-erode-hole" x="-20%" y="-20%" width="140%" height="140%">
					<feMorphology operator="erode" radius={16} />
					<feOffset dx={-12} dy={-18} />
				</filter>
				<mask id="ck-outer" maskUnits="userSpaceOnUse" {...box}>
					<rect {...box} fill="white" />
					<Circles cs={cut} fill="black" />
				</mask>
				<mask id="ck-inner" maskUnits="userSpaceOnUse" {...box}>
					<rect {...box} fill="black" />
					<Circles cs={cut} fill="white" />
					<g filter="url(#ck-erode-hole)">
						<Circles cs={cut} fill="black" />
					</g>
				</mask>
				<mask id="ck-sponge-mask" maskUnits="userSpaceOnUse" {...box}>
					<rect {...box} fill="black" />
					<g filter="url(#ck-erode-rim)">
						<Circles cs={cut} fill="white" />
					</g>
					<g filter="url(#ck-erode-hole)">
						<Circles cs={cut} fill="black" />
					</g>
				</mask>
			</defs>

			{/* plate */}
			<ellipse cx={CX - 44} cy={922} rx={330} ry={70} fill="#2B1709" opacity={0.4} filter="url(#blur-14)" />
			<ellipse cx={CX} cy={908} rx={302} ry={66} fill="#C4C6C0" />
			<ellipse cx={CX} cy={899} rx={302} ry={64} fill="url(#ck-plate)" />
			<ellipse cx={CX} cy={902} rx={248} ry={50} fill="#EBEBE6" />
			<path d={`M ${CX - 292} 899 A 292 58 0 0 0 ${CX + 292} 899`} stroke="#FFFFFF" strokeWidth={3} fill="none" opacity={0.75} />
			<ellipse cx={CX - 28} cy={BASE + 24} rx={240} ry={46} fill="#5E4A36" opacity={0.35} filter="url(#blur-8)" />

			{/* exposed inside of the cake where it has been bitten */}
			<g clipPath="url(#ck-clip)">
				<g mask="url(#ck-inner)">
					<rect x={LEFT - 100} y={TOP - 100} width={RX * 2 + 200} height={BASE - TOP + 260} fill="#FFF3E6" />
				</g>
				<g mask="url(#ck-sponge-mask)">
					<rect x={LEFT - 100} y={TOP - 100} width={RX * 2 + 200} height={BASE - TOP + 260} fill="url(#ck-sponge)" />
					<rect x={LEFT - 100} y={704} width={RX * 2 + 200} height={13} fill="#FFF5E4" />
					<rect x={LEFT - 100} y={717} width={RX * 2 + 200} height={6} fill="#D8446C" />
					<rect x={LEFT - 100} y={790} width={RX * 2 + 200} height={13} fill="#FFF5E4" />
					<rect x={LEFT - 100} y={803} width={RX * 2 + 200} height={6} fill="#D8446C" />
					<path d={PORES} fill="#C98F3E" opacity={0.5} />
					{active.map((b, i) => (
						<circle
							key={i}
							cx={b.center[0] - 14}
							cy={b.center[1] - 20}
							r={b.radius * 1.15}
							fill="url(#ck-sponge-dark)"
						/>
					))}
				</g>
			</g>

			{/* the cake itself */}
			<g mask="url(#ck-outer)">
				<path d={SIDE} fill="url(#ck-side)" />
				<g clipPath="url(#ck-side-clip)">
					{SPATULA.map((s, i) => (
						<path
							key={i}
							d={`M ${LEFT + 4} ${s.y} A ${RX - 4} ${s.ry} 0 0 0 ${RIGHT - 4} ${s.y}`}
							stroke={s.light ? '#FFFFFF' : '#B99C78'}
							strokeWidth={s.light ? 2.4 : 1.4}
							opacity={s.light ? 0.4 : 0.16}
							fill="none"
						/>
					))}
					<rect x={LEFT} y={TOP} width={RX * 2} height={BASE - TOP + RYB} fill="url(#ck-side-ao)" />
				</g>
				<path d={GLAZE_SIDE} fill="url(#ck-glaze-side)" />
				{DRIPS.filter((d) => d.len > 24).map((d, i) => {
					const y0 = frontY(d.x, TOP, RYT) + 14;
					return (
						<path
							key={i}
							d={`M ${d.x + d.w * 0.38} ${y0} L ${d.x + d.w * 0.38} ${y0 + d.len * 0.72}`}
							stroke="#FFFFFF"
							strokeWidth={2.2}
							strokeLinecap="round"
							opacity={0.45}
						/>
					);
				})}
				<path d={SIDE} fill="url(#ck-edge)" />
				{BEADS.map((b, i) => (
					<ellipse key={i} cx={b.x} cy={b.y} rx={b.r} ry={b.r * 0.86} fill="url(#ck-bead)" />
				))}
				<ellipse cx={CX} cy={TOP} rx={RX} ry={RYT} fill="url(#ck-glaze-top)" />
				<ellipse cx={CX + 80} cy={TOP - 14} rx={120} ry={13} fill="#FFFFFF" opacity={0.3} filter="url(#blur-4)" />
				{SPRINKLES.map((d, i) => (
					<path key={i} d={d} stroke={SPRINKLE_COLORS[i]} strokeWidth={3.4} strokeLinecap="round" />
				))}
				{ROSETTES.map((r, i) => (
					<g key={i} transform={`translate(${r.x} ${r.y}) scale(${r.s} ${r.s * 0.86})`}>
						<ellipse cx={0} cy={6} rx={21} ry={9} fill="#7A4A5A" opacity={0.18} />
						<circle r={19} fill="url(#ck-rosette)" />
						<path d="M -12 -1 C -10 -14 8 -16 12 -4 C 14 6 2 12 -4 8 C -9 4 -6 -4 0 -4" stroke="#DCCAB2" strokeWidth={2.2} fill="none" />
						<circle cx={-1} cy={-5} r={3.4} fill={r.dot} />
					</g>
				))}
				<Candle i={0} frame={frame} />
				<Candle i={1} frame={frame} />
			</g>
		</g>
	);
};

// A bitten-off piece, drawn in the dog's mouth.
export const CakeChunk: React.FC<{size: number}> = ({size}) => {
	const s = size / 50;
	const body = 'M -26 -10 L -8 -26 L 18 -24 L 30 -6 L 24 16 L 2 26 L -20 18 Z';
	return (
		<g transform={`scale(${s})`}>
			<path d={body} fill="#F0C878" stroke="#F0C878" strokeWidth={6} strokeLinejoin="round" />
			<path d="M -24 4 L 27 0 L 26 7 L -22 11 Z" fill="#FFF4E2" />
			<path d="M -22 11 L 26 7 L 25 10 L -21 14 Z" fill="#D8446C" />
			<path d="M -29 -10 L -9 -29 L 19 -27 L 23 -17 C 6 -19 -10 -13 -26 -2 Z" fill="#F48BB3" stroke="#F48BB3" strokeWidth={3} strokeLinejoin="round" />
			<path d="M 19 -26 L 33 -6 L 27 17 L 20 15 L 25 -5 L 14 -20 Z" fill="#FFF6EA" />
			<circle cx={-8} cy={-4} r={1.8} fill="#C98F3E" opacity={0.6} />
			<circle cx={6} cy={18} r={2.2} fill="#C98F3E" opacity={0.6} />
			<circle cx={-14} cy={20} r={1.6} fill="#C98F3E" opacity={0.6} />
			<path d="M -12 -20 l 7 -2 M 4 -22 l 5 3" stroke="#5EC2FF" strokeWidth={2.6} strokeLinecap="round" />
		</g>
	);
};
