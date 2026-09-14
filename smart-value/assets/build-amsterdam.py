#!/usr/bin/env python3
"""
Builds the Amsterdam hero illustration for the email.

A row of canal houses using the four gable types you actually see on the
Herengracht: step (trapgevel), bell (klokgevel), neck (halsgevel) and spout.
Two depth layers, a canal reflection under a waterline, and a handful of lit
windows in amber.

Deterministic: a fixed seed, no randomness at render time, so rebuilding gives
byte-identical output.

Output: amsterdam-hero.svg, rendered to PNG by build.sh at 2x.
"""
import random

W, H = 1200, 660
WATER = 468          # waterline: houses sit on this, reflection falls below
SKY = "#1A1A4E"      # ink navy, matches the email hero exactly

# Two layers. Back row sits further off and much fainter, which is what stops
# the strip reading as a flat cardboard cutout.
LAYERS = [
    dict(fill="#3A3A82", op=0.30, base=WATER - 6, hmin=130, hmax=210, wmin=30, wmax=44, lit=0.10),
    dict(fill="#2E2E72", op=0.52, base=WATER,     hmin=165, hmax=290, wmin=34, wmax=52, lit=0.24),
]

rnd = random.Random(20260914)
parts = []


def step_gable(x, w, top, gh):
    """Trapgevel. Stepped shoulders climbing to a narrow flat cap."""
    steps = rnd.choice([3, 4])
    run = (w * 0.34) / steps
    rise = gh / (steps + 0.6)
    d = [f"M{x},{top + gh}"]
    for i in range(steps):
        d.append(f"L{x + i * run},{top + gh - i * rise}")
        d.append(f"L{x + (i + 1) * run},{top + gh - i * rise}")
    d.append(f"L{x + w * 0.34},{top}")
    d.append(f"L{x + w * 0.66},{top}")
    for i in range(steps - 1, -1, -1):
        d.append(f"L{x + w - (i + 1) * run},{top + gh - i * rise}")
        d.append(f"L{x + w - i * run},{top + gh - i * rise}")
    d.append(f"L{x + w},{top + gh}Z")
    return " ".join(d)


def bell_gable(x, w, top, gh):
    """Klokgevel. Shoulders flare out, then a bell curve up to the cap."""
    return (
        f"M{x},{top + gh} "
        f"C{x},{top + gh * 0.42} {x + w * 0.26},{top + gh * 0.66} {x + w * 0.28},{top + gh * 0.20} "
        f"C{x + w * 0.30},{top - gh * 0.04} {x + w * 0.70},{top - gh * 0.04} {x + w * 0.72},{top + gh * 0.20} "
        f"C{x + w * 0.74},{top + gh * 0.66} {x + w},{top + gh * 0.42} {x + w},{top + gh} Z"
    )


def neck_gable(x, w, top, gh):
    """Halsgevel. A raised narrow centre with scrolled shoulders either side."""
    return (
        f"M{x},{top + gh} L{x},{top + gh * 0.58} "
        f"C{x + w * 0.08},{top + gh * 0.58} {x + w * 0.30},{top + gh * 0.52} {x + w * 0.32},{top + gh * 0.14} "
        f"L{x + w * 0.32},{top} L{x + w * 0.68},{top} L{x + w * 0.68},{top + gh * 0.14} "
        f"C{x + w * 0.70},{top + gh * 0.52} {x + w * 0.92},{top + gh * 0.58} {x + w},{top + gh * 0.58} "
        f"L{x + w},{top + gh} Z"
    )


def spout_gable(x, w, top, gh):
    """Spout gable. The plain pitched roof, oldest and commonest of the four."""
    return f"M{x},{top + gh} L{x + w * 0.50},{top} L{x + w},{top + gh} Z"


GABLES = [step_gable, bell_gable, neck_gable, spout_gable]


def house(x, w, h, layer, out):
    """One facade: body, gable crown, window grid, occasional lit window."""
    base = layer["base"]
    top = base - h
    out.append(f'<rect x="{x:.1f}" y="{top:.1f}" width="{w:.1f}" height="{h:.1f}"/>')
    gh = w * rnd.uniform(0.80, 1.15)
    out.append(f'<path d="{rnd.choice(GABLES)(x, w, top - gh, gh)}"/>')

    # Windows: a grid inset from the facade edges, skipping the gable crown.
    cols = 1 if w < 40 else 2
    pad = w * 0.20
    gap = (w - 2 * pad) / cols
    ww, wh = gap * 0.56, gap * 1.15
    rows = int((h - 24) // (wh + 13))
    for r in range(rows):
        wy = top + 16 + r * (wh + 13)
        for c in range(cols):
            wx = x + pad + c * gap + (gap - ww) / 2
            lit = rnd.random() < layer["lit"]
            fill = '#F19526" opacity="0.55' if lit else '#12123A" opacity="0.5'
            out.append(f'<rect x="{wx:.1f}" y="{wy:.1f}" width="{ww:.1f}" height="{wh:.1f}" rx="1" fill="{fill}"/>')


def row(layer, start_x, gap_range):
    """Lay a terrace of houses left to right, then mirror it into the canal."""
    shapes, x = [], start_x
    while x < W + 60:
        w = rnd.uniform(layer["wmin"], layer["wmax"])
        h = rnd.uniform(layer["hmin"], layer["hmax"])
        house(x, w, h, layer, shapes)
        x += w + rnd.uniform(*gap_range)
    body = "".join(shapes)

    g = [f'<g fill="{layer["fill"]}" opacity="{layer["op"]}">{body}</g>']
    # Reflection: flipped about the waterline, faded hard. Amsterdam canals are
    # dark and still, so the mirror image is present but barely legible.
    g.append(
        f'<g fill="{layer["fill"]}" opacity="{layer["op"] * 0.34:.3f}" '
        f'transform="translate(0,{2 * WATER}) scale(1,-1)" '
        f'style="filter:url(#soften)">{body}</g>'
    )
    return "".join(g)


parts.append(f'<rect width="{W}" height="{H}" fill="{SKY}"/>')
# A faint glow behind the rooftops so the silhouette has something to sit against.
parts.append(f'<rect width="{W}" height="{H}" fill="url(#glow)"/>')
parts.append(row(LAYERS[0], -30, (8, 22)))
parts.append(row(LAYERS[1], -20, (2, 7)))

# Waterline, and a few ripple bands breaking up the reflection.
parts.append(f'<rect x="0" y="{WATER}" width="{W}" height="1.5" fill="#7751FF" opacity="0.22"/>')
for i, (y, o) in enumerate([(486, 0.13), (508, 0.10), (534, 0.08), (566, 0.06), (604, 0.05)]):
    parts.append(f'<rect x="0" y="{y}" width="{W}" height="{3 + i}" fill="{SKY}" opacity="{o + 0.5}"/>')

# The canal fades to flat navy at the bottom so the email body meets a clean edge.
parts.append(f'<rect x="0" y="{WATER}" width="{W}" height="{H - WATER}" fill="url(#sink)"/>')

# Scrim over the left two thirds. The headline and button sit here, and white
# text on a busy silhouette is the one way this illustration could hurt rather
# than help. Costs nothing on the right, where the skyline stays readable.
parts.append(f'<rect width="{W}" height="{H}" fill="url(#scrim)"/>')

svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">
<defs>
  <radialGradient id="glow" cx="0.62" cy="0.70" r="0.75">
    <stop offset="0" stop-color="#7751FF" stop-opacity="0.20"/>
    <stop offset="0.55" stop-color="#7751FF" stop-opacity="0.06"/>
    <stop offset="1" stop-color="#7751FF" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="sink" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="{SKY}" stop-opacity="0"/>
    <stop offset="0.62" stop-color="{SKY}" stop-opacity="0.72"/>
    <stop offset="1" stop-color="{SKY}" stop-opacity="1"/>
  </linearGradient>
  <linearGradient id="scrim" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="{SKY}" stop-opacity="0.80"/>
    <stop offset="0.38" stop-color="{SKY}" stop-opacity="0.58"/>
    <stop offset="0.72" stop-color="{SKY}" stop-opacity="0.18"/>
    <stop offset="1" stop-color="{SKY}" stop-opacity="0.05"/>
  </linearGradient>
  <filter id="soften" x="-5%" y="-5%" width="110%" height="110%">
    <feGaussianBlur stdDeviation="1.6"/>
  </filter>
</defs>
{"".join(parts)}
</svg>'''

open("amsterdam-hero.svg", "w").write(svg)
print(f"amsterdam-hero.svg written, {len(svg) / 1024:.1f} KB source")
