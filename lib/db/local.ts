import "server-only";
import { promises as fs, readFileSync } from "fs";
import path from "path";
import type { Address, Issue, Order, User } from "../types";
import type { CatalogData } from "../catalog/model";
import type { Coupon, FeeSettings } from "../fees";
import type { StoreOverride } from "../geo";

/**
 * Local JSON driver. Zero setup: data lives in .data/db.json (or /tmp on serverless).
 * Same function signatures the Supabase driver will implement (see replica/architecture.md).
 */
export type OtpRow = { phone: string; code: string; expiresAt: number; attempts: number; sends: number[] };
export type WalletTxn = { id: string; userId: string; kind: "refund" | "credit" | "debit"; amount: number; note: string; at: string };
type DB = {
  users: User[];
  otps: OtpRow[];
  addresses: Address[];
  orders: Order[];
  issues: Issue[];
  wallet: WalletTxn[];
  stock: Record<string, Record<string, number>>;
  idem: Record<string, string>;
  /** Editable catalogue (seeded from lib/catalog/data.ts on first run). */
  catalog?: CatalogData;
  catalogVersion: number;
  coupons?: (Coupon & { active: boolean; createdAt: string })[];
  settings?: FeeSettings;
  storeOverrides: Record<string, StoreOverride>;
  riderLocations: Record<string, { lat: number; lng: number; at: string; accuracy?: number }>;
};
export type { DB };

const DIR = process.env.DATA_DIR || (process.env.NETLIFY || process.env.VERCEL ? "/tmp/doorpe" : path.join(process.cwd(), ".data"));
const FILE = path.join(DIR, "db.json");
const empty = (): DB => ({ users: [], otps: [], addresses: [], orders: [], issues: [], wallet: [], stock: {}, idem: {}, catalogVersion: 1, storeOverrides: {}, riderLocations: {} });

const g = globalThis as unknown as { __doorpeDb?: DB; __doorpeQueue?: Promise<unknown> };

/** Synchronous load, so pure helpers (catalogue, fees, stores) can read without await. */
export function dbSync(): DB {
  if (g.__doorpeDb) {
    // fill fields added after this process first loaded the file
    const e = empty() as Record<string, unknown>;
    const d = g.__doorpeDb as unknown as Record<string, unknown>;
    for (const k of Object.keys(e)) if (d[k] === undefined) d[k] = e[k];
    return g.__doorpeDb;
  }
  try {
    g.__doorpeDb = { ...empty(), ...JSON.parse(readFileSync(FILE, "utf8")) };
  } catch {
    g.__doorpeDb = empty();
  }
  return g.__doorpeDb!;
}

async function load(): Promise<DB> {
  return dbSync();
}

async function persist(db: DB) {
  await fs.mkdir(DIR, { recursive: true });
  const tmp = FILE + "." + process.pid + ".tmp";
  await fs.writeFile(tmp, JSON.stringify(db, null, 1));
  await fs.rename(tmp, FILE);
}

/** Read-only access. */
export async function read<T>(fn: (db: DB) => T): Promise<T> {
  return fn(await load());
}

/** Serialised read-modify-write. Every mutation goes through here, so two requests never interleave. */
export function write<T>(fn: (db: DB) => T): Promise<T> {
  const run = async () => {
    const db = await load();
    const out = fn(db);
    await persist(db);
    return out;
  };
  const next = (g.__doorpeQueue || Promise.resolve()).then(run, run);
  g.__doorpeQueue = next.catch(() => undefined);
  return next;
}

export const uid = (prefix = "") =>
  prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

// Let geo.ts (shared, no fs) see the admin's store overrides.
import { setStoreOverridesSource } from "../geo";
setStoreOverridesSource(() => dbSync().storeOverrides || {});
