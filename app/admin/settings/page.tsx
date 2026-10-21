import { fees } from "@/lib/settings";
import { PageHead } from "@/components/admin/AdminShell";
import { FeesForm } from "@/components/admin/FeesForm";

export const metadata = { title: "Fees & settings" };

export default function SettingsPage() {
  return (
    <>
      <PageHead title="Fees & settings" sub="Charges shown in every customer's bill. New values apply to the next cart refresh." />
      <FeesForm initial={fees()} />
    </>
  );
}
