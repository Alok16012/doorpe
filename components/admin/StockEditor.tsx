"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "../AppProvider";

type Row = { id: string; name: string; unit: string; icon: string; stock: number };

export function StockEditor({ storeId, stores, rows }: { storeId: string; stores: { id: string; name: string }[]; rows: Row[] }) {
  const router = useRouter();
  const { toast } = useApp();
  const [q, setQ] = useState("");
  const [onlyLow, setOnlyLow] = useState(false);
  const [vals, setVals] = useState<Record<string, number>>(() => Object.fromEntries(rows.map((r) => [r.id, r.stock])));
  const list = useMemo(() => rows.filter((r) => r.name.toLowerCase().includes(q.toLowerCase()) && (!onlyLow || (vals[r.id] ?? 0) <= 5)), [rows, q, onlyLow, vals]);

  async function save(id: string, stock: number) {
    const r = await fetch("/api/admin/stock", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ storeId, variantId: id, stock }) });
    toast(r.ok ? "Stock updated" : "Couldn't update stock");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-3 p-3">
      <div className="flex flex-wrap items-center gap-2 rounded-md bg-bg p-3">
        <label className="text-xs font-bold text-muted">Store
          <select value={storeId} onChange={(e) => router.push(`/admin/stock?store=${e.target.value}`)} className="ml-2 h-9 rounded-sm border border-input px-2 text-sm font-semibold text-text">
            {stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </label>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find an item" aria-label="Find an item" className="h-9 flex-1 rounded-sm border border-input px-3 text-sm" />
        <label className="flex items-center gap-1.5 text-xs font-bold"><input type="checkbox" checked={onlyLow} onChange={(e) => setOnlyLow(e.target.checked)} /> Low stock only</label>
      </div>
      <ul className="divide-y divide-border overflow-hidden rounded-md bg-bg">
        {list.map((r) => (
          <li key={r.id} className="flex items-center gap-3 px-3 py-2">
            <span aria-hidden className="text-xl">{r.icon}</span>
            <span className="min-w-0 flex-1 text-sm"><b className="block truncate">{r.name}</b><span className="text-xs text-muted">{r.unit}</span></span>
            <input type="number" min={0} max={9999} value={vals[r.id]} aria-label={`Stock for ${r.name} ${r.unit}`}
              onChange={(e) => setVals((v) => ({ ...v, [r.id]: Number(e.target.value) }))}
              onBlur={(e) => Number(e.target.value) !== r.stock && save(r.id, Number(e.target.value))}
              className={`h-9 w-20 rounded-sm border px-2 text-right text-sm font-bold ${vals[r.id] <= 0 ? "border-danger text-danger" : vals[r.id] <= 5 ? "border-warning text-warning" : "border-input"}`} />
          </li>
        ))}
      </ul>
    </div>
  );
}
