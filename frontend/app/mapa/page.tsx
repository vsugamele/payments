import Link from "next/link";
import { ArrowLeft, Network, Calculator, BookOpen, FlaskConical } from "lucide-react";
import MapaWrapper from "./MapaWrapper";

export const metadata = {
  title: "Atlas de Conceitos & Ecossistema — VS Payments",
  description:
    "Atlas interativo do ecossistema de pagamentos com rastreabilidade ponta a ponta (Quem envia, Quem recebe, Como calcula, Campos ISO 8583, Clearing, Intercâmbio, VAMP/ECP e CIP).",
};

export default function MapaPage() {
  return (
    <main className="bg-background flex flex-col h-[calc(100vh-64px)]">
      {/* Header com Navegação em Caixinhas/Abas + Ensinar ⇄ Demonstrar */}
      <div className="border-b border-border bg-card px-5 py-2.5 flex items-center justify-between flex-wrap gap-3 shrink-0">
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
          >
            <ArrowLeft size={13} />
            Início
          </Link>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground text-sm flex items-center gap-2">
              <Network size={16} className="text-primary" />
              Atlas do Ecossistema de Pagamentos
            </span>
            <span className="text-[10px] font-mono font-semibold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
              1. Ensinar (48 Conceitos) ⇄ 2. Demonstrar (62 Regras & Campos)
            </span>
          </div>
        </div>

        {/* Abas dos 5 Mapas */}
        <div className="flex items-center gap-1 p-1 bg-muted/60 border border-border rounded-xl flex-wrap">
          <Link
            href="/mapa"
            className="text-xs font-semibold px-3 py-1 rounded-lg bg-primary text-primary-foreground shadow-xs transition-all"
          >
            1. Conceitos Gerais
          </Link>
          <Link
            href="/mapa/produtos"
            className="text-xs font-semibold px-3 py-1 rounded-lg text-foreground hover:bg-card transition-all"
          >
            2. Mapa de Produtos (4 Bandeiras)
          </Link>
          <Link
            href="/mapa/irds"
            className="text-xs font-semibold px-3 py-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-card transition-all"
          >
            3. IRDs & Tabelas (2.103)
          </Link>
          <Link
            href="/mapa/liquidacao"
            className="text-xs font-semibold px-3 py-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-card transition-all"
          >
            4. Liquidação Internacional
          </Link>
          <Link
            href="/mapa/mcbs"
            className="text-xs font-semibold px-3 py-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-card transition-all"
          >
            5. MCBS Faturamento
          </Link>
        </div>

        {/* Links rápidos Ensinar + Demonstrar */}
        <div className="hidden xl:flex items-center gap-2">
          <Link
            href="/jornada"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/25 text-primary hover:bg-primary/15 transition-all"
          >
            <FlaskConical size={12} />
            Lab 3D
          </Link>
          <Link
            href="/simulador"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all"
          >
            <Calculator size={12} />
            Simulador IC
          </Link>
          <Link
            href="/trilhas"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-muted border border-border text-foreground hover:border-foreground/30 transition-all"
          >
            <BookOpen size={12} />
            Por Produto
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
