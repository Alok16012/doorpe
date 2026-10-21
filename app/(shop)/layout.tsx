import { Header } from "@/components/shop/Header";
import { CartBar } from "@/components/cart/CartBar";
import { Footer } from "@/components/shop/Footer";
import { fees } from "@/lib/settings";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="mx-auto min-h-[70dvh] max-w-[1280px] pb-24 md:px-6 md:pb-10">{children}</main>
      <Footer />
      <CartBar freeAbove={fees().freeDeliveryAbove} />
    </>
  );
}
