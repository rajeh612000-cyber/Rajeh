import type {ReelScript, Scene} from '../data/types';

/** Frame offsets for each scene, so scenes only ever declare their own length. */
export const sceneOffsets = (script: ReelScript): {scene: Scene; from: number}[] => {
  let at = 0;
  return script.scenes.map((scene) => {
    const from = at;
    at += scene.durationInFrames;
    return {scene, from};
  });
};

export const totalFrames = (script: ReelScript): number =>
  script.scenes.reduce((sum, s) => sum + s.durationInFrames, 0);

/** Frames -> "M:SS.f" for manifests and edit notes. */
export const timecode = (frame: number, fps: number): string => {
  const total = frame / fps;
  const m = Math.floor(total / 60);
  const rest = total - m * 60;
  return `${m}:${rest.toFixed(2).padStart(5, '0')}`;
};
