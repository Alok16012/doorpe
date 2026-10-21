import type { Metadata } from "next";
import { CheckoutScreen } from "@/components/cart/CheckoutScreen";
import { COUPONS } from "@/lib/fees";
import { FEES } from "@/lib/fees";

export const metadata: Metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return <CheckoutScreen coupons={COUPONS.map(({ code, title }) => ({ code, title }))} tipOptions={FEES.tipOptions} />;
}
