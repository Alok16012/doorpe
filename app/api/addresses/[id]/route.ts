import { ok, fail, body } from "@/lib/http";
import { currentUser } from "@/lib/auth";
import { deleteAddress, saveAddress, validateAddress, type AddressInput } from "@/lib/account";

export async function PATCH(req: Request, ctx: RouteContext<"/api/addresses/[id]">) {
  const user = await currentUser();
  if (!user) return fail("Log in first", 401);
  const { id } = await ctx.params;
  const b = await body<AddressInput>(req);
  const err = validateAddress(b);
  if (err) return fail(err);
  const row = await saveAddress(user, b as AddressInput, id);
  return row ? ok({ address: row }) : fail("Address not found", 404);
}
export async function DELETE(_req: Request, ctx: RouteContext<"/api/addresses/[id]">) {
  const user = await currentUser();
  if (!user) return fail("Log in first", 401);
  const { id } = await ctx.params;
  return (await deleteAddress(user, id)) ? ok({ ok: true }) : fail("Address not found", 404);
}
