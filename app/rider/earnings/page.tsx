import { requireRider } from "@/lib/auth";
import { riderEarnings, PAY } from "@/lib/rider";
import { inr } from "@/lib/money";

export const metadata = { title: "Earnings" };

export default async function EarningsPage() {
  const e = await riderEarnings(await requireRider());
  const Box = ({ t, v }: { t: string; v: { n: number; pay: number; tips: number; cash: number; km: number } }) => (
    <section className="rounded-xl bg-bg p-4">
      <p className="text-xs font-semibold text-muted">{t}</p>
      <p className="mt-1 text-3xl font-extrabold tabular-nums">{inr(v.pay)}</p>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-lg bg-surface py-2"><b className="block text-sm tabular-nums">{v.n}</b>trips</div>
        <div className="rounded-lg bg-surface py-2"><b className="block text-sm tabular-nums">{inr(v.tips)}</b>tips</div>
        <div className="rounded-lg bg-surface py-2"><b className="block text-sm tabular-nums">{v.km} km</b>ridden</div>
      </div>
      {v.cash > 0 && <p className="mt-3 rounded-md bg-[#fff4d6] px-2 py-1.5 text-xs font-semibold text-warning">Cash collected: {inr(v.cash)}. Hand this over at the store at the end of your shift.</p>}
    </section>
  );
  return (
    <div>
      <header className="bg-accent px-4 py-4 text-on-accent"><h1 className="text-lg font-extrabold">Earnings</h1><p className="text-xs opacity-90">{inr(PAY.base)} per trip + {inr(PAY.perKm)}/km, and 100% of tips</p></header>
      <div className="space-y-3 p-4">
        <Box t="TODAY" v={e.today} />
        <Box t="LAST 7 DAYS" v={e.week} />
        <section className="rounded-xl bg-bg">
          <h2 className="border-b border-border px-4 py-3 text-sm font-bold">Recent trips</h2>
          {e.rows.length === 0 ? <p className="p-6 text-center text-sm text-muted">No deliveries yet. Go on duty to start earning.</p> : (
            <ul className="divide-y divide-border">
              {e.rows.map((r) => (
                <li key={r.id} className="flex items-center justify-between px-4 py-3 text-sm">
                  <span><b>#{r.code}</b> <span className="text-muted">· {r.area} · {r.km} km</span><span className="block text-xs text-muted">{new Date(r.at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" })}{r.cash ? ` · cash ${inr(r.cash)}` : ""}</span></span>
                  <span className="text-right"><b className="tabular-nums">{inr(r.pay)}</b>{r.tip > 0 && <span className="block text-xs text-success">+{inr(r.tip)} tip</span>}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
