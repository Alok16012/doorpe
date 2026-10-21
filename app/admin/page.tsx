import Link from "next/link";
import { dashboardStats } from "@/lib/admin";
import { inr } from "@/lib/money";
import { PageHead } from "@/components/admin/AdminShell";
import { Card, Stat, StatusBadge } from "@/components/admin/ui";
import { OrdersChart } from "@/components/admin/OrdersChart";

export const metadata = { title: "Dashboard" };

export default async function Dashboard() {
  const s = await dashboardStats();
  return (
    <>
      <PageHead title="Dashboard" sub="Today across all stores (IST)" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Orders today" value={String(s.ordersToday)} hint={s.cancelledToday ? `${s.cancelledToday} cancelled` : "No cancellations"} href="/admin/orders" />
        <Stat label="Revenue today" value={inr(s.revenueToday)} hint={`Avg order ${inr(s.aovToday)}`} />
        <Stat label="Live orders" value={String(s.liveCount)} hint="Not yet delivered" href="/admin/live" />
        <Stat label="Open complaints" value={String(s.openIssues)} hint={`${s.customers} customers`} href="/admin/issues" tone={s.openIssues ? "warn" : undefined} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card title="Orders, last 7 days"><OrdersChart days={s.days} /></Card>
        <Card title="Live orders" action={<Link href="/admin/live" className="text-sm font-semibold text-accent">Open board</Link>} pad={false}>
          {s.live.length === 0 ? <p className="p-6 text-center text-sm text-muted">No live orders right now.</p> : (
            <ul className="divide-y divide-border">
              {s.live.map((o) => (
                <li key={o.id}>
                  <Link href={`/admin/orders/${o.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-surface">
                    <span className="flex-1 text-sm"><b>#{o.code}</b> <span className="text-muted">· {o.items.reduce((n, i) => n + i.qty, 0)} items · {inr(o.grandTotal)}</span></span>
                    <StatusBadge s={o.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card className="mt-4" title={`Low stock (${s.lowCount})`} action={<Link href="/admin/inventory?low=1" className="text-sm font-semibold text-accent">Restock</Link>} pad={false}>
        {s.low.length === 0 ? <p className="p-6 text-center text-sm text-muted">Everything is well stocked.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-border">
                {s.low.map((r) => (
                  <tr key={r.storeId + r.variantId}>
                    <td className="px-4 py-2.5 font-semibold">{r.name} <span className="font-normal text-muted">· {r.unit}</span></td>
                    <td className="px-4 py-2.5 text-muted">{r.store}</td>
                    <td className={`px-4 py-2.5 text-right font-bold tabular-nums ${r.stock === 0 ? "text-danger" : "text-warning"}`}>{r.stock === 0 ? "Sold out" : `${r.stock} left`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
