#!/usr/bin/env bash
# Print brochure/brochure.html to an A4 PDF with headless Chromium, plus PNG previews.
# Usage: brochure/build.sh [chrome binary]
set -euo pipefail
cd "$(dirname "$0")"
CHROME=${1:-/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell}
mkdir -p out
"$CHROME" --no-sandbox --disable-gpu --allow-file-access-from-files --run-all-compositor-stages-before-draw \
  --virtual-time-budget=5000 --no-pdf-header-footer --print-to-pdf="$PWD/out/TechnoTribes_Brochure_v2.pdf" "file://$PWD/brochure.html" 2>/dev/null
pdfinfo out/TechnoTribes_Brochure_v2.pdf | grep -E "Pages|Page size"
rm -f out/preview-*.png
pdftoppm -r 60 -png out/TechnoTribes_Brochure_v2.pdf out/preview
