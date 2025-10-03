import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { CartProvider } from "@/contexts/CartContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "تانسو - فروشگاه شیرآلات ساختمانی",
  description: "فروشگاه آنلاین شیرآلات ساختمانی با کیفیت بالا و قیمت مناسب",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
        <CartProvider>
          <Navigation />
          <main className="min-h-screen">
            {children}
          </main>
        </CartProvider>
      </body>
    </html>
  );
}
