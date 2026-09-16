import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client. Bypasses Row Level Security — only ever
 * import this from Server Actions / Route Handlers that have already
 * verified the caller is an authenticated admin. Never expose to the client.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

export const PRODUCT_IMAGES_BUCKET = "product-images";

/** Creates the product-images bucket (public) the first time it's needed. */
export async function ensureProductImagesBucket() {
  const supabase = createAdminClient();
  const { data: buckets } = await supabase.storage.listBuckets();

  if (!buckets?.some((b) => b.name === PRODUCT_IMAGES_BUCKET)) {
    const { error } = await supabase.storage.createBucket(
      PRODUCT_IMAGES_BUCKET,
      {
        public: true,
        fileSizeLimit: "8mb",
        allowedMimeTypes: ["image/png", "image/jpeg", "image/webp", "image/gif"],
      },
    );
    if (error && !error.message.includes("already exists")) {
      throw new Error(`Could not create storage bucket: ${error.message}`);
    }
  }

  return supabase;
}
