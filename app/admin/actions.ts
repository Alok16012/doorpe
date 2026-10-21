"use server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import * as A from "@/lib/admin";
import { advanceOrder, OrderError } from "@/lib/orders";
import type { FeeSettings } from "@/lib/fees";
import type { StoredCoupon } from "@/lib/settings";
import type { StoreOverride } from "@/lib/geo";
import type { User } from "@/lib/types";

export type Result = { ok: true; id?: string } | { ok: false; error: string };

async function run(fn: (me: User) => Promise<unknown>, paths: string[] = []): Promise<Result> {
  try {
    const me = await requireAdmin();
    const out = await fn(me);
    for (const p of paths) revalidatePath(p, "layout");
    return { ok: true, id: (out as { id?: string } | undefined)?.id };
  } catch (e) {
    if (e instanceof A.AdminError || e instanceof OrderError) return { ok: false, error: e.message };
    if (e instanceof Error && e.message === "Staff only") return { ok: false, error: "Staff only" };
    console.error(e);
    return { ok: false, error: "Something went wrong. Try again." };
  }
}

export const advance = async (id: string, otp?: string) => run(() => advanceOrder(id, otp), ["/admin"]);
export const cancelOrder = async (id: string, reason: string) => run(() => A.adminCancel(id, reason), ["/admin"]);
export const saveProduct = async (input: A.ProductInput, id?: string) => run(() => A.saveProduct(input, id), ["/"]);
export const setProductActive = async (id: string, active: boolean) => run(() => A.setProductActive(id, active), ["/"]);
export const saveCategory = async (input: Parameters<typeof A.saveCategory>[0], slug?: string) => run(() => A.saveCategory(input, slug), ["/"]);
export const saveSub = async (input: Parameters<typeof A.saveSub>[0], slug?: string) => run(() => A.saveSub(input, slug), ["/"]);
export const moveCategory = async (slug: string, dir: -1 | 1) => run(() => A.moveCategory(slug, dir), ["/"]);
export const setStock = async (storeId: string, variantId: string, stock: number) => run(() => A.setStock(storeId, variantId, stock), ["/"]);
export const updateStore = async (id: string, patch: StoreOverride) => run(() => A.updateStore(id, patch), ["/"]);
export const creditWallet = async (userId: string, amount: number, note: string) => run(() => A.creditWallet(userId, amount, note), ["/admin"]);
export const setRole = async (userId: string, role: User["role"]) => run((me) => A.setRole(userId, role, me.id), ["/admin"]);
export const saveCoupon = async (c: Omit<StoredCoupon, "createdAt">, original?: string) => run(() => A.saveCoupon(c, original), ["/"]);
export const deleteCoupon = async (code: string) => run(() => A.deleteCoupon(code), ["/"]);
export const resolveIssue = async (id: string, action: "refund" | "reject", amount?: number) => run(() => A.resolveIssue(id, action, amount), ["/admin"]);
export const saveFees = async (f: FeeSettings) => run(() => A.saveFees(f), ["/"]);
export const addRider = async (input: Parameters<typeof A.addRider>[0]) => run(() => A.addRider(input), ["/admin"]);
export const updateRider = async (id: string, patch: Parameters<typeof A.updateRider>[1]) => run(() => A.updateRider(id, patch), ["/admin"]);
