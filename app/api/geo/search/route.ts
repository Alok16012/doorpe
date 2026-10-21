import { ok, fail } from "@/lib/http";

const cache = new Map<string, { at: number; data: unknown }>();
let last = 0;

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim() || "";
  if (q.length < 3) return ok({ results: [] });
  const key = q.toLowerCase();
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < 86_400_000) return ok(hit.data);
  // Nominatim usage policy: max 1 request/second, identify the app.
  const wait = Math.max(0, last + 1000 - Date.now());
  if (wait) await new Promise((r) => setTimeout(r, wait));
  last = Date.now();
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=6&countrycodes=in&q=${encodeURIComponent(q)}`;
    const res = await fetch(url, { headers: { "User-Agent": "Turant-demo/0.1 (quick-commerce demo)", "Accept-Language": "en" } });
    if (!res.ok) return fail("Location search is busy. Try again.", 502);
    const rows = (await res.json()) as { lat: string; lon: string; name?: string; display_name: string }[];
    const results = rows.map((r) => {
      const parts = r.display_name.split(", ");
      const label = r.name || parts[0];
      const sub = parts.filter((p) => p !== label).slice(0, 4).join(", ");
      return { label, sub, lat: Number(r.lat), lng: Number(r.lon) };
    });
    const data = { results };
    cache.set(key, { at: Date.now(), data });
    return ok(data);
  } catch {
    return fail("Couldn't reach location search. Check your connection.", 502);
  }
}
