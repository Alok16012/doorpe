"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";

const HINTS = ["milk", "bread", "eggs", "atta", "paneer", "chips", "ice cream", "onion", "coffee", "diapers"];

export function SearchTrigger() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % HINTS.length), 2200);
    return () => clearInterval(t);
  }, []);
  return (
    <Link href="/s" role="search" aria-label="Search for products" className="flex h-12 items-center gap-3 rounded-md border border-border bg-surface px-3 text-sm text-muted hover:border-input">
      <Search size={20} className="text-text" aria-hidden />
      <span aria-hidden className="relative h-5 flex-1 overflow-hidden">
        <span key={i} className="absolute inset-0 animate-[fade-in_300ms_ease-out]">Search for “{HINTS[i]}”</span>
      </span>
    </Link>
  );
}
