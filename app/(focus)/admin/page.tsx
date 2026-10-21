import type { Metadata } from "next";
import { currentUser } from "@/lib/auth";
import { allOrders } from "@/lib/orders";
import { TitleBar } from "@/components/ui/TitleBar";
import { LoginPrompt } from "@/components/account/AccountBits";
import { OrderBoard } from "@/components/admin/OrderBoard";

export const metadata: Metadata = { title: "Store dashboard" };

export default async function AdminPage() {
  const user = await currentUser();
  if (!user) return (<><TitleBar title="Store dashboard" back="/" /><LoginPrompt title="Staff login" body="Log in with a staff phone number. In the demo, 9999999999 is a staff number." /></>);
  if (user.role !== "admin") return (<><TitleBar title="Store dashboard" back="/" /><p className="p-8 text-center text-sm text-muted">This area is for store staff only.</p></>);
  return (<><TitleBar title="Store dashboard" back="/" /><OrderBoard initial={await allOrders()} /></>);
}
