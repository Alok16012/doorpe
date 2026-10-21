import { requireRider } from "@/lib/auth";
import { storeById } from "@/lib/geo";
import { RiderProfileForm } from "@/components/rider/RiderProfileForm";

export const metadata = { title: "Profile" };

export default async function RiderProfilePage() {
  const r = await requireRider();
  const s = storeById(r.riderStoreId || "");
  return (
    <div>
      <header className="bg-accent px-4 py-4 text-on-accent"><h1 className="text-lg font-extrabold">Profile</h1><p className="text-xs opacity-90">+91 {r.phone}</p></header>
      <div className="space-y-3 p-4">
        <section className="rounded-xl bg-bg p-4 text-sm">
          <p className="text-xs font-semibold text-muted">YOUR STORE</p>
          <p className="mt-0.5 font-bold">{s ? `${s.name}, ${s.city}` : "Not assigned"}</p>
          <p className="mt-1 text-muted">Store hours {s ? `${s.opensAt}:00 – ${s.closesAt}:00` : "—"}. Ask your manager to move you to another store.</p>
        </section>
        <RiderProfileForm name={r.name || ""} vehicle={r.vehicle || ""} />
        <section className="rounded-xl bg-bg p-4 text-sm">
          <p className="font-bold">Safety first</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted">
            <li>Never ride while looking at the phone. Slide to confirm only when stopped.</li>
            <li>Always ask for the customer&apos;s delivery code before handing over.</li>
            <li>Wear your helmet. No order is worth a fall.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
