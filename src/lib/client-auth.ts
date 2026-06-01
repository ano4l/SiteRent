import { hasSupabaseBrowserConfig } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getAuthenticatedUserId() {
  if (!hasSupabaseBrowserConfig()) return null;
  return (await createSupabaseServerClient().auth.getUser()).data.user?.id ?? null;
}
