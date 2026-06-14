import { NextResponse } from "next/server";
import { hasSupabaseBrowserConfig, isWaasTestMode } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);

  if (!isWaasTestMode() && hasSupabaseBrowserConfig()) {
    const supabase = createSupabaseServerClient();
    await supabase.auth.signOut();
  }

  return NextResponse.redirect(new URL("/login", requestUrl.origin));
}
