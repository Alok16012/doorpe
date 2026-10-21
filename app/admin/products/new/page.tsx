import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { catalogData } from "@/lib/catalog";
import { availableIcons } from "@/lib/emojiAssets";
import { PageHead } from "@/components/admin/AdminShell";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata = { title: "Add product" };

export default function NewProductPage() {
  const d = catalogData();
  return (
    <>
      <Link href="/admin/products" className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-text"><ArrowLeft size={16} /> Products</Link>
      <PageHead title="Add product" />
      <ProductForm icons={availableIcons()} categories={d.categories.map((c) => ({ slug: c.slug, name: c.name }))} subs={d.subs.map((s) => ({ slug: s.slug, name: s.name, category: s.category }))} />
    </>
  );
}
