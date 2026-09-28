// Synthesizes the soundtrack from scratch: a music-box "Happy Birthday"
// (public domain) plus munches, chews, a lick, crumbs and happy panting,
// all timed from src/timing.json. Writes public/soundtrack.wav.
import {mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const timing = JSON.parse(readFileSync(join(root, 'src/timing.json'), 'utf8'));

const SR = 44100;
const N = Math.ceil((timing.durationInFrames / timing.fps) * SR);
const sec = (frame) => frame / timing.fps;

// Deterministic noise (mulberry32) so every build sounds the same.
let seed = 20260928;
const rand = () => {
	seed = (seed + 0x6d2b79f5) | 0;
	let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
	t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
	return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const noise = () => rand() * 2 - 1;
const noiseBuf = (s) => Float32Array.from({length: Math.round(s * SR)}, noise);

const music = [new Float32Array(N), new Float32Array(N)];
const sfx = [new Float32Array(N), new Float32Array(N)];

// Mix a mono clip into a stereo bus. pan: 0 = left, 1 = right.
const add = (bus, start, clip, gain, pan = 0.5) => {
	const i0 = Math.round(start * SR);
	const gl = Math.cos((pan * Math.PI) / 2) * gain;
	const gr = Math.sin((pan * Math.PI) / 2) * gain;
	for (let i = 0; i < clip.length; i++) {
		const j = i0 + i;
		if (j >= 0 && j < N) {
			bus[0][j] += clip[i] * gl;
			bus[1][j] += clip[i] * gr;
		}
	}
};

// RBJ biquad coefficients.
const biquad = (type, f, q) => {
	const w = (2 * Math.PI * f) / SR;
	const cw = Math.cos(w);
	const a = Math.sin(w) / (2 * q);
	let b0;
	let b1;
	let b2;
	if (type === 'lp') {
		b0 = (1 - cw) / 2;
		b1 = 1 - cw;
		b2 = (1 - cw) / 2;
	} else if (type === 'hp') {
		b0 = (1 + cw) / 2;
		b1 = -(1 + cw);
		b2 = (1 + cw) / 2;
	} else {
		b0 = a;
		b1 = 0;
		b2 = -a;
	}
	const a0 = 1 + a;
	return {b0: b0 / a0, b1: b1 / a0, b2: b2 / a0, a1: (-2 * cw) / a0, a2: (1 - a) / a0};
};

// Filter with a fixed or per-sample cutoff (freq may be a function of 0..1).
const filter = (x, type, freq, q = 0.707) => {
	const y = new Float32Array(x.length);
	let x1 = 0;
	let x2 = 0;
	let y1 = 0;
	let y2 = 0;
	let c = biquad(type, typeof freq === 'function' ? freq(0) : freq, q);
	for (let i = 0; i < x.length; i++) {
		if (typeof freq === 'function' && i % 32 === 0) {
			c = biquad(type, freq(i / x.length), q);
		}
		const v = c.b0 * x[i] + c.b1 * x1 + c.b2 * x2 - c.a1 * y1 - c.a2 * y2;
		x2 = x1;
		x1 = x[i];
		y2 = y1;
		y1 = v;
		y[i] = v;
	}
	return y;
};

const envelope = (x, attack, decay) => {
	for (let i = 0; i < x.length; i++) {
		const t = i / SR;
		x[i] *= t < attack ? t / attack : Math.exp(-(t - attack) / decay);
	}
	return x;
};

const bell = (x, power = 2) => {
	for (let i = 0; i < x.length; i++) {
		x[i] *= Math.sin((Math.PI * i) / x.length) ** power;
	}
	return x;
};

// --- Music box -------------------------------------------------------------

const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);
const PARTIALS = [
	[1, 1],
	[2, 0.3],
	[3, 0.12],
	[4.16, 0.1],
	[5.43, 0.05],
	[7.2, 0.03],
];

const pluck = (midi, length = 2.4) => {
	const f = hz(midi);
	const n = Math.round(length * SR);
	const out = new Float32Array(n);
	const decay = 1.1 / (1 + f / 900);
	PARTIALS.forEach(([ratio, amp], k) => {
		const fk = f * ratio;
		if (fk > SR / 2.2) {
			return;
		}
		const dk = decay / (1 + 0.9 * k);
		const w = (2 * Math.PI * fk) / SR;
		for (let i = 0; i < n; i++) {
			out[i] += amp * Math.sin(w * i) * Math.exp(-i / SR / dk);
		}
	});
	for (let i = 0; i < 180; i++) {
		out[i] *= i / 180;
	}
	const tine = filter(noiseBuf(0.006), 'hp', 4000);
	for (let i = 0; i < tine.length; i++) {
		out[i] += tine[i] * 0.15 * (1 - i / tine.length);
	}
	return out;
};

const beat = 60 / timing.bpm;
const t0 = sec(timing.musicStart);
const at = (b) => t0 + b * beat;

// [beat, midi] — Happy Birthday in C, 3/4 with a one-beat pickup.
const MELODY = [
	[0, 67], [0.75, 67], [1, 69], [2, 67], [3, 72], [4, 71],
	[6, 67], [6.75, 67], [7, 69], [8, 67], [9, 74], [10, 72],
	[12, 67], [12.75, 67], [13, 79], [14, 76], [15, 72], [16, 71], [17, 69],
	[18, 77], [18.75, 77], [19, 76], [20, 72], [21, 74], [22, 72],
];
MELODY.forEach(([b, m]) => add(music, at(b) + (rand() - 0.5) * 0.012, pluck(m), 0.2 * (0.92 + rand() * 0.16), 0.52));

// Waltz accompaniment: bass on the downbeat, soft chord on beats 2 and 3.
const C = [52, 55];
const G7 = [50, 53];
const F = [57, 60];
const BARS = [
	[1, 48, [C, C]],
	[4, 43, [G7, G7]],
	[7, 43, [G7, G7]],
	[10, 48, [C, C]],
	[13, 48, [C, C]],
	[16, 41, [F, F]],
	[19, 48, [C, G7]],
];
for (const [b, bass, pahs] of BARS) {
	add(music, at(b), pluck(bass, 3), 0.16, 0.42);
	pahs.forEach((notes, k) => notes.forEach((m) => add(music, at(b + 1 + k), pluck(m, 1.5), 0.06, 0.6)));
}
// Final chord, rolled upward, and a little sparkle on top.
add(music, at(22), pluck(48, 3.5), 0.16, 0.42);
[60, 64, 67, 72].forEach((m, i) => add(music, at(22) + 0.09 * i, pluck(m, 2.8), 0.07, 0.35 + 0.1 * i));
add(music, at(23.2), pluck(84, 2), 0.05, 0.7);

// Birds outside the window, into the music bus so they pick up the room.
for (const [t, count] of [
	[1.4, 3],
	[6.6, 2],
	[10.4, 3],
]) {
	for (let k = 0; k < count; k++) {
		const len = Math.round(0.07 * SR);
		const chirp = new Float32Array(len);
		const f0 = 3300 + rand() * 600;
		const f1 = f0 + 900 + rand() * 600;
		let ph = 0;
		for (let i = 0; i < len; i++) {
			const u = i / len;
			ph += (2 * Math.PI * (f0 + (f1 - f0) * u)) / SR;
			chirp[i] = Math.sin(ph) * Math.sin(Math.PI * u);
		}
		add(music, t + k * 0.12, chirp, 0.03, 0.85);
	}
}

// Small-room reverb (Schroeder/Freeverb style) on the music bus.
const reverb = (bus, wet) => {
	const combs = [1116, 1188, 1277, 1356, 1422, 1491];
	const allpasses = [556, 441, 341];
	const run = (x, spread) => {
		const out = new Float32Array(x.length);
		for (const d0 of combs) {
			const d = d0 + spread;
			const buf = new Float32Array(d);
			let idx = 0;
			let lp = 0;
			for (let i = 0; i < x.length; i++) {
				const y = buf[idx];
				lp = y * 0.75 + lp * 0.25;
				buf[idx] = x[i] * 0.015 + lp * 0.8;
				idx = (idx + 1) % d;
				out[i] += y;
			}
		}
		for (const d0 of allpasses) {
			const d = d0 + spread;
			const buf = new Float32Array(d);
			let idx = 0;
			for (let i = 0; i < out.length; i++) {
				const b = buf[idx];
				const y = -out[i] + b;
				buf[idx] = out[i] + b * 0.5;
				idx = (idx + 1) % d;
				out[i] = y;
			}
		}
		return out;
	};
	const wl = run(bus[0], 0);
	const wr = run(bus[1], 23);
	for (let i = 0; i < N; i++) {
		bus[0][i] += wl[i] * wet;
		bus[1][i] += wr[i] * wet;
	}
};
reverb(music, 1.1);

// --- Sound effects ---------------------------------------------------------

const DOG = 0.46;

for (const b of timing.bites) {
	const t = sec(b.chomp);
	add(sfx, t, envelope(filter(noiseBuf(0.35), 'lp', 1700, 0.9), 0.006, 0.09), 0.9, DOG);
	add(sfx, t, envelope(filter(noiseBuf(0.08), 'bp', 2600, 1.2), 0.002, 0.018), 0.5, DOG);
	const thump = new Float32Array(Math.round(0.2 * SR));
	let ph = 0;
	for (let i = 0; i < thump.length; i++) {
		const tt = i / SR;
		ph += (2 * Math.PI * (70 + 60 * Math.exp(-tt / 0.03))) / SR;
		thump[i] = Math.sin(ph) * Math.exp(-tt / 0.06);
	}
	add(sfx, t, thump, 0.5);
	// crumbs pattering onto the plate and table
	for (let k = 0; k < 18; k++) {
		const tick = envelope(filter(noiseBuf(0.01), 'hp', 3000 + rand() * 3000), 0.0005, 0.002);
		add(sfx, t + 0.55 + rand() * 0.5, tick, 0.05 + rand() * 0.07, 0.5 + rand() * 0.2);
	}
}

for (const c of timing.chews) {
	for (let f = c.start + c.period; f < c.end; f += c.period) {
		const t = sec(f) - 0.02;
		add(sfx, t, envelope(filter(noiseBuf(0.25), 'lp', 1100 + rand() * 500, 0.8), 0.01, 0.07), 0.45 + rand() * 0.15, DOG);
		add(sfx, t + 0.01, envelope(filter(noiseBuf(0.05), 'bp', 1800 + rand() * 800, 1.5), 0.002, 0.012), 0.15, DOG);
	}
}

// A wet little slurp for the lick over the nose.
add(sfx, sec(timing.lick.start + 3), bell(filter(noiseBuf(0.35), 'bp', (u) => 500 + 1600 * u, 2.5), 1.5), 0.55, DOG);

// Happy panting: alternating in/out breaths.
for (let f = timing.pantStart + 2; f < timing.durationInFrames - 4; f += 6) {
	const k = Math.round((f - timing.pantStart) / 6);
	add(sfx, sec(f), bell(filter(noiseBuf(0.2), 'bp', k % 2 ? 1400 : 1900, 0.9)), 0.22, DOG);
}

// Quiet room tone.
{
	const room = new Float32Array(N);
	let last = 0;
	for (let i = 0; i < N; i++) {
		last = (last + 0.02 * noise()) / 1.02;
		room[i] = last;
	}
	add(sfx, 0, filter(room, 'lp', 400), 0.08);
}

// --- Mix and write ---------------------------------------------------------

const L = new Float32Array(N);
const R = new Float32Array(N);
let peak = 0;
for (let i = 0; i < N; i++) {
	L[i] = music[0][i] + sfx[0][i];
	R[i] = music[1][i] + sfx[1][i];
	peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
}
const gain = 0.89 / peak;
const fade = Math.round(0.05 * SR);

const buf = Buffer.alloc(44 + N * 4);
buf.write('RIFF', 0);
buf.writeUInt32LE(36 + N * 4, 4);
buf.write('WAVE', 8);
buf.write('fmt ', 12);
buf.writeUInt32LE(16, 16);
buf.writeUInt16LE(1, 20);
buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24);
buf.writeUInt32LE(SR * 4, 28);
buf.writeUInt16LE(4, 32);
buf.writeUInt16LE(16, 34);
buf.write('data', 36);
buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) {
	const edge = Math.min(1, i / fade, (N - 1 - i) / fade);
	buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * gain * edge)) * 32767), 44 + i * 4);
	buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * gain * edge)) * 32767), 46 + i * 4);
}

mkdirSync(join(root, 'public'), {recursive: true});
writeFileSync(join(root, 'public/soundtrack.wav'), buf);
console.log(`public/soundtrack.wav: ${(N / SR).toFixed(2)}s, peak gain ${gain.toFixed(2)}`);
