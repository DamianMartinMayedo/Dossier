import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ThemeScript from "@/components/ui/ThemeScript";
import Cursor from "@/components/ui/Cursor";
import "./globals.css";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

const BASE_URL = "https://damianmartin.es";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Damián Martín - Diseñador",
    template: "%s — Damián Martín",
  },
  description:
    "Portfolio de Damián Martín. Diseñador con 8+ años de experiencia en UI/UX, branding y producto digital. Con base en Sevilla, trabajo con equipos globales.",
  keywords: [
    "diseñador UI/UX",
    "product designer",
    "diseño web",
    "branding",
    "portfolio",
    "Sevilla",
    "Damián Martín",
  ],
  authors: [{ name: "Damián Martín", url: BASE_URL }],
  creator: "Damián Martín",
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: BASE_URL,
    siteName: "Damián Martín",
    title: "Damián Martín - Diseñador",
    description:
      "8+ años diseñando productos digitales. UI/UX, branding y ecosistemas digitales de principio a fin.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Damián Martín - Diseñador",
    description:
      "8+ años diseñando productos digitales. UI/UX, branding y ecosistemas digitales de principio a fin.",
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
  alternates: {
    canonical: BASE_URL,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <Cursor />
        <Header />
        <main>{children}</main>
        <Footer />
        {/* GA4 — sólo se inyecta si la variable está configurada. El helper
            de Next maneja next/script con estrategia adecuada y respeta la
            política CSP por defecto. */}
        {GA_ID && <GoogleAnalytics gaId={GA_ID} />}
      </body>
    </html>
  );
}
