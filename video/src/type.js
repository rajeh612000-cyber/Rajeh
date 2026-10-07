/**
 * The type layer.
 *
 * The 3D world is canvas; the typography is DOM composited over it. That is a
 * deliberate choice, not a shortcut: it gives us the real Sora variable font
 * with real kerning at any size, and the --svp-radius cut corner as an exact
 * CSS value rather than a modelled approximation. The frame grabber captures
 * the composited page, so the two layers land as one image.
 */

import gsap from 'gsap';
import { RADIUS } from './brand.js';

const layer = () => document.getElementById('type');

function el(tag, cls, style = {}) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  Object.assign(n.style, style);
  return n;
}

/**
 * Everything starts invisible and is revealed by the timeline, never by load
 * order. Centring goes through GSAP's own transform system (xPercent/yPercent)
 * rather than a CSS translate, so later tweens on `y` compose with it instead
 * of fighting it.
 */
function mount(node) {
  layer().appendChild(node);
  gsap.set(node, { opacity: 0, xPercent: -50, yPercent: -50 });
  return node;
}

/**
 * A kicker: wide-tracked small caps. Used for section labels and axis names.
 */
export function kicker(text, { x = 50, y = 50, align = 'center', color = 'var(--num)', size = 15 } = {}) {
  const n = el('div', 'tx-kicker', {
    left: x + '%', top: y + '%', textAlign: align, color,
    fontSize: size + 'px',
  });
  n.innerHTML = text;
  return mount(n);
}

/**
 * A statement: the film's voice. No voiceover, so these carry the argument.
 * Weight 300 for the setup, 700 for the point.
 */
export function statement(html, { x = 50, y = 50, align = 'center', size = 54, weight = 300, color = '#fff', width = 62 } = {}) {
  const n = el('div', 'tx-statement', {
    left: x + '%', top: y + '%', textAlign: align,
    fontSize: size + 'px', fontWeight: String(weight), color,
    maxWidth: width + 'vw',
  });
  n.innerHTML = html;
  return mount(n);
}

/** A tag chip — the SKU / retailer / channel qualifiers. Carries the cut corner. */
export function chip(text, { x = 50, y = 50, color = 'var(--border)', bg = 'rgba(119,81,255,.16)', border = 'rgba(224,223,248,.35)' } = {}) {
  const n = el('div', 'tx-chip', {
    left: x + '%', top: y + '%',
    color, background: bg, border: '1px solid ' + border,
    borderRadius: RADIUS.chip,
  });
  n.innerHTML = text;
  return mount(n);
}

/**
 * A glass card. This is the --svp-radius shape at full size: three soft
 * corners and one sharp cut at bottom-left.
 */
export function card({ x, y, w = 300, h = 170, accent = null } = {}) {
  const n = el('div', 'tx-card', {
    left: x + '%', top: y + '%', width: w + 'px', minHeight: h + 'px',
    borderRadius: RADIUS.card,
  });
  if (accent) n.style.boxShadow = `inset 3px 0 0 ${accent}, 0 10px 28px rgba(83,74,183,.12)`;
  return mount(n);
}

/**
 * A number that counts up. Numbers in this film are never cut to — they are
 * arrived at. The buyer has to watch the figure be computed.
 */
export function counter(initial = 0, { decimals = 1, suffix = '%', signed = true } = {}) {
  const state = { v: initial };
  const n = el('span', 'tx-counter');
  const paint = () => {
    const v = state.v;
    const sign = signed ? (v > 0.0001 ? '+' : v < -0.0001 ? '−' : '') : '';
    n.textContent = sign + Math.abs(v).toFixed(decimals) + suffix;
  };
  paint();
  state.paint = paint;
  state.el = n;
  return state;
}

/** A thin rule. Used to measure the gaps in the pack-price ladder. */
export function rule({ x, y, w = 10, color = 'rgba(160,157,232,.55)' } = {}) {
  const n = el('div', 'tx-rule', { left: x + '%', top: y + '%', width: w + '%', background: color });
  return mount(n);
}

/** The one orange moment. Reserved. */
export function marker(text, { x = 50, y = 50 } = {}) {
  const n = el('div', 'tx-marker', {
    left: x + '%', top: y + '%',
    borderRadius: RADIUS.chip,
  });
  n.innerHTML = text;
  return mount(n);
}

export function clearLayer() {
  const l = layer();
  while (l.firstChild) l.removeChild(l.firstChild);
}
