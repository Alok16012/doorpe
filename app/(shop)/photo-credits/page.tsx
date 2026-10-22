import type { Metadata } from "next";
import credits from "@/public/img/items/credits.json";

export const metadata: Metadata = { title: "Photo credits" };

function plainText(value: string) {
  return value.replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").replace(/&#0?39;/g, "'").replace(/&quot;/g, '"').replace(/&nbsp;/g, " ");
}

export default function PhotoCredits() {
  return (
    <section className="px-4 py-8 md:px-0">
      <h1 className="text-2xl font-extrabold">Photo credits</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">Item photographs are provided by Wikimedia Commons contributors. Images have been resized and converted to WebP, and may be cropped to fit the display. Photos illustrate the item type; packaging and appearance may vary.</p>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(credits).map(([topic, photo]) => (
          <li key={topic} className="flex gap-3 rounded-xl border border-border p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/img/items/${photo.file}`} alt="" width={64} height={64} loading="lazy" className="size-16 shrink-0 rounded-lg object-contain" />
            <div className="min-w-0 text-xs text-muted">
              <a href={photo.source} className="font-bold text-text underline">{topic}</a>
              <p className="mt-1 break-words">{plainText(photo.author)}</p>
              {photo.licenseUrl ? <a href={photo.licenseUrl} className="mt-1 inline-block underline">{photo.license}</a> : <p className="mt-1">{photo.license}</p>}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
