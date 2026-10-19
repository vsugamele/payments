import Link from "next/link";
import { ArrowLeft, Table2, Calculator, FileText, FolderOpen } from "lucide-react";
import IrdsAtlasClient from "./IrdsAtlasClient";

export const metadata = {
  title: "Atlas de IRDs, FPIs & Tabelas de Intercâmbio (2.103 Regras) — VS Payments",
  description:
    "Árvore de qualificação de IRDs Mastercard (Table 76), Programas e PIDs Visa (Tables 3-12 a 3-38), Segmentos Elo, Tabelas Físicas GCMS/MPE (T068) e motor de cálculo sobre 2.103 alíquotas reais.",
};

export default function IrdsAtlasPage() {
  return (
    <main className="bg-background flex flex-col h-[calc(100vh-64px)]">
      {/* Header com Navegação Unificada nas 4 Abas do Atlas */}
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
              <Table2 size={16} className="text-amber-400" />
              Atlas de IRDs, FPIs & Tabelas de Intercâmbio
            </span>
            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
              2.103 Alíquotas • Table 76 • Tables 3-12 a 3-38 • GCMS T068
            </span>
          </div>
        </div>

        {/* Abas dos 4 Mapas do Atlas */}
        <div className="flex items-center gap-1.5 p-1 bg-card border border-border rounded-xl">
          <Link
            href="/mapa"
            className="text-xs font-semibold px-3 py-1 rounded-lg text-muted-foreground hover:text-foreground transition-all"
          >
            Conceitos Gerais
          </Link>
          <Link
            href="/mapa/irds"
            className="text-xs font-bold px-3 py-1 rounded-lg bg-amber-600 text-white shadow-xs transition-all"
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
            href="/acervo"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 hover:bg-indigo-500/20 transition-all"
          >
            <FolderOpen size={12} />
            Acervo
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

      {/* Área Principal do Atlas de IRDs e Tabelas */}
      <div className="flex-1 w-full h-full overflow-hidden">
        <IrdsAtlasClient />
      </div>
    </main>
  );
}
