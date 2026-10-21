import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { adminOrder } from "@/lib/admin";
import { storeById } from "@/lib/geo";
import { inr } from "@/lib/money";
import { PageHead } from "@/components/admin/AdminShell";
import { Card, StatusBadge } from "@/components/admin/ui";
import { OrderActions } from "@/components/admin/OrderActions";
import { BillDetails } from "@/components/cart/BillDetails";
import { ProductArt } from "@/components/shop/ProductArt";

export const metadata = { title: "Order" };

export default async function AdminOrderPage(props: PageProps<"/admin/orders/[id]">) {
  const data = await adminOrder((await props.params).id);
  if (!data) notFound();
  const { order: o, customer, issues } = data;
  const store = storeById(o.storeId);
  const when = (t?: string) => (t ? new Date(t).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" }) : "—");
  return (
    <>
      <Link href="/admin/orders" className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-text"><ArrowLeft size={16} /> Orders</Link>
      <PageHead title={`Order #${o.code}`} sub={`${when(o.placedAt)} · ${store?.name}, ${store?.city}`} actions={<StatusBadge s={o.status} />} />
      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-4">
          <OrderActions id={o.id} status={o.status} mode={o.mode} />
          <Card title={`${o.items.reduce((n, i) => n + i.qty, 0)} items`} pad={false}>
            <ul className="divide-y divide-border">
              {o.items.map((it) => {
                const iss = issues.find((x) => x.itemVariantId === it.variantId);
                return (
                  <li key={it.variantId} className="flex items-center gap-3 px-4 py-3 text-sm">
                    <div className="w-11 shrink-0 rounded-md border border-border"><ProductArt icon={it.icon} size="sm" /></div>
                    <div className="flex-1"><p className="font-semibold">{it.name}</p><p className="text-xs text-muted">{it.unit} × {it.qty} · {inr(it.price)} each</p>{iss && <p className="text-xs font-bold text-warning">Complaint: {iss.kind} · {iss.status}</p>}</div>
                    <p className="font-semibold tabular-nums">{inr(it.price * it.qty)}</p>
                  </li>
                );
              })}
            </ul>
          </Card>
          <BillDetails b={o} />
        </div>
        <div className="space-y-4">
          <Card title="Customer">
            <p className="text-sm font-semibold">{customer?.name || o.address.receiverName}</p>
            <p className="text-sm text-muted">+91 {customer?.phone}</p>
            {customer && <Link href={`/admin/customers/${customer.id}`} className="mt-2 inline-block text-sm font-semibold text-accent">View customer</Link>}
          </Card>
          <Card title="Delivery">
            <p className="text-sm">{[o.address.houseNo, o.address.floor && `Floor ${o.address.floor}`, o.address.building, o.address.landmark, o.address.area].filter(Boolean).join(", ")}</p>
            <p className="mt-1 text-sm text-muted">Receiver: {o.address.receiverName} · {o.address.receiverPhone}</p>
            {o.instructions && <p className="mt-2 rounded-md bg-warn-soft px-2 py-1 text-xs font-semibold text-warning">{o.instructions}</p>}
            <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs">
              <dt className="text-muted">Rider</dt><dd className="font-semibold">{o.rider.name} · {o.rider.vehicle}</dd>
              <dt className="text-muted">Delivery code</dt><dd className="font-semibold tracking-widest">{o.deliveryOtp}</dd>
              <dt className="text-muted">Promised in</dt><dd className="font-semibold">{o.etaMin} min</dd>
            </dl>
          </Card>
          <Card title="Timeline">
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-xs">
              <dt className="text-muted">Placed</dt><dd>{when(o.placedAt)}</dd>
              <dt className="text-muted">Packed</dt><dd>{when(o.packedAt)}</dd>
              <dt className="text-muted">Dispatched</dt><dd>{when(o.dispatchedAt)}</dd>
              <dt className="text-muted">Delivered</dt><dd>{when(o.deliveredAt)}</dd>
              {o.cancelledAt && <><dt className="text-muted">Cancelled</dt><dd>{when(o.cancelledAt)} · {o.cancelReason}</dd></>}
              {o.rating && <><dt className="text-muted">Rating</dt><dd>{"★".repeat(o.rating)}</dd></>}
            </dl>
          </Card>
          <Card title="Payment">
            <p className="text-sm uppercase">{o.paymentMethod} · <span className="font-semibold">{o.paymentStatus}</span></p>
            {o.couponCode && <p className="mt-1 text-xs text-muted">Coupon {o.couponCode} (−{inr(o.couponDiscount)})</p>}
          </Card>
        </div>
      </div>
    </>
  );
}
