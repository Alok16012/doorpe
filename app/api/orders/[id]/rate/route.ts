import { ok, fail, body } from "@/lib/http";
import { currentUser } from "@/lib/auth";
import { rateOrder } from "@/lib/orders";

export async function POST(req: Request, ctx: RouteContext<"/api/orders/[id]/rate">) {
  const user = await currentUser();
  if (!user) return fail("Log in first", 401);
  const { rating } = await body<{ rating: number }>(req);
  const row = await rateOrder((await ctx.params).id, user, Number(rating));
  return row ? ok({ ok: true }) : fail("Order not found", 404);
}
