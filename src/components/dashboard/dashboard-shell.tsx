"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bell,
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FilePenLine,
  Image,
  LayoutDashboard,
  LifeBuoy,
  Search,
  Settings,
  Star,
  WalletCards
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/edit", label: "Website", icon: WalletCards },
  { href: "/dashboard/photos", label: "Photos", icon: Image },
  { href: "/dashboard/traffic", label: "Traffic", icon: BarChart3 },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/reviews", label: "Reviews", icon: Star },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/support", label: "Support", icon: LifeBuoy }
];

const routeTitles: Record<string, { title: string; copy: string }> = {
  "/dashboard": { title: "Overview", copy: "Website operations, billing, and publishing health." },
  "/dashboard/edit": { title: "Website", copy: "Business details and copy." },
  "/dashboard/photos": { title: "Photos", copy: "Gallery assets and proof." },
  "/dashboard/traffic": { title: "Traffic", copy: "Visits, sources, and conversion signals." },
  "/dashboard/billing": { title: "Billing", copy: "Subscription health and payment lifecycle." },
  "/dashboard/reviews": { title: "Reviews", copy: "Google review setup and social proof." },
  "/dashboard/settings": { title: "Settings", copy: "Tracking IDs and workspace metadata." },
  "/dashboard/support": { title: "Support", copy: "Operational support and escalation." }
};

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const current = routeTitles[pathname] ?? routeTitles["/dashboard"];
  const [collapsed, setCollapsed] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 ease-out",
          collapsed ? "w-[72px]" : "w-[260px]"
        )}
      >
        <div className="flex h-16 items-center border-b border-sidebar-border px-4">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white">
              <Building2 className="size-5 text-[#15161b]" />
            </div>
            <span
              className={cn(
                "whitespace-nowrap text-lg font-semibold text-sidebar-foreground transition-all duration-300",
                collapsed ? "w-0 overflow-hidden opacity-0" : "w-auto opacity-100"
              )}
            >
              SiteRent
            </span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 overflow-hidden px-3 py-4">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-sidebar-accent text-sidebar-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <span
                  className={cn(
                    "absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-success transition-all duration-300",
                    active ? "opacity-100" : "opacity-0"
                  )}
                />
                <item.icon className={cn("size-5 shrink-0 transition-transform duration-200", active ? "text-success" : "group-hover:scale-110")} />
                <span className={cn("whitespace-nowrap transition-all duration-300", collapsed ? "w-0 overflow-hidden opacity-0" : "opacity-100")}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all duration-200 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
          >
            {collapsed ? (
              <ChevronRight className="size-5" />
            ) : (
              <>
                <ChevronLeft className="size-5" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>

      <div className={cn("flex min-h-screen flex-col transition-all duration-300 ease-out", collapsed ? "ml-[72px]" : "ml-[260px]")}>
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-sm">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-semibold text-foreground">{current.title}</h1>
            <div className="hidden items-center gap-2 text-sm text-muted-foreground md:flex">
              <Calendar className="size-4" />
              <span>{current.copy}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className={cn("relative hidden items-center transition-all duration-300 md:flex", searchFocused ? "w-64" : "w-48")}>
              <Search className="pointer-events-none absolute left-3 size-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="h-9 w-full rounded-lg border border-border bg-secondary py-0 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:border-success focus:outline-none focus:ring-2 focus:ring-success/20"
              />
            </div>
            <Link href="/dashboard/edit" className="hidden h-9 items-center gap-2 rounded-lg bg-secondary px-3 text-sm font-medium text-foreground transition hover:bg-sidebar-accent md:inline-flex">
              <FilePenLine size={16} />
              Quick edit
            </Link>
            <button className="relative flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-all duration-200 hover:bg-secondary hover:text-foreground">
              <Bell className="size-5" />
              <span className="absolute right-1.5 top-1.5 size-2 animate-pulse rounded-full bg-success" />
            </button>
            <Link href="/onboarding" className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-success/80 to-[#5ca7ff] text-xs font-semibold text-[#101216] transition hover:ring-2 hover:ring-success/50">
              SR
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">{children}</div>
        </main>
      </div>
    </main>
  );
}
