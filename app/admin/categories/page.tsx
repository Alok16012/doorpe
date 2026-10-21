import { catalogData } from "@/lib/catalog";
import { availableIcons } from "@/lib/emojiAssets";
import { PageHead } from "@/components/admin/AdminShell";
import { CategoryManager } from "@/components/admin/CategoryManager";

export const metadata = { title: "Categories" };

export default function CategoriesPage() {
  const d = catalogData();
  const counts: Record<string, number> = {};
  for (const p of d.products) counts[p.sub] = (counts[p.sub] || 0) + 1;
  return (
    <>
      <PageHead title="Categories" sub="Sections on the home page, their category tiles, and the sub-categories in each category's side rail." />
      <CategoryManager data={{ groups: d.groups, categories: d.categories, subs: d.subs }} counts={counts} icons={availableIcons()} />
    </>
  );
}
