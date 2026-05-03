import type { Metadata } from 'next';
import Link from 'next/link';
import {
  DollarSign, Zap, Wifi, Shield, CreditCard,
  RefreshCw, BarChart2, AlertTriangle, Globe,
  ArrowRight, Info,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'MCBS — Tarifas Mastercard Brasil | VS Payments',
  description:
    'Guia completo do Mastercard Consolidated Billing System: Service IDs, tarifas reais para o Brasil, cobrança via IPM 1740 e comparativo com Visa.',
};

// ── helpers ───────────────────────────────────────────────────────────────────

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
        <span className="w-1 h-5 rounded-full bg-primary inline-block" />
        {title}
      </h2>
      {children}
    </section>
  );
}

import { fetchMcbsFees } from '@/lib/api';
import * as Icons from 'lucide-react';

// ── Comparativo MC vs Visa ────────────────────────────────────────────────────

type FeeRow = { categoria: string; mc: string; mcCodigo: string; visa: string; visaCodigo: string; nota?: string };

const FEE_COMPARISON: FeeRow[] = [
  {
    categoria: 'Fee de rede (autenticação doméstica)',
    mc: 'BRL 0.0272 a 0.117 (tiered por valor)',
    mcCodigo: 'AA/AB — 2AB1006x',
    visa: 'Comparável via VisaNet Switching Fee',
    visaCodigo: 'TC10 / VSS',
    nota: 'Mastercard usa 5 tiers por valor; Visa usa fee único por categoria de produto',
  },
  {
    categoria: 'Fee por e-commerce sem autenticação',
    mc: 'BRL 0.00029/BRL + cap BRL 12,00',
    mcCodigo: 'AN — 2AB3006M',
    visa: 'FANF (Fixed Acquirer Network Fee) + VAMP fines',
    visaCodigo: 'VAMP/EFM program',
    nota: 'MC cobra diretamente via MCBS; Visa usa programas de compliance com multas',
  },
  {
    categoria: 'Validação 3DS (SecureCode / Visa Secure)',
    mc: 'BRL 0.015501 por txn autenticada',
    mcCodigo: 'AB — 2AB1790',
    visa: 'Sem fee direto — incluído no fee de rede',
    visaCodigo: '—',
    nota: 'Mastercard cobra separadamente pela validação do CAVV',
  },
  {
    categoria: 'AVS (address verification)',
    mc: 'BRL 0.028682 doméstico / BRL 0.19128 internacional',
    mcCodigo: 'AV — 2AV3006',
    visa: 'Comparável — cobrança via VSS por transação',
    visaCodigo: 'VSS',
    nota: 'Ambas cobram mais para consultas internacionais',
  },
  {
    categoria: 'Tokenização — mapeamento contactless',
    mc: 'BRL 0.019 por txn NFC',
    mcCodigo: 'AB — 2AB1706',
    visa: 'VTS — Visa Token Service (fee incluído no programa)',
    visaCodigo: 'VTS',
    nota: 'MC detalha no MCBS; Visa embute no contrato VTS',
  },
  {
    categoria: 'Tokenização MDES Lite (CNP recorrente)',
    mc: 'BRL 0.0002 por BRL transacionado',
    mcCodigo: 'AB — 2AB2600',
    visa: 'DPAN — incluído no acordo VTS',
    visaCodigo: 'VTS/DPAN',
    nota: 'Visa sem fee por mapping; MC cobra amount-based',
  },
  {
    categoria: 'Conectividade (por bytes)',
    mc: 'BRL 0.0000143/byte — mín. BRL 1.375/semana',
    mcCodigo: 'CF — 2CF1001/2001',
    visa: 'VisaNet Connectivity — mín. semelhante',
    visaCodigo: 'VisaNet',
    nota: 'Ambas cobram por volume de bytes; MC detalha 7 tiers',
  },
  {
    categoria: 'Cobrança de chargeback/representação',
    mc: 'BRL 114.74 por item (emissor)',
    mcCodigo: 'C2 — 2CI201716',
    visa: 'VROL — USD 15–25 por disputa processada',
    visaCodigo: 'VROL/VCR',
    nota: 'MC cobrado em BRL via MCBS; Visa em USD via VROL',
  },
  {
    categoria: 'Automated Billing Updater',
    mc: 'Emissor: BRL 0.046398/reg (mín. BRL 4.400/mês)',
    mcCodigo: 'BU — 2BU6600',
    visa: 'VAU (Visa Account Updater) — modelo similar',
    visaCodigo: 'VAU',
    nota: 'Reduz declínios em recorrência — ambas cobram emissores e adquirentes',
  },
  {
    categoria: 'Anti-Money Laundering (AML)',
    mc: 'BRL 16.000/ano (principal) / BRL 7.200/ano (afiliado)',
    mcCodigo: 'A8 — 2A81000S',
    visa: 'Incluído nos fees de compliance',
    visaCodigo: '—',
    nota: 'ACAMS Risk Assessment — ferramenta de due diligence obrigatória para novos membros',
  },
];

// ── Coleta process ────────────────────────────────────────────────────────────

const COLLECTION_FLOW = [
  {
    step: '1',
    title: 'Evento dispara',
    desc: 'Transação processada na Banknet gera um billing event com o Service ID correspondente',
    color: '#6366f1',
  },
  {
    step: '2',
    title: 'MCBS calcula',
    desc: 'MCBS aplica a tarifa (flat/variable/tiered) ao evento e registra no ledger do participante',
    color: '#0ea5e9',
  },
  {
    step: '3',
    title: 'Ciclo de cobrança',
    desc: 'Diário/semanal/mensal/trimestral conforme o Service ID. A maioria dos fees de autorização é semanal',
    color: '#f59e0b',
  },
  {
    step: '4a',
    title: 'Via IPM 1740 (GCMS)',
    desc: 'Para participantes com conexão GCMS: fee coletado via Fee Collection message MTI 1740 no clearing',
    color: '#10b981',
  },
  {
    step: '4b',
    title: 'Via DDA/ACH',
    desc: 'Para participantes ACH: débito direto na conta DDA. Company ID Mastercard: 1952536378',
    color: '#8b5cf6',
  },
  {
    step: '5',
    title: 'Fatura MCBS',
    desc: 'Relatório consolidado disponível no Mastercard Connect — reconciliação pelo cliente em até 12 meses',
    color: '#ef4444',
  },
];

// ── TOC ───────────────────────────────────────────────────────────────────────

const SECTIONS = [
  { id: 'visao',    label: 'Visão Geral' },
  { id: 'catalogo', label: 'Catálogo de Fees' },
  { id: 'coleta',   label: 'Processo de Cobrança' },
  { id: 'comp',     label: 'MC × Visa' },
];

// ── page ──────────────────────────────────────────────────────────────────────

export default async function MCBSPage() {
  
  // Buscar os grupos do backend
  let serviceGroups: any[] = [];
  try {
    const data = await fetchMcbsFees();
    serviceGroups = data.grupos || [];
  } catch (err) {
    console.error("Erro ao buscar taxas MCBS:", err);
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-6 py-12 pt-28">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
            <Link href="/" className="hover:text-foreground transition-colors">Início</Link>
            <span>/</span>
            <span className="text-foreground">MCBS</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-3">
            MCBS —{' '}
            <span className="text-red-400">Tarifas Mastercard</span>
            {' '}Brasil
          </h1>
          <p className="text-muted-foreground max-w-2xl leading-relaxed">
            O Mastercard Consolidated Billing System centraliza <strong className="text-foreground">todas</strong> as tarifas
            que a MC cobra de emissores e adquirentes — autorização, conectividade,
            tokenização, AVS, chargebacks e mais. Tarifas extraídas do Pricing Guide BR (Nov/2024).
          </p>

          {/* Callout strip */}
          <div className="mt-5 flex flex-wrap gap-3">
            {[
              { label: 'Service IDs cobertos',    value: '8+',          sub: 'categorias no BR' },
              { label: 'Método principal',         value: 'IPM 1740',    sub: 'via GCMS clearing' },
              { label: 'Fee auth doméstico (max)', value: 'BRL 0.117',   sub: 'txn > BRL 90' },
              { label: 'Sem 3DS — cap',            value: 'BRL 12,00',   sub: 'por txn e-comm' },
            ].map(({ label, value, sub }) => (
              <div key={label}
                className="flex items-center gap-2.5 rounded-xl border border-border bg-muted/30 px-4 py-2.5">
                <div>
                  <div className="text-sm font-bold text-foreground leading-none">{value}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{label}</div>
                  <div className="text-[9px] text-muted-foreground/60">{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-10 items-start">

          {/* TOC */}
          <aside className="hidden xl:block w-44 shrink-0 sticky top-28 space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Seções</p>
            {SECTIONS.map((s) => (
              <a key={s.id} href={`#${s.id}`}
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-1">
                {s.label}
              </a>
            ))}
            <div className="pt-4 border-t border-border mt-4 space-y-2">
              <Link href="/comparativo" className="block text-xs text-primary hover:underline">→ Comparativo V×MC</Link>
              <Link href="/mdr"         className="block text-xs text-primary hover:underline">→ Fluxo MDR</Link>
              <Link href="/chargeback"  className="block text-xs text-primary hover:underline">→ Chargeback</Link>
            </div>
          </aside>

          {/* Content */}
          <div className="flex-1 space-y-14 min-w-0">

            {/* ── 1. Visão geral ───────────────────────────────────── */}
            <Section id="visao" title="O que é o MCBS">
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                {[
                  {
                    icon: DollarSign, color: '#ef4444',
                    title: 'Centralização',
                    desc: 'MCBS consolida e centraliza todos os fees Mastercard em uma única fatura por participante (por ICA number).',
                  },
                  {
                    icon: Zap, color: '#f59e0b',
                    title: 'Tipos de fee',
                    desc: 'Flat (valor fixo), variable (depende do serviço), tiered (escala por quantidade ou volume).',
                  },
                  {
                    icon: RefreshCw, color: '#10b981',
                    title: 'Ciclos de cobrança',
                    desc: 'Diário, semanal (autorizações), mensal (conectividade/ABU) e trimestral (compliance ATM).',
                  },
                ].map(({ icon: Icon, color, title, desc }) => (
                  <div key={title} className="rounded-xl border border-border p-4">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
                      style={{ background: `${color}15` }}>
                      <Icon size={15} style={{ color }} />
                    </div>
                    <div className="text-sm font-bold text-foreground mb-1">{title}</div>
                    <div className="text-xs text-muted-foreground leading-relaxed">{desc}</div>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/8 text-sm text-amber-400/90">
                <div className="flex items-start gap-2">
                  <Info size={14} className="mt-0.5 shrink-0" />
                  <div>
                    <strong>Correção e reconciliação:</strong> discrepâncias devem ser reportadas em até 12 meses.
                    Mastercard emite crédito/débito para valores {'>'}BRL 100 por ICA. Identificação no extrato:
                    Company ID <span className="font-mono font-bold">1952536378</span> (Brasil e demais regiões exceto APAC).
                  </div>
                </div>
              </div>
            </Section>

            {/* ── 2. Catálogo ──────────────────────────────────────── */}
            <Section id="catalogo" title="Catálogo de Service IDs — Brasil">
              <p className="text-sm text-muted-foreground mb-6">
                Cada Service ID agrupa billing events relacionados. O código do evento começa com{' '}
                <span className="font-mono font-bold text-foreground">2</span> (evento de cobrança) ou{' '}
                <span className="font-mono font-bold text-foreground">T</span> (tabela de tier).
                Abaixo os grupos mais relevantes para adquirentes e emissores no Brasil.
              </p>

              <div className="space-y-6">
                {serviceGroups.length === 0 ? (
                  <div className="p-4 rounded-xl border bg-muted/20 text-muted-foreground text-center text-sm">
                    Carregando taxas do MCBS do banco de dados ou backend fora do ar...
                  </div>
                ) : (
                  serviceGroups.map((g) => {
                    const Icon = (Icons as any)[g.icon] || Icons.HelpCircle;
                    return (
                      <div key={g.id}
                      className="rounded-xl border overflow-hidden"
                      style={{ borderColor: g.border }}>

                      {/* Group header */}
                      <div className="px-5 py-4 flex items-start gap-3"
                        style={{ background: g.bg }}>
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                          style={{ background: `${g.color}20` }}>
                          <Icon size={16} style={{ color: g.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md"
                              style={{ background: `${g.color}20`, color: g.color }}>
                              {g.id}
                            </span>
                            <span className="text-sm font-bold text-foreground">{g.label}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full border text-muted-foreground"
                              style={{ borderColor: g.border }}>
                              {g.quem}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-mono"
                              style={{ background: `${g.color}15`, color: g.color }}>
                              {g.coleta}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{g.desc}</p>
                        </div>
                      </div>

                      {/* Events table */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-t border-border bg-muted/20">
                              <th className="text-left px-4 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider w-32">Código</th>
                              <th className="text-left px-4 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Evento</th>
                              <th className="text-right px-4 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider w-36">Tarifa BR</th>
                              <th className="text-left px-4 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider w-36">Unidade</th>
                              <th className="text-left px-4 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Obs</th>
                            </tr>
                          </thead>
                          <tbody>
                            {g.eventos.map((e: any, i: number) => (
                              <tr key={i} className={`border-t border-border/60 ${i % 2 === 0 ? '' : 'bg-muted/10'}`}>
                                <td className="px-4 py-2.5 font-mono text-xs" style={{ color: g.color }}>{e.code}</td>
                                <td className="px-4 py-2.5 text-sm text-muted-foreground">{e.nome}</td>
                                <td className="px-4 py-2.5 text-right font-bold text-foreground tabular-nums">{e.valor}</td>
                                <td className="px-4 py-2.5 text-xs text-muted-foreground/70">{e.unidade}</td>
                                <td className="px-4 py-2.5 text-xs text-muted-foreground/60 hidden lg:table-cell">{e.obs ?? '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })
              )}
              </div>
            </Section>

            {/* ── 3. Processo de cobrança ──────────────────────────── */}
            <Section id="coleta" title="Processo de Cobrança — Como o MCBS Coleta">

              <div className="mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-400/90">
                <strong>Dois métodos:</strong> IPM 1740 via GCMS (participantes com conexão clearing) ou DDA/ACH
                (participantes ACH). O método IPM 1740 é mandatório salvo impossibilidade regional.
              </div>

              <div className="grid md:grid-cols-3 gap-3">
                {COLLECTION_FLOW.map((f) => (
                  <div key={f.step} className="rounded-xl border border-border p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white"
                        style={{ background: f.color }}>
                        {f.step}
                      </div>
                      <div className="text-sm font-bold text-foreground">{f.title}</div>
                    </div>
                    <div className="text-xs text-muted-foreground leading-relaxed">{f.desc}</div>
                  </div>
                ))}
              </div>

              {/* IPM 1740 callout */}
              <div className="mt-4 rounded-xl border border-border bg-card p-5">
                <div className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                  <span className="font-mono text-primary">MTI 1740</span>
                  — Fee Collection Message no IPM
                </div>
                <div className="grid sm:grid-cols-3 gap-4 text-xs">
                  {[
                    { campo: 'DE 25 (Processing Code)', valor: '28 = Fee Collection' },
                    { campo: 'DE 63 (Network Data)',    valor: 'Service ID + Event ID' },
                    { campo: 'DE 4 (Amount)',           valor: 'Valor do fee a cobrar' },
                  ].map(({ campo, valor }) => (
                    <div key={campo} className="rounded-lg bg-muted/30 p-3">
                      <div className="font-mono text-[10px] text-muted-foreground mb-1">{campo}</div>
                      <div className="font-bold text-foreground">{valor}</div>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  O MTI 1740 flui pelo GCMS no ciclo de clearing D+1 — aparece no IPM do participante
                  junto com as transações normais. É o equivalente MC ao <span className="font-mono text-foreground">TC10</span> da Visa no BASE II.
                </p>
              </div>
            </Section>

            {/* ── 4. Comparativo MC × Visa ─────────────────────────── */}
            <Section id="comp" title="Fees de Rede — Mastercard (MCBS) × Visa">

              <div className="mb-3 p-3 rounded-lg bg-violet-500/10 border border-violet-500/20 text-xs text-violet-400/90">
                <strong>Filosofia diferente:</strong> Mastercard detalha cada fee individualmente no MCBS com
                Service IDs granulares. Visa tende a embuti-los em programas (FANF, VTS, VAMP) com menor
                visibilidade por evento. Ambas chegam a custos similares no final.
              </div>

              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider w-44">Categoria</th>
                      <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider" style={{ color: '#ef4444' }}>Mastercard (MCBS)</th>
                      <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider" style={{ color: '#3b82f6' }}>Visa (VSS/VTS)</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider hidden xl:table-cell">Nota</th>
                    </tr>
                  </thead>
                  <tbody>
                    {FEE_COMPARISON.map((r, i) => (
                      <tr key={i} className={`border-b border-border/60 ${i % 2 === 0 ? '' : 'bg-muted/20'}`}>
                        <td className="px-4 py-3 font-medium text-foreground align-top text-xs">{r.categoria}</td>
                        <td className="px-4 py-3 align-top">
                          <div className="text-sm text-muted-foreground">{r.mc}</div>
                          <div className="font-mono text-[10px] text-red-400/70 mt-0.5">{r.mcCodigo}</div>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <div className="text-sm text-muted-foreground">{r.visa}</div>
                          <div className="font-mono text-[10px] text-blue-400/70 mt-0.5">{r.visaCodigo}</div>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground/60 align-top hidden xl:table-cell">{r.nota}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>

            {/* Footer */}
            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground mb-4">
                Fonte: <span className="font-mono text-foreground">MCBS_Pricing_Guide_BRA_20241119.pdf</span> — Mastercard Consolidated Billing System Pricing Guide for Brazil, Nov 2024. 761 páginas.
                Tarifas sujeitas a alteração. Consulte seu Global Customer Service representative para confirmação.
              </p>
              <div className="flex flex-wrap gap-4 text-sm">
                <Link href="/comparativo"  className="text-primary hover:underline flex items-center gap-1">Comparativo completo V×MC <ArrowRight size={12} /></Link>
                <Link href="/chargeback"   className="text-primary hover:underline flex items-center gap-1">Ciclo de chargeback <ArrowRight size={12} /></Link>
                <Link href="/mdr"          className="text-primary hover:underline flex items-center gap-1">Fluxo MDR <ArrowRight size={12} /></Link>
                <Link href="/simulador"    className="text-primary hover:underline flex items-center gap-1">Simular intercâmbio <ArrowRight size={12} /></Link>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
