import { ok, fail, body } from "@/lib/http";
import { currentUser } from "@/lib/auth";
import { updateProfile } from "@/lib/account";

export async function GET() {
  return ok({ user: await currentUser() });
}
export async function PATCH(req: Request) {
  const user = await currentUser();
  if (!user) return fail("Log in first", 401);
  const b = await body<{ name: string; email: string }>(req);
  if (b.email && !/^\S+@\S+\.\S+$/.test(b.email)) return fail("That email doesn't look right");
  return ok({ user: await updateProfile(user, b) });
}
