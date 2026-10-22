import Link from "next/link";
import { emojiSrc } from "@/lib/emoji";

/** Category tile: name on top, product art sitting in the bottom-right corner. */
export function CategoryCard({ href, name, icon, onHero = false }: { href: string; name: string; icon: string; onHero?: boolean }) {
  return (
    <Link href={href} className={`group relative block h-[104px] overflow-hidden rounded-2xl p-2 transition-transform active:scale-95 md:h-[132px] md:p-3 ${onHero ? "shadow-[0_2px_10px_rgba(10,20,80,0.12)]" : ""}`}
      style={{ background: "linear-gradient(160deg, var(--color-category-tile) 0%, var(--color-category-tile-end) 100%)" }}>
      <span className="relative z-10 line-clamp-2 text-[12px] font-bold leading-[14px] text-text md:text-sm md:leading-4">{name}</span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={emojiSrc(icon)} alt="" loading="lazy" className="absolute bottom-1 right-1 size-[62px] rounded-xl bg-white object-cover shadow-sm transition-transform group-hover:scale-105 md:bottom-2 md:right-2 md:size-[80px]" />
    </Link>
  );
}
