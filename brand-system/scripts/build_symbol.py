#!/usr/bin/env python3
"""Generate the Smart Value(TM) isometric symbol as a clean, scalable SVG.

Geometry is derived from the original brand mark: a front "decision" rhombus
carrying a connected-node network, an ice-blue wireframe cube emerging up-right
(structured data) and a purple prism on the left. Coordinates were measured from
the source logo (viewBox 0 0 306 234).
"""
import sys

# ---- measured anchor points (source px) --------------------------------------
L = (13, 110)      # left node   (west vertex of front rhombus)
T = (107, 56)      # top node    (north vertex)
R = (202, 119)     # right node  (east vertex)
B = (108, 173)     # bottom node (south vertex)
H = (107.5, 114.5) # centre hub

def add(p, q): return (p[0] + q[0], p[1] + q[1])
def sub(p, q): return (p[0] - q[0], p[1] - q[1])
def pts(*ps): return " ".join(f"{x:.1f},{y:.1f}" for x, y in ps)

a = sub(T, L)      # (94,-54) up-right ground edge
# ice cube (up-right neighbour of the front rhombus)
ice_top   = add(T, a)          # (201,2)
ice_right = add(R, a)          # (296,65)
VH = (0, 58)                   # vertical height (straight down)
Tb, Rb = add(T, VH), add(R, VH)
ice_top_b, ice_right_b = add(ice_top, VH), add(ice_right, VH)

# left purple prism: two triangles converging on the west node
topcap = (95, 8)               # apex above the T-L edge
botcap = (95, 220)             # apex below the L-B edge

def build():
    P = []
    P.append('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 306 234" '
             'fill="none" role="img" aria-label="Smart Value symbol">')
    P.append('''<defs>
      <linearGradient id="iceTop" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#EAF3FE"/><stop offset="1" stop-color="#CFE4FC"/>
      </linearGradient>
      <linearGradient id="peri" x1="0" y1="0" x2="0.6" y2="1">
        <stop offset="0" stop-color="#9AA2F6"/><stop offset="1" stop-color="#7C7FEB"/>
      </linearGradient>
      <radialGradient id="node" cx="0.35" cy="0.30" r="0.85">
        <stop offset="0" stop-color="#5E9BF9"/><stop offset="0.55" stop-color="#2F7BF5"/>
        <stop offset="1" stop-color="#2464E8"/>
      </radialGradient>
      <linearGradient id="edge" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#3B82F6"/><stop offset="1" stop-color="#7C86F0"/>
      </linearGradient>
    </defs>''')

    # ---- left purple prism (two triangles converging on the west node) ----
    P.append(f'<polygon points="{pts(L,T,topcap)}" fill="#594E9C"/>')
    P.append(f'<polygon points="{pts(L,B,botcap)}" fill="#443A7C"/>')
    P.append(f'<line x1="{topcap[0]}" y1="{topcap[1]}" x2="{L[0]}" y2="{L[1]}" stroke="#6E62B4" stroke-width="1.2" stroke-opacity="0.7"/>')
    P.append(f'<line x1="{botcap[0]}" y1="{botcap[1]}" x2="{L[0]}" y2="{L[1]}" stroke="#5A4EA0" stroke-width="1.2" stroke-opacity="0.7"/>')

    # ---- ice cube (translucent ice-blue solid, up-right) ----
    P.append(f'<polygon points="{pts(Tb,ice_top_b,ice_right_b,Rb)}" fill="none" stroke="#BFE0FF" stroke-width="1.3" stroke-opacity="0.45"/>')
    P.append(f'<polygon points="{pts(R,ice_right,ice_right_b,Rb)}" fill="#C6DFFB" fill-opacity="0.30" stroke="url(#edge)" stroke-width="2"/>')
    P.append(f'<polygon points="{pts(T,R,Rb,Tb)}" fill="#DCEBFB" fill-opacity="0.42" stroke="url(#edge)" stroke-width="2"/>')
    P.append(f'<polygon points="{pts(T,ice_top,ice_right,R)}" fill="url(#iceTop)" fill-opacity="0.9" stroke="url(#edge)" stroke-width="2"/>')
    P.append(f'<line x1="{ice_top[0]:.1f}" y1="{ice_top[1]:.1f}" x2="{ice_top_b[0]:.1f}" y2="{ice_top_b[1]:.1f}" stroke="#7FB0F2" stroke-width="1.3" stroke-opacity="0.55"/>')

    # ---- periwinkle front decision face (translucent) ----
    P.append(f'<polygon points="{pts(L,T,R,B)}" fill="url(#peri)" fill-opacity="0.5" stroke="#8E93F0" stroke-width="1.5" stroke-opacity="0.6"/>')

    # ---- network diagonals ----
    P.append(f'<line x1="{L[0]}" y1="{L[1]}" x2="{R[0]}" y2="{R[1]}" stroke="#8CA0F2" stroke-width="2.2" stroke-dasharray="2 7" stroke-linecap="round"/>')
    P.append(f'<line x1="{T[0]}" y1="{T[1]}" x2="{B[0]}" y2="{B[1]}" stroke="#6C63D8" stroke-width="2.6"/>')

    # ---- accent dots ----
    P.append('<circle cx="55" cy="49" r="5.5" fill="#2F7BF5"/>')
    P.append('<circle cx="70" cy="99" r="4" fill="#7751FF" fill-opacity="0.9"/>')
    P.append('<circle cx="152" cy="150" r="4.5" fill="#1A1A4E"/>')

    # ---- nodes ----
    for (cx, cy), rr in [(T, 11), (L, 11), (R, 11.5)]:
        P.append(f'<circle cx="{cx}" cy="{cy}" r="{rr}" fill="url(#node)"/>')
    P.append(f'<circle cx="{B[0]}" cy="{B[1]}" r="6" fill="#1A1A4E"/>')

    # ---- central hub ----
    P.append(f'<circle cx="{H[0]}" cy="{H[1]}" r="15" fill="url(#node)"/>')
    P.append(f'<circle cx="{H[0]}" cy="{H[1]}" r="9.5" fill="#FFFFFF"/>')
    P.append(f'<rect x="{H[0]-4.5:.1f}" y="{H[1]-1.4:.1f}" width="9" height="2.8" rx="1.4" fill="#2F7BF5"/>')

    P.append('</svg>')
    return "\n".join(P)

if __name__ == "__main__":
    out = sys.argv[1] if len(sys.argv) > 1 else "symbol.svg"
    with open(out, "w") as f:
        f.write(build())
    print("wrote", out)
