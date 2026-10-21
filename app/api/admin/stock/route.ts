import { ok, fail, body } from "@/lib/http";
import { currentUser } from "@/lib/auth";
import { write } from "@/lib/db/local";
import { catalog } from "@/lib/catalog";
import { storeById } from "@/lib/geo";

export async function PATCH(req: Request) {
  const user = await currentUser();
  if (user?.role !== "admin") return fail("Staff only", 403);
  const b = await body<{ storeId: string; variantId: string; stock: number }>(req);
  if (!storeById(String(b.storeId)) || !catalog.variant(String(b.variantId))) return fail("Unknown store or item");
  const n = Math.max(0, Math.min(9999, Math.floor(Number(b.stock))));
  await write((db) => { (db.stock[b.storeId!] ||= {})[b.variantId!] = n; });
  return ok({ ok: true, stock: n });
}
