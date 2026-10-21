import type { Metadata } from "next";
import { currentUser } from "@/lib/auth";
import { TitleBar } from "@/components/ui/TitleBar";
import { LoginPrompt } from "@/components/account/AccountBits";
import { StockEditor } from "@/components/admin/StockEditor";
import { catalog } from "@/lib/catalog";
import { STORES } from "@/lib/geo";
import { read } from "@/lib/db/local";

export const metadata: Metadata = { title: "Stock" };

export default async function StockPage(props: PageProps<"/admin/stock">) {
  const user = await currentUser();
  if (!user) return (<><TitleBar title="Stock" back="/admin" /><LoginPrompt title="Staff login" /></>);
  if (user.role !== "admin") return (<><TitleBar title="Stock" back="/" /><p className="p-8 text-center text-sm text-muted">Staff only.</p></>);
  const sp = await props.searchParams;
  const storeId = typeof sp.store === "string" && STORES.some((s) => s.id === sp.store) ? sp.store : STORES[0].id;
  const overrides = await read((db) => db.stock[storeId] || {});
  const rows = catalog.all().flatMap((p) => p.variants.map((v) => ({ id: v.id, name: p.name, unit: v.unit, icon: p.icon, stock: overrides[v.id] ?? v.baseStock })));
  return (<><TitleBar title="Stock" back="/admin" /><StockEditor storeId={storeId} stores={STORES.map((s) => ({ id: s.id, name: `${s.name}, ${s.city}` }))} rows={rows} /></>);
}
