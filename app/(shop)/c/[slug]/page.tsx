import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { catalog } from "@/lib/catalog";
import { currentLocation } from "@/lib/location";
import { stockFor } from "@/lib/inventory";
import { toCard } from "@/lib/dto";
import { ProductCard } from "@/components/shop/ProductCard";

export async function generateMetadata(props: PageProps<"/c/[slug]">): Promise<Metadata> {
  return { title: catalog.collection((await props.params).slug)?.title ?? "Collection" };
}

export default async function CollectionPage(props: PageProps<"/c/[slug]">) {
  const c = catalog.collection((await props.params).slug);
  if (!c) notFound();
  const { svc } = await currentLocation();
  const stock = await stockFor(svc?.ok ? svc.store.id : null, c.products);
  return (
    <div className="px-3 py-4 md:px-0">
      <h1 className="mb-4 text-xl font-extrabold md:text-2xl">{c.title}</h1>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 md:gap-3 lg:grid-cols-6">
        {c.products.map((p) => <li key={p.slug}><ProductCard p={toCard(p, stock)} eta={svc?.ok ? svc.etaMin : null} /></li>)}
      </ul>
    </div>
  );
}
