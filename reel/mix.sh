#!/usr/bin/env bash
# Final audio mix for the reel: background music ducked under the voice (sidechain), music
# louder in gaps and on the end card, then mastered to -14 LUFS for Instagram.
# Usage: reel/mix.sh <render without music.mp4> <output.mp4> [music start second]
set -euo pipefail
IN=$1; OUT=$2; START=${3:-13}
MUSIC=public/music/pumpupthemind-creative-technology-showreel-241274.mp3
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$IN")
FADE=$(python3 -c "print(max(0, $DUR - 1.5))")
ffmpeg -v error -y -i "$IN" -ss "$START" -i "$MUSIC" -filter_complex "
  [0:a]asplit=2[voice][key];
  [1:a]atrim=0:$DUR,asetpts=PTS-STARTPTS,volume=0.32,afade=t=in:d=0.4,afade=t=out:st=$FADE:d=1.5[m];
  [m][key]sidechaincompress=threshold=0.03:ratio=6:attack=15:release=350:makeup=1[duck];
  [voice][duck]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-14:TP=-1:LRA=9,aresample=48000[a]" \
  -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 256k "$OUT"
