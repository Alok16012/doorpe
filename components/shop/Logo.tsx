import { BRAND } from "@/lib/brand";

/** Our logo on a white tile so it reads on any background: door mark + wordmark side by side, or the stacked lockup at "lg". */
export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  if (size === "lg")
    return (
      <span className="inline-flex rounded-xl bg-white p-3 shadow-card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt={BRAND.name} width={1019} height={728} className="h-16 w-auto" />
      </span>
    );
  const S = { sm: { box: "h-9 gap-1.5 px-2 rounded-md", mark: "h-6", word: "h-4" }, md: { box: "h-11 gap-2 px-2.5 rounded-lg", mark: "h-8", word: "h-[22px]" } }[size];
  return (
    <span className={`inline-flex items-center bg-white ${S.box}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-mark.png" alt="" width={492} height={468} className={`${S.mark} w-auto`} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-wordmark.png" alt={BRAND.name} width={1019} height={210} className={`${S.word} w-auto`} />
    </span>
  );
}
