const fs = require('fs');
const path = require('path');

// Create a simple 1x1 transparent PNG
// This is a valid minimal PNG file (1x1 transparent pixel)
const transparentPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z/C/HgAGgwJ/lK3Q6wAAAABJRU5ErkJggg==',
  'base64'
);

// Path to the new logo.png file
const logoPath = path.join(__dirname, 'assets', 'logo.png');
const placeholderPath = path.join(__dirname, 'assets', 'placeholder', 'logo.png');

// Create the placeholder directory if it doesn't exist
const placeholderDir = path.dirname(placeholderPath);
if (!fs.existsSync(placeholderDir)) {
  fs.mkdirSync(placeholderDir, { recursive: true });
}

// Write the PNG data to both locations
fs.writeFileSync(logoPath, transparentPng);
fs.writeFileSync(placeholderPath, transparentPng);

console.log('Created new logo.png files successfully!');
