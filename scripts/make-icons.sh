#!/usr/bin/env bash
# Regenerate the extension icons from a single recipe.
# Requires ImageMagick (`convert`). Run from the repo root:
#   bash scripts/make-icons.sh
set -euo pipefail

OUT="public/icons"
mkdir -p "$OUT"

# Render each size at 4x then downscale for crisp anti-aliased edges.
for size in 16 48 128; do
  s=$((size * 4))
  radius=$((s * 22 / 100))

  # 1) diagonal blue gradient, 2) mask to a rounded square,
  # 3) draw a centered bold "H", 4) downscale to the target size.
  convert -size "${s}x${s}" gradient:'#3b82f6-#1d4ed8' \
    \( -size "${s}x${s}" xc:none -fill white \
       -draw "roundrectangle 0,0,$((s - 1)),$((s - 1)),$radius,$radius" \) \
    -compose DstIn -composite \
    -compose over -fill white -gravity center -font DejaVu-Sans-Bold \
    -pointsize $((s * 62 / 100)) -annotate +0+0 'H' \
    -resize "${size}x${size}" \
    "PNG32:$OUT/${size}.png"
done

echo "Wrote $OUT/{16,48,128}.png"
