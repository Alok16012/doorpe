import type { Metadata } from "next";
import { catalog } from "@/lib/catalog";
import { CategoryCard } from "@/components/shop/CategoryCard";

export const metadata: Metadata = { title: "All categories" };

export default function CategoriesPage() {
  return (
    <div className="px-3 pt-4 md:px-0 md:pt-6">
      <h1 className="mb-1 px-1 text-xl font-extrabold md:text-2xl">All categories</h1>
      <p className="mb-2 px-1 text-sm text-muted">Everything we deliver, in one place</p>
      {catalog.groups().map((g) => (
        <section key={g.slug} className="pt-4" aria-labelledby={`cg-${g.slug}`}>
          <h2 id={`cg-${g.slug}`} className="mb-3 px-1 text-[15px] font-bold text-text">{g.name}</h2>
          <ul className="grid grid-cols-4 gap-2 md:grid-cols-8 md:gap-4">
            {g.categories.map((c) => <li key={c.slug}><CategoryCard href={`/cn/${c.slug}`} name={c.name} icon={c.icon} /></li>)}
          </ul>
        </section>
      ))}
    </div>
  );
}
