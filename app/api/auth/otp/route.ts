import { ok, fail, body } from "@/lib/http";
import { sendOtp } from "@/lib/auth";

export async function POST(req: Request) {
  const { phone } = await body<{ phone: string }>(req);
  const r = await sendOtp(String(phone || "").replace(/\D/g, "").slice(-10));
  return r.ok ? ok(r) : fail(r.error, 429);
}
