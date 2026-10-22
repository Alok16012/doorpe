import Link from "next/link";
import type { CardProduct } from "@/lib/dto";
import { inr, pctOff } from "@/lib/money";
import { OffBadge, ProductArt } from "./ProductArt";
import { AddToCart, UnitPicker } from "./AddToCart";

export function Timer9({ eta }: { eta: number }) {
  return (
    <span className="inline-flex w-fit items-center gap-[3px] rounded-xs bg-search px-1.5 py-[3px] text-[9px] font-bold uppercase leading-none text-text">
      <svg width="9" height="9" viewBox="0 0 12 12" aria-hidden><circle cx="6" cy="6.8" r="4.4" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M6 4.4v2.6M4.6 1h2.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
      {eta} mins
    </span>
  );
}

export function ProductCard({ p, eta, variant = "grid", sponsored = false }: { p: CardProduct; eta: number | null; variant?: "grid" | "rail"; sponsored?: boolean }) {
  const v = p.variants[0];
  const off = pctOff(v.price, v.mrp);
  const soldOut = p.variants.every((x) => x.stock <= 0);
  const rail = variant === "rail";
  return (
    <article className={`relative flex h-full flex-col bg-bg ${rail ? "w-[128px] shrink-0 md:w-[180px]" : "w-full rounded-xl border border-border p-2"}`}>
      <div className={`relative ${rail ? "rounded-xl border border-border" : "rounded-lg bg-surface/60"}`}>
        <Link href={`/p/${p.slug}`} className="block" tabIndex={-1} aria-hidden>
          <ProductArt label={p.name} icon={p.icon} dim={soldOut} />
        </Link>
        {off > 0 && !soldOut && <OffBadge pct={off} className="left-2 top-0" />}
        {soldOut
          ? <span className="absolute inset-x-2 bottom-2 rounded-xs bg-text/75 py-1 text-center text-[10px] font-bold uppercase text-bg">Out of stock</span>
          : <div className="absolute bottom-1.5 right-1.5"><AddToCart p={p} plus /></div>}
      </div>
      {sponsored && <span className="absolute right-2 top-2 rounded-xs bg-search px-1 text-[9px] font-semibold text-muted">Ad</span>}
      <div className={`flex flex-1 flex-col ${rail ? "pt-2.5" : "px-1 pb-1 pt-2.5"}`}>
        <div className="flex items-center gap-1.5">
          {eta ? <Timer9 eta={eta} /> : null}
          {off >= 20 && <span className="text-[10px] font-bold text-success">{off}% off</span>}
        </div>
        <h3 className="mt-1.5 line-clamp-2 min-h-[30px] text-[13px] font-semibold leading-[15px] text-text">
          <Link href={`/p/${p.slug}`}>{p.name}</Link>
        </h3>
        {rail && p.variants.length > 1 && !soldOut
          ? <div className="mt-1"><UnitPicker p={p} /></div>
          : <p className="mt-1 truncate text-xs font-medium text-muted">{v.unit}</p>}
        <p className="mt-auto flex items-baseline gap-1.5 pt-2 leading-none">
          <span className="text-[14px] font-bold text-text">{inr(v.price)}</span>
          {off > 0 && <s className="text-xs font-medium text-faint">{inr(v.mrp)}</s>}
        </p>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-bg p-2">
      <div className="skeleton aspect-square w-full rounded-md" />
      <div className="skeleton mt-3 h-3 w-4/5 rounded-xs" />
      <div className="skeleton mt-2 h-3 w-2/5 rounded-xs" />
      <div className="mt-4 flex justify-between"><div className="skeleton h-4 w-10 rounded-xs" /><div className="skeleton h-8 w-16 rounded-sm" /></div>
    </div>
  );
}
