import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getMissingSupabaseBrowserConfig, getSupabasePublishableKey, hasSupabaseBrowserConfig, isWaasTestMode } from "@/lib/env";

const protectedPagePrefixes = ["/admin", "/builder", "/dashboard", "/onboarding", "/tutorial"];
const protectedApiPrefixes = [
  "/api/admin",
  "/api/ai",
  "/api/billing",
  "/api/dashboard",
  "/api/onboarding",
  "/api/peach/checkout",
  "/api/publish",
  "/api/subdomains",
  "/api/uploads"
];

function matchesPrefix(pathname: string, prefixes: string[]) {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function isProtectedRoute(pathname: string) {
  return matchesPrefix(pathname, protectedPagePrefixes) || matchesPrefix(pathname, protectedApiPrefixes);
}

function isProtectedApi(pathname: string) {
  return matchesPrefix(pathname, protectedApiPrefixes);
}

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(loginUrl);
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const protectedRoute = isProtectedRoute(pathname);

  if (isWaasTestMode()) {
    const response = NextResponse.next();
    response.headers.set("x-siterent-mode", "test");
    return response;
  }

  if (!hasSupabaseBrowserConfig()) {
    if (!protectedRoute) return NextResponse.next();

    if (isProtectedApi(pathname)) {
      return NextResponse.json(
        {
          error: "Supabase Auth is required before this production action can run.",
          missing: getMissingSupabaseBrowserConfig()
        },
        { status: 503 }
      );
    }

    return redirectToLogin(request);
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers
    }
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    getSupabasePublishableKey() as string,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request: {
              headers: request.headers
            }
          });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        }
      }
    }
  );

  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const isAuthenticated = Boolean(!claimsError && claimsData?.claims?.sub);

  if (protectedRoute && !isAuthenticated) {
    if (isProtectedApi(pathname)) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    return redirectToLogin(request);
  }

  if (pathname === "/login" && isAuthenticated) {
    const next = request.nextUrl.searchParams.get("next");
    return NextResponse.redirect(new URL(next && next.startsWith("/") ? next : "/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|manifest.webmanifest|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"
  ]
};
