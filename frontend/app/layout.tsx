import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import RagChat from "@/components/RagChat";
import { OwnerBar } from "@/components/OwnerBar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vinícius Sugamele — Head de Bandeiras & Payments Specialist",
  description:
    "Mais de 16 anos de experiência executiva em meios de pagamento, arquitetura de autorização, governança de bandeiras, billing recorrente e intercâmbio.",
  openGraph: {
    title: "Vinícius Sugamele — Payments & Billing Specialist",
    description: "16+ anos de experiência liderando iniciativas estratégicas em meios de pagamento: EcommIT, Bandeira Elo, Getnet e American Express.",
    url: "https://vinicius-sugamele.com",
    siteName: "Vinícius Sugamele",
    images: [
      {
        url: "/vinicius_sugamele.jpg",
        width: 800,
        height: 1000,
        alt: "Vinícius Sugamele",
      },
    ],
    locale: "pt_BR",
    type: "profile",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          {/* pt-16 compensa o navbar fixo */}
          <div className="flex-1 pt-16 print:pt-0">{children}</div>
          <Footer />
          <RagChat />
          <OwnerBar />
        </ThemeProvider>
      </body>
    </html>
  );
}
