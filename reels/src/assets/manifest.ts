import type {AssetRef, ReelScript, Scene} from '../data/types';
import {sceneOffsets, timecode} from '../reel/timing';

export type ManifestRow = {
  assetId: string;
  kind: 'image' | 'video' | 'audio';
  sceneId: string;
  sceneType: Scene['type'];
  /** Where it appears in the cut. */
  inPoint: string;
  outPoint: string;
  durationSeconds: number;
  /** Target path under public/ once you have the licensed file. */
  targetPath: string;
  status: 'PLACEHOLDER' | 'SUPPLIED';
  brief: string;
  sourceNote: string;
};

const assetsOfScene = (scene: Scene): AssetRef[] => {
  switch (scene.type) {
    case 'photo':
      return [scene.asset];
    case 'title':
      return scene.backdrop ? [scene.backdrop] : [];
    case 'headline':
    case 'stat':
    case 'quote':
      return scene.asset ? [scene.asset] : [];
    default:
      return [];
  }
};

const extFor = (kind: AssetRef['kind']) => (kind === 'video' ? 'mp4' : 'jpg');

/**
 * Walks the script and returns every slot a licensed file has to fill, with
 * the exact timecode it lands on. This is the hand-off document for whoever
 * sources the media.
 */
export const buildManifest = (script: ReelScript): ManifestRow[] => {
  const rows: ManifestRow[] = [];

  for (const {scene, from} of sceneOffsets(script)) {
    for (const asset of assetsOfScene(scene)) {
      rows.push({
        assetId: asset.id,
        kind: asset.kind,
        sceneId: scene.id,
        sceneType: scene.type,
        inPoint: timecode(from, script.fps),
        outPoint: timecode(from + scene.durationInFrames, script.fps),
        durationSeconds: Number((scene.durationInFrames / script.fps).toFixed(2)),
        targetPath: asset.src ?? `${asset.kind === 'video' ? 'video' : 'images'}/${asset.id}.${extFor(asset.kind)}`,
        status: asset.src ? 'SUPPLIED' : 'PLACEHOLDER',
        brief: asset.brief,
        sourceNote: asset.sourceNote ?? '',
      });
    }
  }

  const audio: [AssetRef | null, string][] = [
    [script.music, 'music bed'],
    [script.voiceover, 'voice-over'],
  ];
  for (const [ref, role] of audio) {
    if (!ref) continue;
    rows.push({
      assetId: ref.id,
      kind: 'audio',
      sceneId: `(whole reel — ${role})`,
      sceneType: 'title',
      inPoint: timecode(0, script.fps),
      outPoint: timecode(script.durationInSeconds * script.fps, script.fps),
      durationSeconds: script.durationInSeconds,
      targetPath: ref.src ?? `audio/${ref.id}.mp3`,
      status: ref.src ? 'SUPPLIED' : 'PLACEHOLDER',
      brief: ref.brief,
      sourceNote: ref.sourceNote ?? '',
    });
  }

  return rows;
};

/** Every sourced claim in the script, for the fact-check pass. */
export type FactRow = {
  sceneId: string;
  inPoint: string;
  claim: string;
  source: string;
  needsVerification: boolean;
};

export const buildFactSheet = (script: ReelScript): FactRow[] => {
  const rows: FactRow[] = [];

  for (const {scene, from} of sceneOffsets(script)) {
    const at = timecode(from, script.fps);

    if (scene.type === 'timeline') {
      for (const entry of scene.entries) {
        rows.push({
          sceneId: scene.id,
          inPoint: at,
          claim: `${entry.year} — ${entry.label}`,
          source: entry.source,
          needsVerification: Boolean(entry.verify),
        });
      }
      continue;
    }

    if (scene.type === 'headline' && scene.source) {
      rows.push({
        sceneId: scene.id,
        inPoint: at,
        claim: `${scene.lines.join(' ')}${scene.attribution ? ` (${scene.attribution})` : ''}`,
        source: scene.source,
        needsVerification: Boolean(scene.verify),
      });
    }

    if (scene.type === 'title' && scene.source) {
      rows.push({
        sceneId: scene.id,
        inPoint: at,
        claim: `${scene.kicker ? `${scene.kicker} — ` : ''}${scene.lines.join(' ')}${
          scene.subtitle ? ` (${scene.subtitle})` : ''
        }`,
        source: scene.source,
        needsVerification: Boolean(scene.verify),
      });
    }

    if ((scene.type === 'stat' || scene.type === 'quote') && scene.source) {
      rows.push({
        sceneId: scene.id,
        inPoint: at,
        claim:
          scene.type === 'stat'
            ? `${scene.value}${scene.unit ? ` ${scene.unit}` : ''} — ${scene.label}`
            : `"${scene.quote}" — ${scene.attribution}`,
        source: scene.source,
        needsVerification: Boolean(scene.verify),
      });
    }
  }

  return rows;
};
