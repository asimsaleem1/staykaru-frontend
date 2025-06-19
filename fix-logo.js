const fs = require('fs');
const path = require('path');
const https = require('https');
const { exec } = require('child_process');

// Path to the new logo.png file
const logoPath = path.join(__dirname, 'assets', 'logo.png');
const backupPath = path.join(__dirname, 'assets', 'logo.png.bak');

// First backup the existing file if it exists
if (fs.existsSync(logoPath)) {
  console.log('Backing up existing logo.png...');
  if (fs.existsSync(backupPath)) {
    fs.unlinkSync(backupPath); // Remove old backup if exists
  }
  fs.renameSync(logoPath, backupPath);
}

// Create a simple placeholder logo using a verified PNG source
// This downloads a simple blue square PNG file that is guaranteed to be valid
console.log('Creating new logo.png file...');

// URL to a simple blue square image (256x256)
const imageUrl = 'https://placehold.co/200x200/4b7bec/FFFFFF.png?text=StayKaru';

const file = fs.createWriteStream(logoPath);
https.get(imageUrl, function(response) {
  response.pipe(file);
  file.on('finish', function() {
    file.close();
    console.log('Successfully created new logo.png file!');
    
    // Try to run the app after fixing the logo
    console.log('Attempting to start the app...');
    exec('npx expo start --clear', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error starting the app: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`Error: ${stderr}`);
        return;
      }
      console.log(`App started: ${stdout}`);
    });
  });
}).on('error', function(err) {
  fs.unlink(logoPath);
  console.error('Error downloading image:', err.message);
  
  // If download fails, create a minimal valid PNG
  createFallbackPng();
});

// Fallback function to create a minimal valid PNG if download fails
function createFallbackPng() {
  console.log('Download failed, creating fallback PNG...');
  
  // Minimal valid PNG file (1x1 transparent pixel)
  const minimalPngBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z/C/HgAGgwJ/lK3Q6wAAAABJRU5ErkJggg==',
    'base64'
  );
  
  fs.writeFileSync(logoPath, minimalPngBuffer);
  console.log('Created minimal fallback PNG file!');
}
