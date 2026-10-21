import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { read } from "@/lib/db/local";
import { liveView } from "@/lib/orders";
import { inr } from "@/lib/money";
import { PageHead } from "@/components/admin/AdminShell";
import { Card, Stat, StatusBadge } from "@/components/admin/ui";
import { CustomerActions } from "@/components/admin/CustomerActions";

export const metadata = { title: "Customer" };

export default async function CustomerPage(props: PageProps<"/admin/customers/[id]">) {
  const id = (await props.params).id;
  const data = await read((db) => ({
    u: db.users.find((x) => x.id === id),
    orders: db.orders.filter((o) => o.userId === id).sort((a, b) => b.placedAt.localeCompare(a.placedAt)),
    addresses: db.addresses.filter((a) => a.userId === id),
    wallet: db.wallet.filter((w) => w.userId === id).sort((a, b) => b.at.localeCompare(a.at)).slice(0, 15),
  }));
  if (!data.u) notFound();
  const u = data.u;
  const good = data.orders.filter((o) => o.status !== "cancelled");
  return (
    <>
      <Link href="/admin/customers" className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-text"><ArrowLeft size={16} /> Customers</Link>
      <PageHead title={u.name || `+91 ${u.phone}`} sub={`+91 ${u.phone}${u.email ? ` · ${u.email}` : ""} · joined ${new Date(u.createdAt).toLocaleDateString("en-IN")}`} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Orders" value={String(good.length)} />
        <Stat label="Spent" value={inr(good.reduce((s, o) => s + o.grandTotal, 0))} />
        <Stat label="Wallet" value={inr(u.walletBalance)} />
        <Stat label="Addresses" value={String(data.addresses.length)} />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card title="Orders" pad={false}>
          {data.orders.length === 0 ? <p className="p-6 text-center text-sm text-muted">No orders yet.</p> : (
            <ul className="divide-y divide-border">
              {data.orders.map((o) => (
                <li key={o.id}><Link href={`/admin/orders/${o.id}`} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-surface">
                  <span className="flex-1"><b>#{o.code}</b> <span className="text-muted">· {new Date(o.placedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · {inr(o.grandTotal)}</span></span>
                  <StatusBadge s={liveView(o).status} />
                </Link></li>
              ))}
            </ul>
          )}
        </Card>
        <div className="space-y-4">
          <CustomerActions id={u.id} role={u.role} />
          <Card title="Wallet activity" pad={false}>
            {data.wallet.length === 0 ? <p className="p-6 text-center text-sm text-muted">No activity.</p> : (
              <ul className="divide-y divide-border">
                {data.wallet.map((w) => (
                  <li key={w.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                    <span><span className="block font-semibold capitalize">{w.kind}</span><span className="text-xs text-muted">{w.note}</span></span>
                    <span className={`font-bold tabular-nums ${w.amount > 0 ? "text-success" : ""}`}>{w.amount > 0 ? "+" : "−"}{inr(Math.abs(w.amount))}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card title="Addresses">
            {data.addresses.length === 0 ? <p className="text-sm text-muted">None saved.</p> : data.addresses.map((a) => (
              <p key={a.id} className="mb-2 text-sm"><b className="capitalize">{a.label}</b> · {[a.houseNo, a.building, a.area].filter(Boolean).join(", ")}</p>
            ))}
          </Card>
        </div>
      </div>
    </>
  );
}
