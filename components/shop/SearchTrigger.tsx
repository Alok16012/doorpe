"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";

const HINTS = ["milk", "bread", "sugar", "butter", "paneer", "chocolate", "curd", "rice", "egg", "chips"];

export function SearchTrigger() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % HINTS.length), 2400);
    return () => clearInterval(t);
  }, []);
  return (
    <Link href="/s" role="search" aria-label="Search for products"
      className="flex h-12 items-center gap-3 rounded-lg border border-border bg-search px-3 text-sm text-[#828282] hover:border-[#d6d6d6]">
      <Search size={18} strokeWidth={2.2} className="text-text" aria-hidden />
      <span aria-hidden className="relative h-[18px] flex-1 overflow-hidden">
        <span key={i} className="absolute inset-0 animate-[slide-up_400ms_ease-out]">Search &quot;{HINTS[i]}&quot;</span>
      </span>
    </Link>
  );
}
