import "server-only";
import { read, write, uid, dbSync } from "./db/local";
import { liveView, type LiveOrder } from "./orders";
import { catalogData } from "./catalog";
import { slugify, type CatProduct, type CatCategory, type CatSub } from "./catalog/model";
import { stores, STORES, type StoreOverride } from "./geo";
import { allCoupons, fees, type StoredCoupon } from "./settings";
import type { FeeSettings } from "./fees";
import type { Issue, Order, User } from "./types";

export class AdminError extends Error {}

// ---------- dashboard ----------
const istDay = (d: Date | string) => new Date(d).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

export async function dashboardStats() {
  const { orders, users, issues } = await read((db) => ({ orders: db.orders, users: db.users, issues: db.issues }));
  const today = istDay(new Date());
  const views = orders.map((o) => liveView(o));
  const todays = views.filter((o) => istDay(o.placedAt) === today);
  const good = (o: Order) => o.status !== "cancelled";
  const revenue = todays.filter(good).reduce((s, o) => s + o.grandTotal, 0);
  const days: { day: string; label: string; orders: number; revenue: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86_400_000);
    const key = istDay(d);
    const list = views.filter((o) => istDay(o.placedAt) === key && good(o));
    days.push({ day: key, label: d.toLocaleDateString("en-IN", { weekday: "short", timeZone: "Asia/Kolkata" }), orders: list.length, revenue: list.reduce((s, o) => s + o.grandTotal, 0) });
  }
  const live = views.filter((o) => !["delivered", "cancelled"].includes(o.status));
  const stockMaps = dbSync().stock;
  const low: { store: string; name: string; unit: string; stock: number; variantId: string; storeId: string }[] = [];
  for (const s of stores())
    for (const p of catalogData().products)
      if (p.active) for (const v of p.variants) {
        const n = stockMaps[s.id]?.[v.id] ?? v.baseStock;
        if (n <= 5) low.push({ store: `${s.name}, ${s.city}`, name: p.name, unit: v.unit, stock: n, variantId: v.id, storeId: s.id });
      }
  return {
    ordersToday: todays.filter(good).length,
    revenueToday: revenue,
    aovToday: todays.filter(good).length ? Math.round(revenue / todays.filter(good).length / 100) * 100 : 0,
    cancelledToday: todays.filter((o) => o.status === "cancelled").length,
    liveCount: live.length,
    customers: users.length,
    openIssues: issues.filter((i) => i.status === "open").length,
    days, live: live.slice(0, 8), low: low.sort((a, b) => a.stock - b.stock).slice(0, 12), lowCount: low.length,
  };
}

// ---------- orders ----------
export async function adminOrders(f: { status?: string; q?: string; store?: string }) {
  const { orders, users } = await read((db) => ({ orders: db.orders, users: db.users }));
  const q = f.q?.trim().toLowerCase();
  return orders
    .map((o) => liveView(o))
    .filter((o) => !f.status || f.status === "all" || (f.status === "live" ? !["delivered", "cancelled"].includes(o.status) : o.status === f.status))
    .filter((o) => !f.store || o.storeId === f.store)
    .filter((o) => !q || o.code.toLowerCase().includes(q) || users.find((u) => u.id === o.userId)?.phone.includes(q) || o.address.receiverName.toLowerCase().includes(q))
    .sort((a, b) => b.placedAt.localeCompare(a.placedAt))
    .map((o) => ({ ...o, customer: users.find((u) => u.id === o.userId) }));
}

export async function adminOrder(id: string) {
  const { o, user, issues } = await read((db) => ({ o: db.orders.find((x) => x.id === id), user: undefined as User | undefined, issues: db.issues.filter((i) => i.orderId === id) }));
  if (!o) return null;
  const customer = await read((db) => db.users.find((u) => u.id === o.userId));
  void user;
  return { order: liveView(o) as LiveOrder, customer, issues };
}

export async function adminCancel(id: string, reason: string) {
  return write((db) => {
    const row = db.orders.find((x) => x.id === id);
    if (!row) throw new AdminError("Order not found");
    if (row.status === "delivered" || row.status === "cancelled") throw new AdminError("This order is already closed");
    row.status = "cancelled";
    row.mode = "manual";
    row.cancelledAt = new Date().toISOString();
    row.cancelReason = `Cancelled by store: ${reason}`.slice(0, 140);
    const stock = (db.stock[row.storeId] ||= {});
    for (const it of row.items) stock[it.variantId] = (stock[it.variantId] ?? 0) + it.qty;
    if (row.paymentStatus === "paid") {
      row.paymentStatus = "refunded";
      const u = db.users.find((x) => x.id === row.userId);
      if (u) { u.walletBalance += row.grandTotal; db.wallet.push({ id: uid("w_"), userId: u.id, kind: "refund", amount: row.grandTotal, note: `Refund for #${row.code} (cancelled by store)`, at: row.cancelledAt }); }
    }
    return row;
  });
}

// ---------- products ----------
export type ProductInput = {
  name: string; brand: string; icon: string; category: string; sub: string; tags: string; description?: string; active: boolean;
  info: Record<string, string>; variants: { id?: string; unit: string; mrp: number; price: number; baseStock: number }[];
};

export function validateProduct(p: ProductInput): string | null {
  if (!p.name?.trim()) return "Product name is required";
  if (!p.icon?.trim()) return "Pick an image";
  const c = catalogData();
  if (!c.categories.some((x) => x.slug === p.category)) return "Pick a category";
  if (!c.subs.some((x) => x.slug === p.sub && x.category === p.category)) return "Pick a sub-category inside that category";
  if (!p.variants?.length) return "Add at least one size";
  for (const v of p.variants) {
    if (!v.unit?.trim()) return "Every size needs a unit, like 500 g";
    if (!(v.mrp > 0) || !(v.price > 0)) return "Prices must be above zero";
    if (v.price > v.mrp) return `Selling price can't be above MRP (${v.unit})`;
    if (v.baseStock < 0) return "Stock can't be negative";
  }
  return null;
}

export async function saveProduct(input: ProductInput, id?: string): Promise<CatProduct> {
  const err = validateProduct(input);
  if (err) throw new AdminError(err);
  catalogData(); // make sure the catalogue is seeded
  return write((db) => {
    const list = db.catalog!.products;
    const now = new Date().toISOString();
    const clean = {
      name: input.name.trim().slice(0, 120), brand: input.brand.trim().slice(0, 60) || "Turant", icon: input.icon.trim().slice(0, 500),
      category: input.category, sub: input.sub, tags: input.tags.trim().toLowerCase().slice(0, 300), description: input.description?.trim().slice(0, 2000),
      active: !!input.active,
      info: Object.fromEntries(Object.entries(input.info || {}).filter(([k, v]) => k.trim() && v.trim()).slice(0, 12).map(([k, v]) => [k.trim().slice(0, 40), v.trim().slice(0, 120)])),
    };
    let row: CatProduct | undefined;
    if (id) {
      row = list.find((p) => p.id === id);
      if (!row) throw new AdminError("Product not found");
      Object.assign(row, clean, { updatedAt: now });
    } else {
      let slug = slugify(clean.name) || "product";
      while (list.some((p) => p.slug === slug)) slug += "-" + Math.random().toString(36).slice(2, 5);
      row = { id: slug, slug, ...clean, variants: [], createdAt: now, updatedAt: now };
      list.unshift(row);
    }
    const keep = new Set(input.variants.map((v) => v.id).filter(Boolean));
    // sizes that disappear are kept out of the product, but orders keep their snapshot
    row.variants = input.variants.map((v) => ({
      id: v.id && row!.variants.some((x) => x.id === v.id) ? v.id : `${row!.id}~${uid()}`,
      unit: v.unit.trim().slice(0, 40), mrp: Math.round(v.mrp), price: Math.round(v.price), baseStock: Math.max(0, Math.round(v.baseStock)),
    }));
    void keep;
    db.catalogVersion = (db.catalogVersion || 1) + 1;
    return row;
  });
}

export async function setProductActive(id: string, active: boolean) {
  return write((db) => {
    const p = db.catalog?.products.find((x) => x.id === id);
    if (!p) throw new AdminError("Product not found");
    p.active = active; p.updatedAt = new Date().toISOString();
    db.catalogVersion++;
    return p;
  });
}

// ---------- categories ----------
export async function saveCategory(input: { name: string; icon: string; tint: string; group: string; active: boolean }, slug?: string) {
  if (!input.name?.trim()) throw new AdminError("Category name is required");
  catalogData();
  return write((db) => {
    const c = db.catalog!;
    if (!c.groups.some((g) => g.slug === input.group)) throw new AdminError("Pick a section");
    if (slug) {
      const row = c.categories.find((x) => x.slug === slug);
      if (!row) throw new AdminError("Category not found");
      Object.assign(row, { name: input.name.trim(), icon: input.icon || row.icon, tint: input.tint || row.tint, group: input.group, active: input.active });
    } else {
      let s = slugify(input.name) || "category";
      while (c.categories.some((x) => x.slug === s) || c.subs.some((x) => x.slug === s)) s += "-2";
      const sort = Math.max(-1, ...c.categories.filter((x) => x.group === input.group).map((x) => x.sort)) + 1;
      const row: CatCategory = { slug: s, name: input.name.trim(), icon: input.icon || "🛒", tint: input.tint || "#e1efff", group: input.group, sort, active: input.active };
      c.categories.push(row);
      // every category needs at least one sub-category to hold products
      c.subs.push({ slug: `${s}-all`, name: input.name.trim(), icon: row.icon, category: s, sort: 0, active: true });
    }
    db.catalogVersion++;
  });
}

export async function saveSub(input: { name: string; icon: string; category: string; active: boolean }, slug?: string) {
  if (!input.name?.trim()) throw new AdminError("Sub-category name is required");
  catalogData();
  return write((db) => {
    const c = db.catalog!;
    if (!c.categories.some((x) => x.slug === input.category)) throw new AdminError("Pick a category");
    if (slug) {
      const row = c.subs.find((x) => x.slug === slug);
      if (!row) throw new AdminError("Sub-category not found");
      Object.assign(row, { name: input.name.trim(), icon: input.icon || row.icon, active: input.active });
    } else {
      let s = slugify(input.name) || "sub";
      while (c.subs.some((x) => x.slug === s) || c.categories.some((x) => x.slug === s)) s += "-2";
      const sort = Math.max(-1, ...c.subs.filter((x) => x.category === input.category).map((x) => x.sort)) + 1;
      const row: CatSub = { slug: s, name: input.name.trim(), icon: input.icon || "🛒", category: input.category, sort, active: input.active };
      c.subs.push(row);
    }
    db.catalogVersion++;
  });
}

export async function moveCategory(slug: string, dir: -1 | 1) {
  catalogData();
  return write((db) => {
    const c = db.catalog!;
    const row = c.categories.find((x) => x.slug === slug);
    if (!row) return;
    const sibs = c.categories.filter((x) => x.group === row.group).sort((a, b) => a.sort - b.sort);
    const i = sibs.indexOf(row), j = i + dir;
    if (j < 0 || j >= sibs.length) return;
    [sibs[i], sibs[j]] = [sibs[j], sibs[i]];
    sibs.forEach((x, k) => (x.sort = k));
    db.catalogVersion++;
  });
}

// ---------- stock ----------
export async function setStock(storeId: string, variantId: string, stock: number) {
  if (!STORES.some((s) => s.id === storeId)) throw new AdminError("Unknown store");
  return write((db) => { (db.stock[storeId] ||= {})[variantId] = Math.max(0, Math.min(9999, Math.floor(stock))); });
}

// ---------- stores ----------
export async function updateStore(id: string, patch: StoreOverride) {
  if (!STORES.some((s) => s.id === id)) throw new AdminError("Unknown store");
  if (patch.opensAt !== undefined && (patch.opensAt < 0 || patch.opensAt > 23)) throw new AdminError("Opening hour must be 0–23");
  if (patch.closesAt !== undefined && (patch.closesAt < 1 || patch.closesAt > 24)) throw new AdminError("Closing hour must be 1–24");
  if (patch.radiusKm !== undefined && (patch.radiusKm < 0.5 || patch.radiusKm > 30)) throw new AdminError("Radius must be 0.5–30 km");
  return write((db) => { db.storeOverrides[id] = { ...(db.storeOverrides[id] || {}), ...patch }; });
}

// ---------- customers ----------
export async function adminCustomers(q?: string) {
  const { users, orders } = await read((db) => ({ users: db.users, orders: db.orders }));
  const t = q?.trim().toLowerCase();
  return users
    .filter((u) => !t || u.phone.includes(t) || u.name?.toLowerCase().includes(t) || u.email?.toLowerCase().includes(t))
    .map((u) => {
      const mine = orders.filter((o) => o.userId === u.id && o.status !== "cancelled");
      return { ...u, orders: mine.length, spent: mine.reduce((s, o) => s + o.grandTotal, 0), lastOrder: mine.map((o) => o.placedAt).sort().pop() };
    })
    .sort((a, b) => (b.lastOrder || b.createdAt).localeCompare(a.lastOrder || a.createdAt));
}

export async function creditWallet(userId: string, amount: number, note: string) {
  if (!Number.isFinite(amount) || amount === 0) throw new AdminError("Enter an amount");
  return write((db) => {
    const u = db.users.find((x) => x.id === userId);
    if (!u) throw new AdminError("Customer not found");
    if (u.walletBalance + amount < 0) throw new AdminError("Balance can't go below zero");
    u.walletBalance += amount;
    db.wallet.push({ id: uid("w_"), userId, kind: amount > 0 ? "credit" : "debit", amount, note: note.trim().slice(0, 80) || (amount > 0 ? "Credit from support" : "Adjustment"), at: new Date().toISOString() });
    return u;
  });
}

export async function setRole(userId: string, role: User["role"], actingId: string) {
  if (userId === actingId && role !== "admin") throw new AdminError("You can't remove your own admin access");
  return write((db) => { const u = db.users.find((x) => x.id === userId); if (!u) throw new AdminError("Customer not found"); u.role = role; });
}

// ---------- coupons ----------
export async function saveCoupon(c: Omit<StoredCoupon, "createdAt">, original?: string) {
  const code = c.code.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (code.length < 3) throw new AdminError("Code must be at least 3 letters or numbers");
  if (!c.title.trim()) throw new AdminError("Add a short description customers will see");
  if (c.kind === "percent" && (c.value <= 0 || c.value > 90)) throw new AdminError("Percent must be between 1 and 90");
  if (c.kind === "flat" && c.value <= 0) throw new AdminError("Discount amount must be above zero");
  allCoupons();
  return write((db) => {
    const list = db.coupons!;
    if (list.some((x) => x.code === code && x.code !== original)) throw new AdminError("That code already exists");
    const row = { ...c, code, title: c.title.trim().slice(0, 80) };
    const i = original ? list.findIndex((x) => x.code === original) : -1;
    if (i >= 0) list[i] = { ...list[i], ...row };
    else list.unshift({ ...row, createdAt: new Date().toISOString() });
  });
}

export async function deleteCoupon(code: string) {
  allCoupons();
  return write((db) => { db.coupons = db.coupons!.filter((x) => x.code !== code); });
}

export async function couponUsage() {
  return read((db) => {
    const m: Record<string, number> = {};
    for (const o of db.orders) if (o.couponCode && o.status !== "cancelled") m[o.couponCode] = (m[o.couponCode] || 0) + 1;
    return m;
  });
}

// ---------- issues ----------
export async function adminIssues(status?: string) {
  const { issues, orders, users } = await read((db) => ({ issues: db.issues, orders: db.orders, users: db.users }));
  return issues
    .filter((i) => !status || status === "all" || i.status === status)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((i) => {
      const o = orders.find((x) => x.id === i.orderId);
      return { ...i, order: o ? { id: o.id, code: o.code, grandTotal: o.grandTotal } : undefined, item: o?.items.find((x) => x.variantId === i.itemVariantId), customer: users.find((u) => u.id === i.userId) };
    });
}

export async function resolveIssue(id: string, action: "refund" | "reject", amount = 0) {
  return write((db) => {
    const i = db.issues.find((x) => x.id === id);
    if (!i) throw new AdminError("Complaint not found");
    if (i.status !== "open") throw new AdminError("This complaint is already resolved");
    if (action === "reject") { i.status = "rejected"; return i; }
    const o = db.orders.find((x) => x.id === i.orderId);
    const already = db.issues.filter((x) => x.orderId === i.orderId && x.status === "refunded").reduce((s, x) => s + x.refundAmount, 0);
    const max = (o?.grandTotal ?? 0) - already;
    if (!(amount > 0)) throw new AdminError("Enter a refund amount");
    if (amount > max) throw new AdminError(`Refund can't exceed what's left on the order (₹${(max / 100).toFixed(0)})`);
    i.status = "refunded"; i.refundAmount = Math.round(amount);
    const u = db.users.find((x) => x.id === i.userId);
    if (u) { u.walletBalance += i.refundAmount; db.wallet.push({ id: uid("w_"), userId: u.id, kind: "refund", amount: i.refundAmount, note: `Complaint on #${o?.code ?? ""}`, at: new Date().toISOString() }); }
    return i;
  });
}

// ---------- settings ----------
export async function saveFees(f: FeeSettings) {
  for (const [k, v] of Object.entries(f)) if (k !== "tipOptions" && (typeof v !== "number" || v < 0)) throw new AdminError("Fees can't be negative");
  if (f.tipOptions.some((t) => t <= 0) || f.tipOptions.length > 6) throw new AdminError("Tip amounts must be above zero (up to 6)");
  return write((db) => { db.settings = { ...fees(), ...f }; });
}

export type { Issue };

// ---------- reports ----------
export async function reports(daysBack = 14) {
  const orders = await read((db) => db.orders);
  const since = Date.now() - daysBack * 86_400_000;
  const list = orders.map((o) => liveView(o)).filter((o) => Date.parse(o.placedAt) >= since && o.status !== "cancelled");
  const cancelled = orders.filter((o) => Date.parse(o.placedAt) >= since && o.status === "cancelled").length;
  const cat = catalogData();
  const productCat = new Map(cat.products.map((p) => [p.id, p.category]));
  const catName = new Map(cat.categories.map((c) => [c.slug, c.name]));
  const prod = new Map<string, { name: string; icon: string; units: number; revenue: number }>();
  const byCat = new Map<string, number>();
  const pay = new Map<string, { n: number; v: number }>();
  for (const o of list) {
    for (const it of o.items) {
      const pid = it.variantId.split("~")[0];
      const row = prod.get(pid) || { name: it.name, icon: it.icon, units: 0, revenue: 0 };
      row.units += it.qty; row.revenue += it.qty * it.price; prod.set(pid, row);
      const c = catName.get(productCat.get(pid) || "") || "Other";
      byCat.set(c, (byCat.get(c) || 0) + it.qty * it.price);
    }
    const p = pay.get(o.paymentMethod) || { n: 0, v: 0 };
    p.n++; p.v += o.grandTotal; pay.set(o.paymentMethod, p);
  }
  const days: { day: string; label: string; orders: number; revenue: number }[] = [];
  for (let i = daysBack - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86_400_000);
    const key = istDay(d);
    const l = list.filter((o) => istDay(o.placedAt) === key);
    days.push({ day: key, label: d.toLocaleDateString("en-IN", { day: "numeric", timeZone: "Asia/Kolkata" }), orders: l.length, revenue: l.reduce((s, o) => s + o.grandTotal, 0) });
  }
  const revenue = list.reduce((s, o) => s + o.grandTotal, 0);
  const delivered = list.filter((o) => o.status === "delivered" && o.deliveredAt);
  const avgMins = delivered.length ? Math.round(delivered.reduce((s, o) => s + (Date.parse(o.deliveredAt!) - Date.parse(o.placedAt)) / 60_000, 0) / delivered.length) : 0;
  return {
    revenue, orders: list.length, cancelled, aov: list.length ? Math.round(revenue / list.length / 100) * 100 : 0, avgMins,
    discounts: list.reduce((s, o) => s + o.couponDiscount + (o.mrpTotal - o.itemsTotal), 0),
    tips: list.reduce((s, o) => s + o.tip, 0),
    days,
    topProducts: [...prod.values()].sort((a, b) => b.units - a.units).slice(0, 10),
    byCategory: [...byCat.entries()].map(([name, v]) => ({ name, v })).sort((a, b) => b.v - a.v),
    payments: [...pay.entries()].map(([m, x]) => ({ m, ...x })).sort((a, b) => b.v - a.v),
  };
}

// ---------- riders ----------
export async function adminRiders() {
  const { users, orders, locs } = await read((db) => ({ users: db.users, orders: db.orders, locs: db.riderLocations }));
  const today = istDay(new Date());
  return users.filter((u) => u.role === "rider").map((u) => {
    const mine = orders.filter((o) => o.riderId === u.id);
    const active = mine.find((o) => o.status !== "delivered" && o.status !== "cancelled");
    const done = mine.filter((o) => o.status === "delivered" && o.deliveredAt && istDay(o.deliveredAt) === today);
    const loc = locs[u.id];
    return {
      id: u.id, name: u.name || "Rider", phone: u.phone, vehicle: u.vehicle || "", storeId: u.riderStoreId || "",
      online: !!u.online, onlineSince: u.onlineSince, active: active ? { id: active.id, code: active.code, status: liveView(active).status } : null,
      today: done.length, earned: done.reduce((s, o) => s + (o.riderPay ?? 0), 0), cash: done.reduce((s, o) => s + (o.cashCollected ? o.grandTotal : 0), 0),
      lastSeen: loc?.at,
    };
  }).sort((a, b) => Number(b.online) - Number(a.online) || a.name.localeCompare(b.name));
}

export async function addRider(input: { phone: string; name: string; vehicle: string; storeId: string }) {
  const phone = input.phone.replace(/\D/g, "").slice(-10);
  if (!/^[6-9]\d{9}$/.test(phone)) throw new AdminError("Enter a valid 10-digit mobile number");
  if (!input.name.trim()) throw new AdminError("Add the rider's name");
  if (!STORES.some((s) => s.id === input.storeId)) throw new AdminError("Pick a store");
  return write((db) => {
    let u = db.users.find((x) => x.phone === phone);
    if (u?.role === "admin") throw new AdminError("This number is an admin. Use a different number for riding.");
    if (!u) { u = { id: uid("u_"), phone, role: "rider", walletBalance: 0, createdAt: new Date().toISOString() }; db.users.push(u); }
    Object.assign(u, { role: "rider", name: input.name.trim().slice(0, 60), vehicle: input.vehicle.trim().toUpperCase().slice(0, 20), riderStoreId: input.storeId, online: false });
    return u;
  });
}

export async function updateRider(id: string, patch: { storeId?: string; remove?: boolean; forceOffline?: boolean }) {
  return write((db) => {
    const u = db.users.find((x) => x.id === id && x.role === "rider");
    if (!u) throw new AdminError("Rider not found");
    const busy = db.orders.some((o) => o.riderId === id && o.status !== "delivered" && o.status !== "cancelled");
    if ((patch.remove || patch.storeId || patch.forceOffline) && busy) throw new AdminError("This rider is on a delivery right now. Try after it's done.");
    if (patch.storeId) { if (!STORES.some((s) => s.id === patch.storeId)) throw new AdminError("Unknown store"); u.riderStoreId = patch.storeId; }
    if (patch.forceOffline) { u.online = false; u.onlineSince = undefined; }
    if (patch.remove) { u.role = "customer"; u.online = false; u.riderStoreId = undefined; }
    return u;
  });
}
