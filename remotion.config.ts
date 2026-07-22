import { Config } from "@remotion/cli/config";

// 16:9, 1920x1080, 30fps master.
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setConcurrency(2);

// H.264 for a LinkedIn/YouTube-ready .mp4.
Config.setCodec("h264");
Config.setCrf(18);

// Use the pre-installed Chromium in this sandbox instead of downloading one.
if (process.env.REMOTION_BROWSER_EXECUTABLE) {
  Config.setBrowserExecutable(process.env.REMOTION_BROWSER_EXECUTABLE);
}

// Static assets (audio, captions.json, logo, fonts) live in ./public
Config.setPublicDir("public");
