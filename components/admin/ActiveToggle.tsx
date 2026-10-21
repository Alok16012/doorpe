"use client";
import { useOptimistic, useTransition } from "react";
import { setProductActive } from "@/app/admin/actions";

export function Switch({ on, onChange, label, disabled }: { on: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <button role="switch" aria-checked={on} aria-label={label} disabled={disabled} onClick={() => onChange(!on)}
      className={`relative h-6 w-11 shrink-0 rounded-pill transition-colors disabled:opacity-50 ${on ? "bg-accent" : "bg-switch-off"}`}>
      <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-[left] ${on ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}

export function ActiveToggle({ id, active }: { id: string; active: boolean }) {
  const [pending, start] = useTransition();
  const [on, setOn] = useOptimistic(active);
  return <Switch on={on} disabled={pending} label={on ? "Hide from store" : "Show in store"} onChange={(v) => start(async () => { setOn(v); await setProductActive(id, v); })} />;
}
