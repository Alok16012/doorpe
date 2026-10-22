"use client";
import { useSyncExternalStore } from "react";

/** Line snapshot so the cart bar can show a total without a network call. The server re-prices at checkout. */
export type Line = { variantId: string; qty: number; price: number; mrp: number; name: string; unit: string; icon: string; tint: string; slug: string; max: number };
type State = { lines: Line[] };

const KEY = "doorpe_cart_v1";
let state: State = { lines: [] };
let loaded = false;
const subs = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = JSON.parse(raw);
  } catch {}
}
function emit() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
  subs.forEach((f) => f());
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === KEY) { try { state = JSON.parse(e.newValue || '{"lines":[]}'); } catch {} subs.forEach((f) => f()); }
  });
}

export const cart = {
  get: () => { load(); return state; },
  subscribe(f: () => void) { load(); subs.add(f); return () => subs.delete(f); },
  qty: (variantId: string) => state.lines.find((l) => l.variantId === variantId)?.qty ?? 0,
  /** Returns false when the max is hit. */
  add(line: Omit<Line, "qty">): boolean {
    const cur = state.lines.find((l) => l.variantId === line.variantId);
    if (cur) {
      if (cur.qty >= line.max) return false;
      state = { lines: state.lines.map((l) => (l.variantId === line.variantId ? { ...l, ...line, qty: l.qty + 1 } : l)) };
    } else {
      if (line.max <= 0) return false;
      state = { lines: [...state.lines, { ...line, qty: 1 }] };
    }
    emit();
    return true;
  },
  dec(variantId: string) {
    state = { lines: state.lines.map((l) => (l.variantId === variantId ? { ...l, qty: l.qty - 1 } : l)).filter((l) => l.qty > 0) };
    emit();
  },
  set(variantId: string, qty: number) {
    state = { lines: state.lines.map((l) => (l.variantId === variantId ? { ...l, qty } : l)).filter((l) => l.qty > 0) };
    emit();
  },
  /** Re-sync snapshots from a server quote (prices or stock may have changed). */
  syncFromQuote(q: { lines: { variantId: string; qty: number; price: number; mrp: number; available: number }[] }) {
    const m = new Map(q.lines.map((l) => [l.variantId, l]));
    state = {
      lines: state.lines
        .map((l) => { const s = m.get(l.variantId); return s ? { ...l, qty: s.qty, price: s.price, mrp: s.mrp, max: Math.min(10, s.available) } : l; })
        .filter((l) => l.qty > 0),
    };
    emit();
  },
  clear() { state = { lines: [] }; emit(); },
};

const EMPTY: State = { lines: [] };
export function useCart() {
  return useSyncExternalStore(cart.subscribe, cart.get, () => EMPTY);
}
export function useQty(variantId: string) {
  return useSyncExternalStore(cart.subscribe, () => cart.qty(variantId), () => 0);
}
export function useCartTotals() {
  const s = useCart();
  let count = 0, total = 0, mrp = 0;
  for (const l of s.lines) { count += l.qty; total += l.price * l.qty; mrp += l.mrp * l.qty; }
  return { count, total, mrp, lines: s.lines };
}
