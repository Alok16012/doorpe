import "server-only";
import { cookies } from "next/headers";
import "./db/local"; // wires admin store overrides into geo
import { serviceability, type Serviceability } from "./geo";

export const LOC_COOKIE = "turant_loc";
export type Loc = { lat: number; lng: number; label: string; sub: string };

export async function currentLocation(): Promise<{ loc: Loc | null; svc: Serviceability | null }> {
  const raw = (await cookies()).get(LOC_COOKIE)?.value;
  if (!raw) return { loc: null, svc: null };
  try {
    const loc = JSON.parse(decodeURIComponent(raw)) as Loc;
    if (typeof loc.lat !== "number" || typeof loc.lng !== "number") return { loc: null, svc: null };
    return { loc, svc: serviceability(loc.lat, loc.lng) };
  } catch {
    return { loc: null, svc: null };
  }
}

/** Serialisable view for client components. */
export function clientSvc(svc: Serviceability | null) {
  if (!svc) return null;
  return svc.ok
    ? { ok: true, etaMin: svc.etaMin, storeName: svc.store.name, open: svc.open, city: svc.store.city }
    : { ok: false, etaMin: null, storeName: null, open: false, city: svc.nearest.city };
}
