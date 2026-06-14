import { hasSupabaseBrowserConfig, isWaasTestMode } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { TEST_USER_ID } from "@/lib/test-data";

export async function getAuthenticatedUserId() {
  if (isWaasTestMode()) return TEST_USER_ID;
  if (!hasSupabaseBrowserConfig()) return null;
  return (await createSupabaseServerClient().auth.getUser()).data.user?.id ?? null;
}
