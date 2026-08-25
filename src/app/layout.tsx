import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://cutting-mat-designer.vercel.app"),
  title: {
    default: "cutting mat designer — Parametric Craft & Drafting Mat Studio",
    template: "%s | cutting mat designer",
  },
  description:
    "A high-performance parametric vector studio for designing custom self-healing craft and drafting cutting mats with gap-free grid mathematics, draggable stickers, multi-anchor protractors, and SVG/PDF/PNG exports.",
  keywords: [
    "cutting mat designer",
    "self healing cutting mat",
    "craft cutting mat generator",
    "parametric grid generator",
    "drafting grid maker",
    "vector cutting board",
    "laser cutter grid template",
    "quilting mat designer",
    "scale ruler generator",
    "CAD grid export",
    "SVG cutting mat",
    "PDF cutting mat",
    "300 DPI cutting board print",
    "astryx component library",
    "nextjs cutting mat",
  ],
  authors: [{ name: "Nischal Mudennavar", url: "https://nischal.dev" }],
  creator: "Nischal Mudennavar",
  publisher: "Nischal Mudennavar",
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
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://cutting-mat-designer.vercel.app",
    siteName: "cutting mat designer",
    title: "cutting mat designer — Parametric Craft & Drafting Mat Studio",
    description:
      "Design custom, high-precision self-healing cutting mats with real-scale grid mathematics, protractors, stickers, and instant SVG, PDF, and 300 DPI exports.",
  },
  twitter: {
    card: "summary_large_image",
    title: "cutting mat designer — Parametric Craft & Drafting Mat Studio",
    description:
      "Design custom, high-precision self-healing cutting mats with real-scale grid mathematics, protractors, stickers, and instant SVG, PDF, and 300 DPI exports.",
    creator: "@nischalmudennavar",
  },
  category: "Design Tools",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100 select-none">
        {children}
      </body>
    </html>
  );
}
