"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Boxes, ChartNoAxesColumn, ClipboardList, ExternalLink, FolderTree, LayoutDashboard, Menu, MessageSquareWarning,
  Package, Settings, Store, TicketPercent, Users, X, Columns3, Bike,
} from "lucide-react";
import { Logo } from "../shop/Logo";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/live", label: "Live board", icon: Columns3 },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes },
  { href: "/admin/stores", label: "Stores", icon: Store },
  { href: "/admin/riders", label: "Riders", icon: Bike },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/coupons", label: "Coupons", icon: TicketPercent },
  { href: "/admin/issues", label: "Complaints", icon: MessageSquareWarning, badge: true },
  { href: "/admin/reports", label: "Reports", icon: ChartNoAxesColumn },
  { href: "/admin/settings", label: "Fees & settings", icon: Settings },
];

function Nav({ openIssues, onNavigate }: { openIssues: number; onNavigate?: () => void }) {
  const path = usePathname();
  return (
    <nav aria-label="Admin" className="flex-1 overflow-y-auto px-3 py-2">
      <ul className="space-y-0.5">
        {NAV.map(({ href, label, icon: I, exact, badge }) => {
          const active = exact ? path === href : path.startsWith(href);
          return (
            <li key={href}>
              <Link href={href} onClick={onNavigate} aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold ${active ? "bg-accent-soft text-accent" : "text-text hover:bg-surface"}`}>
                <I size={18} aria-hidden />
                <span className="flex-1">{label}</span>
                {badge && openIssues > 0 && <span className="rounded-pill bg-danger px-1.5 text-[11px] font-bold text-white">{openIssues}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function AdminShell({ children, user, openIssues }: { children: React.ReactNode; user: { name: string; phone: string }; openIssues: number }) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  useEffect(() => setOpen(false), [path]);
  const foot = (
    <div className="border-t border-border p-3">
      <Link href="/" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-muted hover:bg-surface"><ExternalLink size={16} /> View store</Link>
      <p className="px-3 pt-2 text-xs text-muted">{user.name} · +91 {user.phone}</p>
    </div>
  );
  return (
    <div className="min-h-dvh bg-surface">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-border bg-bg lg:flex">
        <div className="flex h-16 items-center gap-2 px-5"><Logo size="sm" /><span className="text-sm font-bold text-muted">Admin</span></div>
        <Nav openIssues={openIssues} />
        {foot}
      </aside>
      <header style={{ paddingTop: "env(safe-area-inset-top)" }} className="sticky top-0 z-30 flex min-h-14 items-center gap-3 border-b border-border bg-bg px-3 lg:hidden">
        <button onClick={() => setOpen(true)} aria-label="Open menu" className="grid size-10 place-items-center rounded-md hover:bg-surface"><Menu size={22} /></button>
        <Logo size="sm" /><span className="text-sm font-bold text-muted">Admin</span>
      </header>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button className="absolute inset-0 bg-black/40" aria-label="Close menu" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-bg animate-fade-in">
            <div className="flex h-14 items-center justify-between px-4"><Logo size="sm" /><button onClick={() => setOpen(false)} aria-label="Close menu" className="grid size-9 place-items-center rounded-md hover:bg-surface"><X size={20} /></button></div>
            <Nav openIssues={openIssues} onNavigate={() => setOpen(false)} />
            {foot}
          </aside>
        </div>
      )}
      <main className="lg:pl-60"><div className="mx-auto max-w-[1200px] p-4 md:p-6">{children}</div></main>
    </div>
  );
}

export function PageHead({ title, sub, actions }: { title: string; sub?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-xl font-extrabold text-text md:text-2xl">{title}</h1>
        {sub && <p className="mt-0.5 text-sm text-muted">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
