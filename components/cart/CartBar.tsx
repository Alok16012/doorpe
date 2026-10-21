"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, ShoppingCart } from "lucide-react";
import { useCartTotals } from "./store";
import { inr } from "@/lib/money";

/** Floating green cart bar (mobile). Desktop shows the cart in the header. */
export function CartBar({ freeAbove }: { freeAbove?: number }) {
  const { count, total } = useCartTotals();
  const onProduct = usePathname().startsWith("/p/");
  if (!count)
    return freeAbove && !onProduct ? (
      <p className="fixed inset-x-0 bottom-0 z-40 bg-accent-soft py-2 text-center text-xs font-semibold text-text shadow-bar md:hidden">
        <b className="font-extrabold text-accent">FREE DELIVERY</b> on orders above {inr(freeAbove)}
      </p>
    ) : null;
  return (
    <div className={`pointer-events-none fixed inset-x-0 z-40 flex justify-center px-3 md:hidden ${onProduct ? "bottom-[84px]" : "bottom-3"}`}>
      <Link href="/cart" key={count} aria-label={`View cart, ${count} items, ${inr(total)}`}
        className="pointer-events-auto relative flex h-[52px] w-full max-w-md items-center gap-2.5 rounded-xl bg-accent py-2 pl-3 pr-[18px] text-on-accent animate-bump">
        <span className="grid size-9 place-items-center rounded-md bg-white/15"><ShoppingCart size={20} aria-hidden /></span>
        <span className="leading-[14px]">
          <span className="block text-xs font-bold">{count} item{count > 1 ? "s" : ""}</span>
          <span className="block text-[13px] font-extrabold">{inr(total)}</span>
        </span>
        <span className="ml-auto flex items-center text-base font-semibold">View Cart <ChevronRight size={18} strokeWidth={2.5} /></span>
        {freeAbove && total < freeAbove && <span className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-pill bg-bg px-3 py-1 text-[11px] font-semibold text-text shadow-pop">Add {inr(freeAbove - total)} more for <b className="text-accent">FREE delivery</b></span>}
      </Link>
    </div>
  );
}
