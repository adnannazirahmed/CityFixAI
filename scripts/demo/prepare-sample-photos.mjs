#!/usr/bin/env node
// Prepares the demo sample photos.
//
//   npm run demo:photos
//
// Input  (gitignored): demo-photos-raw/<photoId>.<jpg|jpeg|png|webp|avif|tif|tiff>
// Output (committed):  public/demo/samples/<photoId>.jpg
//                      public/demo/samples/preview.html  (contact sheet)
//
// Each photo is auto-rotated from EXIF, resized to max 1024px on the long edge,
// re-encoded as JPEG (quality 80), and written with ALL metadata stripped
// (EXIF incl. GPS, XMP, IPTC, ICC). The output is re-read to verify that.

import { readFile, writeFile, mkdir, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const RAW_DIR = path.join(ROOT, 'demo-photos-raw');
const OUT_DIR = path.join(ROOT, 'public', 'demo', 'samples');
const PHOTO_IDS = JSON.parse(await readFile(path.join(ROOT, 'src', 'data', 'demo-photo-ids.json'), 'utf8'));

const EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.tif', '.tiff', '.heic', '.heif'];
const MAX_EDGE = 1024;
const QUALITY = 80;

const warnings = [];
const errors = [];
const warn = msg => { warnings.push(msg); console.warn(`  ⚠  ${msg}`); };
const fail = msg => { errors.push(msg); console.error(`  ✖  ${msg}`); };

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const rel = p => path.relative(ROOT, p).replace(/\\/g, '/');

// ─── Setup ────────────────────────────────────────────────────────────────────
if (!existsSync(RAW_DIR)) {
  await mkdir(RAW_DIR, { recursive: true });
  console.log(`Created ${rel(RAW_DIR)}/.`);
  console.log(`Drop your photos there named by id (${PHOTO_IDS.join(', ')}) and run again.`);
  process.exit(1);
}

await mkdir(OUT_DIR, { recursive: true });
const rawFiles = await readdir(RAW_DIR);

// ─── Photos ───────────────────────────────────────────────────────────────────
console.log(`\nProcessing photos from ${rel(RAW_DIR)}/ → ${rel(OUT_DIR)}/\n`);
const results = [];

for (const id of PHOTO_IDS) {
  console.log(`• ${id}`);
  const matches = rawFiles.filter(f => {
    const ext = path.extname(f).toLowerCase();
    return EXTENSIONS.includes(ext) && path.basename(f, path.extname(f)).toLowerCase() === id.toLowerCase();
  });

  if (matches.length === 0) {
    warn(`MISSING PHOTO for "${id}": expected ${rel(RAW_DIR)}/${id}.jpg (or .png/.webp/...). The demo will show a placeholder tile.`);
    results.push({ id, ok: false });
    continue;
  }
  if (matches.length > 1) warn(`Several files for "${id}" (${matches.join(', ')}); using ${matches[0]}.`);

  const input = path.join(RAW_DIR, matches[0]);
  const output = path.join(OUT_DIR, `${id}.jpg`);
  try {
    // sharp drops all metadata unless keepMetadata()/withMetadata() is called;
    // rotate() with no arguments applies the EXIF orientation first.
    await sharp(input, { failOn: 'none' })
      .rotate()
      .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: QUALITY, mozjpeg: true })
      .toFile(output);

    const meta = await sharp(output).metadata();
    const leaked = ['exif', 'xmp', 'iptc', 'icc'].filter(k => meta[k]);
    if (leaked.length) {
      fail(`Metadata still present in ${rel(output)} (${leaked.join(', ')}). Do not commit it.`);
      results.push({ id, ok: false });
      continue;
    }
    const { size } = await stat(output);
    console.log(`    ${matches[0]} → ${id}.jpg  ${meta.width}×${meta.height}, ${(size / 1024).toFixed(0)} KB, metadata stripped`);
    results.push({ id, ok: true, width: meta.width, height: meta.height, size, from: matches[0] });
  } catch (err) {
    const hint = ['.heic', '.heif'].includes(path.extname(input).toLowerCase())
      ? ' (HEIC is usually not supported by sharp’s prebuilt binaries; export as JPEG first)'
      : '';
    fail(`Could not process ${matches[0]}: ${err.message}${hint}`);
    results.push({ id, ok: false });
  }
}

// ─── Contact sheet ────────────────────────────────────────────────────────────
const cards = results.map(r => {
  const img = r.ok
    ? `<img src="${esc(r.id)}.jpg" alt="${esc(r.id)}" width="${r.width}" height="${r.height}">`
    : '<div class="missing">Missing photo</div>';
  const info = r.ok ? `${r.width}×${r.height} · ${(r.size / 1024).toFixed(0)} KB · from ${esc(r.from)}` : '';
  return `<figure>${img}<figcaption><strong>${esc(r.id)}</strong><small>${info}</small></figcaption></figure>`;
}).join('\n');

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>CityFix demo samples</title>
<style>
  body { font: 14px/1.4 system-ui, sans-serif; margin: 24px; background: #f9fafb; color: #111827; }
  h1 { font-size: 18px; margin: 0 0 4px; }
  p { color: #6b7280; margin: 0 0 16px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; }
  figure { margin: 0; background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden; }
  img, .missing { display: block; width: 100%; height: 180px; object-fit: cover; }
  .missing { display: flex; align-items: center; justify-content: center; background: #fef3c7; color: #92400e; font-weight: 600; }
  figcaption { display: grid; gap: 2px; padding: 10px 12px; }
  small { color: #6b7280; }
</style>
</head>
<body>
<h1>CityFix demo sample photos</h1>
<p>Generated by scripts/demo/prepare-sample-photos.mjs on ${esc(new Date().toISOString())}. All metadata stripped.</p>
<div class="grid">
${cards}
</div>
</body>
</html>
`;
await writeFile(path.join(OUT_DIR, 'preview.html'), html);
console.log(`  wrote ${rel(path.join(OUT_DIR, 'preview.html'))}`);

// ─── Summary ──────────────────────────────────────────────────────────────────
const done = results.filter(r => r.ok).length;
console.log(`\n${done}/${PHOTO_IDS.length} photos ready.`);
if (warnings.length) console.warn(`${warnings.length} warning(s) above.`);
if (errors.length) {
  console.error(`${errors.length} error(s) above.`);
  process.exit(1);
}
if (done === PHOTO_IDS.length && !warnings.length) {
  console.log('Next: open public/demo/samples/preview.html to check them, then run `npm run demo:analyze`.');
}
