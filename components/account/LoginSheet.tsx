"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { BottomSheet } from "../ui/BottomSheet";
import { Button } from "../ui/Button";
import { BRAND } from "@/lib/brand";
import type { User } from "@/lib/types";

export function LoginSheet({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: (u: User) => void }) {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [devOtp, setDevOtp] = useState<string | undefined>();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [wait, setWait] = useState(0);

  useEffect(() => { if (!open) { setStep("phone"); setCode(""); setError(""); setDevOtp(undefined); } }, [open]);
  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  async function send() {
    setBusy(true); setError("");
    try {
      const r = await fetch("/api/auth/otp", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ phone }) });
      const d = await r.json();
      if (!r.ok) return setError(d.error);
      setDevOtp(d.devOtp); setStep("otp"); setWait(30); setCode("");
    } catch { setError("Couldn't send the code. Check your connection."); } finally { setBusy(false); }
  }

  async function verify(c = code) {
    if (c.length !== 4) return;
    setBusy(true); setError("");
    try {
      const r = await fetch("/api/auth/verify", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ phone, code: c }) });
      const d = await r.json();
      if (!r.ok) { setError(d.error); setCode(""); return; }
      router.refresh();
      onDone(d.user);
    } catch { setError("Something went wrong. Try again."); } finally { setBusy(false); }
  }

  const validPhone = /^[6-9]\d{9}$/.test(phone);

  return (
    <BottomSheet open={open} onClose={onClose} labelledBy="login-title">
      <div className="bg-bg">
        <div className="relative grid h-36 place-items-center overflow-hidden bg-brand" aria-hidden>
          <div className="absolute inset-0 grid grid-cols-6 gap-3 p-3 text-3xl opacity-40 select-none">
            {Array.from("🥛🍞🥚🍌🧀🍫🥔🧅🍅🥤🍪🧴🍦🥜🧃🍎🥕🧈").map((e, i) => <span key={i}>{e}</span>)}
          </div>
          <div className="relative rounded-lg bg-bg px-4 py-2 text-2xl font-extrabold tracking-tight shadow-card">{BRAND.name}</div>
        </div>
        <div className="space-y-4 p-5">
          {step === "phone" ? (
            <form onSubmit={(e) => { e.preventDefault(); if (validPhone) send(); }} className="space-y-4">
              <div className="text-center">
                <h2 id="login-title" className="text-xl font-extrabold">Log in or sign up</h2>
                <p className="mt-1 text-sm text-muted">One code, no passwords. Takes ten seconds.</p>
              </div>
              <label className="flex h-13 items-center gap-2 rounded-md border border-input px-3 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20">
                <span className="text-sm font-bold">+91</span>
                <input
                  autoFocus inputMode="numeric" autoComplete="tel-national" aria-label="Mobile number"
                  value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="10-digit mobile number" className="h-full flex-1 bg-transparent text-base font-semibold tracking-wide outline-none placeholder:font-medium placeholder:text-faint"
                />
              </label>
              {error && <p role="alert" className="text-sm font-semibold text-danger">{error}</p>}
              <Button type="submit" size="lg" block disabled={!validPhone} loading={busy}>Get code</Button>
              <p className="text-center text-xs text-muted">By continuing you agree to our Terms and Privacy Policy.</p>
            </form>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); verify(); }} className="space-y-4">
              <button type="button" onClick={() => setStep("phone")} className="flex items-center gap-1 text-sm font-bold text-accent"><ArrowLeft size={16} /> Change number</button>
              <div>
                <h2 id="login-title" className="text-xl font-extrabold">Enter the 4-digit code</h2>
                <p className="mt-1 text-sm text-muted">Sent by SMS to +91 {phone}</p>
              </div>
              {devOtp && (
                <p className="flex items-center gap-2 rounded-md bg-info-soft px-3 py-2 text-sm font-semibold text-info">
                  <ShieldCheck size={16} /> Demo mode, no SMS is sent. Your code is <span className="font-extrabold tracking-widest">{devOtp}</span>
                </p>
              )}
              <input
                autoFocus inputMode="numeric" autoComplete="one-time-code" aria-label="One-time code" maxLength={4}
                value={code}
                onChange={(e) => { const v = e.target.value.replace(/\D/g, "").slice(0, 4); setCode(v); if (v.length === 4) verify(v); }}
                className="h-14 w-full rounded-md border border-input text-center text-2xl font-extrabold tracking-[0.6em] outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
              {error && <p role="alert" className="text-sm font-semibold text-danger">{error}</p>}
              <Button type="submit" size="lg" block disabled={code.length !== 4} loading={busy}>Verify and continue</Button>
              <p className="text-center text-sm text-muted">
                {wait > 0 ? <>Resend code in 0:{String(wait).padStart(2, "0")}</> : <button type="button" onClick={send} className="font-bold text-accent">Resend code</button>}
              </p>
            </form>
          )}
        </div>
      </div>
    </BottomSheet>
  );
}
