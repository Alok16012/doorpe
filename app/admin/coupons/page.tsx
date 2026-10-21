import { allCoupons } from "@/lib/settings";
import { couponUsage } from "@/lib/admin";
import { PageHead } from "@/components/admin/AdminShell";
import { CouponManager } from "@/components/admin/CouponManager";

export const metadata = { title: "Coupons" };

export default async function CouponsPage() {
  return (
    <>
      <PageHead title="Coupons" sub="Codes customers can apply at checkout. The checkout page lists every active code." />
      <CouponManager coupons={allCoupons()} usage={await couponUsage()} />
    </>
  );
}
