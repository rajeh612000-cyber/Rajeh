#!/usr/bin/env bash
# Turn a raw screen recording into a clean clip the storyboard can use.
#
# A screen capture of the Synthesia editor contains three things we do not want
# in the finished video: the browser chrome, the Synthesia editor UI (including
# the word "Synthesia"), and whatever glitches the capture picked up. This
# script removes all three — the first two by cropping to just the player
# rectangle, the third by trimming to a clean span.
#
#   Inspect first (writes sample stills + a suggested crop):
#     ./prep-footage.sh --inspect "/path/to/recording.mp4"
#
#   Then cut:
#     ./prep-footage.sh "/path/to/recording.mp4" \
#         --start 4.5 --duration 12 \
#         --crop 1536x864+192+238
#
# --crop takes WxH+X+Y (same order ffmpeg's crop filter uses: width, height,
# then the offset of the top-left corner). Omit it and the full frame is kept.
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FFMPEG="${FFMPEG_PATH:-$HERE/node_modules/ffmpeg-static/ffmpeg}"
ASSETS="$HERE/../assets"

SRC=""; START=0; DURATION=""; CROP=""; OUT="$ASSETS/scene1-speaker.webm"
TARGET_W=1280; TARGET_H=720; INSPECT=0; FADE=0; DELOGO=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --inspect)  INSPECT=1; shift ;;
    --start)    START="$2"; shift 2 ;;
    --duration) DURATION="$2"; shift 2 ;;
    --crop)     CROP="$2"; shift 2 ;;
    --delogo)   DELOGO="$2"; shift 2 ;;
    --out)      OUT="$2"; shift 2 ;;
    --size)     TARGET_W="${2%x*}"; TARGET_H="${2#*x}"; shift 2 ;;
    --fade)     FADE="$2"; shift 2 ;;
    -*)         echo "unknown flag: $1" >&2; exit 1 ;;
    *)          SRC="$1"; shift ;;
  esac
done

[[ -n "$SRC" ]] || { echo "usage: prep-footage.sh <recording.mp4> [options]" >&2; exit 1; }
[[ -f "$SRC" ]] || { echo "no such file: $SRC" >&2; exit 1; }

echo "source: $SRC"
"$FFMPEG" -hide_banner -i "$SRC" 2>&1 | grep -E 'Duration|Stream #' || true

# ---------------------------------------------------------------- inspect ---
# Dumps stills so the player rectangle can be measured, and runs cropdetect,
# which finds uniform borders. cropdetect will NOT find the Synthesia UI (it is
# not a uniform border), so treat its answer as a starting point and confirm
# against the stills.
if [[ $INSPECT -eq 1 ]]; then
  SHOTS="$HERE/../out/inspect"
  mkdir -p "$SHOTS"
  rm -f "$SHOTS"/frame-*.png
  for t in 1 3 6 10; do
    "$FFMPEG" -hide_banner -loglevel error -y -ss "$t" -i "$SRC" \
      -frames:v 1 "$SHOTS/frame-${t}s.png" 2>/dev/null || true
  done
  echo
  echo "stills → $SHOTS  (open them and read off the player rectangle)"
  echo
  echo "cropdetect suggestion (uniform borders only):"
  "$FFMPEG" -hide_banner -ss 2 -i "$SRC" -vf cropdetect=24:2:0 -frames:v 60 -f null - 2>&1 \
    | grep -o 'crop=[0-9:]*' | tail -1 | sed 's/^/  ffmpeg-form: /'
  echo
  echo "convert ffmpeg-form crop=W:H:X:Y  →  --crop WxH+X+Y"
  exit 0
fi

# ------------------------------------------------------------------ build ---
VF=""
[[ -n "$CROP" ]] && {
  W="${CROP%%x*}"; REST="${CROP#*x}"; H="${REST%%+*}"
  XY="${REST#*+}"; X="${XY%%+*}"; Y="${XY##*+}"
  VF="crop=${W}:${H}:${X}:${Y},"
  echo "crop:   ${W}x${H} at (${X},${Y})"
}
# Cropping removes the Synthesia *editor* UI. A watermark burned into the video
# itself sits inside the player rectangle, so it survives the crop — delogo
# interpolates it away from the surrounding pixels. Coordinates are relative to
# the already-cropped frame.
[[ -n "$DELOGO" ]] && {
  DW="${DELOGO%%x*}"; DR="${DELOGO#*x}"; DH="${DR%%+*}"
  DXY="${DR#*+}"; DX="${DXY%%+*}"; DY="${DXY##*+}"
  VF+="delogo=x=${DX}:y=${DY}:w=${DW}:h=${DH},"
  echo "delogo: ${DW}x${DH} at (${DX},${DY})"
}
VF+="scale=${TARGET_W}:${TARGET_H}:force_original_aspect_ratio=increase"
VF+=",crop=${TARGET_W}:${TARGET_H},setsar=1"

if [[ "$FADE" != "0" && -n "$DURATION" ]]; then
  OUTFADE=$(awk -v d="$DURATION" -v f="$FADE" 'BEGIN{printf "%.3f", d-f}')
  VF+=",fade=t=in:st=0:d=${FADE},fade=t=out:st=${OUTFADE}:d=${FADE}"
fi
VF+=",format=yuv420p"

TRIM=(-ss "$START")
[[ -n "$DURATION" ]] && TRIM+=(-t "$DURATION")

mkdir -p "$(dirname "$OUT")"
echo "trim:   start=${START}s duration=${DURATION:-to-end}"
echo "output: $OUT (${TARGET_W}x${TARGET_H} VP9/Opus)"
echo

# VP9/WebM, not H.264 — Playwright's Chromium ships without proprietary codecs,
# so an .mp4 asset silently fails to load and you get the placeholder card.
"$FFMPEG" -hide_banner -loglevel error -y \
  "${TRIM[@]}" -i "$SRC" \
  -vf "$VF" \
  -c:v libvpx-vp9 -b:v 0 -crf 28 -row-mt 1 -deadline good -cpu-used 2 \
  -g 15 -auto-alt-ref 0 \
  -c:a libopus -b:a 160k -ac 2 \
  "$OUT"

echo "done."
"$FFMPEG" -hide_banner -i "$OUT" 2>&1 | grep -E 'Duration|Stream #' || true
echo
echo "next: node render.mjs --scene 1"
