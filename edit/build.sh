#!/usr/bin/env bash
# Assembles the Price Optimizer cut from footage/ using manifest.tsv + titles.tsv.
set -euo pipefail
cd "$(dirname "$0")"

ASPECT="${ASPECT:-vertical}"          # vertical | horizontal
FPS="${FPS:-30}"
if [ "$ASPECT" = horizontal ]; then W=1920; H=1080; else W=1080; H=1920; fi
W="${W_OVERRIDE:-$W}"; H="${H_OVERRIDE:-$H}"
FONT=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf

rm -rf work && mkdir -p work out
CONCAT=work/concat.txt; : > "$CONCAT"
i=0

# --- pass 1: normalise, trim, and push in on Mariam where the manifest says so ---
grep -v '^#' manifest.tsv | grep -v '^[[:space:]]*$' > work/rows.tsv
while IFS=$'\t' read -r clip in out section punch fx fy zend; do
  src="footage/$clip"
  [ -f "$src" ] || { echo "MISSING: $src" >&2; exit 1; }
  case "$punch" in 0|1) ;; *) echo "manifest: punch must be 0 or 1, got '$punch' ($clip)" >&2; exit 1;; esac
  for v in "$in" "$out" "$fx" "$fy" "$zend"; do
    case "$v" in ''|*[!0-9.]*) echo "manifest: non-numeric value '$v' on row $clip" >&2; exit 1;; esac
  done
  awk -v z="$zend" 'BEGIN{exit !(z>=1.0 && z<=2.0)}' || { echo "manifest: zoom_end '$zend' outside 1.0-2.0 ($clip)" >&2; exit 1; }
  i=$((i+1)); seg=$(printf "work/seg_%02d.mp4" "$i")
  dur=$(awk -v a="$in" -v b="$out" 'BEGIN{printf "%.3f", b-a}')

  fit="scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},fps=${FPS}"
  if [ "$punch" = "1" ]; then
    frames=$(awk -v d="$dur" -v f="$FPS" 'BEGIN{printf "%d", (d*f)-1}')
    zx="min(1+(on/${frames})*(${zend}-1),${zend})"
    vf="${fit},zoompan=z='${zx}':d=1:x='max(0,min(iw*${fx}-(iw/zoom/2),iw-iw/zoom))':y='max(0,min(ih*${fy}-(ih/zoom/2),ih-ih/zoom))':s=${W}x${H}:fps=${FPS}"
  else
    vf="$fit"
  fi

  ffmpeg -nostdin -y -v error -ss "$in" -t "$dur" -i "$src" \
    -vf "${vf},format=yuv420p" -af "afade=t=in:st=0:d=0.06,afade=t=out:st=$(awk -v d="$dur" 'BEGIN{printf "%.3f", d-0.06}'):d=0.06" \
    -c:v libx264 -crf 18 -preset medium -pix_fmt yuv420p -r "$FPS" \
    -c:a aac -b:a 192k -ar 48000 -ac 2 "$seg"
  echo "file '$(basename "$seg")'" >> "$CONCAT"
  echo "  laid down $seg  [$section] ${dur}s punch=$punch"
done < work/rows.tsv

# --- pass 2: join ---
( cd work && ffmpeg -nostdin -y -v error -f concat -safe 0 -i concat.txt -c copy joined.mp4 )

# --- pass 3: burn the on-screen lines from the script ---
draw=""; n=0
while IFS=$'\t' read -r st en size ypos text; do
  case "$st" in '#'*|'') continue;; esac
  n=$((n+1)); tf="work/t_${n}.txt"
  printf '%b' "${text//|/\\n}" > "$tf"
  [ -n "$draw" ] && draw="${draw},"
  draw="${draw}drawtext=fontfile=${FONT}:textfile=${tf}:expansion=none:fontcolor=white:fontsize=${size}:line_spacing=12:x=(w-text_w)/2:y=${ypos}:box=1:boxcolor=black@0.45:boxborderw=26:enable='between(t\\,${st}\\,${en})'"
done < titles.tsv

# --- pass 4: broadcast-level the audio and master ---
ffmpeg -nostdin -y -v error -i work/joined.mp4 \
  -vf "${draw}" -af "loudnorm=I=-16:TP=-1.5:LRA=11" \
  -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p -movflags +faststart \
  -c:a aac -b:a 192k out/price_optimizer_v1.mp4

echo; echo "done -> edit/out/price_optimizer_v1.mp4"
ffprobe -v error -show_entries format=duration -of csv=p=0 out/price_optimizer_v1.mp4
