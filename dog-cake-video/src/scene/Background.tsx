import React from 'react';
import {random} from 'remotion';

// Everything here sits far behind the subject and is rendered out of focus.

const Kitchen: React.FC = () => {
	const tiles: string[] = [];
	for (let row = 0; row < 7; row++) {
		const y = 176 + row * 32;
		tiles.push(`M -200 ${y} L 660 ${y}`);
		for (let x = -200 + (row % 2) * 36; x < 660; x += 72) {
			tiles.push(`M ${x} ${y} L ${x} ${y + 32}`);
		}
	}
	return (
		<g>
			{/* upper cabinets */}
			<rect x={-200} y={-200} width={860} height={370} fill="#9CB39B" />
			{[0, 1, 2, 3].map((i) => (
				<g key={i}>
					<rect x={-190 + i * 212} y={-150} width={196} height={300} rx={6} fill="#A7BDA5" />
					<rect x={-172 + i * 212} y={-132} width={160} height={264} rx={4} fill="none" stroke="#86A086" strokeWidth={6} />
					<circle cx={-10 + i * 212 - (i % 2) * 150} cy={130} r={7} fill="#E3D3AE" />
				</g>
			))}
			{/* backsplash */}
			<rect x={-200} y={170} width={860} height={228} fill="#F6F1E7" />
			<path d={tiles.join(' ')} stroke="#E2D8C8" strokeWidth={3} />
			{/* counter objects */}
			<g>
				<ellipse cx={80} cy={372} rx={46} ry={30} fill="#E7E2D8" />
				<rect x={40} y={330} width={80} height={44} rx={10} fill="#F0ECE4" />
				<path d="M 214 392 C 196 330 226 296 262 296 C 300 296 330 330 312 392 Z" fill="#D8695C" />
				<rect x={246} y={282} width={34} height={16} rx={6} fill="#C25A4E" />
				<path d="M 314 330 C 350 320 356 360 318 372" stroke="#C25A4E" strokeWidth={10} fill="none" />
				<path d="M 452 392 C 440 350 446 320 470 312 C 494 320 500 350 488 392 Z" fill="#E9C5B6" />
				{Array.from({length: 11}).map((_, i) => {
					const a = -Math.PI / 2 + (random(`fl-a-${i}`) - 0.5) * 2.2;
					const d = 40 + random(`fl-d-${i}`) * 50;
					const colors = ['#F7A8B8', '#FFFFFF', '#F9D77E', '#F4B6C8'];
					return (
						<g key={i}>
							<path d={`M 470 316 Q ${470 + Math.cos(a) * d * 0.4} ${316 + Math.sin(a) * d * 0.6} ${470 + Math.cos(a) * d} ${316 + Math.sin(a) * d}`} stroke="#6E9A5E" strokeWidth={4} fill="none" />
							<circle cx={470 + Math.cos(a) * d} cy={316 + Math.sin(a) * d} r={13 + random(`fl-r-${i}`) * 9} fill={colors[i % colors.length]} />
						</g>
					);
				})}
			</g>
			{/* counter + lower cabinets */}
			<rect x={-200} y={392} width={880} height={26} fill="#EFE8DA" />
			<rect x={-200} y={418} width={880} height={10} fill="#BDB09C" />
			<rect x={-200} y={428} width={860} height={420} fill="#8BA58C" />
			{[0, 1, 2, 3].map((i) => (
				<rect key={i} x={-176 + i * 212} y={452} width={170} height={300} rx={4} fill="none" stroke="#7A957B" strokeWidth={6} />
			))}
		</g>
	);
};

const Plant: React.FC = () => {
	const leaves = Array.from({length: 26}).map((_, i) => {
		const t = i / 25;
		const y = 660 - t * 560 + (random(`lf-y-${i}`) - 0.5) * 60;
		const side = i % 2 === 0 ? -1 : 1;
		const x = 985 + side * (40 + random(`lf-x-${i}`) * 150) * (0.6 + 0.4 * Math.sin(t * 3));
		const rot = side * (30 + random(`lf-r-${i}`) * 50) - 90;
		const size = 70 + random(`lf-s-${i}`) * 50;
		const colors = ['#4E7A4F', '#3F6843', '#5E8C5A', '#6D9C63', '#35593A'];
		return (
			<ellipse key={i} cx={x} cy={y} rx={size * 0.45} ry={size} transform={`rotate(${rot} ${x} ${y})`} fill={colors[i % colors.length]} />
		);
	});
	return (
		<g>
			<path d="M 985 900 C 975 700 1000 500 980 120" stroke="#6B4B30" strokeWidth={12} fill="none" />
			{leaves}
		</g>
	);
};

const Window: React.FC<{frame: number}> = ({frame}) => {
	const trees = [
		[1320, 430, 100, '#B7D59E'],
		[1460, 450, 120, '#A2C98A'],
		[1600, 400, 90, '#C3DEAB'],
		[1760, 460, 130, '#9CC585'],
		[1920, 410, 110, '#B1D39A'],
		[1380, 330, 70, '#CFE4B8'],
		[1850, 320, 80, '#D2E6BC'],
	] as const;
	return (
		<g>
			<rect x={1238} y={28} width={840} height={496} rx={6} fill="#FBF5EA" />
			<clipPath id="bg-glass">
				<rect x={1268} y={58} width={800} height={436} />
			</clipPath>
			<g clipPath="url(#bg-glass)">
				<rect x={1268} y={58} width={800} height={436} fill="url(#bg-sky)" />
				{trees.map(([x, y, r, c], i) => (
					<circle key={i} cx={x + Math.sin(frame / 60 + i) * 4} cy={y} r={r} fill={c} />
				))}
				<ellipse cx={1600} cy={150} rx={420} ry={140} fill="#FFFDF4" opacity={0.7} />
			</g>
			<rect x={1646} y={58} width={20} height={436} fill="#F4ECDD" />
			<rect x={1268} y={266} width={800} height={18} fill="#F4ECDD" />
			<rect x={1218} y={508} width={880} height={28} fill="#F8F1E4" />
			<rect x={1218} y={536} width={880} height={12} fill="#CDB38E" opacity={0.6} />
			{/* sill plant */}
			<path d="M 1812 506 L 1822 452 L 1896 452 L 1906 506 Z" fill="#CF7F5E" />
			{Array.from({length: 7}).map((_, i) => (
				<ellipse key={i} cx={1859 + (i - 3) * 16} cy={420 - Math.abs(i - 3) * -8} rx={14} ry={40} transform={`rotate(${(i - 3) * 16} ${1859 + (i - 3) * 16} 440)`} fill={i % 2 ? '#6F9E5E' : '#5C8A4F'} />
			))}
		</g>
	);
};

const Bunting: React.FC = () => {
	const colors = ['#F6A6B2', '#A8DCCF', '#F9D77E', '#C8B6E2', '#F7B994'];
	const p0 = {x: -140, y: 40};
	const p1 = {x: 960, y: 200};
	const p2 = {x: 2060, y: 20};
	const q = (t: number) => ({
		x: (1 - t) ** 2 * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x,
		y: (1 - t) ** 2 * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y,
	});
	const n = 20;
	return (
		<g>
			<path d={`M ${p0.x} ${p0.y} Q ${p1.x} ${p1.y} ${p2.x} ${p2.y}`} stroke="#9C7B5A" strokeWidth={3} fill="none" />
			{Array.from({length: n}).map((_, i) => {
				const a = q(i / n + 0.012);
				const b = q((i + 0.72) / n + 0.012);
				const m = {x: (a.x + b.x) / 2, y: (a.y + b.y) / 2};
				return <path key={i} d={`M ${a.x} ${a.y} L ${b.x} ${b.y} L ${m.x + 3} ${m.y + 86} Z`} fill={colors[i % colors.length]} />;
			})}
		</g>
	);
};

const BALLOONS = [
	{x: 150, y: 270, r: 80, c: ['#FFB3C6', '#F47C9B', '#C9557A']},
	{x: 340, y: 160, r: 72, c: ['#FFE7A3', '#F5C45E', '#C9922E']},
	{x: 1770, y: 150, r: 62, c: ['#E3D6FA', '#B9A3E3', '#8C74BE']},
	{x: 1900, y: 262, r: 70, c: ['#C9F1E6', '#8ED3C0', '#5AA894']},
];

const Balloons: React.FC<{frame: number}> = ({frame}) => (
	<g>
		<defs>
			{BALLOONS.map((b, i) => (
				<radialGradient key={i} id={`bg-balloon-${i}`} cx="0.36" cy="0.3" r="0.8">
					<stop offset="0" stopColor={b.c[0]} />
					<stop offset="0.5" stopColor={b.c[1]} />
					<stop offset="1" stopColor={b.c[2]} />
				</radialGradient>
			))}
		</defs>
		{BALLOONS.map((b, i) => {
			const bob = Math.sin(frame / 38 + i * 1.7) * 6;
			const sway = Math.sin(frame / 52 + i) * 2.5;
			return (
				<g key={i} transform={`translate(${b.x} ${b.y + bob}) rotate(${sway})`}>
					<path d={`M 0 ${b.r * 1.15} C -12 ${b.r * 1.15 + 70} 22 ${b.r * 1.15 + 150} -8 ${b.r * 1.15 + 300}`} stroke="#EDE6DA" strokeWidth={2.5} fill="none" />
					<ellipse cx={0} cy={0} rx={b.r} ry={b.r * 1.15} fill={`url(#bg-balloon-${i})`} />
					<path d={`M -8 ${b.r * 1.15 - 2} L 8 ${b.r * 1.15 - 2} L 0 ${b.r * 1.15 + 12} Z`} fill={b.c[2]} />
					<ellipse cx={-b.r * 0.38} cy={-b.r * 0.5} rx={b.r * 0.16} ry={b.r * 0.3} transform={`rotate(-28 ${-b.r * 0.38} ${-b.r * 0.5})`} fill="#FFFFFF" opacity={0.6} />
				</g>
			);
		})}
	</g>
);

const FairyLights: React.FC<{frame: number}> = ({frame}) => {
	const bulbs = Array.from({length: 18}).map((_, i) => {
		const t = i / 17;
		const x = 1180 + t * 900;
		const y = 70 + Math.sin(t * Math.PI) * 60;
		const tw = 0.65 + 0.35 * Math.sin(frame / 9 + i * 2.1);
		return <circle key={i} cx={x} cy={y} r={9} fill="url(#bg-bulb)" opacity={tw} />;
	});
	return (
		<g>
			<path d="M 1180 70 Q 1630 190 2080 70" stroke="#8C7458" strokeWidth={2} fill="none" />
			{bulbs}
		</g>
	);
};

const Bokeh: React.FC<{frame: number}> = ({frame}) => (
	<g>
		{Array.from({length: 22}).map((_, i) => {
			const x = 1150 + random(`bk-x-${i}`) * 900;
			const y = 60 + random(`bk-y-${i}`) * 520;
			const r = 18 + random(`bk-r-${i}`) * 42;
			const o = 0.18 + 0.22 * (0.5 + 0.5 * Math.sin(frame / (30 + i * 3) + i));
			return <circle key={i} cx={x} cy={y} r={r} fill="url(#bg-bokeh)" opacity={o} />;
		})}
	</g>
);

export const Background: React.FC<{frame: number}> = ({frame}) => (
	<g>
		<defs>
			<linearGradient id="bg-wall" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stopColor="#F4E5CB" />
				<stop offset="0.55" stopColor="#E6CFAA" />
				<stop offset="1" stopColor="#CDAE85" />
			</linearGradient>
			<linearGradient id="bg-sky" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stopColor="#FFFCF0" />
				<stop offset="0.6" stopColor="#F5F7E6" />
				<stop offset="1" stopColor="#DDECCB" />
			</linearGradient>
			<radialGradient id="bg-bulb">
				<stop offset="0" stopColor="#FFFBE8" />
				<stop offset="0.45" stopColor="#FFE3A0" />
				<stop offset="1" stopColor="#FFC870" stopOpacity={0} />
			</radialGradient>
			<radialGradient id="bg-bokeh">
				<stop offset="0" stopColor="#FFFFFF" stopOpacity={0.9} />
				<stop offset="0.7" stopColor="#FFF4D6" stopOpacity={0.6} />
				<stop offset="1" stopColor="#FFF4D6" stopOpacity={0} />
			</radialGradient>
			<radialGradient id="bg-window-glow" cx="0.5" cy="0.5" r="0.5">
				<stop offset="0" stopColor="#FFFBEA" stopOpacity={0.85} />
				<stop offset="1" stopColor="#FFFBEA" stopOpacity={0} />
			</radialGradient>
		</defs>
		<rect x={-300} y={-300} width={2520} height={1680} fill="url(#bg-wall)" />
		<Kitchen />
		<Window frame={frame} />
		<ellipse cx={1650} cy={280} rx={620} ry={420} fill="url(#bg-window-glow)" />
		<Plant />
		<Bunting />
		<Balloons frame={frame} />
		<FairyLights frame={frame} />
		<Bokeh frame={frame} />
	</g>
);
