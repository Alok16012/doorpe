"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, ChevronDown, Pencil, Plus } from "lucide-react";
import { moveCategory, saveCategory, saveSub } from "@/app/admin/actions";
import type { CatCategory, CatGroup, CatSub } from "@/lib/catalog/model";
import { ProductArt } from "../shop/ProductArt";
import { BottomSheet } from "../ui/BottomSheet";
import { Pill, field, label } from "./ui";
import { Switch } from "./ActiveToggle";

type Edit =
  | { kind: "cat"; slug?: string; name: string; icon: string; tint: string; group: string; active: boolean }
  | { kind: "sub"; slug?: string; name: string; icon: string; category: string; active: boolean };

export function CategoryManager({ data, counts, icons }: { data: { groups: CatGroup[]; categories: CatCategory[]; subs: CatSub[] }; counts: Record<string, number>; icons: string[] }) {
  const router = useRouter();
  const [open, setOpen] = useState<string | null>(null);
  const [edit, setEdit] = useState<Edit | null>(null);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  function save() {
    if (!edit) return;
    setError("");
    start(async () => {
      const r = edit.kind === "cat"
        ? await saveCategory({ name: edit.name, icon: edit.icon, tint: edit.tint, group: edit.group, active: edit.active }, edit.slug)
        : await saveSub({ name: edit.name, icon: edit.icon, category: edit.category, active: edit.active }, edit.slug);
      if (!r.ok) return setError(r.error);
      setEdit(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {[...data.groups].sort((a, b) => a.sort - b.sort).map((g) => {
        const cats = data.categories.filter((c) => c.group === g.slug).sort((a, b) => a.sort - b.sort);
        return (
          <section key={g.slug}>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-base font-bold">{g.name}</h2>
              <button onClick={() => setEdit({ kind: "cat", name: "", icon: "🛒", tint: "#e5f3f3", group: g.slug, active: true })} className="flex items-center gap-1 text-sm font-semibold text-accent"><Plus size={15} /> Add category</button>
            </div>
            <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-bg">
              {cats.map((c, i) => {
                const subs = data.subs.filter((s) => s.category === c.slug).sort((a, b) => a.sort - b.sort);
                const total = subs.reduce((n, s) => n + (counts[s.slug] || 0), 0);
                return (
                  <li key={c.slug}>
                    <div className="flex items-center gap-3 px-3 py-2.5">
                      <div className="w-11 shrink-0 overflow-hidden rounded-md" style={{ background: c.tint }}><ProductArt icon={c.icon} size="sm" /></div>
                      <button onClick={() => setOpen(open === c.slug ? null : c.slug)} className="flex flex-1 items-center gap-2 text-left" aria-expanded={open === c.slug}>
                        <span><span className="block text-sm font-semibold">{c.name}</span><span className="text-xs text-muted">{subs.length} sub-categories · {total} products</span></span>
                        <ChevronDown size={16} className={`text-muted transition-transform ${open === c.slug ? "rotate-180" : ""}`} />
                      </button>
                      {!c.active && <Pill on={false}>Hidden</Pill>}
                      <button disabled={pending || i === 0} onClick={() => start(async () => { await moveCategory(c.slug, -1); router.refresh(); })} aria-label={`Move ${c.name} up`} className="grid size-8 place-items-center rounded-md hover:bg-surface disabled:opacity-30"><ArrowUp size={15} /></button>
                      <button disabled={pending || i === cats.length - 1} onClick={() => start(async () => { await moveCategory(c.slug, 1); router.refresh(); })} aria-label={`Move ${c.name} down`} className="grid size-8 place-items-center rounded-md hover:bg-surface disabled:opacity-30"><ArrowDown size={15} /></button>
                      <button onClick={() => setEdit({ kind: "cat", slug: c.slug, name: c.name, icon: c.icon, tint: c.tint, group: c.group, active: c.active })} aria-label={`Edit ${c.name}`} className="grid size-8 place-items-center rounded-md hover:bg-surface"><Pencil size={15} /></button>
                    </div>
                    {open === c.slug && (
                      <div className="border-t border-border bg-surface/50 px-3 py-2">
                        <ul className="space-y-1">
                          {subs.map((s) => (
                            <li key={s.slug} className="flex items-center gap-3 rounded-md bg-bg px-2 py-1.5">
                              <div className="w-8 shrink-0"><ProductArt icon={s.icon} size="sm" className="!p-0.5" /></div>
                              <span className="flex-1 text-sm">{s.name} <span className="text-xs text-muted">· {counts[s.slug] || 0} products</span></span>
                              {!s.active && <Pill on={false}>Hidden</Pill>}
                              <button onClick={() => setEdit({ kind: "sub", slug: s.slug, name: s.name, icon: s.icon, category: s.category, active: s.active })} aria-label={`Edit ${s.name}`} className="grid size-8 place-items-center rounded-md hover:bg-surface"><Pencil size={14} /></button>
                            </li>
                          ))}
                        </ul>
                        <button onClick={() => setEdit({ kind: "sub", name: "", icon: c.icon, category: c.slug, active: true })} className="mt-2 flex items-center gap-1 px-2 text-sm font-semibold text-accent"><Plus size={15} /> Add sub-category</button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      <BottomSheet open={!!edit} onClose={() => setEdit(null)} title={edit ? `${edit.slug ? "Edit" : "New"} ${edit.kind === "cat" ? "category" : "sub-category"}` : ""}>
        {edit && (
          <div className="space-y-3 bg-bg p-4">
            <label className="block"><span className={label}>Name *</span><input autoFocus className={field} value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></label>
            {edit.kind === "cat" && (
              <>
                <label className="block"><span className={label}>Section</span>
                  <select className={field} value={edit.group} onChange={(e) => setEdit({ ...edit, group: e.target.value })}>{data.groups.map((g) => <option key={g.slug} value={g.slug}>{g.name}</option>)}</select>
                </label>
                <label className="block"><span className={label}>Tile colour</span><input type="color" className="h-10 w-20 rounded-md border border-input" value={edit.tint} onChange={(e) => setEdit({ ...edit, tint: e.target.value })} /></label>
              </>
            )}
            <div>
              <span className={label}>Image</span>
              <div className="grid max-h-48 grid-cols-8 gap-1 overflow-y-auto rounded-md border border-border p-1">
                {icons.map((x) => (
                  <button key={x} type="button" onClick={() => setEdit({ ...edit, icon: x })} aria-pressed={edit.icon === x} aria-label={`Use ${x}`} className={`rounded-md border p-0.5 ${edit.icon === x ? "border-accent bg-accent-soft" : "border-transparent"}`}>
                    <ProductArt icon={x} size="sm" className="!p-0" />
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between"><span className="text-sm font-semibold">Show in store</span><Switch on={edit.active} onChange={(v) => setEdit({ ...edit, active: v })} label="Show in store" /></div>
            {error && <p role="alert" className="text-sm font-semibold text-danger">{error}</p>}
            <button disabled={pending} onClick={save} className="h-11 w-full rounded-md bg-accent text-sm font-semibold text-on-accent disabled:opacity-60">{pending ? "Saving…" : "Save"}</button>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
