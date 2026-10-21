import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { catalog, discountOf } from "@/lib/catalog";
import { currentLocation } from "@/lib/location";
import { stockFor } from "@/lib/inventory";
import { toCard } from "@/lib/dto";
import { ProductCard } from "@/components/shop/ProductCard";

export async function generateMetadata(props: PageProps<"/cn/[slug]">): Promise<Metadata> {
  const c = catalog.category((await props.params).slug);
  return { title: c ? `Buy ${c.name} online` : "Category" };
}

const SORTS = [
  { key: "relevance", label: "Relevance" },
  { key: "price", label: "Price: low to high" },
  { key: "discount", label: "Biggest discount" },
] as const;

export default async function CategoryPage(props: PageProps<"/cn/[slug]">) {
  const { slug } = await props.params;
  const sp = await props.searchParams;
  const cat = catalog.category(slug);
  if (!cat) notFound();
  const sub = typeof sp.sub === "string" && cat.subs.some((s) => s.slug === sp.sub) ? sp.sub : undefined;
  const sort = SORTS.find((s) => s.key === sp.sort)?.key ?? "relevance";
  const { svc } = await currentLocation();
  const eta = svc?.ok ? svc.etaMin : null;
  let list = catalog.inCategory(cat.slug, sub);
  if (sort === "price") list = [...list].sort((a, b) => a.variants[0].price - b.variants[0].price);
  if (sort === "discount") list = [...list].sort((a, b) => discountOf(b) - discountOf(a));
  const stock = await stockFor(svc?.ok ? svc.store.id : null, list);
  const cards = list.map((p) => toCard(p, stock));
  // sold-out items sink to the bottom
  cards.sort((a, b) => Number(a.variants.every((v) => v.stock <= 0)) - Number(b.variants.every((v) => v.stock <= 0)));
  const subName = sub ? catalog.sub(sub)!.name : `All ${cat.name}`;
  const q = (o: Record<string, string | undefined>) => {
    const u = new URLSearchParams();
    const merged = { sub, sort: sort === "relevance" ? undefined : sort, ...o };
    for (const [k, v] of Object.entries(merged)) if (v) u.set(k, v);
    const s = u.toString();
    return `/cn/${cat.slug}${s ? "?" + s : ""}`;
  };

  return (
    <div className="md:pt-4">
      <div className="flex items-center justify-between border-b border-border bg-bg px-3 py-2.5 md:rounded-t-md md:border md:px-4">
        <h1 className="text-sm font-extrabold md:text-lg">{cat.name}</h1>
        <nav aria-label="Sort" className="no-scrollbar flex gap-1.5 overflow-x-auto">
          {SORTS.map((s) => (
            <Link key={s.key} href={q({ sort: s.key === "relevance" ? undefined : s.key })} aria-current={s.key === sort ? "true" : undefined}
              className={`whitespace-nowrap rounded-pill border px-2.5 py-1 text-xs font-bold ${s.key === sort ? "border-accent bg-accent-soft text-accent" : "border-border text-muted hover:border-input"}`}>
              {s.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex md:border-x md:border-b md:border-border">
        <nav aria-label={`${cat.name} sub-categories`} className="no-scrollbar sticky top-16 h-[calc(100dvh-4rem)] w-20 shrink-0 overflow-y-auto border-r border-border bg-bg pb-24 md:top-[84px] md:h-[calc(100dvh-84px)] md:w-[200px]">
          <ul>
            {[{ slug: undefined, name: "All", icon: cat.icon }, ...cat.subs].map((s) => {
              const active = s.slug === sub;
              return (
                <li key={s.slug ?? "all"}>
                  <Link href={q({ sub: s.slug })} aria-current={active ? "page" : undefined}
                    className={`relative flex flex-col items-center gap-1 px-1 py-3 text-center md:flex-row md:gap-3 md:px-3 md:text-left ${active ? "bg-accent-soft/60" : "hover:bg-surface"}`}>
                    {active && <span aria-hidden className="absolute inset-y-2 right-0 w-1 rounded-l-sm bg-accent" />}
                    <span aria-hidden className="grid size-12 place-items-center rounded-md text-2xl md:size-10" style={{ background: cat.tint }}>{s.icon}</span>
                    <span className={`text-[11px] leading-tight md:text-sm ${active ? "font-extrabold text-text" : "font-semibold text-muted"}`}>{s.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <section className="min-w-0 flex-1 bg-surface p-2 md:p-4" aria-label={subName}>
          <h2 className="sr-only">{subName}</h2>
          {cards.length ? (
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5 md:gap-3">
              {cards.map((p) => <li key={p.slug} className="flex"><div className="w-full"><ProductCard p={p} eta={eta} /></div></li>)}
            </ul>
          ) : (
            <p className="py-16 text-center text-sm text-muted">Nothing here yet. Check back soon.</p>
          )}
        </section>
      </div>
    </div>
  );
}
