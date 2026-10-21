import { stores, isOpen } from "@/lib/geo";
import { read } from "@/lib/db/local";
import { PageHead } from "@/components/admin/AdminShell";
import { StoresManager } from "@/components/admin/StoresManager";

export const metadata = { title: "Stores" };

export default async function StoresPage() {
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  const orders = await read((db) => db.orders);
  const list = stores().map((s) => ({
    ...s, openNow: isOpen(s),
    ordersToday: orders.filter((o) => o.storeId === s.id && o.status !== "cancelled" && new Date(o.placedAt).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }) === today).length,
  }));
  return (
    <>
      <PageHead title="Stores" sub="Pause a store, change its hours or how far it delivers. Changes apply to customers immediately." />
      <StoresManager stores={list} />
    </>
  );
}
