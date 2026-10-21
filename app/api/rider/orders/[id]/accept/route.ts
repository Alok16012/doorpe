import { asRider } from "@/lib/riderHttp";
import { acceptOrder } from "@/lib/rider";
export const POST = async (_req: Request, ctx: RouteContext<"/api/rider/orders/[id]/accept">) => { const { id } = await ctx.params; return asRider(async (r) => { await acceptOrder(r, id); return { ok: true }; }); };
