"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CircleDollarSign,
  Gauge,
  LifeBuoy,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Package,
  PlugZap,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
  Workflow
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  count?: string;
};

const navGroups: Array<{ label: string; items: NavItem[] }> = [
  {
    label: "General",
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { label: "Payment", href: "/admin/payment", icon: CircleDollarSign },
      { label: "Customers", href: "/admin/customers", icon: Users },
      { label: "Messages", href: "/admin/messages", icon: MessageSquare }
    ]
  },
  {
    label: "Tools",
    items: [
      { label: "Templates", href: "/admin/templates", icon: Package },
      { label: "Invoices", href: "/admin/invoices", icon: CircleDollarSign },
      { label: "Analytics", href: "/admin/analytics", icon: Gauge },
      { label: "Integrations", href: "/admin/integrations", icon: PlugZap },
      { label: "Automation", href: "/admin/automation", icon: Workflow, badge: "Beta" }
    ]
  },
  {
    label: "Support",
    items: [
      { label: "Settings", href: "/admin/settings", icon: Settings },
      { label: "Security", href: "/admin/security", icon: ShieldCheck },
      { label: "Tutorial", href: "/tutorial", icon: LifeBuoy },
      { label: "Help", href: "/admin/help", icon: LifeBuoy }
    ]
  }
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <main className="min-h-screen w-full bg-[linear-gradient(180deg,#f8f5ef_0%,#f4efe8_100%)] text-ink">
      <div className="grid min-h-screen w-full lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="border-b border-admin-line-soft bg-white/90 p-5 backdrop-blur lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r lg:border-admin-line-soft lg:p-6">
          <div className="flex items-center gap-3 rounded-[22px] border border-admin-line-soft bg-admin-surface px-4 py-3 shadow-[0_10px_24px_rgba(17,17,17,0.04)]">
            <div className="grid size-11 place-items-center rounded-2xl bg-[#111111] text-white">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="text-sm font-black tracking-[0.18em] uppercase text-[#8a8176]">SiteRent</p>
              <p className="text-base font-black text-ink">Admin OS</p>
            </div>
          </div>

          <nav className="mt-6 grid gap-6">
            {navGroups.map((group) => (
              <div key={group.label}>
                <p className="mb-2 px-2 text-[10px] font-black uppercase tracking-[0.24em] text-[#9a8e81]">{group.label}</p>
                <div className="grid gap-1.5">
                  {group.items.map((item) => {
                    const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex min-h-12 items-center justify-between gap-3 rounded-[18px] border px-3 py-2.5 transition",
                          active
                            ? "border-ink bg-ink text-white shadow-[0_14px_28px_rgba(17,17,17,0.16)]"
                            : "border-transparent bg-transparent text-[#5f574d] hover:border-[#e4dbcf] hover:bg-admin-surface hover:text-ink"
                        )}
                      >
                        <span className="flex items-center gap-3">
                          <span className={cn("grid size-8 place-items-center rounded-xl", active ? "bg-white/10" : "bg-[#f4efe7]") }>
                            <item.icon size={15} className={active ? "text-white" : "text-[#7d7267]"} />
                          </span>
                          <span className="text-sm font-black">{item.label}</span>
                        </span>
                        {item.count && <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-black", active ? "bg-white/10 text-white" : "bg-[#f2ebe1] text-[#7d7267]")}>{item.count}</span>}
                        {item.badge && <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-black", active ? "bg-white/10 text-white" : "border border-admin-line-soft bg-white text-[#7d7267]")}>{item.badge}</span>}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="mt-6 rounded-[22px] border border-admin-line-soft bg-admin-surface p-4 text-sm font-semibold text-muted shadow-[0_10px_24px_rgba(17,17,17,0.04)]">
            <div className="flex items-center gap-3 text-ink">
              <div className="grid size-9 place-items-center rounded-2xl bg-[#111111] text-white">
                <Users size={16} />
              </div>
              <div>
                <p className="text-sm font-black text-ink">Team</p>
                <p className="text-xs font-semibold text-muted">Operations</p>
              </div>
            </div>
            <Link href="/auth/signout" className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-full border border-admin-line-soft bg-white text-xs font-black transition hover:border-[#111111]">
              <LogOut size={14} />
              Sign out
            </Link>
          </div>
        </aside>

        <section className="min-w-0 px-4 py-5 md:px-6 md:py-6 xl:px-8">{children}</section>
      </div>
    </main>
  );
}
