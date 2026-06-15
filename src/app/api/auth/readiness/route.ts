import { NextResponse } from "next/server";
import { getAuthRedirectOrigin, getMissingSupabaseBrowserConfig, getSupabasePublishableKey, hasSupabaseBrowserConfig } from "@/lib/env";

type SupabaseAuthSettings = {
  external?: Record<string, boolean>;
  disable_signup?: boolean;
};

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!hasSupabaseBrowserConfig()) {
    return NextResponse.json({
      configured: false,
      missing: getMissingSupabaseBrowserConfig(),
      emailEnabled: false,
      googleEnabled: false,
      redirectOrigin: getRedirectOrigin(request)
    });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const supabaseKey = getSupabasePublishableKey() as string;

  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/settings`, {
      headers: {
        apikey: supabaseKey,
        authorization: `Bearer ${supabaseKey}`
      },
      cache: "no-store"
    });

    if (!response.ok) {
      return NextResponse.json({
        configured: true,
        error: "Unable to read Supabase Auth provider settings.",
        emailEnabled: null,
        googleEnabled: null,
        redirectOrigin: getRedirectOrigin(request)
      });
    }

    const settings = (await response.json()) as SupabaseAuthSettings;
    return NextResponse.json({
      configured: true,
      signupDisabled: Boolean(settings.disable_signup),
      emailEnabled: settings.external?.email ?? null,
      googleEnabled: settings.external?.google ?? null,
      redirectOrigin: getRedirectOrigin(request),
      supabaseCallbackUrl: `${supabaseUrl}/auth/v1/callback`
    });
  } catch {
    return NextResponse.json({
      configured: true,
      error: "Unable to reach Supabase Auth provider settings.",
      emailEnabled: null,
      googleEnabled: null,
      redirectOrigin: getRedirectOrigin(request)
    });
  }
}

function getRedirectOrigin(request: Request) {
  return getAuthRedirectOrigin() ?? new URL(request.url).origin;
}
