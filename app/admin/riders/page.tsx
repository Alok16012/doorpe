import { adminRiders } from "@/lib/admin";
import { STORES } from "@/lib/geo";
import { PageHead } from "@/components/admin/AdminShell";
import { RiderManager } from "@/components/admin/RiderManager";

export const metadata = { title: "Riders" };

export default async function RidersPage() {
  const riders = await adminRiders();
  return (
    <>
      <PageHead title="Riders" sub={`${riders.filter((r) => r.online).length} on duty of ${riders.length}. Riders use the app at /rider on their phone.`} />
      <RiderManager riders={riders} stores={STORES.map((s) => ({ id: s.id, name: `${s.name}, ${s.city}` }))} />
    </>
  );
}
