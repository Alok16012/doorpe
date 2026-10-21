import type { Metadata, Viewport } from "next";
import { currentUser } from "@/lib/auth";
import { RiderGate, RiderShell } from "@/components/rider/RiderShell";

export const metadata: Metadata = { title: { default: "Rider", template: "%s · Rider" }, manifest: "/rider.webmanifest", robots: { index: false } };
export const viewport: Viewport = { themeColor: "#14307a" };

export default async function RiderLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  if (!user || user.role !== "rider") return <RiderGate phone={user?.phone} />;
  return <RiderShell>{children}</RiderShell>;
}
