"use client";
import { useState } from "react";
import { inr } from "@/lib/money";

/** Orders per day, one series. Bars with rounded tops, hover tooltip, a table view for screen readers. */
export function OrdersChart({ days }: { days: { day: string; label: string; orders: number; revenue: number }[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 560, H = 200, padL = 32, padB = 26, padT = 12;
  const max = Math.max(4, ...days.map((d) => d.orders));
  const step = Math.ceil(max / 4);
  const top = step * 4;
  const bw = (W - padL) / days.length;
  const barW = Math.min(36, bw * 0.55);
  const y = (v: number) => padT + (H - padT - padB) * (1 - v / top);
  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Orders per day, last 7 days">
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <line x1={padL} x2={W} y1={y(step * i)} y2={y(step * i)} stroke="var(--color-border)" strokeWidth="1" />
            <text x={padL - 8} y={y(step * i) + 4} textAnchor="end" fontSize="11" fill="var(--color-text-muted)">{step * i}</text>
          </g>
        ))}
        {days.map((d, i) => {
          const x = padL + bw * i + (bw - barW) / 2;
          const h = Math.max(0, y(0) - y(d.orders));
          const r = Math.min(4, h);
          return (
            <g key={d.day} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              <rect x={padL + bw * i} y={padT} width={bw} height={H - padT - padB} fill="transparent" />
              {h > 0 && (
                <path
                  d={`M${x},${y(0)} V${y(d.orders) + r} Q${x},${y(d.orders)} ${x + r},${y(d.orders)} H${x + barW - r} Q${x + barW},${y(d.orders)} ${x + barW},${y(d.orders) + r} V${y(0)} Z`}
                  fill="var(--color-accent)" opacity={hover === null || hover === i ? 1 : 0.45}
                />
              )}
              <text x={padL + bw * i + bw / 2} y={H - 8} textAnchor="middle" fontSize="11" fill="var(--color-text-muted)">{d.label}</text>
            </g>
          );
        })}
      </svg>
      {hover !== null && (
        <div className="pointer-events-none absolute top-0 rounded-md border border-border bg-bg px-3 py-2 text-xs shadow-pop"
          style={{ left: `${((padL + bw * hover + bw / 2) / W) * 100}%`, transform: "translateX(-50%)" }}>
          <p className="font-bold text-text">{days[hover].day}</p>
          <p className="text-muted">{days[hover].orders} orders · {inr(days[hover].revenue)}</p>
        </div>
      )}
      <table className="sr-only">
        <caption>Orders per day</caption>
        <thead><tr><th>Day</th><th>Orders</th><th>Revenue</th></tr></thead>
        <tbody>{days.map((d) => <tr key={d.day}><td>{d.day}</td><td>{d.orders}</td><td>{inr(d.revenue)}</td></tr>)}</tbody>
      </table>
    </div>
  );
}
