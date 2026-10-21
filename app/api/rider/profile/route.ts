import { asRider } from "@/lib/riderHttp";
import { updateRiderProfile } from "@/lib/rider";
import { body } from "@/lib/http";
export const PATCH = async (req: Request) => { const b = await body<{ name: string; vehicle: string }>(req); return asRider(async (r) => ({ user: await updateRiderProfile(r, b) })); };
