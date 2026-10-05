
import type { Metadata } from "next";
import "./globals.css";

import Header from "./components/Header";
import Footer from "./components/Footer";
import WhatsAppButton from "./components/WhatsAppButton";
import CurrencyProvider from "./components/CurrencyProvider";

export const metadata: Metadata = {
  title: "Papeg Tour & Travel | Discover Papua Highlands",
  description:
    "Discover Wamena and Papua Highlands with Papeg Tour & Travel.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col">
        <CurrencyProvider>
          <Header />

          <main className="flex-1">
            {children}
          </main>

          <Footer />

          <WhatsAppButton />
        </CurrencyProvider>
      </body>
    </html>
  );
}
