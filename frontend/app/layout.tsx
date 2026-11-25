import type { Metadata } from "next";
import { Inter, Literata, DM_Mono } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import RagChat from "@/components/RagChat";
import { OwnerBar } from "@/components/OwnerBar";
import { GlobalCommandPalette } from "@/components/GlobalCommandPalette";
import { PaymentsWorkbenchShell } from "@/components/PaymentsWorkbenchShell";
import { AcervoAiGlobalDrawer } from "@/components/AcervoAiGlobalDrawer";
import { JsonLd } from "@/components/JsonLd";
import { SITE_URL, SITE_NAME, buildGlobalGraphJsonLd } from "@/lib/seo";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const literata = Literata({
  variable: "--font-literata",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Vinícius Sugamele — Meios de Pagamento, Bandeiras e BCB",
  description:
    "Notícias comentadas, guia prático, laboratório 3D e mapa regulatório sobre Visa, Mastercard, Elo, Amex, Pix e Banco Central — por Vinícius Sugamele.",
  authors: [{ name: SITE_NAME, url: `${SITE_URL}/curriculo` }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: {
    types: {
      "application/rss+xml": `${SITE_URL}/feed.xml`,
    },
  },
  openGraph: {
    title: "Vinícius Sugamele — Meios de Pagamento, Bandeiras e BCB",
    description:
      "Notícias comentadas, guia prático, laboratório 3D e mapa regulatório sobre Visa, Mastercard, Elo, Amex, Pix e Banco Central.",
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vinícius Sugamele — Meios de Pagamento, Bandeiras e BCB",
    description:
      "Notícias comentadas, guia prático em 9 capítulos, laboratório 3D e mapa regulatório de meios de pagamento.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${literata.variable} ${dmMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <JsonLd data={buildGlobalGraphJsonLd()} />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <Navbar />
          <GlobalCommandPalette />
          <div className="flex-1 print:pt-0">
            <PaymentsWorkbenchShell>{children}</PaymentsWorkbenchShell>
          </div>
          <Footer />
          <RagChat />
          <AcervoAiGlobalDrawer />
          <OwnerBar />
        </ThemeProvider>
      </body>
    </html>
  );
}
