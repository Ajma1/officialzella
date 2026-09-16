// One-off: upload the staged catalog photos to Supabase Storage and print
// their public URLs (consumed by prisma/seed.ts). Run with:
//   node --env-file=.env scripts/upload-catalog-images.mjs
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const BUCKET = "product-images";
const STAGING_DIR = path.join(import.meta.dirname, "..", "media-staging");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

const { data: buckets } = await supabase.storage.listBuckets();
if (!buckets?.some((b) => b.name === BUCKET)) {
  const { error } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: "8mb",
    allowedMimeTypes: ["image/png", "image/jpeg", "image/webp", "image/gif"],
  });
  if (error && !error.message.includes("already exists")) {
    throw new Error(`Could not create bucket: ${error.message}`);
  }
}

const files = fs.readdirSync(STAGING_DIR).filter((f) => f.endsWith(".jpeg"));
const urls = {};

for (const file of files) {
  const storagePath = `catalog/${file}`;
  const buf = fs.readFileSync(path.join(STAGING_DIR, file));
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buf, { contentType: "image/jpeg", upsert: true });
  if (error) throw new Error(`Upload failed for ${file}: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  urls[file.replace(".jpeg", "")] = data.publicUrl;
  console.log(`uploaded ${file}`);
}

fs.writeFileSync(
  path.join(import.meta.dirname, "..", "catalog-image-urls.json"),
  JSON.stringify(urls, null, 2),
);
console.log("wrote catalog-image-urls.json");
