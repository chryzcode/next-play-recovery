import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/Toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Next Play Recovery - Youth Sports Injury Tracking",
  description: "Track and manage youth sports injuries with recovery timelines, resources, and expert guidance for parents and athletes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} pt-16`}>
        <Navbar />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
