/**
 * Stage services shared by every scene.
 *
 * Two rules live here, and they are what make the render reproducible:
 *
 *  1. Nothing animates off wall-clock time. Anything continuous — a rotation,
 *     a drift, a flow — registers an updater that is a pure function of the
 *     master timeline's absolute time. Seek to t and the frame is identical
 *     whether it took 4 ms or 400 ms to get there.
 *  2. The camera is one continuous move for the whole film. Scenes request a
 *     camera position and a look-at target; they never cut. We cut only when
 *     the meaning changes, and in this film the meaning never stops.
 */

import gsap from 'gsap';
import * as THREE from 'three';
import { EASE } from './brand.js';

/** Updaters: fn(absoluteTime) called once per frame, before render. */
const updaters = [];
export function addUpdater(fn) { updaters.push(fn); return fn; }
export function runUpdaters(t) { for (const fn of updaters) fn(t); }
export function clearUpdaters() { updaters.length = 0; }

/** The single look-at target the camera tracks for the whole film. */
export const look = { x: 0, y: 0, z: 0 };

export function applyLook(camera) { camera.lookAt(look.x, look.y, look.z); }

/**
 * Move the camera. `dur` is generous by default: this film earns trust through
 * restraint, and a fast dolly in a B2B explainer reads as a sales pitch.
 */
export function cam(tl, camera, { x, y, z, lx = 0, ly = 0, lz = 0, dur = 3, ease = EASE.move }, at) {
  tl.to(camera.position, { x, y, z, duration: dur, ease }, at);
  tl.to(look, { x: lx, y: ly, z: lz, duration: dur, ease }, at);
  return tl;
}

/** Reveal a DOM element: it rises a little as it arrives. Never a pop. */
export function inType(tl, el, at, { dur = 0.9, y = 22, ease = EASE.reveal } = {}) {
  tl.fromTo(el, { opacity: 0, y }, { opacity: 1, y: 0, duration: dur, ease }, at);
  return tl;
}

/** Retire a DOM element. Falls away slightly less far than it arrived. */
export function outType(tl, el, at, { dur = 0.6, y = -14, ease = 'power2.in' } = {}) {
  tl.to(el, { opacity: 0, y, duration: dur, ease }, at);
  return tl;
}

/**
 * Reveal a 3D object that exposes setOpacity.
 *
 * immediateRender is off and the start value is applied by the tween rather
 * than at build time. Without that, scheduling a late fade-out (from: 1) would
 * light the object up at t=0 — which is exactly the kind of bug that only
 * shows up once you look at frame 60.
 */
export function in3D(tl, obj, at, { dur = 1.0, from = 0, to = 1, ease = EASE.reveal } = {}) {
  const s = { o: from };
  tl.fromTo(s, { o: from }, {
    o: to, duration: dur, ease, immediateRender: false,
    onUpdate: () => obj.userData.setOpacity?.(s.o),
  }, at);
  return tl;
}

export function out3D(tl, obj, at, opts = {}) {
  return in3D(tl, obj, at, { dur: 0.7, from: 1, to: 0, ease: 'power2.in', ...opts });
}

/** Count a number up. The buyer has to watch the figure be computed. */
export function countTo(tl, counter, value, at, { dur = 1.3, ease = EASE.settle } = {}) {
  tl.to(counter, {
    v: value, duration: dur, ease,
    onUpdate: () => counter.paint(),
  }, at);
  return tl;
}

/**
 * Change a 3D object's colour at an instant.
 *
 * Colour steps in this film are decisions, not transitions: a bar turns rose
 * the moment it breaks the guardrail. A crossfade would soften the verdict.
 */
export function tintTo(tl, obj, hex, at) {
  tl.call(() => obj.userData.setColor?.(hex), null, at);
  return tl;
}

/**
 * Lock a DOM label to a point in the 3D scene.
 *
 * A label at a fixed screen percentage drifts off its geometry the moment the
 * camera moves, and this camera never stops. So anything that names a specific
 * object is projected from that object's world position every frame.
 */
export function pin(el, object3D, camera, { dx = 0, dy = 0, width = 1920, height = 1080 } = {}) {
  const v = new THREE.Vector3();
  addUpdater(() => {
    if (!object3D.visible && !object3D.parent?.visible) return;
    object3D.getWorldPosition(v).project(camera);
    el.style.left = ((v.x * 0.5 + 0.5) * width + dx) + 'px';
    el.style.top = ((-v.y * 0.5 + 0.5) * height + dy) + 'px';
  });
  return el;
}

export { gsap };
