import {Easing} from 'remotion';

export type Ease = (t: number) => number;

export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const smoothstep = (a: number, b: number, x: number) => {
	const t = clamp((x - a) / (b - a), 0, 1);
	return t * t * (3 - 2 * t);
};

export const ease = {
	linear: (t: number) => t,
	inOut: Easing.inOut(Easing.cubic),
	inOutSine: Easing.inOut(Easing.sin),
	out: Easing.out(Easing.cubic),
	outQuad: Easing.out(Easing.quad),
	in: Easing.in(Easing.quad),
	back: Easing.out(Easing.back(1.6)),
	backSoft: Easing.out(Easing.back(1.15)),
};

// A keyframe: [frame, value, easing used to arrive at this key].
export type Key = [number, number, Ease?];

export const track = (frame: number, keys: Key[]): number => {
	if (frame <= keys[0][0]) {
		return keys[0][1];
	}
	for (let i = 1; i < keys.length; i++) {
		const [f1, v1, e] = keys[i];
		const [f0, v0] = keys[i - 1];
		if (frame <= f1) {
			const t = f1 === f0 ? 1 : (frame - f0) / (f1 - f0);
			return lerp(v0, v1, (e ?? ease.inOut)(t));
		}
	}
	return keys[keys.length - 1][1];
};

// 0 -> 1 -> 0 envelope rising from a to m and falling from m to b.
export const bump = (x: number, a: number, m: number, b: number) => {
	if (x <= a || x >= b) {
		return 0;
	}
	return x < m ? smoothstep(a, m, x) : 1 - smoothstep(m, b, x);
};

// Damped oscillation started by an impulse at f0.
export const ring = (frame: number, f0: number, freq: number, decay: number) =>
	frame < f0 ? 0 : Math.exp(-(frame - f0) / decay) * Math.sin((frame - f0) * freq);

export const deg = (r: number) => (r * 180) / Math.PI;
export const rad = (d: number) => (d * Math.PI) / 180;
