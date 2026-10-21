import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BadgeCheck, ChevronRight, RotateCcw, Zap } from "lucide-react";
import { catalog } from "@/lib/catalog";
import { currentLocation } from "@/lib/location";
import { stockFor } from "@/lib/inventory";
import { toCard } from "@/lib/dto";
import { inr } from "@/lib/money";
import { ProductArt } from "@/components/shop/ProductArt";
import { BuyBox } from "@/components/shop/BuyBox";
import { Rail } from "@/components/shop/Rail";

export async function generateMetadata(props: PageProps<"/p/[slug]">): Promise<Metadata> {
  const p = catalog.product((await props.params).slug);
  return p ? { title: `${p.name} (${p.variants[0].unit}) at ${inr(p.variants[0].price)}`, description: `Order ${p.name} from ${p.brand} for quick delivery.` } : {};
}

const PROMISES = [
  { icon: Zap, title: "Delivered in minutes", body: "Packed at a store a few streets away, not a warehouse across town." },
  { icon: BadgeCheck, title: "Fair, upfront prices", body: "Every fee is shown before you pay. No surprises at the door." },
  { icon: RotateCcw, title: "Problem? Instant refund", body: "Missing or damaged item? Report it with a photo and get refunded on the spot." },
];

export default async function ProductPage(props: PageProps<"/p/[slug]">) {
  const p = catalog.product((await props.params).slug);
  if (!p) notFound();
  const cat = catalog.category(p.category)!;
  const sub = catalog.sub(p.sub)!;
  const similar = catalog.similar(p), top = catalog.topInCategory(p), also = catalog.alsoBought(p);
  const { svc } = await currentLocation();
  const eta = svc?.ok ? svc.etaMin : null;
  const stock = await stockFor(svc?.ok ? svc.store.id : null, [p, ...similar, ...top, ...also]);
  const card = toCard(p, stock);

  return (
    <div className="pb-20 md:pb-0">
      <nav aria-label="Breadcrumb" className="hidden pt-4 text-xs font-semibold text-muted md:block">
        <ol className="flex items-center gap-1">
          <li><Link href="/" className="hover:text-text">Home</Link></li><ChevronRight size={12} aria-hidden />
          <li><Link href={`/cn/${cat.slug}`} className="hover:text-text">{cat.name}</Link></li><ChevronRight size={12} aria-hidden />
          <li><Link href={`/cn/${cat.slug}?sub=${sub.slug}`} className="hover:text-text">{sub.name}</Link></li><ChevronRight size={12} aria-hidden />
          <li aria-current="page" className="truncate text-text">{p.name}</li>
        </ol>
      </nav>
      <div className="md:mt-4 md:grid md:grid-cols-2 md:gap-10">
        <div className="md:sticky md:top-[100px] md:self-start">
          <div className="bg-bg p-4 md:rounded-lg md:border md:border-border md:p-8">
            <ProductArt icon={p.icon} tint={p.tint} size="xl" label={p.name} dim={card.variants.every((v) => v.stock <= 0)} />
          </div>
        </div>
        <div className="px-4 pt-2 md:px-0">
          <BuyBox p={card} eta={eta} />

          <details className="group mt-6 rounded-md border border-border bg-bg" open>
            <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-extrabold">
              Product details <ChevronRight size={16} className="transition-transform group-open:rotate-90" aria-hidden />
            </summary>
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 border-t border-border px-4 py-3 text-sm">
              {Object.entries({ Category: sub.name, ...p.info }).map(([k, v]) => (
                <div key={k} className="contents"><dt className="text-muted">{k}</dt><dd className="font-semibold">{v}</dd></div>
              ))}
            </dl>
          </details>

          <Link href={`/s?q=${encodeURIComponent(p.brand)}`} className="mt-3 flex items-center justify-between rounded-md border border-border bg-bg px-4 py-3 text-sm">
            <span><span className="block text-xs text-muted">Brand</span><span className="font-extrabold">{p.brand}</span></span>
            <span className="flex items-center gap-0.5 font-bold text-accent">See all <ChevronRight size={16} /></span>
          </Link>

          <section className="mt-6 hidden md:block" aria-labelledby="why-h">
            <h2 id="why-h" className="mb-3 text-base font-extrabold">Why order with us</h2>
            <ul className="space-y-3">
              {PROMISES.map(({ icon: I, title, body }) => (
                <li key={title} className="flex gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand/40"><I size={18} aria-hidden /></span>
                  <span><b className="block text-sm">{title}</b><span className="text-xs text-muted">{body}</span></span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
      <div className="mt-6 space-y-2">
        <Rail title="Similar products" products={similar.map((x) => toCard(x, stock))} eta={eta} />
        <Rail title={`More from ${cat.name}`} href={`/cn/${cat.slug}`} products={top.map((x) => toCard(x, stock))} eta={eta} />
        <Rail title="Often bought together" products={also.map((x) => toCard(x, stock))} eta={eta} />
      </div>
    </div>
  );
}
