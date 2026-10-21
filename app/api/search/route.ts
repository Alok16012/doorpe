import { ok } from "@/lib/http";
import { search, suggest } from "@/lib/catalog";
import { currentLocation } from "@/lib/location";
import { stockFor } from "@/lib/inventory";
import { toCard } from "@/lib/dto";

export async function GET(req: Request) {
  const q = (new URL(req.url).searchParams.get("q") || "").slice(0, 60);
  const { svc } = await currentLocation();
  const products = search(q, 40);
  const stock = await stockFor(svc?.ok ? svc.store.id : null, products);
  return ok({ q, suggestions: suggest(q), products: products.map((p) => toCard(p, stock)) });
}
