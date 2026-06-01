import { createClient } from "@supabase/supabase-js";
import { hasSupabaseServiceConfig } from "@/lib/env";

export function createSupabaseAdminClient() {
  if (!hasSupabaseServiceConfig()) {
    return null;
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}
