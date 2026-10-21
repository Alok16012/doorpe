import { ok, fail, body } from "@/lib/http";
import { currentUser } from "@/lib/auth";
import { advanceOrder, OrderError } from "@/lib/orders";

export async function POST(req: Request, ctx: RouteContext<"/api/admin/orders/[id]/advance">) {
  const user = await currentUser();
  if (user?.role !== "admin") return fail("Staff only", 403);
  const { otp } = await body<{ otp: string }>(req);
  try {
    return ok({ order: await advanceOrder((await ctx.params).id, otp) });
  } catch (e) {
    if (e instanceof OrderError) return fail(e.message, 409, { code: e.code });
    throw e;
  }
}
