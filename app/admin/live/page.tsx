import { allOrders } from "@/lib/orders";
import { PageHead } from "@/components/admin/AdminShell";
import { OrderBoard } from "@/components/admin/OrderBoard";

export const metadata = { title: "Live board" };

export default async function LivePage() {
  return (
    <>
      <PageHead title="Live board" sub="Move orders through packing and delivery. Refreshes every few seconds." />
      <OrderBoard initial={await allOrders()} />
    </>
  );
}
