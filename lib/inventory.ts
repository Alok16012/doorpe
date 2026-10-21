import "server-only";
import { read } from "./db/local";
import { catalog, type Product } from "./catalog";

export type StockMap = Record<string, number>; // variantId -> units available

export async function stockFor(storeId: string | null, products: Product[]): Promise<StockMap> {
  const overrides = storeId ? await read((db) => db.stock[storeId] || {}) : {};
  const out: StockMap = {};
  for (const p of products) for (const v of p.variants) out[v.id] = overrides[v.id] ?? v.baseStock;
  return out;
}

export async function stockOne(storeId: string, variantId: string) {
  const v = catalog.variant(variantId);
  if (!v) return 0;
  const o = await read((db) => db.stock[storeId]?.[variantId]);
  return o ?? v.variant.baseStock;
}
