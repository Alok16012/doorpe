import { GROUPS } from "./data";
import { rupees } from "../money";
import { slugify, type CatalogData } from "./model";

/** Turn the hand-written demo catalogue into the stored shape. IDs match the original slug scheme. */
export function seedCatalog(): CatalogData {
  const out: CatalogData = { groups: [], categories: [], subs: [], products: [] };
  const now = new Date(0).toISOString();
  GROUPS.forEach((g, gi) => {
    out.groups.push({ slug: g.slug, name: g.name, sort: gi });
    g.categories.forEach((c, ci) => {
      out.categories.push({ slug: c.slug, name: c.name, icon: c.icon, tint: c.tint, group: g.slug, sort: ci, active: true });
      c.subs.forEach((s, si) => {
        out.subs.push({ slug: s.slug, name: s.name, icon: s.icon, category: c.slug, sort: si, active: true });
        for (const d of s.products) {
          let slug = slugify(d.n);
          while (out.products.some((x) => x.slug === slug)) slug += "-x";
          out.products.push({
            id: slug, slug, name: d.n, brand: d.b, icon: d.e, category: c.slug, sub: s.slug, tags: d.t || "",
            info: { ...(d.info || {}), "Country of origin": "India" }, active: true, createdAt: now, updatedAt: now,
            variants: d.v.map(([unit, mrp, price, stock], i) => ({ id: `${slug}~${i}`, unit, mrp: rupees(mrp), price: rupees(price), baseStock: stock ?? 40 })),
          });
        }
      });
    });
  });
  return out;
}
