import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ThemeScript from "@/components/ui/ThemeScript";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Damián Martín — Diseñador",
    template: "%s — Damián Martín",
  },
  description:
    "Portfolio de Damián Martín, diseñador especializado en UI/UX, branding y desarrollo de producto digital.",
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
