import { reports } from "@/lib/admin";
import { inr } from "@/lib/money";
import { PageHead } from "@/components/admin/AdminShell";
import { Card, Stat } from "@/components/admin/ui";
import { OrdersChart } from "@/components/admin/OrdersChart";
import { ProductArt } from "@/components/shop/ProductArt";

export const metadata = { title: "Reports" };

/** Horizontal magnitude bar, single hue. */
function Bar({ v, max }: { v: number; max: number }) {
  return <span className="block h-2 rounded-r-[4px] bg-accent" style={{ width: `${max ? Math.max(2, (v / max) * 100) : 0}%` }} />;
}

const PAY: Record<string, string> = { upi: "UPI", card: "Card", cod: "Cash on delivery", wallet: "Wallet" };

export default async function ReportsPage() {
  const r = await reports(14);
  const catMax = Math.max(0, ...r.byCategory.map((c) => c.v));
  return (
    <>
      <PageHead title="Reports" sub="Last 14 days, excluding cancelled orders" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Revenue" value={inr(r.revenue)} hint={`${r.orders} orders`} />
        <Stat label="Average order" value={inr(r.aov)} hint={`Tips ${inr(r.tips)}`} />
        <Stat label="Avg delivery time" value={r.avgMins ? `${r.avgMins} min` : "—"} hint="Placed to delivered" />
        <Stat label="Cancelled" value={String(r.cancelled)} hint={`Discounts given ${inr(r.discounts)}`} tone={r.cancelled ? "warn" : undefined} />
      </div>
      <Card className="mt-4" title="Orders per day"><OrdersChart days={r.days} /></Card>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card title="Top products by units" pad={false} className="min-w-0">
          {r.topProducts.length === 0 ? <p className="p-6 text-center text-sm text-muted">No sales yet.</p> : (
            <ol className="divide-y divide-border">
              {r.topProducts.map((p, i) => (
                <li key={p.name} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                  <span className="w-5 text-right text-xs font-bold text-muted">{i + 1}</span>
                  <div className="w-8 shrink-0"><ProductArt icon={p.icon} size="sm" className="!p-0.5" /></div>
                  <span className="min-w-0 flex-1 truncate font-semibold">{p.name}</span>
                  <span className="shrink-0 tabular-nums text-muted">{p.units} sold</span>
                  <span className="w-20 text-right font-semibold tabular-nums">{inr(p.revenue)}</span>
                </li>
              ))}
            </ol>
          )}
        </Card>
        <div className="min-w-0 space-y-4">
          <Card title="Sales by category">
            {r.byCategory.length === 0 ? <p className="text-center text-sm text-muted">No sales yet.</p> : (
              <ul className="space-y-2.5">
                {r.byCategory.map((c) => (
                  <li key={c.name} className="grid grid-cols-[110px_1fr_72px] items-center gap-3 text-sm sm:grid-cols-[140px_1fr_80px]">
                    <span className="truncate">{c.name}</span><Bar v={c.v} max={catMax} /><span className="text-right font-semibold tabular-nums">{inr(c.v)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card title="Payment methods" pad={false}>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-border">
                {r.payments.map((p) => (
                  <tr key={p.m}><td className="px-4 py-2.5">{PAY[p.m] ?? p.m}</td><td className="px-4 py-2.5 text-right tabular-nums text-muted">{p.n} orders</td><td className="px-4 py-2.5 text-right font-semibold tabular-nums">{inr(p.v)}</td></tr>
                ))}
                {!r.payments.length && <tr><td className="p-6 text-center text-muted">No payments yet.</td></tr>}
              </tbody>
            </table>
          </Card>
        </div>
      </div>
    </>
  );
}
