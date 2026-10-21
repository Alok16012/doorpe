import { asRider } from "@/lib/riderHttp";
import { updateLocation } from "@/lib/rider";
import { body } from "@/lib/http";
export const POST = async (req: Request) => { const b = await body<{ lat: number; lng: number; accuracy: number }>(req); return asRider(async (r) => { await updateLocation(r, Number(b.lat), Number(b.lng), Number(b.accuracy) || undefined); return { ok: true }; }); };
