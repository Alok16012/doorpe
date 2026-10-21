import { ok, fail, body } from "@/lib/http";
import { currentUser } from "@/lib/auth";
import { cancelOrder, OrderError } from "@/lib/orders";

export async function POST(req: Request, ctx: RouteContext<"/api/orders/[id]/cancel">) {
  const user = await currentUser();
  if (!user) return fail("Log in first", 401);
  const { reason } = await body<{ reason: string }>(req);
  try {
    return ok({ order: await cancelOrder((await ctx.params).id, user, String(reason || "Changed my mind")) });
  } catch (e) {
    if (e instanceof OrderError) return fail(e.message, 409, { code: e.code });
    throw e;
  }
}
