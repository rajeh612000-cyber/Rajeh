import React from 'react';
import {AbsoluteFill, Freeze} from 'remotion';
import {SceneRenderer} from './SceneRenderer';
import {sceneOffsets, timecode} from './timing';
import {COLORS, TYPE} from '../theme/tokens';
import {FONTS, loadFonts} from '../theme/fonts';
import type {ReelScript} from '../data/types';

loadFonts();

const COLS = 5;
const PAD = 40;
const GAP = 18;
const LABEL = 46;

/**
 * A single still showing every beat of the reel at once — the storyboard you
 * check before committing to a four-minute render.
 *
 * Each cell is the real card, frozen 55% of the way through its own scene
 * (past the entrance animation, before it cuts), so what you see is what the
 * edit actually looks like rather than a mock-up of it.
 */
export const ContactSheet: React.FC<{script: ReelScript}> = ({script}) => {
  const cells = sceneOffsets(script);
  const rows = Math.ceil(cells.length / COLS);
  const cellW = (script.width - PAD * 2 - GAP * (COLS - 1)) / COLS;
  const scale = cellW / script.width;
  const cellH = script.height * scale;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.charcoal,
        padding: PAD,
        display: 'grid',
        gridTemplateColumns: `repeat(${COLS}, ${cellW}px)`,
        gridAutoRows: `${cellH + LABEL}px`,
        gap: GAP,
        alignContent: 'start',
      }}
    >
      {cells.map(({scene, from}, i) => (
        <div key={scene.id} style={{width: cellW}}>
          <div
            style={{
              width: cellW,
              height: cellH,
              overflow: 'hidden',
              position: 'relative',
              outline: `1px solid ${COLORS.smoke}`,
            }}
          >
            <div
              style={{
                width: script.width,
                height: script.height,
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
              }}
            >
              <Freeze frame={Math.round(scene.durationInFrames * 0.55)}>
                <SceneRenderer scene={scene} />
              </Freeze>
            </div>
          </div>
          <div
            style={{
              height: LABEL,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontFamily: FONTS.caption,
              fontSize: 15,
              color: COLORS.grey,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            }}
          >
            <span style={{color: COLORS.gold, fontWeight: TYPE.display}}>
              {String(i + 1).padStart(2, '0')}
            </span>
            <span>{timecode(from, script.fps)}</span>
            <span style={{color: COLORS.smoke}}>·</span>
            <span style={{overflow: 'hidden', textOverflow: 'ellipsis'}}>{scene.id}</span>
          </div>
        </div>
      ))}
      <div style={{gridColumn: `1 / ${COLS + 1}`, height: 1}} />
      <div
        style={{
          gridColumn: `1 / ${COLS + 1}`,
          fontFamily: FONTS.caption,
          fontSize: 17,
          color: COLORS.grey,
          lineHeight: 1.5,
        }}
      >
        {script.subject} — {cells.length} beats · {script.width}×{script.height} ·{' '}
        {script.fps}fps · {script.durationInSeconds}s · {script.disclaimer}
      </div>
      <div style={{gridColumn: `1 / ${COLS + 1}`, height: rows * 0}} />
    </AbsoluteFill>
  );
};

/** Sheet height for a given script, so the composition can size itself. */
export const contactSheetHeight = (script: ReelScript) => {
  const rows = Math.ceil(script.scenes.length / COLS);
  const cellW = (script.width - PAD * 2 - GAP * (COLS - 1)) / COLS;
  const cellH = script.height * (cellW / script.width);
  return Math.ceil(PAD * 2 + rows * (cellH + LABEL) + (rows - 1) * GAP + 120);
};
