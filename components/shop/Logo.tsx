import { BRAND } from "@/lib/brand";

/** Our wordmark: lowercase name on a yellow tile. */
export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const S = { sm: "h-9 px-2.5 text-xl rounded-md", md: "h-11 px-3 text-[26px] rounded-lg", lg: "h-16 w-16 justify-center text-[17px] rounded-xl" }[size];
  return (
    <span className={`inline-flex items-center bg-brand font-black lowercase tracking-[-0.04em] text-text ${S}`}>
      {BRAND.name.toLowerCase()}
    </span>
  );
}
