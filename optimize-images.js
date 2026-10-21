// Runs in CI after build.js: creates responsive WebP variants and caps JPEG size.
const fs = require('fs'); const path = require('path'); const sharp = require('sharp');
const dir = path.join(__dirname, 'site', 'img');
(async () => {
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('.jpg')) continue;
    const base = f.replace(/\.jpg$/, ''); const src = path.join(dir, f);
    const meta = await sharp(src).metadata();
    for (const w of [800, 1600]) {
      if (meta.width < w && w !== 800) continue;
      await sharp(src).resize({ width: Math.min(w, meta.width), withoutEnlargement: true }).webp({ quality: 76 }).toFile(path.join(dir, `${base}-${w}.webp`));
    }
    if (meta.width > 1600) await sharp(src).resize({ width: 1600 }).jpeg({ quality: 80, mozjpeg: true }).toFile(src + '.tmp') && fs.renameSync(src + '.tmp', src);
    console.log('optimized', f);
  }
})();
