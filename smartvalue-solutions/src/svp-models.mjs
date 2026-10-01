// Illustrative models behind the hero controls. Not client data: they show how
// the decisions trade off, and the pages label them as illustrative.
// Shared by build.mjs (the first readouts are written into the HTML, so the
// page reads correctly before any JavaScript runs) and by the browser, where
// build.mjs inlines this file ahead of svp-hero-3d.js.

export const fmtPct = (x, d = 1) => {
  const v = Math.round(x * 10 ** d) / 10 ** d;
  return (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(d) + '%';
};

// Price Optimizer: a category where volume reacts more steeply the further
// price moves. Gross margin is 40% at today's price.
export const PRICE_MODEL = {
  min: -10, max: 15, step: 0.5,
  guardrail: -2,                       // worst acceptable volume change, %
  cost: 0.6,                           // unit cost as a share of today's price
  k1: 0.34, k2: 0.032,                 // volume response: linear + accelerating term
  volume(p) { return -this.k1 * p - this.k2 * p * Math.abs(p); },
  at(p) {
    const vol = this.volume(p), q = 1 + vol / 100, price = 1 + p / 100;
    return { p, vol, rev: (price * q - 1) * 100, mar: (((price - this.cost) * q) / (1 - this.cost) - 1) * 100 };
  },
  guardrailPrice() {                   // price change at which volume hits the guardrail
    return (-this.k1 + Math.sqrt(this.k1 ** 2 - 4 * this.k2 * this.guardrail)) / (2 * this.k2);
  },
  best() {                             // best margin while volume stays inside the guardrail
    let best = null;
    for (let i = 0; this.min + i * this.step <= this.max + 1e-9; i++) {
      const r = this.at(this.min + i * this.step);
      if (r.vol >= this.guardrail && (!best || r.mar > best.mar)) best = r;
    }
    return best;
  },
  verdict(r) {
    const b = this.best(), g = fmtPct(this.guardrail, 0);
    if (Math.abs(r.p - b.p) < 0.01) return `Recommended: ${fmtPct(b.p)}. The best margin that keeps volume inside the ${g} guardrail.`;
    if (r.vol < this.guardrail) return `Too far: volume drops ${Math.abs(r.vol).toFixed(1)}%, past the ${g} guardrail, and shoppers start switching.`;
    if (r.p < 0) return `A price cut adds volume but gives margin away (${fmtPct(r.mar)}).`;
    if (r.p === 0) return 'Today’s price. Move the slider to test a change.';
    return `Inside the guardrail, with room to go. The recommended move is ${fmtPct(b.p)}.`;
  },
};

// Promotion Planner: four promotions on the same SKU. Weeks are 0–11; the
// dip lands in the week after each promotion ends.
export const PROMO_MODEL = {
  promos: [
    { label: 'Price cut −20%', start: 2, len: 2, uplift: 38, dip: 12, roi: 0.6,
      note: 'Most volume, least return. Much of the uplift would have sold anyway, and the dip afterwards eats more: 0.6× its trade spend.' },
    { label: 'Multibuy 3 for 2', start: 6, len: 3, uplift: 29, dip: 8, roi: 0.9,
      note: 'Strong volume, but shoppers stock up and buy less for weeks after. It returns 0.9×, just under break-even.' },
    { label: 'Feature + display', start: 3, len: 2, uplift: 21, dip: 3, roi: 1.6,
      note: 'The best return of the four: 1.6× its trade spend, with almost no dip afterwards.' },
    { label: 'Price cut −10%', start: 8, len: 2, uplift: 14, dip: 2, roi: 1.1,
      note: 'Modest uplift, a small dip and a positive return of 1.1×. A safe one to repeat.' },
  ],
  bestIndex() { return this.promos.reduce((b, p, i, a) => (p.roi > a[b].roi ? i : b), 0); },
};
