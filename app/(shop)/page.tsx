import Link from "next/link";
import { catalog } from "@/lib/catalog";
import { currentLocation } from "@/lib/location";
import { stockFor } from "@/lib/inventory";
import { toCard } from "@/lib/dto";
import { STORES } from "@/lib/geo";
import { Rail } from "@/components/shop/Rail";
import { LocationPrompt } from "@/components/shop/LocationPrompt";
import { NotServiceable } from "@/components/shop/NotServiceable";

export default async function Home() {
  const { svc } = await currentLocation();
  const eta = svc?.ok ? svc.etaMin : null;
  const rails = catalog.collections().map((c) => catalog.collection(c.slug)!).filter((c) => c.slug !== "party-pack");
  const stock = await stockFor(svc?.ok ? svc.store.id : null, rails.flatMap((r) => r.products));
  const cities = [...new Set(STORES.map((s) => s.city))];
  const [hero, ...minis] = catalog.banners();

  return (
    <>
      <LocationPrompt />
      <NotServiceable cities={cities} />

      {/* banners */}
      <section aria-label="Offers" className="no-scrollbar mt-3 flex snap-x gap-3 overflow-x-auto px-3 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
        {[hero, ...minis].map((b, i) => (
          <Link key={b.title} href={b.href} className={`relative flex h-40 w-[85%] shrink-0 snap-start flex-col justify-between overflow-hidden rounded-lg p-4 md:w-auto ${i === 0 ? "md:col-span-3 md:h-56 md:p-8" : ""}`} style={{ background: b.tint }}>
            <div className="relative z-10 max-w-[65%]">
              <p className={`font-extrabold leading-tight ${i === 0 ? "text-xl md:text-4xl" : "text-lg"}`}>{b.title}</p>
              <p className="mt-1 text-xs text-muted md:text-sm">{b.body}</p>
            </div>
            <span className="relative z-10 w-fit rounded-sm bg-text px-3 py-1.5 text-xs font-bold text-bg">{b.cta}</span>
            <span aria-hidden className={`absolute -right-2 bottom-1 select-none leading-none ${i === 0 ? "text-6xl md:text-[110px]" : "text-5xl"}`}>{b.art}</span>
          </Link>
        ))}
      </section>

      {/* categories by group */}
      {catalog.groups().map((g) => (
        <section key={g.slug} className="px-3 pt-6 md:px-0" aria-labelledby={`g-${g.slug}`}>
          <h2 id={`g-${g.slug}`} className="mb-3 text-lg font-extrabold md:text-xl">{g.name}</h2>
          <ul className="grid grid-cols-4 gap-x-2 gap-y-4 md:grid-cols-8 md:gap-4">
            {g.categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/cn/${c.slug}`} className="group block text-center">
                  <span className="grid aspect-square place-items-center rounded-md text-4xl transition-transform group-active:scale-95 md:text-5xl" style={{ background: c.tint }} aria-hidden>{c.icon}</span>
                  <span className="mt-1.5 line-clamp-2 block text-xs font-bold leading-4 md:text-[13px]">{c.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {/* storefronts */}
      <section className="pt-7" aria-labelledby="stores-h">
        <h2 id="stores-h" className="mb-3 px-3 text-lg font-extrabold md:px-0 md:text-xl">Shop by store</h2>
        <ul className="no-scrollbar flex gap-3 overflow-x-auto px-3 md:grid md:grid-cols-8 md:px-0">
          {catalog.storefronts().map((s) => (
            <li key={s.slug} className="w-[92px] shrink-0 md:w-auto">
              <Link href={s.href} className="block text-center">
                <span className="grid h-20 place-items-center rounded-md text-4xl" style={{ background: s.tint }} aria-hidden>{s.icon}</span>
                <span className="mt-1.5 block text-xs font-bold leading-4">{s.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="pt-4">
        {rails.map((r) => (
          <Rail key={r.slug} title={r.title} href={`/c/${r.slug}`} eta={eta} products={r.products.map((p) => toCard(p, stock))} />
        ))}
      </div>
    </>
  );
}
