'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ExternalLink,
  BookOpen,
  FlaskConical,
  Sparkles,
  Scale,
  FileCode2,
  Library,
  Layers,
} from 'lucide-react';

interface BcbNormItem {
  code: string;
  title: string;
  note: string;
  url: string;
  demoHref: string;
  publicDemoHref?: string;
  demoLabel: string;
  acervoQuery: string;
}

const BCB_NORMS: BcbNormItem[] = [
  {
    code: 'Lei nº 12.865/2013',
    title: 'Marco legal dos arranjos e instituições de pagamento',
    note: 'A base de tudo que veio depois no Brasil: abriu espaço regulatório para instituições de pagamento, subcredenciadores e a supervisão do Banco Central sobre as bandeiras.',
    url: 'https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2013/lei/l12865.htm',
    demoHref: '/jornada?track=cartao',
    demoLabel: 'Ver modelo 4 partes vs PayFac no Lab 3D',
    acervoQuery: 'Lei 12.865/2013 arranjos de pagamento subcredenciadores e instituições de pagamento',
  },
  {
    code: 'Resolução BCB nº 304/2023',
    title: 'Tetos de intercâmbio no débito (0,50%) e pré-pago (0,70%)',
    note: 'Leitura obrigatória para qualquer discussão de precificação ou MDR no Brasil. Define o limite que mudou a economia do débito e dos cartões pré-pagos.',
    url: 'https://www.bcb.gov.br/estabilidadefinanceira/exibenormativo?tipo=Resolu%C3%A7%C3%A3o%20BCB&numero=304',
    demoHref: '/simulador',
    publicDemoHref: '/jornada?track=cartao',
    demoLabel: 'Simular teto 0,50% e divisão do MDR',
    acervoQuery: 'Resolução BCB 304/2023 teto intercâmbio débito 0,50% e pré-pago 0,70%',
  },
  {
    code: 'Resolução BCB nº 264/2022',
    title: 'Registro obrigatório de recebíveis de cartão (B3, CERC e TAG)',
    note: 'Explica a mecânica das Unidades de Recebíveis (URs), interoperabilidade entre registradoras e por que a agenda deixou de ficar presa em um único domicílio bancário.',
    url: 'https://www.bcb.gov.br/estabilidadefinanceira/exibenormativo?tipo=Resolu%C3%A7%C3%A3o%20BCB&numero=264',
    demoHref: '/jornada?track=clearing_slc',
    demoLabel: 'Simular UR e Liquidação SLC/B3 no Lab 3D',
    acervoQuery: 'Resolução BCB 264/2022 registro de recebíveis UR B3 CERC TAG e grade SLC ASLC026',
  },
  {
    code: 'Resolução BCB nº 406/2024',
    title: 'Open Finance — Jornada Sem Redirecionamento (JSR)',
    note: 'A norma que viabilizou o Pix por aproximação em carteiras digitais sem empurrar o cliente para o app do banco na hora de pagar.',
    url: 'https://www.bcb.gov.br/estabilidadefinanceira/exibenormativo?tipo=Resolu%C3%A7%C3%A3o%20BCB&numero=406',
    demoHref: '/jornada?track=pix_auto_jsr',
    demoLabel: 'Testar Pix por Aproximação JSR (FIDO2) no Lab 3D',
    acervoQuery: 'Resolução BCB 406/2024 Jornada Sem Redirecionamento JSR FIDO2 Pix por aproximação',
  },
  {
    code: 'Resolução BCB nº 493/2025',
    title: 'MED 2.0 — rastreamento multinível de fraudes no Pix',
    note: 'Evolução direta da segurança do Pix: sai do bloqueio isolado na primeira conta e passa a percorrer o grafo de transferências seguintes.',
    url: 'https://www.bcb.gov.br/estabilidadefinanceira/exibenormativo?tipo=Resolu%C3%A7%C3%A3o%20BCB&numero=493',
    demoHref: '/jornada?track=med2_devolucao',
    demoLabel: 'Inspecionar Grafo Multinível MED 2.0 no Lab 3D',
    acervoQuery: 'Resolução BCB 493/2025 MED 2.0 rastreamento multinível de fraude Pix',
  },
  {
    code: 'Lei Complementar nº 214/2025',
    title: 'Reforma Tributária — Split Payment (Arts. 31 a 35)',
    note: 'O texto que todo time de liquidação, agenda de recebíveis e captura precisa ler antes de 2027 — em especial o Art. 34 sobre base livre para cessão e antecipação.',
    url: 'https://www.planalto.gov.br/ccivil_03/leis/lcp/Lcp214.htm',
    demoHref: '/jornada?track=regras_2027',
    demoLabel: 'Simular Split Tributário CBS/IBS 2027+ no Lab 3D',
    acervoQuery: 'Lei Complementar 214/2025 Art 31 a 35 Split Payment Reforma Tributária CBS IBS recebíveis',
  },
];

interface ManualItem {
  org: string;
  title: string;
  note: string;
  demoHref: string;
  publicDemoHref: string;
  demoLabel: string;
  publicDemoLabel: string;
  acervoQuery: string;
}

const TECHNICAL_MANUALS: ManualItem[] = [
  {
    org: 'Visa',
    title: 'Visa Core Rules, Base II Clearing & VSS User Guide',
    note: 'O trio que resolve 90% dos incidentes de autorização, rejeição no clearing (.CTF de 168 bytes) e auditoria de faturas VSS-110/120.',
    demoHref: '/compliance/outgoing',
    publicDemoHref: '/jornada?track=clearing_slc',
    demoLabel: 'Inspecionar registros TC05/TC33 e VSS no Outgoing & Lab',
    publicDemoLabel: 'Ver Clearing Base II e Liquidação no Lab 3D',
    acervoQuery: 'Visa Base II TC05 TC33 168 bytes EP747 e relatórios VSS-110 VSS-120',
  },
  {
    org: 'Mastercard',
    title: 'Transaction Processing Rules (TPR), GCMS IPM & MCBS',
    note: 'Onde ficam as regras de processamento, a estrutura TLV/PDS do IPM e o mapeamento de cobranças e eventos do Consolidated Billing System.',
    demoHref: '/mcbs',
    publicDemoHref: '/guia#intercambio',
    demoLabel: 'Abrir Guia MCBS & Eventos MTI 1740 / IPM',
    publicDemoLabel: 'Ler Intercâmbio, MCBS e Faturas no Guia',
    acervoQuery: 'Mastercard GCMS IPM DE048 PDS 0158 IRD T112 e eventos MCBS MTI 1740',
  },
  {
    org: 'Elo',
    title: 'Manual de Autorização, Serviço 10 (Liquidação) e Guia TQS',
    note: 'Referência prática para certificação, leitura de registros de crítica (Reg 09 / TE01) e alinhamento entre emissores e credenciadores domésticos.',
    demoHref: '/compliance/outgoing',
    publicDemoHref: '/trilhas',
    demoLabel: 'Testar layout Elo Serviço 10 (TE01/Reg 09) no Outgoing',
    publicDemoLabel: 'Ver Caso Certo vs Erro de Clearing em Por Produto',
    acervoQuery: 'Elo Serviço 10 liquidação registro 00 01 02 09 crítica TE01 e tabela MCC',
  },
  {
    org: 'EMVCo',
    title: 'EMV 3-D Secure 2.2, Book 3 (TVR Tag 95) & Tokenisation',
    note: 'Ajuda a entender o porquê de cada campo de autenticação (ECI, CAVV/TAVV, UCAF, TVR 5 bytes) em vez de decorar tabela sem contexto.',
    demoHref: '/compliance/3ds',
    publicDemoHref: '/jornada?track=contestacao_ce3',
    demoLabel: 'Testar Matriz 3DS Liability Shift & Decodificador EMV',
    publicDemoLabel: 'Ver 3DS, Liability Shift e CE 3.0 no Lab 3D',
    acervoQuery: 'EMV 3DS 2.2 Liability Shift ECI 05 02 CAVV AAV e EMV Book 3 TVR Tag 95',
  },
];

const BOOKS = [
  {
    title: 'Team Topologies',
    author: 'Matthew Skelton & Manuel Pais',
    note: 'Excelente para pensar como separar times que mexem em core crítico de liquidação de times que iteram rápido em canais e conversão.',
    application: 'Aplicação prática: separar Stream-Aligned Squads (Checkout/Pix) de Platform Teams (Core Switch ISO 8583 / Clearing Engine).',
  },
  {
    title: 'Extreme Ownership',
    author: 'Jocko Willink & Leif Babin',
    note: 'Direto ao ponto sobre responsabilidade de liderança: em operação de pagamentos, quando algo quebra entre áreas, apontar culpado nunca resolve o incidente.',
    application: 'Aplicação prática: war-rooms de rejeição de lote T+0 ou enquadramento VAMP/ECP — dono único ponta a ponta da captura à tesouraria.',
  },
  {
    title: 'Management 3.0',
    author: 'Jurgen Appelo',
    note: 'Boa base para liderar times transversais sem microgerenciamento — especialmente quando produto, engenharia, risco e operações precisam remar na mesma direção.',
    application: 'Aplicação prática: delegar decisões de produto com guardrails claros de compliance (Nada é Escolhido em Silêncio).',
  },
  {
    title: 'Designing Data-Intensive Applications',
    author: 'Martin Kleppmann',
    note: 'Mesmo para quem não programa todo dia, ajuda a conversar de igual para igual com arquitetura sobre consistência, filas, idempotência e conciliação.',
    application: 'Aplicação prática: chaves de idempotência em retentativas (DE 37/ARN/EndToEndId) e conciliação de 3 pontas sem perda ou duplicidade.',
  },
];

type ShelfFilter = 'ALL' | 'bcb' | 'manuais' | 'livros';

export function LeiturasOrganizedClient() {
  const [shelf, setShelf] = useState<ShelfFilter>('ALL');
  const [isOwner, setIsOwner] = useState<boolean>(false);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      setIsOwner(
        document.cookie.split(';').some((c) => c.trim().startsWith('vs_internal_pass=1'))
      );
    }
  }, []);

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
              'Quais manuais oficiais Visa, Mastercard, Elo e resoluções do BCB estão indexados nos 4 bancos SQLite?'
            )
          }
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:opacity-95 transition-opacity cursor-pointer"
        >
          <Sparkles size={13} />
          {isOwner ? 'Consultar Bibliografia no Acervo IA (SQLite)' : 'Perguntar à IA sobre estas normas'}
        </button>
      </div>

      <header className="pb-8 border-b border-border space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <p className="section-eyebrow">Curadoria Técnica & Regulatória</p>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-primary/10 text-primary border border-primary/25">
            1. Ensinar (Por que ler) ⇄ 2. Demonstrar (Testar no Workbench)
          </span>
        </div>

        <h1
          className="font-semibold text-foreground text-balance"
          style={{
            fontSize: 'clamp(1.9rem, 4vw, 2.75rem)',
            lineHeight: 1.15,
            letterSpacing: '-0.025em',
          }}
        >
          Leituras e referências que uso na operação
        </h1>
        <p className="font-serif text-base text-muted-foreground leading-relaxed max-w-3xl">
          Normas do Banco Central, manuais técnicos das bandeiras e livros de arquitetura e liderança
          que voltam para a mesa com frequência — cada um conectado ao simulador onde aquela regra
          ganha vida e aos 4 bancos SQLite do Acervo.
        </p>

        {/* 4 Caixinhas de Prateleira */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          <button
            type="button"
            onClick={() => setShelf('ALL')}
            className={`text-left rounded-2xl border p-4 transition-all cursor-pointer ${
              shelf === 'ALL'
                ? 'border-primary bg-primary/5 shadow-xs'
                : 'border-border bg-card hover:border-foreground/30'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="font-mono text-[11px] uppercase tracking-wider text-primary font-bold">
                Todas · 14 Referências
              </span>
              <Layers size={14} className="text-primary" />
            </div>
            <div className="text-sm font-semibold text-foreground">
              Visão Completa Lado a Lado
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Normas BCB + Manuais de Rede + Livros de Engenharia e Liderança.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setShelf('bcb')}
            className={`text-left rounded-2xl border p-4 transition-all cursor-pointer ${
              shelf === 'bcb'
                ? 'border-primary bg-primary/5 shadow-xs'
                : 'border-border bg-card hover:border-foreground/30'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="font-mono text-[11px] uppercase tracking-wider text-blue-600 dark:text-blue-400 font-bold">
                Prateleira 01 · {BCB_NORMS.length} Normas
              </span>
              <Scale size={14} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-sm font-semibold text-foreground">
              Regulação BCB & LC 214/2025
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Lei 12.865, BCB 304, BCB 264, JSR 406, MED 2.0 493 e Split 2027+.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setShelf('manuais')}
            className={`text-left rounded-2xl border p-4 transition-all cursor-pointer ${
              shelf === 'manuais'
                ? 'border-primary bg-primary/5 shadow-xs'
                : 'border-border bg-card hover:border-foreground/30'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="font-mono text-[11px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold">
                Prateleira 02 · {TECHNICAL_MANUALS.length} Redes
              </span>
              <FileCode2 size={14} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-sm font-semibold text-foreground">
              Manuais Técnicos & Rulebooks
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Visa Base II/VSS, Mastercard IPM/MCBS, Elo Serviço 10 e EMVCo.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setShelf('livros')}
            className={`text-left rounded-2xl border p-4 transition-all cursor-pointer ${
              shelf === 'livros'
                ? 'border-primary bg-primary/5 shadow-xs'
                : 'border-border bg-card hover:border-foreground/30'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="font-mono text-[11px] uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold">
                Prateleira 03 · {BOOKS.length} Livros
              </span>
              <Library size={14} className="text-amber-600 dark:text-amber-400" />
            </div>
            <div className="text-sm font-semibold text-foreground">
              Operação, Times & Sistemas
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Team Topologies, Extreme Ownership, Management 3.0 e DDIA.
            </p>
          </button>
        </div>
      </header>

      {/* Prateleira 1: Normas do BCB */}
      {(shelf === 'ALL' || shelf === 'bcb') && (
        <section className="py-10 border-b border-border space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <p className="section-eyebrow mb-1">01 · Regulação no Brasil</p>
              <h2 className="text-xl font-semibold text-foreground">
                Normas oficiais para manter nos favoritos (Ensinar ⇄ Demonstrar)
              </h2>
            </div>
            <Link
              href="/regulatorio"
              className="inline-flex items-center gap-2 rounded-xl border border-teal-500/35 bg-teal-500/10 px-3.5 py-2 text-xs font-semibold text-teal-800 dark:text-teal-300 hover:bg-teal-500/15 transition-colors shrink-0"
            >
              <Scale size={14} />
              <span>Abrir Mapa Regulatório Completo (202 Atos BCB/CMN) →</span>
            </Link>
          </div>

          <div className="space-y-4">
            {BCB_NORMS.map((item) => (
              <div
                key={item.code}
                className="rounded-2xl border border-border bg-card p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch"
              >
                {/* Esquerda: 1. Ensinar */}
                <div className="lg:col-span-7 space-y-2.5 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                        <BookOpen size={11} /> 1. Ensinar
                      </span>
                      <span className="font-mono text-xs font-semibold text-foreground">
                        {item.code}
                      </span>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-mono text-[11px] text-primary hover:underline"
                      >
                        Texto oficial no Planalto/BCB <ExternalLink size={11} />
                      </a>
                    </div>
                    <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                    <p className="font-serif text-sm text-[var(--body-text)] leading-relaxed">
                      {item.note}
                    </p>
                  </div>
                </div>

                {/* Direita: 2. Demonstrar */}
                <div className="lg:col-span-5 rounded-xl border border-border bg-background p-4 flex flex-col justify-between gap-3">
                  <div className="space-y-1.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <FlaskConical size={11} /> 2. Demonstrar na Bancada
                    </span>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Veja como a regra de <strong className="text-foreground">{item.code}</strong> altera o fluxo de mensagens, o teto de tarifas ou a liquidação.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row lg:flex-col gap-2">
                    <Link
                      href={isOwner ? item.demoHref : item.publicDemoHref || item.demoHref}
                      className="btn-primary inline-flex items-center justify-center gap-1.5 text-xs py-2 px-3"
                    >
                      <FlaskConical size={13} />
                      <span>{item.demoLabel}</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => openAcervoAi(item.acervoQuery)}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border bg-card text-foreground hover:border-primary/40 transition-colors cursor-pointer"
                    >
                      <Sparkles size={12} className="text-primary" />
                      <span>{isOwner ? 'Cruzar nos 4 SQLites do Acervo' : 'Perguntar à IA'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Prateleira 2: Manuais técnicos */}
      {(shelf === 'ALL' || shelf === 'manuais') && (
        <section className="py-10 border-b border-border space-y-6">
          <div>
            <p className="section-eyebrow mb-1">02 · Fonte primária das redes</p>
            <h2 className="text-xl font-semibold text-foreground">
              Manuais que realmente resolvem incidente (Ensinar ⇄ Demonstrar)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {TECHNICAL_MANUALS.map((m) => (
              <div
                key={m.title}
                className="rounded-2xl border border-border bg-card p-5 flex flex-col justify-between gap-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-md font-mono text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                      {m.org}
                    </span>
                    <span className="font-mono text-[10px] uppercase text-muted-foreground">
                      1. Ensinar + 2. Demonstrar
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-foreground leading-snug">
                    {m.title}
                  </h3>
                  <p className="font-serif text-sm text-muted-foreground leading-relaxed">
                    {m.note}
                  </p>
                </div>

                <div className="pt-3 border-t border-border flex flex-col sm:flex-row gap-2">
                  <Link
                    href={isOwner ? m.demoHref : m.publicDemoHref}
                    className="flex-1 btn-primary inline-flex items-center justify-center gap-1.5 text-xs py-2 px-3"
                  >
                    <FlaskConical size={12} />
                    <span>{isOwner ? m.demoLabel : m.publicDemoLabel}</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => openAcervoAi(m.acervoQuery)}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-border bg-background text-foreground hover:border-primary/40 transition-colors cursor-pointer"
                  >
                    <Sparkles size={12} className="text-primary" />
                    <span>{isOwner ? 'SQLite' : 'IA'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Prateleira 3: Livros */}
      {(shelf === 'ALL' || shelf === 'livros') && (
        <section className="pt-10 space-y-6">
          <div>
            <p className="section-eyebrow mb-1">03 · Operação, times e sistemas</p>
            <h2 className="text-xl font-semibold text-foreground">
              Livros que ajudam fora do rulebook
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {BOOKS.map((book) => (
              <div
                key={book.title}
                className="rounded-2xl border border-border bg-card p-5 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base font-semibold text-foreground">{book.title}</h3>
                    <span className="font-mono text-xs text-muted-foreground">{book.author}</span>
                  </div>
                  <p className="font-serif text-sm text-[var(--body-text)] leading-relaxed">
                    {book.note}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-muted/50 px-3.5 py-2.5 text-xs text-foreground/90">
                  {book.application}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default LeiturasOrganizedClient;
