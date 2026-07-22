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

// Scene sequencing (frames @30fps). Slight overlaps allow crossfades.
const SC = {
  coldOpen: { from: 0, dur: 132 },
  pricing: { from: 120, dur: 168 },
  virtualShop: { from: 252, dur: 408 },
  marketData: { from: 654, dur: 396 },
  simulator: { from: 1044, dur: 231 },
  predict: { from: 1263, dur: 474 },
  outro: { from: 1728, dur: 51 },
};

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
      {/* Original V/O — untouched (kept for preview; final delivery re-muxes the source stream) */}
      <Audio src={staticFile(data.audio)} />

      <BackgroundController scenes={data.scenes} />
      <FloatingField count={18} seed={5} accent />

      <Sequence from={SC.coldOpen.from} durationInFrames={SC.coldOpen.dur} name="ColdOpen">
        <ColdOpen life={SC.coldOpen.dur} />
      </Sequence>
      <Sequence from={SC.pricing.from} durationInFrames={SC.pricing.dur} name="Pricing">
        <ScenePricing life={SC.pricing.dur} />
      </Sequence>
      <Sequence from={SC.virtualShop.from} durationInFrames={SC.virtualShop.dur} name="VirtualShop">
        <SceneVirtualShop life={SC.virtualShop.dur} />
      </Sequence>
      <Sequence from={SC.marketData.from} durationInFrames={SC.marketData.dur} name="MarketData">
        <SceneMarketData life={SC.marketData.dur} />
      </Sequence>
      <Sequence from={SC.simulator.from} durationInFrames={SC.simulator.dur} name="Simulator">
        <SceneSimulator life={SC.simulator.dur} />
      </Sequence>
      <Sequence from={SC.predict.from} durationInFrames={SC.predict.dur} name="Predict">
        <ScenePredict life={SC.predict.dur} />
      </Sequence>

      <LogoWatermark appearAt={4.3} hideAt={57.2} />

      <Vignette />

      <Captions chunks={data.chunks} />

      <Sequence from={SC.outro.from} durationInFrames={SC.outro.dur} name="Outro">
        <Outro />
      </Sequence>
    </AbsoluteFill>
  );
};
