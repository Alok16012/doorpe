import "server-only";
import { read, write, uid } from "./db/local";
import type { Address, Issue, User } from "./types";

export async function listAddresses(user: User) {
  return read((db) => db.addresses.filter((a) => a.userId === user.id).sort((a, b) => Number(b.isDefault) - Number(a.isDefault) || b.createdAt.localeCompare(a.createdAt)));
}

export type AddressInput = Omit<Address, "id" | "userId" | "createdAt" | "isDefault"> & { isDefault?: boolean };

export function validateAddress(a: Partial<AddressInput>): string | null {
  if (!a.houseNo?.trim()) return "Add a flat or house number";
  if (!a.area?.trim()) return "Pick a location on the map";
  if (typeof a.lat !== "number" || typeof a.lng !== "number") return "Pick a location on the map";
  if (!a.receiverName?.trim()) return "Add the receiver's name";
  if (!/^[6-9]\d{9}$/.test(a.receiverPhone || "")) return "Add a valid 10-digit phone number";
  if (!["home", "work", "other"].includes(a.label || "")) return "Choose a label";
  return null;
}

export async function saveAddress(user: User, input: AddressInput, id?: string) {
  return write((db) => {
    const mine = db.addresses.filter((a) => a.userId === user.id);
    const makeDefault = input.isDefault || mine.length === 0;
    if (makeDefault) mine.forEach((a) => (a.isDefault = false));
    const clean = {
      label: input.label, houseNo: input.houseNo.trim().slice(0, 80), floor: input.floor?.trim().slice(0, 30),
      building: input.building?.trim().slice(0, 80), landmark: input.landmark?.trim().slice(0, 80),
      area: input.area.trim().slice(0, 160), city: input.city?.trim().slice(0, 80) || "",
      lat: input.lat, lng: input.lng, receiverName: input.receiverName.trim().slice(0, 60), receiverPhone: input.receiverPhone,
    };
    if (id) {
      const row = db.addresses.find((a) => a.id === id && a.userId === user.id);
      if (!row) return null;
      Object.assign(row, clean, makeDefault ? { isDefault: true } : {});
      return row;
    }
    const row: Address = { id: uid("a_"), userId: user.id, ...clean, isDefault: makeDefault, createdAt: new Date().toISOString() };
    db.addresses.push(row);
    return row;
  });
}

export async function deleteAddress(user: User, id: string) {
  return write((db) => {
    const i = db.addresses.findIndex((a) => a.id === id && a.userId === user.id);
    if (i < 0) return false;
    const [gone] = db.addresses.splice(i, 1);
    if (gone.isDefault) {
      const next = db.addresses.find((a) => a.userId === user.id);
      if (next) next.isDefault = true;
    }
    return true;
  });
}

export async function updateProfile(user: User, patch: { name?: string; email?: string }) {
  return write((db) => {
    const u = db.users.find((x) => x.id === user.id)!;
    if (patch.name !== undefined) u.name = patch.name.trim().slice(0, 60) || undefined;
    if (patch.email !== undefined) u.email = patch.email.trim().slice(0, 120) || undefined;
    return u;
  });
}

export async function walletTxns(user: User) {
  return read((db) => db.wallet.filter((w) => w.userId === user.id).sort((a, b) => b.at.localeCompare(a.at)));
}

/** Complaint windows by kind, in hours (our policy; tune per category later). */
const WINDOW_H: Record<Issue["kind"], number> = { missing: 72, damaged: 72, wrong: 48, quality: 72, late: 24, other: 72 };

export async function raiseIssue(user: User, orderId: string, input: { kind: Issue["kind"]; variantId?: string; note?: string; photo?: string }) {
  return write((db) => {
    const o = db.orders.find((x) => x.id === orderId && x.userId === user.id);
    if (!o) return { ok: false as const, error: "Order not found" };
    if (o.status !== "delivered") return { ok: false as const, error: "You can report a problem once the order is delivered" };
    const age = (Date.now() - Date.parse(o.deliveredAt || o.placedAt)) / 3_600_000;
    if (age > WINDOW_H[input.kind]) return { ok: false as const, error: "It's been too long since delivery to report this here. Write to support instead." };
    const item = input.variantId ? o.items.find((i) => i.variantId === input.variantId) : undefined;
    if (["missing", "damaged", "wrong", "quality"].includes(input.kind) && !item) return { ok: false as const, error: "Pick the item that had a problem" };
    if (db.issues.some((x) => x.orderId === o.id && x.itemVariantId === input.variantId && x.kind === input.kind))
      return { ok: false as const, error: "You've already reported this item" };
    // Our policy: instant refund to wallet for item-level problems, no "replacement only" dead end.
    const refund = item ? item.price * item.qty : 0;
    const issue: Issue = {
      id: uid("i_"), orderId: o.id, userId: user.id, kind: input.kind, itemVariantId: input.variantId,
      note: input.note?.slice(0, 500), photo: input.photo?.slice(0, 300_000),
      status: refund ? "refunded" : "open", refundAmount: refund, createdAt: new Date().toISOString(),
    };
    db.issues.push(issue);
    if (refund) {
      const u = db.users.find((x) => x.id === user.id)!;
      u.walletBalance += refund;
      db.wallet.push({ id: uid("w_"), userId: u.id, kind: "refund", amount: refund, note: `${item!.name} · #${o.code}`, at: issue.createdAt });
    }
    return { ok: true as const, issue };
  });
}

export async function issuesFor(user: User, orderId: string) {
  return read((db) => db.issues.filter((x) => x.orderId === orderId && x.userId === user.id));
}
