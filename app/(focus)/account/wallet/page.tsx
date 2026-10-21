import type { Metadata } from "next";
import { Wallet } from "lucide-react";
import { currentUser } from "@/lib/auth";
import { walletTxns } from "@/lib/account";
import { TitleBar } from "@/components/ui/TitleBar";
import { LoginPrompt } from "@/components/account/AccountBits";
import { inr } from "@/lib/money";

export const metadata: Metadata = { title: "Wallet" };

export default async function WalletPage() {
  const user = await currentUser();
  if (!user) return (<><TitleBar title="Wallet" back="/account" /><LoginPrompt /></>);
  const txns = await walletTxns(user);
  return (
    <>
      <TitleBar title="Wallet" back="/account" />
      <div className="mx-auto max-w-xl space-y-3 p-3">
        <section className="rounded-md bg-text p-5 text-bg">
          <p className="flex items-center gap-2 text-sm font-semibold opacity-80"><Wallet size={16} /> Available balance</p>
          <p className="mt-1 text-3xl font-extrabold">{inr(user.walletBalance)}</p>
          <p className="mt-2 text-xs opacity-80">Refunds land here instantly. Use it at checkout on any order.</p>
        </section>
        <section className="rounded-md bg-bg p-4">
          <h2 className="mb-2 text-base font-extrabold">Activity</h2>
          {txns.length === 0 ? <p className="py-6 text-center text-sm text-muted">Nothing here yet.</p> : (
            <ul className="divide-y divide-border">
              {txns.map((t) => (
                <li key={t.id} className="flex items-center justify-between py-2.5 text-sm">
                  <span><b className="block capitalize">{t.kind}</b><span className="text-xs text-muted">{t.note} · {new Date(t.at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span></span>
                  <span className={`font-extrabold ${t.amount > 0 ? "text-success" : ""}`}>{t.amount > 0 ? "+" : "−"}{inr(Math.abs(t.amount))}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
