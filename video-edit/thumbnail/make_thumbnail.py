#!/usr/bin/env python3
"""
YouTube thumbnail builder for the Human in the Loop series.

Renders a 1280x720 thumbnail designed to stay readable at feed-card size
(roughly 210px wide), which is where almost every impression actually happens.

    python make_thumbnail.py --guest susan.png --host mariam.png \
        --line1 "TWO AI REPORTS" --line2 "MISSED IT" --variant A

Variants
    A  both faces as staggered portrait cards - reads as a conversation
    B  guest dominant with the host as a circular inset - strongest single face

Needs Chromium. Point at it with --chrome, or let the script find the usual
Playwright and system locations.
"""

import argparse
import base64
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

W, H = 1280, 720

# Palette sampled from the series' own title background.
INK    = "#0B1038"
INDIGO = "#2C2181"
BLUE   = "#17428C"
AMBER  = "#FFC53D"   # accent: opposite indigo on the wheel, survives a busy feed
PAPER  = "#FFFFFF"

# Swap in the brand face here. Any .ttf works; it is embedded in the page.
FONT_CANDIDATES = [
    "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    r"C:\Windows\Fonts\arialbd.ttf",
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
]


def find_chrome(explicit=None):
    if explicit:
        return explicit
    for pat in ["/opt/pw-browsers/chromium-*/chrome-linux/chrome",
                "/opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell"]:
        hits = sorted(Path("/").glob(pat.lstrip("/")))
        if hits:
            return str(hits[-1])
    for name in ["chromium", "chromium-browser", "google-chrome", "chrome"]:
        found = shutil.which(name)
        if found:
            return found
    sys.exit("Chromium not found. Install it, or pass --chrome /path/to/chrome")


def data_uri(path, mime):
    return f"data:{mime};base64," + base64.b64encode(Path(path).read_bytes()).decode()


def font_face():
    for p in FONT_CANDIDATES:
        if Path(p).exists():
            return f"""@font-face{{font-family:'Brand';
              src:url('{data_uri(p, "font/ttf")}') format('truetype');
              font-weight:700;font-style:normal;}}"""
    print("  no bundled font found, falling back to the system sans")
    return ""


def build_html(guest, host, line1, line2, eyebrow, brand, sub, variant):
    guest_uri = data_uri(guest, "image/png")
    host_uri = data_uri(host, "image/png") if host else None

    common = f"""
    *,*::before,*::after{{margin:0;padding:0;box-sizing:border-box}}
    html,body{{background:{INK};width:{W}px;height:{H}px;overflow:hidden}}
    {font_face()}
    .canvas{{position:relative;width:{W}px;height:{H}px;overflow:hidden;
      font-family:'Brand','Liberation Sans','DejaVu Sans',Arial,sans-serif;
      background:
        radial-gradient(900px 700px at 8% 92%, {INDIGO} 0%, transparent 62%),
        radial-gradient(800px 600px at 92% 12%, {BLUE} 0%, transparent 58%),
        linear-gradient(145deg,#1A1F63 0%,{INK} 100%);}}
    .grid{{position:absolute;inset:0;opacity:.055;
      background-image:linear-gradient({PAPER} 1px,transparent 1px),
                       linear-gradient(90deg,{PAPER} 1px,transparent 1px);
      background-size:64px 64px}}
    .vig{{position:absolute;inset:0;
      background:radial-gradient(120% 100% at 30% 50%,transparent 35%,rgba(0,0,0,.55) 100%)}}
    .eyebrow{{position:absolute;left:68px;top:58px;z-index:6;font-size:21px;font-weight:700;
      letter-spacing:.44em;color:{AMBER}}}
    .eyebrow::after{{content:'';position:absolute;left:2px;bottom:-16px;width:62px;height:4px;
      background:{AMBER};border-radius:2px}}
    .head{{position:absolute;left:68px;z-index:6;transform:scaleX(.94);transform-origin:left center}}
    .l1{{font-size:84px;font-weight:700;letter-spacing:-.025em;color:{PAPER};line-height:.98;
      text-shadow:0 4px 28px rgba(0,0,0,.55)}}
    .l2{{font-size:156px;font-weight:700;letter-spacing:-.04em;color:{AMBER};line-height:.92;
      text-shadow:0 6px 34px rgba(0,0,0,.6)}}
    .brand{{position:absolute;left:68px;bottom:52px;z-index:6;display:flex;align-items:center;gap:16px}}
    .bmark{{width:30px;height:30px;border-radius:50%;border:3px solid {AMBER};position:relative}}
    .bmark::after{{content:'';position:absolute;inset:7px;border-radius:50%;background:{AMBER}}}
    .bname{{font-size:21px;font-weight:700;letter-spacing:.1em;color:rgba(255,255,255,.93)}}
    .bsub{{font-size:21px;letter-spacing:.1em;color:rgba(255,255,255,.5)}}
    .panel{{position:absolute;top:0;right:0;height:{H}px;z-index:4}}
    .shot{{position:absolute;overflow:hidden;background:{INK}}}
    .shot img{{width:100%;height:100%;object-fit:cover;display:block}}
    """

    if variant == "A":
        style = f"""
        .head{{top:208px}}
        .panel{{width:516px}}
        .shot{{border-radius:18px;box-shadow:0 18px 48px rgba(0,0,0,.5)}}
        .shot.s1{{left:14px;top:132px;width:236px;height:452px}}
        .shot.s1 img{{object-position:50% 26%}}
        .shot.s2{{left:266px;top:176px;width:236px;height:452px}}
        .shot.s2 img{{object-position:50% 30%}}
        .shot.s2::after{{content:'';position:absolute;inset:0;border-radius:18px;
          border:4px solid {AMBER}}}
        """
        panel = f"<div class='shot s1'><img src='{guest_uri}'></div>"
        if host_uri:
            panel += f"<div class='shot s2'><img src='{host_uri}'></div>"
    else:
        style = f"""
        .head{{top:206px}}
        .panel{{width:470px}}
        .panel::before{{content:'';position:absolute;left:-90px;top:0;width:190px;height:100%;z-index:3;
          background:linear-gradient(90deg,{INK} 0%,rgba(11,16,56,0) 100%)}}
        .shot.s1{{left:0;top:0;width:470px;height:{H}px}}
        .shot.s1 img{{object-position:50% 20%}}
        .inset{{position:absolute;z-index:8;right:38px;bottom:150px;width:168px;height:168px;
          border-radius:50%;overflow:hidden;border:5px solid {AMBER};
          box-shadow:0 12px 36px rgba(0,0,0,.55)}}
        .inset img{{width:100%;height:100%;object-fit:cover;object-position:50% 18%}}
        """
        panel = f"<div class='shot s1'><img src='{guest_uri}'></div>"

    inset = ""
    if variant == "B" and host_uri:
        inset = f"<div class='inset'><img src='{host_uri}'></div>"

    return f"""<!DOCTYPE html><html><head><meta charset='utf-8'>
<style>{common}{style}</style></head><body><div class='canvas'>
  <div class='grid'></div>
  <div class='eyebrow'>{eyebrow}</div>
  <div class='head'><div class='l1'>{line1}</div><div class='l2'>{line2}</div></div>
  <div class='brand'><div class='bmark'></div>
    <div class='bname'>{brand}</div><div class='bsub'>{sub}</div></div>
  <div class='panel'>{panel}</div>{inset}
  <div class='vig'></div>
</div></body></html>"""


def main():
    ap = argparse.ArgumentParser(description="Render a series thumbnail.")
    ap.add_argument("--guest", required=True, help="guest portrait (PNG/JPG)")
    ap.add_argument("--host", help="host portrait; omit for a solo card")
    ap.add_argument("--line1", default="TWO AI REPORTS")
    ap.add_argument("--line2", default="MISSED IT")
    ap.add_argument("--eyebrow", default="HUMAN IN THE LOOP")
    ap.add_argument("--brand", default="MARKETEERS")
    ap.add_argument("--sub", default="SMART VALUE")
    ap.add_argument("--variant", default="A", choices=["A", "B"])
    ap.add_argument("--chrome", help="path to a Chromium binary")
    ap.add_argument("--out", default="thumbnail.png")
    args = ap.parse_args()

    for p in filter(None, [args.guest, args.host]):
        if not Path(p).exists():
            sys.exit(f"not found: {p}")

    html = build_html(args.guest, args.host, args.line1, args.line2,
                      args.eyebrow, args.brand, args.sub, args.variant)

    chrome = find_chrome(args.chrome)
    with tempfile.TemporaryDirectory() as tmp:
        page = Path(tmp) / "t.html"
        page.write_text(html, encoding="utf-8")
        shot = Path(tmp) / "shot.png"
        # Render taller than needed: the headless viewport is shorter than the
        # window, so the canvas would be clipped at exactly 720.
        subprocess.run([chrome, "--headless", "--no-sandbox", "--disable-gpu",
                        "--hide-scrollbars", "--force-device-scale-factor=1",
                        f"--window-size={W+20},{H+180}",
                        f"--screenshot={shot}", page.as_uri()],
                       capture_output=True)
        if not shot.exists():
            sys.exit("Chromium produced no screenshot.")
        try:
            from PIL import Image
        except ImportError:
            subprocess.run([sys.executable, "-m", "pip", "install", "-q", "pillow"], check=True)
            from PIL import Image
        im = Image.open(shot).convert("RGB").crop((0, 0, W, H))
        im.save(args.out)
        # feed-card proof: if the hook is unreadable here, it is unreadable in the wild
        preview = Path(args.out).with_name(Path(args.out).stem + "_card.png")
        im.resize((210, 118), Image.LANCZOS).save(preview)

    print(f"\n  {args.out}        {W}x{H}")
    print(f"  {preview}   feed-card size, check the hook still reads\n")


if __name__ == "__main__":
    main()
