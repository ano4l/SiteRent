import { NextResponse } from "next/server";
import { getMissingSupabaseBrowserConfig, hasSupabaseBrowserConfig, isWaasTestMode } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function buildLoginRedirect(requestUrl: URL, next: string, error: string, missing?: string[]) {
  const loginUrl = new URL("/login", requestUrl.origin);
  loginUrl.searchParams.set("next", next);
  loginUrl.searchParams.set("auth_error", error);
  if (missing?.length) loginUrl.searchParams.set("missing", missing.join(","));
  return NextResponse.redirect(loginUrl);
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next");
  const callbackError = requestUrl.searchParams.get("error_description") ?? requestUrl.searchParams.get("error");
  const safeNext = next?.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

  if (isWaasTestMode()) {
    return NextResponse.redirect(new URL(safeNext, requestUrl.origin));
  }

  if (!hasSupabaseBrowserConfig()) {
    return buildLoginRedirect(
      requestUrl,
      safeNext,
      "Supabase Auth is not configured yet.",
      getMissingSupabaseBrowserConfig()
    );
  }

  if (callbackError) {
    return buildLoginRedirect(requestUrl, safeNext, callbackError);
  }

  if (!code) {
    return buildLoginRedirect(requestUrl, safeNext, "The authentication callback was missing a code.");
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return buildLoginRedirect(requestUrl, safeNext, error.message || "Unable to complete authentication.");
  }

  return NextResponse.redirect(new URL(safeNext, requestUrl.origin));
}
