"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, ChevronDown, CircleUserRound, Search, ShoppingCart, TriangleAlert } from "lucide-react";
import { useApp } from "../AppProvider";
import { useCartTotals } from "../cart/store";
import { inr } from "@/lib/money";
import { BRAND } from "@/lib/brand";
import { SearchTrigger } from "./SearchTrigger";

function DeliveryLine({ big = false }: { big?: boolean }) {
  const { loc, svc, openLocation } = useApp();
  const title = !loc ? "Set your location" : !svc?.ok ? "Not delivering here yet" : !svc.open ? "Store closed now" : `Delivery in ${svc.etaMin} minutes`;
  return (
    <button onClick={openLocation} className="min-w-0 text-left" aria-label={`${title}. ${loc ? `Delivering to ${loc.label}. ` : ""}Change location`}>
      <span className={`flex items-center gap-1 font-extrabold tracking-tight ${big ? "text-xl md:text-lg" : "text-base"} ${loc && !svc?.ok ? "text-warning" : ""}`}>
        {loc && !svc?.ok && <TriangleAlert size={16} aria-hidden />} {title}
      </span>
      <span className="flex items-center gap-0.5 text-[13px] font-medium text-muted">
        <span className="truncate">{loc ? `${loc.label}${loc.sub ? ", " + loc.sub : ""}` : "Pick an address to see what's in stock"}</span>
        <ChevronDown size={16} className="shrink-0 text-text" aria-hidden />
      </span>
    </button>
  );
}

function AccountButton() {
  const { user, openLogin } = useApp();
  const router = useRouter();
  if (user)
    return (
      <Link href="/account" className="grid size-10 place-items-center rounded-full hover:bg-surface md:flex md:size-auto md:gap-1.5 md:px-3 md:py-2" aria-label="Your account">
        <CircleUserRound size={28} strokeWidth={1.6} className="md:size-5" />
        <span className="hidden text-sm font-bold md:inline">Account</span>
      </Link>
    );
  return (
    <button onClick={() => openLogin(() => router.refresh())} className="grid size-10 place-items-center rounded-full hover:bg-surface md:size-auto md:px-4 md:py-2 md:text-base md:font-semibold" aria-label="Log in">
      <CircleUserRound size={28} strokeWidth={1.6} className="md:hidden" />
      <span className="hidden md:inline">Login</span>
    </button>
  );
}

function DesktopCart() {
  const { count, total } = useCartTotals();
  return (
    <Link href="/cart" className={`flex h-12 min-w-[112px] items-center gap-2 rounded-md px-3 text-sm font-extrabold ${count ? "bg-accent text-on-accent" : "bg-surface text-muted"}`} aria-label={count ? `Cart, ${count} items, ${inr(total)}` : "Cart is empty"}>
      <ShoppingCart size={22} aria-hidden />
      {count ? <span className="leading-tight">{count} item{count > 1 ? "s" : ""}<br />{inr(total)}</span> : <span>My Cart</span>}
    </Link>
  );
}

export function Header() {
  const path = usePathname();
  const router = useRouter();
  const home = path === "/";
  const onSearch = path.startsWith("/s");
  if (onSearch) return <DesktopOnlyHeader />;
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg">
      {/* desktop */}
      <div className="mx-auto hidden h-[84px] max-w-[1280px] items-center gap-6 px-6 md:flex">
        <Link href="/" className="rounded-md bg-brand px-3 py-1.5 text-2xl font-extrabold tracking-tight text-on-brand">{BRAND.name}</Link>
        <div className="w-[240px] shrink-0 border-r border-border pr-4"><DeliveryLine /></div>
        <div className="flex-1"><SearchTrigger /></div>
        <AccountButton />
        <DesktopCart />
      </div>
      {/* mobile */}
      <div className="md:hidden">
        {home ? (
          <div className="px-3 pt-3">
            <div className="flex items-start justify-between gap-2">
              <DeliveryLine big />
              <AccountButton />
            </div>
            <div className="py-3"><SearchTrigger /></div>
          </div>
        ) : (
          <div className="flex h-16 items-center gap-2 px-2">
            <button onClick={() => (history.length > 1 ? router.back() : router.push("/"))} aria-label="Go back" className="grid size-10 shrink-0 place-items-center rounded-full hover:bg-surface"><ArrowLeft size={22} /></button>
            <div className="min-w-0 flex-1"><DeliveryLine /></div>
            <Link href="/s" aria-label="Search" className="grid size-10 shrink-0 place-items-center rounded-full hover:bg-surface"><Search size={22} /></Link>
          </div>
        )}
      </div>
    </header>
  );
}

function DesktopOnlyHeader() {
  return (
    <header className="sticky top-0 z-30 hidden border-b border-border bg-bg md:block">
      <div className="mx-auto flex h-[84px] max-w-[1280px] items-center gap-6 px-6">
        <Link href="/" className="rounded-md bg-brand px-3 py-1.5 text-2xl font-extrabold tracking-tight text-on-brand">{BRAND.name}</Link>
        <div className="w-[240px] shrink-0"><DeliveryLine /></div>
        <div className="flex-1" />
        <AccountButton />
        <DesktopCart />
      </div>
    </header>
  );
}
