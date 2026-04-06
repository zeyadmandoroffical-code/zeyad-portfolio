import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Zeyad Mandor — Scaling Startups with Zero Ad Spend",
  description: "Zeyad Mandor — 18yo Tech Founder & Growth Hacker. Scaling B2B SaaS with zero ad spend.",
  icons: {
    icon: '/zeyad_portrait.jpg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.className} min-h-screen bg-[#f0f2f5] text-neutral-900 antialiased overflow-x-hidden`}
      >
        {children}
      </body>
    </html>
  );
}
