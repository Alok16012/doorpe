import { ok, fail, body } from "@/lib/http";
import { setSession, verifyOtp } from "@/lib/auth";

export async function POST(req: Request) {
  const { phone, code } = await body<{ phone: string; code: string }>(req);
  const r = await verifyOtp(String(phone || "").replace(/\D/g, "").slice(-10), String(code || "").trim());
  if (!r.ok) return fail(r.error, 401);
  await setSession(r.user.id);
  return ok({ user: r.user });
}
