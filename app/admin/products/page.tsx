import Link from "next/link";
import { Plus } from "lucide-react";
import { catalogData } from "@/lib/catalog";
import { inr } from "@/lib/money";
import { PageHead } from "@/components/admin/AdminShell";
import { Card, Tabs, field, td, th } from "@/components/admin/ui";
import { ProductArt } from "@/components/shop/ProductArt";
import { ActiveToggle } from "@/components/admin/ActiveToggle";

export const metadata = { title: "Products" };

export default async function ProductsPage(props: PageProps<"/admin/products">) {
  const sp = await props.searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim().toLowerCase() : "";
  const cat = typeof sp.cat === "string" ? sp.cat : "";
  const status = typeof sp.status === "string" ? sp.status : "all";
  const data = catalogData();
  const catName = (s: string) => data.categories.find((c) => c.slug === s)?.name ?? s;
  const subName = (s: string) => data.subs.find((c) => c.slug === s)?.name ?? s;
  const all = data.products;
  const rows = all
    .filter((p) => !q || p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.tags.includes(q))
    .filter((p) => !cat || p.category === cat)
    .filter((p) => status === "all" || (status === "active" ? p.active : !p.active));
  const qs = (o: Record<string, string>) => "?" + new URLSearchParams(Object.entries({ q, cat, status, ...o }).filter(([, v]) => v)).toString();
  return (
    <>
      <PageHead title="Products" sub={`${all.length} products · ${all.filter((p) => p.active).length} live`}
        actions={<Link href="/admin/products/new" className="inline-flex h-10 items-center gap-1.5 rounded-md bg-accent px-4 text-sm font-semibold text-on-accent"><Plus size={16} /> Add product</Link>} />
      <Tabs current={status} items={[["all", "All"], ["active", "Live"], ["hidden", "Hidden"]].map(([k, l]) => ({ key: k, label: l, href: `/admin/products${qs({ status: k })}` }))} />
      <form className="mb-4 flex flex-wrap gap-2" action="/admin/products">
        <input type="hidden" name="status" value={status} />
        <input name="q" defaultValue={q} placeholder="Search name, brand, tag" aria-label="Search products" className={`${field} max-w-xs`} />
        <select name="cat" defaultValue={cat} aria-label="Category" className={`${field} max-w-[240px]`}>
          <option value="">All categories</option>
          {data.categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
        <button className="h-10 rounded-md bg-accent px-4 text-sm font-semibold text-on-accent">Filter</button>
      </form>
      <Card pad={false}>
        {rows.length === 0 ? <p className="p-10 text-center text-sm text-muted">No products match.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="border-b border-border bg-surface/60"><tr><th className={th}>Product</th><th className={th}>Category</th><th className={th}>Sizes</th><th className={th}>Price</th><th className={th}>Live</th><th className={th} /></tr></thead>
              <tbody className="divide-y divide-border">
                {rows.map((p) => (
                  <tr key={p.id} className={p.active ? "" : "opacity-60"}>
                    <td className={td}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 shrink-0 rounded-md border border-border"><ProductArt label={p.name} icon={p.icon} size="sm" /></div>
                        <div><p className="font-semibold">{p.name}</p><p className="text-xs text-muted">{p.brand}</p></div>
                      </div>
                    </td>
                    <td className={`${td} text-muted`}>{catName(p.category)}<span className="block text-xs">{subName(p.sub)}</span></td>
                    <td className={`${td} text-muted`}>{p.variants.map((v) => v.unit).join(", ")}</td>
                    <td className={`${td} whitespace-nowrap tabular-nums`}><b>{inr(p.variants[0]?.price ?? 0)}</b>{p.variants[0] && p.variants[0].mrp > p.variants[0].price && <s className="ml-1 text-xs text-faint">{inr(p.variants[0].mrp)}</s>}</td>
                    <td className={td}><ActiveToggle id={p.id} active={p.active} /></td>
                    <td className={`${td} text-right`}><Link href={`/admin/products/${p.id}`} className="font-semibold text-accent hover:underline">Edit</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
