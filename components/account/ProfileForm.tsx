"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/Button";
import { useApp } from "../AppProvider";

export function ProfileForm({ name: n0, email: e0, phone }: { name: string; email: string; phone: string }) {
  const [name, setName] = useState(n0);
  const [email, setEmail] = useState(e0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const { toast, setUser } = useApp();
  const router = useRouter();
  const field = "h-11 w-full rounded-md border border-input bg-bg px-3 text-sm font-medium outline-none focus:border-accent focus:ring-2 focus:ring-accent/20";
  async function save(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError("");
    const r = await fetch("/api/me", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ name, email }) });
    const d = await r.json();
    setBusy(false);
    if (!r.ok) return setError(d.error);
    setUser(d.user); toast("Profile updated"); router.refresh();
  }
  return (
    <form onSubmit={save} className="mx-auto max-w-xl space-y-4 p-3">
      <div className="space-y-4 rounded-md bg-bg p-4">
        <label className="block"><span className="mb-1 block text-xs font-bold text-muted">Name</span><input className={field} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /></label>
        <label className="block"><span className="mb-1 block text-xs font-bold text-muted">Email (for invoices)</span><input type="email" className={field} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></label>
        <div><span className="mb-1 block text-xs font-bold text-muted">Mobile number</span><p className="text-sm font-semibold">+91 {phone}</p></div>
        {error && <p role="alert" className="text-sm font-semibold text-danger">{error}</p>}
      </div>
      <Button type="submit" size="lg" block loading={busy}>Save changes</Button>
    </form>
  );
}
