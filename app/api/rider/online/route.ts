import { asRider } from "@/lib/riderHttp";
import { setOnline } from "@/lib/rider";
import { body } from "@/lib/http";
export const POST = async (req: Request) => { const b = await body<{ online: boolean }>(req); return asRider(async (r) => { await setOnline(r, !!b.online); return { ok: true }; }); };
