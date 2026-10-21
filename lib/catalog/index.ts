import { GROUPS, COLLECTIONS, STOREFRONTS, BANNERS, SEARCH_HINTS } from "./data";
import { rupees } from "../money";

export type Variant = { id: string; productId: string; unit: string; mrp: number; price: number; baseStock: number };
export type Product = {
  id: string; slug: string; name: string; brand: string; icon: string; tint: string;
  group: string; category: string; sub: string; tags: string; variants: Variant[]; info: Record<string, string>;
};
export type Sub = { slug: string; name: string; icon: string; category: string };
export type Category = { slug: string; name: string; icon: string; tint: string; group: string; subs: Sub[] };
export type Group = { slug: string; name: string; categories: Category[] };

const slugify = (s: string) =>
  s.toLowerCase().replace(/\(.*?\)/g, " ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const products: Product[] = [];
const groups: Group[] = [];
const categories = new Map<string, Category>();
const subs = new Map<string, Sub>();

for (const g of GROUPS) {
  const group: Group = { slug: g.slug, name: g.name, categories: [] };
  for (const c of g.categories) {
    const cat: Category = { slug: c.slug, name: c.name, icon: c.icon, tint: c.tint, group: g.slug, subs: [] };
    for (const s of c.subs) {
      const sub: Sub = { slug: s.slug, name: s.name, icon: s.icon, category: c.slug };
      cat.subs.push(sub);
      subs.set(s.slug, sub);
      for (const d of s.products) {
        let slug = slugify(d.n);
        while (products.some((x) => x.slug === slug)) slug += "-x";
        const id = slug;
        products.push({
          id, slug, name: d.n, brand: d.b, icon: d.e, tint: c.tint,
          group: g.slug, category: c.slug, sub: s.slug, tags: d.t || "",
          info: { Brand: d.b, ...(d.info || {}), "Country of origin": "India" },
          variants: d.v.map(([unit, mrp, price, stock], i) => ({
            id: `${id}~${i}`, productId: id, unit, mrp: rupees(mrp), price: rupees(price), baseStock: stock ?? 40,
          })),
        });
      }
    }
    group.categories.push(cat);
    categories.set(c.slug, cat);
  }
  groups.push(group);
}

const bySlug = new Map(products.map((p) => [p.slug, p]));
const variantIndex = new Map(products.flatMap((p) => p.variants.map((v) => [v.id, { product: p, variant: v }] as const)));

export const catalog = {
  groups: () => groups,
  category: (slug: string) => categories.get(slug),
  sub: (slug: string) => subs.get(slug),
  allCategories: () => [...categories.values()],
  product: (slug: string) => bySlug.get(slug),
  variant: (id: string) => variantIndex.get(id),
  all: () => products,
  inCategory: (cat: string, sub?: string) => products.filter((p) => p.category === cat && (!sub || p.sub === sub)),
  storefronts: () => STOREFRONTS,
  banners: () => BANNERS,
  searchHints: () => SEARCH_HINTS,
  collections: () => COLLECTIONS,
  collection(slug: string) {
    const c = COLLECTIONS.find((x) => x.slug === slug);
    if (!c) return undefined;
    let list = products;
    const r = c.rule || {};
    if (r.categories) list = list.filter((p) => r.categories!.includes(p.category));
    if (r.subs) list = list.filter((p) => r.subs!.includes(p.sub));
    if (r.minDiscount) list = list.filter((p) => discountOf(p) >= r.minDiscount!).sort((a, b) => discountOf(b) - discountOf(a));
    return { ...c, products: list.slice(0, c.limit ?? 30) };
  },
  similar(p: Product, n = 8) {
    return products.filter((x) => x.sub === p.sub && x.id !== p.id).slice(0, n);
  },
  topInCategory(p: Product, n = 10) {
    return products.filter((x) => x.category === p.category && x.id !== p.id).sort((a, b) => discountOf(b) - discountOf(a)).slice(0, n);
  },
  alsoBought(p: Product, n = 10) {
    // Deterministic "people also bought": neighbours from a different sub in the same group.
    const pool = products.filter((x) => x.group === p.group && x.sub !== p.sub);
    const start = (p.name.length * 7) % Math.max(pool.length, 1);
    return [...pool.slice(start), ...pool.slice(0, start)].slice(0, n);
  },
};

export function discountOf(p: Product) {
  const v = p.variants[0];
  return v.mrp > v.price ? Math.round(((v.mrp - v.price) / v.mrp) * 100) : 0;
}

// ---------- search ----------
function lev(a: string, b: string) {
  if (Math.abs(a.length - b.length) > 1) return 2;
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return dp[a.length][b.length];
}

function score(p: Product, terms: string[]) {
  const name = p.name.toLowerCase();
  const hay = `${name} ${p.brand.toLowerCase()} ${p.tags} ${categories.get(p.category)!.name.toLowerCase()} ${subs.get(p.sub)!.name.toLowerCase()}`;
  const words = hay.split(/[^a-z0-9]+/).filter(Boolean);
  let s = 0;
  for (const t of terms) {
    if (name.startsWith(t)) s += 10;
    else if (words.some((w) => w.startsWith(t))) s += 6;
    else if (hay.includes(t)) s += 3;
    else if (t.length >= 4 && words.some((w) => lev(w.slice(0, t.length + 1), t) <= 1 || lev(w, t) <= 1)) s += 2;
    else return 0;
  }
  return s;
}

export function search(q: string, limit = 40) {
  const terms = q.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  return products
    .map((p) => ({ p, s: score(p, terms) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s || discountOf(b.p) - discountOf(a.p))
    .slice(0, limit)
    .map((x) => x.p);
}

export function suggest(q: string) {
  const t = q.toLowerCase().trim();
  if (!t) return [];
  const out: { label: string; icon: string; href: string; kind: "product" | "category" }[] = [];
  for (const c of categories.values())
    if (c.name.toLowerCase().includes(t)) out.push({ label: c.name, icon: c.icon, href: `/cn/${c.slug}`, kind: "category" });
  for (const s of subs.values())
    if (s.name.toLowerCase().includes(t)) out.push({ label: s.name, icon: s.icon, href: `/cn/${s.category}?sub=${s.slug}`, kind: "category" });
  for (const p of search(t, 8)) out.push({ label: p.name, icon: p.icon, href: `/p/${p.slug}`, kind: "product" });
  return out.slice(0, 8);
}
