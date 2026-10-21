import type { Metadata } from "next";
import { currentLocation } from "@/lib/location";
import { SearchScreen } from "@/components/shop/SearchScreen";
import { catalog } from "@/lib/catalog";

export const metadata: Metadata = { title: "Search" };

export default async function SearchPage(props: PageProps<"/s">) {
  const sp = await props.searchParams;
  const { svc } = await currentLocation();
  const cats = catalog.allCategories().slice(0, 8).map((c) => ({ slug: c.slug, name: c.name, icon: c.icon, tint: c.tint }));
  return <SearchScreen initialQ={typeof sp.q === "string" ? sp.q : ""} eta={svc?.ok ? svc.etaMin : null} cats={cats} />;
}
