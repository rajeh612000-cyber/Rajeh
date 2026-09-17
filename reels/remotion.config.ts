import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setCodec('h264');
Config.setCrf(18);
Config.setPixelFormat('yuv420p');
Config.setChromiumOpenGlRenderer('angle-egl');
Config.setEntryPoint('./src/index.ts');
Config.setOverwriteOutput(true);

/**
 * Inline the woff2 faces and the baked grain tile into the bundle as data
 * URIs. Fetching them over
 * Remotion's static server works for a still, but a long render reloads the
 * page part-way through and the refetch can hang — which surfaces as a
 * delayRender() timeout. Inlining removes the network from the render path.
 */
Config.overrideWebpackConfig((config) => ({
  ...config,
  module: {
    ...config.module,
    rules: [...(config.module?.rules ?? []), {test: /\.(woff2|png)$/, type: 'asset/inline'}],
  },
}));

// One tab, generous timeout: the grain filter is GPU-heavy at 1080x1920 and a
// second parallel tab starves it on small machines, which shows up as a
// delayRender() timeout rather than an obvious out-of-memory error.
Config.setConcurrency(1);
Config.setDelayRenderTimeoutInMilliseconds(120000);
