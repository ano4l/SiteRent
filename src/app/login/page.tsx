"use client";

import Link from "next/link";
import { CheckCircle2, LayoutGrid, LockKeyhole, Mail, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getAuthRedirectOrigin, hasSupabaseBrowserConfig, isWaasTestMode } from "@/lib/env";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/input";

type AuthMode = "sign-in" | "register";
type AuthStatus = "idle" | "submitting" | "sent" | "error" | "config-missing" | "oauth";
type AuthReadiness = {
  configured: boolean;
  emailEnabled: boolean | null;
  googleEnabled: boolean | null;
  redirectOrigin?: string;
  supabaseCallbackUrl?: string;
  error?: string;
};

type LoginPageProps = {
  searchParams?: {
    next?: string;
    auth_error?: string;
    missing?: string;
  };
};

function buildInitialAuthMessage(searchParams?: LoginPageProps["searchParams"]) {
  if (!searchParams?.auth_error) return "";
  return searchParams.missing ? `${searchParams.auth_error} Missing: ${searchParams.missing}.` : searchParams.auth_error;
}

function getInitialAuthStatus(searchParams?: LoginPageProps["searchParams"]): AuthStatus {
  const error = searchParams?.auth_error;
  if (!error) return "idle";
  return error.includes("not configured") ? "config-missing" : "error";
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<AuthStatus>(() => getInitialAuthStatus(searchParams));
  const [message, setMessage] = useState(() => buildInitialAuthMessage(searchParams));
  const [authReadiness, setAuthReadiness] = useState<AuthReadiness | null>(null);
  const [nextPath, setNextPath] = useState(() => {
    const requestedNext = searchParams?.next;
    return requestedNext?.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/dashboard";
  });
  const testMode = isWaasTestMode();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedNext = params.get("next");
    if (requestedNext?.startsWith("/") && !requestedNext.startsWith("//")) {
      setNextPath(requestedNext);
    }

    const authError = params.get("auth_error");
    if (authError) {
      const missing = params.get("missing");
      setStatus(authError.includes("not configured") ? "config-missing" : "error");
      setMessage(missing ? `${authError} Missing: ${missing}.` : authError);
    }
  }, []);

  useEffect(() => {
    if (testMode || !hasSupabaseBrowserConfig()) return;

    let isMounted = true;
    fetch("/api/auth/readiness", { cache: "no-store" })
      .then((response) => response.json() as Promise<AuthReadiness>)
      .then((readiness) => {
        if (isMounted) setAuthReadiness(readiness);
      })
      .catch(() => {
        if (isMounted) {
          setAuthReadiness({
            configured: true,
            emailEnabled: null,
            googleEnabled: null,
            error: "Unable to confirm Supabase Auth provider settings."
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [testMode]);

  const title = testMode
    ? "SiteRent test mode is on."
    : mode === "register"
      ? "Create your SiteRent account."
      : "Sign in to SiteRent.";
  const copy = testMode
    ? "Use the full app with sample client data while Supabase is not required. Production auth stays available when test mode is turned off."
    : mode === "register"
      ? "Register before using the builder, onboarding, dashboard, or admin tools."
      : "Access is locked to authenticated users so production client work stays tied to a real account.";
  const submitting = status === "submitting" || status === "oauth";
  const googleDisabled = !testMode && authReadiness?.googleEnabled === false;
  const redirectTo = useMemo(() => {
    if (typeof window === "undefined") return "/auth/callback";
    const origin = getAuthRedirectOrigin() ?? window.location.origin;
    return `${origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;
  }, [nextPath]);

  function requireSupabase() {
    if (testMode) return true;
    if (hasSupabaseBrowserConfig()) return true;
    setStatus("config-missing");
    setMessage("Supabase Auth must be configured before production sign-in can continue.");
    return false;
  }

  function continueInTestMode() {
    setStatus("sent");
    setMessage("Test mode active: opening the requested workspace with sample data.");
    window.location.assign(nextPath);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (testMode) {
      continueInTestMode();
      return;
    }

    if (!requireSupabase()) return;

    setStatus("submitting");
    setMessage("");
    const supabase = createSupabaseBrowserClient();

    if (mode === "register") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectTo,
          data: {
            full_name: name
          }
        }
      });

      if (error) {
        setStatus("error");
        setMessage(error.message);
        return;
      }

      if (data.session) {
        window.location.assign(nextPath);
        return;
      }

      setStatus("sent");
      setMessage("Check your email to confirm the account, then return to SiteRent.");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    window.location.assign(nextPath);
  }

  async function sendMagicLink() {
    if (testMode) {
      continueInTestMode();
      return;
    }

    if (!email) {
      setStatus("error");
      setMessage("Enter your email address first.");
      return;
    }

    if (!requireSupabase()) return;

    setStatus("submitting");
    setMessage("");
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo
      }
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    setStatus("sent");
    setMessage("Check your email for the secure sign-in link.");
  }

  async function signInWithGoogle() {
    if (testMode) {
      continueInTestMode();
      return;
    }

    if (!requireSupabase()) return;

    if (googleDisabled) {
      setStatus("error");
      setMessage("Google OAuth is not enabled in Supabase yet.");
      return;
    }

    setStatus("oauth");
    setMessage("");
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        scopes: "email profile"
      }
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_14%_18%,rgba(219,234,254,0.82),transparent_28%),radial-gradient(circle_at_88%_18%,rgba(204,251,241,0.58),transparent_30%),linear-gradient(135deg,var(--app-bg)_0%,var(--app-bg-soft)_100%)] p-3 text-foreground sm:p-5 md:p-8">
      <section className="ui-enter mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-7xl overflow-hidden rounded-[22px] border border-white/80 bg-white shadow-[0_32px_90px_rgba(15,23,42,0.14)] sm:min-h-[calc(100vh-2.5rem)] md:rounded-[28px] lg:grid-cols-[0.92fr_1.08fr]">
        <div className="flex flex-col justify-between px-5 py-6 sm:px-7 sm:py-8 md:px-12 md:py-10 lg:min-h-[720px]">
          <Link href="/" className="flex items-center gap-3 text-xl font-bold">
            <SiteRentAuthMark />
            SiteRent
          </Link>

          <div className="mx-auto w-full max-w-xl py-8 md:py-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-app-surface px-3 py-1.5 text-sm font-semibold text-muted-foreground">
              <Sparkles className="size-4 text-blue-600" />
              {testMode ? "Temporary database-free mode" : "Production account required"}
            </div>
            <h1 className="mt-7 text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl">{title}</h1>
            <p className="mt-4 max-w-lg text-base leading-7 text-muted-foreground">{copy}</p>

            <div className="mt-8 grid grid-cols-2 gap-2 rounded-2xl bg-app-surface p-1">
              <button
                type="button"
                onClick={() => setMode("sign-in")}
                className={`rounded-xl px-4 py-3 text-sm font-bold transition ${mode === "sign-in" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => setMode("register")}
                className={`rounded-xl px-4 py-3 text-sm font-bold transition ${mode === "register" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                Register
              </button>
            </div>

            {testMode && (
              <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <p className="text-sm font-semibold text-blue-900">Supabase is bypassed for this local run.</p>
                <p className="mt-1 text-sm leading-6 text-blue-800">Dashboard, admin, onboarding, uploads, billing, and AI actions use test responses.</p>
                <button type="button" onClick={continueInTestMode} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-800">
                  Continue without Supabase
                  <LayoutGrid className="size-4" />
                </button>
              </div>
            )}

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              {mode === "register" && (
                <Field
                  label="Full name"
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your name"
                />
              )}
              <Field
                label="Email address"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@company.com"
              />
              <Field
                label="Password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 8 characters"
                hint={mode === "register" ? "Use at least 8 characters. Supabase can enforce stronger rules from the Auth settings." : undefined}
              />
              <Button
                size="lg"
                type="submit"
                disabled={submitting}
                className="w-full"
              >
                <LockKeyhole size={18} />
                {status === "submitting" ? "Working..." : mode === "register" ? "Create account" : "Sign in"}
              </Button>
            </form>

            <div className="my-5 flex items-center gap-3">
              <span className="h-px flex-1 bg-app-divider" />
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">or</span>
              <span className="h-px flex-1 bg-app-divider" />
            </div>

            <div className="grid gap-3">
              <Button variant="secondary" disabled={submitting || googleDisabled} onClick={signInWithGoogle} className="w-full">
                <GoogleLogo />
                {googleDisabled ? "Google OAuth disabled in Supabase" : "Continue with Google"}
              </Button>
              <Button variant="subtle" disabled={submitting} onClick={sendMagicLink} className="w-full">
                <Mail size={18} />
                Email me a secure sign-in link
              </Button>
            </div>

            <div role="status" aria-live="polite">
              {googleDisabled && (
                <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-semibold leading-6 text-amber-800">
                  Enable Google in Supabase Auth providers. Use Google callback URL{" "}
                  <span className="font-mono text-xs">{authReadiness?.supabaseCallbackUrl ?? "your Supabase /auth/v1/callback URL"}</span>{" "}
                  and allow app redirect{" "}
                  <span className="font-mono text-xs">{authReadiness?.redirectOrigin ?? "your SiteRent origin"}/auth/callback</span>.
                </p>
              )}
              {message && (
                <p className={`mt-4 rounded-xl p-3 text-sm font-semibold ${status === "error" || status === "config-missing" ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"}`}>
                  {message}
                </p>
              )}
              {status === "oauth" && <p className="mt-4 rounded-xl bg-blue-50 p-3 text-sm font-semibold text-blue-700">Redirecting to Google...</p>}
            </div>
          </div>

          <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
            {(testMode ? ["Test data", "No database required", "Protected routes bypassed"] : ["Supabase Auth", googleDisabled ? "Google setup needed" : "Google OAuth", "Protected workspace"]).map((item) => (
              <span key={item} className="inline-flex items-center gap-2">
                <CheckCircle2 className="size-4 text-blue-600" />
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="relative hidden overflow-hidden border-l border-app-line-soft bg-[linear-gradient(135deg,#fbfbfc_0%,var(--app-bg-soft)_100%)] lg:block">
          <div className="absolute left-16 top-24 rounded-2xl border border-white/80 bg-white/86 p-4 shadow-[0_24px_70px_rgba(15,23,42,0.10)] backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <SiteRentAuthMark />
              <div>
                <p className="font-semibold text-foreground">Production workspace</p>
                <p className="text-xs text-muted-foreground">Authenticated account</p>
              </div>
            </div>
            <div className="mt-5 space-y-2">
              {["Dashboard", "Website", "Media", "Leads", "Settings"].map((item, index) => (
                <div key={item} className={`flex items-center gap-3 rounded-xl px-3 py-2 ${index === 0 ? "bg-app-surface text-foreground" : "text-muted-foreground"}`}>
                  <LayoutGrid className="size-4" />
                  <span className="text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="absolute bottom-20 right-[-60px] w-[560px] rounded-[26px] border border-white/80 bg-white p-5 shadow-[0_34px_90px_rgba(15,23,42,0.16)]">
            <div className="flex items-center justify-between border-b border-app-line-soft pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">First-use guide</p>
                <h2 className="mt-1 text-2xl font-bold">Create, onboard, review, monitor</h2>
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">Auth first</span>
            </div>
            <div className="mt-5 grid gap-3">
              {["Register or sign in", "Generate an AI draft", "Complete onboarding", "Review from the dashboard"].map((item, index) => (
                <div key={item} className="flex items-center gap-3 rounded-xl bg-app-surface p-3 text-sm font-semibold text-foreground">
                  <span className="grid size-7 place-items-center rounded-full bg-white text-xs font-bold">{index + 1}</span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function SiteRentAuthMark() {
  return (
    <span className="grid size-9 shrink-0 grid-cols-2 gap-1 rounded-lg bg-brand-mint p-1">
      <span className="rounded-[4px] bg-brand-green-500" />
      <span className="rounded-[4px] bg-brand-green-300" />
      <span className="rounded-[4px] bg-brand-green-300" />
      <span className="rounded-[4px] bg-brand-green-700" />
    </span>
  );
}

function GoogleLogo() {
  return (
    <svg viewBox="0 0 18 18" className="size-[18px]" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z" />
      <path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.05l3.01-2.33Z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z" />
    </svg>
  );
}
