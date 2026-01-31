import type { Metadata } from "next";
import { Web3Provider } from "@/components/Web3Provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Velvet Arc",
  description: "Capital that thinks. An autonomous cross-chain liquidity agent.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Web3Provider>{children}</Web3Provider>
      </body>
    </html>
  );
}
