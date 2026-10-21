import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight, CircleHelp, LayoutDashboard, MapPin, Package, UserRound, Wallet } from "lucide-react";
import { currentUser } from "@/lib/auth";
import { TitleBar } from "@/components/ui/TitleBar";
import { LoginPrompt, LogoutButton } from "@/components/account/AccountBits";
import { inr } from "@/lib/money";

export const metadata: Metadata = { title: "Your account" };

export default async function AccountPage() {
  const user = await currentUser();
  if (!user) return (<><TitleBar title="Your account" back="/" /><LoginPrompt /></>);
  const items = [
    { href: "/account/orders", icon: Package, label: "Your orders", sub: "Track, reorder, get help" },
    { href: "/account/addresses", icon: MapPin, label: "Saved addresses", sub: "Home, work and more" },
    { href: "/account/wallet", icon: Wallet, label: "Wallet", sub: `Balance ${inr(user.walletBalance)}` },
    { href: "/account/profile", icon: UserRound, label: "Profile", sub: "Name and email" },
    { href: "/help", icon: CircleHelp, label: "Help & FAQs", sub: "Refunds, delivery, payments" },
    ...(user.role === "admin" ? [{ href: "/admin", icon: LayoutDashboard, label: "Store dashboard", sub: "Live orders and stock" }] : []),
  ];
  return (
    <>
      <TitleBar title="Your account" back="/" />
      <div className="mx-auto max-w-xl space-y-3 p-3">
        <section className="rounded-md bg-bg p-4">
          <p className="text-lg font-extrabold">{user.name || "Hello there"}</p>
          <p className="text-sm text-muted">+91 {user.phone}{user.email ? ` · ${user.email}` : ""}</p>
        </section>
        <nav aria-label="Account" className="overflow-hidden rounded-md bg-bg">
          <ul className="divide-y divide-border">
            {items.map(({ href, icon: I, label, sub }) => (
              <li key={href}><Link href={href} className="flex items-center gap-3 px-4 py-3.5 hover:bg-surface">
                <span className="grid size-9 place-items-center rounded-full bg-surface"><I size={18} aria-hidden /></span>
                <span className="flex-1"><b className="block text-sm">{label}</b><span className="block text-xs text-muted">{sub}</span></span>
                <ChevronRight size={18} className="text-muted" aria-hidden />
              </Link></li>
            ))}
          </ul>
        </nav>
        <LogoutButton />
      </div>
    </>
  );
}
