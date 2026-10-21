"use client";
import { useEffect, useRef, useState } from "react";
import { useCart } from "./store";
import type { Quote } from "@/lib/types";

/** Server-priced view of the local cart. Re-runs when the cart, tip or coupon changes. */
export function useQuote(opts: { tip?: number; coupon?: string } = {}) {
  const { lines } = useCart();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const key = JSON.stringify([lines.map((l) => [l.variantId, l.qty]), opts.tip ?? 0, opts.coupon ?? ""]);
  const seq = useRef(0);

  useEffect(() => {
    const n = ++seq.current;
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const r = await fetch("/api/cart/quote", {
          method: "POST", headers: { "content-type": "application/json" },
          body: JSON.stringify({ lines: lines.map((l) => ({ variantId: l.variantId, qty: l.qty })), tip: opts.tip ?? 0, coupon: opts.coupon }),
        });
        const q = (await r.json()) as Quote;
        if (n === seq.current) { setQuote(q); setError(false); }
      } catch {
        if (n === seq.current) setError(true);
      } finally {
        if (n === seq.current) setLoading(false);
      }
    }, 150);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { quote, error, loading, lines };
}
