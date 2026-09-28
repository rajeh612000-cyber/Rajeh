#!/usr/bin/env bash
# Final pass with ffmpeg: gentle grade, film grain, fades, loudness-normalized
# soundtrack, and a phone-friendly H.264 MP4 plus a poster frame.
set -euo pipefail
cd "$(dirname "$0")/.."

RAW=out/dog-eats-cake-raw.mp4
AUDIO=public/soundtrack.wav
OUT=dog-eats-cake.mp4

DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$RAW")
FADE_OUT=$(awk -v d="$DUR" 'BEGIN { printf "%.2f", d - 0.8 }')

ffmpeg -y -hide_banner -loglevel error \
	-i "$RAW" -i "$AUDIO" \
	-filter_complex "\
[0:v]eq=contrast=1.04:saturation=1.06,noise=alls=6:allf=t+u,\
fade=t=in:st=0:d=0.6,fade=t=out:st=${FADE_OUT}:d=0.8,format=yuv420p[v];\
[1:a]loudnorm=I=-16:TP=-1.5:LRA=11,afade=t=in:st=0:d=0.3,afade=t=out:st=${FADE_OUT}:d=0.8[a]" \
	-map "[v]" -map "[a]" \
	-c:v libx264 -preset slow -crf 18 -profile:v high -pix_fmt yuv420p \
	-c:a aac -b:a 192k -ar 48000 \
	-movflags +faststart -shortest "$OUT"

ffmpeg -y -hide_banner -loglevel error -ss 9.9 -i "$OUT" -frames:v 1 -q:v 2 poster.jpg

echo "Wrote $OUT and poster.jpg"
