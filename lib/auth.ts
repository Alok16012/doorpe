import "server-only";
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import { read, write, uid } from "./db/local";
import type { User } from "./types";

const COOKIE = "turant_session";
const SECRET = process.env.SESSION_SECRET || "dev-only-secret-change-me";
const MAX_AGE = 60 * 60 * 24 * 30;
const ADMIN_PHONES = (process.env.ADMIN_PHONES || "9999999999").split(",").map((s) => s.trim());

const sign = (v: string) => createHmac("sha256", SECRET).update(v).digest("base64url");

export function makeToken(userId: string) {
  const body = `${userId}.${Math.floor(Date.now() / 1000) + MAX_AGE}`;
  return `${body}.${sign(body)}`;
}

function parseToken(t?: string) {
  if (!t) return null;
  const i = t.lastIndexOf(".");
  const body = t.slice(0, i), mac = t.slice(i + 1);
  const good = sign(body);
  if (mac.length !== good.length || !timingSafeEqual(Buffer.from(mac), Buffer.from(good))) return null;
  const [userId, exp] = body.split(".");
  if (Number(exp) < Date.now() / 1000) return null;
  return userId;
}

export async function currentUser(): Promise<User | null> {
  const jar = await cookies();
  const id = parseToken(jar.get(COOKIE)?.value);
  if (!id) return null;
  return read((db) => db.users.find((u) => u.id === id) || null);
}

export async function setSession(userId: string) {
  const jar = await cookies();
  jar.set(COOKIE, makeToken(userId), {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: MAX_AGE,
  });
}

export async function clearSession() {
  (await cookies()).delete(COOKIE);
}

export const validPhone = (p: string) => /^[6-9]\d{9}$/.test(p);

/** Returns the OTP when no SMS provider is configured, so the demo can show it on screen. */
export async function sendOtp(phone: string): Promise<{ ok: true; devOtp?: string } | { ok: false; error: string }> {
  if (!validPhone(phone)) return { ok: false, error: "Enter a valid 10-digit mobile number" };
  const now = Date.now();
  const code = String(Math.floor(1000 + Math.random() * 9000));
  const res = await write((db) => {
    let row = db.otps.find((o) => o.phone === phone);
    if (!row) { row = { phone, code, expiresAt: 0, attempts: 0, sends: [] }; db.otps.push(row); }
    row.sends = row.sends.filter((t) => now - t < 10 * 60_000);
    if (row.sends.length >= 3) return { ok: false as const, error: "Too many codes requested. Try again in a few minutes." };
    row.sends.push(now);
    row.code = code;
    row.expiresAt = now + 5 * 60_000;
    row.attempts = 0;
    return { ok: true as const };
  });
  if (!res.ok) return res;
  // Production: send via MSG91 / Twilio here. Without a provider, expose the code to the demo UI.
  const smsConfigured = Boolean(process.env.SMS_PROVIDER);
  if (!smsConfigured) console.log(`[otp] ${phone}: ${code}`);
  return { ok: true, devOtp: smsConfigured ? undefined : code };
}

export async function verifyOtp(phone: string, code: string): Promise<{ ok: true; user: User } | { ok: false; error: string }> {
  const now = Date.now();
  return write((db) => {
    const row = db.otps.find((o) => o.phone === phone);
    if (!row || row.expiresAt < now) return { ok: false as const, error: "Code expired. Request a new one." };
    if (row.attempts >= 5) return { ok: false as const, error: "Too many wrong attempts. Request a new code." };
    if (row.code !== code) { row.attempts++; return { ok: false as const, error: "That code doesn't match. Check and try again." }; }
    row.expiresAt = 0;
    let user = db.users.find((u) => u.phone === phone);
    if (!user) {
      user = { id: uid("u_"), phone, role: ADMIN_PHONES.includes(phone) ? "admin" : "customer", walletBalance: 0, createdAt: new Date().toISOString() };
      db.users.push(user);
    }
    return { ok: true as const, user };
  });
}

/** For server actions and admin pages: the signed-in admin, or an error. */
export async function requireAdmin(): Promise<User> {
  const u = await currentUser();
  if (!u || u.role !== "admin") throw new Error("Staff only");
  return u;
}
