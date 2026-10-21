"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, Home, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { BottomSheet } from "../ui/BottomSheet";
import { AddressForm } from "./AddressForm";
import { useApp } from "../AppProvider";
import type { Address } from "@/lib/types";

type Addr = Address & { serviceable: boolean };
const ICON = { home: Home, work: Briefcase, other: MapPin };

export function AddressBook({ initial }: { initial: Addr[] }) {
  const router = useRouter();
  const { user, loc, toast } = useApp();
  const [editing, setEditing] = useState<Addr | "new" | null>(null);

  async function remove(a: Addr) {
    if (!confirm(`Delete this ${a.label} address?`)) return;
    const r = await fetch(`/api/addresses/${a.id}`, { method: "DELETE" });
    if (r.ok) { toast("Address deleted"); router.refresh(); }
  }

  return (
    <div className="mx-auto max-w-xl space-y-3 p-3">
      <button onClick={() => setEditing("new")} className="flex w-full items-center gap-2 rounded-md bg-bg p-4 text-sm font-bold text-accent hover:bg-accent-soft"><Plus size={18} /> Add a new address</button>
      {initial.length === 0 && <p className="py-8 text-center text-sm text-muted">No saved addresses yet.</p>}
      <ul className="space-y-3">
        {initial.map((a) => {
          const I = ICON[a.label];
          return (
            <li key={a.id} className="flex gap-3 rounded-md bg-bg p-4">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-surface"><I size={16} aria-hidden /></span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-extrabold capitalize">{a.label} {a.isDefault && <span className="ml-1 rounded-xs bg-surface px-1 text-2xs font-bold uppercase text-muted">Default</span>}</p>
                <p className="text-xs text-muted">{[a.houseNo, a.floor && `Floor ${a.floor}`, a.building, a.landmark, a.area].filter(Boolean).join(", ")}</p>
                <p className="text-xs text-muted">{a.receiverName} · {a.receiverPhone}</p>
                {!a.serviceable && <p className="mt-1 text-xs font-bold text-warning">Outside our delivery area</p>}
              </div>
              <div className="flex shrink-0 flex-col gap-1">
                <button onClick={() => setEditing(a)} aria-label={`Edit ${a.label} address`} className="grid size-8 place-items-center rounded-full hover:bg-surface"><Pencil size={15} /></button>
                <button onClick={() => remove(a)} aria-label={`Delete ${a.label} address`} className="grid size-8 place-items-center rounded-full text-danger hover:bg-danger/5"><Trash2 size={15} /></button>
              </div>
            </li>
          );
        })}
      </ul>
      <BottomSheet open={!!editing} onClose={() => setEditing(null)} title={editing === "new" ? "Add address" : "Edit address"} full>
        {editing && (
          <AddressForm
            editingId={editing === "new" ? undefined : editing.id}
            initial={editing === "new"
              ? { lat: loc?.lat ?? 28.6328, lng: loc?.lng ?? 77.2197, area: loc ? `${loc.label}, ${loc.sub}` : "", city: "" }
              : editing}
            defaultName={user?.name} defaultPhone={user?.phone}
            onSaved={() => { setEditing(null); toast("Address saved"); router.refresh(); }}
          />
        )}
      </BottomSheet>
    </div>
  );
}
