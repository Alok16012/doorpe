import { rupees } from "./money";

/** Fee rules. Same for every demo store; move onto the store row when stores differ. */
export const FEES = {
  delivery: rupees(30),
  freeDeliveryAbove: rupees(199),
  handling: rupees(4),
  smallCart: rupees(20),
  smallCartBelow: rupees(99),
  tipOptions: [rupees(10), rupees(20), rupees(30), rupees(50)],
};

export type Coupon = {
  code: string; title: string; kind: "flat" | "percent" | "free_delivery";
  value: number; minOrder: number; maxDiscount?: number; firstOrderOnly?: boolean;
};

export const COUPONS: Coupon[] = [
  { code: "WELCOME50", title: "₹50 off your first order above ₹299", kind: "flat", value: rupees(50), minOrder: rupees(299), firstOrderOnly: true },
  { code: "SAVE10", title: "10% off up to ₹75 on orders above ₹399", kind: "percent", value: 10, minOrder: rupees(399), maxDiscount: rupees(75) },
  { code: "FREEDEL", title: "Free delivery on any order above ₹99", kind: "free_delivery", value: 0, minOrder: rupees(99) },
];
