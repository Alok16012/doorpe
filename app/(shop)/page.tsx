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

      {/* desktop banners (the mobile web home goes straight to categories) */}
      <section aria-label="Offers" className="hidden pt-6 md:block">
        <Link href={hero.href} className="relative flex h-[234px] items-center overflow-hidden rounded-xl px-12" style={{ background: "linear-gradient(90deg, var(--color-accent-hover) 0%, var(--color-accent) 45%, #73a9ea 100%)" }}>
          <div className="relative z-10 max-w-[520px] text-white">
            <p className="text-[40px] font-extrabold leading-[44px]">{hero.title}</p>
            <p className="mt-2 text-lg font-medium opacity-90">{hero.body}</p>
            <span className="mt-5 inline-block rounded-md bg-black px-5 py-2.5 text-sm font-semibold text-white">{hero.cta}</span>
          </div>
          <span aria-hidden className="absolute right-10 top-1/2 flex -translate-y-1/2 gap-2">
            {emojiList(hero.art).map((e) => <img key={e} src={emojiSrc(e)} alt="" className="size-36 drop-shadow-xl" />)}
          </span>
        </Link>
        <div className="mt-5 grid grid-cols-3 gap-5">
          {minis.concat(catalog.banners().slice(0, 1).map((b) => ({ ...b, title: "Snacks for every craving", body: "Chips, chocolates and cold drinks", cta: "Order now", href: "/c/late-night-cravings", tint: "#d6dbff", art: "🍟🍫🥤" }))).map((b) => (
            <Link key={b.title} href={b.href} className="relative flex h-[195px] flex-col justify-between overflow-hidden rounded-xl p-6" style={{ background: b.tint }}>
              <div className="relative z-10 max-w-[60%]">
                <p className="text-[22px] font-extrabold leading-7">{b.title}</p>
                <p className="mt-1 text-sm text-muted">{b.body}</p>
              </div>
              <span className="relative z-10 w-fit rounded-md bg-black px-3 py-1.5 text-xs font-semibold text-white">{b.cta}</span>
              <span aria-hidden className="absolute -right-1 bottom-2 flex">{emojiList(b.art).slice(0, 2).map((e) => <img key={e} src={emojiSrc(e)} alt="" className="size-20" />)}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* categories by group */}
      {catalog.groups().map((g) => (
        <section key={g.slug} className="px-2 pt-6 md:px-0 md:pt-8" aria-labelledby={`g-${g.slug}`}>
          <h2 id={`g-${g.slug}`} className="mb-3 px-1 text-[17px] font-extrabold leading-5 text-text md:mb-4 md:text-2xl">{g.name}</h2>
          <ul className="grid grid-cols-4 gap-x-2 gap-y-3 md:grid-cols-10 md:gap-4">
            {g.categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/cn/${c.slug}`} className="group block text-center">
                  <span className="block overflow-hidden rounded-lg bg-surface-tint transition-transform group-active:scale-95" style={{ aspectRatio: "83 / 90" }}>
                    <ProductArt icon={c.icon} size="sm" className="h-full !p-2.5" />
                  </span>
                  <span className="mt-1.5 line-clamp-2 block text-[13px] font-semibold leading-[15px] text-text">{c.name}</span>
                </Link>
              </li>
            ))}
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
                  <img src={emojiSrc(s.icon)} alt="" className="size-[70px] translate-y-1" loading="lazy" />
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
              <p className="mt-1 text-sm text-muted">Everything for the couch, delivered before the trailer ends</p>
            </div>
            <img src={emojiSrc("🍿")} alt="" className="size-16 shrink-0" />
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
