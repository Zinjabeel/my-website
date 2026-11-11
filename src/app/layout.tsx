import type { Metadata, Viewport } from "next";
import { Archivo, Geist_Mono } from "next/font/google";
import "./globals.css";
import { site } from "@/content/site";
import { SmoothScroll } from "@/components/site/SmoothScroll";
import { Dock } from "@/components/site/Dock";
import { Footer } from "@/components/site/Footer";
import { Cursor } from "@/components/site/Cursor";
import { JsonLd, organizationJsonLd } from "@/lib/seo";

const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Website development studio`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.name }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en",
    url: "/",
    title: `${site.name} — Website development studio`,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — Website development studio`,
    description: site.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#e9e9e6",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${geistMono.variable}`}>
      <body>
        <a
          href="#main"
          className="label sr-only z-[100] rounded bg-ink px-4 py-3 text-paper focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        {children}
        <Footer />
        <SmoothScroll />
        <Dock />
        <Cursor />
        <div aria-hidden className="grain" />
        <JsonLd data={organizationJsonLd()} />
      </body>
    </html>
  );
}
