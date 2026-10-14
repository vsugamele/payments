import Link from "next/link";
import { ArrowLeft, Network, Calculator, BookOpen } from "lucide-react";
import MapaWrapper from "./MapaWrapper";

export const metadata = {
  title: "Atlas de Conceitos & Ecossistema — VS Payments",
  description:
    "Atlas interativo do ecossistema de pagamentos com rastreabilidade ponta a ponta (Quem envia, Quem recebe, Como calcula, Campos ISO 8583, Clearing, Intercâmbio, VAMP/ECP e CIP).",
};

export default function MapaPage() {
  return (
    <main className="bg-background flex flex-col h-[calc(100vh-64px)]">
      {/* Header com Navegação em Abas (Alinhado com Liquidação Internacional e MCBS) */}
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
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
          >
            <ArrowLeft size={13} />
            Início
          </Link>

          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground text-sm flex items-center gap-2">
              <Network size={16} className="text-blue-400" />
              Atlas do Ecossistema de Pagamentos
            </span>
            <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
              48 Conceitos • 62 Regras • Visa • MC • Elo • CIP
            </span>
          </div>
        </div>

        {/* Abas dos Mapas */}
        <div className="flex items-center gap-1.5 p-1 bg-card border border-border rounded-xl">
          <Link
            href="/mapa"
            className="text-xs font-bold px-3 py-1 rounded-lg bg-blue-600 text-white shadow-xs transition-all"
          >
            Conceitos Gerais
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
            href="/simulador"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/20 transition-all"
          >
            <Calculator size={12} />
            Simulador IC
          </Link>
          <Link
            href="/trilhas"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 hover:bg-indigo-500/20 transition-all"
          >
            <BookOpen size={12} />
            Trilhas
          </Link>
          <Link
            href="/glossario"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-muted-foreground hover:text-white transition-all"
          >
            Glossário
          </Link>
        </div>
      </div>

      {/* Atlas — ocupa o restante da tela */}
      <div className="flex-1 w-full h-full overflow-hidden">
        <MapaWrapper />
      </div>
    </main>
  );
}
