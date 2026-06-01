import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BadgeInfo, BarChart3, CircleDollarSign, Cog, Package, Users, Workflow, ShieldCheck, LifeBuoy, MessageSquare } from "lucide-react";

const sections = {
  payment: {
    title: "Payment",
    copy: "Track the live billing state for each client, review failed collections, and jump into subscription recovery tasks.",
    icon: CircleDollarSign,
    bullets: ["Recurring billing health", "Failed-payment follow-up", "Peach checkout status"]
  },
  customers: {
    title: "Customers",
    copy: "Review active clients, onboarding progress, and account health from one place.",
    icon: Users,
    bullets: ["Client list", "Onboarding progress", "Account status"]
  },
  messages: {
    title: "Messages",
    copy: "Monitor inbox activity, enquiry follow-ups, and support handoffs.",
    icon: MessageSquare,
    bullets: ["Unread conversations", "Enquiry routing", "Support handoff"]
  },
  templates: {
    title: "Templates",
    copy: "Choose the presentation style for each website and keep the visual system aligned with the brand.",
    icon: Package,
    bullets: ["Template library", "Preview states", "Style selection"]
  },
  invoices: {
    title: "Invoices",
    copy: "Track invoice generation, collection progress, and account history.",
    icon: CircleDollarSign,
    bullets: ["Invoice history", "Paid vs due", "Manual adjustments"]
  },
  analytics: {
    title: "Analytics",
    copy: "Review platform growth, traffic reporting, and conversion behavior.",
    icon: BarChart3,
    bullets: ["GA4 reports", "Conversion signals", "Growth trends"]
  },
  automation: {
    title: "Automation",
    copy: "Plan background workflows for reminders, publishing, and support triggers.",
    icon: Workflow,
    bullets: ["Reminder jobs", "Publish automations", "Support triggers"]
  },
  settings: {
    title: "Settings",
    copy: "Configure platform preferences, account defaults, and operational controls.",
    icon: Cog,
    bullets: ["Platform defaults", "Team preferences", "Workspace settings"]
  },
  security: {
    title: "Security",
    copy: "Review access, permissions, and safety boundaries for the admin workspace.",
    icon: ShieldCheck,
    bullets: ["Access review", "Admin permissions", "Audit boundaries"]
  },
  help: {
    title: "Help",
    copy: "Find support resources and escalation paths for platform and client issues.",
    icon: LifeBuoy,
    bullets: ["Support contacts", "Runbooks", "Escalation paths"]
  }
} as const;

export default function AdminSectionPage({ params }: { params: { section: string } }) {
  const section = params.section as keyof typeof sections;
  const config = sections[section];

  if (!config) {
    notFound();
  }

  const Icon = config.icon;

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-[#e1d8ca] bg-white p-6 shadow-[0_16px_38px_rgba(17,17,17,0.05)] xl:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#ddd5c7] bg-[#fbf8f3] px-3 py-1 text-xs font-black uppercase tracking-[0.22em] text-[#7e7165]">
              <BadgeInfo size={12} />
              Admin section
            </div>
            <div className="mt-4 flex items-center gap-3">
              <div className="grid size-12 place-items-center rounded-2xl bg-ink text-white">
                <Icon size={20} />
              </div>
              <h1 className="text-4xl font-black tracking-tight text-ink">{config.title}</h1>
            </div>
            <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-muted md:text-base">{config.copy}</p>
          </div>
          <Link href="/admin" className="inline-flex h-11 items-center gap-2 rounded-full border border-[#ddd5c7] bg-[#fbf8f3] px-5 text-sm font-bold text-ink">
            Back to dashboard <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {config.bullets.map((bullet) => (
          <article key={bullet} className="rounded-[24px] border border-[#e1d8ca] bg-white p-5 shadow-[0_14px_32px_rgba(17,17,17,0.05)]">
            <p className="text-sm font-black text-ink">{bullet}</p>
            <p className="mt-2 text-sm font-semibold leading-6 text-muted">This section is wired as a real route so the sidebar no longer points to dead buttons.</p>
          </article>
        ))}
      </section>

      <section className="rounded-[28px] border border-[#e1d8ca] bg-[#111111] p-6 text-white shadow-[0_16px_38px_rgba(17,17,17,0.12)] xl:p-8">
        <p className="text-sm font-semibold text-white/70">Workspace note</p>
        <h2 className="mt-2 text-2xl font-black">This route can now be expanded with section-specific controls.</h2>
        <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-white/75">
          The layout is full-page and shared across the admin area, so each sidebar target can grow into a dedicated view without changing the shell.
        </p>
      </section>
    </div>
  );
}
