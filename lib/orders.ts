import "server-only";
import { read, write, uid } from "./db/local";
import { quote } from "./pricing";
import { serviceability, storeById } from "./geo";
import type { Address, CartLine, Order, OrderStatus, User } from "./types";

const RIDERS = [
  { name: "Arjun", vehicle: "DL 3S AB 4521" }, { name: "Imran", vehicle: "HR 26 DK 1189" },
  { name: "Suresh", vehicle: "MH 02 FG 7340" }, { name: "Vikram", vehicle: "KA 05 MN 2210" },
  { name: "Ravi", vehicle: "TS 09 EQ 6612" }, { name: "Manoj", vehicle: "WB 02 AK 9031" },
];

export class OrderError extends Error {
  constructor(public code: string, message: string, public extra?: unknown) { super(message); }
}

export async function placeOrder(input: {
  user: User; lines: CartLine[]; addressId: string; paymentMethod: Order["paymentMethod"];
  tip?: number; couponCode?: string; instructions?: string; idempotencyKey?: string;
}): Promise<Order> {
  const { user } = input;
  if (input.idempotencyKey) {
    const existing = await read((db) => {
      const id = db.idem[`${user.id}:${input.idempotencyKey}`];
      return id ? db.orders.find((o) => o.id === id) : undefined;
    });
    if (existing) return existing;
  }
  const address = await read((db) => db.addresses.find((a) => a.id === input.addressId && a.userId === user.id));
  if (!address) throw new OrderError("NO_ADDRESS", "Pick a delivery address");
  const svc = serviceability(address.lat, address.lng);
  if (!svc.ok) throw new OrderError("NOT_SERVICEABLE", "We don't deliver to this address yet");
  if (!svc.open) throw new OrderError("STORE_CLOSED", "The store near you is closed right now");

  const q = await quote(input.lines, { svc, tip: input.tip, couponCode: input.couponCode, user });
  const changed = q.lines.filter((l) => l.problem);
  if (changed.length) throw new OrderError("CART_CHANGED", "Some items in your cart changed", q);
  if (!q.itemCount) throw new OrderError("EMPTY", "Your cart is empty");
  if (q.coupon?.error) throw new OrderError("COUPON", q.coupon.error);
  if (input.paymentMethod === "wallet" && user.walletBalance < q.grandTotal)
    throw new OrderError("WALLET", "Not enough balance in your wallet");

  return write((db) => {
    // stock check + decrement inside the serialised write: two buyers can't both take the last unit
    const stock = (db.stock[svc.store.id] ||= {});
    for (const l of q.lines) {
      const have = stock[l.variantId] ?? l.available;
      if (have < l.qty) throw new OrderError("CART_CHANGED", `${l.name} just went out of stock`, q);
    }
    for (const l of q.lines) stock[l.variantId] = (stock[l.variantId] ?? l.available) - l.qty;

    const rider = RIDERS[Math.floor(Math.random() * RIDERS.length)];
    const now = new Date().toISOString();
    const { userId: _u, createdAt: _c, isDefault: _d, ...addr } = address as Address;
    void _u; void _c; void _d;
    const order: Order = {
      id: uid("o_"),
      code: Math.random().toString(36).slice(2, 8).toUpperCase(),
      userId: user.id, storeId: svc.store.id, address: addr,
      items: q.lines.map((l) => ({ variantId: l.variantId, productSlug: l.productSlug, name: l.name, unit: l.unit, icon: l.icon, tint: l.tint, qty: l.qty, price: l.price, mrp: l.mrp })),
      mrpTotal: q.mrpTotal, itemsTotal: q.itemsTotal, deliveryFee: q.deliveryFee, handlingFee: q.handlingFee,
      smallCartFee: q.smallCartFee, tip: q.tip, couponCode: q.coupon && !q.coupon.error ? q.coupon.code : undefined,
      couponDiscount: q.coupon && !q.coupon.error ? q.coupon.discount : 0, grandTotal: q.grandTotal,
      paymentMethod: input.paymentMethod,
      paymentStatus: input.paymentMethod === "cod" ? "pending" : "paid",
      instructions: input.instructions?.slice(0, 200), etaMin: svc.etaMin,
      deliveryOtp: String(Math.floor(1000 + Math.random() * 9000)),
      rider: { name: rider.name, phone: "98" + String(Math.floor(10000000 + Math.random() * 89999999)), vehicle: rider.vehicle },
      status: "placed", mode: "auto", placedAt: now, idempotencyKey: input.idempotencyKey,
    };
    if (input.paymentMethod === "wallet") {
      const u = db.users.find((x) => x.id === user.id)!;
      u.walletBalance -= q.grandTotal;
      db.wallet.push({ id: uid("w_"), userId: u.id, kind: "debit", amount: -q.grandTotal, note: `Order #${order.code}`, at: now });
    }
    db.orders.push(order);
    if (input.idempotencyKey) db.idem[`${user.id}:${input.idempotencyKey}`] = order.id;
    return order;
  });
}

// ---------- live status (demo progression) ----------
export const STEPS: { key: OrderStatus; label: string; hint: string }[] = [
  { key: "placed", label: "Order placed", hint: "We've got it. The store is on it." },
  { key: "packing", label: "Packing your items", hint: "A packer is picking your items." },
  { key: "packed", label: "Packed and ready", hint: "Waiting for your rider to pick it up." },
  { key: "out_for_delivery", label: "On the way", hint: "Your rider is heading to you." },
  { key: "delivered", label: "Delivered", hint: "Enjoy! Hope everything's perfect." },
];

function timeline(o: Order) {
  const t0 = Date.parse(o.placedAt);
  const total = o.etaMin * 60_000;
  return { packing: t0 + 12_000, packed: t0 + total * 0.3, out: t0 + total * 0.4, delivered: t0 + total };
}

export type LiveOrder = Order & {
  live: { status: OrderStatus; stepIndex: number; minutesLeft: number; progress: number; rider: { lat: number; lng: number } | null; store: { lat: number; lng: number; name: string }; canCancel: boolean };
};

export function liveView(o: Order, now = Date.now()): LiveOrder {
  const store = storeById(o.storeId)!;
  let status = o.status;
  const tl = timeline(o);
  if (o.mode === "auto" && status !== "cancelled" && status !== "delivered") {
    status = now >= tl.delivered ? "delivered" : now >= tl.out ? "out_for_delivery" : now >= tl.packed ? "packed" : now >= tl.packing ? "packing" : "placed";
  }
  let outStart = tl.out, outEnd = tl.delivered;
  if (o.mode === "manual" && o.dispatchedAt) { outStart = Date.parse(o.dispatchedAt); outEnd = outStart + Math.max(3, Math.round(o.etaMin * 0.6)) * 60_000; }
  let rider: { lat: number; lng: number } | null = null;
  let progress = 0;
  if (status === "out_for_delivery") {
    progress = Math.min(0.97, Math.max(0, (now - outStart) / (outEnd - outStart)));
    const bend = Math.sin(progress * Math.PI) * 0.0025;
    rider = { lat: store.lat + (o.address.lat - store.lat) * progress + bend, lng: store.lng + (o.address.lng - store.lng) * progress - bend };
  }
  const end = o.mode === "auto" ? tl.delivered : outEnd;
  const minutesLeft = status === "delivered" || status === "cancelled" ? 0 : Math.max(1, Math.ceil((end - now) / 60_000));
  return {
    ...o, status,
    live: {
      status, stepIndex: STEPS.findIndex((s) => s.key === status), minutesLeft, progress, rider,
      store: { lat: store.lat, lng: store.lng, name: store.name },
      canCancel: status === "placed" || status === "packing",
    },
  };
}

/** Persist the derived status so lists and admin see the same thing. */
async function settle(o: Order) {
  const v = liveView(o);
  if (v.status !== o.status) {
    await write((db) => {
      const row = db.orders.find((x) => x.id === o.id);
      if (row && row.status !== "cancelled") {
        row.status = v.status;
        if (v.status === "delivered") { row.deliveredAt ||= new Date().toISOString(); if (row.paymentMethod === "cod") row.paymentStatus = "paid"; }
      }
    });
  }
  return v;
}

export async function getOrder(id: string, user: User) {
  const o = await read((db) => db.orders.find((x) => x.id === id));
  if (!o || (o.userId !== user.id && user.role !== "admin")) return null;
  return settle(o);
}

export async function listOrders(user: User) {
  const rows = await read((db) => db.orders.filter((o) => o.userId === user.id).sort((a, b) => b.placedAt.localeCompare(a.placedAt)));
  return Promise.all(rows.map(settle));
}

export async function cancelOrder(id: string, user: User, reason: string) {
  const o = await getOrder(id, user);
  if (!o) throw new OrderError("NOT_FOUND", "Order not found");
  if (!o.live.canCancel) throw new OrderError("TOO_LATE", "This order is already packed, so it can't be cancelled now");
  return write((db) => {
    const row = db.orders.find((x) => x.id === id)!;
    row.status = "cancelled";
    row.cancelledAt = new Date().toISOString();
    row.cancelReason = reason.slice(0, 120);
    const stock = (db.stock[row.storeId] ||= {});
    for (const it of row.items) stock[it.variantId] = (stock[it.variantId] ?? 0) + it.qty;
    if (row.paymentStatus === "paid") {
      row.paymentStatus = "refunded";
      if (row.paymentMethod === "wallet") {
        const u = db.users.find((x) => x.id === row.userId)!;
        u.walletBalance += row.grandTotal;
        db.wallet.push({ id: uid("w_"), userId: u.id, kind: "refund", amount: row.grandTotal, note: `Refund for #${row.code}`, at: row.cancelledAt });
      }
    }
    return row;
  });
}

export async function rateOrder(id: string, user: User, rating: number) {
  return write((db) => {
    const row = db.orders.find((x) => x.id === id && x.userId === user.id);
    if (row && row.status === "delivered") row.rating = Math.max(1, Math.min(5, Math.round(rating)));
    return row;
  });
}

// ---------- staff ----------
const NEXT: Partial<Record<OrderStatus, OrderStatus>> = { placed: "packing", packing: "packed", packed: "out_for_delivery", out_for_delivery: "delivered" };

export async function advanceOrder(id: string, otp?: string) {
  const o = await read((db) => db.orders.find((x) => x.id === id));
  if (!o) throw new OrderError("NOT_FOUND", "Order not found");
  const current = liveView(o).status;
  const next = NEXT[current];
  if (!next) throw new OrderError("FINAL", "Order is already closed");
  if (next === "delivered" && otp !== o.deliveryOtp) throw new OrderError("OTP", otp ? "Delivery code doesn't match" : "Enter the customer's delivery code");
  return write((db) => {
    const row = db.orders.find((x) => x.id === id)!;
    const now = new Date().toISOString();
    row.mode = "manual";
    row.status = next;
    if (next === "packed") row.packedAt = now;
    if (next === "out_for_delivery") row.dispatchedAt = now;
    if (next === "delivered") { row.deliveredAt = now; if (row.paymentMethod === "cod") row.paymentStatus = "paid"; }
    return row;
  });
}

export async function allOrders() {
  const rows = await read((db) => [...db.orders].sort((a, b) => b.placedAt.localeCompare(a.placedAt)).slice(0, 100));
  return rows.map((o) => liveView(o));
}
