import "server-only";
import { read, write } from "./db/local";
import { liveView, OrderError, type LiveOrder } from "./orders";
import { distanceKm, storeById } from "./geo";
import type { Order, User } from "./types";

/** Rider pay per delivery: ₹25 base + ₹6 per km (store → customer), plus the full tip. */
export const PAY = { base: 2500, perKm: 600 };
export const tripKm = (o: Order) => {
  const s = storeById(o.storeId);
  return s ? distanceKm(s, { lat: o.address.lat, lng: o.address.lng }) : 0;
};
export const payFor = (o: Order) => Math.round((PAY.base + tripKm(o) * PAY.perKm) / 100) * 100 + o.tip;

const ACTIVE = (o: Order) => o.status !== "delivered" && o.status !== "cancelled";

export async function setOnline(rider: User, online: boolean) {
  return write((db) => {
    const u = db.users.find((x) => x.id === rider.id)!;
    if (!online && db.orders.some((o) => o.riderId === u.id && ACTIVE(o)))
      throw new OrderError("BUSY", "Finish your current delivery before going offline");
    u.online = online;
    u.onlineSince = online ? new Date().toISOString() : undefined;
    return u;
  });
}

export async function updateLocation(rider: User, lat: number, lng: number, accuracy?: number) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) throw new OrderError("BAD", "Bad location");
  return write((db) => { db.riderLocations[rider.id] = { lat, lng, accuracy, at: new Date().toISOString() }; });
}

export type Offer = {
  id: string; code: string; items: number; km: number; pay: number; cod: number; area: string;
  status: LiveOrder["status"]; placedMinsAgo: number; tip: number;
};

export async function riderState(rider: User) {
  const db = await read((d) => d);
  const me = db.users.find((u) => u.id === rider.id)!;
  const store = storeById(me.riderStoreId || "");
  const mine = db.orders.filter((o) => o.riderId === me.id);
  const activeRaw = mine.find(ACTIVE);
  const active = activeRaw ? liveView(activeRaw) : null;
  const now = Date.now();
  const offers: Offer[] = !me.online || active || !store ? [] : db.orders
    .filter((o) => o.storeId === store.id && !o.riderId && ACTIVE(o) && o.mode !== "rider")
    .map((o) => liveView(o))
    .filter((o) => ["placed", "packing", "packed"].includes(o.status))
    .sort((a, b) => a.placedAt.localeCompare(b.placedAt))
    .map((o) => ({
      id: o.id, code: o.code, items: o.items.reduce((n, i) => n + i.qty, 0), km: Math.round(tripKm(o) * 10) / 10,
      pay: payFor(o), tip: o.tip, cod: o.paymentMethod === "cod" && o.paymentStatus !== "paid" ? o.grandTotal : 0,
      area: o.address.area.split(",").slice(0, 2).join(","), status: o.status, placedMinsAgo: Math.floor((now - Date.parse(o.placedAt)) / 60_000),
    }));
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  const doneToday = mine.filter((o) => o.status === "delivered" && o.deliveredAt && new Date(o.deliveredAt).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }) === today);
  return {
    me: { id: me.id, name: me.name || "Rider", phone: me.phone, vehicle: me.vehicle || "", online: !!me.online, onlineSince: me.onlineSince },
    store: store ? { id: store.id, name: store.name, city: store.city, lat: store.lat, lng: store.lng } : null,
    active: active && {
      id: active.id, code: active.code, status: active.status, stage: active.live.riderStage, items: active.items,
      address: active.address, instructions: active.instructions, paymentMethod: active.paymentMethod,
      cod: active.paymentMethod === "cod" && active.paymentStatus !== "paid" ? active.grandTotal : 0,
      pay: payFor(active), tip: active.tip, km: Math.round(tripKm(active) * 10) / 10,
      storeReady: active.status === "packed" || active.status === "out_for_delivery",
    },
    offers,
    today: { deliveries: doneToday.length, earnings: doneToday.reduce((s, o) => s + (o.riderPay ?? payFor(o)), 0), tips: doneToday.reduce((s, o) => s + o.tip, 0) },
    location: db.riderLocations[me.id] || null,
  };
}

export async function acceptOrder(rider: User, id: string) {
  return write((db) => {
    const me = db.users.find((u) => u.id === rider.id)!;
    if (!me.online) throw new OrderError("OFFLINE", "Go online to accept orders");
    if (db.orders.some((o) => o.riderId === me.id && ACTIVE(o))) throw new OrderError("BUSY", "Finish your current delivery first");
    const o = db.orders.find((x) => x.id === id);
    if (!o || o.storeId !== me.riderStoreId) throw new OrderError("NOT_FOUND", "Order not found");
    if (o.riderId) throw new OrderError("TAKEN", "Another rider just took this order");
    const live = liveView(o);
    if (!["placed", "packing", "packed"].includes(live.status)) throw new OrderError("GONE", "This order is no longer available");
    o.riderId = me.id;
    o.mode = "rider";
    o.status = live.status;
    o.riderAssignedAt = new Date().toISOString();
    o.rider = { name: me.name || "Your rider", phone: me.phone, vehicle: me.vehicle || "" };
    return o;
  });
}

export async function riderStep(rider: User, id: string, step: "at_store" | "picked_up" | "at_customer" | "deliver", opts: { otp?: string; cashCollected?: boolean } = {}) {
  return write((db) => {
    const o = db.orders.find((x) => x.id === id);
    if (!o || o.riderId !== rider.id) throw new OrderError("NOT_FOUND", "This isn't your order");
    if (o.status === "cancelled") throw new OrderError("CANCELLED", "This order was cancelled");
    if (o.status === "delivered") throw new OrderError("DONE", "Already delivered");
    const live = liveView(o);
    const now = new Date().toISOString();
    if (step === "at_store") { o.atStoreAt ||= now; return o; }
    if (step === "picked_up") {
      if (live.status !== "packed") throw new OrderError("NOT_READY", "The store is still packing this order");
      o.status = "out_for_delivery"; o.packedAt ||= now; o.dispatchedAt = now; o.atStoreAt ||= now;
      return o;
    }
    if (live.status !== "out_for_delivery") throw new OrderError("NOT_PICKED", "Pick up the order first");
    if (step === "at_customer") { o.atCustomerAt ||= now; return o; }
    // deliver
    if ((opts.otp || "").trim() !== o.deliveryOtp) throw new OrderError("OTP", opts.otp ? "That code doesn't match. Ask the customer again." : "Enter the customer's 4-digit code");
    if (o.paymentMethod === "cod" && o.paymentStatus !== "paid") {
      if (!opts.cashCollected) throw new OrderError("CASH", "Confirm you've collected the cash");
      o.paymentStatus = "paid"; o.cashCollected = true;
    }
    o.status = "delivered"; o.deliveredAt = now; o.atCustomerAt ||= now;
    o.riderPay = payFor(o);
    return o;
  });
}

export async function riderEarnings(rider: User) {
  const orders = await read((db) => db.orders.filter((o) => o.riderId === rider.id && o.status === "delivered"));
  const day = (t: string) => new Date(t).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  const today = day(new Date().toISOString());
  const weekAgo = Date.now() - 7 * 86_400_000;
  const rows = orders.sort((a, b) => (b.deliveredAt || "").localeCompare(a.deliveredAt || "")).map((o) => ({
    id: o.id, code: o.code, at: o.deliveredAt!, pay: o.riderPay ?? payFor(o), tip: o.tip, km: Math.round(tripKm(o) * 10) / 10,
    cash: o.cashCollected ? o.grandTotal : 0, area: o.address.area.split(",")[0],
  }));
  const sum = (l: typeof rows) => ({ n: l.length, pay: l.reduce((s, r) => s + r.pay, 0), tips: l.reduce((s, r) => s + r.tip, 0), cash: l.reduce((s, r) => s + r.cash, 0), km: Math.round(l.reduce((s, r) => s + r.km, 0) * 10) / 10 });
  return { today: sum(rows.filter((r) => day(r.at) === today)), week: sum(rows.filter((r) => Date.parse(r.at) >= weekAgo)), all: sum(rows), rows: rows.slice(0, 50) };
}

export async function updateRiderProfile(rider: User, patch: { name?: string; vehicle?: string }) {
  return write((db) => {
    const u = db.users.find((x) => x.id === rider.id)!;
    if (patch.name !== undefined) u.name = patch.name.trim().slice(0, 60) || u.name;
    if (patch.vehicle !== undefined) u.vehicle = patch.vehicle.trim().toUpperCase().slice(0, 20);
    return u;
  });
}
