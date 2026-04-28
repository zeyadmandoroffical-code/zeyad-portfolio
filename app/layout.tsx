import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "latin-ext"], display: "swap" });

const siteUrl = "https://zeyad-portfolio-taupe.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Zeyad Mandor — Scaling Startups with Zero Ad Spend",
    template: "%s | Zeyad Mandor",
  },
  description:
    "Zeyad Mandor — 18-year-old Tech Founder, Growth Hacker & Digital Marketing Specialist from Egypt. Scaling B2B SaaS and startups through organic growth and zero ad spend.",
  keywords: [
    "Zeyad Mandor",
    "Growth Hacking",
    "B2B SaaS",
    "Digital Marketing",
    "Zero Ad Spend",
    "Startup Founder",
    "Egypt",
    "Edour",
    "Lazy Code",
  ],
  authors: [{ name: "Zeyad Mandor", url: siteUrl }],
  creator: "Zeyad Mandor",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Zeyad Mandor",
    title: "Zeyad Mandor — Scaling Startups with Zero Ad Spend",
    description:
      "18yo Tech Founder & Growth Hacker. Scaling B2B SaaS and startups through organic velocity.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Zeyad Mandor — Founder & Growth Hacker",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zeyad Mandor — Scaling Startups with Zero Ad Spend",
    description: "18yo Tech Founder scaling B2B SaaS with zero ad spend.",
    images: ["/og-image.png"],
    creator: "@zeyadmandor",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
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
