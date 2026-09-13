#!/usr/bin/env python3
"""
Marketeers / Smart Value - interview film assembler.

Takes raw screen-recording .mov files and produces one finished, branded film:

    [picturesque branded intro + music]
        -> meeting footage, subtitles burned in
        -> [picturesque branded outro + music]

Everything is generated with ffmpeg. No stock footage, no licensed music,
nothing to buy. The intro/outro music is synthesised, so it is clean to publish.

Usage
-----
    python edit.py "Screen Recording 1.mov" "Screen Recording 2.mov"

Common flags
------------
    --logo logo.png        brand logo shown on the intro/outro cards
    --title "..."          headline on the intro card
    --subtitle "..."       line under the headline
    --outro "..."          headline on the outro card
    --model small          whisper model: tiny/base/small/medium/large-v3
    --language ar          force a language instead of auto-detect
    --translate            translate the subtitles to English
    --srt-only             just produce the .srt files, do not render
    --no-subs              render the film without subtitles
    --out final.mp4        output filename

First run installs what it needs (faster-whisper, imageio-ffmpeg) if missing.
"""

import argparse
import json
import os
import shutil
import subprocess
import sys
import textwrap
from pathlib import Path

# --------------------------------------------------------------------------
# BRAND CONFIG - put the real values here and the whole film re-skins itself.
# --------------------------------------------------------------------------

BRAND = {
    # Intro/outro gradient. Three hex colours, dark -> accent.
    # Replace with the Smart Value palette.
    "bg_deep":    "0A1E3C",   # deep navy
    "bg_mid":     "125E7A",   # petrol blue
    "bg_accent":  "E8B04B",   # warm gold

    # Typography on the cards
    "title_color":    "FFFFFF",
    "subtitle_color": "E8B04B",
    # Leave these as None to auto-detect Arial / Segoe UI / DejaVu, or point
    # them straight at the brand .ttf files.
    "font_file_bold":    None,
    "font_file_regular": None,

    # Burned-in subtitle styling
    "sub_font":         "Arial",
    "sub_size":         26,
    "sub_color":        "FFFFFF",   # text
    "sub_outline":      "0A1E3C",   # outline / shadow, brand navy
    "sub_box_opacity":  0.55,       # 0 = no box, 1 = solid
    "sub_margin_v":     60,         # px from bottom
}

CARD_SECONDS   = 6.0     # length of intro and outro
FADE_SECONDS   = 0.8     # dissolve at each seam
TARGET_W       = 1920
TARGET_H       = 1080
TARGET_FPS     = 30
SUB_MAX_CHARS  = 42      # wrap subtitles at this width
SUB_MAX_LINES  = 2


# --------------------------------------------------------------------------
# plumbing
# --------------------------------------------------------------------------

def log(msg):
    print(f"  {msg}", flush=True)


def step(msg):
    print(f"\n[*] {msg}", flush=True)


def die(msg):
    print(f"\n[!] {msg}\n", file=sys.stderr)
    sys.exit(1)


def pip_install(pkg):
    log(f"installing {pkg} ...")
    subprocess.run([sys.executable, "-m", "pip", "install", "--quiet", pkg], check=True)


def find_ffmpeg():
    """Prefer a system ffmpeg; fall back to the pip-installed binary."""
    exe = shutil.which("ffmpeg")
    if exe:
        return exe, shutil.which("ffprobe")
    try:
        import imageio_ffmpeg
    except ImportError:
        pip_install("imageio-ffmpeg")
        import imageio_ffmpeg
    exe = imageio_ffmpeg.get_ffmpeg_exe()
    return exe, None


FFMPEG, FFPROBE = None, None


def run(args, **kw):
    """Run ffmpeg, surfacing the real error if it fails."""
    proc = subprocess.run(args, capture_output=True, text=True, **kw)
    if proc.returncode != 0:
        tail = "\n".join(proc.stderr.strip().splitlines()[-25:])
        die(f"ffmpeg failed:\n{tail}")
    return proc


def probe(path):
    """Duration + dimensions. Uses ffprobe when available, else parses ffmpeg."""
    if FFPROBE:
        out = subprocess.run(
            [FFPROBE, "-v", "error", "-print_format", "json",
             "-show_format", "-show_streams", str(path)],
            capture_output=True, text=True,
        )
        if out.returncode == 0:
            data = json.loads(out.stdout)
            dur = float(data["format"]["duration"])
            vid = next((s for s in data["streams"] if s["codec_type"] == "video"), None)
            has_audio = any(s["codec_type"] == "audio" for s in data["streams"])
            return dur, (vid["width"], vid["height"]) if vid else (0, 0), has_audio

    # ffprobe is not shipped with imageio-ffmpeg, so read ffmpeg's own banner.
    out = subprocess.run([FFMPEG, "-i", str(path)], capture_output=True, text=True)
    text = out.stderr
    dur = 0.0
    for line in text.splitlines():
        if "Duration:" in line:
            hms = line.split("Duration:")[1].split(",")[0].strip()
            h, m, s = hms.split(":")
            dur = int(h) * 3600 + int(m) * 60 + float(s)
            break
    dims = (0, 0)
    for line in text.splitlines():
        if "Video:" in line:
            for tok in line.split(","):
                tok = tok.strip().split(" ")[0]
                if "x" in tok and tok.replace("x", "").isdigit():
                    w, h = tok.split("x")
                    dims = (int(w), int(h))
                    break
            break
    has_audio = "Audio:" in text
    return dur, dims, has_audio


# --------------------------------------------------------------------------
# 1. transcription -> SRT
# --------------------------------------------------------------------------

def srt_timestamp(seconds):
    ms = int(round(seconds * 1000))
    h, ms = divmod(ms, 3_600_000)
    m, ms = divmod(ms, 60_000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def wrap_caption(text):
    """Two short lines read far better on screen than one long one."""
    lines = textwrap.wrap(text.strip(), width=SUB_MAX_CHARS)
    if len(lines) > SUB_MAX_LINES:
        # rebalance rather than truncate - never drop what was said
        joined = " ".join(lines)
        width = max(SUB_MAX_CHARS, len(joined) // SUB_MAX_LINES + 1)
        lines = textwrap.wrap(joined, width=width)[:SUB_MAX_LINES]
    return "\n".join(lines)


def transcribe(video, srt_path, model_size, language, translate):
    try:
        from faster_whisper import WhisperModel
    except ImportError:
        pip_install("faster-whisper")
        from faster_whisper import WhisperModel

    log(f"loading whisper '{model_size}' (first run downloads the model) ...")
    model = WhisperModel(model_size, device="auto", compute_type="int8")

    segments, info = model.transcribe(
        str(video),
        language=language,
        task="translate" if translate else "transcribe",
        vad_filter=True,                       # drop silence, keeps timing honest
        vad_parameters={"min_silence_duration_ms": 500},
        beam_size=5,
        condition_on_previous_text=False,      # stops runaway repetition
    )
    log(f"detected language: {info.language} (p={info.language_probability:.2f})")

    entries = []
    for seg in segments:
        text = seg.text.strip()
        if not text:
            continue
        entries.append((seg.start, seg.end, text))
        mins = int(seg.start // 60)
        print(f"\r    transcribed up to {mins:02d}:{int(seg.start % 60):02d}",
              end="", flush=True)
    print()

    with open(srt_path, "w", encoding="utf-8") as fh:
        for i, (start, end, text) in enumerate(entries, 1):
            fh.write(f"{i}\n{srt_timestamp(start)} --> {srt_timestamp(end)}\n")
            fh.write(wrap_caption(text) + "\n\n")

    log(f"{len(entries)} subtitle cues -> {srt_path.name}")
    return srt_path


# --------------------------------------------------------------------------
# 2. branded intro / outro cards
# --------------------------------------------------------------------------

def music_filter(duration):
    """
    A warm sustained chord that swells in and fades out. Synthesised, so there
    is no licensing question. Root A2, with fifth, octave and major third.
    """
    voices = [55.00, 110.00, 164.81, 220.00, 277.18]
    srcs, mixes = [], []
    for i, freq in enumerate(voices):
        srcs.append(
            f"sine=frequency={freq}:duration={duration:.2f}:sample_rate=48000[m{i}]"
        )
        mixes.append(f"[m{i}]")
    chord = ";".join(srcs) + ";" + "".join(mixes)
    chord += f"amix=inputs={len(voices)}:duration=longest:normalize=1[chord];"
    # soften the sines, give them a room, then shape the swell
    chord += (
        "[chord]"
        "tremolo=f=0.35:d=0.25,"
        "aecho=0.8:0.85:250|420:0.35|0.22,"
        "highpass=f=60,lowpass=f=4500,"
        f"afade=t=in:st=0:d=1.6,afade=t=out:st={max(0.0, duration - 2.0):.2f}:d=2.0,"
        "volume=0.5"
        "[music]"
    )
    return chord


FONT_CANDIDATES = {
    "regular": [
        r"C:\Windows\Fonts\arial.ttf",
        r"C:\Windows\Fonts\segoeui.ttf",
        "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/Library/Fonts/Arial.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    ],
    "bold": [
        r"C:\Windows\Fonts\arialbd.ttf",
        r"C:\Windows\Fonts\segoeuib.ttf",
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        "/Library/Fonts/Arial Bold.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    ],
}


def load_font(weight, size):
    from PIL import ImageFont
    override = BRAND.get(f"font_file_{weight}")
    paths = ([override] if override else []) + FONT_CANDIDATES[weight]
    for candidate in paths:
        if candidate and Path(candidate).exists():
            return ImageFont.truetype(candidate, size)
    log(f"warning: no {weight} font found, falling back to the bitmap default")
    return ImageFont.load_default()


def shape(text):
    """Reshape Arabic if the optional helpers are installed; otherwise pass through."""
    try:
        import arabic_reshaper
        from bidi.algorithm import get_display
        return get_display(arabic_reshaper.reshape(text))
    except Exception:
        return text


def render_text_layer(path, title, subtitle, has_logo):
    """
    Draw the card's type into a transparent PNG. Doing this in Pillow rather
    than ffmpeg's drawtext keeps it working on every ffmpeg build (the portable
    ones ship without drawtext) and sidesteps filter-string escaping entirely.
    """
    try:
        from PIL import Image, ImageDraw, ImageFilter
    except ImportError:
        pip_install("pillow")
        from PIL import Image, ImageDraw, ImageFilter

    img = Image.new("RGBA", (TARGET_W, TARGET_H), (0, 0, 0, 0))

    title_y    = 620 if has_logo else 470
    subtitle_y = 730 if has_logo else 585

    # A soft dark pool behind the type. Without it the copy collapses into the
    # gradient wherever the bright accent stop happens to drift - the same
    # reason a lower third gets a scrim.
    top = (380 if has_logo else title_y - 150)
    scrim = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ImageDraw.Draw(scrim).ellipse(
        (160, top, TARGET_W - 160, subtitle_y + 170),
        fill=(0, 0, 0, 120),
    )
    img.alpha_composite(scrim.filter(ImageFilter.GaussianBlur(110)))

    draw = ImageDraw.Draw(img)

    def centered(text, y, font, fill):
        text = shape(text)
        left, top, right, bottom = draw.textbbox((0, 0), text, font=font)
        x = (TARGET_W - (right - left)) / 2 - left
        # soft drop shadow so type stays legible over the brightest gradient stop
        shadow = Image.new("RGBA", img.size, (0, 0, 0, 0))
        ImageDraw.Draw(shadow).text((x, y + 4), text, font=font, fill=(0, 0, 0, 140))
        img.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(6)))
        draw.text((x, y), text, font=font, fill=fill)

    if title:
        centered(title, title_y, load_font("bold", 76), rgb(BRAND["title_color"]))
    if subtitle:
        centered(subtitle, subtitle_y, load_font("regular", 36),
                 rgb(BRAND["subtitle_color"]))

    img.save(path)
    return path


def rgb(hexrgb):
    h = hexrgb.lstrip("#")
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), 255)


def build_card(path, kind, title, subtitle, logo):
    """
    Render one intro/outro card: animated brand gradient, slow push-in, grain,
    vignette, logo, type. This is the 'picturesque' part.
    """
    d = CARD_SECONDS
    c1, c2, c3 = BRAND["bg_deep"], BRAND["bg_mid"], BRAND["bg_accent"]

    text_png = path.with_name(f"{kind}_text.png")
    render_text_layer(text_png, title, subtitle, bool(logo))

    # Oversize the gradient so the slow push-in never reveals an edge.
    gw, gh = int(TARGET_W * 1.2), int(TARGET_H * 1.2)
    frames = int(d * TARGET_FPS)

    inputs, idx = [], 0
    logo_idx = None
    if logo:
        inputs += ["-loop", "1", "-t", f"{d}", "-i", str(logo)]
        logo_idx, idx = idx, idx + 1
    inputs += ["-loop", "1", "-t", f"{d}", "-i", str(text_png)]
    text_idx = idx

    filters = [
        # drifting three-stop brand gradient
        # Four stops, deep-weighted: the accent reads as a highlight rather
        # than taking over the frame.
        f"gradients=s={gw}x{gh}:c0=0x{c1}:c1=0x{c2}:c2=0x{c1}:c3=0x{c3}"
        f":x0=0:y0={gh}:x1={gw}:y1=0:nb_colors=4:seed=11"
        f":speed=0.02:d={d}:r={TARGET_FPS}[grad]",

        # slow push-in, 1.00 -> 1.08 across the card
        f"[grad]zoompan=z='1.0+0.08*on/{frames}':d=1"
        f":x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'"
        f":s={TARGET_W}x{TARGET_H}:fps={TARGET_FPS}[zoomed]",

        # grain and vignette, so it reads as shot rather than generated
        "[zoomed]noise=alls=7:allf=t+u,vignette=PI/4.2,"
        "eq=saturation=1.06:contrast=1.04:brightness=-0.05[bg]",
    ]

    last = "bg"

    if logo:
        filters.append(
            f"[{logo_idx}:v]scale=560:280:force_original_aspect_ratio=decrease,"
            f"format=rgba,fade=t=in:st=0.4:d=1.1:alpha=1[lg]"
        )
        # logo settles upward into place as it fades in
        filters.append(
            f"[{last}][lg]overlay=x=(W-w)/2:y='520-h+30*(1-min(1,t/1.2))'"
            f":format=auto:eof_action=repeat[withlogo]"
        )
        last = "withlogo"

    filters.append(
        f"[{text_idx}:v]format=rgba,"
        f"fade=t=in:st=1.3:d=1.0:alpha=1,"
        f"fade=t=out:st={d - 1.3:.2f}:d=1.1:alpha=1[tx]"
    )
    filters.append(f"[{last}][tx]overlay=0:0:format=auto:eof_action=repeat[titled]")

    filters.append(
        f"[titled]fade=t=in:st=0:d={FADE_SECONDS},"
        f"fade=t=out:st={d - FADE_SECONDS:.2f}:d={FADE_SECONDS},"
        f"format=yuv420p[vout]"
    )
    filters.append(music_filter(d))

    cmd = [FFMPEG, "-y", "-hide_banner", "-loglevel", "error"] + inputs + [
        "-filter_complex", ";".join(filters),
        "-map", "[vout]", "-map", "[music]",
        "-r", str(TARGET_FPS), "-t", f"{d}",
        "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-ac", "2",
        str(path),
    ]
    log(f"rendering {kind} card ...")
    run(cmd)
    return path


# --------------------------------------------------------------------------
# 3. normalise footage (+ burn subtitles)
# --------------------------------------------------------------------------

def normalise(src, dst, srt, has_audio, workdir):
    """
    Conform every segment to identical specs so the concat demuxer can join
    them without re-encoding seams, and burn the subtitles in at the same pass.
    """
    vf = [
        f"scale={TARGET_W}:{TARGET_H}:force_original_aspect_ratio=decrease",
        f"pad={TARGET_W}:{TARGET_H}:(ow-iw)/2:(oh-ih)/2:color=black",
        "setsar=1",
    ]

    if srt:
        # libass wants a plain relative filename; we run ffmpeg with cwd=workdir
        # so Windows drive letters never reach the filter parser.
        style = (
            f"FontName={BRAND['sub_font']},"
            f"FontSize={BRAND['sub_size']},"
            f"PrimaryColour=&H00{bgr(BRAND['sub_color'])}&,"
            f"OutlineColour=&H00{bgr(BRAND['sub_outline'])}&,"
            f"BackColour=&H{alpha_hex(BRAND['sub_box_opacity'])}{bgr('000000')}&,"
            f"BorderStyle={4 if BRAND['sub_box_opacity'] > 0 else 1},"
            f"Outline=2,Shadow=1,Bold=1,"
            f"Alignment=2,MarginV={BRAND['sub_margin_v']}"
        )
        vf.append(f"subtitles={srt.name}:force_style='{style}'")

    dur, _, _ = probe(src)
    vf.append(f"fade=t=in:st=0:d={FADE_SECONDS}")
    vf.append(f"fade=t=out:st={max(0.0, dur - FADE_SECONDS):.2f}:d={FADE_SECONDS}")
    vf.append("format=yuv420p")

    cmd = [FFMPEG, "-y", "-hide_banner", "-loglevel", "error", "-i", str(src)]
    if not has_audio:
        cmd += ["-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo", "-shortest"]

    cmd += [
        "-vf", ",".join(vf),
        "-r", str(TARGET_FPS),
        "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-ac", "2",
        "-af", f"afade=t=in:st=0:d=0.4,afade=t=out:st={max(0.0, dur - 0.6):.2f}:d=0.6",
        str(dst),
    ]
    log(f"conforming {Path(src).name} ...")
    run(cmd, cwd=str(workdir))
    return dst


def bgr(hexrgb):
    """ASS colours are BBGGRR, not RRGGBB."""
    h = hexrgb.lstrip("#")
    return f"{h[4:6]}{h[2:4]}{h[0:2]}".upper()


def alpha_hex(opacity):
    """ASS alpha is inverted: 00 opaque, FF transparent."""
    return f"{int(round((1.0 - opacity) * 255)):02X}"


# --------------------------------------------------------------------------
# 4. assemble
# --------------------------------------------------------------------------

def concat(parts, out, workdir):
    listfile = workdir / "concat.txt"
    with open(listfile, "w", encoding="utf-8") as fh:
        for p in parts:
            fh.write(f"file '{Path(p).name}'\n")
    log("joining segments ...")
    run([FFMPEG, "-y", "-hide_banner", "-loglevel", "error",
         "-f", "concat", "-safe", "0", "-i", listfile.name,
         "-c", "copy", "-movflags", "+faststart", str(Path(out).resolve())],
        cwd=str(workdir))
    return out


# --------------------------------------------------------------------------

def main():
    ap = argparse.ArgumentParser(description="Assemble a branded interview film.")
    ap.add_argument("videos", nargs="+", help="source recordings, in running order")
    ap.add_argument("--logo", help="brand logo PNG (transparent background)")
    ap.add_argument("--title", default="Marketeers Research")
    ap.add_argument("--subtitle", default="Smart Value")
    ap.add_argument("--outro", default="Thank you")
    ap.add_argument("--outro-subtitle", default="Marketeers Research  |  Smart Value")
    ap.add_argument("--model", default="small",
                    help="whisper model: tiny/base/small/medium/large-v3")
    ap.add_argument("--language", default=None, help="force language e.g. ar, en")
    ap.add_argument("--translate", action="store_true",
                    help="translate subtitles to English")
    ap.add_argument("--no-subs", action="store_true")
    ap.add_argument("--srt-only", action="store_true")
    ap.add_argument("--out", default="final_film.mp4")
    args = ap.parse_args()

    global FFMPEG, FFPROBE
    FFMPEG, FFPROBE = find_ffmpeg()

    sources = []
    for v in args.videos:
        p = Path(v).expanduser()
        if not p.exists():
            die(f"not found: {p}")
        sources.append(p.resolve())

    workdir = Path("build_film").resolve()
    workdir.mkdir(exist_ok=True)

    print(f"\nffmpeg  : {FFMPEG}")
    print(f"sources : {len(sources)}")
    print(f"workdir : {workdir}")

    # --- subtitles -------------------------------------------------------
    srts = [None] * len(sources)
    if not args.no_subs:
        step("Transcribing")
        for i, src in enumerate(sources):
            srt = workdir / f"seg{i}.srt"
            if srt.exists() and srt.stat().st_size > 0:
                log(f"reusing {srt.name} (delete it to re-transcribe)")
            else:
                transcribe(src, srt, args.model, args.language, args.translate)
            srts[i] = srt
            # a copy next to the video, for review/editing before the render
            shutil.copy(srt, src.with_suffix(".srt"))
            log(f"editable copy -> {src.with_suffix('.srt')}")

    if args.srt_only:
        print("\n[ok] subtitles written. Review them, then re-run without --srt-only.\n")
        return

    # --- cards -----------------------------------------------------------
    step("Building intro and outro")
    logo = Path(args.logo).resolve() if args.logo else None
    if args.logo and not logo.exists():
        die(f"logo not found: {logo}")
    intro = build_card(workdir / "intro.mp4", "intro",
                       args.title, args.subtitle, logo)
    outro = build_card(workdir / "outro.mp4", "outro",
                       args.outro, args.outro_subtitle, logo)

    # --- footage ---------------------------------------------------------
    step("Conforming footage")
    segs = []
    for i, src in enumerate(sources):
        _, _, has_audio = probe(src)
        dst = workdir / f"seg{i}.mp4"
        normalise(src, dst, srts[i], has_audio, workdir)
        segs.append(dst)

    # --- assemble --------------------------------------------------------
    step("Assembling")
    out = concat([intro] + segs + [outro], args.out, workdir)

    total, dims, _ = probe(out)
    print(f"\n[ok] {Path(out).resolve()}")
    print(f"     {int(total // 60)}m {int(total % 60)}s  |  {dims[0]}x{dims[1]}\n")


if __name__ == "__main__":
    main()
