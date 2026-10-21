import { ok, body } from "@/lib/http";
import { quote } from "@/lib/pricing";
import { currentLocation } from "@/lib/location";
import { currentUser } from "@/lib/auth";
import type { CartLine } from "@/lib/types";

export async function POST(req: Request) {
  const b = await body<{ lines: CartLine[]; tip: number; coupon: string }>(req);
  const lines = Array.isArray(b.lines) ? b.lines.slice(0, 100).filter((l) => typeof l?.variantId === "string" && Number.isInteger(l.qty)) : [];
  const [{ svc }, user] = await Promise.all([currentLocation(), currentUser()]);
  return ok(await quote(lines, { svc, tip: Number(b.tip) || 0, couponCode: b.coupon || undefined, user }));
}
