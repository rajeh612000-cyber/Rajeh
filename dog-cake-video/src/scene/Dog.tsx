import React from 'react';
import {random} from 'remotion';
import {clamp, rad, smoothstep} from '../lib/anim';
import {getPose, headToWorld, headTransform, Pose, REST} from '../lib/pose';
import {CakeChunk} from './Cake';
import {TABLE_Y} from './Table';
import timing from '../timing.json';

// ---------------------------------------------------------------------------
// Head geometry, in head space (eye at the origin, snout toward +x).

const HEAD =
	'M -190 -10 C -186 -58 -150 -100 -84 -110 C -30 -116 12 -100 28 -66 C 34 -48 38 -30 50 -22 ' +
	'C 96 -16 160 -12 200 -10 C 220 -9 234 0 234 14 C 234 28 226 36 214 38 C 208 44 208 60 202 72 ' +
	'C 180 92 134 100 96 98 C 78 96 64 92 56 86 C 30 108 -20 126 -70 124 C -130 122 -176 86 -186 40 ' +
	'C -190 22 -192 6 -190 -10 Z';
const TOPLINE = 'M -84 -110 C -30 -116 12 -100 28 -66 C 34 -48 38 -30 50 -22 C 96 -16 160 -12 200 -10';
const LIP_LINE = 'M 214 38 C 208 44 208 60 202 72 C 180 92 134 100 96 98 C 78 96 64 92 56 86 C 50 82 48 77 50 72';
const JAW = 'M 40 84 C 90 92 150 94 190 86 C 204 83 212 90 208 102 C 202 116 172 122 134 120 C 94 118 60 110 30 102 C 20 96 26 86 40 84 Z';
const HINGE = {x: 30, y: 78};
const NOSE = 'M 196 -14 C 218 -16 236 -4 237 12 C 238 28 228 38 214 38 C 204 38 198 30 197 20 C 196 8 190 -12 196 -14 Z';
const EYE = 'M -20 2 C -12 -14 12 -18 22 -6 C 16 8 -2 14 -20 2 Z';
const EAR =
	'M -46 -86 C -26 -62 -30 -10 -38 34 C -46 78 -54 112 -72 136 C -88 156 -120 156 -136 136 ' +
	'C -156 110 -166 70 -166 26 C -166 -20 -156 -62 -128 -86 C -106 -104 -68 -104 -46 -86 Z';
const EAR_TUFTS =
	'M -58 118 C -56 138 -64 156 -72 166 C -68 152 -78 148 -84 164 C -86 150 -96 150 -102 166 ' +
	'C -102 152 -112 152 -120 164 C -118 150 -128 146 -138 154 C -142 140 -150 130 -150 118 Z';
const EAR_PIVOT = {x: -88, y: -90};
const TONGUE = 'M 0 -11 C 22 -15 56 -16 74 -7 C 86 0 84 14 72 18 C 52 23 22 19 0 12 Z';

const rotateAround = (px: number, py: number, c: {x: number; y: number}, deg: number) => {
	const r = rad(deg);
	const dx = px - c.x;
	const dy = py - c.y;
	return {x: c.x + dx * Math.cos(r) - dy * Math.sin(r), y: c.y + dx * Math.sin(r) + dy * Math.cos(r)};
};

// ---------------------------------------------------------------------------
// Fur: fields of combed strands, batched into a few paths by color and width.

type Strand = {x: number; y: number; a: number; l: number; b: number; w: number; c: number};

const STRAND_COLORS: [string, number][] = [
	['#F6D39A', 0.34],
	['#94592A', 0.26],
	['#C4863F', 0.26],
	['#FFE7BE', 0.22],
];
const STRAND_WIDTHS = [1.2, 2];

const makeStrands = (
	seed: string,
	n: number,
	box: [number, number, number, number],
	angle: (x: number, y: number) => number,
	len: (x: number, y: number) => number,
): Strand[] =>
	Array.from({length: n}).map((_, i) => {
		const r = (k: string) => random(`${seed}-${k}-${i}`);
		const x = box[0] + r('x') * (box[2] - box[0]);
		const y = box[1] + r('y') * (box[3] - box[1]);
		return {
			x,
			y,
			a: rad(angle(x, y) + (r('a') - 0.5) * 16),
			l: len(x, y) * (0.7 + r('l') * 0.6),
			b: (r('b') - 0.5) * 0.35,
			w: r('w') > 0.6 ? 1 : 0,
			c: Math.floor(r('c') * 4),
		};
	});

const strandPaths = (strands: Strand[], offset?: (s: Strand) => [number, number]) => {
	const groups: string[][] = Array.from({length: 8}, () => []);
	for (const s of strands) {
		const [ox, oy] = offset ? offset(s) : [0, 0];
		const x = s.x + ox;
		const y = s.y + oy;
		const ex = x + Math.cos(s.a) * s.l;
		const ey = y + Math.sin(s.a) * s.l;
		const mx = (x + ex) / 2 - Math.sin(s.a) * s.l * s.b;
		const my = (y + ey) / 2 + Math.cos(s.a) * s.l * s.b;
		groups[s.c * 2 + s.w].push(`M${x.toFixed(1)} ${y.toFixed(1)}Q${mx.toFixed(1)} ${my.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`);
	}
	return groups.map((g) => g.join(''));
};

const Strands: React.FC<{paths: string[]}> = ({paths}) => (
	<>
		{paths.map((d, i) => (
			<path
				key={i}
				d={d}
				stroke={STRAND_COLORS[i >> 1][0]}
				strokeOpacity={STRAND_COLORS[i >> 1][1]}
				strokeWidth={STRAND_WIDTHS[i & 1]}
				strokeLinecap="round"
				fill="none"
			/>
		))}
	</>
);

const HEAD_STRANDS = strandPaths(
	makeStrands(
		'head',
		520,
		[-194, -114, 236, 128],
		(x, y) => (x > 50 ? 179 : 190 - 58 * smoothstep(-40, 100, y)),
		(x) => (x > 50 ? 9 : 17),
	),
);

const EAR_STRANDS = strandPaths(makeStrands('ear', 150, [-170, -100, -30, 170], () => 93, () => 34));

// Body strands live in world space around the rest pose and follow the neck as it moves.
const BODY_STRANDS = makeStrands(
	'body',
	900,
	[370, 330, 990, 760],
	(x, y) => 96 + 34 * (1 - smoothstep(620, 820, x)) * (1 - smoothstep(560, 700, y)),
	() => 30,
);

const CHEST_STRANDS = makeStrands('chest', 240, [720, 470, 990, 760], () => 98, () => 34).map((s) => ({
	...s,
	c: s.c % 2 === 0 ? 0 : 3,
}));

// Front paws resting on the table, planted while the body leans.
const PAWS = [
	{x: 958, y: 788, s: 0.9, far: true},
	{x: 874, y: 800, s: 1, far: false},
];
const LEG_STRANDS = makeStrands('leg', 120, [800, 660, 990, 800], () => 92, () => 22);

// ---------------------------------------------------------------------------

export const DogDefs: React.FC = () => (
	<defs>
		<filter id="fur" x="-15%" y="-15%" width="130%" height="130%">
			<feTurbulence type="fractalNoise" baseFrequency="0.09 0.06" numOctaves={2} seed={7} result="noise" />
			<feDisplacementMap in="SourceGraphic" in2="noise" scale={9} xChannelSelector="R" yChannelSelector="G" />
		</filter>
		<filter id="fur-strong" x="-25%" y="-25%" width="150%" height="150%">
			<feTurbulence type="fractalNoise" baseFrequency="0.11 0.06" numOctaves={2} seed={11} result="noise" />
			<feDisplacementMap in="SourceGraphic" in2="noise" scale={15} xChannelSelector="R" yChannelSelector="G" />
		</filter>
		<linearGradient id="dog-head" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stopColor="#EBB872" />
			<stop offset="0.45" stopColor="#D79D56" />
			<stop offset="1" stopColor="#B67A3A" />
		</linearGradient>
		<linearGradient id="dog-head-back" gradientUnits="userSpaceOnUse" x1={-192} y1={0} x2={40} y2={0}>
			<stop offset="0" stopColor="#6E3F16" stopOpacity={0.4} />
			<stop offset="1" stopColor="#6E3F16" stopOpacity={0} />
		</linearGradient>
		<linearGradient id="dog-jaw" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stopColor="#C88B47" />
			<stop offset="1" stopColor="#E9C58E" />
		</linearGradient>
		<linearGradient id="dog-ear" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stopColor="#9E6329" />
			<stop offset="0.5" stopColor="#BD7F3E" />
			<stop offset="1" stopColor="#D9A560" />
		</linearGradient>
		<linearGradient id="dog-ear-front" gradientUnits="userSpaceOnUse" x1={-56} y1={0} x2={-34} y2={0}>
			<stop offset="0" stopColor="#F7D095" stopOpacity={0} />
			<stop offset="1" stopColor="#F7D095" stopOpacity={0.55} />
		</linearGradient>
		<linearGradient id="dog-body" gradientUnits="userSpaceOnUse" x1={380} y1={0} x2={990} y2={0}>
			<stop offset="0" stopColor="#A06830" />
			<stop offset="0.5" stopColor="#C38440" />
			<stop offset="0.85" stopColor="#D89E55" />
			<stop offset="1" stopColor="#E5B06A" />
		</linearGradient>
		<linearGradient id="dog-body-ao" gradientUnits="userSpaceOnUse" x1={0} y1={600} x2={0} y2={TABLE_Y}>
			<stop offset="0" stopColor="#4A2508" stopOpacity={0} />
			<stop offset="1" stopColor="#4A2508" stopOpacity={0.35} />
		</linearGradient>
		<linearGradient id="dog-chest" x1="0" y1="0" x2="1" y2="0">
			<stop offset="0" stopColor="#F6DCA8" stopOpacity={0} />
			<stop offset="0.4" stopColor="#F4D7A2" stopOpacity={0.5} />
			<stop offset="0.8" stopColor="#F6DCA8" stopOpacity={1} />
			<stop offset="1" stopColor="#E9C084" stopOpacity={1} />
		</linearGradient>
		<linearGradient id="dog-leg" x1="0" y1="0" x2="1" y2="0">
			<stop offset="0" stopColor="#B87A38" />
			<stop offset="0.6" stopColor="#DCA863" />
			<stop offset="1" stopColor="#EDC282" />
		</linearGradient>
		<linearGradient id="dog-leg-fade" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stopColor="#FFFFFF" stopOpacity={0} />
			<stop offset="0.35" stopColor="#FFFFFF" stopOpacity={1} />
		</linearGradient>
		<mask id="dog-leg-mask" maskContentUnits="objectBoundingBox">
			<rect width={1} height={1} fill="url(#dog-leg-fade)" />
		</mask>
		<radialGradient id="dog-iris" cx="0.45" cy="0.6" r="0.6">
			<stop offset="0" stopColor="#8A5226" />
			<stop offset="0.7" stopColor="#4A260E" />
			<stop offset="1" stopColor="#1E0E05" />
		</radialGradient>
		<linearGradient id="dog-nose" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stopColor="#4A3A34" />
			<stop offset="1" stopColor="#120B09" />
		</linearGradient>
		<linearGradient id="dog-tongue" x1="0" y1="0" x2="1" y2="0">
			<stop offset="0" stopColor="#C85A70" />
			<stop offset="1" stopColor="#F28C9E" />
		</linearGradient>
		<linearGradient id="hat-shade" x1="0" y1="0" x2="1" y2="0">
			<stop offset="0" stopColor="#4A1030" stopOpacity={0.3} />
			<stop offset="0.6" stopColor="#4A1030" stopOpacity={0} />
			<stop offset="1" stopColor="#FFFFFF" stopOpacity={0.18} />
		</linearGradient>
		<clipPath id="dog-head-clip">
			<path d={HEAD} />
		</clipPath>
		<clipPath id="dog-jaw-clip">
			<path d={JAW} />
		</clipPath>
		<clipPath id="dog-ear-clip">
			<path d={EAR} />
		</clipPath>
		<clipPath id="dog-eye-clip">
			<path d={EYE} />
		</clipPath>
		<clipPath id="dog-body-clip">
			<rect x={-400} y={-400} width={2800} height={400 + TABLE_Y - 1} />
		</clipPath>
		<clipPath id="hat-clip">
			<path d="M -50 0 L -3 -148 Q 0 -152 3 -148 L 50 0 Q 0 14 -50 0 Z" />
		</clipPath>
	</defs>
);

// ---------------------------------------------------------------------------

const bodyShape = (pose: Pose, frame: number) => {
	const h = {x: pose.x, y: pose.y, rot: pose.rot};
	const lean = pose.lean;
	const breathe = Math.sin(frame / 20) * 1.5 + pose.pant.amount * 3 * Math.sin(pose.pant.phase);
	const nb = headToWorld(h, -176, -20);
	const n1 = headToWorld(h, -90, -80);
	const n2 = headToWorld(h, 40, 70);
	const jowl = headToWorld(h, 110, 112);
	const wx = 590 + lean * 0.5;
	const wy = 470;
	const cx = 905 + lean;
	const cy = 650 + breathe;
	return {
		cx,
		cy,
		nb,
		jowl,
		body:
			`M 400 820 C 410 700 470 540 ${wx} ${wy} ` +
			`C ${wx + 50} ${wy - 30} ${nb.x - 60} ${nb.y + 40} ${nb.x} ${nb.y} ` +
			`L ${n1.x} ${n1.y} L ${n2.x} ${n2.y} L ${jowl.x} ${jowl.y} ` +
			`C ${jowl.x - 10} ${jowl.y + 60} ${cx - 4} ${cy - 90} ${cx} ${cy} ` +
			`C ${cx + 14} ${cy + 50} ${cx + 16} ${cy + 110} ${cx + 6} ${cy + 180} L 400 ${cy + 190} Z`,
		chest:
			`M ${jowl.x - 70} ${jowl.y + 6} C ${jowl.x - 10} ${jowl.y + 40} ${cx + 4} ${cy - 70} ${cx + 2} ${cy + 6} ` +
			`C ${cx + 14} ${cy + 60} ${cx + 12} ${cy + 120} ${cx} ${cy + 180} L ${cx - 190} ${cy + 180} ` +
			`C ${cx - 170} ${cy + 100} ${cx - 150} ${cy + 10} ${cx - 125} ${cy - 50} ` +
			`C ${cx - 100} ${cy - 92} ${jowl.x - 110} ${jowl.y - 6} ${jowl.x - 70} ${jowl.y + 6} Z`,
		backline: `M 400 820 C 410 700 470 540 ${wx} ${wy} C ${wx + 50} ${wy - 30} ${nb.x - 60} ${nb.y + 40} ${nb.x} ${nb.y}`,
	};
};

export const DogBody: React.FC<{pose: Pose; frame: number}> = ({pose, frame}) => {
	const {body, chest, backline} = bodyShape(pose, frame);
	const lean = pose.lean;
	// Strands near the head move with it; the rest of the coat moves with the lean.
	const hdx = pose.x - REST.x;
	const hdy = pose.y - REST.y;
	const skin = (s: Strand): [number, number] => {
		const w = smoothstep(560, 840, s.x) * (1 - smoothstep(520, 680, s.y));
		return [lean * (0.3 + 0.7 * smoothstep(400, 900, s.x)) + hdx * w, hdy * w];
	};
	const jawShadow = headToWorld(pose, 40, 190);

	return (
		<g clipPath="url(#dog-body-clip)">
			<clipPath id="dog-body-shape">
				<path d={body} />
			</clipPath>
			<g filter="url(#fur)">
				<path d={body} fill="url(#dog-body)" />
			</g>
			<g clipPath="url(#dog-body-shape)">
				<Strands paths={strandPaths(BODY_STRANDS, skin)} />
				<path d={backline} stroke="#F4CB88" strokeWidth={18} opacity={0.3} fill="none" filter="url(#blur-8)" />
				<ellipse cx={jawShadow.x} cy={jawShadow.y} rx={130} ry={60} fill="#5A300F" opacity={0.3} filter="url(#blur-14)" />
				<rect x={-400} y={600} width={2800} height={TABLE_Y - 600} fill="url(#dog-body-ao)" />
			</g>
			<g filter="url(#fur-strong)">
				<path d={chest} fill="url(#dog-chest)" />
			</g>
			<g clipPath="url(#dog-body-shape)">
				<Strands paths={strandPaths(CHEST_STRANDS, skin)} />
			</g>
		</g>
	);
};

// Forelegs reach from the chest (which moves) to the paws (which stay put).
export const DogPaws: React.FC<{pose: Pose; frame: number}> = ({pose, frame}) => {
	const {cx, cy} = bodyShape(pose, frame);
	const legPaths = strandPaths(LEG_STRANDS, (s) => [pose.lean * smoothstep(800, 660, s.y) * 0.6, 0]);
	return (
		<g>
			{PAWS.map((p, i) => {
				const top = {x: cx - 70 + (p.far ? 40 : 0), y: cy - 10};
				const leg =
					`M ${top.x - 44} ${top.y} C ${top.x - 46} ${top.y + 80} ${p.x - 44} ${p.y - 60} ${p.x - 40 * p.s} ${p.y - 8} ` +
					`L ${p.x + 32 * p.s} ${p.y - 12} C ${p.x + 34} ${p.y - 60} ${top.x + 36} ${top.y + 80} ${top.x + 34} ${top.y} Z`;
				return (
					<g key={i}>
						<ellipse cx={p.x - 6} cy={p.y + 14 * p.s} rx={58 * p.s} ry={12 * p.s} fill="#2B1709" opacity={0.35} filter="url(#blur-8)" />
						<clipPath id={`dog-leg-clip-${i}`}>
							<path d={leg} />
						</clipPath>
						<g mask="url(#dog-leg-mask)">
							<g filter="url(#fur)">
								<path d={leg} fill={p.far ? '#C08344' : 'url(#dog-leg)'} />
							</g>
							{!p.far ? (
								<g clipPath={`url(#dog-leg-clip-${i})`}>
									<Strands paths={legPaths} />
								</g>
							) : null}
						</g>
						<g transform={`translate(${p.x} ${p.y}) scale(${p.s})`}>
							<g filter="url(#fur)">
								<path d="M -46 0 C -48 -20 -24 -30 2 -30 C 30 -30 50 -20 50 -2 C 50 12 28 16 2 16 C -24 16 -44 12 -46 0 Z" fill={p.far ? '#D09A58' : '#E9BC78'} />
							</g>
							<path d="M 14 -28 q 8 12 4 32 M 32 -22 q 7 10 3 26" stroke="#8E5A26" strokeWidth={2.4} opacity={0.5} fill="none" strokeLinecap="round" />
							<path d="M -42 8 C -18 18 24 18 46 6" stroke="#7A4A1E" strokeWidth={3} opacity={0.3} fill="none" strokeLinecap="round" />
							<path d="M -30 -22 C -6 -30 30 -28 44 -18" stroke="#FFE7BE" strokeWidth={3} opacity={0.45} fill="none" strokeLinecap="round" />
						</g>
					</g>
				);
			})}
		</g>
	);
};

// ---------------------------------------------------------------------------

const PartyHat: React.FC<{swing: number}> = ({swing}) => {
	const stripes: string[] = [];
	for (let k = -8; k < 10; k++) {
		stripes.push(`M -80 ${k * 26} L 80 ${k * 26 - 70}`);
	}
	return (
		<g transform="translate(-58 -108) rotate(-12)">
			<path d="M -50 0 L -3 -148 Q 0 -152 3 -148 L 50 0 Q 0 14 -50 0 Z" fill="#FF7EA6" />
			<g clipPath="url(#hat-clip)">
				<path d={stripes.join(' ')} stroke="#FFD166" strokeWidth={10} />
				{[
					[-18, -40],
					[16, -70],
					[-6, -100],
					[22, -22],
					[-30, -12],
					[4, -128],
				].map(([x, y], i) => (
					<circle key={i} cx={x} cy={y} r={4} fill="#FFFFFF" opacity={0.9} />
				))}
				<rect x={-60} y={-160} width={120} height={180} fill="url(#hat-shade)" />
			</g>
			<path
				d="M -54 2 Q -45 -8 -36 2 Q -27 -8 -18 2 Q -9 -8 0 2 Q 9 -8 18 2 Q 27 -8 36 2 Q 45 -8 54 2 Q 0 22 -54 2 Z"
				fill="#FFF3DC"
				filter="url(#fur-strong)"
			/>
			<g transform={`translate(0 -150) rotate(${swing})`}>
				<g filter="url(#fur-strong)">
					<circle cx={0} cy={-14} r={21} fill="#8ED3C0" />
					<circle cx={5} cy={-20} r={10} fill="#C9F1E6" opacity={0.8} />
				</g>
			</g>
		</g>
	);
};

const Eye: React.FC<{blink: number; squint: number; brow: number}> = ({blink, squint, brow}) => (
	<g transform="scale(1.18)">
		<path d="M -28 -26 C -12 -38 12 -38 28 -26" stroke="#8C5424" strokeWidth={5} strokeLinecap="round" opacity={0.45} fill="none" transform={`translate(0 ${-6 * brow})`} />
		<path d={EYE} fill="#1E0F07" />
		<g clipPath="url(#dog-eye-clip)">
			<circle cx={5} cy={-2} r={12} fill="url(#dog-iris)" />
			<circle cx={6} cy={-1} r={6.5} fill="#0A0503" />
			<circle cx={11} cy={-8} r={4.2} fill="#FFFFFF" opacity={0.95} />
			<circle cx={-2} cy={5} r={1.8} fill="#FFFFFF" opacity={0.5} />
			{/* upper lid (blink) and lower lid (happy squint) */}
			<rect x={-30} y={-24} width={60} height={4 + 30 * blink} fill="#B57A3B" />
			<ellipse cx={1} cy={44 - 26 * squint} rx={34} ry={30} fill="#C08545" />
		</g>
		<path d={EYE} fill="none" stroke="#150A04" strokeWidth={2.6} />
	</g>
);

export const DogHead: React.FC<{pose: Pose; frame: number}> = ({pose, frame}) => {
	const h = {x: pose.x, y: pose.y, rot: pose.rot};

	// Secondary motion: the ear and the pompom trail the head.
	const prev = getPose(Math.max(0, frame - 3));
	const vRot = pose.rot - prev.rot;
	const vY = pose.y - prev.y;
	const vX = pose.x - prev.x;
	const earSwing = clamp(-vRot * 1.4 - vY * 0.35 + vX * 0.15 + 2.5 * Math.sin(frame / 7) * pose.chewing, -24, 24);
	const pomSwing = clamp(-vRot * 2.4 - vX * 0.35 + 3 * Math.sin(frame / 5) * (pose.chewing + pose.pant.amount), -35, 35);

	const jaw = pose.jaw;
	const rj = (px: number, py: number) => rotateAround(px, py, HINGE, jaw);
	const D = rj(200, 88);
	const E = rj(150, 94);
	const F = rj(80, 92);
	const mouth = `M 36 80 L 150 66 L 206 46 L ${D.x} ${D.y} L ${E.x} ${E.y} L ${F.x} ${F.y} Z`;
	const nose = 1 + 0.06 * pose.sniff;
	const chunkBite = pose.chunk.index >= 0 ? timing.bites[pose.chunk.index] : null;

	return (
		<g transform={headTransform(h)}>
			{/* inside of the mouth */}
			<path d={mouth} fill="#5A1D22" />
			<g transform={`rotate(${jaw} ${HINGE.x} ${HINGE.y})`}>
				<path d="M 70 92 C 110 80 170 78 196 86 C 200 92 196 98 186 98 C 150 100 110 100 70 98 Z" fill="#D86A7C" />
				<path d="M 172 88 L 178 74 L 184 88 Z" fill="#F7F2E6" />
				<g filter="url(#fur)">
					<path d={JAW} fill="url(#dog-jaw)" />
				</g>
				<path d="M 40 84 C 90 92 150 94 190 86 C 202 84 208 88 209 96" stroke="#3B2417" strokeWidth={3} strokeLinecap="round" fill="none" />
			</g>

			{/* tongue hanging out while panting */}
			{pose.pant.amount > 0 ? (
				<g transform={`translate(196 90) rotate(${64 + 5 * Math.sin(pose.pant.phase)}) scale(${pose.pant.amount} ${0.9 + 0.1 * pose.pant.amount})`}>
					<path d={TONGUE} fill="url(#dog-tongue)" />
					<path d="M 8 2 C 30 4 52 4 70 3" stroke="#B24A60" strokeWidth={2} opacity={0.6} fill="none" />
				</g>
			) : null}

			{/* skull and muzzle */}
			<g filter="url(#fur)">
				<path d={HEAD} fill="url(#dog-head)" />
				<g clipPath="url(#dog-head-clip)">
					<rect x={-200} y={-120} width={260} height={260} fill="url(#dog-head-back)" />
					<ellipse cx={140} cy={4} rx={100} ry={36} fill="#F3CE92" opacity={0.5} filter="url(#blur-8)" />
					<ellipse cx={20} cy={84} rx={100} ry={44} fill="#A5692F" opacity={0.32} filter="url(#blur-8)" />
					<ellipse cx={4} cy={-40} rx={42} ry={16} fill="#F6D29A" opacity={0.45} filter="url(#blur-4)" />
					<ellipse cx={-36} cy={16} rx={26} ry={120} fill="#6B3B12" opacity={0.3} filter="url(#blur-8)" />
				</g>
				<path d={TOPLINE} stroke="#FFE2AE" strokeWidth={4} opacity={0.55} fill="none" />
			</g>
			<g clipPath="url(#dog-head-clip)">
				<Strands paths={HEAD_STRANDS} />
			</g>

			<ellipse cx={0} cy={0} rx={34} ry={26} fill="#7C4A1E" opacity={0.28} filter="url(#blur-4)" />
			<Eye blink={pose.blink} squint={pose.squint} brow={pose.brow} />

			<g transform={`translate(216 12) scale(${nose}) translate(-216 -12)`}>
				<path d={NOSE} fill="url(#dog-nose)" />
				<path d="M 222 16 C 229 14 234 20 231 26 C 226 28 222 24 222 16 Z" fill="#050303" />
				<ellipse cx={212} cy={-6} rx={11} ry={4.5} transform="rotate(8 212 -6)" fill="#FFFFFF" opacity={0.32} />
			</g>
			<path d="M 216 38 L 210 48" stroke="#2A1810" strokeWidth={2.4} strokeLinecap="round" />
			<path d={LIP_LINE} stroke="#3B2417" strokeWidth={3.2} strokeLinecap="round" fill="none" />
			{[
				[150, 30],
				[164, 40],
				[178, 30],
				[158, 54],
				[178, 50],
			].map(([x, y], i) => (
				<circle key={i} cx={x} cy={y} r={2.3} fill="#6E4020" opacity={0.55} />
			))}
			<path d="M 178 30 q 34 2 60 16 M 178 50 q 32 8 54 28 M 164 40 q 34 10 58 34" stroke="#3B2A1E" strokeWidth={1.1} opacity={0.3} fill="none" />

			{/* souvenirs of the cake */}
			{pose.frosting > 0.01 ? (
				<g transform={`translate(210 -16) scale(${pose.frosting})`}>
					<path d="M -20 2 C -18 -12 2 -18 14 -10 C 26 -4 26 8 16 12 C 6 16 -10 14 -18 10 C -22 8 -22 5 -20 2 Z" fill="#FFF7EC" />
					<path d="M -10 -6 C -2 -11 8 -10 14 -5 C 8 -6 0 -5 -6 -2 Z" fill="#F59BBE" />
					<ellipse cx={6} cy={-5} rx={5} ry={2.4} fill="#FFFFFF" />
				</g>
			) : null}
			{pose.sprinkles >= 1 ? <path d="M 168 -20 l 8 -3" stroke="#FF6B8B" strokeWidth={3.2} strokeLinecap="round" /> : null}
			{pose.sprinkles >= 2 ? <path d="M 146 -14 l 7 3 M 186 4 l 6 -5" stroke="#5EC2FF" strokeWidth={3.2} strokeLinecap="round" /> : null}
			{pose.sprinkles >= 3 ? <path d="M 126 -16 l 8 1 M 196 -24 l 3 7" stroke="#FFD45C" strokeWidth={3.2} strokeLinecap="round" /> : null}
			{pose.sprinkles >= 1 ? (
				<g fill="#EDC476" stroke="#C49446" strokeWidth={0.8}>
					<circle cx={198} cy={70} r={3.6} />
					<circle cx={176} cy={90} r={2.8} />
					{pose.sprinkles >= 2 ? <circle cx={156} cy={98} r={3.2} /> : null}
				</g>
			) : null}

			{chunkBite && pose.chunk.scale > 0 ? (
				<g transform="translate(206 84) rotate(-10)">
					<CakeChunk size={chunkBite.radius * 0.95 * pose.chunk.scale} />
				</g>
			) : null}

			{/* quick lick over the nose */}
			{pose.lick.ext > 0.01 ? (
				<g transform={`translate(204 72) rotate(${pose.lick.angle}) scale(${pose.lick.ext} ${0.85 + 0.15 * pose.lick.ext})`}>
					<path d={TONGUE} fill="url(#dog-tongue)" />
					<path d="M 8 2 C 30 4 52 4 70 3" stroke="#B24A60" strokeWidth={2} opacity={0.6} fill="none" />
					<ellipse cx={44} cy={-6} rx={16} ry={3} fill="#FFFFFF" opacity={0.3} />
				</g>
			) : null}

			{/* ear */}
			<g transform={`rotate(${earSwing} ${EAR_PIVOT.x} ${EAR_PIVOT.y})`}>
				<ellipse cx={-28} cy={30} rx={26} ry={90} fill="#5A300F" opacity={0.35} filter="url(#blur-8)" />
				<g filter="url(#fur-strong)">
					<path d={EAR} fill="url(#dog-ear)" />
					<path d={EAR_TUFTS} fill="#D9A560" />
				</g>
				<g clipPath="url(#dog-ear-clip)">
					<Strands paths={EAR_STRANDS} />
					<rect x={-80} y={-100} width={60} height={300} fill="url(#dog-ear-front)" />
				</g>
			</g>

			<PartyHat swing={pomSwing} />
		</g>
	);
};
