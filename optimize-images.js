// Runs in CI before build.js: creates responsive WebP variants and caps JPEG size.
const fs = require('fs'); const path = require('path');
const dir = path.join(__dirname, 'site', 'img');
async function main() {
  const sharp = require('sharp');
  let made = 0;
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('.jpg')) continue;
    const base = f.replace(/\.jpg$/, ''); const src = path.join(dir, f);
    const meta = await sharp(src).metadata();
    for (const w of [800, 1600]) {
      const out = path.join(dir, `${base}-${w}.webp`);
      await sharp(src).resize({ width: w, withoutEnlargement: true }).webp({ quality: 76 }).toFile(out);
      made++;
    }
    if (meta.width > 1600) {
      const tmp = src + '.tmp.jpg';
      await sharp(src).resize({ width: 1600 }).jpeg({ quality: 80, mozjpeg: true }).toFile(tmp);
      fs.renameSync(tmp, src);
    }
    console.log('optimized', f, meta.width + 'px');
  }
  console.log('webp files created:', made);
}
main().catch((e) => { console.error('optimize-images failed:', e); process.exit(1); });
