import type { Metadata, Viewport } from "next";
import { Inter, Inter_Tight } from "next/font/google";
import "./globals.css";
import Loader from "@/components/Loader";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0A0A0A",
};

export const metadata: Metadata = {
  title: "PackWise — AI-Powered Product Intelligence & Compliance Platform",
  description:
    "Scan any packaged product and get instant AI-powered intelligence: OCR extraction, FSSAI compliance analysis, nutrition insights, and sustainability scoring.",
  keywords: ["product compliance", "FSSAI", "EasyOCR", "nutrition analysis", "AI", "PackWise"],
  openGraph: {
    type: "website",
    siteName: "PackWise",
    title: "PackWise — AI-Powered Product Intelligence & Compliance Platform",
    description:
      "Scan any packaged product. Get instant compliance, nutrition, and sustainability intelligence.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${interTight.variable}`}>
        <Loader />
        {children}
      </body>
    </html>
  );
}
