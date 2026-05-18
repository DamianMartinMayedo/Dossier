/**
 * scripts/seed-images.ts
 *
 * Uploads every file from public/assets/optimized/ to the Supabase Storage
 * bucket "projects". Already-uploaded files are skipped (upsert: false).
 *
 * Prerequisites
 * ─────────────
 * 1. Run  npm run optimize-images  first.
 * 2. Copy .env.local to the shell or export the vars below:
 *      NEXT_PUBLIC_SUPABASE_URL
 *      SUPABASE_SERVICE_ROLE_KEY
 *
 * Usage:  npm run seed-images
 *
 * The uploaded path in Supabase Storage will mirror the output filename, e.g.
 *   agedigital-cover.webp
 *   empresas/ciclogreen.webp
 *   mandao-gallery-01.webp
 */

import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load .env.local so the script can run standalone (outside Next.js)
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET       = "projects";
const OPTIMIZED    = path.resolve(process.cwd(), "public/assets/optimized");

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error(
    "❌  Missing env vars. Export NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before running."
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function walkSync(dir: string, results: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkSync(full, results);
    else results.push(full);
  }
  return results;
}

async function main() {
  if (!fs.existsSync(OPTIMIZED)) {
    console.error(`❌  Optimized directory not found: ${OPTIMIZED}`);
    console.error("   Run  npm run optimize-images  first.");
    process.exit(1);
  }

  const files = walkSync(OPTIMIZED);
  let uploaded = 0;
  let skipped  = 0;
  let errors   = 0;

  for (const file of files) {
    const storagePath = path.relative(OPTIMIZED, file).replace(/\\/g, "/"); // forward slashes
    const buffer      = fs.readFileSync(file);
    const ext         = path.extname(file).toLowerCase();
    const contentType = ext === ".svg" ? "image/svg+xml" : "image/webp";

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, buffer, {
        contentType,
        upsert: false, // skip if already exists
      });

    if (error) {
      if (error.message?.includes("already exists") || (error as any).statusCode === "409") {
        console.log(`⏭   Already exists: ${storagePath}`);
        skipped++;
      } else {
        console.error(`❌  Error uploading ${storagePath}:`, error.message);
        errors++;
      }
    } else {
      console.log(`↑   Uploaded: ${storagePath}`);
      uploaded++;
    }
  }

  console.log(`\n✅  Done — ${uploaded} uploaded, ${skipped} skipped, ${errors} errors.`);

  if (uploaded > 0) {
    console.log("\n📋  Public URL pattern:");
    console.log(`   ${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/{filename}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
