import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  BadgeInfo,
  BarChart3,
  CheckCircle2,
  CircleDashed,
  CircleDollarSign,
  Cog,
  LifeBuoy,
  MessageSquare,
  Package,
  PlugZap,
  ShieldCheck,
  Users,
  Workflow
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getIntegrationReadiness, getIntegrationReadinessSummary, type IntegrationReadinessItem } from "@/lib/integration-readiness";

type AdminSectionConfig = {
  title: string;
  copy: string;
  icon: LucideIcon;
  source: string;
  cards: Array<{ title: string; copy: string; status: string }>;
  checklist: string[];
};

export const dynamic = "force-dynamic";

const sections: Record<string, AdminSectionConfig> = {
  payment: {
    title: "Payment Operations",
    copy: "Monitor Peach checkout readiness, failed collections, subscription status, and billing recovery work.",
    icon: CircleDollarSign,
    source: "Billing events, client subscription fields, and Peach webhook status.",
    cards: [
      { title: "Recurring billing health", copy: "Use active, pending, past due, paused, and cancelled subscription states to prioritise accounts.", status: "Live from Supabase" },
      { title: "Failed-payment follow-up", copy: "Past-due clients keep their suspension window visible so recovery work is clear.", status: "Client-state driven" },
      { title: "Checkout readiness", copy: "Peach credentials and service-role access must be present before production checkout starts.", status: "Setup-gated" }
    ],
    checklist: ["Confirm Peach credentials", "Review past-due clients", "Check webhook processing", "Escalate failed collection recovery"]
  },
  customers: {
    title: "Customer Operations",
    copy: "Review client onboarding progress, publish readiness, contact completeness, and account health.",
    icon: Users,
    source: "Client rows, onboarding progress, billing status, and publish state.",
    cards: [
      { title: "Client list", copy: "The command center shows live client records once onboarding creates them.", status: "Live from Supabase" },
      { title: "Onboarding progress", copy: "Current step and completed steps are tracked per client for follow-up.", status: "Progress-tracked" },
      { title: "Account status", copy: "Billing, publication, and contact readiness are shown without demo records.", status: "No sample fallback" }
    ],
    checklist: ["Review incomplete clients", "Check missing contact data", "Open published sites", "Prioritise past-due accounts"]
  },
  messages: {
    title: "Message Operations",
    copy: "Keep captured website enquiries accountable and route responses through configured client contact channels.",
    icon: MessageSquare,
    source: "Published-site enquiry submissions and client reply contact details.",
    cards: [
      { title: "Enquiry capture", copy: "Only real published client sites can accept public enquiries.", status: "Published-site gated" },
      { title: "Reply routing", copy: "The dashboard asks for a business email before presenting an inbox action.", status: "Contact-gated" },
      { title: "Support handoff", copy: "Billing and publishing issues can be escalated from the support panel.", status: "Operational route" }
    ],
    checklist: ["Check new enquiries", "Verify client reply email", "Prioritise urgent service requests", "Escalate publish or billing issues"]
  },
  templates: {
    title: "Template Operations",
    copy: "Keep the available website styles aligned with the SiteRent HVAC offer and the AI builder output.",
    icon: Package,
    source: "Template style constants, onboarding selections, AI plan output, and published-site renderer.",
    cards: [
      { title: "Template library", copy: "Four production starter styles are available through builder, onboarding, dashboard, and published sites.", status: "Shared constants" },
      { title: "Preview states", copy: "Dashboard preview renders from the current client record rather than sample site data.", status: "Client-record driven" },
      { title: "Style selection", copy: "Onboarding stores the chosen template key for future dashboard and published-site updates.", status: "Persisted field" }
    ],
    checklist: ["Review client style selection", "Confirm preview copy", "Check uploaded media", "Republish after style updates"]
  },
  invoices: {
    title: "Invoice Operations",
    copy: "Use billing history and subscription state to understand what still needs payment-provider or email configuration.",
    icon: CircleDollarSign,
    source: "Billing events, active subscription state, and configured customer email.",
    cards: [
      { title: "Invoice history", copy: "The dashboard shows an empty billing table until real billing events exist.", status: "No fake invoices" },
      { title: "Collection progress", copy: "Active-client MRR is calculated from active subscriptions only.", status: "Live-derived" },
      { title: "Email readiness", copy: "Invoice email readiness depends on an active subscription and configured customer email.", status: "Setup-aware" }
    ],
    checklist: ["Confirm billing email", "Check active subscription status", "Review billing events", "Follow up failed payments"]
  },
  analytics: {
    title: "Analytics Operations",
    copy: "Track whether GA4, Meta Pixel, and Google Place ID are configured before promising traffic or review insight.",
    icon: BarChart3,
    source: "Client tracking fields and future GA4/Pixel reporting integrations.",
    cards: [
      { title: "Traffic readiness", copy: "Traffic panels show zero or awaiting-data states until tracking IDs are configured.", status: "Tracking-gated" },
      { title: "Conversion signals", copy: "Lead and source metrics do not invent activity before real submissions arrive.", status: "No demo metrics" },
      { title: "Review identity", copy: "Review CTA status depends on a stored Google Place ID.", status: "Place-ID gated" }
    ],
    checklist: ["Add GA4 measurement ID", "Add Meta Pixel ID if needed", "Add Google Place ID", "Review data after publish"]
  },
  integrations: {
    title: "Integration Preflight",
    copy: "Inspect the live runtime configuration before connecting real Supabase, Gemini, Peach, Vercel, email, and analytics accounts.",
    icon: PlugZap,
    source: "Environment variables, fail-closed route behavior, provider sandboxes, and production smoke checks.",
    cards: [
      { title: "Critical blockers", copy: "Core launch dependencies are separated from optional reporting and workflow integrations.", status: "Live env check" },
      { title: "Provider sandboxes", copy: "Peach, email, domains, and analytics stay in setup-aware states until credentials and provider-side tests are complete.", status: "Test-gated" },
      { title: "Smoke gate", copy: "The local smoke script verifies route behavior before provider credentials are switched live.", status: "Repeatable" }
    ],
    checklist: ["Fill critical environment variables", "Run provider sandboxes", "Run route smoke checks", "Switch live credentials one provider at a time"]
  },
  automation: {
    title: "Automation Operations",
    copy: "Track the production prerequisites for reminders, publish confirmation, billing alerts, and support triggers.",
    icon: Workflow,
    source: "Email provider settings, billing events, publish events, and client contact fields.",
    cards: [
      { title: "Reminder jobs", copy: "Operational reminders should only run once email credentials and recipient fields are configured.", status: "Config-gated" },
      { title: "Publish confirmations", copy: "Publish confirmation events are queued only for real client records.", status: "Client-record driven" },
      { title: "Support triggers", copy: "Domain, billing, and publish issues route through the support paths already exposed in the dashboard.", status: "Workflow-ready" }
    ],
    checklist: ["Configure email provider", "Confirm publish event queue", "Review failed-payment alerts", "Test support handoff"]
  },
  settings: {
    title: "Platform Settings",
    copy: "Review production configuration needed for auth, AI, payments, publishing, email, and tracking.",
    icon: Cog,
    source: "Environment variables, Supabase service access, and client-level connection fields.",
    cards: [
      { title: "Auth defaults", copy: "Supabase Auth and Google OAuth are required before protected product pages load.", status: "Auth-gated" },
      { title: "Service credentials", copy: "Gemini, Peach, Vercel, and email credentials are setup-required before their production actions run.", status: "Fail-closed" },
      { title: "Workspace settings", copy: "Client settings save through authenticated dashboard APIs.", status: "Session-gated" }
    ],
    checklist: ["Add Supabase keys", "Configure Google OAuth", "Add Gemini key", "Add Peach and Vercel credentials"]
  },
  security: {
    title: "Security Operations",
    copy: "Review admin access, auth gates, production action protection, and data ownership boundaries.",
    icon: ShieldCheck,
    source: "Supabase Auth claims, admin_users records, middleware route gates, and service-role APIs.",
    cards: [
      { title: "Access review", copy: "Admin pages require a signed-in user and an admin_users record.", status: "Admin-gated" },
      { title: "Production APIs", copy: "Builder, onboarding, dashboard, billing, publish, upload, and admin APIs require authentication.", status: "Middleware-gated" },
      { title: "Public exceptions", copy: "Published sites, enquiry capture, Peach return, and Peach webhook routes remain public for legitimate external traffic.", status: "Scoped exceptions" }
    ],
    checklist: ["Review admin_users table", "Smoke protected routes", "Check public callback routes", "Audit service-role usage"]
  },
  help: {
    title: "Help And Runbooks",
    copy: "Use the first-time guide and support paths to onboard clients without relying on hidden tribal knowledge.",
    icon: LifeBuoy,
    source: "Tutorial page, dashboard support panel, README, and progress ledger.",
    cards: [
      { title: "First-time guide", copy: "The tutorial walks users through register, AI draft, onboarding, publish, and maintenance.", status: "Available" },
      { title: "Support contacts", copy: "Dashboard support actions separate publishing and billing questions.", status: "Operational" },
      { title: "Runbook notes", copy: "README and PROGRESS record the current production setup requirements and verification gates.", status: "Documented" }
    ],
    checklist: ["Open the tutorial", "Review README setup", "Check production smoke results", "Escalate missing credentials"]
  }
};

export default function AdminSectionPage({ params }: { params: { section: string } }) {
  const config = sections[params.section];
  const readinessItems = params.section === "integrations" ? getIntegrationReadiness() : [];

  if (!config) {
    notFound();
  }

  const Icon = config.icon;

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-admin-line bg-white p-6 shadow-[0_16px_38px_rgba(17,17,17,0.05)] xl:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-admin-line-soft bg-admin-surface px-3 py-1 text-xs font-black uppercase tracking-[0.22em] text-[#7e7165]">
              <BadgeInfo size={12} />
              Admin operations
            </div>
            <div className="mt-4 flex items-center gap-3">
              <div className="grid size-12 place-items-center rounded-2xl bg-ink text-white">
                <Icon size={20} />
              </div>
              <h1 className="text-4xl font-black tracking-tight text-ink">{config.title}</h1>
            </div>
            <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-muted md:text-base">{config.copy}</p>
          </div>
          <Link href="/admin" className="inline-flex h-11 items-center gap-2 rounded-full border border-admin-line-soft bg-admin-surface px-5 text-sm font-bold text-ink">
            Command center <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {config.cards.map((card) => (
          <article key={card.title} className="rounded-[24px] border border-admin-line bg-white p-5 shadow-[0_14px_32px_rgba(17,17,17,0.05)]">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-black text-ink">{card.title}</p>
              <span className="shrink-0 rounded-full border border-admin-line-soft bg-admin-surface px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#7e7165]">
                {card.status}
              </span>
            </div>
            <p className="mt-3 text-sm font-semibold leading-6 text-muted">{card.copy}</p>
          </article>
        ))}
      </section>

      {params.section === "integrations" && <IntegrationReadinessMatrix items={readinessItems} />}

      <section className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
        <article className="rounded-[28px] border border-admin-line bg-white p-6 shadow-[0_16px_38px_rgba(17,17,17,0.05)] xl:p-8">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-[#7e7165]">Data Source</p>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-ink">What this operation depends on</h2>
          <p className="mt-3 text-sm font-semibold leading-6 text-muted">{config.source}</p>
        </article>

        <article className="rounded-[28px] border border-admin-line bg-[#111111] p-6 text-white shadow-[0_16px_38px_rgba(17,17,17,0.12)] xl:p-8">
          <p className="text-sm font-semibold text-white/70">Production checklist</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {config.checklist.map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/86">
                <CheckCircle2 size={16} className="shrink-0 text-white" />
                {item}
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}

function IntegrationReadinessMatrix({ items }: { items: IntegrationReadinessItem[] }) {
  const summary = getIntegrationReadinessSummary(items);

  return (
    <section className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <ReadinessSummaryCard label="Ready" value={summary.ready} tone="ready" />
        <ReadinessSummaryCard label="Needs review" value={summary.attention} tone="attention" />
        <ReadinessSummaryCard label="Blocked" value={summary.blocked} tone="blocked" />
        <ReadinessSummaryCard label="Critical clear" value={summary.launchCriticalTotal - summary.launchCriticalBlocked} total={summary.launchCriticalTotal} tone={summary.launchReady ? "ready" : "blocked"} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {items.map((item) => (
          <article key={item.id} className="rounded-[28px] border border-admin-line bg-white p-6 shadow-[0_16px_38px_rgba(17,17,17,0.05)]">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-admin-line-soft bg-admin-surface px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#7e7165]">{item.group}</span>
                  {item.launchCritical && <span className="rounded-full bg-[#111111] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white">Critical</span>}
                </div>
                <h2 className="mt-3 text-2xl font-black tracking-tight text-ink">{item.title}</h2>
              </div>
              <ReadinessBadge item={item} />
            </div>

            <p className="mt-3 text-sm font-semibold leading-6 text-muted">{item.description}</p>

            <div className="mt-5 grid gap-3">
              <div className="rounded-2xl border border-admin-line-soft bg-admin-surface p-4">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#7e7165]">Required configuration</p>
                <div className="mt-3 grid gap-2">
                  {item.requirements.length ? item.requirements.map((requirement) => (
                    <div key={requirement.label} className="flex items-start justify-between gap-3 rounded-xl bg-white px-3 py-2 text-xs font-bold text-muted">
                      <span>{requirement.label}</span>
                      <span className="text-right font-black text-ink">{requirement.keys.join(requirement.mode === "any" ? " or " : ", ")}</span>
                    </div>
                  )) : (
                    <div className="rounded-xl bg-white px-3 py-2 text-xs font-bold text-muted">No environment values required.</div>
                  )}
                </div>
                {item.missing.length > 0 && (
                  <p className="mt-3 text-xs font-black text-[#b42318]">Missing: {item.missing.join(", ")}</p>
                )}
              </div>

              <div className="rounded-2xl border border-admin-line-soft bg-white p-4">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#7e7165]">Evidence in app</p>
                <div className="mt-3 grid gap-2">
                  {item.evidence.map((evidence) => (
                    <div key={evidence} className="flex gap-2 text-sm font-semibold leading-6 text-muted">
                      <CheckCircle2 size={15} className="mt-1 shrink-0 text-[#0f7a40]" />
                      <span>{evidence}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-admin-line-soft bg-[#111111] p-4 text-white">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-white/60">Next step</p>
                <p className="mt-2 text-sm font-semibold leading-6 text-white/80">{item.nextStep}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ReadinessSummaryCard({ label, value, total, tone }: { label: string; value: number; total?: number; tone: "ready" | "attention" | "blocked" }) {
  const toneClass =
    tone === "ready"
      ? "bg-[#eaf7ef] text-[#0f7a40]"
      : tone === "blocked"
        ? "bg-[#fff1f2] text-[#b42318]"
        : "bg-[#fffbeb] text-[#92400e]";

  return (
    <article className="rounded-[24px] border border-admin-line bg-white p-5 shadow-[0_14px_32px_rgba(17,17,17,0.05)]">
      <p className="text-sm font-bold text-muted">{label}</p>
      <p className="mt-3 text-3xl font-black tracking-tight text-ink">
        {value}
        {typeof total === "number" && <span className="text-lg text-muted">/{total}</span>}
      </p>
      <span className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-black ${toneClass}`}>{tone}</span>
    </article>
  );
}

function ReadinessBadge({ item }: { item: IntegrationReadinessItem }) {
  const Icon = item.status === "ready" ? CheckCircle2 : item.status === "blocked" ? AlertTriangle : CircleDashed;
  const tone =
    item.status === "ready"
      ? "bg-[#eaf7ef] text-[#0f7a40]"
      : item.status === "blocked"
        ? "bg-[#fff1f2] text-[#b42318]"
        : "bg-[#fffbeb] text-[#92400e]";

  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] ${tone}`}>
      <Icon size={14} />
      {item.statusLabel}
    </span>
  );
}
