/** Webpack inlines these as base64 data URIs — see remotion.config.ts. */
declare module '*.woff2' {
  const dataUri: string;
  export default dataUri;
}

declare module '*.png' {
  const dataUri: string;
  export default dataUri;
}
