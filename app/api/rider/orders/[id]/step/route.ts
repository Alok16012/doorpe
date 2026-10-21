import { asRider } from "@/lib/riderHttp";
import { riderStep } from "@/lib/rider";
import { body } from "@/lib/http";
const STEPS = ["at_store", "picked_up", "at_customer", "deliver"] as const;
export const POST = async (req: Request, ctx: RouteContext<"/api/rider/orders/[id]/step">) => {
  const { id } = await ctx.params;
  const b = await body<{ step: (typeof STEPS)[number]; otp: string; cashCollected: boolean }>(req);
  return asRider(async (r) => {
    if (!STEPS.includes(b.step!)) return { error: "Unknown step" };
    const o = await riderStep(r, id, b.step!, { otp: b.otp, cashCollected: !!b.cashCollected });
    return { ok: true, status: o.status };
  });
};
