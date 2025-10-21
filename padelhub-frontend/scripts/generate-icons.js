// Simple icon generation script
// This creates placeholder PNG files for PWA icons
// Replace with actual icons later

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, "..", "public", "icons");

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Create a simple SVG for each size
sizes.forEach((size) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <rect width="${size}" height="${size}" fill="#000000" rx="${size / 8}"/>
  <text x="${size / 2}" y="${size * 0.65}" font-family="Arial, sans-serif" font-size="${size * 0.4}" font-weight="bold" text-anchor="middle" fill="#ffffff">P</text>
</svg>`;

  const filename = `icon-${size}x${size}.svg`;
  fs.writeFileSync(path.join(iconsDir, filename), svg);
  console.log(`Created ${filename}`);
});

console.log("\nIcon generation complete!");
console.log(
  "Note: These are placeholder SVG icons. For production, replace with actual PNG icons."
);
console.log(
  "You can convert SVG to PNG using online tools or image processing libraries."
);
