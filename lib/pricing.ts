import "server-only";
import { catalog } from "./catalog";
import { fees, liveCoupons } from "./settings";
import { read } from "./db/local";
import type { CartLine, Quote, QuoteLine, User } from "./types";
import type { Serviceability } from "./geo";

export const MAX_PER_ITEM = 10;

/** Server-side price of a cart. Prices never come from the client. */
export async function quote(
  lines: CartLine[],
  opts: { svc: Serviceability | null; tip?: number; couponCode?: string; user?: User | null },
): Promise<Quote> {
  const FEES = fees();
  const storeId = opts.svc?.ok ? opts.svc.store.id : null;
  const overrides = storeId ? await read((db) => db.stock[storeId] || {}) : {};
  const out: QuoteLine[] = [];
  for (const l of lines) {
    const hit = catalog.variant(l.variantId);
    if (!hit || l.qty <= 0) continue;
    const { product: p, variant: v } = hit;
    const available = p.active ? overrides[v.id] ?? v.baseStock : 0;
    const max = Math.min(MAX_PER_ITEM, available);
    const qty = Math.min(l.qty, max);
    out.push({
      variantId: v.id, productSlug: p.slug, name: p.name, unit: v.unit, icon: p.icon, tint: p.tint,
      qty, price: v.price, mrp: v.mrp, available, maxPerOrder: MAX_PER_ITEM,
      problem: available === 0 ? "out_of_stock" : qty < l.qty ? "reduced" : undefined,
    });
  }
  const live = out.filter((l) => l.qty > 0);
  const itemsTotal = live.reduce((s, l) => s + l.price * l.qty, 0);
  const mrpTotal = live.reduce((s, l) => s + l.mrp * l.qty, 0);
  const itemCount = live.reduce((s, l) => s + l.qty, 0);

  let deliveryFee = itemsTotal >= FEES.freeDeliveryAbove ? 0 : FEES.delivery;
  const deliveryFeeWaived = FEES.delivery;
  const handlingFee = itemCount ? FEES.handling : 0;
  const smallCartFee = itemCount && itemsTotal < FEES.smallCartBelow ? FEES.smallCart : 0;
  const tip = Math.max(0, Math.min(opts.tip ?? 0, 50000));

  let coupon: Quote["coupon"];
  if (opts.couponCode) {
    const code = opts.couponCode.trim().toUpperCase();
    const c = liveCoupons().find((x) => x.code === code);
    if (!c) coupon = { code, title: "", discount: 0, error: "This code isn't valid" };
    else if (itemsTotal < c.minOrder) coupon = { code, title: c.title, discount: 0, error: `Add items worth ₹${Math.ceil((c.minOrder - itemsTotal) / 100)} more to use this code` };
    else if (c.firstOrderOnly && opts.user && (await read((db) => db.orders.some((o) => o.userId === opts.user!.id && o.status !== "cancelled"))))
      coupon = { code, title: c.title, discount: 0, error: "This code is only for your first order" };
    else {
      let discount = 0;
      if (c.kind === "flat") discount = c.value;
      if (c.kind === "percent") discount = Math.min(Math.round((itemsTotal * c.value) / 100), c.maxDiscount ?? Infinity);
      if (c.kind === "free_delivery") deliveryFee = 0; // shown as a waived delivery fee, not a discount line
      coupon = { code, title: c.title, discount };
    }
  }
  const couponDiscount = coupon && !coupon.error ? coupon.discount : 0;
  const grandTotal = itemCount ? Math.max(0, itemsTotal + deliveryFee + handlingFee + smallCartFee + tip - couponDiscount) : 0;
  const savings = mrpTotal - itemsTotal + (itemCount && deliveryFee === 0 ? deliveryFeeWaived : 0) + couponDiscount;

  return {
    lines: out, itemCount, mrpTotal, itemsTotal, savings,
    deliveryFee, deliveryFeeWaived, handlingFee, smallCartFee, tip, coupon, grandTotal,
    freeDeliveryGap: Math.max(0, FEES.freeDeliveryAbove - itemsTotal),
    etaMin: opts.svc?.ok ? opts.svc.etaMin : null,
    storeId,
    storeOpen: opts.svc?.ok ? opts.svc.open : false,
  };
}
