"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, CircleUserRound, Search, ShoppingCart } from "lucide-react";
import { useApp } from "../AppProvider";
import { useCartTotals } from "../cart/store";
import { inr } from "@/lib/money";
import { SearchTrigger } from "./SearchTrigger";
import { Logo } from "./Logo";

const Caret = () => (
  <svg width="10" height="6" viewBox="0 0 10 6" aria-hidden className="ml-1.5 shrink-0"><path d="M0 0h10L5 6z" fill="currentColor" /></svg>
);

function DeliveryLine({ big = false, light = false }: { big?: boolean; light?: boolean }) {
  const { loc, svc, openLocation } = useApp();
  const title = !loc ? "Delivery in minutes" : !svc?.ok ? "Currently unavailable" : !svc.open ? "Store closed now" : `Delivery in ${svc.etaMin} minutes`;
  return (
    <button onClick={() => openLocation()} className="block min-w-0 max-w-full text-left" aria-label={`${title}. ${loc ? `Delivering to ${loc.label}. ` : ""}Change location`}>
      <span className={`block font-extrabold leading-tight ${light ? "text-on-hero" : "text-text"} ${big ? "text-[18px] md:text-lg" : "text-[16px] md:text-lg"}`}>{title}</span>
      <span className={`mt-0.5 flex items-center text-[13px] ${light ? "text-on-hero/90" : "text-text"}`}>
        <span className="truncate">{loc ? `${loc.label}${loc.sub ? ", " + loc.sub : ""}` : "Select Location"}</span>
        <Caret />
      </span>
    </button>
  );
}

function AccountButton({ light = false }: { light?: boolean }) {
  const { user, openLogin } = useApp();
  const router = useRouter();
  if (user)
    return (
      <Link href="/account" className={`grid size-10 shrink-0 place-items-center md:size-auto md:px-3 md:text-lg md:font-normal md:text-text ${light ? "text-on-hero" : ""}`} aria-label="Your account">
        <CircleUserRound size={30} strokeWidth={1.5} className="md:hidden" />
        <span className="hidden md:inline">Account</span>
      </Link>
    );
  return (
    <button onClick={() => openLogin(() => router.refresh())} className={`grid size-10 shrink-0 place-items-center md:size-auto md:px-3 md:text-lg md:text-text ${light ? "text-on-hero" : ""}`} aria-label="Log in">
      <CircleUserRound size={30} strokeWidth={1.5} className="md:hidden" />
      <span className="hidden md:inline">Login</span>
    </button>
  );
}

function DesktopCart() {
  const { count, total } = useCartTotals();
  return (
    <Link href="/cart" className={`flex h-[50px] min-w-[112px] items-center gap-2 rounded-md px-3 text-sm font-bold ${count ? "bg-accent text-on-accent" : "bg-surface-tint text-muted"}`} aria-label={count ? `Cart, ${count} items, ${inr(total)}` : "Cart is empty"}>
      <ShoppingCart size={24} aria-hidden />
      {count ? <span className="leading-tight">{count} item{count > 1 ? "s" : ""}<br />{inr(total)}</span> : <span>My Cart</span>}
    </Link>
  );
}

export function Header() {
  const path = usePathname();
  const router = useRouter();
  const home = path === "/";
  const onSearch = path.startsWith("/s");
  return (
    <header className={`sticky top-0 z-30 ${home ? "bg-hero-mid md:bg-bg" : "bg-bg"} ${onSearch ? "hidden md:block" : ""} md:border-b md:border-border`}>
      {/* desktop */}
      <div className="mx-auto hidden h-[86px] max-w-[1280px] items-center md:flex">
        <Link href="/" className="flex h-full items-center border-r border-border pr-8" aria-label="Home"><Logo /></Link>
        <div className="w-[260px] shrink-0 px-8"><DeliveryLine /></div>
        <div className="flex-1 pr-8">{!onSearch && <SearchTrigger />}</div>
        <AccountButton />
        <div className="pl-6"><DesktopCart /></div>
      </div>
      {/* mobile */}
      <div className="md:hidden">
        {home ? (
          <div className="px-4 pt-4" style={{ background: "linear-gradient(180deg, var(--color-hero-from) 0%, var(--color-hero-mid) 100%)" }}>
            <div className="flex items-start justify-between gap-2">
              <DeliveryLine big light />
              <AccountButton light />
            </div>
            <div className="pb-3 pt-4"><SearchTrigger onHero /></div>
          </div>
        ) : (
          <div className="flex h-16 items-center gap-2 border-b border-border px-2">
            <button onClick={() => (history.length > 1 ? router.back() : router.push("/"))} aria-label="Go back" className="grid size-10 shrink-0 place-items-center"><ArrowLeft size={22} /></button>
            <div className="min-w-0 flex-1"><DeliveryLine /></div>
            <Link href="/s" aria-label="Search" className="grid size-10 shrink-0 place-items-center"><Search size={22} /></Link>
          </div>
        )}
      </div>
    </header>
  );
}
