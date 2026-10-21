import Link from "next/link";
import { adminOrders } from "@/lib/admin";
import { STORES } from "@/lib/geo";
import { inr } from "@/lib/money";
import { PageHead } from "@/components/admin/AdminShell";
import { Card, StatusBadge, Tabs, field, td, th } from "@/components/admin/ui";

export const metadata = { title: "Orders" };

const TABS = [["all", "All"], ["live", "Live"], ["placed", "New"], ["packing", "Packing"], ["packed", "Packed"], ["out_for_delivery", "On the way"], ["delivered", "Delivered"], ["cancelled", "Cancelled"]];

export default async function OrdersPage(props: PageProps<"/admin/orders">) {
  const sp = await props.searchParams;
  const status = typeof sp.status === "string" ? sp.status : "all";
  const q = typeof sp.q === "string" ? sp.q : "";
  const store = typeof sp.store === "string" ? sp.store : "";
  const rows = await adminOrders({ status, q, store: store || undefined });
  const qs = (o: Record<string, string>) => "?" + new URLSearchParams(Object.entries({ status, q, store, ...o }).filter(([, v]) => v)).toString();
  return (
    <>
      <PageHead title="Orders" sub={`${rows.length} order${rows.length === 1 ? "" : "s"}`} />
      <Tabs current={status} items={TABS.map(([k, l]) => ({ key: k, label: l, href: `/admin/orders${qs({ status: k })}` }))} />
      <form className="mb-4 flex flex-wrap gap-2" action="/admin/orders">
        <input type="hidden" name="status" value={status} />
        <input name="q" defaultValue={q} placeholder="Order code, phone or name" aria-label="Search orders" className={`${field} max-w-xs`} />
        <select name="store" defaultValue={store} aria-label="Store" className={`${field} max-w-[220px]`}>
          <option value="">All stores</option>
          {STORES.map((s) => <option key={s.id} value={s.id}>{s.name}, {s.city}</option>)}
        </select>
        <button className="h-10 rounded-md bg-accent px-4 text-sm font-semibold text-on-accent">Filter</button>
      </form>
      <Card pad={false}>
        {rows.length === 0 ? <p className="p-10 text-center text-sm text-muted">No orders match.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="border-b border-border bg-surface/60"><tr><th className={th}>Order</th><th className={th}>Placed</th><th className={th}>Customer</th><th className={th}>Store</th><th className={th}>Items</th><th className={th}>Total</th><th className={th}>Payment</th><th className={th}>Status</th></tr></thead>
              <tbody className="divide-y divide-border">
                {rows.map((o) => (
                  <tr key={o.id} className="hover:bg-surface/60">
                    <td className={td}><Link href={`/admin/orders/${o.id}`} className="font-bold text-accent hover:underline">#{o.code}</Link></td>
                    <td className={`${td} whitespace-nowrap text-muted`}>{new Date(o.placedAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" })}</td>
                    <td className={td}>{o.address.receiverName}<span className="block text-xs text-muted">+91 {o.customer?.phone}</span></td>
                    <td className={`${td} text-muted`}>{STORES.find((s) => s.id === o.storeId)?.name}</td>
                    <td className={`${td} tabular-nums`}>{o.items.reduce((n, i) => n + i.qty, 0)}</td>
                    <td className={`${td} font-semibold tabular-nums`}>{inr(o.grandTotal)}</td>
                    <td className={`${td} text-xs uppercase text-muted`}>{o.paymentMethod} · {o.paymentStatus}</td>
                    <td className={td}><StatusBadge s={o.status} /></td>
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
