import Link from "next/link";
import { adminCustomers } from "@/lib/admin";
import { inr } from "@/lib/money";
import { PageHead } from "@/components/admin/AdminShell";
import { Card, field, td, th } from "@/components/admin/ui";

export const metadata = { title: "Customers" };

export default async function CustomersPage(props: PageProps<"/admin/customers">) {
  const sp = await props.searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const rows = await adminCustomers(q);
  return (
    <>
      <PageHead title="Customers" sub={`${rows.length} people`} />
      <form className="mb-4 flex gap-2" action="/admin/customers">
        <input name="q" defaultValue={q} placeholder="Phone, name or email" aria-label="Search customers" className={`${field} max-w-xs`} />
        <button className="h-10 rounded-md bg-accent px-4 text-sm font-semibold text-on-accent">Search</button>
      </form>
      <Card pad={false}>
        {rows.length === 0 ? <p className="p-10 text-center text-sm text-muted">No customers yet.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="border-b border-border bg-surface/60"><tr><th className={th}>Customer</th><th className={th}>Orders</th><th className={th}>Spent</th><th className={th}>Wallet</th><th className={th}>Last order</th><th className={th}>Role</th></tr></thead>
              <tbody className="divide-y divide-border">
                {rows.map((u) => (
                  <tr key={u.id} className="hover:bg-surface/60">
                    <td className={td}><Link href={`/admin/customers/${u.id}`} className="font-semibold text-accent hover:underline">{u.name || "No name"}</Link><span className="block text-xs text-muted">+91 {u.phone}</span></td>
                    <td className={`${td} tabular-nums`}>{u.orders}</td>
                    <td className={`${td} tabular-nums`}>{inr(u.spent)}</td>
                    <td className={`${td} tabular-nums`}>{inr(u.walletBalance)}</td>
                    <td className={`${td} text-muted`}>{u.lastOrder ? new Date(u.lastOrder).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}</td>
                    <td className={td}>{u.role === "admin" ? <span className="rounded-pill bg-brand/50 px-2 py-0.5 text-xs font-bold">Admin</span> : <span className="text-xs text-muted">Customer</span>}</td>
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
