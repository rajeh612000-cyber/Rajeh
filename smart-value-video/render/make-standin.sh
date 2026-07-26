#!/usr/bin/env bash
# Generates a stand-in "speaker" clip so the render pipeline can be tested and
# reviewed before the real footage is available.
#
# It burns in a running timecode, which makes it trivial to confirm frame-exact
# sync in the rendered MP4: frame N of the output should read N/FPS seconds.
#
#   ./make-standin.sh [seconds] [output.webm]
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FFMPEG="${FFMPEG_PATH:-$HERE/node_modules/ffmpeg-static/ffmpeg}"
FONT="${FONT_PATH:-/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf}"

DUR="${1:-12}"
OUT="${2:-$HERE/../assets/scene1-speaker.webm}"

mkdir -p "$(dirname "$OUT")"

"$FFMPEG" -hide_banner -loglevel error -y \
  -f lavfi -i "gradients=s=1280x720:c0=0x2b2560:c1=0x0d0b24:x0=200:y0=80:x1=1100:y1=700:d=$DUR:r=30" \
  -f lavfi -i "sine=frequency=220:duration=$DUR" \
  -filter_complex "\
    [0:v]drawbox=x=440:y=190:w=400:h=400:color=0x534AB7@0.55:t=fill,\
         drawbox=x=515:y=250:w=250:h=250:color=0xA09DE8@0.75:t=fill,\
         drawbox=x=440:y=560:w=400:h=160:color=0x1A1A4E@0.85:t=fill,\
         drawtext=fontfile='$FONT':text='STAND-IN CLIP':fontcolor=white:fontsize=46:\
                  x=(w-tw)/2:y=90,\
         drawtext=fontfile='$FONT':text='replace with your Synthesia export':\
                  fontcolor=0xEEEDFE@0.8:fontsize=24:x=(w-tw)/2:y=150,\
         drawtext=fontfile='$FONT':text='%{pts\\:hms}':fontcolor=0x7CFFB2:fontsize=54:\
                  x=(w-tw)/2:y=620,\
         format=yuv420p[v]" \
  -map "[v]" -map 1:a \
  -c:v libvpx-vp9 -b:v 0 -crf 30 -row-mt 1 -deadline good -cpu-used 2 \
  -g 15 -auto-alt-ref 0 \
  -c:a libopus -b:a 128k \
  -t "$DUR" \
  "$OUT"

echo "stand-in written: $OUT"
"$FFMPEG" -hide_banner -i "$OUT" 2>&1 | grep -E 'Duration|Stream' || true
