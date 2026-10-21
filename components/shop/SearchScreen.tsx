"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock, Search, TrendingUp, X } from "lucide-react";
import type { CardProduct } from "@/lib/dto";
import { ProductCard, ProductCardSkeleton } from "./ProductCard";

type Sugg = { label: string; icon: string; href: string; kind: "product" | "category" };
const TRENDING = ["milk", "eggs", "bread", "paneer", "chips", "atta", "ice cream", "coffee"];
const RECENT_KEY = "turant_recent_searches";

function readRecent(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); } catch { return []; }
}
function pushRecent(q: string) {
  try {
    const next = [q, ...readRecent().filter((x) => x !== q)].slice(0, 6);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {}
}

function Highlight({ text, q }: { text: string; q: string }) {
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (!q || i < 0) return <span className="font-semibold">{text}</span>;
  return <span className="text-muted">{text.slice(0, i)}<b className="text-text">{text.slice(i, i + q.length)}</b>{text.slice(i + q.length)}</span>;
}

export function SearchScreen({ initialQ, eta, cats }: { initialQ: string; eta: number | null; cats: { slug: string; name: string; icon: string; tint: string }[] }) {
  const router = useRouter();
  const [q, setQ] = useState(initialQ);
  const [data, setData] = useState<{ q: string; suggestions: Sugg[]; products: CardProduct[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => { setRecent(readRecent()); input.current?.focus(); }, []);

  useEffect(() => {
    const term = q.trim();
    const url = term ? `/s?q=${encodeURIComponent(term)}` : "/s";
    window.history.replaceState(null, "", url);
    if (!term) { setData(null); setLoading(false); return; }
    setLoading(true); setError(false);
    const ctl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(term)}`, { signal: ctl.signal });
        setData(await r.json());
        setLoading(false);
      } catch (e) {
        if ((e as Error).name !== "AbortError") { setError(true); setLoading(false); }
      }
    }, 250);
    return () => { clearTimeout(t); ctl.abort(); };
  }, [q]);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2 || !data?.products.length) return;
    const t = setTimeout(() => { pushRecent(term); }, 1500);
    return () => clearTimeout(t);
  }, [data, q]);

  const term = q.trim();
  const productSugg = data?.suggestions ?? [];

  return (
    <div className="min-h-dvh md:min-h-0">
      <div className="sticky top-0 z-30 bg-bg px-3 py-3 md:top-[84px] md:px-0">
        <form role="search" onSubmit={(e) => { e.preventDefault(); input.current?.blur(); if (term) pushRecent(term); }}
          className="flex h-12 items-center gap-2 rounded-md border border-border bg-bg px-2 shadow-card focus-within:border-accent">
          <button type="button" onClick={() => (history.length > 1 ? router.back() : router.push("/"))} aria-label="Go back" className="grid size-9 place-items-center rounded-full hover:bg-surface md:hidden"><ArrowLeft size={20} /></button>
          <Search size={18} className="ml-1 hidden text-muted md:block" aria-hidden />
          <input ref={input} type="search" value={q} onChange={(e) => setQ(e.target.value)} enterKeyHint="search"
            placeholder="Search groceries, snacks, essentials…" aria-label="Search products"
            className="h-full flex-1 bg-transparent text-[15px] font-semibold outline-none placeholder:font-medium placeholder:text-faint [&::-webkit-search-cancel-button]:hidden" />
          {q && <button type="button" onClick={() => { setQ(""); input.current?.focus(); }} aria-label="Clear search" className="grid size-9 place-items-center rounded-full hover:bg-surface"><X size={18} /></button>}
        </form>
      </div>

      {!term && (
        <div className="space-y-6 px-3 pb-10 pt-2 md:px-0">
          {recent.length > 0 && (
            <section>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-base font-extrabold">Recent searches</h2>
                <button className="text-xs font-bold text-accent" onClick={() => { localStorage.removeItem(RECENT_KEY); setRecent([]); }}>Clear</button>
              </div>
              <ul className="flex flex-wrap gap-2">
                {recent.map((r) => <li key={r}><button onClick={() => setQ(r)} className="flex items-center gap-1.5 rounded-pill border border-border px-3 py-1.5 text-sm font-semibold hover:border-input"><Clock size={14} className="text-muted" />{r}</button></li>)}
              </ul>
            </section>
          )}
          <section>
            <h2 className="mb-2 text-base font-extrabold">Popular right now</h2>
            <ul className="flex flex-wrap gap-2">
              {TRENDING.map((r) => <li key={r}><button onClick={() => setQ(r)} className="flex items-center gap-1.5 rounded-pill border border-border px-3 py-1.5 text-sm font-semibold hover:border-input"><TrendingUp size={14} className="text-success" />{r}</button></li>)}
            </ul>
          </section>
          <section>
            <h2 className="mb-3 text-base font-extrabold">Browse categories</h2>
            <ul className="grid grid-cols-4 gap-3 md:grid-cols-8">
              {cats.map((c) => (
                <li key={c.slug}><Link href={`/cn/${c.slug}`} className="block text-center">
                  <span aria-hidden className="grid aspect-square place-items-center rounded-md text-3xl" style={{ background: c.tint }}>{c.icon}</span>
                  <span className="mt-1 line-clamp-2 block text-xs font-bold leading-4">{c.name}</span>
                </Link></li>
              ))}
            </ul>
          </section>
        </div>
      )}

      {term && (
        <div className="px-3 pb-10 md:px-0">
          {productSugg.length > 0 && (
            <ul className="mb-3 divide-y divide-border rounded-md border border-border bg-bg" aria-label="Suggestions">
              {productSugg.slice(0, 5).map((s) => (
                <li key={s.href}><Link href={s.href} className="flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-surface">
                  <span aria-hidden className="grid size-9 place-items-center rounded-sm bg-surface text-xl">{s.icon}</span>
                  <Highlight text={s.label} q={term} />
                  {s.kind === "category" && <span className="ml-auto text-xs font-semibold text-muted">in Categories</span>}
                </Link></li>
              ))}
            </ul>
          )}
          {error && <p className="py-10 text-center text-sm text-danger">Search didn&apos;t load. Check your connection and try again.</p>}
          {loading && !data?.products.length && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5 md:gap-3">{Array.from({ length: 6 }, (_, i) => <ProductCardSkeleton key={i} />)}</div>
          )}
          {data && data.q === term && !loading && data.products.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-4xl" aria-hidden>🔎</p>
              <p className="mt-3 font-extrabold">No matches for “{term}”</p>
              <p className="mt-1 text-sm text-muted">Check the spelling, or try something more general like “milk” or “snacks”.</p>
            </div>
          )}
          {data && data.products.length > 0 && (
            <>
              <p className="mb-2 text-sm font-semibold text-muted" aria-live="polite">Showing {data.products.length} result{data.products.length > 1 ? "s" : ""} for “{data.q}”</p>
              <ul className={`grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5 md:gap-3 ${loading ? "opacity-60" : ""}`}>
                {data.products.map((p, i) => <li key={p.slug}><ProductCard p={p} eta={eta} /></li>)}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
