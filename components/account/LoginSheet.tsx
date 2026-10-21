"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { BottomSheet } from "../ui/BottomSheet";
import { Logo } from "../shop/Logo";
import { emojiSrc } from "@/lib/emoji";
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

  const wall = ["🥛", "🍌", "🧴", "🥨", "🍞", "🍫", "🧀", "🍦", "🥫", "🥦", "☕", "🍳", "🥚", "🧃", "🍪", "🍅", "🧈", "🥜"];
  return (
    <BottomSheet open={open} onClose={onClose} labelledBy="login-title" full>
      <div className="flex min-h-full flex-col bg-bg">
        <div className="relative h-[300px] shrink-0 overflow-hidden md:h-[220px]" aria-hidden>
          <div className="absolute -left-10 top-3 grid w-[140%] grid-cols-6 gap-3">
            {wall.map((e, i) => (
              <span key={i} className={`grid aspect-square place-items-center rounded-2xl bg-surface-tint p-2 ${i % 12 >= 6 ? "translate-x-10" : ""}`}>
                <img src={emojiSrc(e)} alt="" className="size-full" />
              </span>
            ))}
          </div>
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-bg to-transparent" />
        </div>
        <button onClick={onClose} aria-label="Close" className="absolute left-4 top-4 z-10 grid size-10 place-items-center rounded-full bg-bg shadow-pop"><ArrowLeft size={20} /></button>
        <div className="relative -mt-8 flex flex-1 flex-col items-center px-6 pb-6">
          <Logo size="lg" />
          {step === "phone" ? (
            <form onSubmit={(e) => { e.preventDefault(); if (validPhone) send(); }} className="mt-4 flex w-full max-w-sm flex-1 flex-col items-center">
              <h2 id="login-title" className="text-center text-2xl font-extrabold text-text">Groceries in minutes</h2>
              <p className="mt-1 text-center text-base text-text">Log in or Sign up</p>
              <label className="mt-6 flex h-12 w-full items-center gap-2 rounded-xl border border-border px-4 focus-within:border-text">
                <span className="text-sm font-bold text-text">+91</span>
                <input
                  autoFocus inputMode="numeric" autoComplete="tel-national" aria-label="Mobile number"
                  value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="Enter mobile number" className="h-full flex-1 bg-transparent text-sm font-semibold outline-none placeholder:font-normal placeholder:text-faint"
                />
              </label>
              {error && <p role="alert" className="mt-2 w-full text-sm font-semibold text-danger">{error}</p>}
              <button type="submit" disabled={!validPhone || busy} className="mt-4 h-12 w-full rounded-xl bg-accent text-base font-semibold text-on-accent transition-colors disabled:bg-[#9c9c9c]">
                {busy ? "Sending…" : "Continue"}
              </button>
              <p className="mt-auto pt-8 text-center text-xs text-muted">By continuing, you agree to our <span className="underline">Terms of service</span> &amp; <span className="underline">Privacy policy</span></p>
            </form>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); verify(); }} className="mt-4 flex w-full max-w-sm flex-col items-center">
              <h2 id="login-title" className="text-center text-xl font-extrabold text-text">OTP Verification</h2>
              <p className="mt-1 text-center text-sm text-muted">We have sent a verification code to<br /><b className="text-text">+91-{phone}</b> <button type="button" onClick={() => setStep("phone")} className="ml-1 font-semibold text-accent">Change</button></p>
              {devOtp && (
                <p className="mt-4 flex w-full items-center gap-2 rounded-lg bg-info-soft px-3 py-2 text-sm font-semibold text-info">
                  <ShieldCheck size={16} /> Demo mode, no SMS sent. Code: <span className="font-extrabold tracking-widest">{devOtp}</span>
                </p>
              )}
              <div className="relative mt-5">
                <div className="flex gap-3" aria-hidden>
                  {[0, 1, 2, 3].map((i) => (
                    <span key={i} className={`grid size-12 place-items-center rounded-xl border text-xl font-bold ${code.length === i ? "border-text" : "border-border"}`}>{code[i] ?? ""}</span>
                  ))}
                </div>
                <input
                  autoFocus inputMode="numeric" autoComplete="one-time-code" aria-label="One-time code" maxLength={4}
                  value={code}
                  onChange={(e) => { const v = e.target.value.replace(/\D/g, "").slice(0, 4); setCode(v); if (v.length === 4) verify(v); }}
                  className="absolute inset-0 w-full opacity-0"
                />
              </div>
              {error && <p role="alert" className="mt-3 text-sm font-semibold text-danger">{error}</p>}
              {busy && <p className="mt-3 text-sm text-muted">Verifying…</p>}
              <p className="mt-5 text-center text-sm text-muted">
                {wait > 0 ? <>Resend code in {wait} seconds</> : <button type="button" onClick={send} className="font-semibold text-accent">Resend code</button>}
              </p>
            </form>
          )}
        </div>
      </div>
    </BottomSheet>
  );
}
