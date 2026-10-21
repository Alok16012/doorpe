"use client";
import { useState } from "react";
import { Bike, HandCoins, Info, ReceiptText, ShoppingBag, Tag } from "lucide-react";
import { inr } from "@/lib/money";

type Bill = {
  mrpTotal: number; itemsTotal: number; deliveryFee: number; deliveryFeeWaived?: number; handlingFee: number;
  smallCartFee: number; tip: number; couponDiscount?: number; couponCode?: string; grandTotal: number;
};

const TIPS: Record<string, string> = {
  delivery: "Covers the rider's trip from the store to you. Free when your items add up past the free-delivery mark.",
  handling: "Covers packing materials and keeping the store cold, clean and stocked.",
  small: "Small orders cost us the same trip. Add a little more to remove this fee.",
};

function Row({ icon: I, label, tip, children, strong }: { icon: typeof Bike; label: string; tip?: string; children: React.ReactNode; strong?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="py-1">
      <div className={`flex items-center justify-between gap-2 text-sm ${strong ? "font-extrabold" : ""}`}>
        <dt className="flex items-center gap-2">
          <I size={15} aria-hidden className="text-muted" />
          {label}
          {tip && <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={`What is the ${label.toLowerCase()}?`} className="text-muted hover:text-text"><Info size={13} /></button>}
        </dt>
        <dd className="text-right">{children}</dd>
      </div>
      {open && tip && <p className="ml-6 mt-1 rounded-sm bg-surface px-2 py-1.5 text-xs text-muted">{tip}</p>}
    </div>
  );
}

export function BillDetails({ b }: { b: Bill }) {
  const itemSaved = b.mrpTotal - b.itemsTotal;
  return (
    <section className="rounded-md bg-bg p-4" aria-labelledby="bill-h">
      <h2 id="bill-h" className="mb-2 text-base font-extrabold">Bill details</h2>
      <dl>
        <Row icon={ReceiptText} label="Items total">
          <span className="flex items-center justify-end gap-1.5">
            {itemSaved > 0 && <span className="rounded-xs bg-info-soft px-1 text-2xs font-extrabold text-info">Saved {inr(itemSaved)}</span>}
            {itemSaved > 0 && <s className="text-xs text-faint">{inr(b.mrpTotal)}</s>}
            {inr(b.itemsTotal)}
          </span>
        </Row>
        <Row icon={Bike} label="Delivery fee" tip={TIPS.delivery}>
          {b.deliveryFee === 0 ? <span>{b.deliveryFeeWaived ? <s className="mr-1 text-xs text-faint">{inr(b.deliveryFeeWaived)}</s> : null}<b className="text-success">FREE</b></span> : inr(b.deliveryFee)}
        </Row>
        {b.handlingFee > 0 && <Row icon={ShoppingBag} label="Handling fee" tip={TIPS.handling}>{inr(b.handlingFee)}</Row>}
        {b.smallCartFee > 0 && <Row icon={ShoppingBag} label="Small order fee" tip={TIPS.small}>{inr(b.smallCartFee)}</Row>}
        {b.tip > 0 && <Row icon={HandCoins} label="Rider tip">{inr(b.tip)}</Row>}
        {!!b.couponDiscount && <Row icon={Tag} label={`Coupon ${b.couponCode ?? ""}`}><span className="font-bold text-success">−{inr(b.couponDiscount)}</span></Row>}
        <div className="mt-2 border-t border-dashed border-border pt-2">
          <Row icon={ReceiptText} label="To pay" strong>{inr(b.grandTotal)}</Row>
        </div>
      </dl>
    </section>
  );
}
