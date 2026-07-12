#!/usr/bin/env bash
# Generate Chrome Web Store promo images. Requires ImageMagick (`convert`).
# Run from the repo root:  bash scripts/make-promo.sh
set -euo pipefail

OUT="docs/store/assets"
mkdir -p "$OUT"

# $1 width, $2 height, $3 title pointsize, $4 tagline pointsize, $5 outfile
tile() {
  local w=$1 h=$2 tps=$3 gps=$4 file=$5
  convert -size "${w}x${h}" gradient:'#3b82f6-#1d4ed8' \
    -gravity center \
    -font DejaVu-Sans-Bold -fill white -pointsize "$tps" \
    -annotate "+0-$((h / 12))" 'Headmaster' \
    -font DejaVu-Sans -fill '#e5edff' -pointsize "$gps" \
    -annotate "+0+$((h / 10))" 'Headers per URL. No profiles.' \
    "PNG32:$OUT/$file"
}

# Small promo tile (required) and marquee (optional).
tile 440 280 52 22 promo-440x280.png
tile 1400 560 150 60 marquee-1400x560.png

echo "Wrote $OUT/{promo-440x280,marquee-1400x560}.png"
