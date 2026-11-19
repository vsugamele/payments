import type { Metadata } from "next";
import { Inter, Literata, DM_Mono } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import RagChat from "@/components/RagChat";
import { OwnerBar } from "@/components/OwnerBar";
import { GlobalCommandPalette } from "@/components/GlobalCommandPalette";
import { PaymentsWorkbenchShell } from "@/components/PaymentsWorkbenchShell";
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
  metadataBase: new URL("https://vinicius-sugamele.com"),
  title: "Vinícius Sugamele — Meios de Pagamento, Bandeiras e Regulação",
  description:
    "Notícias comentadas, análises práticas e bastidores sobre Visa, Mastercard, Elo, Amex, Pix e Banco Central — por Vinícius Sugamele, Head de Bandeiras com mais de 16 anos no setor.",
  alternates: {
    types: {
      "application/rss+xml": "/feed.xml",
    },
  },
  openGraph: {
    title: "Vinícius Sugamele — Meios de Pagamento, Bandeiras e Regulação",
    description:
      "Notícias comentadas, guia prático e bastidores de meios de pagamento. Trajetória de 16+ anos em EcommIT, Bandeira Elo, Getnet e Verifone / American Express.",
    url: "https://vinicius-sugamele.com",
    siteName: "Vinícius Sugamele",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vinícius Sugamele — Meios de Pagamento, Bandeiras e Regulação",
    description:
      "Notícias comentadas, guia prático em 9 capítulos e bastidores de Visa, Mastercard, Elo, Amex, Pix e Banco Central.",
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
          <OwnerBar />
        </ThemeProvider>
      </body>
    </html>
  );
}
