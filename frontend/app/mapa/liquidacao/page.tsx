import Link from "next/link";
import { ArrowLeft, Network, Layers, FileText } from "lucide-react";

export const metadata = {
  title: "Atlas de Liquidação Internacional — VS Payments",
  description:
    "Grafo visual interativo de liquidação internacional (VisaNet VSS, SREs, moedas, relatórios VSS 110/115/120, BASE II e Mastercard SMS).",
};

export default function LiquidacaoPage() {
  return (
    <main className="bg-background flex flex-col h-[calc(100vh-64px)]">
      {/* Header com Navegação em Abas */}
      <div
        style={{
          borderBottom: "1px solid #1e293b",
          background: "#050b18",
          padding: "0.6rem 1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div className="flex items-center gap-4">
          <Link
            href="/mapa"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
          >
            <ArrowLeft size={13} />
            Voltar
          </Link>

          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground text-sm flex items-center gap-2">
              <Network size={16} className="text-emerald-500" />
              Atlas de Liquidação Internacional
            </span>
            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
              Visa VSS • Mastercard SMS
            </span>
          </div>
        </div>

        {/* Abas dos Mapas */}
        <div className="flex items-center gap-1.5 p-1 bg-card border border-border rounded-xl">
          <Link
            href="/mapa"
            className="text-xs font-semibold px-3 py-1 rounded-lg text-muted-foreground hover:text-foreground transition-all"
          >
            Conceitos Gerais
          </Link>
          <Link
            href="/mapa/liquidacao"
            className="text-xs font-bold px-3 py-1 rounded-lg bg-emerald-600 text-white shadow-xs transition-all"
          >
            Liquidação Internacional
          </Link>
          <Link
            href="/mapa/mcbs"
            className="text-xs font-semibold px-3 py-1 rounded-lg text-muted-foreground hover:text-foreground transition-all"
          >
            MCBS Faturamento
          </Link>
        </div>
      </div>

      {/* Frame do Atlas */}
      <div className="flex-1 w-full h-full bg-[#11131a]">
        <iframe
          src="/mapas/liquidacao/index.html"
          title="Atlas de Liquidação Internacional"
          className="w-full h-full border-0"
        />
      </div>
    </main>
  );
}
