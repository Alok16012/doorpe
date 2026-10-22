import { Header } from "@/components/shop/Header";
import { CartBar } from "@/components/cart/CartBar";
import { Footer } from "@/components/shop/Footer";
import { TabBar } from "@/components/shop/TabBar";
import { fees } from "@/lib/settings";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {/* phones: room for the tab bar + floating cart bar; desktop: normal page with a footer */}
      <main className="mx-auto min-h-[70dvh] max-w-[1280px] pb-[calc(84px+env(safe-area-inset-bottom))] md:px-6 md:pb-10">{children}</main>
      <Footer />
      <CartBar freeAbove={fees().freeDeliveryAbove} />
      <TabBar />
    </>
  );
}
