import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ThemeScript from "@/components/ui/ThemeScript";
import "./globals.css";

const BASE_URL = "https://damianmartin.es";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Damián Martín — Diseñador UI/UX & generalista",
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
    title: "Damián Martín — Diseñador UI/UX & generalista",
    description:
      "8+ años diseñando productos digitales. UI/UX, branding y ecosistemas digitales de principio a fin.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Damián Martín — Diseñador UI/UX & generalista",
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
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
