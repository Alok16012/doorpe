import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { catalogData } from "@/lib/catalog";
import { availableIcons } from "@/lib/emojiAssets";
import { PageHead } from "@/components/admin/AdminShell";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata = { title: "Edit product" };

export default async function EditProductPage(props: PageProps<"/admin/products/[id]">) {
  const id = (await props.params).id;
  const d = catalogData();
  const p = d.products.find((x) => x.id === id);
  if (!p) notFound();
  return (
    <>
      <Link href="/admin/products" className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-text"><ArrowLeft size={16} /> Products</Link>
      <PageHead title={p.name} sub={`Added ${p.createdAt.startsWith("1970") ? "with the demo catalogue" : new Date(p.createdAt).toLocaleDateString("en-IN")}`}
        actions={p.active ? <Link href={`/p/${p.slug}`} target="_blank" className="inline-flex h-10 items-center gap-1.5 rounded-md border border-border bg-bg px-4 text-sm font-semibold"><ExternalLink size={15} /> View in store</Link> : undefined} />
      <ProductForm product={p} icons={availableIcons()} categories={d.categories.map((c) => ({ slug: c.slug, name: c.name }))} subs={d.subs.map((s) => ({ slug: s.slug, name: s.name, category: s.category }))} />
    </>
  );
}
