import { BRAND } from "@/lib/brand";

/** The door symbol supplies the D; the existing wordmark is cropped to "oorPe". */
export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizing = {
    sm: { box: "h-9 gap-[0.75px] px-2 rounded-md", mark: "h-6", word: "h-4" },
    md: { box: "h-11 gap-[1px] px-2.5 rounded-lg", mark: "h-8", word: "h-[22px]" },
    lg: { box: "gap-[1.5px] rounded-xl p-3 shadow-card", mark: "h-12", word: "h-8" },
  }[size];

  return (
    <span role="img" aria-label={BRAND.name} className={`inline-flex shrink-0 items-center bg-white ${sizing.box}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-mark.png" alt="" width={492} height={468} className={`${sizing.mark} w-auto`} />
      <svg aria-hidden="true" viewBox="214 0 805 210" width={805} height={210} className={`${sizing.word} w-auto overflow-hidden`}>
        <image href="/logo-wordmark.png" width={1019} height={210} />
      </svg>
    </span>
  );
}
