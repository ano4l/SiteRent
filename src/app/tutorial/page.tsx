import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, CreditCard, LayoutDashboard, Rocket, Sparkles, UploadCloud, Wand2 } from "lucide-react";

export const metadata: Metadata = {
  title: "SiteRent First-Time Guide",
  description: "A first-use tutorial for creating, onboarding, publishing, and maintaining a SiteRent website."
};

const tutorialSteps = [
  {
    title: "Start with the AI builder",
    copy: "Enter the business context, attach useful notes or images, and generate a practical first website plan.",
    href: "/builder",
    icon: Wand2
  },
  {
    title: "Complete onboarding",
    copy: "Confirm services, proof, template, contact routes, payment, and the production address before publishing.",
    href: "/onboarding",
    icon: CheckCircle2
  },
  {
    title: "Publish and verify",
    copy: "Use the dashboard preview and publish controls to review the site before the customer sees it live.",
    href: "/dashboard?section=view",
    icon: Rocket
  },
  {
    title: "Maintain the account",
    copy: "Upload project photos, connect tracking, manage billing, and use the AI assistant for copy improvements.",
    href: "/dashboard",
    icon: LayoutDashboard
  }
];

export default function TutorialPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] px-5 py-8 text-foreground lg:px-8">
      <section className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/dashboard" className="flex items-center gap-3 text-lg font-bold">
            <span className="grid size-9 shrink-0 grid-cols-2 gap-1 rounded-lg bg-brand-mint p-1">
              <span className="rounded-[4px] bg-brand-green-500" />
              <span className="rounded-[4px] bg-brand-green-300" />
              <span className="rounded-[4px] bg-brand-green-300" />
              <span className="rounded-[4px] bg-brand-green-700" />
            </span>
            SiteRent
          </Link>
          <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-xl border border-app-line bg-white px-4 py-2.5 text-sm font-semibold text-foreground transition hover:border-app-line-strong">
            Dashboard
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="mt-10 overflow-hidden rounded-[32px] border border-white/80 bg-white/74 p-6 shadow-[0_32px_90px_rgba(15,23,42,0.12)] ring-1 ring-white/70 backdrop-blur-2xl lg:p-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-sm font-bold text-blue-700">
              <Sparkles className="size-4" />
              First-time production guide
            </div>
            <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight md:text-6xl">Create the first client website in the right order.</h1>
            <p className="mt-4 text-base leading-8 text-muted-foreground">
              SiteRent is now auth-first. Sign in, create a draft, complete onboarding, publish, and then maintain the live account from the dashboard.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {tutorialSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <Link key={step.title} href={step.href} className="group rounded-2xl border border-white/74 bg-white/72 p-5 shadow-sm transition hover:-translate-y-0.5 hover:bg-white">
                  <div className="flex items-start justify-between gap-4">
                    <span className="grid size-12 place-items-center rounded-2xl bg-foreground text-white">
                      <Icon className="size-5" />
                    </span>
                    <span className="text-sm font-bold text-muted-foreground">0{index + 1}</span>
                  </div>
                  <h2 className="mt-5 text-xl font-bold tracking-tight">{step.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{step.copy}</p>
                </Link>
              );
            })}
          </div>

          <div className="mt-8 grid gap-4 rounded-2xl border border-app-line bg-app-surface p-5 md:grid-cols-3">
            <MiniGuide icon={CreditCard} title="Payment" copy="Peach checkout should be configured before the payment step is used with a real client." />
            <MiniGuide icon={UploadCloud} title="Files" copy="AI accepts images, PDFs, text, markdown, and JSON attachments for better planning." />
            <MiniGuide icon={LayoutDashboard} title="Dashboard" copy="Use empty states as setup prompts until real analytics, leads, and billing data arrive." />
          </div>
        </div>
      </section>
    </main>
  );
}

function MiniGuide({ icon: Icon, title, copy }: { icon: typeof CreditCard; title: string; copy: string }) {
  return (
    <article>
      <Icon className="size-5 text-blue-700" />
      <h3 className="mt-3 text-sm font-bold text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy}</p>
    </article>
  );
}
