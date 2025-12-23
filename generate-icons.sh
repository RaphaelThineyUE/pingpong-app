#!/bin/bash

#!/bin/bash

# Icon generation utility
# - Existing behavior: create SVG placeholders for various sizes
# - New: convert themed SVGs (pingpong-*.svg) to PNGs if a converter is available

ICON_DIR="src/assets/icons"

# Include common PWA/iOS sizes
sizes=(72 96 120 128 144 152 180 192 384 512)

# Try to find an SVG -> PNG converter
converter=""
if command -v rsvg-convert >/dev/null 2>&1; then
  converter="rsvg-convert"
elif command -v convert >/dev/null 2>&1; then
  converter="convert"
elif command -v inkscape >/dev/null 2>&1; then
  converter="inkscape"
fi

for size in "${sizes[@]}"; do
  # Create a simple SVG placeholder (kept for completeness)
  cat > "${ICON_DIR}/icon-${size}x${size}.png.svg" << EOF
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#14532d"/>
  <text x="50%" y="50%" font-size="$((size/4))" fill="white" text-anchor="middle" dominant-baseline="central">🏓</text>
</svg>
EOF
  echo "Created placeholder SVG: icon-${size}x${size}.png.svg"

  # Convert themed ping-pong SVG into PNG if possible
  if [ -n "$converter" ]; then
    src_svg="${ICON_DIR}/pingpong-512.svg"
    out_png="${ICON_DIR}/pingpong-${size}.png"

    if [ "$converter" = "rsvg-convert" ]; then
      rsvg-convert -w "$size" -h "$size" "$src_svg" -o "$out_png"
    elif [ "$converter" = "convert" ]; then
      convert -background none -resize ${size}x${size} "$src_svg" "$out_png"
    elif [ "$converter" = "inkscape" ]; then
      inkscape "$src_svg" --export-type=png --export-filename="$out_png" -w "$size" -h "$size"
    fi

    if [ -f "$out_png" ]; then
      echo "Generated PNG icon: $(basename "$out_png")"
    else
      echo "Failed to generate PNG for size ${size} using ${converter}"
    fi
  else
    echo "No SVG->PNG converter found (rsvg-convert/convert/inkscape). Skipping PNG generation for size ${size}."
  fi
done

echo ""
echo "Done. SVG placeholders created. If a converter was available, PNGs were generated from pingpong-512.svg."
echo "Tip: Install 'librsvg' (rsvg-convert) or 'ImageMagick' (convert) for PNG generation."
