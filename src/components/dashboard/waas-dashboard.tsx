"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Bell,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  Database,
  Eye,
  FileText,
  FilePenLine,
  Folder,
  Globe2,
  HardDrive,
  Gauge,
  Image as ImageIcon,
  LayoutGrid,
  List,
  LogOut,
  Laptop,
  LifeBuoy,
  MonitorCheck,
  Palette,
  PanelLeftClose,
  Plus,
  RadioTower,
  Rocket,
  Search,
  Server,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  SendHorizontal,
  Sparkles,
  Star,
  Tablet,
  UploadCloud,
  TrendingDown,
  TrendingUp,
  Users,
  Wand2,
  XCircle
} from "lucide-react";
import { BillingPanel } from "@/components/dashboard/billing-panel";
import { EditWebsiteForm } from "@/components/dashboard/edit-website-form";
import { PhotosManager } from "@/components/dashboard/photos-manager";
import { PublishResultNotice } from "@/components/dashboard/publish-result-notice";
import { RepublishButton } from "@/components/dashboard/republish-button";
import { TrackingSettingsForm } from "@/components/dashboard/tracking-settings-form";
import { HvacSite } from "@/components/published/hvac-site";
import { TEMPLATE_STYLES } from "@/lib/constants";
import type { DashboardData } from "@/lib/dashboard-data";
import { sampleClientSite } from "@/lib/sample-data";
import type { ClientSite } from "@/lib/types";
import { cn, formatCurrencyZar } from "@/lib/utils";

type Section = "overview" | "website" | "view" | "domain" | "database" | "business" | "templates" | "photos" | "leads" | "traffic" | "billing" | "reviews" | "settings" | "support";

type SidebarEntry = { id: string; section: Section; label: string; icon?: LucideIcon; activeWhen?: Section[] };
type SidebarGroup = { id: string; label: string; icon: LucideIcon; target?: Section; children?: SidebarEntry[] };

const sidebarGroups: SidebarGroup[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutGrid, target: "overview" },
  {
    id: "website",
        label: "Website",
        icon: Globe2,
        children: [
          { id: "preview", section: "view", label: "Preview", icon: MonitorCheck },
          { id: "domain", section: "domain", label: "Domain", icon: Globe2 },
          { id: "database", section: "database", label: "Database", icon: Database },
          { id: "design", section: "templates", label: "Design", icon: Palette },
          { id: "business", section: "business", label: "Business information", icon: FilePenLine }
        ]
      },
  { id: "media", label: "Media", icon: ImageIcon, target: "photos" },
  { id: "leads", label: "Leads", icon: Users, target: "leads" },
  { id: "settings", label: "Settings", icon: Settings, target: "settings" },
  { id: "support", label: "Support", icon: LifeBuoy, target: "support" }
];

const sectionCopy: Record<Section, string> = {
  overview: "Website health, readiness, billing, and publishing next steps.",
  website: "Edit customer-facing copy, services, contact details, and trust proof.",
  view: "Preview the website and ask the assistant for focused improvements.",
  domain: "Manage the website domain, DNS status, and provider connections.",
  database: "Review form submissions, uploaded documents, and stored website records.",
  business: "Manage public business profile, service areas, and contact information.",
  templates: "Tune the visual system, template direction, and conversion layout.",
  photos: "Manage project photos, gallery proof, and website media assets.",
  leads: "Review captured enquiries, contact requests, and lead follow-up status.",
  traffic: "Track visits, sources, leads, and measurement setup.",
  billing: "Manage subscription health, billing dates, and payment status.",
  reviews: "Connect review identity and improve social proof readiness.",
  settings: "Manage account settings, tracking IDs, and workspace metadata.",
  support: "Get help with publishing, domains, billing, and change requests."
};

export function WaasDashboard({ data, siteUrl, initialSection = "overview" }: { data: DashboardData; siteUrl: string | null; initialSection?: Section }) {
  const [activeSection, setActiveSection] = useState<Section>(initialSection);
  const [selectedProject, setSelectedProject] = useState<string | null>(initialSection === "overview" ? null : data.client.id);
  const [collapsed, setCollapsed] = useState(initialSection === "view");
  const displayName = data.client.business_name ?? data.client.trading_name ?? "SiteRent workspace";

  useEffect(() => {
    setActiveSection(initialSection);
    setSelectedProject(initialSection === "overview" ? null : data.client.id);
  }, [data.client.id, initialSection]);

  if (!selectedProject) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_18%_8%,rgba(204,251,241,0.78),transparent_30%),radial-gradient(circle_at_86%_12%,rgba(219,234,254,0.72),transparent_28%),linear-gradient(180deg,#fbfbfd_0%,#f4f6f8_100%)] text-foreground">
        <ProjectsTopBar />
        <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-14">
          <PublishResultNotice />
          {!data.hasWebsite ? (
            <EmptyWebsiteState />
          ) : (
            <ProjectsHome data={data} siteUrl={siteUrl} onOpenProject={(id) => {
              setSelectedProject(id);
              setActiveSection("overview");
            }} />
          )}
        </section>
      </main>
    );
  }

  return (
    <main className="ui-enter flex min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] text-foreground">
      <ProjectSidebar
        activeSection={activeSection}
        collapsed={collapsed}
        setActiveSection={setActiveSection}
        setCollapsed={setCollapsed}
        onProjects={() => {
          setSelectedProject(null);
          setActiveSection("overview");
        }}
      />

      <div className={cn("flex min-h-screen flex-1 flex-col transition-all duration-300 ease-out", collapsed ? "md:ml-[78px]" : "md:ml-[280px]")}>
        {activeSection !== "view" && (
          <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-white/60 bg-white/72 px-7 shadow-[0_10px_30px_rgba(15,23,42,0.04)] backdrop-blur-2xl">
            <div className="min-w-0">
              <h1 className="truncate text-xl font-semibold text-foreground">{displayName}</h1>
              <p className="hidden text-sm text-muted-foreground md:block">{sectionCopy[activeSection]}</p>
            </div>
            <div className="flex items-center gap-4">
              <button type="button" onClick={() => setActiveSection("view")} className="hidden items-center gap-2 rounded-full border border-white/70 bg-white/70 px-4 py-2 text-sm font-semibold text-foreground shadow-[0_12px_28px_rgba(15,23,42,0.08)] backdrop-blur-xl transition hover:bg-white md:inline-flex">
                <MonitorCheck className="size-4" />
                View website
              </button>
              <button type="button" className="relative flex size-10 items-center justify-center rounded-full border border-white/60 bg-white/60 text-muted-foreground shadow-sm backdrop-blur-xl transition-all duration-200 hover:bg-white hover:text-foreground">
                <Bell className="size-5" />
                <span className="absolute right-1.5 top-1.5 size-2 animate-pulse rounded-full bg-accent" />
              </button>
              <Link href="/dashboard?section=settings" className="flex size-10 items-center justify-center rounded-full border border-white/70 bg-white/70 text-xs font-semibold text-foreground shadow-sm backdrop-blur-xl transition hover:bg-white">SR</Link>
            </div>
          </header>
        )}

        <section className={cn("flex-1", activeSection === "view" || activeSection === "settings" ? "overflow-hidden px-0 py-0" : "overflow-auto px-7 py-7")}>
          <PublishResultNotice />
          <ProjectWorkspace data={data} siteUrl={siteUrl} activeSection={activeSection} setActiveSection={setActiveSection} onBack={() => {
            setSelectedProject(null);
            setActiveSection("overview");
          }} onEdit={() => setActiveSection("website")} />
        </section>
      </div>
    </main>
  );
}

function ProjectsTopBar() {
  return (
    <header className="border-b border-[#eef1f4] bg-white shadow-sm">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link href="/dashboard" className="flex items-center gap-3 text-lg font-semibold">
          <SiteRentMark />
          SiteRent
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/admin" className="hidden items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#1f2937] transition hover:text-black md:inline-flex">
            <ChevronLeft className="size-4 rotate-180" />
            Switch to admin
          </Link>
          <span className="hidden h-5 w-px bg-[#e5e7eb] md:block" />
          <Link href="/onboarding" className="inline-flex items-center gap-2 rounded-lg border border-[#e3e7ec] bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-[0.08em] text-[#111827] shadow-sm transition hover:-translate-y-0.5 hover:border-[#cbd5e1]">
            <Plus className="size-4" />
            Create website
          </Link>
          <Link href="/dashboard?section=settings" className="hidden rounded-lg border border-[#e3e7ec] bg-[#f8fafc] px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm transition hover:bg-white sm:inline-flex">
            Account
          </Link>
          <Link href="/dashboard?section=settings" aria-label="Account settings" className="grid size-10 place-items-center rounded-full bg-[linear-gradient(135deg,#f7d7c4,#f5efe7)] text-xs font-bold text-[#604235] shadow-sm ring-1 ring-[#eadfd6]">
            SR
          </Link>
        </div>
      </div>
    </header>
  );
}

function SiteRentMark() {
  return (
    <span className="grid size-9 shrink-0 grid-cols-2 gap-1 rounded-lg bg-[#dff8ed] p-1">
      <span className="rounded-[4px] bg-[#1ecb7b]" />
      <span className="rounded-[4px] bg-[#48e0a0]" />
      <span className="rounded-[4px] bg-[#48e0a0]" />
      <span className="rounded-[4px] bg-[#0bb665]" />
    </span>
  );
}

function ProjectSidebar({
  activeSection,
  collapsed,
  setActiveSection,
  setCollapsed,
  onProjects
}: {
  activeSection: Section;
  collapsed: boolean;
  setActiveSection: (section: Section) => void;
  setCollapsed: (value: boolean | ((value: boolean) => boolean)) => void;
  onProjects: () => void;
}) {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({ website: true });

  return (
    <aside className={cn("fixed left-0 top-0 z-40 hidden h-dvh flex-col overflow-hidden overscroll-none border-r border-[#e6eaef] bg-[#f4f7fa] text-foreground shadow-[18px_0_48px_rgba(15,23,42,0.06)] transition-all duration-300 ease-out md:flex", collapsed ? "w-[78px]" : "w-[280px]")}>
      <div className="flex h-24 shrink-0 items-center justify-between border-b border-[#e6eaef] px-5">
        <div className="flex min-w-0 items-center gap-3">
          <SiteRentMark />
          <span className={cn("whitespace-nowrap text-lg font-semibold transition-all duration-300", collapsed ? "w-0 overflow-hidden opacity-0" : "w-auto opacity-100")}>SiteRent</span>
        </div>
        {!collapsed && (
          <button type="button" onClick={() => setCollapsed(true)} className="grid size-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-white hover:text-foreground">
            <PanelLeftClose className="size-4" />
          </button>
        )}
      </div>

      <div className={cn("shrink-0 border-b border-[#e6eaef] px-5 py-6", collapsed && "px-3")}>
        <button type="button" onClick={onProjects} className="flex w-full items-center gap-4 rounded-xl px-2 py-2 text-sm font-semibold text-[#4b5563] transition hover:bg-white hover:text-foreground">
          <ChevronLeft className="size-5 shrink-0" />
          <span className={cn("whitespace-nowrap transition-all duration-300", collapsed ? "w-0 overflow-hidden opacity-0" : "opacity-100")}>Websites</span>
        </button>
      </div>

      <nav className="min-h-0 flex-1 overflow-hidden px-5 py-7">
        <div className="space-y-4">
          {sidebarGroups.map((group) => {
            const GroupIcon = group.icon;
            const childSections = group.children?.flatMap((item) => item.activeWhen ?? [item.section]) ?? [];
            const active = group.target === activeSection || childSections.includes(activeSection);

            if (!group.children) {
              return (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => group.target && setActiveSection(group.target)}
                  className={cn("group flex w-full items-center gap-5 rounded-xl px-2 py-2.5 text-sm font-semibold transition-all duration-200", active ? "bg-white text-[#111827] shadow-[0_12px_30px_rgba(15,23,42,0.08)]" : "text-[#4b5563] hover:bg-white/78 hover:text-[#111827]")}
                >
                  <GroupIcon className="size-5 shrink-0" />
                  <span className={cn("truncate transition-all duration-300", collapsed ? "w-0 overflow-hidden opacity-0" : "opacity-100")}>{group.label}</span>
                </button>
              );
            }

            return (
              <div key={group.id} className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    if (group.id === "website") {
                      setActiveSection("view");
                      setOpenGroups((value) => ({ ...value, website: true }));
                      return;
                    }
                    setOpenGroups((value) => ({ ...value, [group.id]: !value[group.id] }));
                  }}
                  className={cn(
                    "flex w-full items-center gap-5 rounded-xl px-2 py-2.5 text-sm font-semibold transition",
                    active ? "text-[#111827]" : "text-[#4b5563] hover:bg-white/78 hover:text-[#111827]"
                  )}
                >
                  <GroupIcon className="size-5 shrink-0" />
                  <span className={cn("min-w-0 flex-1 truncate transition-all duration-300", collapsed ? "w-0 overflow-hidden opacity-0" : "opacity-100")}>{group.label}</span>
                  {!collapsed && <ChevronRight className={cn("size-4 shrink-0 transition", openGroups[group.id] && "rotate-90")} />}
                </button>
                {!collapsed && (openGroups[group.id] || active) && (
                  <div className="ml-[18px] space-y-1 border-l border-[#dbe1e8] pl-7">
                    {group.children.map((item) => {
                      const ItemIcon = item.icon;
                      const itemActive = (item.activeWhen ?? [item.section]).includes(activeSection);
                      return (
                        <button
                          key={`${group.id}-${item.label}`}
                          type="button"
                          onClick={() => setActiveSection(item.section)}
                          className={cn("flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition", itemActive ? "bg-white text-foreground shadow-sm ring-1 ring-[#e6eaef]" : "text-muted-foreground hover:bg-white/80 hover:text-foreground")}
                        >
                          <span className="flex min-w-0 items-center gap-2">
                            {ItemIcon && <ItemIcon className="size-4 shrink-0" />}
                            <span className="truncate">{item.label}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      <div className="shrink-0 space-y-2 border-t border-[#e6eaef] p-5">
        <button type="button" onClick={() => setCollapsed((value) => !value)} className="flex w-full items-center justify-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground transition hover:bg-white hover:text-foreground">
          {collapsed ? <ChevronRight className="size-5" /> : <><ChevronLeft className="size-5" /><span>Collapse</span></>}
        </button>
        {!collapsed && (
          <Link href="/login" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-muted-foreground transition hover:bg-white/72 hover:text-foreground">
            <LogOut className="size-5" />
            Logout
          </Link>
        )}
      </div>
    </aside>
  );
}

function sectionTitle(section: Section) {
  return section === "view" ? "View Website" : section.charAt(0).toUpperCase() + section.slice(1);
}

function ProjectsHome({ data, siteUrl, onOpenProject }: { data: DashboardData; siteUrl: string | null; onOpenProject: (id: string) => void }) {
  const title = data.client.business_name ?? data.client.trading_name ?? "Cape Climate Pros";
  const url = siteUrl ? new URL(siteUrl).hostname : `${data.client.subdomain ?? "cape-climate-pros"}.siterent.co.za`;
  const template = data.client.template_style && data.client.template_style in TEMPLATE_STYLES
    ? TEMPLATE_STYLES[data.client.template_style as keyof typeof TEMPLATE_STYLES]
    : TEMPLATE_STYLES["coolair-blue"];
  const status = data.client.site_published ? "Production" : "Draft";
  const ownerInitial = title.charAt(0).toUpperCase();
  const galleryCount = data.client.gallery_photos.length;
  const websiteRows = [
    {
      name: title,
      subtitle: data.client.tagline ?? "Primary website workspace",
      client: data.client.trading_name ?? data.client.business_name ?? title,
      line: template.label,
      tag: status,
      users: data.mode === "supabase" ? "01" : "Demo",
      services: galleryCount > 0 ? String(galleryCount).padStart(2, "0") : "03",
      assets: data.client.ga_measurement_id || data.client.pixel_id ? "On" : "Setup"
    }
  ];
  const shortcuts = [
    { title, label: url, icon: Globe2, tone: "bg-blue-50 text-blue-700" },
    { title: "Content", label: "Copy and contact details", icon: FilePenLine, tone: "bg-slate-100 text-slate-700" },
    { title: "Design", label: template.label, icon: Palette, tone: "bg-orange-50 text-orange-700" },
    { title: "Traffic", label: data.client.ga_measurement_id || data.client.pixel_id ? "Tracking connected" : "Needs setup", icon: BarChart3, tone: "bg-emerald-50 text-emerald-700" }
  ];

  return (
    <div className="ui-enter -mx-6 -my-10 bg-[linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] lg:-mx-8 lg:-my-14">
      <section className="mx-auto max-w-7xl px-6 pt-8 lg:px-8">
        <div className="overflow-hidden rounded-[28px] border border-white/74 bg-white/66 shadow-[0_24px_70px_rgba(15,23,42,0.10)] ring-1 ring-white/70 backdrop-blur-2xl">
          <div className="grid gap-8 p-6 md:grid-cols-[1fr_420px] md:p-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">Website workspace</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight text-foreground md:text-5xl">My Websites</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">Manage website previews, content, design, media, tracking, billing, and launch readiness from one clean workspace.</p>
              <div className="mt-6 flex flex-wrap gap-2">
                <StatusPill tone={data.client.site_published ? "good" : "warn"} icon={RadioTower} label={data.client.site_published ? "Live website" : "Draft website"} />
                <StatusPill tone={data.mode === "supabase" ? "good" : "neutral"} icon={Server} label={data.mode === "supabase" ? "Supabase connected" : "Local demo data"} />
              </div>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/72 p-5 shadow-sm">
              <PanelTitle title="Find a website" subtitle="Search across workspaces and quick actions." />
              <label className="mt-4 flex h-14 items-center gap-4 rounded-xl border border-border bg-secondary/70 px-4">
                <Search className="size-5 text-muted-foreground" />
                <input className="h-full flex-1 border-0 bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground" placeholder="Search" />
              </label>
              <Link href="/onboarding" className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-bold text-accent-foreground shadow-[0_18px_34px_rgba(17,17,17,0.14)]">
                <Plus className="size-4" />
                Create website
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-8 px-6 py-8 lg:px-8">
        <div>
          <WebsiteSectionHeader title="Recently Viewed" />
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {shortcuts.map((item) => (
              <WebsiteShortcutCard key={item.title} {...item} onClick={() => onOpenProject(data.client.id)} />
            ))}
          </div>
        </div>

        <div>
          <WebsiteSectionHeader title="Favourites" />
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {shortcuts.slice(0, 3).map((item) => (
              <WebsiteShortcutCard key={`favorite-${item.title}`} {...item} favourite onClick={() => onOpenProject(data.client.id)} />
            ))}
          </div>
        </div>

        <section className="rounded-[24px] border border-white/74 bg-white/66 p-6 shadow-[0_22px_60px_rgba(15,23,42,0.08)] ring-1 ring-white/70 backdrop-blur-2xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">My Websites</h2>
            <Link href="/onboarding" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-[0.08em] text-foreground shadow-sm ring-1 ring-border transition hover:bg-secondary">
              <Plus className="size-4" />
              Create new
            </Link>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-6 border-b border-border text-sm text-muted-foreground">
            <button type="button" className="inline-flex items-center gap-2 py-3 transition hover:text-foreground">
              <List className="size-4" />
              List View
            </button>
            <button type="button" className="inline-flex items-center gap-2 border-b-2 border-foreground py-3 font-semibold text-foreground">
              <LayoutGrid className="size-4" />
              Grid View
            </button>
            <span className="h-4 w-px bg-border" />
            <button type="button" className="inline-flex items-center gap-2 py-3 transition hover:text-foreground">
              <SlidersHorizontal className="size-4" />
              Filter
            </button>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[980px] text-left">
              <thead className="text-[11px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">
                <tr>
                  <th className="py-3 pr-4">Website</th>
                  <th className="px-4 py-3">Users</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Template</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">User Count</th>
                  <th className="px-4 py-3">Media</th>
                  <th className="px-4 py-3">Tracking</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {websiteRows.map((row) => (
                  <tr key={row.name} className="border-t border-border transition hover:bg-white/72">
                    <td className="py-4 pr-4">
                      <button type="button" onClick={() => onOpenProject(data.client.id)} className="flex items-center gap-3 text-left">
                        <Star className="size-4 fill-[#f59e0b] text-[#f59e0b]" />
                        <span>
                          <span className="block text-xs text-muted-foreground">{row.subtitle}</span>
                          <span className="block font-semibold text-foreground">{row.name}</span>
                        </span>
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex -space-x-2">
                        {["#0f172a", "#e0f2fe", "#fecdd3"].map((color, index) => (
                          <span key={color} className="grid size-8 place-items-center rounded-full border-2 border-white text-[10px] font-bold text-white" style={{ backgroundColor: color }}>
                            {index === 2 ? ownerInitial : ""}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center gap-2 font-medium text-foreground">
                        <span className="grid size-7 place-items-center rounded-full bg-blue-50 text-xs font-bold text-blue-700">{ownerInitial}</span>
                        {row.client}
                      </span>
                    </td>
                    <td className="px-4 py-4"><span className="rounded-md bg-secondary px-3 py-1.5 text-xs text-muted-foreground">{row.line}</span></td>
                    <td className="px-4 py-4"><span className="rounded-md bg-secondary px-3 py-1.5 text-xs text-muted-foreground">{row.tag}</span></td>
                    <td className="px-4 py-4 text-muted-foreground"><Users className="mr-2 inline size-4" />{row.users}</td>
                    <td className="px-4 py-4 text-muted-foreground"><ImageIcon className="mr-2 inline size-4" />{row.services}</td>
                    <td className="px-4 py-4 text-muted-foreground"><Database className="mr-2 inline size-4" />{row.assets}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </div>
  );
}

function WebsiteSectionHeader({ title }: { title: string }) {
  return <h2 className="text-xl font-semibold tracking-tight text-foreground">{title}</h2>;
}

function WebsiteShortcutCard({
  title,
  label,
  icon: Icon,
  tone,
  favourite,
  onClick
}: {
  title: string;
  label: string;
  icon: LucideIcon;
  tone: string;
  favourite?: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className="micro-card group relative flex min-h-24 items-center gap-4 rounded-[20px] border border-white/74 bg-white/66 px-5 py-4 text-left shadow-[0_18px_42px_rgba(15,23,42,0.06)] ring-1 ring-white/70 backdrop-blur-2xl transition hover:bg-white/78">
      {favourite && <Star className="absolute left-3 top-3 size-4 fill-[#f59e0b] text-[#f59e0b]" />}
      <span className={cn("grid size-14 shrink-0 place-items-center rounded-2xl shadow-sm", tone)}>
        <Icon className="size-6" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-foreground">{title}</span>
        <span className="mt-1 block truncate text-xs text-muted-foreground">{label}</span>
      </span>
      <ChevronRight className="ml-auto hidden size-5 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground xl:block" />
    </button>
  );
}

function ProjectWorkspace({
  data,
  siteUrl,
  activeSection,
  setActiveSection,
  onBack,
  onEdit
}: {
  data: DashboardData;
  siteUrl: string | null;
  activeSection: Section;
  setActiveSection: (section: Section) => void;
  onBack: () => void;
  onEdit: () => void;
}) {
  useEffect(() => {
    function handleViewSite() {
      setActiveSection("view");
    }

    window.addEventListener("siterent:view-site", handleViewSite);
    return () => window.removeEventListener("siterent:view-site", handleViewSite);
  }, [setActiveSection]);

  if (activeSection === "view") {
    return <ViewSitePanel data={data} siteUrl={siteUrl} />;
  }

  return (
    <div className="stagger w-full space-y-7">
      {activeSection === "overview" && <OverviewPanel data={data} siteUrl={siteUrl} onCreate={() => setActiveSection("templates")} onEdit={onEdit} />}
      {activeSection === "website" && <WebsitePanel data={data} />}
      {activeSection === "domain" && <DomainPanel data={data} siteUrl={siteUrl} />}
      {activeSection === "database" && <DatabasePanel data={data} />}
      {activeSection === "business" && <BusinessInformationPanel data={data} />}
      {activeSection === "templates" && <TemplatesPanel data={data} />}
      {activeSection === "photos" && <PhotosManager client={data.client} />}
      {activeSection === "leads" && <LeadsPanel data={data} />}
      {activeSection === "traffic" && <TrafficPanel data={data} />}
      {activeSection === "billing" && <BillingPanel client={data.client} />}
      {activeSection === "reviews" && <ReviewsPanel data={data} />}
      {activeSection === "settings" && <SettingsPanel data={data} />}
      {activeSection === "support" && <SupportPanel displayName={data.client.business_name ?? data.client.trading_name ?? "SiteRent workspace"} />}
    </div>
  );
}

function EmptyWebsiteState() {
  return (
    <div className="grid min-h-[calc(100vh-8rem)] place-items-center">
      <section className="max-w-3xl rounded-xl border border-border bg-card p-8 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          <Plus className="size-6" />
        </div>
        <h2 className="mt-5 text-3xl font-bold tracking-tight text-foreground">Create your first website</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">Your workspace is ready. Start onboarding, choose a template style, add business details, then return here for live metrics and website controls.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/onboarding" className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-bold text-accent-foreground"><Plus className="size-4" /> Create website</Link>
          <Link href="/login" className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-5 py-3 text-sm font-bold text-foreground">Back to auth</Link>
        </div>
      </section>
    </div>
  );
}

function OverviewPanel({ data, siteUrl, onEdit }: { data: DashboardData; siteUrl: string | null; onCreate: () => void; onEdit: () => void }) {
  const photos = data.client.gallery_photos.length;
  const trackingReady = Boolean(data.client.ga_measurement_id || data.client.pixel_id);
  const profileReady = Boolean(data.client.business_name || data.client.trading_name);
  const analytics = getCustomerAnalytics(trackingReady);

  return (
    <div className="space-y-6">
      <ControlCenterHeader data={data} siteUrl={siteUrl} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Page visits" value={analytics.visits} change={trackingReady ? "+12% vs last week" : "Demo estimate"} changeType={trackingReady ? "positive" : "neutral"} icon={BarChart3} />
        <MetricCard title="New enquiries" value={analytics.enquiries} change={trackingReady ? "+4 this week" : "Track forms"} changeType={trackingReady ? "positive" : "neutral"} icon={Users} />
        <MetricCard title="Conversion rate" value={analytics.conversionRate} change={trackingReady ? "Visits to leads" : "Needs tracking"} changeType={trackingReady ? "positive" : "neutral"} icon={TrendingUp} />
        <MetricCard title="Top source" value={analytics.topSource} change={trackingReady ? "Best channel" : "Pending data"} changeType="neutral" icon={Globe2} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(340px,0.75fr)]">
        <div className="grid grid-cols-1 gap-6 2xl:grid-cols-[minmax(0,1fr)_360px]">
          <VisitsPanel analytics={analytics} />
          <LeadQualityPanel analytics={analytics} />
        </div>
        <CustomerActionPanel data={data} profileReady={profileReady} photos={photos} trackingReady={trackingReady} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
        <TopPagesPanel analytics={analytics} />
        <section className="rounded-[24px] border border-white/74 bg-white/62 p-5 shadow-[0_22px_60px_rgba(15,23,42,0.08)] ring-1 ring-white/70 backdrop-blur-2xl">
          <PanelTitle title="Quick Actions" subtitle="Simple next steps for this website" />
          <div className="mt-5 space-y-3">
            <ActionRow icon={FilePenLine} title="Edit website" copy="Update copy, contact data, and location details." value="Core" onClick={onEdit} />
            <ActionLink icon={Palette} title="Improve template" copy="Tune the layout and style for more enquiries." value="Template" href="/onboarding?step=2" />
            <ActionRow icon={Globe2} title="View website preview" copy="Open a full-bleed website preview inside the dashboard." value="Preview" onClick={() => {
              window.dispatchEvent(new CustomEvent("siterent:view-site"));
            }} />
            {siteUrl && <ActionLink icon={ArrowUpRight} title="Open live site" copy={siteUrl} value="Live" href={siteUrl} external />}
          </div>
        </section>
      </div>
    </div>
  );
}

type CustomerAnalytics = {
  visits: string;
  enquiries: string;
  conversionRate: string;
  topSource: string;
  trend: number[];
  enquiriesTrend: number[];
  topPages: { page: string; visits: string; enquiries: string; rate: string }[];
  sources: { source: string; share: number; visits: string }[];
};

function getCustomerAnalytics(trackingReady: boolean): CustomerAnalytics {
  if (!trackingReady) {
    return {
      visits: "1,248",
      enquiries: "36",
      conversionRate: "2.9%",
      topSource: "Google",
      trend: [72, 84, 79, 96, 88, 110, 126, 118, 132, 149, 142, 164, 171, 188],
      enquiriesTrend: [2, 3, 2, 4, 3, 5, 6, 5, 6, 7, 6, 8, 8, 9],
      topPages: [
        { page: "Homepage", visits: "684", enquiries: "18", rate: "2.6%" },
        { page: "Services", visits: "312", enquiries: "11", rate: "3.5%" },
        { page: "Contact", visits: "164", enquiries: "7", rate: "4.3%" }
      ],
      sources: [
        { source: "Google Search", share: 52, visits: "649" },
        { source: "Direct", share: 28, visits: "349" },
        { source: "Facebook", share: 12, visits: "150" },
        { source: "Other", share: 8, visits: "100" }
      ]
    };
  }

  return {
    visits: "1,248",
    enquiries: "36",
    conversionRate: "2.9%",
    topSource: "Google",
    trend: [72, 84, 79, 96, 88, 110, 126, 118, 132, 149, 142, 164, 171, 188],
    enquiriesTrend: [2, 3, 2, 4, 3, 5, 6, 5, 6, 7, 6, 8, 8, 9],
    topPages: [
      { page: "Homepage", visits: "684", enquiries: "18", rate: "2.6%" },
      { page: "Services", visits: "312", enquiries: "11", rate: "3.5%" },
      { page: "Contact", visits: "164", enquiries: "7", rate: "4.3%" }
    ],
    sources: [
      { source: "Google Search", share: 52, visits: "649" },
      { source: "Direct", share: 28, visits: "349" },
      { source: "Facebook", share: 12, visits: "150" },
      { source: "Other", share: 8, visits: "100" }
    ]
  };
}

function VisitsPanel({ analytics }: { analytics: CustomerAnalytics }) {
  const max = Math.max(...analytics.trend);

  return (
    <section className="min-h-[430px] rounded-[24px] border border-white/74 bg-white/62 p-5 shadow-[0_22px_60px_rgba(15,23,42,0.08)] ring-1 ring-white/70 backdrop-blur-2xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PanelTitle title="Page Visits" subtitle="How many people viewed the website in the last 14 days" />
        <div className="rounded-2xl border border-white/70 bg-white/66 px-3 py-2 text-right shadow-sm backdrop-blur-xl">
          <p className="text-xs font-medium text-muted-foreground">Last 14 days</p>
          <p className="text-lg font-semibold text-foreground">{analytics.visits}</p>
        </div>
      </div>
      <div className="mt-8 flex h-64 items-end gap-2 border-b border-l border-white/70 px-2 pb-2">
        {analytics.trend.map((value, index) => (
          <div key={`${value}-${index}`} className="flex h-full flex-1 items-end">
            <div className="w-full rounded-t-full bg-[linear-gradient(180deg,#111,#64748b)] shadow-[0_10px_20px_rgba(15,23,42,0.12)]" style={{ height: `${Math.max((value / max) * 100, 8)}%` }} />
          </div>
        ))}
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <MiniInsight label="Best day" value="Friday" />
        <MiniInsight label="Average per day" value="89 visits" />
        <MiniInsight label="Trend" value="+12%" />
      </div>
    </section>
  );
}

function LeadQualityPanel({ analytics }: { analytics: CustomerAnalytics }) {
  return (
    <section className="rounded-[24px] border border-white/74 bg-white/62 p-5 shadow-[0_22px_60px_rgba(15,23,42,0.08)] ring-1 ring-white/70 backdrop-blur-2xl">
      <PanelTitle title="Lead Quality" subtitle="Simple enquiry signals" />
      <div className="mt-5 space-y-4">
        <CustomerSignal label="Enquiries" value={analytics.enquiries} helper="Forms, calls, and WhatsApp clicks" />
        <CustomerSignal label="Conversion rate" value={analytics.conversionRate} helper="Visitors who became enquiries" />
        <CustomerSignal label="Top source" value={analytics.topSource} helper="Where most visitors came from" />
      </div>
      <div className="mt-6 rounded-2xl border border-white/70 bg-white/62 p-4 shadow-sm backdrop-blur-xl">
        <p className="text-sm font-semibold text-foreground">Plain-English readout</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Google is bringing the most traffic. The services page converts best, so keep pricing, response time, and trust proof clear there.
        </p>
      </div>
    </section>
  );
}

function CustomerActionPanel({ data, profileReady, photos, trackingReady }: { data: DashboardData; profileReady: boolean; photos: number; trackingReady: boolean }) {
  const items = [
    { label: "Website live", ready: data.client.site_published, action: "Publish the website" },
    { label: "Contact details", ready: profileReady, action: "Add phone and city" },
    { label: "Project photos", ready: photos >= 3, action: "Add 3 project photos" },
    { label: "Visit tracking", ready: trackingReady, action: "Connect GA4 or Pixel" }
  ];

  return (
    <aside className="rounded-[24px] border border-white/74 bg-white/62 p-5 shadow-[0_22px_60px_rgba(15,23,42,0.08)] ring-1 ring-white/70 backdrop-blur-2xl">
      <PanelTitle title="Customer Checklist" subtitle="Only the actions that affect enquiries" />
      <div className="mt-5 space-y-3">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-4 rounded-2xl border border-white/70 bg-white/52 p-3 shadow-sm backdrop-blur-xl">
            <div>
              <p className="text-sm font-semibold text-foreground">{item.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{item.ready ? "Ready" : item.action}</p>
            </div>
            <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", item.ready ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700")}>
              {item.ready ? "Done" : "To do"}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-2xl border border-white/70 bg-white/62 p-4 shadow-sm backdrop-blur-xl">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Next best action</p>
        <p className="mt-2 text-sm font-semibold text-foreground">
          {trackingReady ? "Add recent project photos to improve trust." : "Connect tracking so visits and enquiries are measured automatically."}
        </p>
      </div>
    </aside>
  );
}

function TopPagesPanel({ analytics }: { analytics: CustomerAnalytics }) {
  return (
    <section className="rounded-[24px] border border-white/74 bg-white/62 p-5 shadow-[0_22px_60px_rgba(15,23,42,0.08)] ring-1 ring-white/70 backdrop-blur-2xl">
      <PanelTitle title="Top Pages" subtitle="Which pages visitors use before enquiring" />
      <div className="mt-5 overflow-hidden rounded-2xl border border-white/70 bg-white/52 shadow-sm backdrop-blur-xl">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Page</th>
              <th className="px-4 py-3">Visits</th>
              <th className="px-4 py-3">Enquiries</th>
              <th className="px-4 py-3">Rate</th>
            </tr>
          </thead>
          <tbody>
            {analytics.topPages.map((page) => (
              <tr key={page.page} className="border-t border-border">
                <td className="px-4 py-3 font-medium text-foreground">{page.page}</td>
                <td className="px-4 py-3 text-muted-foreground">{page.visits}</td>
                <td className="px-4 py-3 text-muted-foreground">{page.enquiries}</td>
                <td className="px-4 py-3 font-medium text-foreground">{page.rate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-4">
        {analytics.sources.map((source) => (
          <div key={source.source} className="rounded-2xl border border-white/70 bg-white/52 p-3 shadow-sm backdrop-blur-xl">
            <p className="truncate text-sm font-semibold text-foreground">{source.source}</p>
            <p className="mt-1 text-xs text-muted-foreground">{source.visits} visits</p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/70">
              <div className="h-full rounded-full bg-[linear-gradient(90deg,#111,#64748b)]" style={{ width: `${source.share}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CustomerSignal({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div className="rounded-2xl border border-white/70 bg-white/52 p-4 shadow-sm backdrop-blur-xl">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
    </div>
  );
}

function MiniInsight({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/70 bg-white/52 p-3 shadow-sm backdrop-blur-xl">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function WebsitePanel({ data }: { data: DashboardData }) {
  const profileReady = Boolean(data.client.business_name || data.client.trading_name);
  const contactReady = Boolean(data.client.phone || data.client.email || data.client.whatsapp);
  const proofReady = data.client.gallery_photos.length >= 3;

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[24px] border border-white/74 bg-white/72 shadow-[0_22px_60px_rgba(15,23,42,0.08)] ring-1 ring-white/70 backdrop-blur-2xl">
        <div className="grid gap-0 lg:grid-cols-[1fr_360px]">
          <div className="p-6 md:p-7">
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill tone={profileReady ? "good" : "warn"} icon={FilePenLine} label={profileReady ? "Profile ready" : "Profile missing"} />
              <StatusPill tone={contactReady ? "good" : "warn"} icon={Users} label={contactReady ? "Contact ready" : "Add contact"} />
              <StatusPill tone={proofReady ? "good" : "neutral"} icon={ImageIcon} label={`${data.client.gallery_photos.length} photos`} />
            </div>
            <h2 className="mt-5 text-3xl font-bold tracking-tight text-foreground">Content workspace</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Keep the customer-facing website copy accurate: business identity, service area, contact channels, and proof that helps visitors enquire with confidence.
            </p>
          </div>
          <div className="border-t border-white/70 bg-white/42 p-5 lg:border-l lg:border-t-0">
            <div className="rounded-2xl border border-white/70 bg-white/72 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-2xl bg-[#111] text-white">
                  <Wand2 className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">After editing</p>
                  <p className="text-xs text-muted-foreground">Republish so visitors see the latest content.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <EditWebsiteForm client={data.client} />
      <div className="rounded-[24px] border border-white/74 bg-white/62 p-6 shadow-[0_22px_60px_rgba(15,23,42,0.08)] ring-1 ring-white/70 backdrop-blur-2xl">
        <PanelTitle title="Publish saved changes" subtitle="Re-publish after editing so the live site picks up the latest content." />
        <div className="mt-4">
          <RepublishButton clientId={data.client.id} />
        </div>
      </div>
    </div>
  );
}

function DomainPanel({ data, siteUrl }: { data: DashboardData; siteUrl: string | null }) {
  const hostname = siteUrl ? new URL(siteUrl).hostname : `${data.client.subdomain ?? "website"}.siterent.co.za`;
  const providerConnections = [
    { name: "GoDaddy", status: "Available", copy: "Connect registrar DNS automatically." },
    { name: "Namecheap", status: "Available", copy: "Sync records after authorisation." },
    { name: "Cloudflare", status: "Recommended", copy: "Best for DNS, SSL, and redirects." }
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-[24px] border border-white/74 bg-white/72 p-6 shadow-[0_22px_60px_rgba(15,23,42,0.08)] ring-1 ring-white/70 backdrop-blur-2xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <PanelTitle title="Domain settings" subtitle="Manage the domain visitors use to reach this website." />
          <StatusPill tone={data.client.site_published ? "good" : "warn"} icon={Globe2} label={data.client.site_published ? "Domain live" : "Not live"} />
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Info label="Current domain" value={hostname} />
          <Info label="Custom domain" value={data.client.custom_domain ?? "Not connected"} />
          <Info label="SSL status" value={data.client.site_published ? "Active" : "Pending publish"} />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="rounded-[24px] border border-white/74 bg-white/72 p-6 shadow-[0_22px_60px_rgba(15,23,42,0.08)] ring-1 ring-white/70 backdrop-blur-2xl">
          <PanelTitle title="DNS records" subtitle="Records needed when a domain is connected manually." />
          <div className="mt-5 overflow-hidden rounded-2xl border border-border bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                <tr><th className="px-4 py-3">Type</th><th className="px-4 py-3">Host</th><th className="px-4 py-3">Value</th><th className="px-4 py-3">Status</th></tr>
              </thead>
              <tbody>
                {[
                  { type: "A", host: "@", value: "76.76.21.21", status: "Required" },
                  { type: "CNAME", host: "www", value: hostname, status: "Required" },
                  { type: "TXT", host: "_siterent", value: "verify-site-owner", status: "Optional" }
                ].map((row) => (
                  <tr key={`${row.type}-${row.host}`} className="border-t border-border">
                    <td className="px-4 py-3 font-semibold">{row.type}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.host}</td>
                    <td className="px-4 py-3 font-mono text-xs text-foreground">{row.value}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <aside className="rounded-[24px] border border-white/74 bg-white/72 p-6 shadow-[0_22px_60px_rgba(15,23,42,0.08)] ring-1 ring-white/70 backdrop-blur-2xl">
          <PanelTitle title="Provider connections" subtitle="Connect common domain providers." />
          <div className="mt-5 space-y-3">
            {providerConnections.map((provider) => (
              <div key={provider.name} className="rounded-2xl border border-border bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-foreground">{provider.name}</p>
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">{provider.status}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{provider.copy}</p>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </div>
  );
}

function DatabasePanel({ data }: { data: DashboardData }) {
  const records = [
    { type: "Form submission", name: "Emergency repair enquiry", source: "Contact form", date: "Today", status: "New" },
    { type: "Uploaded document", name: "Maintenance quote.pdf", source: "Upload field", date: "Yesterday", status: "Stored" },
    { type: "Lead profile", name: data.client.email ?? "customer@example.com", source: "Website CTA", date: "2 days ago", status: "Synced" }
  ];

  return (
    <section className="rounded-[24px] border border-white/74 bg-white/72 p-6 shadow-[0_22px_60px_rgba(15,23,42,0.08)] ring-1 ring-white/70 backdrop-blur-2xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PanelTitle title="Website database" subtitle="Stored records captured through forms, uploads, and website events." />
        <StatusPill tone={data.mode === "supabase" ? "good" : "neutral"} icon={Database} label={data.mode === "supabase" ? "Supabase connected" : "Demo records"} />
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <MetricCard title="Form entries" value="12" change="Last 30 days" changeType="neutral" icon={FileText} />
        <MetricCard title="Documents" value="04" change="Uploaded" changeType="neutral" icon={UploadCloud} />
        <MetricCard title="Contacts" value="09" change="Captured" changeType="positive" icon={Users} />
        <MetricCard title="Storage" value="18%" change="Used" changeType="neutral" icon={HardDrive} />
      </div>
      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
            <tr><th className="px-4 py-3">Record</th><th className="px-4 py-3">Source</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Status</th></tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.name} className="border-t border-border">
                <td className="px-4 py-3"><span className="block font-semibold text-foreground">{record.name}</span><span className="text-xs text-muted-foreground">{record.type}</span></td>
                <td className="px-4 py-3 text-muted-foreground">{record.source}</td>
                <td className="px-4 py-3 text-muted-foreground">{record.date}</td>
                <td className="px-4 py-3"><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">{record.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function BusinessInformationPanel({ data }: { data: DashboardData }) {
  return (
    <div className="space-y-6">
      <section className="rounded-[24px] border border-white/74 bg-white/72 p-6 shadow-[0_22px_60px_rgba(15,23,42,0.08)] ring-1 ring-white/70 backdrop-blur-2xl">
        <PanelTitle title="Business information" subtitle="The public identity and contact information used across the generated website." />
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <Info label="Business name" value={data.client.business_name ?? "Missing"} />
          <Info label="Trading name" value={data.client.trading_name ?? "Missing"} />
          <Info label="Primary city" value={data.client.primary_city ?? "Missing"} />
          <Info label="Phone" value={data.client.phone ?? "Missing"} />
          <Info label="WhatsApp" value={data.client.whatsapp ?? "Missing"} />
          <Info label="Email" value={data.client.email ?? "Missing"} />
        </div>
      </section>
      <EditWebsiteForm client={data.client} />
    </div>
  );
}

function ControlCenterHeader({ data, siteUrl }: { data: DashboardData; siteUrl: string | null }) {
  const template = data.client.template_style && data.client.template_style in TEMPLATE_STYLES
    ? TEMPLATE_STYLES[data.client.template_style as keyof typeof TEMPLATE_STYLES]
    : null;
  const publishedAt = data.client.published_at ? new Date(data.client.published_at).toLocaleString("en-ZA") : "Not published";

  return (
    <section className="overflow-hidden rounded-[24px] border border-white/74 bg-white/62 shadow-[0_22px_60px_rgba(15,23,42,0.08)] ring-1 ring-white/70 backdrop-blur-2xl">
      <div className="grid gap-0 lg:grid-cols-[1fr_360px]">
        <div className="p-7 md:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill tone={data.client.site_published ? "good" : "warn"} icon={RadioTower} label={data.client.site_published ? "Live service" : "Draft mode"} />
            <StatusPill tone={data.mode === "supabase" ? "good" : "neutral"} icon={Server} label={data.mode === "supabase" ? "Supabase connected" : "Local demo data"} />
            <StatusPill tone={data.client.subscription_status === "active" ? "good" : "warn"} icon={ShieldCheck} label={data.client.subscription_status.replace(/_/g, " ")} />
          </div>
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {data.client.business_name ?? data.client.trading_name ?? "Website control center"}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
            Monitor site health, publishing state, template deployment, lead capture, analytics, and billing from one operational surface.
          </p>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <ControlStat label="Endpoint" value={siteUrl ? new URL(siteUrl).hostname : "No subdomain"} />
            <ControlStat label="Template" value={template?.label ?? "Not selected"} />
            <ControlStat label="Last publish" value={publishedAt} />
          </div>
        </div>
        <div className="border-t border-white/70 bg-white/42 p-5 lg:border-l lg:border-t-0">
          <div className="rounded-2xl border border-white/70 bg-white/62 p-4 shadow-sm backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">System feed</span>
              <Activity className="size-4 text-accent" />
            </div>
            <TelemetryLine label="Publishing queue" value="Clear" good />
            <TelemetryLine label="Lead form" value="Armed" good />
            <TelemetryLine label="Template deploy" value={template?.label ?? "Pending"} good={Boolean(template)} />
            <TelemetryLine label="Analytics" value={data.client.ga_measurement_id || data.client.pixel_id ? "Receiving" : "Waiting"} good={Boolean(data.client.ga_measurement_id || data.client.pixel_id)} />
          </div>
        </div>
      </div>
    </section>
  );
}

function ViewSitePanel({ data, siteUrl }: { data: DashboardData; siteUrl: string | null }) {
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const title = data.client.business_name ?? data.client.trading_name ?? "Cape Climate Pros";
  const url = siteUrl ? new URL(siteUrl).hostname : `${data.client.subdomain ?? "cape-climate-pros"}.siterent.co.za`;
  const previewPath = `/sites/${data.client.subdomain ?? "cape-climate-pros"}`;
  const previewSite = dashboardClientToPreviewSite(data);
  const deviceConfig = {
    desktop: { label: "Desktop", icon: MonitorCheck, width: 1180, chrome: "Full responsive canvas", height: "h-[calc(100vh-15rem)]" },
    tablet: { label: "Tablet", icon: Tablet, width: 768, chrome: "768px tablet viewport", height: "h-[calc(100vh-15rem)]" },
    mobile: { label: "Mobile", icon: Laptop, width: 390, chrome: "390px mobile viewport", height: "h-[calc(100vh-15rem)]" }
  } satisfies Record<typeof device, { label: string; icon: LucideIcon; width: number; chrome: string; height: string }>;

  return (
    <section className="grid h-dvh overflow-hidden bg-[linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] text-foreground xl:grid-cols-[minmax(0,1fr)_430px]">
      <div className="flex min-h-0 min-w-0 flex-col overflow-hidden">
        <div className="flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-white/70 bg-white/72 px-5 py-3 shadow-[0_10px_30px_rgba(15,23,42,0.04)] backdrop-blur-2xl">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-700 shadow-sm">
              <Eye className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Website Preview</p>
              <h2 className="truncate text-base font-semibold tracking-tight text-foreground md:text-lg">{title}</h2>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-xl border border-white/70 bg-white/72 p-1 shadow-sm">
              {(["desktop", "tablet", "mobile"] as const).map((item) => {
                const Icon = deviceConfig[item].icon;
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setDevice(item)}
                    className={cn("inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition", device === item ? "bg-[#111] text-white shadow-sm" : "text-muted-foreground hover:bg-secondary hover:text-foreground")}
                  >
                    <Icon className="size-4" />
                    <span className="hidden sm:inline">{deviceConfig[item].label}</span>
                  </button>
                );
              })}
            </div>
            <Link href={previewPath} target="_blank" className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-[0_18px_34px_rgba(17,17,17,0.14)] transition hover:-translate-y-0.5">
              Open preview <ArrowUpRight className="size-4" />
            </Link>
            {siteUrl && <a href={siteUrl} target="_blank" rel="noreferrer" className="hidden items-center gap-2 rounded-xl border border-white/70 bg-white/72 px-4 py-2 text-sm font-semibold text-foreground shadow-sm transition hover:bg-white md:inline-flex">Live site</a>}
          </div>
        </div>

        <div className="grid gap-3 border-b border-white/70 bg-white/48 px-5 py-3 md:grid-cols-3">
          <PreviewCapability icon={HardDrive} label="Hostable build" value={data.client.site_published ? "Production route active" : "Draft route ready"} />
          <PreviewCapability icon={Sparkles} label="AI editable" value="Assistant reads this preview" />
          <PreviewCapability icon={Globe2} label="Hosting" value={data.client.custom_domain ? data.client.custom_domain : `${data.client.subdomain ?? "website"}.siterent.co.za`} />
        </div>

        <div className="flex min-h-0 flex-1 items-center overflow-hidden bg-[radial-gradient(circle_at_20%_10%,rgba(219,234,254,0.86),transparent_30%),radial-gradient(circle_at_86%_12%,rgba(204,251,241,0.58),transparent_28%)] px-4 py-6 md:px-8">
          <div
            className="mx-auto flex max-h-full min-w-0 flex-col overflow-hidden rounded-[22px] border border-white/74 bg-white shadow-[0_34px_90px_rgba(15,23,42,0.14)] ring-1 ring-white/70 transition-all duration-300"
            style={{ width: `min(100%, ${deviceConfig[device].width}px)` }}
          >
            <div className="flex items-center gap-3 border-b border-[#e5e7eb] bg-[#f8fafc] px-4 py-3">
              <span className="flex gap-1.5">
                <span className="size-3 rounded-full bg-[#ff5f57]" />
                <span className="size-3 rounded-full bg-[#ffbd2e]" />
                <span className="size-3 rounded-full bg-[#28c840]" />
              </span>
              <span className="min-w-0 flex-1 truncate rounded-lg border border-[#e5e7eb] bg-white px-3 py-1.5 text-xs font-medium text-[#64748b]">
                https://{url}
              </span>
              <span className="hidden rounded-md bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700 md:inline">{deviceConfig[device].chrome}</span>
              <span className="hidden rounded-md bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700 sm:inline">{data.client.site_published ? "Live" : "Draft"}</span>
            </div>
            <div
              aria-label={`${title} website preview`}
              className={cn("w-full overflow-y-auto overflow-x-hidden border-0 bg-white [&_.fixed]:absolute", deviceConfig[device].height)}
            >
              <HvacSite site={previewSite} />
            </div>
          </div>
        </div>
      </div>

      <WebsiteAssistantPanel data={data} previewPath={previewPath} url={url} />
    </section>
  );
}

function dashboardClientToPreviewSite(data: DashboardData): ClientSite {
  const templateStyle =
    data.client.template_style && data.client.template_style in TEMPLATE_STYLES
      ? (data.client.template_style as ClientSite["templateStyle"])
      : sampleClientSite.templateStyle;

  return {
    ...sampleClientSite,
    id: data.client.id,
    businessName: data.client.business_name ?? data.client.trading_name ?? sampleClientSite.businessName,
    tradingName: data.client.trading_name ?? data.client.business_name ?? sampleClientSite.tradingName,
    tagline: data.client.tagline ?? sampleClientSite.tagline,
    phone: data.client.phone ?? sampleClientSite.phone,
    whatsapp: data.client.whatsapp ?? data.client.phone ?? sampleClientSite.whatsapp,
    email: data.client.email ?? sampleClientSite.email,
    primaryCity: data.client.primary_city ?? sampleClientSite.primaryCity,
    address: data.client.address ?? sampleClientSite.address,
    galleryPhotos: data.client.gallery_photos.length ? data.client.gallery_photos : sampleClientSite.galleryPhotos,
    pixelId: data.client.pixel_id ?? sampleClientSite.pixelId,
    gaMeasurementId: data.client.ga_measurement_id ?? undefined,
    templateStyle,
    subdomain: data.client.subdomain ?? sampleClientSite.subdomain,
    customDomain: data.client.custom_domain ?? undefined
  };
}

function PreviewCapability({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-xl border border-white/70 bg-white/72 px-3 py-2 shadow-sm">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-secondary text-muted-foreground">
        <Icon className="size-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">{label}</span>
        <span className="block truncate text-sm font-semibold text-foreground">{value}</span>
      </span>
    </div>
  );
}

type AiPlan = {
  summary: string;
  templateStyle: string;
  hero: {
    headline: string;
    subheadline: string;
    primaryCta: string;
    secondaryCta: string;
  };
  uiChangePlan: Array<{
    area: string;
    change: string;
    rationale: string;
  }>;
  imagePrompts: Array<{
    slot: string;
    prompt: string;
  }>;
};

function WebsiteAssistantPanel({ data, previewPath, url }: { data: DashboardData; previewPath: string; url: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [applyStatus, setApplyStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [provider, setProvider] = useState<"gemini" | "local" | null>(null);
  const [plan, setPlan] = useState<AiPlan | null>(null);
  const [draft, setDraft] = useState("");
  const [submittedPrompt, setSubmittedPrompt] = useState("");
  const businessName = data.client.business_name ?? data.client.trading_name ?? "Cape Climate Pros";
  const promptSuggestions = [
    "What should I improve first on this website?",
    "Rewrite the hero so it gets more enquiries.",
    "Find trust gaps before I publish."
  ];
  const defaultBusinessContext = [
    `${businessName} website at ${url}.`,
    data.client.tagline ? `Tagline: ${data.client.tagline}.` : "",
    data.client.primary_city ? `Primary city: ${data.client.primary_city}.` : "",
    data.client.phone ? `Phone: ${data.client.phone}.` : "",
    data.client.email ? `Email: ${data.client.email}.` : ""
  ].filter(Boolean).join(" ");

  async function onSubmit(formData: FormData) {
    const request = String(formData.get("request") ?? "").trim();
    if (request.length < 20) return;

    setStatus("loading");
    setPlan(null);
    setSubmittedPrompt(request);

    const response = await fetch("/api/ai/website-plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "restyle",
        preferredTemplateStyle: data.client.template_style || undefined,
        businessContext: defaultBusinessContext,
        currentWebsiteContext: request
      })
    });

    const result = (await response.json()) as { provider?: "gemini" | "local"; plan?: AiPlan };
    if (!response.ok || !result.plan) {
      setStatus("error");
      return;
    }

    setProvider(result.provider ?? null);
    setPlan(result.plan);
    setStatus("ready");
    setApplyStatus("idle");
  }

  async function applyPlanToWebsite() {
    if (!plan) return;

    const templateStyle =
      plan.templateStyle in TEMPLATE_STYLES
        ? plan.templateStyle
        : data.client.template_style && data.client.template_style in TEMPLATE_STYLES
          ? data.client.template_style
          : undefined;
    setApplyStatus("saving");
    const response = await fetch("/api/dashboard/client", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId: data.client.id,
        tagline: plan.hero.subheadline.slice(0, 180),
        templateStyle
      })
    });

    setApplyStatus(response.ok ? "saved" : "error");
  }

  return (
    <aside className="flex h-dvh flex-col overflow-hidden border-l border-white/70 bg-white/72 text-foreground shadow-[0_10px_40px_rgba(15,23,42,0.06)] backdrop-blur-2xl">
      <div className="border-b border-white/70 p-5">
        <div className="flex items-start gap-3">
          <div className="grid size-11 place-items-center rounded-2xl bg-blue-50 text-blue-700 shadow-sm">
            <Sparkles className="size-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Website assistant</p>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">Ready</span>
            </div>
            <h3 className="mt-1 text-xl font-semibold tracking-tight text-foreground">Chat about this website</h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">Ask for clearer copy, stronger trust proof, SEO ideas, or a publish checklist while you preview the real page.</p>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-5 overflow-hidden p-5">
        <div className="space-y-4">
          <div className="max-w-[92%] rounded-2xl rounded-tl-md border border-white/70 bg-white/72 p-4 text-sm leading-6 text-foreground shadow-sm">
            I am looking at <span className="font-semibold text-foreground">{businessName}</span>. I can help tighten the message, suggest better sections, and turn the preview into a stronger lead generator.
          </div>

          {submittedPrompt && (
            <div className="ml-auto max-w-[92%] rounded-2xl rounded-tr-md bg-accent p-4 text-sm leading-6 text-accent-foreground shadow-[0_16px_30px_rgba(17,17,17,0.14)]">
              {submittedPrompt}
            </div>
          )}

          {status === "loading" && (
            <div className="flex max-w-[92%] items-center gap-3 rounded-2xl rounded-tl-md border border-white/70 bg-white/72 p-4 text-sm font-semibold text-muted-foreground shadow-sm">
              <span className="flex gap-1">
                <span className="size-2 animate-pulse rounded-full bg-muted-foreground" />
                <span className="size-2 animate-pulse rounded-full bg-muted-foreground [animation-delay:120ms]" />
                <span className="size-2 animate-pulse rounded-full bg-muted-foreground [animation-delay:240ms]" />
              </span>
              Reviewing the preview
            </div>
          )}

          {plan && (
            <div className="max-w-[96%] rounded-2xl rounded-tl-md border border-white/70 bg-white/72 p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Recommendation</p>
                {provider && <span className="rounded-full border border-border bg-secondary px-2.5 py-1 text-xs font-semibold capitalize text-muted-foreground">{provider}</span>}
              </div>
              <h4 className="mt-2 text-base font-semibold text-foreground">{plan.templateStyle}</h4>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{plan.summary}</p>
              <div className="mt-4 rounded-2xl border border-border bg-secondary/70 p-4">
                <p className="text-sm font-semibold text-foreground">{plan.hero.headline}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{plan.hero.subheadline}</p>
              </div>
              <div className="mt-4 space-y-2">
                {plan.uiChangePlan.slice(0, 3).map((item) => (
                  <article key={`${item.area}-${item.change}`} className="rounded-xl border border-border bg-white p-3">
                    <p className="text-sm font-semibold text-foreground">{item.area}</p>
                    <p className="mt-1 text-sm leading-5 text-muted-foreground">{item.change}</p>
                  </article>
                ))}
              </div>
              <button
                type="button"
                onClick={applyPlanToWebsite}
                disabled={applyStatus === "saving"}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-3 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Wand2 className="size-4" />
                {applyStatus === "saving" ? "Applying edits" : applyStatus === "saved" ? "Edits saved" : "Apply hero and style edits"}
              </button>
              {applyStatus === "error" && <p className="mt-2 text-sm font-semibold text-destructive">Could not apply these AI edits.</p>}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {promptSuggestions.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => setDraft(prompt)}
              className="rounded-full border border-white/70 bg-white/70 px-3 py-1.5 text-xs font-semibold text-muted-foreground shadow-sm transition hover:bg-white hover:text-foreground"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-white/70 p-5">
        <form action={onSubmit} className="rounded-[22px] border border-white/76 bg-white/78 p-3 shadow-sm backdrop-blur-xl">
          <label className="sr-only" htmlFor="website-assistant-request">Message website assistant</label>
          <textarea
            id="website-assistant-request"
            name="request"
            required
            minLength={20}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            className="min-h-28 w-full resize-none rounded-2xl bg-transparent px-3 py-2 text-sm leading-6 text-foreground outline-none placeholder:text-muted-foreground"
            placeholder="Ask about copy, sections, trust proof, SEO, or what to fix before publishing..."
          />
          <div className="flex items-center justify-between gap-3 border-t border-border/70 px-1 pt-3">
            <span className="truncate text-xs font-medium text-muted-foreground">
              Preview: <Link href={previewPath} target="_blank" className="font-semibold text-foreground">{previewPath}</Link>
            </span>
            <button
              type="submit"
              disabled={status === "loading" || draft.trim().length < 20}
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground shadow-[0_16px_32px_rgba(17,17,17,0.14)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45"
            >
              <SendHorizontal className="size-4" />
              {status === "loading" ? "Sending" : "Send"}
            </button>
          </div>
        </form>

        {status === "error" && <p className="text-sm font-semibold text-destructive">Gemini assist could not generate edits. Please try again.</p>}
      </div>
    </aside>
  );
}

function TemplatesPanel({ data }: { data: DashboardData }) {
  const currentStyle = data.client.template_style ?? "aireco-dark";
  const previewPath = `/sites/${data.client.subdomain ?? "cape-climate-pros"}`;
  const [inspirationFiles, setInspirationFiles] = useState<string[]>([]);

  function onInspirationUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).slice(0, 6);
    setInspirationFiles(files.map((file) => file.name));
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-6 rounded-[24px] border border-white/74 bg-white/72 p-6 shadow-[0_22px_60px_rgba(15,23,42,0.08)] ring-1 ring-white/70 backdrop-blur-2xl xl:grid-cols-[1fr_420px]">
        <div>
          <PanelTitle title="Design system" subtitle="Preview and apply the visual language customers will see." />
          <div className="mt-5">
            <TemplatePreview />
          </div>
        </div>
        <aside className="rounded-2xl border border-white/70 bg-white/72 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Rocket className="size-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Conversion template</h3>
              <p className="text-sm text-muted-foreground">Clear hero, service proof, and enquiry flow</p>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            <TelemetryLine label="Hero" value="Full viewport service offer" good />
            <TelemetryLine label="Lead capture" value="Contact form block" good />
            <TelemetryLine label="Trust layer" value="Rating and process cards" good />
            <TelemetryLine label="Mobile" value="Responsive sections" good />
          </div>
          <div className="mt-5 grid gap-3">
            <Link href="/onboarding?step=2&template=coolair-blue" className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-bold text-accent-foreground">
              Use this template <ArrowUpRight className="size-4" />
            </Link>
            <Link href={previewPath} target="_blank" className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-secondary px-5 py-3 text-sm font-bold text-foreground">
              Open full preview <MonitorCheck className="size-4" />
            </Link>
          </div>
        </aside>
      </section>

      <section className="grid gap-6 rounded-[24px] border border-white/74 bg-white/72 p-6 shadow-[0_22px_60px_rgba(15,23,42,0.08)] ring-1 ring-white/70 backdrop-blur-2xl xl:grid-cols-[minmax(0,1fr)_380px]">
        <div>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <PanelTitle title="AI design inspiration" subtitle="Upload reference images so the assistant can translate the mood into this website's own design system." />
            <StatusPill tone={inspirationFiles.length ? "good" : "neutral"} icon={Sparkles} label={inspirationFiles.length ? `${inspirationFiles.length} references` : "Optional"} />
          </div>
          <label className="mt-5 flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-[22px] border border-dashed border-slate-300 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-6 py-8 text-center transition hover:border-blue-300 hover:bg-white">
            <span className="grid size-14 place-items-center rounded-2xl bg-blue-50 text-blue-700 shadow-sm">
              <UploadCloud className="size-6" />
            </span>
            <span className="mt-4 text-base font-semibold text-foreground">Upload inspiration screenshots</span>
            <span className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Use homepage screenshots, competitor sections, brand moodboards, or UI references. JPG, PNG, and WebP work best.</span>
            <input type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={onInspirationUpload} className="sr-only" />
          </label>
          {inspirationFiles.length > 0 && (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {inspirationFiles.map((file) => (
                <div key={file} className="flex items-center gap-3 rounded-2xl border border-white/70 bg-white/62 p-3 shadow-sm">
                  <span className="grid size-10 place-items-center rounded-xl bg-secondary text-muted-foreground">
                    <ImageIcon className="size-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-foreground">{file}</span>
                    <span className="text-xs text-muted-foreground">Ready for AI design direction</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        <aside className="rounded-2xl border border-white/70 bg-white/62 p-5 shadow-sm">
          <PanelTitle title="What AI should extract" subtitle="Useful inputs for a site redesign." />
          <div className="mt-5 space-y-3">
            <TelemetryLine label="Layout" value="Section order and hierarchy" good />
            <TelemetryLine label="Visual style" value="Palette, type mood, spacing" good />
            <TelemetryLine label="Conversion" value="CTA and proof placement" good />
            <TelemetryLine label="Brand safety" value="Avoid direct copying" good />
          </div>
          <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 text-sm leading-6 text-blue-900">
            Best results come from 2-4 references plus one sentence about what to borrow, such as clean hero spacing, premium card style, or a stronger booking flow.
          </div>
        </aside>
      </section>

      <section className="rounded-[24px] border border-white/74 bg-white/72 p-6 shadow-[0_22px_60px_rgba(15,23,42,0.08)] ring-1 ring-white/70 backdrop-blur-2xl">
        <PanelTitle title="Template styles" subtitle="Choose the starter website language during create website onboarding." />
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Object.entries(TEMPLATE_STYLES).map(([key, template]) => (
          <Link key={key} href={`/onboarding?step=2&template=${key}`} className={cn("group overflow-hidden rounded-xl border bg-background transition hover:border-accent/60", currentStyle === key ? "border-accent" : "border-border")}>
            <span className="block h-28" style={{ background: `linear-gradient(135deg, ${template.canvas}, ${template.accent})` }} />
            <span className="block p-4">
              <span className="flex items-center justify-between gap-3 text-base font-bold text-foreground">
                {template.label}
                {currentStyle === key && <span className="rounded-md bg-accent/10 px-2 py-1 text-xs text-accent">Active</span>}
              </span>
              <span className="mt-2 block text-sm leading-6 text-muted-foreground">{template.description}</span>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-accent">Use this style <ArrowUpRight className="size-4" /></span>
            </span>
          </Link>
        ))}
        </div>
      </section>
    </div>
  );
}

function LeadsPanel({ data }: { data: DashboardData }) {
  const leads = [
    { name: "Thabo M.", request: "AC repair quote", source: "Contact form", channel: data.client.phone ? "Phone" : "Form", time: "12 min ago", status: "New" },
    { name: "Nadia K.", request: "Maintenance plan", source: "Homepage CTA", channel: "WhatsApp", time: "Today", status: "Contacted" },
    { name: "Blue Ridge Offices", request: "Commercial install", source: "Services page", channel: "Email", time: "Yesterday", status: "Qualified" },
    { name: "Ruan P.", request: "Emergency call-out", source: "Mobile click", channel: "Call", time: "2 days ago", status: "Won" }
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-[24px] border border-white/74 bg-white/72 p-6 shadow-[0_22px_60px_rgba(15,23,42,0.08)] ring-1 ring-white/70 backdrop-blur-2xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <PanelTitle title="Leads" subtitle="Captured enquiries, click-to-call activity, and follow-up status for this website." />
          <StatusPill tone="good" icon={Users} label="36 demo enquiries" />
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <MetricCard title="New leads" value="08" change="Needs reply" changeType="positive" icon={Users} />
          <MetricCard title="Response SLA" value="18m" change="Median" changeType="positive" icon={Clock} />
          <MetricCard title="Lead quality" value="72%" change="Qualified" changeType="positive" icon={Gauge} />
          <MetricCard title="Top channel" value="Google" change="52%" changeType="neutral" icon={Globe2} />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="overflow-hidden rounded-[24px] border border-white/74 bg-white/72 shadow-[0_22px_60px_rgba(15,23,42,0.08)] ring-1 ring-white/70 backdrop-blur-2xl">
          <div className="border-b border-white/70 p-5">
            <PanelTitle title="Lead inbox" subtitle="Prioritise fast replies and keep every enquiry accountable." />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead className="bg-secondary text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                <tr><th className="px-5 py-3">Lead</th><th className="px-5 py-3">Source</th><th className="px-5 py-3">Channel</th><th className="px-5 py-3">Time</th><th className="px-5 py-3">Status</th></tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={`${lead.name}-${lead.request}`} className="border-t border-border bg-white/40 transition hover:bg-white/74">
                    <td className="px-5 py-4">
                      <span className="block font-semibold text-foreground">{lead.name}</span>
                      <span className="text-xs text-muted-foreground">{lead.request}</span>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">{lead.source}</td>
                    <td className="px-5 py-4 text-muted-foreground">{lead.channel}</td>
                    <td className="px-5 py-4 text-muted-foreground">{lead.time}</td>
                    <td className="px-5 py-4">
                      <span className={cn("rounded-full px-2.5 py-1 text-xs font-bold", lead.status === "New" ? "bg-blue-50 text-blue-700" : lead.status === "Won" ? "bg-emerald-50 text-emerald-700" : "bg-secondary text-muted-foreground")}>{lead.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <aside className="rounded-[24px] border border-white/74 bg-white/72 p-6 shadow-[0_22px_60px_rgba(15,23,42,0.08)] ring-1 ring-white/70 backdrop-blur-2xl">
          <PanelTitle title="Follow-up playbook" subtitle="The next actions that protect conversion." />
          <div className="mt-5 space-y-3">
            <ActionLink icon={SendHorizontal} title="Reply to new enquiries" copy="Use the fastest available channel first." value="8" href={`mailto:${data.client.email ?? "hello@siterent.local"}?subject=New website enquiries`} external />
            <ActionLink icon={Database} title="Export lead records" copy="Download form and upload history." value="CSV" href="/dashboard?section=database" />
            <ActionLink icon={RadioTower} title="Connect tracking" copy="Attribute enquiries to campaigns." value="Setup" href="/dashboard?section=traffic" />
          </div>
        </aside>
      </section>
    </div>
  );
}

function SettingsPanel({ data }: { data: DashboardData }) {
  const [activeTab, setActiveTab] = useState<"profile" | "business" | "domain" | "connections" | "billing" | "email" | "notifications">("billing");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const connectedCount = [data.client.ga_measurement_id, data.client.pixel_id, data.client.google_place_id, data.client.custom_domain].filter(Boolean).length;
  const tabs = [
    { id: "profile", label: "Profile" },
    { id: "business", label: "Business" },
    { id: "domain", label: "Domain" },
    { id: "connections", label: "Connections" },
    { id: "billing", label: "Billings" },
    { id: "email", label: "Email" },
    { id: "notifications", label: "Notifications" }
  ] as const;
  const invoices = [
    { invoice: "Website subscription", date: "Jun 01, 2026", amount: "R499", status: "Pending", tracking: "SR-2026-0601" },
    { invoice: "Launch setup", date: "May 24, 2026", amount: "R1,050", status: "Paid", tracking: "SR-2026-0524" },
    { invoice: "Domain assistance", date: "May 12, 2026", amount: "R250", status: "Refund", tracking: "SR-2026-0512" }
  ];

  async function onSaveSettings(formData: FormData) {
    setStatus("saving");
    const payload: Record<string, FormDataEntryValue | string> = { clientId: data.client.id };
    for (const key of ["businessName", "tagline", "phone", "whatsapp", "email", "primaryCity", "address", "customDomain", "gaMeasurementId", "pixelId", "googlePlaceId"]) {
      const value = formData.get(key);
      if (value !== null) payload[key] = value;
    }

    const response = await fetch("/api/dashboard/client", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    setStatus(response.ok ? "saved" : "error");
  }

  return (
    <section className="grid h-[calc(100vh-5rem)] grid-rows-[auto_auto_minmax(0,1fr)] overflow-hidden border border-[#e5e7eb] bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
      <div className="border-b border-[#e5e7eb] px-8 py-5">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Settings</h2>
        <p className="mt-1 text-sm text-muted-foreground">Manage account, website, domain, tracking, and billing without leaving this fixed workspace.</p>
      </div>

      <div className="px-8 pt-4">
        <div className="grid grid-cols-2 rounded-sm bg-[#fbfbfc] text-sm text-muted-foreground md:grid-cols-4 xl:grid-cols-7">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn("border-b px-4 py-4 text-center font-medium transition hover:bg-white hover:text-foreground", activeTab === tab.id ? "border-foreground bg-white text-foreground shadow-sm" : "border-transparent")}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <form action={onSaveSettings} className="min-h-0 overflow-hidden px-8 py-5">
        {activeTab === "profile" && (
          <SettingsSection title="Profile" subtitle="Basic workspace owner details.">
            <SettingsInput name="businessName" label="Display name" defaultValue={data.client.business_name ?? data.client.trading_name ?? ""} />
            <SettingsInput name="email" label="Account email" defaultValue={data.client.email ?? ""} />
            <SettingsInput name="phone" label="Phone number" defaultValue={data.client.phone ?? ""} />
            <SettingsInput name="whatsapp" label="WhatsApp number" defaultValue={data.client.whatsapp ?? ""} />
          </SettingsSection>
        )}

        {activeTab === "business" && (
          <SettingsSection title="Business Information" subtitle="Public details used by the generated website.">
            <SettingsInput name="businessName" label="Business name" defaultValue={data.client.business_name ?? ""} />
            <SettingsInput name="tagline" label="Tagline" defaultValue={data.client.tagline ?? ""} wide />
            <SettingsInput name="primaryCity" label="Primary city" defaultValue={data.client.primary_city ?? ""} />
            <SettingsInput name="address" label="Address" defaultValue={data.client.address ?? ""} wide />
          </SettingsSection>
        )}

        {activeTab === "domain" && (
          <SettingsSection title="Domain Settings" subtitle="Website-specific domain configuration.">
            <SettingsInput name="customDomain" label="Custom domain" defaultValue={data.client.custom_domain ?? ""} />
            <ReadOnlySetting label="SiteRent subdomain" value={`${data.client.subdomain ?? "website"}.siterent.co.za`} />
            <ReadOnlySetting label="SSL status" value={data.client.site_published ? "Active" : "Pending publish"} />
            <ReadOnlySetting label="Provider connection" value={data.client.custom_domain ? "Connected" : "Not connected"} />
            <div className="md:col-span-2">
              <SettingsMiniTable rows={[["A", "@", "76.76.21.21"], ["CNAME", "www", `${data.client.subdomain ?? "website"}.siterent.co.za`], ["TXT", "_siterent", "verify-site-owner"]]} />
            </div>
          </SettingsSection>
        )}

        {activeTab === "connections" && (
          <SettingsSection title="Connections" subtitle="Tracking, reviews, domain providers, and external services.">
            <SettingsInput name="gaMeasurementId" label="GA4 measurement ID" defaultValue={data.client.ga_measurement_id ?? ""} />
            <SettingsInput name="pixelId" label="Meta Pixel ID" defaultValue={data.client.pixel_id ?? ""} />
            <SettingsInput name="googlePlaceId" label="Google Place ID" defaultValue={data.client.google_place_id ?? ""} />
            <ReadOnlySetting label="Domain providers" value="Cloudflare, GoDaddy, Namecheap ready" />
            <ReadOnlySetting label="Connection health" value={`${connectedCount}/4 connected`} wide />
          </SettingsSection>
        )}

        {activeTab === "billing" && (
          <div className="space-y-6">
            <div className="border-b border-[#e5e7eb] pb-6">
              <h3 className="text-lg font-semibold text-foreground">Payment Method</h3>
              <p className="mt-1 text-sm text-muted-foreground">Update your billing details and address.</p>
            </div>
            <div className="grid gap-5 border-b border-[#e5e7eb] pb-5 lg:grid-cols-[280px_1fr]">
              <div>
                <h4 className="font-semibold text-foreground">Card Details</h4>
                <p className="mt-1 text-sm text-muted-foreground">Subscription status: {data.client.subscription_status.replace(/_/g, " ")}.</p>
                <button type="button" className="mt-5 inline-flex items-center gap-2 rounded-md bg-[#f5f7f9] px-4 py-3 text-sm font-medium text-foreground transition hover:bg-[#eef2f6]">
                  <Plus className="size-4" />
                  Add another card
                </button>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <SettingsInput name="cardName" label="Name on your Card" defaultValue={data.client.business_name ?? "SiteRent Customer"} />
                <SettingsInput name="expiry" label="Expiry" defaultValue="02 / 2028" />
                <SettingsInput name="cardNumber" label="Card Number" defaultValue="8269 9620 9292 2538" />
                <SettingsInput name="cvv" label="CVV" defaultValue="****" />
              </div>
            </div>
            <div className="grid gap-5 border-b border-[#e5e7eb] pb-5 lg:grid-cols-[280px_1fr]">
              <div>
                <h4 className="font-semibold text-foreground">Contact email</h4>
                <p className="mt-1 text-sm text-muted-foreground">Where should invoices be sent?</p>
              </div>
              <div className="space-y-4">
                <label className="flex items-start gap-3 text-sm text-foreground">
                  <input type="radio" defaultChecked className="mt-1" name="invoiceEmail" />
                  <span><span className="block font-medium">Send to the existing email</span><span className="text-muted-foreground">{data.client.email ?? "billing@siterent.local"}</span></span>
                </label>
                <label className="flex items-center gap-3 text-sm text-foreground">
                  <input type="radio" name="invoiceEmail" />
                  Add another email address
                </label>
              </div>
            </div>
            <SettingsBillingHistory invoices={invoices} />
          </div>
        )}

        {activeTab === "email" && (
          <SettingsSection title="Email" subtitle="Routing for invoices, lead alerts, and support updates.">
            <SettingsInput name="email" label="Primary email" defaultValue={data.client.email ?? ""} />
            <ReadOnlySetting label="Lead alerts" value="Enabled for form submissions" />
            <ReadOnlySetting label="Invoice emails" value="Sent monthly when billing is active" />
            <ReadOnlySetting label="Support updates" value="Enabled" />
          </SettingsSection>
        )}

        {activeTab === "notifications" && (
          <SettingsSection title="Notifications" subtitle="Choose which operational updates matter.">
            <SettingsToggle label="New lead captured" enabled />
            <SettingsToggle label="Website publish completed" enabled />
            <SettingsToggle label="Domain requires attention" enabled />
            <SettingsToggle label="Weekly analytics summary" enabled={false} />
          </SettingsSection>
        )}

        {activeTab !== "billing" && activeTab !== "domain" && activeTab !== "notifications" && (
          <div className="mt-6 flex items-center gap-3">
            <button type="submit" className="rounded-md bg-foreground px-5 py-3 text-sm font-semibold text-white transition hover:bg-black">
              {status === "saving" ? "Saving" : status === "saved" ? "Saved" : "Save changes"}
            </button>
            {status === "error" && <p className="text-sm font-semibold text-destructive">Could not save settings.</p>}
          </div>
        )}
      </form>
    </section>
  );
}

function SettingsSection({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="grid gap-5 border-b border-[#e5e7eb] pb-5 lg:grid-cols-[280px_1fr]">
      <div>
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{subtitle}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {children}
      </div>
    </div>
  );
}

function SettingsInput({ name, label, defaultValue, wide }: { name: string; label: string; defaultValue: string; wide?: boolean }) {
  return (
    <label className={cn("block text-sm font-medium text-foreground", wide && "md:col-span-2")}>
      {label}
      <input name={name} defaultValue={defaultValue} className="mt-2 h-12 w-full rounded-md border border-[#d9dee5] bg-white px-4 text-sm text-foreground outline-none transition focus:border-[#111827] focus:ring-2 focus:ring-[#111827]/10" />
    </label>
  );
}

function ReadOnlySetting({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={cn("rounded-md border border-[#e5e7eb] bg-[#fbfbfc] p-4", wide && "md:col-span-2")}>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function SettingsMiniTable({ rows }: { rows: string[][] }) {
  return (
    <div className="overflow-hidden rounded-md border border-[#e5e7eb]">
      <table className="w-full text-left text-sm">
        <tbody>
          {rows.map((row) => (
            <tr key={row.join("-")} className="border-b border-[#e5e7eb] last:border-b-0">
              {row.map((cell) => <td key={cell} className="px-4 py-3 text-muted-foreground first:font-semibold first:text-foreground">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SettingsBillingHistory({ invoices }: { invoices: { invoice: string; date: string; amount: string; status: string; tracking: string }[] }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-foreground">Billing History</h3>
      <p className="mt-1 text-sm text-muted-foreground">See the transactions you made.</p>
      <div className="mt-5 overflow-hidden rounded-md border border-[#e5e7eb]">
        <table className="w-full min-w-[780px] text-left text-sm">
          <thead className="bg-[#f5f7f9] text-muted-foreground">
            <tr>
              <th className="px-5 py-4 font-medium">Invoice</th>
              <th className="px-5 py-4 font-medium">Date</th>
              <th className="px-5 py-4 font-medium">Amount</th>
              <th className="px-5 py-4 font-medium">Status</th>
              <th className="px-5 py-4 font-medium">Tracking & Address</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.tracking} className="border-t border-[#e5e7eb]">
                <td className="px-5 py-4 font-medium text-foreground">{invoice.invoice}</td>
                <td className="px-5 py-4 text-muted-foreground">{invoice.date}</td>
                <td className="px-5 py-4 text-muted-foreground">{invoice.amount}</td>
                <td className="px-5 py-4">
                  <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", invoice.status === "Paid" && "bg-emerald-50 text-emerald-700", invoice.status === "Pending" && "bg-amber-50 text-amber-700", invoice.status === "Refund" && "bg-blue-50 text-blue-700")}>{invoice.status}</span>
                </td>
                <td className="px-5 py-4"><span className="block font-semibold text-blue-700">{invoice.tracking}</span><span className="text-xs text-muted-foreground">SiteRent billing account</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SettingsToggle({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-[#e5e7eb] bg-[#fbfbfc] p-4">
      <span className="text-sm font-semibold text-foreground">{label}</span>
      <span className={cn("h-6 w-11 rounded-full p-1 transition", enabled ? "bg-blue-600" : "bg-slate-300")}>
        <span className={cn("block size-4 rounded-full bg-white transition", enabled && "translate-x-5")} />
      </span>
    </div>
  );
}

function TrafficPanel({ data }: { data: DashboardData }) {
  const tracked = Boolean(data.client.ga_measurement_id || data.client.pixel_id);
  return (
    <div className="space-y-6">
      <section className="rounded-[24px] border border-white/74 bg-white/72 p-6 shadow-[0_22px_60px_rgba(15,23,42,0.08)] ring-1 ring-white/70 backdrop-blur-2xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <PanelTitle title="Traffic and leads" subtitle="Connect tracking, then monitor the channels that generate enquiries." />
          <StatusPill tone={tracked ? "good" : "warn"} icon={RadioTower} label={tracked ? "Tracking live" : "Tracking needed"} />
        </div>
      </section>
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard title="Visits" value={tracked ? "1,248" : "0"} change={tracked ? "+22%" : "Connect"} changeType={tracked ? "positive" : "neutral"} icon={Users} />
        <MetricCard title="Leads" value={tracked ? "36" : "0"} change={tracked ? "+8" : "Pending"} changeType={tracked ? "positive" : "neutral"} icon={TrendingUp} />
        <MetricCard title="Source Health" value={tracked ? "Live" : "Missing"} change={tracked ? "GA/Pixel" : "Setup"} changeType={tracked ? "positive" : "negative"} icon={BarChart3} />
      </div>
      <TrackingSettingsForm client={data.client} mode="facebook" />
    </div>
  );
}

function ReviewsPanel({ data }: { data: DashboardData }) {
  return (
    <section className="rounded-[24px] border border-white/74 bg-white/72 p-6 shadow-[0_22px_60px_rgba(15,23,42,0.08)] ring-1 ring-white/70 backdrop-blur-2xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PanelTitle title="Reviews and trust" subtitle="Connect Google review identity and track social proof readiness." />
        <StatusPill tone={data.client.google_place_id ? "good" : "warn"} icon={Star} label={data.client.google_place_id ? "Connected" : "Needs Place ID"} />
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <Info label="Google Place ID" value={data.client.google_place_id ? "Connected" : "Missing"} />
        <Info label="Review CTA" value={data.client.google_place_id ? "Enabled" : "Draft"} />
        <Info label="Social proof" value={data.client.site_published ? "Visible" : "Hidden"} />
      </div>
      <div className="mt-5 rounded-2xl border border-white/70 bg-white/62 p-4">
        <p className="text-sm font-semibold text-foreground">Recommended trust stack</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Show review rating near the hero, add recent project proof, and keep the contact CTA visible after the first scroll.</p>
      </div>
    </section>
  );
}

function SupportPanel({ displayName }: { displayName: string }) {
  return (
    <section className="rounded-[24px] border border-white/74 bg-white/72 p-6 shadow-[0_22px_60px_rgba(15,23,42,0.08)] ring-1 ring-white/70 backdrop-blur-2xl">
      <PanelTitle title="Support center" subtitle="Get help with publishing, billing, domains, and change requests." />
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <Info label="Workspace" value={displayName} />
        <Info label="Support SLA" value="1 business day" />
        <Info label="Escalation" value="Publishing issues first" />
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <ActionLink icon={Globe2} title="Domain or publish issue" copy="Use this for DNS, live site, and deploy problems." value="Priority" href="mailto:support@siterent.local?subject=Publishing support" external />
        <ActionLink icon={CreditCard} title="Billing question" copy="Subscription, failed payment, or plan changes." value="Billing" href="mailto:support@siterent.local?subject=Billing support" external />
      </div>
    </section>
  );
}

function OpsRail({ data }: { data: DashboardData }) {
  const readiness = [
    { label: "Profile", value: data.client.business_name || data.client.trading_name ? 100 : 35 },
    { label: "Assets", value: Math.min(data.client.gallery_photos.length * 18, 100) },
    { label: "Tracking", value: data.client.ga_measurement_id || data.client.pixel_id ? 100 : 20 },
    { label: "Billing", value: data.client.subscription_status === "active" ? 100 : 40 }
  ];

  return (
    <aside className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <PanelTitle title="Ops Rail" subtitle="Control-center readiness" />
        <Gauge className="size-5 text-accent" />
      </div>
      <div className="mt-5 space-y-4">
        {readiness.map((item) => (
          <div key={item.label}>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">{item.label}</span>
              <span className="font-bold text-muted-foreground">{item.value}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full bg-accent" style={{ width: `${Math.max(item.value, 8)}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-lg border border-border bg-[#fafafa] p-4">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Next best action</p>
        <p className="mt-2 text-sm font-semibold text-foreground">
          {data.client.site_published ? "Review traffic and publish fresh project proof." : "Complete publishing setup and deploy the first site version."}
        </p>
      </div>
    </aside>
  );
}

function StatusPill({ icon: Icon, label, tone }: { icon: LucideIcon; label: string; tone: "good" | "warn" | "neutral" }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs font-bold capitalize",
      tone === "good" && "border-success/30 bg-success/10 text-success",
      tone === "warn" && "border-warning/30 bg-warning/10 text-warning",
      tone === "neutral" && "border-border bg-secondary text-muted-foreground"
    )}>
      <Icon className="size-3.5" />
      {label}
    </span>
  );
}

function ControlStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-secondary/70 p-3">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-2 truncate text-sm font-bold text-foreground">{value}</p>
    </div>
  );
}

function TelemetryLine({ label, value, good }: { label: string; value: string; good?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-b-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={cn("inline-flex items-center gap-2 text-sm font-bold", good ? "text-success" : "text-warning")}>
        <span className={cn("size-2 rounded-full", good ? "bg-success" : "bg-warning")} />
        {value}
      </span>
    </div>
  );
}

function TemplatePreview() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white text-[#101820]">
      <div className="bg-[#0a3d74] text-white">
        <div className="flex items-center justify-between border-b border-white/15 px-5 py-3 text-xs font-bold">
          <span>Cape Climate Pros</span>
          <span className="rounded-md bg-[#ff5b18] px-3 py-1">Book service</span>
        </div>
        <div className="grid min-h-[300px] gap-4 p-5 md:grid-cols-[1fr_0.75fr]">
          <div className="self-center">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/70">Perfect temperature, every time</p>
            <h3 className="mt-3 max-w-sm text-4xl font-black leading-tight">Your trusted HVAC experts keeping you comfortable</h3>
            <p className="mt-4 text-sm leading-6 text-white/75">Fast air-conditioning repairs, installs, and maintenance.</p>
            <div className="mt-5 flex gap-2">
              <span className="rounded-md bg-[#ff5b18] px-4 py-2 text-xs font-bold">Schedule service</span>
              <span className="rounded-md border border-white/60 px-4 py-2 text-xs font-bold">Learn more</span>
            </div>
          </div>
          <div className="relative min-h-[240px] overflow-hidden rounded-lg bg-[linear-gradient(135deg,#d7eaff,#4f83dc)]">
            <div className="absolute inset-x-4 bottom-4 rounded-lg bg-white p-4 text-[#101820] shadow-xl">
              <div className="flex items-center justify-between">
                <span className="font-black">5.0 rating</span>
                <Star className="size-4 fill-[#ff5b18] text-[#ff5b18]" />
              </div>
              <p className="mt-1 text-xs text-[#5c6670]">Best over 15.7k reviews</p>
            </div>
          </div>
        </div>
      </div>
      <div className="grid gap-4 p-5 md:grid-cols-3">
        {["Consultation", "Custom plan", "Installation"].map((item, index) => (
          <div key={item} className="rounded-lg bg-[#f5f7fb] p-4">
            <span className="text-xs font-black text-[#ff5b18]">0{index + 1}</span>
            <p className="mt-2 text-sm font-black">{item}</p>
            <p className="mt-1 text-xs leading-5 text-[#5c6670]">Clean, conversion-focused website section.</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function MetricCard({ title, value, change, changeType, icon: Icon }: { title: string; value: string; change: string; changeType: "positive" | "negative" | "neutral"; icon: LucideIcon }) {
  return (
    <article className="micro-card group relative overflow-hidden rounded-[24px] border border-white/74 bg-white/62 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.08)] ring-1 ring-white/70 backdrop-blur-2xl transition duration-300 hover:bg-white/72">
      <div className="relative">
        <div className="mb-3 flex items-start justify-between">
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
          <div className="flex size-10 items-center justify-center rounded-2xl bg-white/72 shadow-sm backdrop-blur-xl transition-colors duration-300 group-hover:bg-accent/10">
            <Icon className="size-4 text-muted-foreground transition-colors duration-300 group-hover:text-accent" />
          </div>
        </div>
        <div className="flex items-end gap-3">
          <span className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">{value}</span>
          <span className={cn("mb-1 flex items-center gap-1 text-sm font-medium", changeType === "positive" && "text-success", changeType === "negative" && "text-destructive", changeType === "neutral" && "text-muted-foreground")}>
            {changeType === "positive" && <TrendingUp className="size-3.5" />}
            {changeType === "negative" && <TrendingDown className="size-3.5" />}
            {change}
          </span>
        </div>
      </div>
    </article>
  );
}

function RevenuePanel() {
  const values = [38, 46, 43, 58, 52, 66, 74, 69, 78, 86, 82, 94];
  return (
    <section className="h-[380px] rounded-[24px] border border-white/74 bg-white/62 p-5 shadow-[0_22px_60px_rgba(15,23,42,0.08)] ring-1 ring-white/70 backdrop-blur-2xl lg:col-span-2">
      <PanelTitle title="Website Revenue Trend" subtitle="Subscription and conversion performance" />
      <div className="mt-6 flex h-[280px] items-end gap-3 border-b border-l border-border/70 px-2 pb-2">
        {values.map((value, index) => (
          <div key={`${value}-${index}`} className="flex h-full flex-1 items-end gap-1">
            <div className="w-full rounded-t-md bg-chart-1/70" style={{ height: `${value}%` }} />
            <div className="hidden w-full rounded-t-md bg-chart-2/50 sm:block" style={{ height: `${Math.max(value - 8, 18)}%` }} />
          </div>
        ))}
      </div>
    </section>
  );
}

function LaunchPanel({ profileReady, photos, trackingReady, published }: { profileReady: boolean; photos: number; trackingReady: boolean; published: boolean }) {
  const stages = [
    { name: "Profile", value: profileReady ? 100 : 35, count: profileReady ? 1 : 0, color: "bg-chart-1" },
    { name: "Photos", value: Math.min(photos * 18, 100), count: photos, color: "bg-chart-3" },
    { name: "Tracking", value: trackingReady ? 100 : 20, count: trackingReady ? 1 : 0, color: "bg-chart-2" },
    { name: "Publish", value: published ? 100 : 40, count: published ? 1 : 0, color: "bg-accent" }
  ];
  return (
    <section className="h-[380px] rounded-[24px] border border-white/74 bg-white/62 p-5 shadow-[0_22px_60px_rgba(15,23,42,0.08)] ring-1 ring-white/70 backdrop-blur-2xl">
      <PanelTitle title="Launch Pipeline" subtitle="Website readiness by setup stage" />
      <div className="mt-6 space-y-5">
        {stages.map((stage) => (
          <div key={stage.name} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">{stage.name}</span>
              <span className="font-semibold text-foreground">{stage.value}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-secondary">
              <div className={cn("h-full rounded-full", stage.color)} style={{ width: `${Math.max(stage.value, 8)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function RecentActivity({ data }: { data: DashboardData }) {
  const items = [
    { label: "Website profile", value: data.client.business_name ?? data.client.trading_name ?? "Incomplete", status: data.client.business_name ? "won" : "pending" },
    { label: "Billing", value: data.client.subscription_status.replace(/_/g, " "), status: data.client.subscription_status === "active" ? "won" : "pending" },
    { label: "Gallery", value: `${data.client.gallery_photos.length}/6 photos`, status: data.client.gallery_photos.length ? "won" : "pending" },
    { label: "Published site", value: data.client.site_published ? "Live" : "Draft", status: data.client.site_published ? "won" : "pending" }
  ] as const;
  const config = {
    won: { icon: CheckCircle2, color: "text-success", bg: "bg-success/10", label: "Ready" },
    pending: { icon: Clock, color: "text-warning", bg: "bg-warning/10", label: "Pending" },
    lost: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10", label: "Alert" }
  };

  return (
    <section className="rounded-[24px] border border-white/74 bg-white/62 p-5 shadow-[0_22px_60px_rgba(15,23,42,0.08)] ring-1 ring-white/70 backdrop-blur-2xl">
      <PanelTitle title="Recent Activity" subtitle="Latest operational movement" />
      <div className="mt-5 space-y-3">
        {items.map((item) => {
          const state = config[item.status];
          const Icon = state.icon;
          return (
            <div key={item.label} className="flex items-center justify-between rounded-lg p-3 transition hover:bg-secondary/50">
              <div>
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs capitalize text-muted-foreground">{item.value}</p>
              </div>
              <span className={cn("flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium", state.bg, state.color)}><Icon className="size-3" />{state.label}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ActionRow({ icon: Icon, title, copy, value, onClick }: { icon: LucideIcon; title: string; copy: string; value: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="group flex w-full items-center justify-between rounded-lg p-3 text-left transition hover:bg-secondary/50">
      <span className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-lg bg-secondary text-muted-foreground group-hover:bg-accent/10 group-hover:text-accent"><Icon className="size-4" /></span>
        <span><span className="block text-sm font-medium text-foreground">{title}</span><span className="block text-xs text-muted-foreground">{copy}</span></span>
      </span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </button>
  );
}

function ActionLink({ icon: Icon, title, copy, value, href, external }: { icon: LucideIcon; title: string; copy: string; value: string; href: string; external?: boolean }) {
  const props = external ? { target: "_blank", rel: "noreferrer" } : {};
  return (
    <Link href={href} {...props} className="group flex items-center justify-between rounded-lg p-3 transition hover:bg-secondary/50">
      <span className="flex min-w-0 items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground group-hover:bg-accent/10 group-hover:text-accent"><Icon className="size-4" /></span>
        <span className="min-w-0"><span className="block text-sm font-medium text-foreground">{title}</span><span className="block truncate text-xs text-muted-foreground">{copy}</span></span>
      </span>
      <span className="ml-3 text-sm font-semibold text-foreground">{value}</span>
    </Link>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-secondary p-4">
      <p className="text-sm font-semibold text-muted-foreground">{label}</p>
      <p className="mt-2 text-xl font-bold capitalize text-foreground">{value}</p>
    </div>
  );
}

function PanelTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}
