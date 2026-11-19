import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { GUIA_CHAPTERS } from "@/data/guia-pagamentos";

export const metadata = {
  title: "Guia Geral de Meios de Pagamento — Vinícius Sugamele",
  description:
    "Como funcionam cartões, clearing, intercâmbio, chargeback, Pix, MED 2.0 e o Split Payment da Reforma Tributária — explicado em capítulos curtos com fontes oficiais.",
};

export default function GuiaPage() {
  return (
    <main className="bg-background min-h-dvh pb-24">
      <div className="mx-auto max-w-4xl px-6">
        <div className="pt-8 pb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={13} /> Voltar para a página inicial
          </Link>
        </div>

        {/* Cabeçalho */}
        <header className="pb-10 border-b border-border space-y-5">
          <p className="section-eyebrow">Guia escrito · 6 capítulos</p>
          <h1
            className="font-semibold text-foreground text-balance"
            style={{
              fontSize: "clamp(1.9rem, 4.2vw, 2.85rem)",
              lineHeight: 1.14,
              letterSpacing: "-0.025em",
            }}
          >
            Como funcionam os pagamentos no Brasil
          </h1>
          <p className="font-serif text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl text-pretty">
            Uma compra no cartão ou um Pix atravessa várias empresas em segundos. Este guia resume
            quem participa de cada etapa, para onde vai o dinheiro e qual norma oficial rege cada
            fluxo — com atalho direto para testar cada cenário no Laboratório.
          </p>

          {/* Navegação rápida por capítulos em pílulas */}
          <nav aria-label="Capítulos do guia" className="flex flex-wrap gap-2 pt-2">
            {GUIA_CHAPTERS.map((ch) => (
              <a
                key={ch.id}
                href={`#${ch.id}`}
                className="px-3.5 py-1.5 rounded-full text-xs font-medium border border-border bg-card text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors"
              >
                <span className="font-mono mr-1.5 opacity-70">{ch.number}</span>
                {ch.title.split(":")[0]}
              </a>
            ))}
          </nav>
        </header>

        {/* Capítulos */}
        <div className="divide-y divide-border">
          {GUIA_CHAPTERS.map((ch) => (
            <section
              key={ch.id}
              id={ch.id}
              className="py-12 scroll-mt-20 space-y-5"
            >
              <div className="space-y-2">
                <p className="font-mono text-xs text-muted-foreground">
                  Capítulo {ch.number}
                </p>
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight leading-snug">
                  {ch.title}
                </h2>
                <p className="font-serif text-base text-muted-foreground leading-relaxed">
                  {ch.subtitle}
                </p>
              </div>

              {/* Fluxo de atores */}
              <div className="rounded-xl border border-border bg-muted/60 px-4 py-3 font-mono text-xs text-foreground">
                <span className="text-muted-foreground mr-2">Fluxo:</span>
                {ch.actors}
              </div>

              {/* Texto principal em Literata */}
              <div className="font-serif text-base text-[var(--body-text)] leading-[1.82] space-y-4 max-w-3xl">
                {ch.paragraphs.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>

              {/* Pontos-chave */}
              <div className="editorial-card p-5 space-y-2.5">
                <p className="section-eyebrow">Pontos essenciais</p>
                <ul className="space-y-2 text-sm text-foreground/90 leading-relaxed">
                  {ch.keyPoints.map((pt, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="font-mono text-xs text-muted-foreground mt-0.5">
                        0{idx + 1}
                      </span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Fontes e links */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-1">
                <div className="space-y-1">
                  <p className="font-mono text-[10px] uppercase text-muted-foreground">
                    Fontes e normas de referência
                  </p>
                  <ul className="font-mono text-xs text-muted-foreground space-y-0.5">
                    {ch.officialSources.map((src) => (
                      <li key={src}>{src}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <Link
                    href={ch.labHref}
                    className="btn-primary inline-flex items-center gap-1.5 text-xs py-2 px-4"
                  >
                    <span>{ch.labLabel}</span>
                    <ArrowRight size={13} />
                  </Link>
                  {ch.relatedArticleHref && ch.relatedArticleLabel && (
                    <Link
                      href={ch.relatedArticleHref}
                      className="btn-outline inline-flex items-center gap-1.5 text-xs py-2 px-3.5"
                    >
                      <span>{ch.relatedArticleLabel}</span>
                    </Link>
                  )}
                </div>
              </div>
            </section>
          ))}
        </div>

        {/* Rodapé do Guia */}
        <section className="pt-10 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="font-serif text-sm text-muted-foreground max-w-lg">
            Quer consultar uma sigla específica citada neste guia ou ver os cenários animados?
          </p>
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link href="/glossario" className="btn-outline text-xs py-2 px-4">
              Abrir Glossário
            </Link>
            <Link href="/jornada" className="btn-primary text-xs py-2 px-4">
              Abrir Laboratório →
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
