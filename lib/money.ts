/** All money is integer paise. */
export const rupees = (r: number) => Math.round(r * 100);

export function inr(paise: number, opts: { decimals?: boolean } = {}) {
  const r = paise / 100;
  const hasFraction = Math.round(r) !== r;
  return (
    "₹" +
    r.toLocaleString("en-IN", {
      minimumFractionDigits: opts.decimals || hasFraction ? 2 : 0,
      maximumFractionDigits: 2,
    })
  );
}

export const pctOff = (price: number, mrp: number) =>
  mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
