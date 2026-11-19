'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  FlaskConical,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Layers,
} from 'lucide-react';

export interface ModuleTeachDemoHeaderProps {
  backHref?: string;
  backLabel?: string;
  categoryPill: string;
  normativeBadge: string;
  title: string;
  subtitle: string;
  teachConcept: string;
  teachRule: string;
  teachPitfall: string;
  demoSteps: string[];
  acervoQuery: string;
  lab3dHref?: string;
  lab3dLabel?: string;
  productTrackHref?: string;
}

export function ModuleTeachDemoHeader({
  backHref = '/compliance',
  backLabel = 'Voltar para Operação & Simulação',
  categoryPill,
  normativeBadge,
  title,
  subtitle,
  teachConcept,
  teachRule,
  teachPitfall,
  demoSteps,
  acervoQuery,
  lab3dHref = '/jornada',
  lab3dLabel = 'Ver no Lab 3D & Sequência',
  productTrackHref = '/trilhas',
}: ModuleTeachDemoHeaderProps) {
  const handleOpenAcervoAi = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('open-acervo-ai-drawer', {
          detail: { query: acervoQuery },
        })
      );
    }
  };

  return (
    <section className="border-b border-border bg-card/60 py-7 px-6">
      <div className="mx-auto max-w-6xl space-y-5">
        {/* Top bar: back link + badges */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            {backHref && (
              <Link
                href={backHref}
                className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft size={13} /> {backLabel}
              </Link>
            )}
            <span className="text-border">·</span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-primary/10 text-primary border border-primary/25">
              {categoryPill}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono text-muted-foreground bg-muted border border-border">
              {normativeBadge}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleOpenAcervoAi}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:opacity-95 transition-opacity shadow-xs cursor-pointer"
            >
              <Sparkles size={13} />
              Consultar nos 4 Bancos SQLite do Acervo
            </button>
            <Link
              href={lab3dHref}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border bg-background text-foreground hover:border-foreground/40 transition-colors"
            >
              <Layers size={12} className="text-primary" />
              {lab3dLabel}
            </Link>
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="max-w-3xl space-y-1.5">
          <h1
            className="font-semibold text-foreground text-balance"
            style={{
              fontSize: 'clamp(1.55rem, 3.2vw, 2.25rem)',
              lineHeight: 1.15,
              letterSpacing: '-0.025em',
            }}
          >
            {title}
          </h1>
          <p className="font-serif text-sm sm:text-base text-muted-foreground leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Side-by-Side Caixinhas: 1. Ensinar (Esquerda) ⇄ 2. Demonstrar (Direita) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-1">
          {/* Caixinha 1: Ensinar */}
          <div className="lg:col-span-6 rounded-2xl border border-border bg-background p-5 space-y-3 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  <BookOpen size={12} /> 1. Ensinar — O Conceito & Regra
                </span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  Explicação + Fonte Oficial
                </span>
              </div>

              <p className="font-serif text-sm text-foreground/90 leading-relaxed">
                {teachConcept}
              </p>

              <div className="rounded-xl border border-border bg-muted/50 px-3.5 py-2.5 text-xs space-y-1">
                <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Base Normativa & Vigência
                </div>
                <div className="font-mono text-xs text-foreground font-medium">
                  {teachRule}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 px-3.5 py-2.5 flex items-start gap-2.5 text-xs">
              <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-foreground">Armadilha de Produção: </span>
                <span className="text-muted-foreground">{teachPitfall}</span>
              </div>
            </div>
          </div>

          {/* Caixinha 2: Demonstrar */}
          <div className="lg:col-span-6 rounded-2xl border border-border bg-background p-5 space-y-3 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <FlaskConical size={12} /> 2. Demonstrar — Teste Prático na Bancada
                </span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  Passo a passo abaixo
                </span>
              </div>

              <ul className="space-y-2 pt-0.5">
                {demoSteps.map((step, index) => (
                  <li key={index} className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[11px] font-bold shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-2 border-t border-border flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleOpenAcervoAi}
                className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-primary hover:underline cursor-pointer"
              >
                <Sparkles size={12} />
                Auditar &ldquo;{acervoQuery}&rdquo; no SQLite →
              </button>

              <Link
                href={productTrackHref}
                className="inline-flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
              >
                <span>Outras caixinhas por produto</span>
                <ExternalLink size={11} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ModuleTeachDemoHeader;
