import { createRequire } from 'node:module';
import { startServer } from '../render/serve.mjs';
const require = createRequire(import.meta.url);
const { chromium } = require('../render/node_modules/playwright-core');

const { port, close } = await startServer({ root: process.cwd(), port: 0 });
const b = await chromium.launch({ args:['--no-sandbox','--autoplay-policy=no-user-gesture-required'] });
const p = await b.newPage({ viewport:{width:1040,height:800} });
await p.goto(`http://127.0.0.1:${port}/test.html`, { waitUntil:'networkidle' });
await p.waitForFunction(() => { const v=document.querySelector('.sv-scene1-video'); return v && v.readyState>=2; }, {timeout:15000});
console.log('clip loaded:', JSON.stringify(await p.evaluate(()=>window.__syncProbe())));

// 1. scrub while paused -> video should follow exactly
for (const t of [0, 3.5, 8.2, 11.5]) {
  await p.evaluate(v => window.__test.setT(v), t);
  await p.waitForTimeout(350);
  const s = await p.evaluate(()=>window.__syncProbe());
  console.log(`scrub t=${t}s -> video=${s.vt.toFixed(2)}s paused=${s.paused} ${Math.abs(s.vt-t)<0.15?'OK':'MISMATCH'}`);
}

// 2. press Play -> video should start playing and track
await p.evaluate(() => window.__test.setT(2));
await p.waitForTimeout(200);
await p.click('#svpPlay');
await p.waitForTimeout(1500);
const during = await p.evaluate(()=>({...window.__syncProbe(), t: window.__test.getT()}));
console.log(`playing: storyboard=${during.t.toFixed(2)}s video=${during.vt.toFixed(2)}s paused=${during.paused} drift=${Math.abs(during.t-during.vt).toFixed(3)}s ${!during.paused && Math.abs(during.t-during.vt)<0.35?'OK':'FAIL'}`);

// 3. press Pause -> video should pause
await p.click('#svpPlay');
await p.waitForTimeout(500);
const after = await p.evaluate(()=>window.__syncProbe());
console.log(`paused: video paused=${after.paused} ${after.paused?'OK':'FAIL'}`);

// 4. scene 2 (t=15) -> video must stop
await p.evaluate(() => window.__test.setT(15));
await p.waitForTimeout(400);
const s2 = await p.evaluate(()=>window.__syncProbe());
console.log(`scene2: video paused=${s2.paused} ${s2.paused?'OK':'FAIL'}`);

// 5. placeholder text hidden?
const hidden = await p.evaluate(() => {
  const c=document.querySelector('.ph-card');
  return { title: getComputedStyle(c.querySelector('.ph-title')).display,
           badge: getComputedStyle(c.querySelector('.ph-badge')).display };
});
console.log(`placeholder text display=${hidden.title} (want none), badge=${hidden.badge} (want block)`);

await p.evaluate(() => window.__test.setT(5));
await p.waitForTimeout(400);
await p.screenshot({ path:'shot.png' });
await b.close(); close();
