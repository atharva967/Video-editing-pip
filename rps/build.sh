#!/usr/bin/env bash
# Render rps/slides.html to rps/out/slide-1..5.png (1080x1350).
set -euo pipefail
cd "$(dirname "$0")"
CHROME=${CHROME:-/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell}
mkdir -p out
for i in 1 2 3 4 5; do
  "$CHROME" --headless --no-sandbox --hide-scrollbars --force-device-scale-factor=1 \
    --window-size=1080,1350 --virtual-time-budget=3000 \
    --screenshot="$PWD/out/slide-$i.png" "file://$PWD/slides.html?s=$i" 2>/dev/null
done
ls -la out
