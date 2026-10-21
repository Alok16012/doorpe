import { NextResponse } from "next/server";
export const ok = (data: unknown, init?: ResponseInit) => NextResponse.json(data, init);
export const fail = (error: string, status = 400, extra?: Record<string, unknown>) => NextResponse.json({ error, ...extra }, { status });
export async function body<T>(req: Request): Promise<Partial<T>> {
  try { return (await req.json()) as Partial<T>; } catch { return {}; }
}
