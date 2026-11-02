import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";

export const metadata: Metadata = {
  title: {
    default: "Khan Food Corner — Zinger, Burgers, Tikka & BBQ in Rawalpindi",
    template: "%s · Khan Food Corner",
  },
  description:
    "Order crispy zingers, smashed burgers, charcoal tikka, desi BBQ, wings and more from Khan Food Corner. Fast delivery across Rawalpindi, open until 2 AM.",
  openGraph: {
    title: "Khan Food Corner — Rawalpindi's crunchiest corner",
    description:
      "Zinger · Burgers · Fries · Tikka · BBQ. Delivered hot across Rawalpindi.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#17110d",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="font-sans">
      <body className="min-h-screen">
        <Header />
        <main>{children}</main>
        <Footer />
        <CartDrawer />
      </body>
    </html>
  );
}
