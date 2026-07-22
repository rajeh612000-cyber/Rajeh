#!/usr/bin/env bash
set -e
cd /home/user/Rajeh
SCRATCH="/tmp/claude-0/-home-user-Rajeh/4bfeb395-b4e9-59cd-bc99-f9304b05e521/scratchpad"
VID="out/video_silent.mp4"
VO="public/audio/vo.m4a"
MUSIC="$SCRATCH/music_bed.wav"

echo "waiting for render to finish..."
# wait until the file exists and its size is stable for 3 consecutive checks
stable=0; last=0
for i in $(seq 1 120); do
  if [ -f "$VID" ]; then
    sz=$(stat -c%s "$VID" 2>/dev/null || echo 0)
    if [ "$sz" -gt 100000 ] && [ "$sz" = "$last" ]; then
      stable=$((stable+1))
    else
      stable=0
    fi
    last=$sz
    if [ "$stable" -ge 3 ]; then echo "render output stable at $sz bytes"; break; fi
  fi
  sleep 3
done

echo "=== MUX 1: untouched voice-only ==="
ffmpeg -hide_banner -loglevel error -y -i "$VID" -i "$VO" \
  -map 0:v:0 -map 1:a:0 -c:v copy -c:a copy -shortest \
  out/SmartShopper_Intro_voiceonly_1080p.mp4
echo "  done"

echo "=== MUX 2: voice + ducked music (primary) ==="
ffmpeg -hide_banner -loglevel error -y -i "$VID" -i "$VO" -i "$MUSIC" \
  -filter_complex "\
[1:a]aformat=channel_layouts=stereo,asplit=2[v1][vsc];\
[2:a]volume=0.20[mq];\
[mq][vsc]sidechaincompress=threshold=0.055:ratio=6:attack=6:release=380[mduck];\
[v1][mduck]amix=inputs=2:duration=first:normalize=0[aout]" \
  -map 0:v:0 -map "[aout]" -c:v copy -c:a aac -b:a 256k -ar 48000 -shortest \
  out/SmartShopper_Intro_1080p.mp4
echo "  done"

echo "=== PROBE ==="
for f in out/video_silent.mp4 out/SmartShopper_Intro_voiceonly_1080p.mp4 out/SmartShopper_Intro_1080p.mp4; do
  echo "--- $f ---"
  ffprobe -hide_banner -v error -show_entries format=duration:stream=codec_type,codec_name,width,height,r_frame_rate,channels -of default=noprint_wrappers=1 "$f"
done
echo "ALL FINALIZE DONE"
