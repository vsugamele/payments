'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Search,
  BarChart2,
  BookOpen,
  ArrowRight,
  Scale,
  CreditCard,
  Cpu,
  DollarSign,
  Shield,
  Landmark,
  Send,
  Globe,
  Smartphone,
  Database,
  Server,
  Sparkles,
} from 'lucide-react';
import { TeachAndDemonstrateHub } from '@/components/TeachAndDemonstrateHub';

type ComplianceTabId =
  | 'teach_demo'
  | 'programas_risco'
  | 'mensageria_outgoing'
  | 'intercambio_releases';

const HEALTH_PROGRAMS = [
  {
    sigla: 'VAMP',
    bandeira: 'Visa',
    threshold: '0,90% (Early Warning 0,65%)',
    whatItIs:
      'Visa Acquirer Monitoring Program (unificou os antigos VFMP de fraude e VDMP de disputas): soma avisos de fraude (TC 40) + chargebacks (TC 15) dividido pelo total de vendas.',
    howToMitigate:
      'Ativar 3DS 2.2 (CAVV v9 ECI 05), Verifi RDR (pré-disputa) e reapresentação com Compelling Evidence 3.0 (CE 3.0).',
    href: '/compliance/risco',
    cta: 'Simular Índice VAMP →',
  },
  {
    sigla: 'ECP / EFM',
    bandeira: 'Mastercard',
    threshold: '1,50% CBK (ECP) · 0,50% Fraude (EFM)',
    whatItIs:
      'Excessive Chargeback Program (ECP) e Excessive Fraud Merchant (EFM): monitoram separadamente o volume mensal de chargebacks (MTI 1442) e de fraudes reportadas no SAFE.',
    howToMitigate:
      'Uso de Mastercard Identity Check (ECI 02), Ethoca Alerts, Network Tokens (MDES) e dossiê de Waiver/RCA.',
    href: '/compliance/outgoing?tab=programs',
    cta: 'Ver Regras ECP / EFM →',
  },
  {
    sigla: 'PED / PEF',
    bandeira: 'Elo',
    threshold: '1,00% Disputas (PED) · 0,50% Fraude (PEF)',
    whatItIs:
      'Programas de Controle de Disputas e Fraudes da Bandeira Elo para credenciadores e subcredenciadores no arranjo doméstico.',
    howToMitigate:
      'Envio correto do Reg 08 (CPF/CNPJ do Subcredenciado no Serviço 10 v26.2) e autenticação Elo 3DS 2.2.',
    href: '/compliance/programas',
    cta: 'Consultar Limiares Elo →',
  },
  {
    sigla: 'BRAM / VIRP',
    bandeira: 'Mastercard / Visa',
    threshold: 'Tolerância Zero (Multa Grave)',
    whatItIs:
      'Business Risk Assessment and Mitigation (BRAM) e Visa Integrity Risk Program (VIRP): auditam práticas ilegais, MCC errado (ex.: jogos/apostas fora do MCC 7995) e agregação irregular.',
    howToMitigate:
      'Triagem rigorosa de MCC, consulta prévia ao MATCH Pro e registro completo de PayFac/Subcredenciados.',
    href: '/compliance/bram',
    cta: 'Abrir Auditor BRAM & MATCH →',
  },
];

export default function ComplianceCommandCenter() {
  const [activeTab, setActiveTab] = useState<ComplianceTabId>('teach_demo');

  const topBoxes: {
    id: ComplianceTabId;
    icon: string;
    badge: string;
    title: string;
    desc: string;
  }[] = [
    {
      id: 'teach_demo',
      icon: '🎓',
      badge: 'ENSINAR ⇄ DEMONSTRAR',
      title: '1. Jornada por Produto (Lado a Lado)',
      desc: 'Aprenda os 6 domínios com explicação simples à esquerda e demonstração Certo (✅) vs Errado (❌) à direita.',
    },
    {
      id: 'programas_risco',
      icon: '🛡️',
      badge: 'VAMP · ECP · BRAM',
      title: '2. Programas de Risco, Fraude & Disputas',
      desc: 'Limiares oficiais (VAMP, ECP, EFM, PED, MATCH, BRAM), Compelling Evidence 3.0 e gerador de Waiver.',
    },
    {
      id: 'mensageria_outgoing',
      icon: '📦',
      badge: 'ISO 8583 · 168B/TLV',
      title: '3. Autorização, Segurança & Outgoing',
      desc: 'Lado a lado: ferramentas de Autorização Online (EMV, 3DS, Tokens) e Clearing (35 Tabelas, Suíte QA e SLC).',
    },
    {
      id: 'intercambio_releases',
      icon: '💰',
      badge: 'BCB 304 · 26.2/27.1',
      title: '4. Intercâmbio, Faturas MCBS/VSS & Releases',
      desc: 'Lado a lado: motores de preço/faturas (1.128 tarifas, PID, Downgrade R$) e governança de boletins/acervo.',
    },
  ];

  return (
    <main className="min-h-screen bg-[#F8FAFC] dark:bg-[#030711] pb-24 text-slate-900 dark:text-slate-100">
      {/* Header Limpo */}
      <section className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90">
        <div className="mx-auto max-w-7xl px-6 py-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800">
              <ShieldCheck size={13} className="text-[#1F3FE0] dark:text-blue-400" />
              <span className="text-[11px] font-black uppercase tracking-wider text-[#1F3FE0] dark:text-blue-300">
                Hub de Compliance &amp; Engenharia • Organizado por Produto (Ensinar ⇄ Demonstrar)
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Compliance, Mensageria, Programas de Risco &amp; Intercâmbio
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
              Navegue pelas <strong>4 caixinhas abaixo</strong> para estudar e demonstrar cada produto lado a lado, auditar programas de monitoria (VAMP/ECP/BRAM) ou abrir os simuladores técnicos.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent('open-acervo-ai-drawer', {
                    detail: { query: 'VAMP Compelling Evidence 3.0 TCR 0 Downgrade' },
                  })
                )
              }
              className="px-3.5 py-2 rounded-full bg-[#1F3FE0] hover:bg-blue-700 text-white text-xs font-black flex items-center gap-1.5 shadow-xs transition-all"
            >
              <Sparkles size={14} />
              <span>🧠 Perguntar à IA do Acervo</span>
            </button>
            <Link
              href="/jornada"
              className="px-3.5 py-2 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-[#1F3FE0] text-xs font-bold text-slate-700 dark:text-slate-200 transition-all"
            >
              🌐 Simulador 3D (10 Trilhas)
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 pt-6 space-y-6">
        {/* 4 Caixinhas Superiores */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {topBoxes.map((b) => {
            const active = activeTab === b.id;
            return (
              <button
                key={b.id}
                onClick={() => setActiveTab(b.id)}
                className={`rounded-2xl p-4 text-left border transition-all flex flex-col justify-between gap-2 ${
                  active
                    ? 'bg-[#1F3FE0] text-white border-[#1F3FE0] shadow-md shadow-blue-600/20'
                    : 'bg-white dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-[#1F3FE0]'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-base">{b.icon}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                        active
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {b.badge}
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm font-black leading-snug">{b.title}</div>
                </div>
                <p
                  className={`text-[11px] leading-snug ${
                    active ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {b.desc}
                </p>
              </button>
            );
          })}
        </div>

        {/* CAIXINHA 1: JORNADA POR PRODUTO (ENSINAR ⇄ DEMONSTRAR) */}
        {activeTab === 'teach_demo' && <TeachAndDemonstrateHub />}

        {/* CAIXINHA 2: PROGRAMAS DE MONITORIA, RISCO & DISPUTAS LADO A LADO */}
        {activeTab === 'programas_risco' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {HEALTH_PROGRAMS.map((prog) => (
                <div
                  key={prog.sigla}
                  className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/95 p-5 flex flex-col justify-between gap-4 shadow-xs"
                >
                  <div className="space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-[#1F3FE0] dark:text-blue-300 font-mono text-xs font-black">
                          {prog.sigla}
                        </span>
                        <span className="text-xs font-bold text-slate-500">{prog.bandeira}</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-mono text-[11px] font-bold">
                        Limiar: {prog.threshold}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 p-3 space-y-1">
                        <div className="font-mono text-[10px] font-black uppercase text-[#1F3FE0] dark:text-blue-400">
                          📘 1. Como Funciona
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                          {prog.whatItIs}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/60 p-3 space-y-1">
                        <div className="font-mono text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-400">
                          🔬 2. Como Mitigar na Prática
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                          {prog.howToMitigate}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() =>
                        window.dispatchEvent(
                          new CustomEvent('open-acervo-ai-drawer', {
                            detail: { query: `${prog.sigla} ${prog.bandeira} threshold multa` },
                          })
                        )
                      }
                      className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-[#1F3FE0]"
                    >
                      🧠 Ver Regra nos PDFs
                    </button>
                    <Link
                      href={prog.href}
                      className="px-3.5 py-1.5 rounded-full bg-[#1F3FE0] hover:bg-blue-700 text-white text-xs font-bold"
                    >
                      {prog.cta}
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Ferramentas de Disputas, Risco e Waivers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                {
                  title: 'Calculadora de Exposição VAMP / ECP',
                  desc: 'Simule se sua carteira está em Early Warning ou Standard.',
                  href: '/compliance/risco',
                },
                {
                  title: 'Disputas & Compelling Evidence 3.0',
                  desc: 'Árvore de decisão de chargebacks e defesa CE 3.0.',
                  href: '/compliance/outgoing?tab=disputes',
                },
                {
                  title: 'Gerador de Dossiê de Waiver & RCA',
                  desc: 'Monte pedido técnico de isenção de multa p/ as bandeiras.',
                  href: '/compliance/outgoing?tab=waivers',
                },
                {
                  title: 'Simulador MATCH Pro & BRAM',
                  desc: 'Regras de listagem de lojistas e prevenção de multas.',
                  href: '/compliance/match',
                },
              ].map((t) => (
                <Link
                  key={t.href}
                  href={t.href}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 hover:border-[#1F3FE0] transition-all flex flex-col justify-between gap-2"
                >
                  <div>
                    <div className="text-xs font-black text-slate-900 dark:text-white">
                      {t.title}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">{t.desc}</p>
                  </div>
                  <span className="font-mono text-xs font-bold text-[#1F3FE0]">Abrir →</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* CAIXINHA 3: AUTORIZAÇÃO ONLINE (ESQUERDA) ⇄ CLEARING & OUTGOING (DIREITA) */}
        {activeTab === 'mensageria_outgoing' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Coluna Esquerda: Autorização Online & Segurança */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/95 p-5 space-y-3 shadow-xs">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="font-mono text-[10px] font-black uppercase text-[#1F3FE0]">
                  LADO A · TEMPO REAL (T+0s)
                </span>
                <h2 className="text-base font-black text-slate-900 dark:text-white">
                  Autorização ISO 8583, EMV, 3DS 2.2 &amp; Tokens
                </h2>
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    title: 'Mapa de Bits (128 Bits Auth 0100/0110 × Clearing)',
                    desc: 'De-Para bit a bit entre a autorização online e o registro de Outgoing.',
                    href: '/compliance/outgoing?tab=bitmap',
                    badge: '128 BITS',
                  },
                  {
                    title: 'Catálogo de Campos ISO 8583, DEs & PDS',
                    desc: 'Consulta rápida de Data Elements, Sub-elementos e tags TLV.',
                    href: '/compliance/campos',
                    badge: 'ISO 8583',
                  },
                  {
                    title: 'Decodificador EMV (TVR Tag 95 · 40 Bits)',
                    desc: 'Inspecione cada bit do Terminal Verification Results e criptograma ARQC.',
                    href: '/compliance/emv',
                    badge: 'CHIP EMV',
                  },
                  {
                    title: '3-D Secure 2.2, ECI & Criptograma CAVV v9 (AES)',
                    desc: 'Regras de Liability Shift e migração do CAVV v7 (3DES) para v9 (AES).',
                    href: '/compliance/3ds',
                    badge: '3DS 2.2',
                  },
                  {
                    title: 'Network Tokens (VTS / MDES / Elo) & Visa DAF',
                    desc: 'Ciclo DPAN + TAVV, Account Updater (VAU/ABU) e aprovação CNP.',
                    href: '/compliance/tokenizacao',
                    badge: 'TOKENS',
                  },
                  {
                    title: 'Tap to Phone (SoftPOS / PCI MPoC) & Retentativas MIT',
                    desc: 'Captura NFC no celular e regras de Hard vs Soft Decline.',
                    href: '/compliance/softpos',
                    badge: 'NFC / MIT',
                  },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 hover:border-[#1F3FE0] p-3.5 flex items-center justify-between gap-3 transition-all"
                  >
                    <div>
                      <div className="text-xs font-black text-slate-900 dark:text-white">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{item.desc}</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950 font-mono text-[10px] font-bold text-[#1F3FE0] dark:text-blue-300 shrink-0">
                      {item.badge} →
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Coluna Direita: Clearing, Outgoing 168B/TLV, Suíte QA & Liquidação SLC */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/95 p-5 space-y-3 shadow-xs">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="font-mono text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400">
                  LADO B · LOTE NOTURNO &amp; LIQUIDAÇÃO (D+0 ➔ D+1)
                </span>
                <h2 className="text-base font-black text-slate-900 dark:text-white">
                  Clearing Outgoing (.CTF/.IPM/.TXT/.CAS), Suíte QA &amp; CIP/SLC
                </h2>
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    title: 'Workbench Outgoing 2.0 (35 Tabelas Separadas + 8 Fluxos)',
                    desc: 'Visa Base II (168B), Mastercard IPM (TLV), Elo Serviço 10 (168B) e Amex CAS.',
                    href: '/compliance/outgoing?tab=tables',
                    badge: '35 TABELAS',
                  },
                  {
                    title: 'Suíte de Engenharia & QA (Gerador .CTF/.IPM, Rejects, 4-Way, 10 CTs)',
                    desc: 'Crie arquivos sintéticos com Luhn, diagnostique EP747/T112 e concilie 4-Way.',
                    href: '/compliance/outgoing?tab=eng_lab',
                    badge: '5 LABS QA',
                  },
                  {
                    title: 'Parser Forense de Lote Real (Mascaramento PCI & Trailer)',
                    desc: 'Suba arquivos reais .CTF/.IPM/.TXT e audite soma e contagem de Trailer.',
                    href: '/compliance/outgoing?tab=validator',
                    badge: 'PARSER PCI',
                  },
                  {
                    title: 'Topologia C4 de 17 Servidores, HSM PayShield & Cabos',
                    desc: 'Onde cada servidor se conecta + Packet Tracer de 10 saltos com Wire Dump.',
                    href: '/arquitetura',
                    badge: '17 SRVs C4',
                  },
                  {
                    title: 'Reports Diários (VSS-110/120, VCX, T112/T140, Rel. 20-02)',
                    desc: 'Guia prático de conciliação dos arquivos de retorno D+0 e D+1.',
                    href: '/compliance/outgoing?tab=reports',
                    badge: '21 REPORTS',
                  },
                  {
                    title: 'Conciliação & Grades CIP/SLC (ASLC026 / 028 / 031 + B3)',
                    desc: 'Unidades de Recebíveis (Res. BCB 264) e liquidação no STR do Bacen.',
                    href: '/compliance/conciliacao',
                    badge: 'SLC / STR',
                  },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 hover:border-emerald-500 p-3.5 flex items-center justify-between gap-3 transition-all"
                  >
                    <div>
                      <div className="text-xs font-black text-slate-900 dark:text-white">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{item.desc}</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 font-mono text-[10px] font-bold text-emerald-700 dark:text-emerald-300 shrink-0">
                      {item.badge} →
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CAIXINHA 4: INTERCÂMBIO, PRODUTOS & FATURAS (ESQUERDA) ⇄ RELEASES, BOLETINS & ACERVO (DIREITA) */}
        {activeTab === 'intercambio_releases' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Coluna Esquerda: Produtos, Intercâmbio, MDR & Faturas */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/95 p-5 space-y-3 shadow-xs">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="font-mono text-[10px] font-black uppercase text-amber-600 dark:text-amber-400">
                  LADO A · PRODUTOS, INTERCÂMBIO &amp; FATURAS
                </span>
                <h2 className="text-base font-black text-slate-900 dark:text-white">
                  Mapa de Produtos (PID), Tetos BCB 304, Downgrade &amp; MCBS/VSS
                </h2>
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    title: 'Atlas Unificado de Produtos das 4 Bandeiras (PID / MC / Elo / Amex)',
                    desc: 'Equivalência de 26 plásticos, tetos BCB 304 (0,50%/0,70%) e tabelas ARDEF/MPE.',
                    href: '/mapa/produtos',
                    badge: '4 MAPAS',
                  },
                  {
                    title: 'Calculadora Financeira de Downgrade (R$) & 4ª Bandeira Amex',
                    desc: 'Quantifique a perda mensal por Downgrade EIRF/Standard e veja as 7 tabelas CAS.',
                    href: '/compliance/outgoing?tab=downgrade_amex',
                    badge: 'R$ + AMEX',
                  },
                  {
                    title: 'Motor Determinístico de Provisionamento (141 Regras Waterfall)',
                    desc: 'Trace cláusula a cláusula mostrando qual regra qualificou a transação.',
                    href: '/compliance/provisionamento',
                    badge: '141 REGRAS',
                  },
                  {
                    title: 'Tarifas Reais (1.128 Alíquotas + MCC Incentivado)',
                    desc: 'Consulta completa das alíquotas de intercâmbio por bandeira, produto e parcelas.',
                    href: '/compliance/tarifas-reais',
                    badge: '1.128 TAXAS',
                  },
                  {
                    title: 'Auditor de Faturas MCBS (TN3A) & 454 Scheme Fees (VSS BRL)',
                    desc: 'Auditoria das linhas de cobrança das bandeiras (incluindo Visa em BRL maio/2026).',
                    href: '/mcbs',
                    badge: 'MCBS / VSS',
                  },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 hover:border-amber-500 p-3.5 flex items-center justify-between gap-3 transition-all"
                  >
                    <div>
                      <div className="text-xs font-black text-slate-900 dark:text-white">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{item.desc}</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950 font-mono text-[10px] font-bold text-amber-700 dark:text-amber-300 shrink-0">
                      {item.badge} →
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Coluna Direita: Governança de Boletins, Releases 2026/2027 & Acervo SQLite */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/95 p-5 space-y-3 shadow-xs">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="font-mono text-[10px] font-black uppercase text-purple-600 dark:text-purple-400">
                  LADO B · RELEASES 2026/2027, REGULATÓRIO &amp; ACERVO
                </span>
                <h2 className="text-base font-black text-slate-900 dark:text-white">
                  Boletins (3 Lentes), Diff 25.2 ➔ 27.1, Facilitadores &amp; 40k PDFs
                </h2>
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    title: 'Hub de Releases & Boletins (Governança "Nada é Escolhido em Silêncio")',
                    desc: '385 itens de release, aba Adquirente × Emissor, detector de conflitos e trava de vigência.',
                    href: '/compliance/boletins',
                    badge: '385 RELEASES',
                  },
                  {
                    title: 'Motor de Diff de Releases (2025.2 ➔ 2026.1 ➔ 2026.2 ➔ 2027.1)',
                    desc: 'Comparativo estilo Git Diff (Antes [-] vs Depois [+]) de layouts e tarifas.',
                    href: '/compliance/outgoing?tab=eng_lab',
                    badge: 'GIT DIFF',
                  },
                  {
                    title: 'Central do Acervo Normativo (4 Bancos SQLite + 17.106 Campos)',
                    desc: 'Busca auditável por SHA-256 e página física do PDF nos 40.129 ativos.',
                    href: '/acervo',
                    badge: '40k PDFs',
                  },
                  {
                    title: 'Subcredenciadores, PayFac & Regulação BCB (CP 522 / Elo Reg 08)',
                    desc: 'Requisitos de identificação fiscal do sublojista nas 4 bandeiras.',
                    href: '/compliance/subcredenciadores',
                    badge: 'PAYFAC',
                  },
                  {
                    title: 'Doc Studio & Editor Executivo com Copilot conectado ao Acervo',
                    desc: 'Gere especificações funcionais e pareceres com lastro automático no SQLite.',
                    href: '/editor',
                    badge: 'DOC STUDIO',
                  },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 hover:border-purple-500 p-3.5 flex items-center justify-between gap-3 transition-all"
                  >
                    <div>
                      <div className="text-xs font-black text-slate-900 dark:text-white">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{item.desc}</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-950 font-mono text-[10px] font-bold text-purple-700 dark:text-purple-300 shrink-0">
                      {item.badge} →
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
