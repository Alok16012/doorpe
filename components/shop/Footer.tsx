import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { catalog } from "@/lib/catalog";

export function Footer() {
  const cats = catalog.allCategories();
  return (
    <footer className="border-t border-border bg-surface pb-24 md:pb-0">
      <div className="mx-auto max-w-[1280px] px-4 py-8 md:px-6">
        <p className="text-2xl font-extrabold tracking-tight">{BRAND.name}</p>
        <p className="mt-1 max-w-md text-sm text-muted">{BRAND.shortPitch}. Order from the store closest to you and track your rider live.</p>
        <nav aria-label="Categories" className="mt-6">
          <h2 className="mb-2 text-sm font-extrabold">Categories</h2>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm text-muted sm:grid-cols-3 md:grid-cols-5">
            {cats.map((c) => <li key={c.slug}><Link className="hover:text-text hover:underline" href={`/cn/${c.slug}`}>{c.name}</Link></li>)}
          </ul>
        </nav>
        <div className="mt-6 flex flex-wrap gap-x-5 gap-y-1 text-sm font-semibold text-muted">
          <Link href="/help" className="hover:text-text">Help & FAQs</Link>
          <Link href="/account" className="hover:text-text">Your account</Link>
          <Link href="/admin" className="hover:text-text">Store dashboard</Link>
        </div>
        <p className="mt-6 text-xs text-faint">© {new Date().getFullYear()} {BRAND.name}. Demo storefront. Product names and brands are fictional.</p>
      </div>
    </footer>
  );
}
