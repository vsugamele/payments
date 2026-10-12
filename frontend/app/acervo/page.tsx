import Link from "next/link";
import { BookOpen, Search, ArrowRight, Lock, BookMarked, ExternalLink, Database, Network, DollarSign, Layers, Sparkles } from "lucide-react";
import manuais from "@/data/manuais.json";
import AcervoExplorer from "./AcervoExplorer";

// IDs que possuem página de leitura detalhada na plataforma
const MANUAIS_COM_VIEWER = new Set(["mc-interchange-detalhado", "vi-interchange-detalhado"]);

export const metadata = {
  title: "Acervo Normativo & RAG — VS Payments",
  description: "O Cérebro da Plataforma. Acesse a base indexada de 35.336 documentos oficiais das bandeiras com motor RAG offline e busca FTS de 517k unidades.",
};

export default function AcervoPage() {
  return (
    <main className="bg-background min-h-screen pb-24 text-foreground">
      {/* Header */}
      <section
        className="dot-grid"
        style={{
          background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(99,102,241,0.12) 0%, transparent 70%)",
          padding: "4.5rem 1.5rem 3.5rem",
          textAlign: "center",
          borderBottom: "1px solid #1e293b",
        }}
      >
        <div className="mx-auto max-w-3xl">
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "rgba(99,102,241,0.12)",
              border: "1px solid rgba(99,102,241,0.3)",
              borderRadius: "9999px",
              padding: "0.35rem 1.1rem",
              marginBottom: "1.25rem",
            }}
          >
            <Database size={14} style={{ color: "#818cf8" }} />
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#818cf8", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Motor RAG Local &bull; 35.336 Documentos
            </span>
          </div>
          <h1 className="font-extrabold text-foreground mb-4" style={{ fontSize: "clamp(1.85rem, 4vw, 2.85rem)" }}>
            Acervo Normativo das Bandeiras
          </h1>
          <p style={{ color: "var(--muted-foreground)", fontSize: "1rem", lineHeight: 1.8, maxWidth: 580, margin: "0 auto" }}>
            Todas as tabelas de intercâmbio, cascatas de risco e comportamentos de campos da plataforma são lastreados diretamente no nosso acervo indexado offline de 5,24 GB.
          </p>

          {/* Quick Hub Links */}
          <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
            <Link
              href="/mapa/liquidacao"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 text-xs font-bold transition-all"
            >
              <Network size={14} />
              <span>Atlas de Liquidação (VSS/SMS)</span>
            </Link>
            <Link
              href="/mapa/mcbs"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/25 text-xs font-bold transition-all"
            >
              <DollarSign size={14} />
              <span>MCBS Faturamento & Invoices</span>
            </Link>
            <Link
              href="/editor"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/25 text-xs font-bold transition-all"
            >
              <Sparkles size={14} />
              <span>Editor Executivo com RAG</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Conteúdo Central */}
      <section className="mx-auto max-w-5xl px-6 py-12 space-y-12">
        
        {/* Painel de Estatísticas Reais */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border p-5 rounded-2xl shadow-xs">
            <div className="text-2xl font-black text-foreground mb-1">35.336</div>
            <div className="text-[11px] text-muted-foreground uppercase tracking-widest font-bold">Documentos / Hashes</div>
          </div>
          <div className="bg-card border border-border p-5 rounded-2xl shadow-xs">
            <div className="text-2xl font-black text-blue-500 mb-1">517.297</div>
            <div className="text-[11px] text-muted-foreground uppercase tracking-widest font-bold">Unidades FTS no Banco</div>
          </div>
          <div className="bg-card border border-border p-5 rounded-2xl shadow-xs">
            <div className="text-2xl font-black text-emerald-500 mb-1">5,24 GB</div>
            <div className="text-[11px] text-muted-foreground uppercase tracking-widest font-bold">Acervo Offline SQLite</div>
          </div>
          <div className="bg-card border border-border p-5 rounded-2xl shadow-xs">
            <div className="text-2xl font-black text-purple-500 mb-1">4 Bandeiras</div>
            <div className="text-[11px] text-muted-foreground uppercase tracking-widest font-bold">Visa • MC • Elo • Amex</div>
          </div>
        </div>

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
