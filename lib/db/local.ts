import "server-only";
import { promises as fs } from "fs";
import path from "path";
import type { Address, Issue, Order, User } from "../types";

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
};

const DIR = process.env.DATA_DIR || (process.env.NETLIFY || process.env.VERCEL ? "/tmp/turant" : path.join(process.cwd(), ".data"));
const FILE = path.join(DIR, "db.json");
const empty = (): DB => ({ users: [], otps: [], addresses: [], orders: [], issues: [], wallet: [], stock: {}, idem: {} });

const g = globalThis as unknown as { __turantDb?: DB; __turantQueue?: Promise<unknown> };

async function load(): Promise<DB> {
  if (g.__turantDb) return g.__turantDb;
  try {
    g.__turantDb = { ...empty(), ...JSON.parse(await fs.readFile(FILE, "utf8")) };
  } catch {
    g.__turantDb = empty();
  }
  return g.__turantDb!;
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
  const next = (g.__turantQueue || Promise.resolve()).then(run, run);
  g.__turantQueue = next.catch(() => undefined);
  return next;
}

export const uid = (prefix = "") =>
  prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
