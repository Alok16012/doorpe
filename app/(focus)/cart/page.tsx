import type { Metadata } from "next";
import { catalog } from "@/lib/catalog";
import { currentLocation } from "@/lib/location";
import { stockFor } from "@/lib/inventory";
import { toCard } from "@/lib/dto";
import { CartScreen } from "@/components/cart/CartScreen";

export const metadata: Metadata = { title: "Your cart" };

export default async function CartPage(props: PageProps<"/cart">) {
  const sp = await props.searchParams;
  const { svc } = await currentLocation();
  const picks = ["whole-wheat-bread", "farm-white-eggs", "fresh-dahi", "salted-butter", "classic-salted-potato-chips", "cola-fizz", "coriander-bunch", "lemon"]
    .map((s) => catalog.product(s)).filter((p): p is NonNullable<typeof p> => !!p);
  const stock = await stockFor(svc?.ok ? svc.store.id : null, picks);
  // Shared cart: ?items=variantId:qty,variantId:qty
  const shared = typeof sp.items === "string"
    ? sp.items.split(",").map((x) => x.split(":")).map(([id, q]) => ({ hit: catalog.variant(id), qty: Math.max(1, Math.min(10, Number(q) || 1)) }))
        .filter((x) => x.hit).slice(0, 50)
        .map(({ hit, qty }) => ({ card: toCard(hit!.product, stock), variantId: hit!.variant.id, qty }))
    : [];
  return <CartScreen picks={picks.map((p) => toCard(p, stock))} eta={svc?.ok ? svc.etaMin : null} shared={shared} />;
}
