import type { Metadata, Viewport } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/components/AppProvider";
import { currentUser } from "@/lib/auth";
import { clientSvc, currentLocation } from "@/lib/location";
import { BRAND } from "@/lib/brand";

const figtree = Figtree({ subsets: ["latin"], variable: "--font-figtree", weight: ["400", "500", "600", "700", "800", "900"] });

export const metadata: Metadata = {
  title: { default: `${BRAND.name} · ${BRAND.tagline}`, template: `%s · ${BRAND.name}` },
  description: "Fruits, vegetables, dairy, snacks and daily essentials delivered from a store near you in minutes.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: BRAND.name, statusBarStyle: "black-translucent" },
  formatDetection: { telephone: false },
};
export const viewport: Viewport = { themeColor: "#081a4d", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [user, { loc, svc }] = await Promise.all([currentUser(), currentLocation()]);
  return (
    <html lang="en" className={figtree.variable}>
      <body className="min-h-dvh antialiased">
        <AppProvider initialUser={user} loc={loc} svc={clientSvc(svc)}>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
