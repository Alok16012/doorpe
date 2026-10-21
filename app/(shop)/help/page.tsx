import type { Metadata } from "next";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = { title: "Help & FAQs" };

const FAQ: { h: string; items: [string, string][] }[] = [
  { h: "Delivery", items: [
    ["How fast is delivery?", "Most orders arrive in 8–20 minutes. The time shown at the top of the app is for your exact address and updates as the store gets busy."],
    ["What does delivery cost?", "Delivery is free once your items cross ₹199. Below that it's ₹30, plus a small ₹4 handling fee on every order. Orders under ₹99 carry a ₹20 small-order fee. You always see every fee before you pay."],
    ["When are stores open?", "Most stores run 6 AM to midnight. A few run all night. If yours is closed, you can still fill your cart and order when it opens."],
    ["Can I change the address after ordering?", "Not once the order is placed, because it's already assigned to a store and rider. Cancel it before packing starts and place it again."],
  ]},
  { h: "Cancellations & refunds", items: [
    ["Can I cancel?", "Yes, for free, until packing starts. Open the order and tap Cancel. After that the rider is already on it, so cancelling isn't possible."],
    ["Something's missing, damaged or wrong. What now?", "Open the order, tap Help, pick the item and add a photo if you can. We refund that item to your wallet immediately. No call, no waiting for a replacement."],
    ["How long do refunds take?", "Wallet refunds are instant. Refunds to UPI or card take 3–5 working days, depending on your bank."],
    ["Is there a time limit to report a problem?", "Report missing, damaged or poor-quality items within 72 hours of delivery, wrong items within 48 hours, and late deliveries within 24 hours."],
  ]},
  { h: "Payments", items: [
    ["How can I pay?", "UPI, cards, your wallet balance, or cash on delivery. (This demo simulates online payments; no money moves.)"],
    ["Do prices include tax?", "Yes. Every price you see includes GST. Your invoice shows the split."],
  ]},
];

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="text-2xl font-extrabold">Help & FAQs</h1>
      <p className="mt-1 text-sm text-muted">Still stuck? Write to {BRAND.supportEmail} and a person will reply.</p>
      {FAQ.map((s) => (
        <section key={s.h} className="mt-6">
          <h2 className="mb-2 text-lg font-extrabold">{s.h}</h2>
          <div className="divide-y divide-border rounded-md border border-border">
            {s.items.map(([q, a]) => (
              <details key={q} className="group px-4 py-3">
                <summary className="cursor-pointer list-none text-sm font-bold marker:hidden">{q}</summary>
                <p className="mt-2 text-sm leading-6 text-muted">{a}</p>
              </details>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
