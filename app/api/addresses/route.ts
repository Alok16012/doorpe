import { ok, fail, body } from "@/lib/http";
import { currentUser } from "@/lib/auth";
import { listAddresses, saveAddress, validateAddress, type AddressInput } from "@/lib/account";
import { serviceability } from "@/lib/geo";

export async function GET() {
  const user = await currentUser();
  if (!user) return fail("Log in first", 401);
  const rows = await listAddresses(user);
  return ok({ addresses: rows.map((a) => ({ ...a, serviceable: serviceability(a.lat, a.lng).ok })) });
}
export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return fail("Log in first", 401);
  const b = await body<AddressInput>(req);
  const err = validateAddress(b);
  if (err) return fail(err);
  return ok({ address: await saveAddress(user, b as AddressInput) });
}
