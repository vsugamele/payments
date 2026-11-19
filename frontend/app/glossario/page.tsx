import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import GlossarioClient from "./GlossarioClient";

export const metadata = {
  title: "Glossário de Meios de Pagamento — Vinícius Sugamele",
  description:
    "Referência prática de termos, siglas e conceitos de meios de pagamento: ISO 8583, IRD, PID, 3DS 2.2, Base II, IPM, VAMP, BRAM, Pix e regulação.",
};

export default function GlossarioPage() {
  return (
    <main className="bg-background min-h-dvh pb-24">
      <div className="mx-auto max-w-5xl px-6">
        <div className="pt-8 pb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={13} /> Voltar para a página inicial
          </Link>
        </div>

        <header className="pb-10 border-b border-border space-y-4">
          <p className="section-eyebrow">Referência técnica</p>
          <h1
            className="font-semibold text-foreground text-balance"
            style={{
              fontSize: "clamp(1.9rem, 4vw, 2.75rem)",
              lineHeight: 1.15,
              letterSpacing: "-0.025em",
            }}
          >
            Glossário de meios de pagamento
          </h1>
          <p className="font-serif text-base text-muted-foreground leading-relaxed max-w-2xl">
            Siglas de mensageria, arquivos de liquidação, tarifas e programas das bandeiras
            explicados de forma direta — com o impacto prático de cada termo no dia a dia.
          </p>
        </header>

        <div className="pt-8">
          <GlossarioClient />
        </div>
      </div>
    </main>
  );
}
