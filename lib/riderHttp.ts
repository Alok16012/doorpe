import "server-only";
import { NextResponse } from "next/server";
import { requireRider } from "./auth";
import { OrderError } from "./orders";
import type { User } from "./types";

/** Wrap a rider route: auth, then map known errors to 4xx. */
export async function asRider(fn: (r: User) => Promise<unknown>) {
  let rider: User;
  try { rider = await requireRider(); } catch { return NextResponse.json({ error: "Riders only. Log in with a rider number." }, { status: 401 }); }
  try {
    return NextResponse.json((await fn(rider)) ?? { ok: true });
  } catch (e) {
    if (e instanceof OrderError) return NextResponse.json({ error: e.message, code: e.code }, { status: 409 });
    console.error(e);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
