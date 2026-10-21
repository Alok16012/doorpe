"use client";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";

export function BottomSheet({
  open, onClose, title, children, wide = false, labelledBy, full = false,
}: { open: boolean; onClose: () => void; title?: string; children: React.ReactNode; wide?: boolean; labelledBy?: string; full?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const opener = useRef<Element | null>(null);

  useEffect(() => {
    if (!open) return;
    opener.current = document.activeElement;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => {
      const root = ref.current;
      const el = root?.querySelector<HTMLElement>("[autofocus]") || root?.querySelector<HTMLElement>("input, textarea, select") || root?.querySelector<HTMLElement>("button, [href]");
      el?.focus();
    }, 30);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && ref.current) {
        const f = [...ref.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), input:not([disabled]), textarea, select, [tabindex]:not([tabindex='-1'])")];
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
      (opener.current as HTMLElement | null)?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
      <button aria-label="Close" tabIndex={-1} className="absolute inset-0 bg-scrim/50 animate-fade-in" onClick={onClose} />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={labelledBy ? undefined : title}
        aria-labelledby={labelledBy}
        className={`relative flex w-full flex-col overflow-hidden bg-surface shadow-pop animate-sheet-up md:animate-fade-in
          rounded-t-xl md:rounded-xl ${full ? "h-[100dvh] md:h-[640px] rounded-none md:rounded-xl" : "max-h-[88dvh]"} ${wide ? "md:max-w-2xl" : "md:max-w-md"}`}
      >
        {title && (
          <div className="flex items-center justify-between bg-bg px-4 py-3">
            <h2 className="text-lg font-extrabold">{title}</h2>
            <button onClick={onClose} aria-label="Close" className="grid size-8 place-items-center rounded-full bg-surface text-text hover:bg-border">
              <X size={18} />
            </button>
          </div>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
