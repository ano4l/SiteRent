import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bot,
  CheckCircle2,
  Clock3,
  CreditCard,
  Globe2,
  LayoutDashboard,
  MonitorCheck,
  Rocket,
  ShieldCheck,
  Sparkles,
  Wand2
} from "lucide-react";

export const metadata: Metadata = {
  title: "SiteRent Websites for Trade Businesses",
  description: "Launch a rental website for South African HVAC and trade businesses with AI-assisted setup, hosting, billing, and a simple dashboard."
};

const workflow = [
  {
    title: "AI drafts the website",
    copy: "Enter the business, city, services, and tone. SiteRent turns that into a practical website plan.",
    icon: Bot
  },
  {
    title: "Onboarding captures the basics",
    copy: "Confirm services, trust proof, contact routes, template style, payment, and a publishable address.",
    icon: MonitorCheck
  },
  {
    title: "Dashboard keeps it live",
    copy: "Edit the site, upload photos, republish changes, review leads, and manage billing from one workspace.",
    icon: LayoutDashboard
  }
];

const included = [
  "Gemini-powered website plan",
  "Six-step onboarding",
  "Hosted published site",
  "Dashboard editing and republish",
  "Peach Payments handoff",
  "Lead capture and tracking fields"
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] text-foreground">
      <header className="sticky top-0 z-40 border-b border-white/70 bg-white/76 backdrop-blur-2xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
          <Link href="/" className="flex items-center gap-3 text-lg font-bold">
            <SiteRentMark />
            SiteRent
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-semibold text-muted-foreground md:flex">
            <a href="#how-it-works" className="transition hover:text-foreground">How it works</a>
            <a href="#dashboard" className="transition hover:text-foreground">Dashboard</a>
            <a href="#pricing" className="transition hover:text-foreground">Pricing</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden rounded-xl border border-app-line bg-white px-4 py-2.5 text-sm font-semibold text-foreground transition hover:border-app-line-strong sm:inline-flex">
              Login
            </Link>
            <Link href="/login?next=/builder" className="inline-flex items-center gap-2 rounded-xl bg-foreground px-4 py-2.5 text-sm font-semibold text-white shadow-[0_18px_34px_rgba(15,23,42,0.18)] transition hover:bg-black">
              Build with AI
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-white/70">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_20%,rgba(204,251,241,0.72),transparent_32%),radial-gradient(circle_at_84%_8%,rgba(219,234,254,0.84),transparent_30%)]" />
        <div className="relative mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center gap-10 px-5 py-14 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/74 px-3 py-1.5 text-sm font-semibold text-muted-foreground shadow-sm backdrop-blur-xl">
              <Sparkles className="size-4 text-blue-600" />
              Website rental for service businesses
            </div>
            <h1 className="mt-7 text-5xl font-bold leading-[0.98] tracking-tight text-foreground md:text-7xl">
              Launch the first useful website tonight.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground md:text-lg">
              SiteRent gives HVAC and trade businesses a guided website setup, AI-assisted copy direction, hosting, billing, and a dashboard that keeps the basics moving after publish.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/login?next=/builder" className="inline-flex items-center gap-2 rounded-xl bg-foreground px-5 py-3.5 text-sm font-bold text-white shadow-[0_22px_42px_rgba(15,23,42,0.2)] transition hover:bg-black">
                Start AI builder
                <Wand2 className="size-4" />
              </Link>
              <Link href="/login?next=/onboarding" className="inline-flex items-center gap-2 rounded-xl border border-app-line bg-white px-5 py-3.5 text-sm font-bold text-foreground transition hover:border-app-line-strong">
                Start onboarding
                <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="mt-8 grid gap-3 text-sm font-semibold text-muted-foreground sm:grid-cols-3">
              <TrustItem icon={Clock3} label="Fast setup" />
              <TrustItem icon={ShieldCheck} label="POPIA-aware basics" />
              <TrustItem icon={CreditCard} label="R300/month rental" />
            </div>
          </div>

          <ProductPreview />
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">First onboarding path</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">Website, AI builder, and dashboard in one flow.</h2>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {workflow.map((item, index) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="rounded-[24px] border border-white/74 bg-white/66 p-6 shadow-[0_22px_60px_rgba(15,23,42,0.08)] ring-1 ring-white/70 backdrop-blur-2xl">
                <div className="flex items-center justify-between">
                  <span className="grid size-12 place-items-center rounded-2xl bg-foreground text-white">
                    <Icon className="size-5" />
                  </span>
                  <span className="text-sm font-bold text-muted-foreground">0{index + 1}</span>
                </div>
                <h3 className="mt-5 text-xl font-bold tracking-tight">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.copy}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section id="dashboard" className="border-y border-white/70 bg-white/48">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-16 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Dashboard basics</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">The client gets a workspace, not just a web page.</h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              After onboarding, the dashboard gives a business owner simple controls for editing copy, uploading proof, republishing, seeing leads, and keeping subscription status visible.
            </p>
            <div className="mt-6 grid gap-3">
              {included.map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/74 bg-white/72 p-3 text-sm font-semibold text-foreground shadow-sm">
                  <CheckCircle2 className="size-5 text-blue-600" />
                  {item}
                </div>
              ))}
            </div>
          </div>
          <DashboardMockup />
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="grid gap-6 rounded-[28px] border border-white/74 bg-white/72 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.1)] ring-1 ring-white/70 backdrop-blur-2xl lg:grid-cols-[1fr_auto] lg:items-center lg:p-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Tonight-ready offer</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">R300/month, publishable from onboarding.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
              Production runs on your Supabase, Peach Payments, Vercel domain, Gemini, and tracking integrations. Missing integrations now surface as setup requirements instead of placeholder data.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <Link href="/login?next=/builder" className="inline-flex items-center gap-2 rounded-xl bg-foreground px-5 py-3 text-sm font-bold text-white transition hover:bg-black">
              Build a draft
              <Rocket className="size-4" />
            </Link>
            <Link href="/login?next=/dashboard" className="inline-flex items-center gap-2 rounded-xl border border-app-line bg-white px-5 py-3 text-sm font-bold text-foreground transition hover:border-app-line-strong">
              Open dashboard
              <LayoutDashboard className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function SiteRentMark() {
  return (
    <span className="grid size-9 shrink-0 grid-cols-2 gap-1 rounded-lg bg-brand-mint p-1">
      <span className="rounded-[4px] bg-brand-green-500" />
      <span className="rounded-[4px] bg-brand-green-300" />
      <span className="rounded-[4px] bg-brand-green-300" />
      <span className="rounded-[4px] bg-brand-green-700" />
    </span>
  );
}

function TrustItem({ icon: Icon, label }: { icon: typeof Clock3; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <Icon className="size-4 text-blue-600" />
      {label}
    </span>
  );
}

function ProductPreview() {
  return (
    <div className="relative">
      <div className="absolute -inset-8 rounded-[48px] bg-white/34 blur-3xl" />
      <div className="relative overflow-hidden rounded-[30px] border border-white/80 bg-[#0f172a] p-4 shadow-[0_34px_100px_rgba(15,23,42,0.28)]">
        <div className="flex items-center gap-2 border-b border-white/10 pb-4">
          <span className="size-3 rounded-full bg-red-400" />
          <span className="size-3 rounded-full bg-amber-300" />
          <span className="size-3 rounded-full bg-emerald-400" />
          <span className="ml-3 rounded-full bg-white/8 px-3 py-1 text-xs font-semibold text-white/70">siterent.co.za/builder</span>
        </div>
        <div className="grid gap-4 pt-4 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-2xl bg-white p-4 text-foreground">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">AI builder</p>
              <Sparkles className="size-4 text-blue-600" />
            </div>
            <div className="mt-4 space-y-3">
              <div className="h-10 rounded-xl border border-app-line bg-app-surface" />
              <div className="h-10 rounded-xl border border-app-line bg-app-surface" />
              <div className="h-28 rounded-xl border border-app-line bg-app-surface" />
              <div className="h-11 rounded-xl bg-foreground" />
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl bg-white text-foreground">
            <div className="bg-[#0b2d57] p-5 text-white">
              <div className="flex items-center justify-between text-xs font-bold">
                <span>Your Business</span>
                <span className="rounded-full bg-[#ff5b18] px-3 py-1">Book service</span>
              </div>
              <h3 className="mt-10 max-w-sm text-4xl font-black leading-tight">Your service website, ready to review</h3>
              <p className="mt-3 text-sm text-white/74">A publish-ready preview generated from the first setup pass.</p>
            </div>
            <div className="grid gap-3 p-4 sm:grid-cols-3">
              {["Services", "Trust", "Contact"].map((item) => (
                <div key={item} className="rounded-xl bg-app-surface p-3">
                  <p className="text-sm font-bold">{item}</p>
                  <div className="mt-3 h-2 rounded-full bg-app-line" />
                  <div className="mt-2 h-2 w-2/3 rounded-full bg-app-line" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardMockup() {
  return (
    <div className="overflow-hidden rounded-[28px] border border-white/74 bg-white/70 shadow-[0_24px_70px_rgba(15,23,42,0.1)] ring-1 ring-white/70 backdrop-blur-2xl">
      <div className="flex h-16 items-center justify-between border-b border-white/70 px-5">
        <div>
          <p className="text-sm font-bold text-foreground">Your Business</p>
          <p className="text-xs text-muted-foreground">Website health and launch basics</p>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">Draft ready</span>
      </div>
      <div className="grid gap-4 p-5 md:grid-cols-4">
        {[
          ["Visits", "0"],
          ["Leads", "0"],
          ["Conversion", "0%"],
          ["Source", "Pending"]
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-white/70 bg-white/74 p-4 shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground">{label}</p>
            <p className="mt-2 text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-4 p-5 pt-0 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-white/70 bg-white/74 p-4">
          <div className="flex h-48 items-end gap-2 border-b border-l border-app-line px-2 pb-2">
            {[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0].map((value, index) => (
              <span key={`${value}-${index}`} className="flex-1 rounded-t-full bg-[linear-gradient(180deg,#111,#64748b)]" style={{ height: value > 0 ? `${Math.max(value / 1.8, 16)}%` : "4%" }} />
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-white/70 bg-white/74 p-4">
          <p className="text-sm font-bold">Customer checklist</p>
          <div className="mt-4 space-y-3">
            {["Website live", "Contact details", "Project photos", "Visit tracking"].map((item) => (
              <div key={item} className="flex items-center justify-between rounded-xl bg-app-surface p-3 text-sm font-semibold">
                {item}
                <span className="text-amber-700">Pending</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
