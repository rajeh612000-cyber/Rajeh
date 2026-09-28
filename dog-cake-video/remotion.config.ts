import {Config} from '@remotion/cli/config';

// High-quality intermediate render; scripts/finish.sh does the final ffmpeg encode.
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setCodec('h264');
Config.setCrf(12);
Config.setOverwriteOutput(true);
