/**
 * ShamElNessim — Main composition
 *
 * Assembles the five scenes using TransitionSeries:
 *   1. Opening       (5 s)  ──fade──
 *   2. Nature        (4 s)  ──slide-from-right──
 *   3. Main Message  (5 s)  ──fade──
 *   4. Cultural      (4 s)  ──slide-from-left──
 *   5. Closing       (5 s)
 *
 * Total: 610 frames (20.3 s) @ 30 fps
 */

import React from "react";
import { linearTiming, springTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { SCENE_DURATION, TRANSITION_DURATION } from "./constants";
import { Scene1Opening } from "./scenes/Scene1Opening";
import { Scene2Nature } from "./scenes/Scene2Nature";
import { Scene3MainMessage } from "./scenes/Scene3MainMessage";
import { Scene4Cultural } from "./scenes/Scene4Cultural";
import { Scene5Closing } from "./scenes/Scene5Closing";

export const ShamElNessim: React.FC = () => {
  return (
    <TransitionSeries>
      {/* ── Scene 1: Opening ─────────────────────────────────────── */}
      <TransitionSeries.Sequence durationInFrames={SCENE_DURATION.opening}>
        <Scene1Opening />
      </TransitionSeries.Sequence>

      {/* Soft cross-fade into the nature scene */}
      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
      />

      {/* ── Scene 2: Nature / Particles ──────────────────────────── */}
      <TransitionSeries.Sequence durationInFrames={SCENE_DURATION.nature}>
        <Scene2Nature />
      </TransitionSeries.Sequence>

      {/* Spring slide from right — energetic entrance for hero scene */}
      <TransitionSeries.Transition
        presentation={slide({ direction: "from-right" })}
        timing={springTiming({
          config: { damping: 200 },
          durationInFrames: TRANSITION_DURATION,
        })}
      />

      {/* ── Scene 3: Main Message ────────────────────────────────── */}
      <TransitionSeries.Sequence durationInFrames={SCENE_DURATION.mainMessage}>
        <Scene3MainMessage />
      </TransitionSeries.Sequence>

      {/* Fade out of the white hero frame */}
      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
      />

      {/* ── Scene 4: Cultural Words ───────────────────────────────── */}
      <TransitionSeries.Sequence durationInFrames={SCENE_DURATION.cultural}>
        <Scene4Cultural />
      </TransitionSeries.Sequence>

      {/* Slide from left — returns to blue palette */}
      <TransitionSeries.Transition
        presentation={slide({ direction: "from-left" })}
        timing={springTiming({
          config: { damping: 200 },
          durationInFrames: TRANSITION_DURATION,
        })}
      />

      {/* ── Scene 5: Closing ─────────────────────────────────────── */}
      <TransitionSeries.Sequence durationInFrames={SCENE_DURATION.closing}>
        <Scene5Closing />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
