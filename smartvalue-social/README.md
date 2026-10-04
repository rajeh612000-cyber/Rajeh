# Smart Value: social posts

| Post | Files |
|---|---|
| Static (1080×1350, exported at 2×) | `static-post/smartvalue-static-post.jpg`, caption in `static-post/caption.md` |

The 3D visuals are the same Three.js scenes as the website pages (`../smartvalue-solutions/src/`), rendered as stills.
`3d-scene-viewer.js` is the interactive version of both scenes for the Three.js viewer.

Rebuild after editing `static-post/template.html`:

```
npm install            # Playwright
node build-post.mjs    # inlines the website's 3D scenes into static-post/post.html
node render.mjs        # writes static-post/smartvalue-static-post.jpg
```

Claims on the post come from the Smart Value deck: 92% model confidence (validated against real market outcomes,
on an actual pricing recommendation) and 2.7× blended ROI (simulated).
