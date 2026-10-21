import "server-only";
import { dbSync } from "./db/local";
import { DEFAULT_COUPONS, DEFAULT_FEES, type Coupon, type FeeSettings } from "./fees";

export function fees(): FeeSettings {
  return { ...DEFAULT_FEES, ...(dbSync().settings || {}) };
}

export type StoredCoupon = Coupon & { active: boolean; createdAt: string };

export function allCoupons(): StoredCoupon[] {
  const db = dbSync();
  if (!db.coupons) db.coupons = DEFAULT_COUPONS.map((c) => ({ ...c, active: true, createdAt: new Date(0).toISOString() }));
  return db.coupons;
}

export function liveCoupons(now = Date.now()): StoredCoupon[] {
  return allCoupons().filter((c) => c.active && (!c.validTo || Date.parse(c.validTo) > now));
}
