import Link from "next/link";
import type { CardProduct } from "@/lib/dto";
import { ProductCard } from "./ProductCard";

export function Rail({ title, href, products, eta }: { title: string; href?: string; products: CardProduct[]; eta: number | null }) {
  if (!products.length) return null;
  return (
    <section className="pt-6" aria-label={title}>
      <div className="mb-3 flex items-center justify-between px-3 md:px-0">
        <h2 className="text-[17px] font-extrabold leading-5 text-text md:text-2xl">{title}</h2>
        {href && <Link href={href} className="text-[13px] font-semibold text-add md:text-lg">see all</Link>}
      </div>
      <div className="no-scrollbar flex items-stretch gap-3 overflow-x-auto px-3 pb-1 md:px-0">
        {products.map((p) => <ProductCard key={p.slug} p={p} eta={eta} variant="rail" />)}
      </div>
    </section>
  );
}
