import "server-only";
import { writeFileSync, mkdirSync } from "fs";
import { COLLECTIONS, STOREFRONTS, BANNERS, SEARCH_HINTS } from "./data";
import { dbSync } from "../db/local";
import { seedCatalog } from "./seed";
import type { CatalogData } from "./model";

export type Variant = { id: string; productId: string; unit: string; mrp: number; price: number; baseStock: number };
export type Product = {
  id: string; slug: string; name: string; brand: string; icon: string; tint: string; active: boolean;
  group: string; category: string; sub: string; tags: string; variants: Variant[]; info: Record<string, string>;
};
export type Sub = { slug: string; name: string; icon: string; category: string };
export type Category = { slug: string; name: string; icon: string; tint: string; group: string; subs: Sub[] };
export type Group = { slug: string; name: string; categories: Category[] };

type Index = {
  version: number; groups: Group[]; categories: Map<string, Category>; subs: Map<string, Sub>;
  all: Product[]; live: Product[]; bySlug: Map<string, Product>; byId: Map<string, Product>;
  variants: Map<string, { product: Product; variant: Variant }>;
};
const g = globalThis as unknown as { __turantCatalog?: Index };

/** The stored catalogue, seeding it from the demo data the first time. */
export function catalogData(): CatalogData {
  const db = dbSync();
  if (!db.catalog) {
    db.catalog = seedCatalog();
    db.catalogVersion = (db.catalogVersion || 0) + 1;
    try {
      // persist the seed right away so admin edits have something to change
      const dir = process.env.DATA_DIR || (process.env.NETLIFY || process.env.VERCEL ? "/tmp/turant" : `${process.cwd()}/.data`);
      mkdirSync(dir, { recursive: true });
      writeFileSync(`${dir}/db.json`, JSON.stringify(db, null, 1));
    } catch {}
  }
  return db.catalog;
}

function index(): Index {
  const db = dbSync();
  const data = catalogData();
  if (g.__turantCatalog && g.__turantCatalog.version === db.catalogVersion) return g.__turantCatalog;

  const cats = new Map<string, Category>();
  const subs = new Map<string, Sub>();
  const groups: Group[] = [...data.groups].sort((a, b) => a.sort - b.sort).map((x) => ({ slug: x.slug, name: x.name, categories: [] }));
  for (const c of [...data.categories].sort((a, b) => a.sort - b.sort)) {
    if (!c.active) continue;
    const cat: Category = { slug: c.slug, name: c.name, icon: c.icon, tint: c.tint, group: c.group, subs: [] };
    cats.set(c.slug, cat);
    groups.find((x) => x.slug === c.group)?.categories.push(cat);
  }
  for (const s of [...data.subs].sort((a, b) => a.sort - b.sort)) {
    const cat = cats.get(s.category);
    if (!s.active || !cat) continue;
    const sub: Sub = { slug: s.slug, name: s.name, icon: s.icon, category: s.category };
    subs.set(s.slug, sub);
    cat.subs.push(sub);
  }
  const all: Product[] = data.products.map((p) => {
    const cat = data.categories.find((c) => c.slug === p.category);
    return {
      id: p.id, slug: p.slug, name: p.name, brand: p.brand, icon: p.icon, tint: cat?.tint ?? "#eef0f4",
      active: p.active && !!cats.get(p.category) && !!subs.get(p.sub),
      group: cat?.group ?? "", category: p.category, sub: p.sub, tags: p.tags,
      info: { Brand: p.brand, ...p.info },
      variants: p.variants.map((v) => ({ ...v, productId: p.id })),
    };
  });
  const live = all.filter((p) => p.active);
  const idx: Index = {
    version: db.catalogVersion, groups: groups.filter((x) => x.categories.length), categories: cats, subs,
    all, live, bySlug: new Map(all.map((p) => [p.slug, p])), byId: new Map(all.map((p) => [p.id, p])),
    variants: new Map(all.flatMap((p) => p.variants.map((v) => [v.id, { product: p, variant: v }] as const))),
  };
  g.__turantCatalog = idx;
  return idx;
}

export const catalog = {
  groups: () => index().groups,
  category: (slug: string) => index().categories.get(slug),
  sub: (slug: string) => index().subs.get(slug),
  allCategories: () => [...index().categories.values()],
  /** Live product by slug (inactive products 404 in the shop). */
  product: (slug: string) => { const p = index().bySlug.get(slug); return p?.active ? p : undefined; },
  /** Any variant, including inactive products, so old orders and carts still resolve. */
  variant: (id: string) => index().variants.get(id),
  all: () => index().live,
  everything: () => index().all,
  inCategory: (cat: string, sub?: string) => index().live.filter((p) => p.category === cat && (!sub || p.sub === sub)),
  storefronts: () => STOREFRONTS,
  banners: () => BANNERS,
  searchHints: () => SEARCH_HINTS,
  collections: () => COLLECTIONS,
  collection(slug: string) {
    const c = COLLECTIONS.find((x) => x.slug === slug);
    if (!c) return undefined;
    let list = index().live;
    const r = c.rule || {};
    if (r.groups) list = list.filter((p) => r.groups!.includes(p.group));
    if (r.categories) list = list.filter((p) => r.categories!.includes(p.category));
    if (r.subs) list = list.filter((p) => r.subs!.includes(p.sub));
    if (r.minDiscount) list = list.filter((p) => discountOf(p) >= r.minDiscount!).sort((a, b) => discountOf(b) - discountOf(a));
    return { ...c, products: list.slice(0, c.limit ?? 30) };
  },
  similar(p: Product, n = 8) {
    return index().live.filter((x) => x.sub === p.sub && x.id !== p.id).slice(0, n);
  },
  topInCategory(p: Product, n = 10) {
    return index().live.filter((x) => x.category === p.category && x.id !== p.id).sort((a, b) => discountOf(b) - discountOf(a)).slice(0, n);
  },
  alsoBought(p: Product, n = 10) {
    const pool = index().live.filter((x) => x.group === p.group && x.sub !== p.sub);
    const start = (p.name.length * 7) % Math.max(pool.length, 1);
    return [...pool.slice(start), ...pool.slice(0, start)].slice(0, n);
  },
};

export function discountOf(p: Product) {
  const v = p.variants[0];
  return v && v.mrp > v.price ? Math.round(((v.mrp - v.price) / v.mrp) * 100) : 0;
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
  const { categories, subs } = index();
  const name = p.name.toLowerCase();
  const hay = `${name} ${p.brand.toLowerCase()} ${p.tags} ${categories.get(p.category)?.name.toLowerCase() ?? ""} ${subs.get(p.sub)?.name.toLowerCase() ?? ""}`;
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
  return index().live
    .map((p) => ({ p, s: score(p, terms) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s || discountOf(b.p) - discountOf(a.p))
    .slice(0, limit)
    .map((x) => x.p);
}

export function suggest(q: string) {
  const t = q.toLowerCase().trim();
  if (!t) return [];
  const { categories, subs } = index();
  const out: { label: string; icon: string; href: string; kind: "product" | "category" }[] = [];
  for (const c of categories.values())
    if (c.name.toLowerCase().includes(t)) out.push({ label: c.name, icon: c.icon, href: `/cn/${c.slug}`, kind: "category" });
  for (const s of subs.values())
    if (s.name.toLowerCase().includes(t)) out.push({ label: s.name, icon: s.icon, href: `/cn/${s.category}?sub=${s.slug}`, kind: "category" });
  for (const p of search(t, 8)) out.push({ label: p.name, icon: p.icon, href: `/p/${p.slug}`, kind: "product" });
  return out.slice(0, 8);
}
