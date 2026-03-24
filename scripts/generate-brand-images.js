/* One-off: generates public/images/og-default.png and favicon PNGs. Run: node scripts/generate-brand-images.js */
const fs = require('fs');
const path = require('path');

let sharp;
try {
  sharp = require('sharp');
} catch {
  console.error('Install sharp: npm install sharp --no-save');
  process.exit(1);
}

const root = path.join(__dirname, '..');
const publicDir = path.join(root, 'public');
const imagesDir = path.join(publicDir, 'images');

function ogSvg() {
  const w = 1200;
  const h = 630;
  return `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a1628"/>
      <stop offset="100%" stop-color="#0d2347"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <rect x="0" y="0" width="100%" height="8" fill="#ff6b2b"/>
  <text x="600" y="290" font-family="Arial Black,Arial,sans-serif" font-size="68" fill="#ffffff" text-anchor="middle">ELECZIO</text>
  <text x="600" y="365" font-family="Arial,sans-serif" font-size="26" fill="#ffc857" text-anchor="middle">Electrical &amp; Electronics</text>
  <text x="600" y="410" font-family="Arial,sans-serif" font-size="22" fill="rgba(255,255,255,0.75)" text-anchor="middle">Khandwa</text>
</svg>`;
}

function faviconSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="b" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ff6b2b"/>
      <stop offset="100%" stop-color="#ffc857"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="14" fill="url(#b)"/>
  <path fill="#fff" d="M36 12L22 38h8l-2 14 18-28h-8l2-12z"/>
</svg>`;
}

async function main() {
  fs.mkdirSync(imagesDir, { recursive: true });

  await sharp(Buffer.from(ogSvg())).png().toFile(path.join(imagesDir, 'og-default.png'));
  console.log('Wrote public/images/og-default.png');

  const favBuf = Buffer.from(faviconSvg());
  await sharp(favBuf).resize(32, 32).png().toFile(path.join(publicDir, 'favicon-32x32.png'));
  await sharp(favBuf).resize(180, 180).png().toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Wrote public/favicon-32x32.png, public/apple-touch-icon.png');

  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), faviconSvg(), 'utf8');
  console.log('Wrote public/favicon.svg');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
