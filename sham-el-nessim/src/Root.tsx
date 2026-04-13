/**
 * Root — Remotion composition registry
 *
 * Registers two compositions:
 *   • ShamElNessim      — 1080×1080  (Instagram / LinkedIn square)
 *   • ShamElNessimWide  — 1920×1080  (LinkedIn / YouTube landscape)
 *
 * Both use the same component and inherit the same scene timing.
 * Switch between them in Remotion Studio or pass the id to `remotion render`.
 */

import React from "react";
import { Composition, Folder } from "remotion";
import { ShamElNessim } from "./ShamElNessim";
import { TOTAL_FRAMES, FPS } from "./constants";

export const RemotionRoot: React.FC = () => {
  return (
    <Folder name="ShamElNessim">
      {/* ── Square — Instagram / LinkedIn ────────────────────────── */}
      <Composition
        id="ShamElNessim"
        component={ShamElNessim}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={1080}
        height={1080}
      />

      {/* ── Landscape — YouTube / LinkedIn feed ──────────────────── */}
      <Composition
        id="ShamElNessimWide"
        component={ShamElNessim}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={1920}
        height={1080}
      />
    </Folder>
  );
};
