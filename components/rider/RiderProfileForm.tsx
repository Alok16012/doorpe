"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useApp } from "../AppProvider";

export function RiderProfileForm({ name: n0, vehicle: v0 }: { name: string; vehicle: string }) {
  const [name, setName] = useState(n0);
  const [vehicle, setVehicle] = useState(v0);
  const [busy, setBusy] = useState(false);
  const { toast, setUser } = useApp();
  const router = useRouter();
  const f = "h-11 w-full rounded-lg border border-input bg-bg px-3 text-sm outline-none focus:border-accent";
  async function save(e: React.FormEvent) {
    e.preventDefault(); setBusy(true);
    const r = await fetch("/api/rider/profile", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ name, vehicle }) });
    setBusy(false);
    toast(r.ok ? "Saved" : "Couldn't save"); router.refresh();
  }
  async function logout() {
    const r = await fetch("/api/rider/online", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ online: false }) });
    if (!r.ok) { toast((await r.json()).error); return; }
    await fetch("/api/auth/logout", { method: "POST" }); setUser(null); router.refresh();
  }
  return (
    <>
      <form onSubmit={save} className="space-y-3 rounded-xl bg-bg p-4">
        <label className="block"><span className="mb-1 block text-xs font-semibold text-muted">Name customers see</span><input className={f} value={name} onChange={(e) => setName(e.target.value)} /></label>
        <label className="block"><span className="mb-1 block text-xs font-semibold text-muted">Vehicle number</span><input className={`${f} uppercase`} value={vehicle} onChange={(e) => setVehicle(e.target.value)} /></label>
        <button disabled={busy} className="h-11 w-full rounded-lg bg-accent text-sm font-semibold text-on-accent disabled:opacity-60">{busy ? "Saving…" : "Save"}</button>
      </form>
      <button onClick={logout} className="flex w-full items-center justify-center gap-2 rounded-xl bg-bg py-3.5 text-sm font-bold text-danger"><LogOut size={16} /> Go off duty & log out</button>
    </>
  );
}
