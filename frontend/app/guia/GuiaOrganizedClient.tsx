'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  FlaskConical,
  Sparkles,
  Layers,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { GUIA_CHAPTERS, type GuiaChapter } from '@/data/guia-pagamentos';
import { TeachAndDemonstrateHub } from '@/components/TeachAndDemonstrateHub';

type GuiaBoxMode = 'capitulos_lado_a_lado' | 'bancada_por_produto';

export function GuiaOrganizedClient() {
  const [boxMode, setBoxMode] = useState<GuiaBoxMode>('capitulos_lado_a_lado');
  const [selectedChapterId, setSelectedChapterId] = useState<string>('ALL');

  const visibleChapters: GuiaChapter[] =
    selectedChapterId === 'ALL'
      ? GUIA_CHAPTERS
      : GUIA_CHAPTERS.filter((ch) => ch.id === selectedChapterId);

  const openAcervoAi = (query: string) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('open-acervo-ai-drawer', {
          detail: { query },
        })
      );
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-6 pb-24">
      <div className="pt-8 pb-4 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={13} /> Voltar para a página inicial
        </Link>

        <button
          type="button"
          onClick={() =>
            openAcervoAi(
              'Resumo das regras de Cartão, Clearing, Intercâmbio BCB 304, Pix MED 2.0 e Split Tributário LC 214/2025'
            )
          }
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:opacity-95 transition-opacity cursor-pointer"
        >
          <Sparkles size={13} />
          Perguntar à IA do Acervo (4 SQLites)
        </button>
      </div>

      {/* Cabeçalho */}
      <header className="pb-8 border-b border-border space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <p className="section-eyebrow">Guia escrito & interativo · {GUIA_CHAPTERS.length} capítulos</p>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-primary/10 text-primary border border-primary/25">
            Organizado Lado a Lado: 1. Ensinar ⇄ 2. Demonstrar
          </span>
        </div>

        <h1
          className="font-semibold text-foreground text-balance"
          style={{
            fontSize: 'clamp(1.9rem, 4.2vw, 2.85rem)',
            lineHeight: 1.14,
            letterSpacing: '-0.025em',
          }}
        >
          Como funcionam os pagamentos no Brasil
        </h1>
        <p className="font-serif text-base sm:text-lg text-muted-foreground leading-relaxed max-w-3xl text-pretty">
          Uma compra no cartão, um Pix ou um boleto registrado atravessa várias instituições em
          segundos. Cada capítulo abaixo coloca lado a lado a explicação com a norma oficial (
          <strong className="text-foreground font-semibold">1. Ensinar</strong>) e os pontos práticos
          de produção com atalho direto para o Laboratório 3D e para os 4 bancos SQLite do Acervo (
          <strong className="text-foreground font-semibold">2. Demonstrar</strong>).
        </p>

        {/* Caixinhas de Modo no Topo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          <button
            type="button"
            onClick={() => setBoxMode('capitulos_lado_a_lado')}
            className={`text-left rounded-2xl border p-4 transition-all cursor-pointer ${
              boxMode === 'capitulos_lado_a_lado'
                ? 'border-primary bg-primary/5 shadow-xs'
                : 'border-border bg-card hover:border-foreground/30'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="font-mono text-[11px] uppercase tracking-wider text-primary font-bold">
                Caixinha 01 · 9 Capítulos
              </span>
              <BookOpen size={14} className="text-primary" />
            </div>
            <div className="text-sm font-semibold text-foreground">
              Capítulos Lado a Lado (Ensinar ⇄ Demonstrar)
            </div>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Cartão, Clearing SLC/B3, Intercâmbio, CE 3.0, Pix/MED 2.0, Boleto NPC, Open Finance, KYC e Reforma 2027.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setBoxMode('bancada_por_produto')}
            className={`text-left rounded-2xl border p-4 transition-all cursor-pointer ${
              boxMode === 'bancada_por_produto'
                ? 'border-primary bg-primary/5 shadow-xs'
                : 'border-border bg-card hover:border-foreground/30'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="font-mono text-[11px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold">
                Caixinha 02 · Caso Certo vs Erro
              </span>
              <FlaskConical size={14} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-sm font-semibold text-foreground">
              Bancada Interativa por Produto (6 Caixinhas)
            </div>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Teste na hora o cenário padrão vs falha injetada para cada produto com auditoria SQLite ao vivo.
            </p>
          </button>

          <Link
            href="/jornada"
            className="text-left rounded-2xl border border-border bg-card hover:border-foreground/30 p-4 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
                  Caixinha 03 · Palco 3D & Split
                </span>
                <Layers size={14} className="text-primary" />
              </div>
              <div className="text-sm font-semibold text-foreground">
                Abrir Laboratório 3D & Sequência em ms →
              </div>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Arquitetura isométrica 3D, pacote animado, barra de divisão do dinheiro e Split Tributário LC 214/2025.
              </p>
            </div>
          </Link>
        </div>

        {/* Filtro de Capítulos em Pílulas quando no modo Capítulos */}
        {boxMode === 'capitulos_lado_a_lado' && (
          <nav aria-label="Filtrar capítulos do guia" className="flex flex-wrap gap-2 pt-2">
            <button
              type="button"
              onClick={() => setSelectedChapterId('ALL')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                selectedChapterId === 'ALL'
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-muted-foreground hover:text-foreground'
              }`}
            >
              Todos os {GUIA_CHAPTERS.length} capítulos
            </button>
            {GUIA_CHAPTERS.map((ch) => (
              <button
                key={ch.id}
                type="button"
                onClick={() => setSelectedChapterId(ch.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                  selectedChapterId === ch.id
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-muted-foreground hover:text-foreground hover:border-foreground/40'
                }`}
              >
                <span className="font-mono mr-1.5 opacity-75">{ch.number}</span>
                {ch.shortTitle}
              </button>
            ))}
          </nav>
        )}
      </header>

      {/* Conteúdo conforme Caixinha ativa */}
      {boxMode === 'bancada_por_produto' ? (
        <div className="pt-8">
          <TeachAndDemonstrateHub />
        </div>
      ) : (
        <div className="divide-y divide-border">
          {visibleChapters.map((ch) => (
            <section key={ch.id} id={ch.id} className="py-10 scroll-mt-20 space-y-6">
              {/* Cabeçalho do Capítulo */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1.5 max-w-3xl">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md font-mono text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                      Capítulo {ch.number}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {ch.shortTitle}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight leading-snug">
                    {ch.title}
                  </h2>
                  <p className="font-serif text-base text-muted-foreground leading-relaxed">
                    {ch.subtitle}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      openAcervoAi(`${ch.title} — ${ch.officialSources.join('; ')}`)
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-primary/30 bg-primary/10 text-primary hover:bg-primary/15 transition-colors cursor-pointer"
                  >
                    <Sparkles size={13} />
                    Auditar no Acervo SQLite
                  </button>
                  <Link
                    href={ch.labHref}
                    className="btn-primary inline-flex items-center gap-1.5 text-xs py-2 px-4"
                  >
                    <span>{ch.labLabel}</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>

              {/* Grid Lado a Lado: 1. ENSINAR (Esquerda) ⇄ 2. DEMONSTRAR (Direita) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* Coluna Esquerda: 1. ENSINAR */}
                <div className="lg:col-span-7 rounded-2xl border border-border bg-card p-6 space-y-4 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                        <BookOpen size={12} /> 1. Ensinar — O Fluxo & Explicação
                      </span>
                      <span className="font-mono text-[11px] text-muted-foreground">
                        Leitura guiada
                      </span>
                    </div>

                    {/* Fluxo de atores */}
                    <div className="rounded-xl border border-border bg-muted/60 px-4 py-3 font-mono text-xs text-foreground">
                      <span className="text-muted-foreground mr-2">Cadeia de participantes:</span>
                      {ch.actors}
                    </div>

                    {/* Texto principal em Literata */}
                    <div className="font-serif text-base text-[var(--body-text)] leading-[1.82] space-y-4">
                      {ch.paragraphs.map((p, idx) => (
                        <p key={idx}>{p}</p>
                      ))}
                    </div>
                  </div>

                  {/* Fontes e normas oficiais */}
                  <div className="pt-4 border-t border-border space-y-1.5">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      Fontes e normas oficiais de referência
                    </p>
                    <ul className="font-mono text-xs text-foreground/90 space-y-1">
                      {ch.officialSources.map((src) => (
                        <li key={src} className="flex items-center gap-2">
                          <FileText size={12} className="text-primary shrink-0" />
                          <span>{src}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Coluna Direita: 2. DEMONSTRAR */}
                <div className="lg:col-span-5 rounded-2xl border border-border bg-card p-6 space-y-5 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <FlaskConical size={12} /> 2. Demonstrar — Na Prática & Lab
                      </span>
                      <span className="font-mono text-[11px] text-muted-foreground">
                        Verificação técnica
                      </span>
                    </div>

                    <div className="rounded-xl border border-border bg-muted/40 p-3.5 text-xs text-muted-foreground leading-relaxed">
                      <strong className="text-foreground font-semibold block mb-1">
                        Resumo executivo:
                      </strong>
                      {ch.summary}
                    </div>

                    <div className="space-y-2.5">
                      <p className="section-eyebrow">Pontos essenciais para validar</p>
                      <ul className="space-y-2.5 text-sm text-foreground/90 leading-relaxed">
                        {ch.keyPoints.map((pt, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2.5 rounded-xl border border-border bg-background p-3"
                          >
                            <CheckCircle2
                              size={15}
                              className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5"
                            />
                            <span className="text-xs sm:text-sm leading-relaxed">{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Ações de Demonstração */}
                  <div className="pt-4 border-t border-border space-y-2.5">
                    <Link
                      href={ch.labHref}
                      className="w-full btn-primary inline-flex items-center justify-center gap-2 text-xs py-2.5 px-4"
                    >
                      <FlaskConical size={14} />
                      <span>{ch.labLabel}</span>
                      <ArrowRight size={13} />
                    </Link>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          openAcervoAi(
                            `Quais campos técnicos, tabelas e boletins do acervo regem: ${ch.title}?`
                          )
                        }
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-border bg-background text-foreground hover:border-primary/40 transition-colors cursor-pointer"
                      >
                        <Sparkles size={12} className="text-primary" />
                        <span>Consultar nos 4 SQLites</span>
                      </button>

                      {ch.relatedArticleHref && ch.relatedArticleLabel && (
                        <Link
                          href={ch.relatedArticleHref}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-border bg-background text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <span>{ch.relatedArticleLabel}</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Rodapé do Guia */}
      <section className="pt-10 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <p className="font-serif text-sm text-muted-foreground max-w-lg">
          Quer consultar uma sigla específica citada neste guia ou comparar todos os produtos lado a lado?
        </p>
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Link href="/glossario" className="btn-outline text-xs py-2 px-4">
            Abrir Glossário
          </Link>
          <Link href="/trilhas" className="btn-outline text-xs py-2 px-4">
            Jornada por Produto
          </Link>
          <Link href="/jornada" className="btn-primary text-xs py-2 px-4">
            Abrir Laboratório 3D →
          </Link>
        </div>
      </section>
    </div>
  );
}

export default GuiaOrganizedClient;
