"use client";
import { useRef, useState } from "react";
import { ChevronsRight, Loader2 } from "lucide-react";

/** Drag the knob to the end to confirm. Keyboard: focus and press Enter. Guards against accidental taps on the road. */
export function SlideToConfirm({ label, onConfirm, disabled, tone = "accent" }: { label: string; onConfirm: () => Promise<void> | void; disabled?: boolean; tone?: "accent" | "dark" }) {
  const track = useRef<HTMLDivElement>(null);
  const [x, setX] = useState(0);
  const [busy, setBusy] = useState(false);
  const start = useRef<number | null>(null);
  const KNOB = 52;
  const max = () => (track.current?.clientWidth ?? 300) - KNOB - 8;
  async function fire() {
    if (busy || disabled) return;
    setBusy(true); setX(max());
    try { await onConfirm(); } finally { setBusy(false); setX(0); }
  }
  return (
    <div ref={track} role="button" tabIndex={disabled ? -1 : 0} aria-disabled={disabled} aria-label={`${label}. Slide or press Enter to confirm`}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fire(); } }}
      className={`relative h-[60px] select-none overflow-hidden rounded-xl ${disabled ? "bg-switch-off" : tone === "dark" ? "bg-text" : "bg-accent"} text-on-accent`}>
      <span className="pointer-events-none absolute inset-0 grid place-items-center pl-12 text-base font-bold" style={{ opacity: 1 - x / (max() || 1) }}>{label}</span>
      <span
        onPointerDown={(e) => { if (disabled || busy) return; start.current = e.clientX - x; (e.target as HTMLElement).setPointerCapture(e.pointerId); }}
        onPointerMove={(e) => { if (start.current === null) return; setX(Math.max(0, Math.min(max(), e.clientX - start.current))); }}
        onPointerUp={() => { if (start.current === null) return; start.current = null; if (x > max() * 0.85) fire(); else setX(0); }}
        className="absolute left-1 top-1 grid touch-none place-items-center rounded-lg bg-white text-accent shadow"
        style={{ width: KNOB, height: KNOB, transform: `translateX(${x}px)`, transition: start.current === null ? "transform 200ms" : "none" }}>
        {busy ? <Loader2 className="animate-spin" size={22} /> : <ChevronsRight size={26} strokeWidth={2.5} />}
      </span>
    </div>
  );
}
