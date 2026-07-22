import { bundle } from "@remotion/bundler";
import { selectComposition, renderStill } from "@remotion/renderer";
import path from "path";

const frames = process.argv.slice(2).map(Number);
const executable = process.env.REMOTION_BROWSER_EXECUTABLE;

const serveUrl = await bundle({
  entryPoint: path.resolve("src/index.ts"),
  onProgress: () => {},
});
const composition = await selectComposition({ serveUrl, id: "SmartShopperIntro", browserExecutable: executable });

for (const f of frames) {
  const out = path.resolve(`out/frame_${String(f).padStart(4, "0")}.png`);
  await renderStill({
    composition,
    serveUrl,
    output: out,
    frame: f,
    browserExecutable: executable,
    chromiumOptions: { gl: "angle" },
  });
  console.log("shot", f, "->", out);
}
process.exit(0);
