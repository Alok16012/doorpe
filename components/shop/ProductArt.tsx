/** Our product art: a tinted tile with the product's emoji. No photography from anywhere else. */
export function ProductArt({ icon, tint, size = "md", dim = false, label }: { icon: string; tint: string; size?: "sm" | "md" | "lg" | "xl"; dim?: boolean; label?: string }) {
  const S = { sm: "text-2xl", md: "text-5xl", lg: "text-6xl", xl: "text-[120px]" }[size];
  return (
    <div
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={`grid aspect-square w-full place-items-center rounded-sm ${dim ? "grayscale opacity-60" : ""}`}
      style={{ background: `linear-gradient(160deg, ${tint} 0%, color-mix(in srgb, ${tint} 55%, white) 100%)` }}
    >
      <span className={`${S} leading-none drop-shadow-[0_6px_8px_rgba(0,0,0,0.12)] select-none`}>{icon}</span>
    </div>
  );
}
