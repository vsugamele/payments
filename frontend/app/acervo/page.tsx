import Link from "next/link";
import { BookOpen, Search, ArrowRight, Lock, BookMarked, ExternalLink, Database, Network, DollarSign, Layers, Sparkles } from "lucide-react";
import manuais from "@/data/manuais.json";
import AcervoExplorer from "./AcervoExplorer";
import OutgoingAcervoConnector from "../compliance/outgoing/OutgoingAcervoConnector";

// IDs que possuem página de leitura detalhada na plataforma
const MANUAIS_COM_VIEWER = new Set(["mc-interchange-detalhado", "vi-interchange-detalhado"]);

export const metadata = {
  title: "Acervo Normativo & RAG — VS Payments",
  description: "O Cérebro da Plataforma. Acesse a base indexada de 35.336 documentos oficiais das bandeiras com motor RAG offline e busca FTS de 517k unidades.",
};

export default function AcervoPage() {
  return (
    <main className="bg-[#F8FAFC] dark:bg-background min-h-screen pb-24 text-foreground">
      {/* Header Editorial Paper & Precision (Workbench 2.0) */}
      <section className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90">
        <div className="mx-auto max-w-6xl px-6 py-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800">
              <Database size={13} className="text-blue-600 dark:text-blue-400" />
              <span className="text-[11px] font-black uppercase tracking-wider text-blue-700 dark:text-blue-300">
                Hub do Acervo &amp; Regulatório • 40.129 Ativos • 17.106 Campos PDF • 454 Billing Lines • 94 Normas BCB
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Acervo Normativo das Bandeiras &amp; BCB/CMN (4 Motores SQLite + FTS5)
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
              Consulta auditável com página exata do PDF e hash <code className="font-mono">SHA-256</code> nos 4 bancos locais (<code className="font-mono">acervo.sqlite3</code>, <code className="font-mono">campos.sqlite3</code>, <code className="font-mono">fee_schedule.sqlite3</code> e <code className="font-mono">regulacao.sqlite3</code>). Sincronizado com o filtro global de Bandeira e Lente no topo.
            </p>
          </div>

          {/* Quick Hub Links */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <Link
              href="/mapa/liquidacao"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition-all"
            >
              <Network size={14} />
              <span>Atlas de Liquidação (VSS/SMS)</span>
            </Link>
            <Link
              href="/mcbs"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold transition-all"
            >
              <DollarSign size={14} />
              <span>MCBS Faturamento &amp; Invoices</span>
            </Link>
            <Link
              href="/editor"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs transition-all"
            >
              <Sparkles size={14} />
              <span>Doc Studio com RAG</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Conteúdo Central */}
      <section className="mx-auto max-w-6xl px-6 py-8 space-y-10">
        
        {/* Painel de Estatísticas Reais */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border p-5 rounded-2xl shadow-xs">
            <div className="text-2xl font-black text-foreground mb-1">40.129</div>
            <div className="text-[11px] text-muted-foreground uppercase tracking-widest font-bold">Ativos Únicos (SHA-256)</div>
          </div>
          <div className="bg-card border border-border p-5 rounded-2xl shadow-xs">
            <div className="text-2xl font-black text-blue-500 mb-1">571.849</div>
            <div className="text-[11px] text-muted-foreground uppercase tracking-widest font-bold">Páginas FTS no Banco</div>
          </div>
          <div className="bg-card border border-border p-5 rounded-2xl shadow-xs">
            <div className="text-2xl font-black text-emerald-500 mb-1">17.106</div>
            <div className="text-[11px] text-muted-foreground uppercase tracking-widest font-bold">Campos de Layout (`campos.sqlite3`)</div>
          </div>
          <div className="bg-card border border-border p-5 rounded-2xl shadow-xs">
            <div className="text-2xl font-black text-purple-500 mb-1">94 Normas</div>
            <div className="text-[11px] text-muted-foreground uppercase tracking-widest font-bold">BCB / CMN + 4 Bandeiras</div>
          </div>
        </div>

        {/* Conector Completo do Sistema de Acervos & 6 Filas Executadas */}
        <OutgoingAcervoConnector />

        {/* Explorador de RAG Interativo */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Database size={18} className="text-blue-500" />
              <h2 className="text-lg font-bold text-foreground">Pesquisa Direta no Motor RAG</h2>
            </div>
            <span className="text-xs text-muted-foreground">Extração instantânea com número de página e SHA-256</span>
          </div>

          <AcervoExplorer />
        </div>

        {/* Listagem Fixa de Manuais */}
        <div className="space-y-6 pt-4">
          <div className="flex items-center gap-2 mb-6 border-b border-border pb-3">
            <Search size={18} className="text-indigo-400"/>
            <h2 className="text-lg font-bold text-foreground">Manuais com Visualização Estruturada</h2>
          </div>

          {manuais.map((manual) => (
            <div 
              key={manual.id} 
              className="bg-black/40 border border-border rounded-2xl overflow-hidden shadow-lg transition-transform hover:-translate-y-1"
            >
              <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className="text-xs font-bold uppercase tracking-widest px-2 py-1 bg-white/10 rounded text-muted-foreground">
                      {manual.bandeira}
                    </span>
                    <span className="text-xs text-indigo-400 font-semibold">{manual.versao}</span>
                    {MANUAIS_COM_VIEWER.has(manual.id) && (
                      <span style={{ fontSize: "0.6rem", fontWeight: 700, padding: "0.2rem 0.55rem", borderRadius: "9999px", background: "rgba(99,102,241,0.15)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.35)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                        ✦ Disponível na Plataforma
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 leading-tight">{manual.titulo}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">{manual.descricao}</p>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {MANUAIS_COM_VIEWER.has(manual.id) ? (
                    <Link
                      href={`/acervo/${manual.id}`}
                      className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg transition-colors"
                      style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.4)", color: "#818cf8" }}
                    >
                      <BookOpen size={15} /> Ler na Plataforma
                    </Link>
                  ) : manual.isPremium ? (
                    <button className="flex items-center justify-center gap-2 px-5 py-2.5 bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-500/50 text-yellow-500 text-sm font-semibold rounded-lg transition-colors">
                      <Lock size={14} className="mb-0.5" /> Conteúdo Premium
                    </button>
                  ) : (
                    <button className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors">
                      <ExternalLink size={16} /> Referência PDF
                    </button>
                  )}
                </div>
              </div>

              {/* Rastreabilidade / Capítulos */}
              <div className="bg-code-bg/50 p-6 md:px-8">
                <h4 className="text-xs font-semibold uppercase tracking-widest text-border mb-4">Pontos de Carga da Plataforma</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {manual.capitulos.map((cap, i) => (
                    <div key={i} className="flex gap-3">
                       <ArrowRight size={14} className="text-indigo-400 mt-0.5 shrink-0"/>
                       <div>
                         <span className="block text-sm font-semibold text-white mb-1">{cap.nome}</span>
                         <span className="block text-xs text-muted-foreground leading-relaxed">{cap.resumo}</span>
                       </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ))}

        </div>
      </section>

    </main>
  );
}
