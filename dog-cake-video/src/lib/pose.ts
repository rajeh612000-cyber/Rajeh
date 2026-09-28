import timing from '../timing.json';
import {bump, clamp, ease, Key, rad, ring, smoothstep, track} from './anim';

export type Bite = (typeof timing.bites)[number];

// The head is drawn in its own space: eye at (0,0), snout pointing +x.
// It rotates around PIVOT, where the skull meets the neck.
export const PIVOT = {x: -110, y: 60};
// Front of the mouth, between the jaws.
export const BITE_POINT = {x: 206, y: 86};
export const REST = {x: 860, y: 395, rot: 8};

export type HeadXf = {x: number; y: number; rot: number};

export const headTransform = (h: HeadXf) => `translate(${h.x} ${h.y}) rotate(${h.rot} ${PIVOT.x} ${PIVOT.y})`;

export const headToWorld = (h: HeadXf, px: number, py: number) => {
	const r = rad(h.rot);
	const dx = px - PIVOT.x;
	const dy = py - PIVOT.y;
	return {
		x: h.x + PIVOT.x + dx * Math.cos(r) - dy * Math.sin(r),
		y: h.y + PIVOT.y + dx * Math.sin(r) + dy * Math.cos(r),
	};
};

// Head placement that lands the mouth on a bite target.
const bitePose = (b: Bite): HeadXf => {
	const r = rad(b.rot);
	const dx = BITE_POINT.x - PIVOT.x;
	const dy = BITE_POINT.y - PIVOT.y;
	const tx = b.center[0] - b.radius * 0.25;
	const ty = b.center[1];
	return {
		x: tx - PIVOT.x - (dx * Math.cos(r) - dy * Math.sin(r)),
		y: ty - PIVOT.y - (dx * Math.sin(r) + dy * Math.cos(r)),
		rot: b.rot,
	};
};

export const BITE_POSES = timing.bites.map(bitePose);

// Idle sniffing before the first bite.
const X: Key[] = [[0, REST.x]];
const Y: Key[] = [
	[0, REST.y],
	[10, REST.y + 3],
	[18, REST.y],
	[26, REST.y + 4],
	[36, REST.y],
	[46, REST.y + 2],
	[54, REST.y],
];
const ROT: Key[] = [
	[0, REST.rot],
	[10, REST.rot + 2],
	[18, REST.rot - 1],
	[26, REST.rot + 2.5],
	[36, REST.rot],
	[46, REST.rot + 1.5],
	[54, REST.rot],
];
const JAW: Key[] = [[0, 0]];
const LEAN: Key[] = [[0, 0]];
const BROW: Key[] = [[0, 0]];

// Each bite: wind up, lunge, chomp, tug the piece loose, spring back.
timing.bites.forEach((b, i) => {
	const p = BITE_POSES[i];
	X.push(
		[b.antStart, REST.x],
		[b.antPeak, REST.x - 18, ease.inOutSine],
		[b.chomp - 2, p.x - 10, ease.inOut],
		[b.chomp, p.x, ease.outQuad],
		[b.chomp + 10, p.x - 28, ease.out],
		[b.chomp + 30, REST.x, ease.backSoft],
	);
	Y.push(
		[b.antStart, REST.y],
		[b.antPeak, REST.y - 14, ease.inOutSine],
		[b.chomp - 2, p.y - 10, ease.inOut],
		[b.chomp, p.y, ease.outQuad],
		[b.chomp + 10, p.y - 16, ease.out],
		[b.chomp + 30, REST.y, ease.backSoft],
	);
	ROT.push(
		[b.antStart, REST.rot],
		[b.antPeak, REST.rot - 7, ease.inOutSine],
		[b.chomp - 2, p.rot - 2, ease.inOut],
		[b.chomp, p.rot, ease.outQuad],
		[b.chomp + 10, p.rot - 9, ease.out],
		[b.chomp + 30, REST.rot, ease.backSoft],
	);
	JAW.push([b.antPeak, 0], [b.chomp - 5, 27, ease.outQuad], [b.chomp, 27], [b.chomp + 3, 3, ease.in], [b.chomp + 12, 4]);
	LEAN.push(
		[b.antStart, 0],
		[b.antPeak, -8, ease.inOutSine],
		[b.chomp, b.lean, ease.inOut],
		[b.chomp + 10, b.lean * 0.7],
		[b.chomp + 30, 0, ease.inOut],
	);
	BROW.push([b.antStart, 0], [b.antPeak, 1], [b.chomp, 0.4], [b.chomp + 20, 0]);
});

// Proud, happy panting at the end.
const PS = timing.pantStart;
X.push([PS - 2, REST.x], [PS + 8, REST.x - 10, ease.backSoft]);
Y.push([PS - 2, REST.y], [PS + 8, REST.y - 16, ease.backSoft]);
ROT.push([PS - 2, REST.rot], [PS + 8, REST.rot - 12, ease.backSoft]);
JAW.push([PS - 2, 0], [PS + 8, 15, ease.outQuad]);

const [B1, B2, B3] = timing.bites;
const L = timing.lick;

const FROSTING: Key[] = [
	[B1.chomp, 0],
	[B1.chomp + 4, 1, ease.back],
	[L.start + 9, 1],
	[L.start + 13, 0.35],
	[B2.chomp, 0.35],
	[B2.chomp + 4, 0.95, ease.back],
	[B3.chomp, 0.95],
	[B3.chomp + 4, 1.35, ease.back],
];

const LICK_ANGLE: Key[] = [
	[L.start, 15],
	[L.start + 5, 0],
	[L.start + 10, -80],
	[L.start + 14, -115],
	[L.end, -70],
];

export const getPose = (frame: number) => {
	let x = track(frame, X);
	let y = track(frame, Y);
	let rot = track(frame, ROT);
	let jaw = track(frame, JAW);
	const lean = track(frame, LEAN);
	const brow = track(frame, BROW);

	let squint = 0;
	let chewing = 0;
	for (const c of timing.chews) {
		if (frame >= c.start && frame <= c.end) {
			const env = smoothstep(c.start, c.start + 4, frame) * (1 - smoothstep(c.end - 5, c.end, frame));
			const ph = ((frame - c.start) / c.period) * Math.PI * 2;
			jaw += env * 12 * (0.5 - 0.5 * Math.cos(ph));
			rot += env * 2.2 * Math.sin(ph + 0.9);
			y += env * 3 * Math.sin(ph + 0.4);
			squint = Math.max(squint, env * 0.7);
			chewing = Math.max(chewing, env);
		}
	}

	for (const b of timing.bites) {
		rot += 1.6 * ring(frame, b.chomp, 1.9, 3.5);
	}

	const pant = smoothstep(PS, PS + 8, frame);
	const pantPhase = ((frame - PS) / 12) * Math.PI * 2;
	if (pant > 0) {
		jaw += pant * 3 * Math.sin(pantPhase);
		y += pant * 2 * Math.sin(pantPhase + 1.2);
		squint = Math.max(squint, pant * 0.75);
	}

	let blink = 0;
	for (const b of timing.blinks) {
		blink = Math.max(blink, bump(frame, b - 3, b, b + 4));
	}

	const lickExt = smoothstep(L.start, L.start + 5, frame) * (1 - smoothstep(L.end - 5, L.end, frame));
	rot -= 3 * lickExt;

	let chunk = {index: -1, scale: 0};
	timing.bites.forEach((b, i) => {
		if (frame >= b.chomp + 2 && frame < b.chomp + 24) {
			chunk = {index: i, scale: 1 - smoothstep(b.chomp + 10, b.chomp + 24, frame)};
		}
	});

	const sniff = frame < 56 ? bump(frame, 6, 9, 12) + bump(frame, 20, 23, 26) + bump(frame, 42, 45, 48) : 0;

	return {
		x,
		y,
		rot,
		jaw: clamp(jaw, 0, 32),
		lean,
		brow,
		squint,
		blink,
		chewing,
		lick: {ext: lickExt, angle: track(frame, LICK_ANGLE)},
		pant: {amount: pant, phase: pantPhase},
		frosting: track(frame, FROSTING),
		sprinkles: frame >= B3.chomp ? 3 : frame >= B2.chomp ? 2 : frame >= B1.chomp ? 1 : 0,
		chunk,
		sniff,
	};
};

export type Pose = ReturnType<typeof getPose>;

// Slow push-in with a little handheld drift and a bump on every chomp.
export const FOCUS = {x: 1090, y: 600};

export const getCamera = (frame: number) => {
	const scale = 1 + 0.1 * ease.inOutSine(clamp(frame / timing.durationInFrames, 0, 1));
	let impact = 0;
	for (const b of timing.bites) {
		impact += ring(frame, b.chomp, 1.7, 4);
	}
	return {
		scale,
		dx: 3.5 * Math.sin(frame / 37) + 2 * Math.sin(frame / 17 + 1.3),
		dy: 2.5 * Math.sin(frame / 29 + 0.7) + 1.5 * Math.sin(frame / 13) + impact * 4,
		rot: 0.18 * Math.sin(frame / 53) + impact * 0.08,
	};
};

export type Camera = ReturnType<typeof getCamera>;

// depth < 1 moves less than the subject (background), > 1 more (foreground).
export const cameraTransform = (cam: Camera, depth: number) => {
	const s = 1 + (cam.scale - 1) * depth;
	return `translate(${FOCUS.x + cam.dx * depth} ${FOCUS.y + cam.dy * depth}) rotate(${cam.rot * depth}) scale(${s}) translate(${-FOCUS.x} ${-FOCUS.y})`;
};
