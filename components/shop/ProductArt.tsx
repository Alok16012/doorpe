import { emojiSrc } from "@/lib/emoji";

/** Product image. 3D renders (Fluent Emoji, MIT) on white, like a packshot. */
export function ProductArt({ icon, tint, size = "md", dim = false, label, bg = "white", className = "" }: {
  icon: string; tint?: string; size?: "sm" | "md" | "lg" | "xl"; dim?: boolean; label?: string; bg?: "white" | "tint"; className?: string;
}) {
  const pad = { sm: "p-1.5", md: "p-3", lg: "p-5", xl: "p-12" }[size];
  return (
    <div
      className={`grid aspect-square w-full place-items-center overflow-hidden ${pad} ${className}`}
      style={bg === "tint" && tint ? { background: tint } : undefined}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={emojiSrc(icon)} alt={label ?? ""} aria-hidden={label ? undefined : true}
        loading="lazy" decoding="async" draggable={false} width={256} height={256}
        className={`h-full w-full object-contain ${dim ? "opacity-40 grayscale" : ""}`}
      />
    </div>
  );
}

/** Blue discount flag with a zig-zag bottom edge. */
export function OffBadge({ pct, className = "" }: { pct: number; className?: string }) {
  return (
    <span
      className={`absolute z-10 flex h-[28px] w-[29px] flex-col items-center justify-start bg-deal pt-[5px] text-center text-[9px] font-extrabold leading-[9px] text-on-deal ${className}`}
      style={{ clipPath: "polygon(0 0,100% 0,100% 100%,87.5% 92%,75% 100%,62.5% 92%,50% 100%,37.5% 92%,25% 100%,12.5% 92%,0 100%)" }}
    >
      {pct}%<br />OFF
    </span>
  );
}
