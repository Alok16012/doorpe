"use client";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { saveProduct } from "@/app/admin/actions";
import type { CatProduct } from "@/lib/catalog/model";
import { ProductArt } from "../shop/ProductArt";
import { Card, field, label } from "./ui";
import { Switch } from "./ActiveToggle";

type V = { id?: string; unit: string; mrp: string; price: string; baseStock: string };
const toRs = (p: number) => String(p / 100);
const toPaise = (s: string) => Math.round(parseFloat(s || "0") * 100);

export function ProductForm({ product, icons, categories, subs }: {
  product?: CatProduct; icons: string[]; categories: { slug: string; name: string }[]; subs: { slug: string; name: string; category: string }[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [name, setName] = useState(product?.name ?? "");
  const [brand, setBrand] = useState(product?.brand ?? "");
  const [icon, setIcon] = useState(product?.icon ?? "🛒");
  const [category, setCategory] = useState(product?.category ?? categories[0]?.slug ?? "");
  const [sub, setSub] = useState(product?.sub ?? "");
  const [tags, setTags] = useState(product?.tags ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [active, setActive] = useState(product?.active ?? true);
  const [info, setInfo] = useState<[string, string][]>(Object.entries(product?.info ?? { "Shelf life": "", "Storage": "" }).filter(([k]) => k !== "Country of origin" || true));
  const [variants, setVariants] = useState<V[]>(product?.variants.map((v) => ({ id: v.id, unit: v.unit, mrp: toRs(v.mrp), price: toRs(v.price), baseStock: String(v.baseStock) })) ?? [{ unit: "", mrp: "", price: "", baseStock: "40" }]);
  const [iconQ, setIconQ] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const subOptions = useMemo(() => subs.filter((s) => s.category === category), [subs, category]);
  const subValue = subOptions.some((s) => s.slug === sub) ? sub : subOptions[0]?.slug ?? "";
  const isUrl = /^(https?:\/\/|\/)/.test(icon);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSaved(false);
    start(async () => {
      const r = await saveProduct({
        name, brand, icon, category, sub: subValue, tags, description, active,
        info: Object.fromEntries(info.filter(([k, v]) => k.trim() && v.trim())),
        variants: variants.map((v) => ({ id: v.id, unit: v.unit, mrp: toPaise(v.mrp), price: toPaise(v.price), baseStock: parseInt(v.baseStock || "0", 10) })),
      }, product?.id);
      if (!r.ok) return setError(r.error);
      setSaved(true);
      if (!product && r.id) router.push(`/admin/products/${r.id}`);
      else router.refresh();
    });
  }

  const setV = (i: number, k: keyof V, val: string) => setVariants((vs) => vs.map((v, j) => (j === i ? { ...v, [k]: val } : v)));

  return (
    <form onSubmit={submit} className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-4">
        <Card title="Details">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="sm:col-span-2"><span className={label}>Name *</span><input required className={field} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Toned Milk" /></label>
            <label><span className={label}>Brand</span><input className={field} value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. Desi Dairy" /></label>
            <label><span className={label}>Search tags</span><input className={field} value={tags} onChange={(e) => setTags(e.target.value)} placeholder="milk doodh toned" /></label>
            <label><span className={label}>Category *</span>
              <select className={field} value={category} onChange={(e) => setCategory(e.target.value)}>{categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select>
            </label>
            <label><span className={label}>Sub-category *</span>
              <select className={field} value={subValue} onChange={(e) => setSub(e.target.value)}>{subOptions.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}</select>
            </label>
            <label className="sm:col-span-2"><span className={label}>Description</span><textarea rows={3} className={`${field} h-auto py-2`} value={description} onChange={(e) => setDescription(e.target.value)} /></label>
          </div>
        </Card>

        <Card title="Sizes, prices & stock" action={<button type="button" onClick={() => setVariants((v) => [...v, { unit: "", mrp: "", price: "", baseStock: "40" }])} className="flex items-center gap-1 text-sm font-semibold text-accent"><Plus size={15} /> Add size</button>}>
          <div className="space-y-3">
            {variants.map((v, i) => {
              const off = v.mrp && v.price && parseFloat(v.mrp) > parseFloat(v.price) ? Math.round((1 - parseFloat(v.price) / parseFloat(v.mrp)) * 100) : 0;
              return (
                <div key={i} className="grid grid-cols-2 items-end gap-2 rounded-lg border border-border p-3 sm:grid-cols-[1.2fr_1fr_1fr_1fr_auto]">
                  <label><span className={label}>Unit *</span><input required className={field} value={v.unit} onChange={(e) => setV(i, "unit", e.target.value)} placeholder="500 g" /></label>
                  <label><span className={label}>MRP (₹) *</span><input required inputMode="decimal" className={field} value={v.mrp} onChange={(e) => setV(i, "mrp", e.target.value.replace(/[^\d.]/g, ""))} /></label>
                  <label><span className={label}>Selling price (₹) *{off > 0 && <span className="ml-1 text-deal">{off}% off</span>}</span><input required inputMode="decimal" className={field} value={v.price} onChange={(e) => setV(i, "price", e.target.value.replace(/[^\d.]/g, ""))} /></label>
                  <label><span className={label}>Default stock</span><input inputMode="numeric" className={field} value={v.baseStock} onChange={(e) => setV(i, "baseStock", e.target.value.replace(/\D/g, ""))} /></label>
                  <button type="button" disabled={variants.length === 1} onClick={() => setVariants((vs) => vs.filter((_, j) => j !== i))} aria-label={`Remove size ${v.unit || i + 1}`} className="grid h-10 w-10 place-items-center rounded-md text-danger hover:bg-danger/5 disabled:opacity-30"><Trash2 size={16} /></button>
                </div>
              );
            })}
            <p className="text-xs text-muted">Default stock applies to every store until you set a store&apos;s own count in Inventory.</p>
          </div>
        </Card>

        <Card title="Product information" action={<button type="button" onClick={() => setInfo((x) => [...x, ["", ""]])} className="flex items-center gap-1 text-sm font-semibold text-accent"><Plus size={15} /> Add row</button>}>
          <div className="space-y-2">
            {info.map(([k, v], i) => (
              <div key={i} className="grid grid-cols-[1fr_1.5fr_auto] gap-2">
                <input aria-label="Label" className={field} value={k} placeholder="Label" onChange={(e) => setInfo((x) => x.map((r, j) => (j === i ? [e.target.value, r[1]] : r)))} />
                <input aria-label="Value" className={field} value={v} placeholder="Value" onChange={(e) => setInfo((x) => x.map((r, j) => (j === i ? [r[0], e.target.value] : r)))} />
                <button type="button" onClick={() => setInfo((x) => x.filter((_, j) => j !== i))} aria-label="Remove row" className="grid size-10 place-items-center rounded-md text-danger hover:bg-danger/5"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <Card title="Visibility">
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-semibold">{active ? "Live in the store" : "Hidden from customers"}</p><p className="text-xs text-muted">Hidden products stay in past orders.</p></div>
            <Switch on={active} onChange={setActive} label="Live in the store" />
          </div>
        </Card>
        <Card title="Image">
          <div className="mx-auto w-40 rounded-xl border border-border"><ProductArt icon={icon} size="lg" /></div>
          <label className="mt-3 block"><span className={label}>Image URL (optional)</span>
            <input className={field} value={isUrl ? icon : ""} onChange={(e) => setIcon(e.target.value || "🛒")} placeholder="https://… or /uploads/…" />
          </label>
          <p className="mt-3 text-xs font-semibold text-muted">Or pick one of ours</p>
          <input className={`${field} mt-1`} value={iconQ} onChange={(e) => setIconQ(e.target.value)} placeholder="Search photos (e.g. milk)" aria-label="Filter images" />
          <div className="mt-2 grid max-h-64 grid-cols-6 gap-1.5 overflow-y-auto">
            {icons.filter((x) => !iconQ || x.toLowerCase().includes(iconQ.toLowerCase().replace(/ /g, "-"))).map((x) => (
              <button type="button" key={x} onClick={() => setIcon(x)} aria-label={`Use ${x.split("/").pop()?.replace(/\.webp$/, "").replace(/-/g, " ")} photo`} aria-pressed={icon === x}
                className={`rounded-md border p-1 ${icon === x ? "border-accent bg-accent-soft" : "border-transparent hover:border-border"}`}>
                <ProductArt icon={x} size="sm" className="!p-0.5" />
              </button>
            ))}
          </div>
        </Card>
        <div className="sticky bottom-3 rounded-xl border border-border bg-bg p-3 shadow-pop">
          {error && <p role="alert" className="mb-2 text-sm font-semibold text-danger">{error}</p>}
          {saved && !error && <p role="status" className="mb-2 text-sm font-semibold text-success">Saved. The store shows the change right away.</p>}
          <button disabled={pending} className="h-11 w-full rounded-md bg-accent text-sm font-semibold text-on-accent disabled:opacity-60">{pending ? "Saving…" : product ? "Save changes" : "Add product"}</button>
        </div>
      </div>
    </form>
  );
}
