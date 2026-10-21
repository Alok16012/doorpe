import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { getOrder } from "@/lib/orders";
import { OrderScreen } from "@/components/account/OrderScreen";

export const metadata: Metadata = { title: "Your order" };

export default async function OrderPage(props: PageProps<"/orders/[id]">) {
  const user = await currentUser();
  if (!user) redirect("/account");
  const order = await getOrder((await props.params).id, user);
  if (!order) notFound();
  const sp = await props.searchParams;
  return <OrderScreen initial={order} justPlaced={sp.new === "1"} />;
}
