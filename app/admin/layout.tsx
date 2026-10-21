import type { Metadata } from "next";
import { currentUser } from "@/lib/auth";
import { read } from "@/lib/db/local";
import { AdminShell } from "@/components/admin/AdminShell";
import { LoginPrompt } from "@/components/account/AccountBits";
import { Logo } from "@/components/shop/Logo";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Admin" }, robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  if (!user || user.role !== "admin")
    return (
      <div className="grid min-h-dvh place-items-center bg-surface p-6">
        <div className="w-full max-w-md rounded-xl bg-bg p-6 text-center shadow-card">
          <Logo />
          <p className="mt-4 text-lg font-bold">Admin panel</p>
          {user ? (
            <p className="mt-2 text-sm text-muted">You&apos;re logged in as +91 {user.phone}, which isn&apos;t a staff account. Ask an admin to give you access from Customers.</p>
          ) : (
            <LoginPrompt title="Staff login" body="Log in with a staff phone number. In the demo, 9999999999 is an admin." />
          )}
        </div>
      </div>
    );
  const openIssues = await read((db) => db.issues.filter((i) => i.status === "open").length);
  return <AdminShell user={{ name: user.name || "Admin", phone: user.phone }} openIssues={openIssues}>{children}</AdminShell>;
}
