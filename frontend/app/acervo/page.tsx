import Link from "next/link";
import { BookOpen, Search, ArrowRight, Lock, BookMarked, ExternalLink } from "lucide-react";
import manuais from "@/data/manuais.json";

// IDs que possuem página de leitura detalhada na plataforma
const MANUAIS_COM_VIEWER = new Set(["mc-interchange-detalhado", "vi-interchange-detalhado"]);

export const metadata = {
  title: "Acervo Normativo — VS Payments",
  description: "O Cérebro da Plataforma. Acesse a estrutura lógica, mapeamentos de normas e cartilhas técnicas oficiais de Visa e Mastercard.",
};

export default function AcervoPage() {
  return (
    <main className="bg-background min-h-screen pb-24">
      {/* Header */}
      <section
        className="dot-grid"
        style={{
          background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(99,102,241,0.1) 0%, transparent 70%)",
          padding: "5rem 1.5rem 4rem",
          textAlign: "center",
          borderBottom: "1px solid #0f172a",
        }}
      >
        <div className="mx-auto max-w-3xl">
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "rgba(99,102,241,0.1)",
              border: "1px solid rgba(99,102,241,0.25)",
              borderRadius: "9999px",
              padding: "0.35rem 1rem",
              marginBottom: "1.5rem",
            }}
          >
            <BookMarked size={13} style={{ color: "#818cf8" }} />
            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#818cf8", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Cérebro Estrutural
            </span>
          </div>
          <h1 className="font-bold text-white mb-4" style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)" }}>
            Acervo Normativo & Manuais
          </h1>
          <p style={{ color: "var(--muted-foreground)", fontSize: "1rem", lineHeight: 1.8, maxWidth: 560, margin: "0 auto" }}>
            As tabelas de intercâmbio e cascatas de risco deste sistema não são opinativas. Elas são lastreadas milimetricamente nas regulamentações operacionais mastodônticas das marcas. 
            Navegue no acervo de pesquisa da nossa engine.
          </p>
        </div>
      </section>

      {/* Conteúdo Central */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        
        {/* Painel de Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
          <div className="bg-code-bg border border-border p-5 rounded-xl">
            <div className="text-2xl font-bold text-white mb-1">{manuais.length}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Manuais Indexados</div>
          </div>
          <div className="bg-code-bg border border-border p-5 rounded-xl">
            <div className="text-2xl font-bold text-indigo-400 mb-1">+4.5k</div>
            <div className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Páginas de Regras</div>
          </div>
          <div className="bg-code-bg border border-border p-5 rounded-xl">
            <div className="text-2xl font-bold text-white mb-1">100%</div>
            <div className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Lastro Técnico</div>
          </div>
          <div className="bg-code-bg border border-border p-5 rounded-xl opacity-50">
            <div className="text-2xl font-bold text-muted-foreground flex gap-2 items-center mb-1"><Lock size={18}/> SaaS</div>
            <div className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Premium (Em Breve)</div>
          </div>
        </div>

        {/* Listagem Fixa de Manuais */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-8">
            <Search size={20} className="text-indigo-400"/>
            <h2 className="text-xl font-bold text-white">Catálogo de Fonte Documental</h2>
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
