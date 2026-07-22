import React from "react";
import { Composition } from "remotion";
import { SmartShopperIntro } from "./Composition";
import captions from "./data/captions.json";

const FPS = captions.fps ?? 30;
const DURATION_IN_FRAMES = Math.round(captions.duration * FPS); // 1779 frames @ 59.285s

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="SmartShopperIntro"
      component={SmartShopperIntro}
      durationInFrames={DURATION_IN_FRAMES}
      fps={FPS}
      width={1920}
      height={1080}
    />
  );
};
