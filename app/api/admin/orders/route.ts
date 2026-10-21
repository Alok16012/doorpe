import { ok, fail } from "@/lib/http";
import { currentUser } from "@/lib/auth";
import { allOrders } from "@/lib/orders";

export async function GET() {
  const user = await currentUser();
  if (user?.role !== "admin") return fail("Staff only", 403);
  return ok({ orders: await allOrders() });
}
