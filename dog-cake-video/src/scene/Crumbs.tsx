import React from 'react';
import {random} from 'remotion';
import timing from '../timing.json';
import {getPose, headToWorld} from '../lib/pose';
import {CAKE, frontY} from './Cake';

type Crumb = {
	x0: number;
	y0: number;
	vx: number;
	vy: number;
	t0: number;
	depth: number;
	kind: number;
	size: number;
	spin: number;
	rot0: number;
	shape: string;
};

const GRAVITY = 0.85;
// sponge, frosting, glaze, then three sprinkle colors
const KIND_FILL = ['#EDC476', '#FFF6EA', '#F48BB3', '#5EC2FF', '#FFD45C', '#FF6B8B'];

// Where a falling crumb lands: on the plate in front of the cake, or on the table.
const floorAt = (x: number, depth: number) => {
	const px = (x - CAKE.cx) / 300;
	if (Math.abs(px) < 1) {
		const half = 62 * Math.sqrt(1 - px * px);
		let back = 899 - half;
		const front = 899 + half;
		if (Math.abs(x - CAKE.cx) < CAKE.rx) {
			back = Math.max(back, frontY(x, CAKE.base, CAKE.ryBase) + 3);
		}
		return back + depth * (front - back);
	}
	return 850 + depth * 120;
};

const blob = (seed: string, size: number) => {
	const pts = Array.from({length: 6}).map((_, k) => {
		const a = (k / 6) * Math.PI * 2;
		const r = size * (0.65 + random(`${seed}-${k}`) * 0.6);
		return `${(Math.cos(a) * r).toFixed(1)} ${(Math.sin(a) * r).toFixed(1)}`;
	});
	return `M ${pts.join(' L ')} Z`;
};

const BURSTS: Crumb[] = timing.bites.flatMap((b, i) =>
	Array.from({length: 40}).map((_, k) => {
		const r = (s: string) => random(`cr-${i}-${k}-${s}`);
		const ang = r('a') * Math.PI * 2;
		const dist = Math.sqrt(r('d')) * b.radius * 0.6;
		const roll = r('k');
		const kind = roll < 0.55 ? 0 : roll < 0.72 ? 1 : roll < 0.82 ? 2 : 3 + Math.floor(r('sk') * 3);
		const size = kind === 0 ? 2.5 + r('s') ** 2 * 6.5 : kind <= 2 ? 2 + r('s') * 3 : 5;
		return {
			x0: b.center[0] + Math.cos(ang) * dist - b.radius * 0.1,
			y0: b.center[1] + Math.sin(ang) * dist * 0.7,
			vx: -4 + r('vx') * 6.5,
			vy: -6.5 + r('vy') * 5.5,
			t0: b.chomp + Math.floor(r('t') * 5),
			depth: r('dp') ** 0.7,
			kind,
			size,
			spin: (r('sp') - 0.5) * 30,
			rot0: r('r0') * 360,
			shape: kind === 0 ? blob(`crs-${i}-${k}`, size) : '',
		};
	}),
);

// A couple of crumbs drop from the mouth on every chew.
const CHEW_CRUMBS: Crumb[] = timing.chews.flatMap((c, ci) => {
	const out: Crumb[] = [];
	for (let f = c.start + c.period; f < c.end; f += c.period) {
		const mouth = headToWorld(getPose(f), 206, 96);
		for (let k = 0; k < 2; k++) {
			const r = (s: string) => random(`cc-${ci}-${f}-${k}-${s}`);
			const size = 2 + r('s') * 3.5;
			out.push({
				x0: mouth.x + (r('x') - 0.5) * 18,
				y0: mouth.y,
				vx: (r('vx') - 0.6) * 1.6,
				vy: r('vy') * 1.5,
				t0: f,
				depth: r('d') ** 0.6,
				kind: r('k') < 0.8 ? 0 : 1,
				size,
				spin: (r('sp') - 0.5) * 20,
				rot0: r('r') * 360,
				shape: blob(`ccs-${ci}-${f}-${k}`, size),
			});
		}
	}
	return out;
});

const ALL = [...BURSTS, ...CHEW_CRUMBS];

const simulate = (c: Crumb, frame: number) => {
	let x = c.x0;
	let y = c.y0;
	let vx = c.vx;
	let vy = c.vy;
	let rot = c.rot0;
	let bounces = 0;
	let resting = false;
	for (let s = c.t0; s < frame && !resting; s++) {
		x += vx;
		y += vy;
		vy += GRAVITY;
		rot += c.spin;
		const floor = floorAt(x, c.depth);
		if (y >= floor && vy > 0) {
			y = floor;
			if (bounces < 1 && vy > 3) {
				vy = -vy * 0.3;
				vx *= 0.5;
				bounces++;
			} else {
				resting = true;
			}
		}
	}
	return {x, y, rot, resting};
};

export const Crumbs: React.FC<{frame: number}> = ({frame}) => (
	<g>
		{ALL.filter((c) => frame >= c.t0).map((c, i) => {
			const {x, y, rot, resting} = simulate(c, frame);
			const fill = KIND_FILL[c.kind];
			return (
				<g key={i} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}>
					{resting ? <ellipse cx={1.5} cy={c.size * 0.55} rx={c.size * 1.1} ry={c.size * 0.35} fill="#3A2210" opacity={0.25} /> : null}
					<g transform={`rotate(${rot.toFixed(1)})`}>
						{c.kind === 0 ? (
							<path d={c.shape} fill={fill} stroke="#C49446" strokeWidth={0.8} />
						) : c.kind <= 2 ? (
							<ellipse rx={c.size} ry={c.size * 0.8} fill={fill} />
						) : (
							<path d="M -4 0 L 4 0" stroke={fill} strokeWidth={3} strokeLinecap="round" />
						)}
					</g>
				</g>
			);
		})}
	</g>
);
