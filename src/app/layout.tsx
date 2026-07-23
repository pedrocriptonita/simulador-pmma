import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const DESCRIPTION =
  "Simulados no formato Cebraspe (Certo/Errado com nota líquida) para o concurso da Polícia Militar do Maranhão 2026. Prova em 11/10/2026.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Simulador PM MA 2026 — Simulados Cebraspe para o concurso da PMMA",
    template: "%s | Simulador PM MA 2026",
  },
  description: DESCRIPTION,
  keywords: [
    "concurso PM MA",
    "PMMA 2026",
    "simulado Cebraspe",
    "polícia militar Maranhão",
    "soldado PM MA",
    "simulado concurso",
    "nota líquida Cebraspe",
  ],
  applicationName: "Simulador PM MA 2026",
  authors: [{ name: "Simulador PM MA" }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: siteUrl,
    siteName: "Simulador PM MA 2026",
    title: "Simulador PM MA 2026 — Simulados Cebraspe para o concurso da PMMA",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Simulador PM MA 2026",
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
