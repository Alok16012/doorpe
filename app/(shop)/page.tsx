import Link from "next/link";
import { catalog } from "@/lib/catalog";
import { currentLocation } from "@/lib/location";
import { stockFor } from "@/lib/inventory";
import { toCard } from "@/lib/dto";
import { STORES } from "@/lib/geo";
import { emojiList, emojiSrc } from "@/lib/emoji";
import { Rail } from "@/components/shop/Rail";
import { LocationPrompt } from "@/components/shop/LocationPrompt";
import { NotServiceable } from "@/components/shop/NotServiceable";
import { ProductArt } from "@/components/shop/ProductArt";
import { CategoryCard } from "@/components/shop/CategoryCard";

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

      {/* Shared offers, with stacked cards on phones and a three-column layout on larger screens. */}
      <section aria-label="Offers" className="px-3 pt-4 md:px-0 md:pt-6">
        <Link href={hero.href} className="grid gap-5 overflow-hidden rounded-xl p-5 sm:grid-cols-2 sm:items-center md:min-h-[234px] md:gap-8 md:px-8 md:py-6 lg:px-12" style={{ background: "linear-gradient(100deg, var(--color-hero-from) 0%, var(--color-hero-mid) 55%, #3a5299 100%)" }}>
          <div className="min-w-0 text-white">
            <p className="text-[26px] font-extrabold leading-[30px] md:text-[32px] md:leading-9 lg:text-[40px] lg:leading-[44px]">{hero.title}</p>
            <p className="mt-2 text-sm font-medium opacity-90 md:text-base lg:text-lg">{hero.body}</p>
            <span className="mt-4 inline-block rounded-md bg-black px-4 py-2.5 text-xs font-semibold text-white md:mt-5 md:px-5 md:text-sm">{hero.cta}</span>
          </div>
          <span aria-hidden className="grid w-full max-w-[448px] grid-cols-3 gap-2 sm:justify-self-end">
            {emojiList(hero.art).map((e) => <img key={e} src={emojiSrc(e)} alt="" className="aspect-square w-full rounded-xl object-cover shadow-xl md:rounded-2xl" />)}
          </span>
        </Link>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3 md:mt-5 md:gap-5">
          {minis.concat(catalog.banners().slice(0, 1).map((b) => ({ ...b, title: "Snacks for every craving", body: "Chips, chocolates and cold drinks", cta: "Order now", href: "/c/late-night-cravings", tint: "#d6dbff", art: "🍟🍫🥤" }))).map((b) => (
            <Link key={b.title} href={b.href} className="relative flex min-h-[180px] flex-col justify-between gap-4 overflow-hidden rounded-xl p-4 sm:min-h-[220px] md:min-h-[195px] md:p-6" style={{ background: b.tint }}>
              <div className="relative z-10 max-w-[60%] sm:max-w-full md:max-w-[60%]">
                <p className="text-xl font-extrabold leading-6 sm:text-lg md:text-[22px] md:leading-7">{b.title}</p>
                <p className="mt-1 text-sm text-muted sm:text-xs md:text-sm">{b.body}</p>
              </div>
              <span className="relative z-10 w-fit rounded-md bg-black px-3 py-1.5 text-xs font-semibold text-white">{b.cta}</span>
              <span aria-hidden className="absolute bottom-3 right-3 flex sm:bottom-4 sm:right-2 md:-right-1 md:bottom-2">{emojiList(b.art).slice(0, 2).map((e) => <img key={e} src={emojiSrc(e)} alt="" className="size-14 rounded-xl object-cover shadow-sm sm:size-10 md:size-14 lg:size-20" />)}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* All shopping groups remain available at every screen size. */}
      {catalog.groups().map((g) => (
        <section key={g.slug} className="px-3 pt-6 md:px-0 md:pt-8" aria-labelledby={`g-${g.slug}`}>
          <h2 id={`g-${g.slug}`} className="mb-3 px-1 text-[17px] font-extrabold leading-5 text-text md:mb-4 md:text-2xl">{g.name}</h2>
          <ul className="grid grid-cols-4 gap-2 md:grid-cols-8 md:gap-4">
            {g.categories.map((c) => <li key={c.slug}><CategoryCard href={`/cn/${c.slug}`} name={c.name} icon={c.icon} /></li>)}
          </ul>
        </section>
      ))}

      {/* storefronts */}
      <section className="pt-6 md:pt-8" aria-labelledby="stores-h">
        <h2 id="stores-h" className="mb-3 px-4 text-[17px] font-extrabold leading-5 md:px-0 md:text-2xl">Shop by store</h2>
        <ul className="no-scrollbar flex gap-3 overflow-x-auto px-4 md:grid md:grid-cols-8 md:px-0">
          {catalog.storefronts().map((s) => (
            <li key={s.slug} className="w-[90px] shrink-0 md:w-auto">
              <Link href={s.href} className="block text-center">
                <span className="flex h-[90px] items-end justify-center overflow-hidden rounded-lg" style={{ background: `linear-gradient(180deg, ${s.tint} 0%, color-mix(in srgb, ${s.tint} 70%, #000 6%) 100%)` }}>
                  <img src={emojiSrc(s.icon)} alt="" className="size-[76px] rounded-t-xl object-cover" loading="lazy" />
                </span>
                <span className="mt-2 block text-[13px] font-semibold leading-[15px] text-text">{s.name.split(" ")[0]}<br />{s.name.split(" ").slice(1).join(" ") || "Store"}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="pb-4">
        {rails.slice(0, 2).map((r) => (
          <Rail key={r.slug} title={r.title} href={`/c/${r.slug}`} eta={eta} products={r.products.map((p) => toCard(p, stock))} />
        ))}
        <section className="mt-8 bg-surface-tint px-4 pb-6 pt-5 md:rounded-xl md:px-6" aria-labelledby="theme-h">
          <div className="flex items-center justify-between">
            <div>
              <h2 id="theme-h" className="text-[17px] font-extrabold leading-5 text-text md:text-2xl">Movie night sorted</h2>
              <p className="mt-1 text-sm text-muted sm:text-xs md:text-sm">Everything for the couch, delivered before the trailer ends</p>
            </div>
            <img src={emojiSrc("🍿")} alt="" className="size-16 shrink-0 rounded-xl object-cover" />
          </div>
          <ul className="mt-4 grid grid-cols-4 gap-2 md:gap-4">
            {[["popcorn", "chips-namkeen", "Popcorn & Popped"], ["chips", "chips-namkeen", "Chips & Crisps"], ["soft-drinks", "drinks-juices", "Cold Drinks"], ["tubs", "ice-creams", "Ice Cream Tubs"]].map(([sub, cat, label]) => (
              <li key={sub}>
                <Link href={`/cn/${cat}?sub=${sub}`} className="block text-center">
                  <span className="block overflow-hidden rounded-lg bg-bg"><ProductArt icon={catalog.sub(sub)!.icon} size="sm" className="!p-3" /></span>
                  <span className="mt-1.5 line-clamp-2 block text-xs font-semibold leading-[14px] text-text">{label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
        {rails.slice(2).map((r) => (
          <Rail key={r.slug} title={r.title} href={`/c/${r.slug}`} eta={eta} products={r.products.map((p) => toCard(p, stock))} />
        ))}
      </div>
    </>
  );
}
