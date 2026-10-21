"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Mic, Search } from "lucide-react";

const HINTS = ["Paneer", "milk", "bread", "sugar", "butter", "chocolate", "curd", "rice", "eggs", "chips"];

export function SearchTrigger({ onHero = false }: { onHero?: boolean }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % HINTS.length), 2400);
    return () => clearInterval(t);
  }, []);
  return (
    <div role="search" className={`flex h-12 items-center rounded-xl bg-search text-sm text-faint ${onHero ? "shadow-[0_2px_10px_rgba(10,20,80,0.18)]" : "border border-border hover:border-input"}`}>
      <Link href="/s" aria-label="Search for products" className="flex h-full flex-1 items-center gap-3 pl-3">
        <Search size={18} strokeWidth={2.2} className="text-text" aria-hidden />
        <span aria-hidden className="relative h-[18px] flex-1 overflow-hidden">
          <span key={i} className="absolute inset-0 animate-[slide-up_400ms_ease-out]">Search for &quot;{HINTS[i]}&quot;</span>
        </span>
      </Link>
      <Link href="/s?voice=1" aria-label="Search by voice" className="grid h-full w-11 place-items-center border-l border-border text-accent"><Mic size={18} strokeWidth={2.2} /></Link>
    </div>
  );
}
