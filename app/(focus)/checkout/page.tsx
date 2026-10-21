import type { Metadata } from "next";
import { CheckoutScreen } from "@/components/cart/CheckoutScreen";
import { fees, liveCoupons } from "@/lib/settings";

export const metadata: Metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return <CheckoutScreen coupons={liveCoupons().map(({ code, title }) => ({ code, title }))} tipOptions={fees().tipOptions} />;
}
