import { ok, fail } from "@/lib/http";
import { currentUser } from "@/lib/auth";
import { getOrder } from "@/lib/orders";

export async function GET(_req: Request, ctx: RouteContext<"/api/orders/[id]">) {
  const user = await currentUser();
  if (!user) return fail("Log in first", 401);
  const o = await getOrder((await ctx.params).id, user);
  return o ? ok({ order: o }) : fail("Order not found", 404);
}
