export type Store = {
  id: string; name: string; city: string; lat: number; lng: number; radiusKm: number;
  opensAt: number; closesAt: number; // hours in IST, closesAt 24 = midnight
};

/** Demo dark stores. Replace with your own stores (admin / DB) before launch. */
export const STORES: Store[] = [
  { id: "del-cp", name: "Connaught Place", city: "Delhi", lat: 28.6315, lng: 77.2167, radiusKm: 6, opensAt: 0, closesAt: 24 },
  { id: "del-saket", name: "Saket", city: "Delhi", lat: 28.5245, lng: 77.2066, radiusKm: 6, opensAt: 6, closesAt: 24 },
  { id: "ggn-cyber", name: "Cyber City", city: "Gurugram", lat: 28.495, lng: 77.0895, radiusKm: 7, opensAt: 0, closesAt: 24 },
  { id: "noi-18", name: "Sector 18", city: "Noida", lat: 28.57, lng: 77.321, radiusKm: 7, opensAt: 6, closesAt: 24 },
  { id: "mum-andheri", name: "Andheri West", city: "Mumbai", lat: 19.1364, lng: 72.8296, radiusKm: 5, opensAt: 6, closesAt: 24 },
  { id: "mum-bandra", name: "Bandra West", city: "Mumbai", lat: 19.0596, lng: 72.8295, radiusKm: 5, opensAt: 6, closesAt: 24 },
  { id: "blr-kora", name: "Koramangala", city: "Bengaluru", lat: 12.9352, lng: 77.6245, radiusKm: 5, opensAt: 0, closesAt: 24 },
  { id: "blr-indira", name: "Indiranagar", city: "Bengaluru", lat: 12.9719, lng: 77.6412, radiusKm: 5, opensAt: 6, closesAt: 24 },
  { id: "hyd-hitech", name: "HITEC City", city: "Hyderabad", lat: 17.4435, lng: 78.3772, radiusKm: 6, opensAt: 6, closesAt: 24 },
  { id: "pune-kothrud", name: "Kothrud", city: "Pune", lat: 18.5074, lng: 73.8077, radiusKm: 6, opensAt: 6, closesAt: 24 },
  { id: "kol-saltlake", name: "Salt Lake", city: "Kolkata", lat: 22.5867, lng: 88.4171, radiusKm: 6, opensAt: 6, closesAt: 24 },
  { id: "chn-tnagar", name: "T. Nagar", city: "Chennai", lat: 13.0418, lng: 80.2341, radiusKm: 6, opensAt: 6, closesAt: 24 },
];

/** Quick-pick locations offered when the search box is empty. */
export const POPULAR_SPOTS = [
  { label: "Connaught Place", sub: "New Delhi, Delhi", lat: 28.6328, lng: 77.2197 },
  { label: "DLF Cyber City", sub: "Gurugram, Haryana", lat: 28.4947, lng: 77.0886 },
  { label: "Andheri West", sub: "Mumbai, Maharashtra", lat: 19.1355, lng: 72.8264 },
  { label: "Koramangala 5th Block", sub: "Bengaluru, Karnataka", lat: 12.9345, lng: 77.6191 },
];

export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371, toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat), dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function istHour(d = new Date()) {
  const s = d.toLocaleString("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", hour12: false });
  return parseInt(s, 10);
}

export function isOpen(s: Store, d = new Date()) {
  const h = istHour(d);
  return h >= s.opensAt && h < s.closesAt;
}

export type Serviceability =
  | { ok: true; store: Store; distanceKm: number; etaMin: number; open: boolean }
  | { ok: false; nearest: Store; distanceKm: number };

export function serviceability(lat: number, lng: number): Serviceability {
  let best = STORES[0], bestD = Infinity;
  for (const s of STORES) {
    const d = distanceKm({ lat, lng }, s);
    if (d < bestD) { bestD = d; best = s; }
  }
  if (bestD > best.radiusKm) return { ok: false, nearest: best, distanceKm: bestD };
  const etaMin = Math.max(7, Math.round(5 + bestD * 2.2));
  return { ok: true, store: best, distanceKm: bestD, etaMin, open: isOpen(best) };
}

export const storeById = (id: string) => STORES.find((s) => s.id === id);
