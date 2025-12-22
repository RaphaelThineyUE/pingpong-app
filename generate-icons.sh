#!/bin/bash

# Script to generate placeholder PWA icons
# For production, replace these with proper ping pong themed icons

ICON_DIR="src/assets/icons"

sizes=(72 96 128 144 152 192 384 512)

for size in "${sizes[@]}"; do
  # Create a simple SVG placeholder
  cat > "${ICON_DIR}/icon-${size}x${size}.png.svg" << EOF
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#1976d2"/>
  <text x="50%" y="50%" font-size="$((size/4))" fill="white" text-anchor="middle" dominant-baseline="central">🏓</text>
</svg>
EOF
  
  echo "Created placeholder icon: icon-${size}x${size}.png.svg"
done

echo ""
echo "Icon placeholders created! For production, use proper PNG icons."
echo "You can use tools like https://realfavicongenerator.net/ to generate proper icons."
