import "server-only";
import { createClient } from "@/lib/supabase/server";

/**
 * Verifies the current request is an authenticated Supabase user.
 * Call this at the top of every admin Server Action — the Proxy only
 * gates page navigation, not the action endpoints themselves.
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Unauthorized");
  }

  return user;
}
