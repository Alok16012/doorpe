import { TabBar } from "@/components/shop/TabBar";

export default function FocusLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-surface">
      {children}
      <TabBar />
    </div>
  );
}
