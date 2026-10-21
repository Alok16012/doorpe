"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Banknote, Check, CreditCard, HandHeart, MapPin, Plus, Smartphone, Tag, TriangleAlert, Wallet } from "lucide-react";
import { TitleBar } from "../ui/TitleBar";
import { Button } from "../ui/Button";
import { BottomSheet } from "../ui/BottomSheet";
import { useApp } from "../AppProvider";
import { cart } from "./store";
import { useQuote } from "./useQuote";
import { BillDetails } from "./BillDetails";
import { AddressForm } from "../account/AddressForm";
import type { Address, Order } from "@/lib/types";
import { inr } from "@/lib/money";

type Addr = Address & { serviceable: boolean };
const NOTES = ["Don't ring the bell", "Leave at the door", "Call when you arrive", "Pet at home", "Hand it to security"];
const PAY: { key: Order["paymentMethod"]; label: string; sub: string; icon: typeof Smartphone }[] = [
  { key: "upi", label: "UPI", sub: "Any UPI app · demo payment", icon: Smartphone },
  { key: "card", label: "Credit / debit card", sub: "Visa, Mastercard, RuPay · demo payment", icon: CreditCard },
  { key: "cod", label: "Cash on delivery", sub: "Pay the rider by cash or UPI", icon: Banknote },
  { key: "wallet", label: "Turant wallet", sub: "Refunds and credits", icon: Wallet },
];

export function CheckoutScreen({ coupons, tipOptions }: { coupons: { code: string; title: string }[]; tipOptions: number[] }) {
  const router = useRouter();
  const { user, openLogin, loc, toast } = useApp();
  const [addresses, setAddresses] = useState<Addr[] | null>(null);
  const [addressId, setAddressId] = useState<string>("");
  const [adding, setAdding] = useState(false);
  const [tip, setTip] = useState(0);
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<string | undefined>();
  const [notes, setNotes] = useState<string[]>([]);
  const [noteText, setNoteText] = useState("");
  const [pay, setPay] = useState<Order["paymentMethod"]>("upi");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [paying, setPaying] = useState(false);
  const idem = useRef(typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now()));
  const { quote, lines, loading } = useQuote({ tip, coupon });

  useEffect(() => {
    if (!user) { openLogin(); return; }
    fetch("/api/addresses").then((r) => r.json()).then((d) => {
      const list: Addr[] = d.addresses || [];
      setAddresses(list);
      const def = list.find((a) => a.isDefault && a.serviceable) || list.find((a) => a.serviceable);
      if (def) setAddressId(def.id);
    });
  }, [user, openLogin]);

  // the cart lives in localStorage, so wait one render after hydration before deciding it's empty
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  useEffect(() => { if (ready && lines.length === 0 && !placing) router.replace("/cart"); }, [ready, lines.length, placing, router]);

  const selected = useMemo(() => addresses?.find((a) => a.id === addressId), [addresses, addressId]);

  async function chooseAddress(a: Addr) {
    setAddressId(a.id);
    // keep header ETA and pricing on the same store as the address
    await fetch("/api/location", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ lat: a.lat, lng: a.lng, label: a.label === "home" ? "Home" : a.label === "work" ? "Work" : a.houseNo, sub: a.area }) });
    router.refresh();
  }

  async function place() {
    if (!selected) return setError("Add a delivery address first");
    setError(""); setPlacing(true);
    if (pay === "upi" || pay === "card") { setPaying(true); await new Promise((r) => setTimeout(r, 1400)); }
    try {
      const r = await fetch("/api/orders", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({
          lines: lines.map((l) => ({ variantId: l.variantId, qty: l.qty })), addressId, paymentMethod: pay, tip, coupon,
          instructions: [...notes, noteText.trim()].filter(Boolean).join(" · "), idempotencyKey: idem.current,
        }),
      });
      const d = await r.json();
      if (!r.ok) {
        setPaying(false); setPlacing(false);
        if (d.code === "CART_CHANGED" && d.quote) { cart.syncFromQuote(d.quote); toast("Your cart changed. Please review it."); router.push("/cart"); return; }
        return setError(d.error || "Couldn't place the order");
      }
      cart.clear();
      router.replace(`/orders/${d.order.id}?new=1`);
    } catch {
      setPaying(false); setPlacing(false);
      setError("Network trouble. Your order wasn't placed. Try again.");
    }
  }

  if (!user)
    return (
      <>
        <TitleBar title="Checkout" back="/cart" />
        <div className="mx-auto max-w-xl p-6 text-center">
          <p className="font-extrabold">Log in to place your order</p>
          <Button className="mt-4" onClick={() => openLogin()}>Log in</Button>
        </div>
      </>
    );

  const walletShort = pay === "wallet" && quote && user.walletBalance < quote.grandTotal;

  return (
    <div className="min-h-dvh bg-surface pb-32">
      <TitleBar title="Checkout" back="/cart" center />
      <div className="mx-auto max-w-3xl space-y-3 p-3 md:grid md:grid-cols-[1fr_340px] md:gap-4 md:space-y-0">
        <div className="space-y-3">
          {/* address */}
          <section className="rounded-xl bg-bg p-4" aria-labelledby="addr-h">
            <div className="mb-3 flex items-center justify-between">
              <h2 id="addr-h" className="text-[15px] font-bold">Deliver to</h2>
              <button onClick={() => setAdding(true)} className="flex items-center gap-1 text-sm font-bold text-accent"><Plus size={16} /> Add new</button>
            </div>
            {addresses === null ? <div className="skeleton h-16 rounded-md" /> : addresses.length === 0 ? (
              <button onClick={() => setAdding(true)} className="flex w-full items-center gap-3 rounded-md border border-dashed border-input p-4 text-left text-sm font-bold text-accent">
                <MapPin size={18} /> Add your delivery address
              </button>
            ) : (
              <ul role="radiogroup" aria-label="Saved addresses" className="space-y-2">
                {addresses.map((a) => (
                  <li key={a.id}>
                    <button role="radio" aria-checked={a.id === addressId} disabled={!a.serviceable} onClick={() => chooseAddress(a)}
                      className={`flex w-full items-start gap-3 rounded-md border p-3 text-left disabled:opacity-60 ${a.id === addressId ? "border-accent bg-accent-soft" : "border-border hover:border-input"}`}>
                      <span className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border-2 ${a.id === addressId ? "border-accent bg-accent text-on-accent" : "border-input"}`}>{a.id === addressId && <Check size={12} strokeWidth={4} />}</span>
                      <span className="min-w-0">
                        <span className="block text-sm font-extrabold capitalize">{a.label}</span>
                        <span className="line-clamp-2 block text-xs text-muted">{[a.houseNo, a.floor && `Floor ${a.floor}`, a.building, a.area].filter(Boolean).join(", ")}</span>
                        <span className="block text-xs text-muted">{a.receiverName} · {a.receiverPhone}</span>
                        {!a.serviceable && <span className="mt-1 block text-xs font-bold text-warning">We don&apos;t deliver here yet</span>}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* instructions */}
          <section className="rounded-xl bg-bg p-4" aria-labelledby="note-h">
            <h2 id="note-h" className="text-[15px] font-bold">Delivery instructions</h2>
            <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
              {NOTES.map((n) => {
                const on = notes.includes(n);
                return <button key={n} aria-pressed={on} onClick={() => setNotes((x) => (on ? x.filter((y) => y !== n) : [...x, n]))} className={`whitespace-nowrap rounded-pill border px-3 py-1.5 text-xs font-bold ${on ? "border-accent bg-accent-soft text-accent" : "border-border text-muted"}`}>{n}</button>;
              })}
            </div>
            <label className="mt-3 block">
              <span className="sr-only">Anything else for the rider?</span>
              <input value={noteText} onChange={(e) => setNoteText(e.target.value.slice(0, 120))} placeholder="Anything else for the rider? (optional)" className="h-11 w-full rounded-md border border-input px-3 text-sm outline-none focus:border-accent" />
            </label>
          </section>

          {/* tip */}
          <section className="rounded-xl bg-bg p-4" aria-labelledby="tip-h">
            <div className="flex items-start gap-3">
              <HandHeart className="mt-0.5 shrink-0 text-accent" aria-hidden />
              <div className="flex-1">
                <h2 id="tip-h" className="text-[15px] font-bold">Tip your rider</h2>
                <p className="text-xs text-muted">Every rupee goes to them. Riding through traffic and rain is hard work.</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label="Tip amount">
              {[0, ...tipOptions].map((t, i) => (
                <button key={t} role="radio" aria-checked={tip === t} onClick={() => setTip(t)} className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[13px] font-semibold ${tip === t ? "border-accent bg-accent-soft text-accent" : "border-border text-text"}`}>
                  <span aria-hidden>{["🙅", "🙂", "😀", "😍", "🤩"][i]}</span>{t ? inr(t) : "No tip"}
                </button>
              ))}
            </div>
          </section>

          {/* coupon */}
          <section className="rounded-xl bg-bg p-4" aria-labelledby="cpn-h">
            <h2 id="cpn-h" className="flex items-center gap-2 text-[15px] font-bold"><Tag size={18} aria-hidden /> Offers & coupons</h2>
            <form onSubmit={(e) => { e.preventDefault(); setCoupon(couponInput.trim().toUpperCase() || undefined); }} className="mt-3 flex gap-2">
              <input value={couponInput} onChange={(e) => setCouponInput(e.target.value.toUpperCase())} placeholder="Enter code" aria-label="Coupon code" className="h-10 flex-1 rounded-md border border-input px-3 text-sm font-bold uppercase tracking-wide outline-none focus:border-accent" />
              <Button type="submit" variant="secondary" disabled={!couponInput.trim()}>Apply</Button>
            </form>
            {quote?.coupon && (
              quote.coupon.error
                ? <p role="alert" className="mt-2 text-xs font-bold text-danger">{quote.coupon.error}</p>
                : <p className="mt-2 flex items-center justify-between text-xs font-bold text-success"><span>{quote.coupon.code} applied · {quote.coupon.title}</span><button onClick={() => { setCoupon(undefined); setCouponInput(""); }} className="text-danger">Remove</button></p>
            )}
            <ul className="mt-3 space-y-2">
              {coupons.map((c) => (
                <li key={c.code} className="flex items-center justify-between gap-3 rounded-sm border border-dashed border-border px-3 py-2">
                  <span className="min-w-0"><b className="block text-xs tracking-wide">{c.code}</b><span className="block text-xs text-muted">{c.title}</span></span>
                  <button onClick={() => { setCouponInput(c.code); setCoupon(c.code); }} className="text-xs font-extrabold text-accent">Apply</button>
                </li>
              ))}
            </ul>
          </section>

          {/* payment */}
          <section className="rounded-xl bg-bg p-4" aria-labelledby="pay-h">
            <h2 id="pay-h" className="text-[15px] font-bold">Pay with</h2>
            <ul role="radiogroup" aria-label="Payment method" className="mt-3 space-y-2">
              {PAY.map(({ key, label, sub, icon: I }) => (
                <li key={key}>
                  <button role="radio" aria-checked={pay === key} onClick={() => setPay(key)} className={`flex w-full items-center gap-3 rounded-md border p-3 text-left ${pay === key ? "border-accent bg-accent-soft" : "border-border hover:border-input"}`}>
                    <span className="grid size-9 place-items-center rounded-sm bg-surface"><I size={18} aria-hidden /></span>
                    <span className="flex-1"><b className="block text-sm">{label}</b><span className="block text-xs text-muted">{key === "wallet" ? `Balance ${inr(user.walletBalance)}` : sub}</span></span>
                    <span className={`grid size-5 place-items-center rounded-full border-2 ${pay === key ? "border-accent bg-accent text-on-accent" : "border-input"}`}>{pay === key && <Check size={12} strokeWidth={4} />}</span>
                  </button>
                </li>
              ))}
            </ul>
            {walletShort && <p className="mt-2 text-xs font-bold text-warning">Wallet balance is lower than the total. Pick another way to pay.</p>}
          </section>
        </div>

        <aside className="space-y-3 md:sticky md:top-20 md:self-start">
          {quote && <BillDetails b={{ ...quote, couponDiscount: quote.coupon && !quote.coupon.error ? quote.coupon.discount : 0, couponCode: quote.coupon?.code }} />}
          <p className="px-1 text-xs text-muted">By placing the order you agree to our terms. Orders can be cancelled until packing starts. <Link href="/help" className="font-bold text-accent">How refunds work</Link></p>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-bg px-3 py-3 shadow-bar">
        <div className="mx-auto max-w-3xl">
          {error && <p role="alert" className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-danger"><TriangleAlert size={14} />{error}</p>}
          <button
            onClick={place}
            disabled={!quote || loading || placing || !selected || !!walletShort || !loc}
            className="flex h-[58px] w-full items-center justify-between rounded-lg bg-accent px-4 text-on-accent hover:bg-accent-hover disabled:opacity-60"
          >
            <span className="text-left leading-tight"><span className="block text-[15px] font-bold">{quote ? inr(quote.grandTotal) : "…"}</span><span className="block text-2xs font-bold uppercase opacity-80">Total</span></span>
            <span className="text-[15px] font-bold">{placing ? "Placing order…" : !selected ? "Add an address" : pay === "cod" ? "Place order ›" : `Pay ${quote ? inr(quote.grandTotal) : ""} ›`}</span>
          </button>
        </div>
      </div>

      <BottomSheet open={adding} onClose={() => setAdding(false)} title="Add delivery address" full>
        {adding && (
          <AddressForm
            initial={{ lat: loc?.lat ?? 28.6328, lng: loc?.lng ?? 77.2197, area: loc ? `${loc.label}, ${loc.sub}` : "", city: loc?.sub.split(", ")[0] ?? "" }}
            defaultName={user.name} defaultPhone={user.phone}
            onSaved={async (a) => {
              setAdding(false);
              const d = await (await fetch("/api/addresses")).json();
              setAddresses(d.addresses);
              const fresh = (d.addresses as Addr[]).find((x) => x.id === a.id);
              if (fresh?.serviceable) chooseAddress(fresh); else toast("Saved, but we don't deliver there yet");
            }}
          />
        )}
      </BottomSheet>

      {paying && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-scrim/60 p-6" role="alertdialog" aria-live="assertive" aria-label="Processing payment">
          <div className="w-full max-w-xs rounded-lg bg-bg p-6 text-center shadow-pop">
            <div className="mx-auto size-12 animate-spin rounded-full border-4 border-accent-soft border-t-accent" />
            <p className="mt-4 font-extrabold">Confirming payment</p>
            <p className="mt-1 text-xs text-muted">Demo mode: no money moves. Don&apos;t close this screen.</p>
          </div>
        </div>
      )}
    </div>
  );
}
