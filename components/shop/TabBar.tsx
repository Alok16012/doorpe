"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, LayoutGrid, Package, UserRound } from "lucide-react";

const TABS = [
  { href: "/", label: "Home", icon: House, match: (p: string) => p === "/" },
  { href: "/categories", label: "Categories", icon: LayoutGrid, match: (p: string) => p.startsWith("/categories") },
  { href: "/account/orders", label: "Orders", icon: Package, match: (p: string) => p.startsWith("/account/orders") },
  { href: "/account", label: "Account", icon: UserRound, match: (p: string) => p === "/account" || (p.startsWith("/account/") && !p.startsWith("/account/orders")) },
];

/** Top-level screens show the app tab bar on phones; inner screens (product, cart, checkout…) don't. */
export function showsTabBar(path: string) {
  return path === "/" || path === "/categories" || path.startsWith("/account");
}

/** Height of the tab bar, so floating bars can sit just above it. */
export const TAB_BAR_H = "calc(60px + env(safe-area-inset-bottom))";

export function TabBar() {
  const path = usePathname();
  if (!showsTabBar(path)) return null;
  return (
    <>
    {/* keeps the last bit of content clear of the fixed bar */}
    <div aria-hidden className="md:hidden" style={{ height: TAB_BAR_H }} />
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-bg pb-[env(safe-area-inset-bottom)] md:hidden">
      {TABS.map(({ href, label, icon: I, match }) => {
        const on = match(path);
        return (
          <Link key={href} href={href} aria-current={on ? "page" : undefined}
            className={`flex h-[60px] flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold ${on ? "text-accent" : "text-muted"}`}>
            <span className={`grid h-7 w-12 place-items-center rounded-pill transition-colors ${on ? "bg-accent-soft" : ""}`}><I size={21} strokeWidth={on ? 2.4 : 1.8} aria-hidden /></span>
            {label}
          </Link>
        );
      })}
    </nav>
    </>
  );
}
