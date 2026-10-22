import { ok, fail } from "@/lib/http";

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const lat = Number(sp.get("lat")), lng = Number(sp.get("lng"));
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return fail("Bad coordinates");
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=17&lat=${lat}&lon=${lng}`, {
      headers: { "User-Agent": "DoorPe-demo/0.1 (quick-commerce demo)", "Accept-Language": "en" },
    });
    const r = (await res.json()) as { display_name?: string; name?: string };
    const parts = (r.display_name || "").split(", ");
    const label = r.name || parts[0] || "Pinned location";
    return ok({ label, sub: parts.filter((p) => p !== label).slice(0, 4).join(", "), lat, lng });
  } catch {
    return ok({ label: "Pinned location", sub: `${lat.toFixed(4)}, ${lng.toFixed(4)}`, lat, lng });
  }
}
