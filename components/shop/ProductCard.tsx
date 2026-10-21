import Link from "next/link";
import { Timer } from "lucide-react";
import type { CardProduct } from "@/lib/dto";
import { inr, pctOff } from "@/lib/money";
import { ProductArt } from "./ProductArt";
import { AddToCart } from "./AddToCart";

export function ProductCard({ p, eta, variant = "grid", sponsored = false }: { p: CardProduct; eta: number | null; variant?: "grid" | "rail"; sponsored?: boolean }) {
  const v = p.variants[0];
  const off = pctOff(v.price, v.mrp);
  const soldOut = p.variants.every((x) => x.stock <= 0);
  return (
    <article className={`relative flex flex-col rounded-md border border-border bg-bg p-2 shadow-card ${variant === "rail" ? "w-[148px] shrink-0 md:w-[180px]" : ""}`}>
      <Link href={`/p/${p.slug}`} className="block" tabIndex={-1} aria-hidden>
        <ProductArt icon={p.icon} tint={p.tint} dim={soldOut} />
      </Link>
      {off > 0 && !soldOut && (
        <span className="absolute left-2 top-2 rounded-br-sm rounded-tl-sm bg-deal px-1.5 py-1 text-center text-2xs font-extrabold leading-tight text-on-deal">
          {off}%<br />OFF
        </span>
      )}
      {sponsored && <span className="absolute right-3 top-3 rounded-xs bg-bg/90 px-1 text-2xs font-semibold text-muted">Ad</span>}
      <div className="mt-2 flex flex-1 flex-col">
        {eta && (
          <span className="mb-1 inline-flex w-fit items-center gap-0.5 rounded-xs bg-surface px-1 py-0.5 text-2xs font-extrabold uppercase text-text">
            <Timer size={10} strokeWidth={3} aria-hidden /> {eta} mins
          </span>
        )}
        <h3 className="line-clamp-2 min-h-[2.5rem] text-[13px] font-bold leading-5">
          <Link href={`/p/${p.slug}`} className="hover:underline">{p.name}</Link>
        </h3>
        <p className="mt-0.5 truncate text-xs text-muted">{v.unit}</p>
        <div className="mt-auto flex items-end justify-between gap-1 pt-2">
          <p className="leading-tight">
            <span className="block text-[13px] font-extrabold">{inr(v.price)}</span>
            {off > 0 && <s className="block text-xs text-faint">{inr(v.mrp)}</s>}
          </p>
          {soldOut ? <span className="pb-1 text-xs font-bold text-danger">Out of stock</span> : <AddToCart p={p} />}
        </div>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-md border border-border bg-bg p-2">
      <div className="skeleton aspect-square w-full rounded-sm" />
      <div className="skeleton mt-3 h-3 w-4/5 rounded-xs" />
      <div className="skeleton mt-2 h-3 w-2/5 rounded-xs" />
      <div className="mt-4 flex justify-between"><div className="skeleton h-4 w-10 rounded-xs" /><div className="skeleton h-8 w-16 rounded-sm" /></div>
    </div>
  );
}
