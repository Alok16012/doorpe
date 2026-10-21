import Link from "next/link";
import type { OrderStatus } from "@/lib/types";

export const field = "h-10 w-full rounded-md border border-input bg-bg px-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/15";
export const label = "mb-1 block text-xs font-semibold text-muted";

export function Card({ title, action, children, className = "", pad = true }: { title?: string; action?: React.ReactNode; children: React.ReactNode; className?: string; pad?: boolean }) {
  return (
    <section className={`rounded-xl border border-border bg-bg ${className}`}>
      {title && (
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-[15px] font-bold">{title}</h2>
          {action}
        </div>
      )}
      <div className={pad ? "p-4" : ""}>{children}</div>
    </section>
  );
}

export function Stat({ label: l, value, hint, href, tone }: { label: string; value: string; hint?: string; href?: string; tone?: "warn" | "bad" }) {
  const body = (
    <>
      <p className="text-xs font-semibold text-muted">{l}</p>
      <p className={`mt-1 text-2xl font-extrabold tabular-nums ${tone === "bad" ? "text-danger" : tone === "warn" ? "text-warning" : "text-text"}`}>{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
    </>
  );
  return href
    ? <Link href={href} className="block rounded-xl border border-border bg-bg p-4 hover:border-input">{body}</Link>
    : <div className="rounded-xl border border-border bg-bg p-4">{body}</div>;
}

const STATUS: Record<OrderStatus, [string, string]> = {
  placed: ["New", "bg-info-soft text-info"],
  packing: ["Packing", "bg-info-soft text-info"],
  packed: ["Packed", "bg-warn-soft text-warning"],
  out_for_delivery: ["On the way", "bg-warn-soft text-warning"],
  delivered: ["Delivered", "bg-success-soft text-success"],
  cancelled: ["Cancelled", "bg-surface text-muted"],
};
export function StatusBadge({ s }: { s: OrderStatus }) {
  const [t, c] = STATUS[s];
  return <span className={`inline-block whitespace-nowrap rounded-pill px-2 py-0.5 text-xs font-bold ${c}`}>{t}</span>;
}

export function Pill({ on, children }: { on: boolean; children: React.ReactNode }) {
  return <span className={`inline-block rounded-pill px-2 py-0.5 text-xs font-bold ${on ? "bg-success-soft text-success" : "bg-surface text-muted"}`}>{children}</span>;
}

export function Tabs({ items, current }: { items: { key: string; label: string; href: string; count?: number }[]; current: string }) {
  return (
    <nav className="no-scrollbar -mx-1 mb-4 flex gap-1 overflow-x-auto px-1" aria-label="Filter">
      {items.map((t) => (
        <Link key={t.key} href={t.href} aria-current={t.key === current ? "page" : undefined}
          className={`whitespace-nowrap rounded-pill border px-3 py-1.5 text-sm font-semibold ${t.key === current ? "border-accent bg-accent-soft text-accent" : "border-border bg-bg text-muted hover:border-input"}`}>
          {t.label}{t.count !== undefined && <span className="ml-1.5 text-xs opacity-80">{t.count}</span>}
        </Link>
      ))}
    </nav>
  );
}

export const th = "px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted";
export const td = "px-4 py-3 align-middle";
