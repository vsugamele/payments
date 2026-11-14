import Link from "next/link";
import { ArrowLeft, Layers, Calculator, FileText } from "lucide-react";
import ProductMapAtlasClient from "./ProductMapAtlasClient";

export const metadata = {
  title: "Catálogo & Mapa de Produtos (Visa PID × MC Brand Product × Elo × Amex) — VS Payments",
  description:
    "Equivalência técnica de plásticos, fontes de funding, tetos regulatórios Bacen (Resolução BCB 304), modalidades de parcelamento Brasil e adendos setoriais nas 4 bandeiras.",
};

export default function MapaProdutosPage() {
  return (
    <main className="bg-background min-h-[calc(100vh-64px)] flex flex-col">
      {/* Header com Navegação Unificada nas 5 Abas do Atlas */}
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
            Voltar ao Atlas
          </Link>

          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground text-sm flex items-center gap-2">
              <Layers size={16} className="text-emerald-400" />
              Mapa de Produtos (4 Bandeiras)
            </span>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
              PID Visa • Brand Product MC • Cód. Elo • Amex • BCB 304
            </span>
          </div>
        </div>

        {/* Abas dos 5 Mapas do Atlas */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-card border border-border rounded-xl">
          <Link
            href="/mapa"
            className="text-xs font-semibold px-3 py-1 rounded-lg text-muted-foreground hover:text-foreground transition-all"
          >
            Conceitos Gerais
          </Link>
          <Link
            href="/mapa/produtos"
            className="text-xs font-bold px-3 py-1 rounded-lg bg-emerald-600 text-white shadow-xs transition-all"
          >
            Mapa de Produtos (4 Bandeiras)
          </Link>
          <Link
            href="/mapa/irds"
            className="text-xs font-semibold px-3 py-1 rounded-lg text-muted-foreground hover:text-foreground transition-all"
          >
            IRDs & Tabelas (2.103)
          </Link>
          <Link
            href="/mapa/liquidacao"
            className="text-xs font-semibold px-3 py-1 rounded-lg text-muted-foreground hover:text-foreground transition-all"
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

        {/* Links rápidos de apoio */}
        <div className="hidden xl:flex items-center gap-2">
          <Link
            href="/editor"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/20 transition-all"
          >
            <FileText size={12} />
            Doc Studio
          </Link>
          <Link
            href="/simulador"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-muted-foreground hover:text-white transition-all"
          >
            <Calculator size={12} />
            Simulador IC
          </Link>
        </div>
      </div>

      <div className="flex-1 w-full">
        <ProductMapAtlasClient />
      </div>
    </main>
  );
}
