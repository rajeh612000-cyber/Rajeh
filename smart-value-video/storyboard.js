/* Smart Value storyboard — interactive preview + deterministic render API.
 *
 * Two consumers:
 *   1. A human clicking Play in a browser (real-time playback).
 *   2. render/render.mjs, which drives window.__SVP.seek(t) frame by frame and
 *      screenshots. Nothing in the render path may depend on wall-clock time —
 *      CSS animations are pinned via the Web Animations API and <video>
 *      elements are seeked explicitly.
 */
(function () {
  'use strict';

  var SCENES = [
    { start: 0,  end: 12, type: 'live', title: 'Scene 1 · Live speaker',            caption: '"FMCG teams are surrounded by data — sales reports, EPOS, Nielsen or Circana, pricing files, promo calendars, retailer feedback, finance assumptions. The problem was never having enough data. It\'s knowing what decision to make next."' },
    { start: 12, end: 22, type: 'live', title: 'Scene 2 · Live speaker',            caption: '"Smart Value™ is a Commercial Decision Intelligence solution — built to help FMCG teams turn complex business information into faster, more confident, more profitable decisions."' },
    { start: 22, end: 35, type: 'anim', title: 'Scene 3 · Animated',                caption: '"These are the decisions behind growth: pricing and margin, promotion ROI, trade investment, price-pack architecture, assortment and distribution, brand and portfolio growth."' },
    { start: 35, end: 52, type: 'anim', title: 'Scene 4 · Animated',                caption: '"Commercial Analytics shows teams what is happening. Planning and Simulation lets them test what could happen. AI Decision Support helps them decide — and act — with confidence."' },
    { start: 52, end: 68, type: 'anim', title: 'Scene 5 · Animated',                caption: '"Behind the interface, Smart Value connects commercial data, harmonizes it, diagnoses performance, models scenarios, and explains the logic behind every recommendation."' },
    { start: 68, end: 80, type: 'live', title: 'Scene 6 · Live speaker',            caption: '"Smart Value isn\'t here to replace commercial judgment. It\'s here to strengthen it — helping teams move from data, to decisions, to action."' },
    { start: 80, end: 96, type: 'anim', title: 'Scene 7 · Animated (closing card)', caption: '"Smart Value™ AI Solutions. Human expertise. AI execution. Smarter decisions. Book a demo to see the decisions behind growth."' }
  ];
  var TOTAL = SCENES[SCENES.length - 1].end;

  var params    = new URLSearchParams(location.search);
  var RENDER    = params.get('render') === '1';
  if (RENDER) document.documentElement.classList.add('render-mode');

  var stage     = document.getElementById('svpStage');
  var sceneEls  = Array.prototype.slice.call(stage.querySelectorAll('.scene'));
  var timeline  = document.getElementById('svpTimeline');
  var playhead  = document.getElementById('svpPlayhead');
  var captionEl = document.getElementById('svpCaption');
  var timeEl    = document.getElementById('svpTime');
  var playBtn   = document.getElementById('svpPlay');
  var resetBtn  = document.getElementById('svpRestart');

  /* ---------------------------------------------------------------- videos */

  var videos = Array.prototype.slice.call(stage.querySelectorAll('video[data-src]'));

  function sceneIndexOfNode(node) {
    for (var i = 0; i < sceneEls.length; i++) if (sceneEls[i].contains(node)) return i;
    return -1;
  }

  // Resolves once every declared clip has either loaded or failed. A missing
  // file is not fatal: the slot keeps .is-empty and the fallback card shows.
  function loadVideos() {
    return Promise.all(videos.map(function (v) {
      return new Promise(function (resolve) {
        var slot = v.closest('[data-video-slot]');
        var done = function (ok) {
          if (ok) slot && slot.classList.remove('is-empty');
          resolve({ src: v.dataset.src, ok: ok, duration: ok ? v.duration : 0,
                    width: v.videoWidth, height: v.videoHeight,
                    scene: sceneIndexOfNode(v) });
        };
        v.addEventListener('loadeddata', function () { done(true); },  { once: true });
        v.addEventListener('error',      function () { done(false); }, { once: true });
        v.src = v.dataset.src;
        v.load();
      });
    }));
  }

  /* ------------------------------------------------------------ scene state */

  var t = 0;
  var playing = false;
  var lastTs = null;
  var activeIdx = -1;

  function fmt(sec) {
    var m = Math.floor(sec / 60), s = Math.floor(sec % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function indexAt(time) {
    for (var i = 0; i < SCENES.length; i++) {
      if (time >= SCENES[i].start && time < SCENES[i].end) return i;
    }
    return SCENES.length - 1;
  }

  // Swapping .on tears down and rebuilds the scene's CSS animations, so callers
  // must yield a frame afterwards before touching getAnimations().
  function activate(idx) {
    if (idx === activeIdx) return false;
    sceneEls.forEach(function (el) { el.classList.remove('on'); });
    void stage.offsetWidth;                       // force reflow → restart anims
    sceneEls[idx].classList.add('on');
    activeIdx = idx;
    if (captionEl) {
      captionEl.innerHTML = '<b>' + SCENES[idx].title + '</b>' + SCENES[idx].caption;
    }
    return true;
  }

  function nextFrame() {
    return new Promise(function (r) {
      requestAnimationFrame(function () { requestAnimationFrame(r); });
    });
  }

  /* Pin every CSS animation inside the active scene to `localMs`.
   * Web Animations `currentTime` is measured from the start of the animation
   * *including* its animation-delay, so localMs is simply scene-local time. */
  function pinAnimations(localMs) {
    var scene = sceneEls[activeIdx];
    var anims = document.getAnimations ? document.getAnimations() : [];
    for (var i = 0; i < anims.length; i++) {
      var a = anims[i];
      var target = a.effect && a.effect.target;
      if (!target || !scene.contains(target)) continue;
      try {
        a.pause();
        a.currentTime = localMs;
      } catch (e) { /* animation may have been cancelled mid-swap */ }
    }
  }

  function seekVideos(localSec) {
    var scene = sceneEls[activeIdx];
    var inScene = videos.filter(function (v) {
      return scene.contains(v) && v.readyState >= 1 && isFinite(v.duration);
    });
    return Promise.all(inScene.map(function (v) {
      var want = Math.max(0, Math.min(localSec, Math.max(0, v.duration - 0.001)));
      if (Math.abs(v.currentTime - want) < 1e-3) return Promise.resolve();
      return new Promise(function (resolve) {
        var to = setTimeout(resolve, 5000);
        v.addEventListener('seeked', function h() {
          clearTimeout(to);
          v.removeEventListener('seeked', h);
          resolve();
        }, { once: true });
        v.currentTime = want;
      });
    }));
  }

  function paintChrome() {
    if (playhead) playhead.style.left = (t / TOTAL * 100) + '%';
    if (timeEl)   timeEl.textContent  = fmt(t) + ' / ' + fmt(TOTAL);
  }

  /* -------------------------------------------------- deterministic seeking */

  async function seekTo(time) {
    t = Math.max(0, Math.min(time, TOTAL));
    var idx = indexAt(t);
    var swapped = activate(idx);
    if (swapped) await nextFrame();

    var local = t - SCENES[idx].start;
    pinAnimations(local * 1000);
    await seekVideos(local);
    paintChrome();
    await nextFrame();          // let the compositor commit before a screenshot
  }

  /* ----------------------------------------------------- real-time playback */

  function syncPlaybackVideos() {
    var scene = sceneEls[activeIdx];
    videos.forEach(function (v) {
      var inScene = scene && scene.contains(v);
      if (inScene && playing) { if (v.paused) v.play().catch(function () {}); }
      else if (!v.paused) v.pause();
    });
  }

  function render(force) {
    var idx = indexAt(t);
    var swapped = activate(idx);
    if (swapped || force) {
      if (force && !swapped) {
        sceneEls.forEach(function (el) { el.classList.remove('on'); });
        void stage.offsetWidth;
        sceneEls[idx].classList.add('on');
      }
      var local = t - SCENES[idx].start;
      videos.forEach(function (v) {
        if (sceneEls[idx].contains(v) && v.readyState >= 1) {
          try { v.currentTime = Math.max(0, Math.min(local, v.duration - 0.001)); } catch (e) {}
        }
      });
    }
    syncPlaybackVideos();
    paintChrome();
  }

  function tick(ts) {
    if (!playing) return;
    if (lastTs === null) lastTs = ts;
    t += (ts - lastTs) / 1000;
    lastTs = ts;
    if (t >= TOTAL) {
      t = TOTAL; playing = false;
      if (playBtn) playBtn.textContent = '▶ Play';
      render(); syncPlaybackVideos(); return;
    }
    render();
    requestAnimationFrame(tick);
  }

  /* ------------------------------------------------------------------ chrome */

  if (timeline) {
    SCENES.forEach(function (s, i) {
      var seg = document.createElement('div');
      seg.className = 'seg ' + s.type;
      seg.style.flex = (s.end - s.start);
      seg.innerHTML = '<span>' + (i + 1) + '</span>';
      seg.addEventListener('click', function () { t = s.start; render(true); });
      timeline.appendChild(seg);
    });
  }

  if (playBtn) playBtn.addEventListener('click', function () {
    playing = !playing;
    playBtn.textContent = playing ? '⏸ Pause' : '▶ Play';
    if (playing) { lastTs = null; requestAnimationFrame(tick); }
    syncPlaybackVideos();
  });
  if (resetBtn) resetBtn.addEventListener('click', function () { t = 0; render(true); });

  /* --------------------------------------------------------------- public API */

  var readyPromise = null;

  window.__SVP = {
    scenes: SCENES,
    total: TOTAL,
    /* Wait for fonts + clips. Renderer awaits this before frame 0. */
    ready: function () {
      if (!readyPromise) {
        readyPromise = Promise.all([
          document.fonts ? document.fonts.ready : Promise.resolve(),
          loadVideos()
        ]).then(function (r) { return { videos: r[1] }; });
      }
      return readyPromise;
    },
    seek: seekTo,
    sceneAt: indexAt
  };

  render(true);
})();
