"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "../AppProvider";
import { setStock } from "@/app/admin/actions";
import { ProductArt } from "../shop/ProductArt";
import { field } from "./ui";

type Row = { id: string; name: string; unit: string; icon: string; stock: number };

export function StockEditor({ storeId, stores, rows, lowOnly = false }: { storeId: string; stores: { id: string; name: string }[]; rows: Row[]; lowOnly?: boolean }) {
  const router = useRouter();
  const { toast } = useApp();
  const [q, setQ] = useState("");
  const [onlyLow, setOnlyLow] = useState(lowOnly);
  const [vals, setVals] = useState<Record<string, number>>(() => Object.fromEntries(rows.map((r) => [r.id, r.stock])));
  const list = useMemo(() => rows.filter((r) => r.name.toLowerCase().includes(q.toLowerCase()) && (!onlyLow || (vals[r.id] ?? 0) <= 5)), [rows, q, onlyLow, vals]);

  async function save(id: string, stock: number) {
    const r = await setStock(storeId, id, stock);
    toast(r.ok ? "Stock updated" : r.error);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-bg p-3">
        <select value={storeId} onChange={(e) => router.push(`/admin/inventory?store=${e.target.value}`)} aria-label="Store" className={`${field} max-w-[240px]`}>
          {stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find an item" aria-label="Find an item" className={`${field} max-w-xs flex-1`} />
        <label className="flex items-center gap-1.5 text-sm font-semibold"><input type="checkbox" checked={onlyLow} onChange={(e) => setOnlyLow(e.target.checked)} className="size-4 accent-[var(--color-accent)]" /> 5 or fewer</label>
        <span className="ml-auto text-xs text-muted">{list.length} items</span>
      </div>
      <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-bg">
        {list.map((r) => (
          <li key={r.id} className="flex items-center gap-3 px-3 py-2">
            <div className="w-9 shrink-0"><ProductArt icon={r.icon} size="sm" className="!p-0.5" /></div>
            <span className="min-w-0 flex-1 text-sm"><b className="block truncate font-semibold">{r.name}</b><span className="text-xs text-muted">{r.unit}</span></span>
            {[-5, 10, 50].map((d) => (
              <button key={d} onClick={() => { const n = Math.max(0, (vals[r.id] ?? 0) + d); setVals((v) => ({ ...v, [r.id]: n })); save(r.id, n); }}
                className="hidden h-8 rounded-md border border-border px-2 text-xs font-semibold text-muted hover:border-input sm:block">{d > 0 ? `+${d}` : d}</button>
            ))}
            <input type="number" min={0} max={9999} value={vals[r.id]} aria-label={`Stock for ${r.name} ${r.unit}`}
              onChange={(e) => setVals((v) => ({ ...v, [r.id]: Number(e.target.value) }))}
              onBlur={(e) => Number(e.target.value) !== r.stock && save(r.id, Number(e.target.value))}
              className={`h-9 w-20 rounded-md border px-2 text-right text-sm font-bold tabular-nums ${vals[r.id] <= 0 ? "border-danger text-danger" : vals[r.id] <= 5 ? "border-warning text-warning" : "border-input"}`} />
          </li>
        ))}
        {!list.length && <li className="p-8 text-center text-sm text-muted">Nothing here.</li>}
      </ul>
    </div>
  );
}
