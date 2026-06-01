import Link from "next/link";
import {
  ArrowDownToLine,
  ArrowRight,
  Bell,
  CircleDollarSign,
  Filter,
  Gauge,
  HelpCircle,
  LayoutDashboard,
  Search,
  SlidersHorizontal,
  Sparkles,
  Users
} from "lucide-react";
import { AiWebsiteStudio } from "@/components/admin/ai-website-studio";
import { AdminClientActions } from "@/components/admin/admin-client-actions";
import { getAdminDashboardData, type AdminClient } from "@/lib/admin-data";
import { cn } from "@/lib/utils";
import { formatCurrencyZar } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const data = await getAdminDashboardData();

  if (!data.authorized) {
    return (
      <div className="grid min-h-[70vh] place-items-center px-4">
        <section className="w-full max-w-md rounded-[28px] border border-[#e1d8ca] bg-white p-8 text-center shadow-[0_20px_60px_rgba(17,17,17,0.08)]">
          <Sparkles className="mx-auto text-[#c97c16]" size={34} />
          <h1 className="mt-5 text-2xl font-black text-ink">Admin access required</h1>
          <p className="mt-2 text-sm leading-6 text-muted">Your account is signed in, but it is not listed in `admin_users`.</p>
        </section>
      </div>
    );
  }

  const recentClients = data.clients.slice(0, 6);
  const maxStep = Math.max(...data.clients.map((client) => client.currentStep), 6);

  return (
    <div className="space-y-6 xl:space-y-8">
      <section className="rounded-[32px] border border-[#e1d8ca] bg-white px-6 py-6 shadow-[0_18px_44px_rgba(17,17,17,0.06)] xl:px-8 xl:py-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#ddd5c7] bg-[#fbf8f3] px-3 py-1 text-xs font-black uppercase tracking-[0.22em] text-[#7e7165]">
              <Sparkles size={12} />
              Admin dashboard
            </div>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-ink md:text-5xl">Client operations, billing health, publish state, and manual controls.</h1>
            <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-muted md:text-base">
              Monitor subscription health, push live updates, and keep the client portfolio moving without switching out of the workspace.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <ToolbarButton icon={Filter} label="Filter" />
            <ToolbarButton icon={ArrowDownToLine} label="Export" />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 rounded-[24px] border border-[#ece4d8] bg-[#fbf8f3] p-4 md:flex-row md:items-center md:justify-between">
          <label className="flex h-11 w-full items-center gap-2 rounded-full border border-[#ddd5c7] bg-white px-4 text-sm text-muted md:max-w-xl">
            <Search size={15} />
            <input className="w-full bg-transparent outline-none" placeholder="Search clients, domains, payments" />
            <span className="rounded border border-[#ddd5c7] px-1.5 py-0.5 text-[10px] font-black uppercase text-[#7e7165]">Ctrl F</span>
          </label>
          <div className="flex items-center gap-2 self-end md:self-auto">
            <IconButton icon={Bell} label="Notifications" />
            <IconButton icon={HelpCircle} label="Help" />
            <div className="ml-1 flex items-center gap-3 rounded-full border border-[#ddd5c7] bg-white px-3 py-2 shadow-[0_8px_18px_rgba(17,17,17,0.04)]">
              <div className="grid size-8 place-items-center rounded-full bg-[#111111] text-xs font-black text-white">SA</div>
              <div className="hidden text-right sm:block">
                <p className="text-xs font-black text-ink">SiteRent Admin</p>
                <p className="text-[10px] font-semibold text-muted">{data.mode === "local" ? "Local mode" : "Supabase"}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Active clients" value={String(data.stats.activeClients)} delta={`${data.stats.totalClients} total`} icon={Users} tone="green" />
        <KpiCard label="Monthly revenue" value={formatCurrencyZar(data.stats.monthlyRevenue)} delta="Projected MRR" icon={CircleDollarSign} tone="red" />
        <KpiCard label="Published sites" value={String(data.stats.publishedSites)} delta={`${data.stats.onboardingCompletionRate}% onboarding`} icon={LayoutDashboard} tone="blue" />
        <KpiCard label="Past due" value={String(data.stats.pastDueClients)} delta="Needs attention" icon={Gauge} tone="amber" />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.35fr_0.85fr]">
        <Panel title="Sales overview" eyebrow="Revenue" actionLabel="Sort">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-muted">Estimated platform revenue</p>
              <h2 className="mt-2 text-4xl font-black tracking-tight text-ink">{formatCurrencyZar(data.stats.monthlyRevenue * 3.1)}</h2>
              <p className="mt-1 text-xs font-black text-[#0f7a40]">15.8% + estimated platform growth</p>
            </div>
            <div className="flex gap-2">
              <ToolbarButton icon={SlidersHorizontal} label="Sort" compact />
              <ToolbarButton icon={Filter} label="Filter" compact />
            </div>
          </div>
          <RevenueFlow clients={data.clients} />
        </Panel>

        <Panel title="Client pipeline" eyebrow="Onboarding" actionLabel="Weekly">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-muted">Pipeline progress</p>
              <h2 className="mt-2 text-4xl font-black tracking-tight text-ink">{data.stats.totalClients}</h2>
              <p className="mt-1 text-xs font-black text-[#0f7a40]">{data.stats.onboardingCompletionRate}% completion rate</p>
            </div>
            <span className="rounded-full border border-[#ddd5c7] bg-white px-3 py-1 text-xs font-black text-[#7e7165]">Weekly</span>
          </div>
          <PipelineBars clients={data.clients} maxStep={maxStep} />
        </Panel>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <Panel title="Subscription distribution" eyebrow="Billing" actionLabel="Monthly">
          <StatusDistribution clients={data.clients} />
        </Panel>

        <Panel title="Recent platform events" eyebrow="Activity" actionLabel="See all">
          <div className="mt-5 overflow-hidden rounded-[22px] border border-[#e8dfd2] bg-white">
            <div className="grid grid-cols-[1.1fr_0.8fr_0.6fr_0.6fr] bg-[#fbf8f3] px-4 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-[#8b8074]">
              <span>Event</span>
              <span>Type</span>
              <span>Status</span>
              <span className="text-right">Amount</span>
            </div>
            {data.events.length ? (
              data.events.map((event) => (
                <div key={event.id} className="grid grid-cols-[1.1fr_0.8fr_0.6fr_0.6fr] items-center border-t border-[#e8dfd2] px-4 py-3 text-xs md:text-sm">
                  <span className="font-bold text-ink">{formatDate(event.createdAt)}</span>
                  <span className="font-semibold text-muted">{event.eventType.replace(/_/g, " ")}</span>
                  <StatusPill status={event.status} />
                  <span className="text-right font-bold text-ink">{event.amount ? formatCurrencyZar(event.amount) : "-"}</span>
                </div>
              ))
            ) : (
              <div className="border-t border-[#e8dfd2] px-4 py-8 text-center text-sm font-semibold text-muted">No billing events yet.</div>
            )}
          </div>
        </Panel>
      </section>

      <AiWebsiteStudio />

      <section className="rounded-[32px] border border-[#e1d8ca] bg-white p-6 shadow-[0_16px_38px_rgba(17,17,17,0.05)] xl:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-ink">Client command center</h2>
            <p className="mt-1 max-w-2xl text-sm font-semibold leading-6 text-muted">Publish, pause, cancel, override suspension, and log manual refunds.</p>
          </div>
          <ToolbarButton icon={Filter} label="Status filter" />
        </div>
        <div className="mt-6 hidden overflow-x-auto md:block">
          <div className="min-w-[980px] overflow-hidden rounded-[22px] border border-[#e8dfd2] bg-white">
            <div className="grid grid-cols-[1.15fr_0.6fr_0.55fr_0.65fr_1.45fr] bg-[#fbf8f3] px-4 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-[#8b8074]">
              <span>Client</span>
              <span>Billing</span>
              <span>Progress</span>
              <span>Site</span>
              <span>Actions</span>
            </div>
            {recentClients.map((client) => (
              <ClientRow key={client.id} client={client} />
            ))}
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:hidden">
          {recentClients.map((client) => (
            <MobileClientCard key={client.id} client={client} />
          ))}
        </div>
      </section>
    </div>
  );
}

function MobileClientCard({ client }: { client: AdminClient }) {
  return (
    <article className="rounded-[24px] border border-[#e1d8ca] bg-white p-4 shadow-[0_12px_28px_rgba(17,17,17,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-black text-ink">{client.businessName}</p>
          <p className="mt-1 truncate text-xs font-semibold text-muted">{client.ownerName}</p>
        </div>
        <StatusPill status={client.subscriptionStatus} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-xs font-bold text-muted">
        <div>
          <p>Progress</p>
          <p className="mt-1 text-base font-black text-ink">{Math.min(client.currentStep, 6)}/6</p>
        </div>
        <div>
          <p>Site</p>
          {client.siteUrl ? (
            <Link href={client.siteUrl} className="mt-1 block font-black text-ink">
              View site
            </Link>
          ) : (
            <p className="mt-1 text-base font-black text-ink">Draft</p>
          )}
        </div>
      </div>
      <div className="mt-4">
        <AdminClientActions clientId={client.id} />
      </div>
    </article>
  );
}

function ClientRow({ client }: { client: AdminClient }) {
  return (
    <div className="grid grid-cols-[1.15fr_0.6fr_0.55fr_0.65fr_1.45fr] items-center border-t border-[#e8dfd2] px-4 py-4 text-sm">
      <div className="min-w-0">
        <p className="truncate font-black text-ink">{client.businessName}</p>
        <p className="mt-1 truncate text-xs font-semibold text-muted">
          {client.ownerName} - {client.email || "No email"}
        </p>
      </div>
      <StatusPill status={client.subscriptionStatus} />
      <div>
        <p className="font-black text-ink">{Math.min(client.currentStep, 6)}/6</p>
        <div className="mt-2 h-1.5 rounded-full bg-[#ece4d8]">
          <div className="h-1.5 rounded-full bg-ink" style={{ width: `${Math.min(client.currentStep / 6, 1) * 100}%` }} />
        </div>
      </div>
      <div>
        {client.siteUrl ? (
          <Link href={client.siteUrl.startsWith("http") ? client.siteUrl : client.siteUrl} className="font-black text-ink">
            View site
          </Link>
        ) : (
          <span className="font-semibold text-muted">Draft</span>
        )}
        <p className="mt-1 text-xs font-semibold text-muted">{client.sitePublished ? "Published" : "Not live"}</p>
      </div>
      <AdminClientActions clientId={client.id} />
    </div>
  );
}

function KpiCard({ label, value, delta, icon: Icon, tone }: { label: string; value: string; delta: string; icon: typeof Users; tone: "green" | "red" | "blue" | "amber" }) {
  const colours = {
    green: "bg-[#eaf7ef] text-[#0f7a40]",
    red: "bg-[#fff1f2] text-[#b42318]",
    blue: "bg-[#eef2ff] text-[#3730a3]",
    amber: "bg-[#fffbeb] text-[#92400e]"
  };

  return (
    <article className="rounded-[24px] border border-[#e1d8ca] bg-white p-5 shadow-[0_14px_32px_rgba(17,17,17,0.05)]">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-muted">{label}</p>
        <Icon size={16} className="text-muted" />
      </div>
      <p className="mt-4 text-3xl font-black tracking-tight text-ink">{value}</p>
      <span className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-black ${colours[tone]}`}>{delta}</span>
    </article>
  );
}

function RevenueFlow({ clients }: { clients: AdminClient[] }) {
  const columns = [
    { label: "Oct", values: [42, 54, 38, 66] },
    { label: "Nov", values: [28, 34, 22, 46] },
    { label: "Dec", values: [66, 76, 52, 88] }
  ];

  return (
    <div className="mt-8 grid min-h-[250px] grid-cols-3 items-end gap-6 md:gap-10">
      {columns.map((column, columnIndex) => (
        <div key={column.label} className="flex flex-col items-center gap-4">
          <div className="flex h-44 items-end gap-2">
            {column.values.map((value, index) => (
              <div
                key={`${column.label}-${index}`}
                className="w-12 rounded-2xl shadow-[0_10px_30px_rgba(17,17,17,0.12)] md:w-14"
                style={{
                  height: `${value * 1.7}px`,
                  background: ["#111111", "#4b4b4b", "#a1a1a1", "#d8d8d8"][index],
                  opacity: clients.length ? 1 : 0.45
                }}
              />
            ))}
          </div>
          <p className="text-xs font-bold text-muted">{column.label}</p>
          {columnIndex === 2 && <p className="text-xs font-black text-ink">{formatCurrencyZar(clients.filter((client) => client.subscriptionStatus === "active").length * 930)}</p>}
        </div>
      ))}
    </div>
  );
}

function PipelineBars({ clients, maxStep }: { clients: AdminClient[]; maxStep: number }) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const values = days.map((_, index) => {
    const client = clients[index % Math.max(clients.length, 1)];
    return client ? Math.max(18, (client.currentStep / maxStep) * 120) : 24 + index * 10;
  });

  return (
    <div className="mt-8 flex h-56 items-end justify-between gap-3 md:gap-4">
      {values.map((value, index) => (
        <div key={days[index]} className="flex flex-1 flex-col items-center gap-3">
          <div className={index === 2 ? "w-full rounded-2xl bg-ink" : "w-full rounded-2xl bg-[#ece4d8]"} style={{ height: `${value}px` }} />
          <span className="text-xs font-bold text-muted">{days[index]}</span>
        </div>
      ))}
    </div>
  );
}

function StatusDistribution({ clients }: { clients: AdminClient[] }) {
  const active = clients.filter((client) => client.subscriptionStatus === "active").length;
  const pending = clients.filter((client) => client.subscriptionStatus === "pending").length;
  const other = Math.max(clients.length - active - pending, 0);

  return (
    <div className="mt-6 grid gap-6 md:grid-cols-[0.9fr_1fr] md:items-center">
      <div
        className="mx-auto grid size-48 place-items-center rounded-full"
        style={{
          background: `conic-gradient(#111111 0 ${active * 90}deg, #737373 ${active * 90}deg ${(active + pending) * 90}deg, #e5e5e5 ${(active + pending) * 90}deg 360deg)`
        }}
      >
        <div className="grid size-28 place-items-center rounded-full bg-white text-center shadow-[0_12px_28px_rgba(17,17,17,0.04)]">
          <div>
            <p className="text-3xl font-black text-ink">{clients.length}</p>
            <p className="text-xs font-bold text-muted">clients</p>
          </div>
        </div>
      </div>
      <div className="grid gap-3">
        <DistributionItem label="Active" value={active} colour="#111111" />
        <DistributionItem label="Pending" value={pending} colour="#737373" />
        <DistributionItem label="Other" value={other} colour="#d4d4d4" />
      </div>
    </div>
  );
}

function DistributionItem({ label, value, colour }: { label: string; value: number; colour: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-[#fbf8f3] px-3 py-2.5 text-sm font-bold text-ink">
      <span className="flex items-center gap-2">
        <span className="size-2 rounded-full" style={{ backgroundColor: colour }} /> {label}
      </span>
      <span>{value}</span>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const tone =
    status === "active" || status === "published" || status === "completed"
      ? "bg-[#eaf7ef] text-[#0f7a40]"
      : status === "past_due" || status === "cancelled"
        ? "bg-[#fff1f2] text-[#b42318]"
        : status === "paused"
          ? "bg-[#fffbeb] text-[#92400e]"
          : "bg-[#f5f5f5] text-[#111111]";

  return <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-black capitalize ${tone}`}>{status.replace(/_/g, " ")}</span>;
}

function Panel({ title, eyebrow, actionLabel, children }: { title: string; eyebrow: string; actionLabel: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[28px] border border-[#e1d8ca] bg-white p-6 shadow-[0_16px_38px_rgba(17,17,17,0.05)] xl:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-muted">{eyebrow}</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-ink">{title}</h2>
        </div>
        <span className="rounded-full border border-[#ddd5c7] bg-[#fbf8f3] px-3 py-1 text-xs font-black text-[#7e7165]">{actionLabel}</span>
      </div>
      <div>{children}</div>
    </section>
  );
}

function ToolbarButton({ icon: Icon, label, compact = false }: { icon: typeof Filter; label: string; compact?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-[#ddd5c7] bg-white font-bold text-[#444444] transition hover:border-[#111111]",
        compact ? "h-8 px-2 text-xs" : "h-10 px-4 text-sm"
      )}
    >
      <Icon size={compact ? 13 : 15} />
      {label}
    </button>
  );
}

function IconButton({ icon: Icon, label }: { icon: typeof Bell; label: string }) {
  return (
    <button type="button" aria-label={label} className="grid size-10 place-items-center rounded-full border border-[#ddd5c7] bg-white text-[#444444] transition hover:border-[#111111]">
      <Icon size={16} />
    </button>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-ZA", { month: "short", day: "numeric" }).format(new Date(value));
}
