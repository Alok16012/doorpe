import { ok, fail, body } from "@/lib/http";
import { currentUser } from "@/lib/auth";
import { issuesFor, raiseIssue } from "@/lib/account";
import type { Issue } from "@/lib/types";

export async function GET(_req: Request, ctx: RouteContext<"/api/orders/[id]/issues">) {
  const user = await currentUser();
  if (!user) return fail("Log in first", 401);
  return ok({ issues: await issuesFor(user, (await ctx.params).id) });
}
export async function POST(req: Request, ctx: RouteContext<"/api/orders/[id]/issues">) {
  const user = await currentUser();
  if (!user) return fail("Log in first", 401);
  const b = await body<{ kind: Issue["kind"]; variantId: string; note: string; photo: string }>(req);
  if (!["missing", "damaged", "wrong", "quality", "late", "other"].includes(String(b.kind))) return fail("Tell us what went wrong");
  if (b.photo && !/^data:image\/(png|jpe?g|webp);base64,/.test(b.photo)) return fail("Photo must be an image");
  const r = await raiseIssue(user, (await ctx.params).id, { kind: b.kind!, variantId: b.variantId, note: b.note, photo: b.photo });
  return r.ok ? ok(r) : fail(r.error, 409);
}
