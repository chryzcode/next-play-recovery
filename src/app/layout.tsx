import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/Toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Next Play Recovery - Youth Sports Injury Tracking",
  description: "Track and manage youth sports injuries with recovery timelines, resources, and expert guidance for parents and athletes.",
  icons: {
    icon: [
      {
        url: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        url: '/logo.jpeg',
        sizes: '32x32',
        type: 'image/jpeg',
      },
      {
        url: '/logo.jpeg',
        sizes: '16x16',
        type: 'image/jpeg',
      },
    ],
    apple: [
      {
        url: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  },
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
