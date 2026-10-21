/** Stored (editable) catalogue shape. Money in paise. `icon` is an emoji or an image URL. */
export type CatGroup = { slug: string; name: string; sort: number };
export type CatCategory = { slug: string; name: string; icon: string; tint: string; group: string; sort: number; active: boolean };
export type CatSub = { slug: string; name: string; icon: string; category: string; sort: number; active: boolean };
export type CatVariant = { id: string; unit: string; mrp: number; price: number; baseStock: number };
export type CatProduct = {
  id: string; slug: string; name: string; brand: string; icon: string; category: string; sub: string;
  tags: string; info: Record<string, string>; description?: string; active: boolean; variants: CatVariant[];
  createdAt: string; updatedAt: string;
};
export type CatalogData = { groups: CatGroup[]; categories: CatCategory[]; subs: CatSub[]; products: CatProduct[] };

export const slugify = (s: string) =>
  s.toLowerCase().replace(/\(.*?\)/g, " ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
