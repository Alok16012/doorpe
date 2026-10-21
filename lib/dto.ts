import type { Product } from "./catalog";
import type { StockMap } from "./inventory";

/** What a product card needs on the client. */
export type CardProduct = {
  slug: string; name: string; brand: string; icon: string; tint: string;
  variants: { id: string; unit: string; price: number; mrp: number; stock: number }[];
};

export function toCard(p: Product, stock: StockMap): CardProduct {
  return {
    slug: p.slug, name: p.name, brand: p.brand, icon: p.icon, tint: p.tint,
    variants: p.variants.map((v) => ({ id: v.id, unit: v.unit, price: v.price, mrp: v.mrp, stock: stock[v.id] ?? v.baseStock })),
  };
}
