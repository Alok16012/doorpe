import { cookies } from "next/headers";
import { ok, fail, body } from "@/lib/http";
import { serviceability } from "@/lib/geo";
import { LOC_COOKIE, type Loc } from "@/lib/location";

export async function POST(req: Request) {
  const b = await body<Loc>(req);
  if (typeof b.lat !== "number" || typeof b.lng !== "number" || !b.label) return fail("Pick a location");
  const loc: Loc = { lat: b.lat, lng: b.lng, label: String(b.label).slice(0, 80), sub: String(b.sub || "").slice(0, 160) };
  (await cookies()).set(LOC_COOKIE, encodeURIComponent(JSON.stringify(loc)), { path: "/", maxAge: 60 * 60 * 24 * 180, sameSite: "lax" });
  const svc = serviceability(loc.lat, loc.lng);
  return ok({ loc, serviceable: svc.ok, etaMin: svc.ok ? svc.etaMin : null, store: svc.ok ? svc.store.name : null });
}
