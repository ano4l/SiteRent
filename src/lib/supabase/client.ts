import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublishableKey } from "@/lib/env";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = getSupabasePublishableKey();

export const createSupabaseBrowserClient = () =>
  createBrowserClient(
    supabaseUrl!,
    supabaseKey!,
  );

export const createClient = createSupabaseBrowserClient;
