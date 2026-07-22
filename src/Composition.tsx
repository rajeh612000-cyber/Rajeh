import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { PALETTE } from "./theme/palette";
import { ensureFonts } from "./theme/fonts";
import captions from "./data/captions.json";
import type { Captions as CaptionsT } from "./types";

import { BackgroundController } from "./components/BackgroundController";
import { FloatingField } from "./components/FloatingField";
import { LogoWatermark } from "./components/LogoWatermark";
import { Captions } from "./components/Captions";

import { ColdOpen } from "./scenes/ColdOpen";
import { ScenePricing } from "./scenes/ScenePricing";
import { SceneVirtualShop } from "./scenes/SceneVirtualShop";
import { SceneMarketData } from "./scenes/SceneMarketData";
import { SceneSimulator } from "./scenes/SceneSimulator";
import { ScenePredict } from "./scenes/ScenePredict";
import { Outro } from "./scenes/Outro";

const data = captions as unknown as CaptionsT;
const FPS = data.fps;
const TOTAL = Math.round(data.duration * FPS);
const F = (s: number) => Math.round(s * FPS);
const OVL = 10; // crossfade overlap (frames)

const speechStartF = F(data.speechStart);
// Cold open builds the logo across the lead-in and hands off after the first line.
const COLD_DUR = speechStartF + 84;

const byId = (id: string) => data.scenes.find((s) => s.id === id)!;
const SCENE_COMPONENTS: Record<string, React.FC<{ life: number }>> = {
  pricing: ScenePricing,
  virtualshop: SceneVirtualShop,
  marketdata: SceneMarketData,
  engine: SceneSimulator,
  predict: ScenePredict,
};

const OUTRO_FROM = F(data.speechEnd) - 4;
const OUTRO_DUR = Math.max(30, TOTAL - OUTRO_FROM);

// Build each themed scene's frame window from the caption data.
const sceneSeqs = data.scenes.map((s, i) => {
  const last = i === data.scenes.length - 1;
  const from = i === 0 ? COLD_DUR - OVL : F(s.start) - OVL;
  const endF = last ? OUTRO_FROM + 14 : F(data.scenes[i + 1].start) + OVL;
  return { id: s.id, from, dur: Math.max(30, endF - from), Comp: SCENE_COMPONENTS[s.id] };
});

const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background: "radial-gradient(120% 90% at 50% 42%, transparent 52%, rgba(3,10,26,0.55) 100%)",
    }}
  />
);

export const SmartShopperIntro: React.FC = () => {
  ensureFonts();
  return (
    <AbsoluteFill style={{ backgroundColor: PALETTE.navy }}>
      {/* Original V/O — untouched (final delivery re-muxes the source stream) */}
      <Audio src={staticFile(data.audio)} />

      <BackgroundController scenes={data.scenes} />
      <FloatingField count={18} seed={5} accent />

      <Sequence from={0} durationInFrames={COLD_DUR} name="ColdOpen">
        <ColdOpen life={COLD_DUR} buildDur={speechStartF} />
      </Sequence>

      {sceneSeqs.map((s) => (
        <Sequence key={s.id} from={s.from} durationInFrames={s.dur} name={s.id}>
          <s.Comp life={s.dur} />
        </Sequence>
      ))}

      <LogoWatermark appearAt={(COLD_DUR - 10) / FPS} hideAt={data.speechEnd - 0.2} />

      <Vignette />

      <Captions chunks={data.chunks} />

      <Sequence from={OUTRO_FROM} durationInFrames={OUTRO_DUR} name="Outro">
        <Outro />
      </Sequence>
    </AbsoluteFill>
  );
};
