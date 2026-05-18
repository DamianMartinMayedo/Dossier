/**
 * scripts/optimize-images.ts
 *
 * Converts every image in public/assets/ to WebP, normalises the filename to
 * kebab-case ASCII and writes the result to public/assets/optimized/.
 *
 * Usage:  npm run optimize-images
 *
 * Rules
 * ─────
 * • Covers  → max 1600 × 1200 px, quality 82
 * • Gallery → max 1920 px on the longest side, quality 82
 * • Logos   → max 400 × 400 px, quality 90 (lossless not needed for WebP logos)
 * • SVG files are copied as-is (sharp cannot convert SVG→WebP reliably)
 * • If two source files map to the same output name, the second is skipped
 *   (prevents Mandao.jpg overwriting Mandao.png etc.)
 */

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

// ─── Configuration ────────────────────────────────────────────────────────────

const ROOT = path.resolve(process.cwd(), "public/assets");
const OUT  = path.resolve(process.cwd(), "public/assets/optimized");

// Explicit cover rename map  (source relative to ROOT → output filename)
const COVER_MAP: Record<string, string> = {
  "00_Portadas/AgeDigit@l.png":   "agedigital-cover.webp",
  "00_Portadas/CH.png":           "centro-habana-cover.webp",
  "00_Portadas/Ciclogreen.png":   "ciclogreen-cover.webp",
  "00_Portadas/Mandao.png":       "mandao-cover.webp",
  "00_Portadas/Mandao.jpg":       null!, // duplicate — skip
  "00_Portadas/Misscar.png":      "misscar-cover.webp",
  "00_Portadas/Qombii.png":       "qombii-cover.webp",
  "00_Portadas/Saturday.png":     "saturday-cover.webp",
  "00_Portadas/Sube.png":         "sube-cover.webp",
};

// Secondary project covers
const SECONDARY_COVER_MAP: Record<string, string> = {
  "02_SECUNDARIAS/00_portadas/Altiora.png":                   "altiora-cover.webp",
  "02_SECUNDARIAS/00_portadas/Centro estudio.png":            "centro-estudio-cover.webp",
  "02_SECUNDARIAS/00_portadas/Clacudama.png":                 "clacudama-cover.webp",
  "02_SECUNDARIAS/00_portadas/Electronautic.png":             "electronautic-cover.webp",
  "02_SECUNDARIAS/00_portadas/Eutron.png":                    "eutron-cover.webp",
  "02_SECUNDARIAS/00_portadas/Ibizza.png":                    "ibizza-cover.webp",
  "02_SECUNDARIAS/00_portadas/Iwantech.png":                  "iwantech-cover.webp",
  "02_SECUNDARIAS/00_portadas/JauJAUS.png":                   "jaujaus-cover.webp",
  "02_SECUNDARIAS/00_portadas/Junta de andalucía.png":        "junta-andalucia-cover.webp",
  "02_SECUNDARIAS/00_portadas/Madrid Estate.png":             "madrid-estate-cover.webp",
  "02_SECUNDARIAS/00_portadas/Nimo_Gordillo.png":             "nimo-gordillo-cover.webp",
  "02_SECUNDARIAS/00_portadas/OBRS.png":                      "obrs-cover.webp",
  "02_SECUNDARIAS/00_portadas/Palex.png":                     "palex-cover.webp",
  "02_SECUNDARIAS/00_portadas/Próxima Energía.png":           "proxima-energia-cover.webp",
  "02_SECUNDARIAS/00_portadas/Solution Grow.png":             "solution-grow-cover.webp",
  "02_SECUNDARIAS/00_portadas/T5ArQ.png":                     "t5arq-cover.webp",
  "02_SECUNDARIAS/00_portadas/Unipromel.png":                 "unipromel-cover.webp",
  "02_SECUNDARIAS/00_portadas/logo-eutron-transparente 1.png":"eutron-logo.webp",
  "02_SECUNDARIAS/00_portadas/subasta.png":                   "subasta-cover.webp",
};

// Map folder name → project slug (for auto-naming gallery images)
const PROJECT_SLUG: Record<string, string> = {
  AgeDigital:    "agedigital",
  "Centro Habana": "centro-habana",
  Ciclogreen:    "ciclogreen",
  Mandao:        "mandao",
  MissCar:       "misscar",
  Qombii:        "qombii",
  Saturday:      "saturday",
  Sube:          "sube",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function walkSync(dir: string, results: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkSync(full, results);
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      if ([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"].includes(ext)) {
        results.push(full);
      }
    }
  }
  return results;
}

async function convert(
  src: string,
  dest: string,
  opts: { maxWidth: number; maxHeight: number; quality: number }
) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });

  const ext = path.extname(src).toLowerCase();
  if (ext === ".svg") {
    fs.copyFileSync(src, dest.replace(/\.webp$/, ".svg"));
    return;
  }

  await sharp(src)
    .resize(opts.maxWidth, opts.maxHeight, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: opts.quality })
    .toFile(dest);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const allFiles = walkSync(ROOT);
  const used = new Set<string>(); // track output names to skip duplicates
  let ok = 0;
  let skipped = 0;

  // 1. Explicit cover map (00_Portadas)
  for (const [rel, outName] of Object.entries(COVER_MAP)) {
    if (!outName) { skipped++; continue; } // null = intentionally skipped
    const src = path.join(ROOT, rel);
    if (!fs.existsSync(src)) { console.warn(`⚠  Not found: ${rel}`); continue; }
    const dest = path.join(OUT, outName);
    if (used.has(outName)) { console.warn(`⚠  Duplicate skipped: ${rel}`); skipped++; continue; }
    used.add(outName);
    await convert(src, dest, { maxWidth: 1600, maxHeight: 1200, quality: 82 });
    console.log(`✓  ${rel} → ${outName}`);
    ok++;
  }

  // 2. Secondary covers
  for (const [rel, outName] of Object.entries(SECONDARY_COVER_MAP)) {
    const src = path.join(ROOT, rel);
    if (!fs.existsSync(src)) { console.warn(`⚠  Not found: ${rel}`); continue; }
    const dest = path.join(OUT, outName);
    if (used.has(outName)) { skipped++; continue; }
    used.add(outName);
    await convert(src, dest, { maxWidth: 1600, maxHeight: 1200, quality: 82 });
    console.log(`✓  ${rel} → ${outName}`);
    ok++;
  }

  // 3. Company logos (empresas/)
  const empresasDir = path.join(ROOT, "empresas");
  for (const file of fs.readdirSync(empresasDir)) {
    const src = path.join(empresasDir, file);
    if (fs.statSync(src).isDirectory()) continue;
    const outName = `empresas/${slugify(path.parse(file).name)}.webp`;
    if (used.has(outName)) { skipped++; continue; }
    used.add(outName);
    const dest = path.join(OUT, outName);
    await convert(src, dest, { maxWidth: 400, maxHeight: 400, quality: 90 });
    console.log(`✓  empresas/${file} → ${outName}`);
    ok++;
  }

  // 4. Gallery images (01_PRINCIPALES/{Project}/**)
  // Count per slug to build sequential index
  const galleryCounters: Record<string, number> = {};

  // Sort so we get a deterministic order (alphabetical by full path)
  const galleryFiles = allFiles
    .filter((f) => f.includes(`${path.sep}01_PRINCIPALES${path.sep}`))
    .sort();

  for (const src of galleryFiles) {
    const rel = path.relative(ROOT, src);
    // Determine project from top-level folder name inside 01_PRINCIPALES
    const parts = rel.split(path.sep); // ["01_PRINCIPALES", "AgeDigital", ...]
    const projectFolder = parts[1];
    const slug = PROJECT_SLUG[projectFolder];
    if (!slug) {
      console.warn(`⚠  Unknown project folder: ${projectFolder}`);
      continue;
    }

    galleryCounters[slug] = (galleryCounters[slug] ?? 0) + 1;
    const idx = String(galleryCounters[slug]).padStart(2, "0");
    const outName = `${slug}-gallery-${idx}.webp`;

    if (used.has(outName)) { skipped++; continue; }
    used.add(outName);
    const dest = path.join(OUT, outName);
    await convert(src, dest, { maxWidth: 1920, maxHeight: 1920, quality: 82 });
    console.log(`✓  ${rel} → ${outName}`);
    ok++;
  }

  console.log(`\n✅  Done — ${ok} converted, ${skipped} skipped.`);
  console.log(`📁  Output: ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
