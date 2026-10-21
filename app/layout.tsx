import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/components/AppProvider";
import { currentUser } from "@/lib/auth";
import { clientSvc, currentLocation } from "@/lib/location";
import { BRAND } from "@/lib/brand";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", weight: ["400", "500", "600", "700", "800"] });

export const metadata: Metadata = {
  title: { default: `${BRAND.name} · ${BRAND.tagline}`, template: `%s · ${BRAND.name}` },
  description: "Fruits, vegetables, dairy, snacks and daily essentials delivered from a store near you in minutes.",
  manifest: "/manifest.webmanifest",
};
export const viewport: Viewport = { themeColor: "#ffc83d", width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [user, { loc, svc }] = await Promise.all([currentUser(), currentLocation()]);
  return (
    <html lang="en" className={manrope.variable}>
      <body className="min-h-dvh antialiased">
        <AppProvider initialUser={user} loc={loc} svc={clientSvc(svc)}>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
