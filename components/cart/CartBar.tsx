"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, ShoppingCart } from "lucide-react";
import { useCartTotals } from "./store";
import { inr } from "@/lib/money";

/** Floating cart pill (mobile). Desktop shows the cart in the header. */
export function CartBar() {
  const { count, total } = useCartTotals();
  const onProduct = usePathname().startsWith("/p/");
  if (!count) return null;
  return (
    <div className={`pointer-events-none fixed inset-x-0 z-40 ${onProduct ? "bottom-[92px]" : "bottom-3"} flex justify-center px-3 md:hidden`}>
      <Link
        href="/cart"
        key={count}
        aria-label={`View cart, ${count} items, ${inr(total)}`}
        className="pointer-events-auto flex h-14 w-full max-w-md items-center gap-3 rounded-md bg-accent px-3 text-on-accent shadow-pop animate-bump"
      >
        <span className="grid size-9 place-items-center rounded-sm bg-on-accent/15"><ShoppingCart size={20} aria-hidden /></span>
        <span className="leading-tight">
          <span className="block text-xs font-semibold">{count} item{count > 1 ? "s" : ""}</span>
          <span className="block text-sm font-extrabold">{inr(total)}</span>
        </span>
        <span className="ml-auto flex items-center gap-0.5 text-base font-extrabold">View cart <ChevronRight size={18} /></span>
      </Link>
    </div>
  );
}
