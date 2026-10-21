"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bike, IndianRupee, UserRound } from "lucide-react";
import { useApp } from "../AppProvider";
import { Logo } from "../shop/Logo";

const TABS = [
  { href: "/rider", label: "Orders", icon: Bike },
  { href: "/rider/earnings", label: "Earnings", icon: IndianRupee },
  { href: "/rider/profile", label: "Profile", icon: UserRound },
];

export function RiderShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return (
    <div className="mx-auto min-h-dvh max-w-md bg-surface pb-20">
      {children}
      <nav aria-label="Rider" className="fixed inset-x-0 bottom-0 z-40 mx-auto flex max-w-md border-t border-border bg-bg pb-[env(safe-area-inset-bottom)]">
        {TABS.map(({ href, label, icon: I }) => {
          const on = href === "/rider" ? path === "/rider" : path.startsWith(href);
          return (
            <Link key={href} href={href} aria-current={on ? "page" : undefined} className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-semibold ${on ? "text-accent" : "text-muted"}`}>
              <I size={22} strokeWidth={on ? 2.4 : 1.8} aria-hidden />{label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function RiderGate({ phone }: { phone?: string }) {
  const { openLogin, setUser } = useApp();
  const router = useRouter();
  return (
    <div className="mx-auto grid min-h-dvh max-w-md place-items-center bg-accent p-6 text-on-accent">
      <div className="w-full text-center">
        <div className="mx-auto w-fit"><Logo /></div>
        <p className="mt-6 text-3xl font-extrabold">Rider app</p>
        <p className="mt-2 text-sm opacity-90">Accept orders, follow the route, deliver with the customer&apos;s code, and see what you earned.</p>
        {phone ? (
          <div className="mt-8 rounded-xl bg-white/10 p-4 text-sm">
            <p>+91 {phone} isn&apos;t registered as a rider. Ask your store manager to add you from the admin panel.</p>
            <button onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); setUser(null); router.refresh(); }} className="mt-3 h-11 w-full rounded-lg bg-white font-semibold text-accent">Log in with another number</button>
          </div>
        ) : (
          <button onClick={() => openLogin(() => router.refresh())} className="mt-8 h-12 w-full rounded-lg bg-white text-base font-bold text-accent">Log in with phone</button>
        )}
        <p className="mt-4 text-xs opacity-80">Demo riders: 8888888888 or 7777777777 (Connaught Place store)</p>
      </div>
    </div>
  );
}
