import { catalogData } from "@/lib/catalog";
import { STORES } from "@/lib/geo";
import { read } from "@/lib/db/local";
import { PageHead } from "@/components/admin/AdminShell";
import { StockEditor } from "@/components/admin/StockEditor";

export const metadata = { title: "Inventory" };

export default async function InventoryPage(props: PageProps<"/admin/inventory">) {
  const sp = await props.searchParams;
  const storeId = typeof sp.store === "string" && STORES.some((s) => s.id === sp.store) ? sp.store : STORES[0].id;
  const overrides = await read((db) => db.stock[storeId] || {});
  const rows = catalogData().products.filter((p) => p.active).flatMap((p) => p.variants.map((v) => ({ id: v.id, name: p.name, unit: v.unit, icon: p.icon, stock: overrides[v.id] ?? v.baseStock })));
  return (
    <>
      <PageHead title="Inventory" sub="Units on the shelf at each store. Sold-out items show as out of stock to customers of that store." />
      <StockEditor storeId={storeId} lowOnly={sp.low === "1"} stores={STORES.map((s) => ({ id: s.id, name: `${s.name}, ${s.city}` }))} rows={rows} />
    </>
  );
}
