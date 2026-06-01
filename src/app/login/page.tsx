"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, LayoutGrid, Mail, MonitorPlay, Sparkles } from "lucide-react";
import { useState } from "react";
import { hasSupabaseBrowserConfig } from "@/lib/env";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type OAuthProvider = "google" | "azure";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error" | "local" | "oauth">("idle");

  async function sendMagicLink(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!hasSupabaseBrowserConfig()) {
      setStatus("local");
      return;
    }

    setStatus("sending");
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
    });

    setStatus(error ? "error" : "sent");
  }

  async function signInWithOAuth(provider: OAuthProvider) {
    if (!hasSupabaseBrowserConfig()) {
      setStatus("local");
      return;
    }

    setStatus("oauth");
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: provider === "azure" ? "email profile openid" : "email profile"
      }
    });
    if (error) setStatus("error");
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_14%_18%,rgba(219,234,254,0.82),transparent_28%),radial-gradient(circle_at_88%_18%,rgba(204,251,241,0.58),transparent_30%),linear-gradient(135deg,#f2f4f8_0%,#eef2f6_100%)] p-5 text-foreground md:p-8">
      <section className="ui-enter mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl overflow-hidden rounded-[28px] border border-white/80 bg-white shadow-[0_32px_90px_rgba(15,23,42,0.14)] lg:grid-cols-[0.92fr_1.08fr]">
        <div className="flex min-h-[720px] flex-col justify-between px-7 py-8 md:px-12 md:py-10">
          <Link href="/login" className="flex items-center gap-3 text-xl font-bold">
            <SiteRentAuthMark />
            SiteRent
          </Link>

          <div className="mx-auto w-full max-w-xl py-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#f4f6f8] px-3 py-1.5 text-sm font-semibold text-muted-foreground">
              <Sparkles className="size-4 text-blue-600" />
              Website rental workspace
            </div>
            <h1 className="mt-7 text-4xl font-bold leading-tight tracking-tight md:text-5xl">Start your website workspace.</h1>
            <p className="mt-4 max-w-lg text-base leading-7 text-muted-foreground">
              Sign in with a magic link, create a site, and move through setup with a guided flow that feels simple from the first click.
            </p>

            <form onSubmit={sendMagicLink} className="mt-8 space-y-4">
              <label className="block text-sm font-semibold text-foreground">
                Email address
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-2 h-12 w-full rounded-xl border border-[#d9dee5] bg-white px-4 text-foreground outline-none transition duration-200 placeholder:text-muted-foreground hover:border-[#b8c0cc] focus:border-[#111827] focus:ring-4 focus:ring-[#111827]/10"
                  placeholder="you@company.com"
                />
              </label>
              <button className="pressable inline-flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-5 py-3.5 font-semibold text-white shadow-[0_18px_34px_rgba(15,23,42,0.18)] transition hover:bg-black">
                <Mail size={18} />
                {status === "sending" ? "Sending..." : "Send magic link"}
              </button>
            </form>

            <div className="my-5 flex items-center gap-3">
              <span className="h-px flex-1 bg-[#e5e7eb]" />
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">or continue with</span>
              <span className="h-px flex-1 bg-[#e5e7eb]" />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={() => signInWithOAuth("google")} className="pressable inline-flex items-center justify-center gap-3 rounded-xl border border-[#d9dee5] bg-white px-5 py-3 text-sm font-semibold text-foreground transition hover:border-[#111827]">
                <span className="grid size-6 place-items-center rounded-full bg-white text-base font-bold text-[#4285f4] shadow-sm ring-1 ring-[#e5e7eb]">G</span>
                Google
              </button>
              <button type="button" onClick={() => signInWithOAuth("azure")} className="pressable inline-flex items-center justify-center gap-3 rounded-xl border border-[#d9dee5] bg-white px-5 py-3 text-sm font-semibold text-foreground transition hover:border-[#111827]">
                <span className="grid size-6 place-items-center rounded bg-[#0078d4] text-xs font-bold text-white">O</span>
                Outlook
              </button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Link href="/dashboard" className="pressable inline-flex items-center justify-center gap-2 rounded-xl border border-[#d9dee5] bg-[#f8fafc] px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-white">
                <MonitorPlay className="size-4" />
                Demo dashboard
              </Link>
              <Link href="/onboarding?demo=1" className="pressable inline-flex items-center justify-center gap-2 rounded-xl border border-[#d9dee5] bg-white px-5 py-3 text-sm font-semibold text-foreground transition hover:border-[#111827]">
                Demo onboarding
                <ArrowRight className="size-4" />
              </Link>
            </div>

            {status === "sent" && <p className="mt-4 rounded-xl bg-blue-50 p-3 text-sm font-semibold text-blue-700">Check your email for the login link.</p>}
            {status === "error" && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">Unable to send login link. Check Supabase settings.</p>}
            {status === "local" && <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-700">Supabase is not configured yet. Use the demo dashboard while developing.</p>}
            {status === "oauth" && <p className="mt-4 rounded-xl bg-blue-50 p-3 text-sm font-semibold text-blue-700">Redirecting to your provider...</p>}
          </div>

          <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
            {["Magic link auth", "Template onboarding", "Live dashboard"].map((item) => (
              <span key={item} className="inline-flex items-center gap-2">
                <CheckCircle2 className="size-4 text-blue-600" />
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="relative hidden overflow-hidden border-l border-[#eef1f5] bg-[linear-gradient(135deg,#fbfbfc_0%,#eef2f6_100%)] lg:block">
          <div className="absolute left-16 top-24 rounded-2xl border border-white/80 bg-white/86 p-4 shadow-[0_24px_70px_rgba(15,23,42,0.10)] backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <SiteRentAuthMark />
              <div>
                <p className="font-semibold text-foreground">Cape Climate Pros</p>
                <p className="text-xs text-muted-foreground">Website workspace</p>
              </div>
            </div>
            <div className="mt-5 space-y-2">
              {["Dashboard", "Website", "Media", "Leads", "Settings"].map((item, index) => (
                <div key={item} className={`flex items-center gap-3 rounded-xl px-3 py-2 ${index === 0 ? "bg-[#f4f6f8] text-foreground" : "text-muted-foreground"}`}>
                  <LayoutGrid className="size-4" />
                  <span className="text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="absolute bottom-20 right-[-60px] w-[560px] rounded-[26px] border border-white/80 bg-white p-5 shadow-[0_34px_90px_rgba(15,23,42,0.16)]">
            <div className="flex items-center justify-between border-b border-[#edf0f4] pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Setup progress</p>
                <h2 className="mt-1 text-2xl font-bold">Tell us about your company</h2>
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">42%</span>
            </div>
            <div className="mt-5 flex gap-3">
              {[0, 1, 2, 3, 4].map((item) => (
                <span key={item} className={`h-1.5 flex-1 rounded-full ${item < 2 ? "bg-foreground" : "bg-[#e5e7eb]"}`} />
              ))}
            </div>
            <div className="mt-7 flex flex-wrap gap-2">
              {["Residential service", "Emergency repairs", "Maintenance plans", "Installations", "Commercial HVAC", "Other"].map((item) => (
                <span key={item} className="rounded-lg bg-[#f4f6f8] px-3 py-2 text-sm font-medium text-[#2f343b]">{item}</span>
              ))}
            </div>
            <div className="mt-7 space-y-4">
              <div className="h-12 rounded-xl border border-[#d9dee5] bg-white" />
              <div className="h-12 rounded-xl border border-[#111827] bg-white shadow-[0_0_0_4px_rgba(17,24,39,0.06)]" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function SiteRentAuthMark() {
  return (
    <span className="grid size-9 shrink-0 grid-cols-2 gap-1 rounded-lg bg-[#dff8ed] p-1">
      <span className="rounded-[4px] bg-[#1ecb7b]" />
      <span className="rounded-[4px] bg-[#48e0a0]" />
      <span className="rounded-[4px] bg-[#48e0a0]" />
      <span className="rounded-[4px] bg-[#0bb665]" />
    </span>
  );
}
