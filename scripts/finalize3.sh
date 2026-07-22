#!/usr/bin/env bash
set -e
cd /home/user/Rajeh
SCRATCH="/tmp/claude-0/-home-user-Rajeh/4bfeb395-b4e9-59cd-bc99-f9304b05e521/scratchpad"
VID="out/video_silent.mp4"; VO="public/audio/vo.m4a"; MUSIC="$SCRATCH/music_bed.wav"

echo "waiting for render..."
stable=0; last=0
for i in $(seq 1 150); do
  if [ -f "$VID" ]; then
    sz=$(stat -c%s "$VID" 2>/dev/null || echo 0)
    if [ "$sz" -gt 100000 ] && [ "$sz" = "$last" ]; then stable=$((stable+1)); else stable=0; fi
    last=$sz
    [ "$stable" -ge 3 ] && { echo "render stable at $sz bytes"; break; }
  fi
  sleep 3
done

echo "=== MUX: normalized voice (hiss trimmed after SKUs) + audible music resolve ==="
# voice: loudnorm to -15 LUFS, fade the trailing room-tone out after SKUs (~36.6)
# music: sustained, un-ducks into an audible outro; whole mix clean-fades at the very end
ffmpeg -hide_banner -loglevel error -y -i "$VID" -i "$VO" -i "$MUSIC" \
  -filter_complex "\
[1:a]loudnorm=I=-15:TP=-1.5:LRA=13,afade=t=out:st=36.6:d=0.35,aformat=channel_layouts=stereo,asplit=2[v1][vsc];\
[2:a]volume=0.24[mq];\
[mq][vsc]sidechaincompress=threshold=0.05:ratio=6:attack=6:release=360[mduck];\
[v1][mduck]amix=inputs=2:duration=longest:normalize=0,afade=t=out:st=37.15:d=0.35[aout]" \
  -map 0:v:0 -map "[aout]" -c:v copy -c:a aac -b:a 256k -ar 48000 -t 37.525333 \
  out/SmartShopper_Intro_1080p.mp4

echo "=== PROBE ==="
ffprobe -hide_banner -v error -show_entries format=duration:stream=codec_type,codec_name,channels -of default=noprint_wrappers=1 out/SmartShopper_Intro_1080p.mp4
echo "levels:"; ffmpeg -hide_banner -i out/SmartShopper_Intro_1080p.mp4 -af volumedetect -f null - 2>&1 | grep -E "mean_volume|max_volume"
echo "tail RMS (35.8s->end), confirm audible music (not silence):"
ffmpeg -hide_banner -i out/SmartShopper_Intro_1080p.mp4 -af "atrim=35.8,astats=metadata=1:reset=0.3,ametadata=print:key=lavfi.astats.Overall.RMS_level" -f null - 2>&1 | grep -oE "RMS_level=[-0-9.]+" | tail -6
echo "ALL FINALIZE DONE"
