import { ok, fail, body } from "@/lib/http";
import { currentUser } from "@/lib/auth";
import { listOrders, placeOrder, OrderError } from "@/lib/orders";
import type { CartLine, Order } from "@/lib/types";

export async function GET() {
  const user = await currentUser();
  if (!user) return fail("Log in first", 401);
  return ok({ orders: await listOrders(user) });
}

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return fail("Log in first", 401);
  const b = await body<{ lines: CartLine[]; addressId: string; paymentMethod: Order["paymentMethod"]; tip: number; coupon: string; instructions: string; idempotencyKey: string }>(req);
  if (!["upi", "card", "cod", "wallet"].includes(String(b.paymentMethod))) return fail("Choose how you'd like to pay");
  try {
    const order = await placeOrder({
      user, lines: Array.isArray(b.lines) ? b.lines.slice(0, 100) : [], addressId: String(b.addressId || ""),
      paymentMethod: b.paymentMethod!, tip: Number(b.tip) || 0, couponCode: b.coupon || undefined,
      instructions: b.instructions, idempotencyKey: b.idempotencyKey,
    });
    return ok({ order });
  } catch (e) {
    if (e instanceof OrderError) return fail(e.message, 409, { code: e.code, quote: e.extra });
    throw e;
  }
}
