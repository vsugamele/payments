'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, ArrowRight, Database, FileText, ShieldCheck, Layers, Calculator, BookOpen } from 'lucide-react';
import { OUTGOING_TABLES, OUTGOING_FLOWS } from '@/data/outgoing-tables-flows';
import { AMEX_OUTGOING_TABLES, DOWNGRADE_SCENARIOS } from '@/app/compliance/outgoing/OutgoingDowngradeAndAmex';

export interface CommandPaletteItem {
  id: string;
  category:
    | 'Módulos & Ferramentas'
    | 'Tabelas de Outgoing'
    | 'Fluxos Operacionais'
    | 'Reports & Conciliação'
    | 'Programas & Tarifas'
    | 'Boletins & Releases 2026/2027';
  badge: string;
  title: string;
  subtitle: string;
  keywords: string;
  href: string;
}

const STATIC_ITEMS: CommandPaletteItem[] = [
  // Módulos Principais
  {
    id: 'mod-outgoing',
    category: 'Módulos & Ferramentas',
    badge: '14 ABAS',
    title: 'Arquitetura de Outgoing: Tabelas, Fluxos, Bitmaps, Reports, Programas, Acervo & Amex',
    subtitle: 'Visa Base II (168B), Elo 26.2/27.1, Mastercard IPM (MTI 1240/1644) e American Express (GNS/CAS)',
    keywords: 'outgoing clearing liquidacao tcr0 tcr2 mti 1240 reg 00 amex bitmap reports programas waiver',
    href: '/compliance/outgoing',
  },
  {
    id: 'mod-boletins',
    category: 'Módulos & Ferramentas',
    badge: '385 ITENS',
    title: 'Central de Boletins, EFs, Mandates & Exportador de Planilha de Release (.csv)',
    subtitle: 'Motor 3 Lentes (Elo 27.1, Visa AI 15915, Visa Direct AFT/OCT, MC Brazil Fees 10.6, GLB 6409.2) + Abas Adquirente/Emissor',
    keywords: 'boletins releases mandates planilha controle adquirente emissor elo 27.1 ai 15915 aes',
    href: '/compliance/boletins',
  },
  {
    id: 'mod-acervo',
    category: 'Módulos & Ferramentas',
    badge: '40.129 ATIVOS',
    title: 'Explorador do Acervo Normativo & 4 Motores MCP (571.849 Páginas + 17.106 Campos)',
    subtitle: 'Busca FTS5, Índice Posicional de Campos PDF, Fee Schedule (454 linhas) e Regulatório BCB/CMN (94 normas)',
    keywords: 'acervo rag sqlite campos tarifas fee schedule bcb cmn resolucao 150 304 ops-workspace-6',
    href: '/acervo',
  },
  {
    id: 'mod-simulador',
    category: 'Módulos & Ferramentas',
    badge: 'INTERCÂMBIO',
    title: 'Simulador de Tarifas de Intercâmbio, MDR & Teto Regulatório BCB',
    subtitle: 'Cálculo comparativo Visa, Mastercard e Elo por MCC, modalidade, canal e faixa de parcelas',
    keywords: 'simulador intercambio mdr debito 0.50 prepago 0.70 credito parcelado',
    href: '/simulador',
  },
  {
    id: 'mod-campos',
    category: 'Módulos & Ferramentas',
    badge: 'ISO 8583',
    title: 'Catálogo de Campos ISO 8583, PDS, TCR e Cruzamento Autorização × Clearing',
    subtitle: 'Mapeamento técnico de Data Elements (DE 002 a DE 127), subcampos e tabelas MPE',
    keywords: 'campos iso 8583 de 22 de 39 de 48 de 55 de 62 de 63 pds tcr',
    href: '/compliance/campos',
  },
  {
    id: 'mod-conciliacao',
    category: 'Módulos & Ferramentas',
    badge: 'D+0 / D+1',
    title: 'Conciliação Financeira, Faturas MCBS (TN3A) & Relatórios VSS',
    subtitle: 'Batimento entre autorização, clearing, agenda SLC/B3 e faturamento de bandeiras',
    keywords: 'conciliacao mcbs tn3a vss 110 120 130 ep747 slc b3 liquidacao',
    href: '/compliance/conciliacao',
  },
  {
    id: 'mod-admin',
    category: 'Módulos & Ferramentas',
    badge: 'COCKPIT',
    title: 'Cockpit Executivo & Catálogo Completo de Módulos Técnicos',
    subtitle: 'Visão consolidada de todas as ferramentas de engenharia, compliance, risco e governança',
    keywords: 'admin cockpit painel catalogo todos modulos',
    href: '/admin',
  },

  // Reports Diários de Outgoing
  {
    id: 'rep-vss-110-120-130',
    category: 'Reports & Conciliação',
    badge: 'VISA VSS',
    title: 'Visa VSS-110 / VSS-120 / VSS-130 / VSS-140 & EP747A/B Raw Data',
    subtitle: 'Settlement Summary, Interchange Value, Qualification Summary (Downgrade EIRF) e Visa Charges',
    keywords: 'vss 110 115 120 130 140 900 ep747 tc46 visa report downgrade',
    href: '/compliance/outgoing',
  },
  {
    id: 'rep-vcx-100a',
    category: 'Reports & Conciliação',
    badge: 'VISA VCX T+0',
    title: 'Visa VCX VX-100A (Rejected Transactions) & VX-111C / VX-120F',
    subtitle: 'Relatório crítico T+0 de transações rejeitadas na pré-crítica do Base II CTF',
    keywords: 'vcx vx-100a vx100a vx-111c vx-120f rejeicao base ii t+0',
    href: '/compliance/outgoing',
  },
  {
    id: 'rep-elo-te01-reg09',
    category: 'Reports & Conciliação',
    badge: 'ELO T+0 / D+1',
    title: 'Elo Retorno de Crítica TE01 (Registro 09) & Agenda do Credenciador Cap. 5/7 (E0..E9)',
    subtitle: 'Diagnóstico de rejeição sintática/semântica 168B e conciliação financeira SLC/B3',
    keywords: 'elo te01 registro 09 reg 09 agenda credenciador e0 e1 e2 e3 e9 slc',
    href: '/compliance/outgoing',
  },
  {
    id: 'rep-mc-t112-ip714010',
    category: 'Reports & Conciliação',
    badge: 'MASTERCARD GCMS',
    title: 'Mastercard T112 (IP857010-AA), IP714010-BB (IRD Downgrade), T461 & MCBS TN3A (GLB 12332.5)',
    subtitle: 'Rejeições de lote IPM, reclassificação de intercâmbio, advisement de liquidação e fatura detalhada',
    keywords: 't112 ip857010 ip714010 ip728010 ip776010 t461 tn3a glb 12332.5 mcbs',
    href: '/compliance/outgoing',
  },

  // Programas & Compliance
  {
    id: 'prog-bram-gbpp',
    category: 'Programas & Tarifas',
    badge: 'COMPLIANCE',
    title: 'Mastercard BRAM & Visa GBPP (Integridade de Marca, MCC & Subcredenciadores)',
    subtitle: 'Prevenção a multas severas por desvio de MCC, agregação irregular e falta de dados de PayFac',
    keywords: 'bram gbpp mcc subcredenciador payfac multa waiver',
    href: '/compliance/outgoing',
  },
  {
    id: 'prog-vamp-vdmp-vfmp-ecm',
    category: 'Programas & Tarifas',
    badge: 'FRAUDE & DISPUTA',
    title: 'Visa VAMP (VDMP / VFMP) & Mastercard ECP / HECM / EFM (Chargeback & Fraude)',
    subtitle: 'Limites de bps/contagem, impacto do 3DS 2.2 Liability Shift, Compelling Evidence 3.0 e RDR/Ethoca',
    keywords: 'vamp vdmp vfmp ecp hecm efm chargeback fraude 3ds ce 3.0',
    href: '/compliance/outgoing',
  },
  {
    id: 'prog-gdip-cedp',
    category: 'Programas & Tarifas',
    badge: 'DATA INTEGRITY',
    title: 'Mastercard GDIP (Edit 30/31 · PDS 0158) & Visa CEDP (Commercial Enhanced Data)',
    subtitle: 'Auditoria de qualidade de mensageria autorizador/clearing e qualificação de cartões corporativos B2B',
    keywords: 'gdip edit 30 edit 31 cedp corporativo b2b data integrity pds 0158',
    href: '/compliance/outgoing',
  },

  // Boletins 2026/2027
  {
    id: 'bol-elo-27-1',
    category: 'Boletins & Releases 2026/2027',
    badge: 'ELO 27.1 (MAI/2027)',
    title: 'Boletim e Pacote de 5 Manuais Elo Release 27.1 (1.401 Páginas)',
    subtitle: 'Header B0 Versão 271, CNPJ Alfanumérico (Reg 01 C45, Reg 02 C150, BIT 107 Conj 57) e Disputas 27.1',
    keywords: 'elo 27.1 271 cnpj alfanumerico reg 01 reg 02 bit 107 maio 2027',
    href: '/compliance/boletins',
  },
  {
    id: 'bol-visa-ai15915',
    category: 'Boletins & Releases 2026/2027',
    badge: 'VISA ABR/2027',
    title: 'Visa AI 15915 (Agentic Commerce & Token Requestor) + CAVV Version 9 (AES)',
    subtitle: 'Regras de autenticação, Token Requestor ID (TRID) e Field 126.9 CAVV v9 no V.I.P. e Base II',
    keywords: 'ai 15915 agentic commerce token requestor cavv v9 aes field 126.9',
    href: '/compliance/boletins',
  },
  {
    id: 'bol-mc-brazil-fees',
    category: 'Boletins & Releases 2026/2027',
    badge: 'MC OUT/2026',
    title: 'Manual de Preço da Mastercard Brasil (m_BrazilFees_pt-br_10_6.pdf — 205 Páginas)',
    subtitle: 'Tabela completa em português dos billing events cobrados no MCBS TN3A (GLB 12332.5)',
    keywords: 'manual preco mastercard brasil brazilfees 205 paginas tn3a glb 12332.5',
    href: '/compliance/boletins',
  },
];

export function GlobalCommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const allItems = useMemo<CommandPaletteItem[]>(() => {
    const dynamicTables: CommandPaletteItem[] = OUTGOING_TABLES.map((tb) => ({
      id: `tb-${tb.id}`,
      category: 'Tabelas de Outgoing',
      badge: `${tb.brand.toUpperCase()} · ${tb.presenceStatus}`,
      title: `${tb.code} — ${tb.title}`,
      subtitle: `${tb.whatItIs.slice(0, 140)}...`,
      keywords: `${tb.code} ${tb.shortCode} ${tb.title} ${tb.brand} ${tb.category} ${tb.fields
        .map((f) => `${f.pos} ${f.name}`)
        .join(' ')}`,
      href: '/compliance/outgoing',
    }));

    const amexTables: CommandPaletteItem[] = AMEX_OUTGOING_TABLES.map((at) => ({
      id: `amex-${at.code}`,
      category: 'Tabelas de Outgoing',
      badge: `AMEX · ${at.status}`,
      title: `Amex ${at.code} — ${at.name}`,
      subtitle: `${at.whatItIs.slice(0, 140)}...`,
      keywords: `amex american express ${at.code} ${at.name} ${at.equivalentVisa} ${at.equivalentMc}`,
      href: '/compliance/outgoing',
    }));

    const dynamicFlows: CommandPaletteItem[] = OUTGOING_FLOWS.map((fl) => ({
      id: `fl-${fl.id}`,
      category: 'Fluxos Operacionais',
      badge: `FLUXO ${fl.number}`,
      title: `Fluxo ${fl.number}: ${fl.title}`,
      subtitle: fl.subtitle,
      keywords: `fluxo ${fl.number} ${fl.title} ${fl.subtitle} ${fl.tag}`,
      href: '/compliance/outgoing',
    }));

    const downgradeItems: CommandPaletteItem[] = DOWNGRADE_SCENARIOS.map((ds) => ({
      id: `dg-${ds.id}`,
      category: 'Programas & Tarifas',
      badge: `${ds.brand.toUpperCase()} DOWNGRADE`,
      title: ds.title,
      subtitle: `${ds.qualifiedTierName} ➔ ${ds.downgradedTierName} (${ds.reportDetected})`,
      keywords: `downgrade calculadora ${ds.brand} ${ds.title} ${ds.outgoingTrigger} ${ds.reportDetected}`,
      href: '/compliance/outgoing',
    }));

    return [...STATIC_ITEMS, ...dynamicTables, ...amexTables, ...dynamicFlows, ...downgradeItems];
  }, []);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allItems
      .filter((item) => {
        if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
        if (!q) return true;
        const hay = `${item.title} ${item.subtitle} ${item.badge} ${item.keywords}`.toLowerCase();
        return q.split(/\s+/).every((tok) => hay.includes(tok));
      })
      .slice(0, 25);
  }, [allItems, query, selectedCategory]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query, selectedCategory]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      } else if (e.key === 'Escape' && open) {
        setOpen(false);
      } else if (open && e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(filteredItems.length - 1, prev + 1));
      } else if (open && e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(0, prev - 1));
      } else if (open && e.key === 'Enter' && filteredItems[selectedIndex]) {
        e.preventDefault();
        const target = filteredItems[selectedIndex];
        setOpen(false);
        router.push(target.href);
      }
    };

    const onCustomOpen = () => setOpen(true);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('open-global-command-palette', onCustomOpen);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('open-global-command-palette', onCustomOpen);
    };
  }, [open, filteredItems, selectedIndex, router]);

  if (!open) return null;

  const categories = [
    'ALL',
    'Módulos & Ferramentas',
    'Tabelas de Outgoing',
    'Fluxos Operacionais',
    'Reports & Conciliação',
    'Programas & Tarifas',
    'Boletins & Releases 2026/2027',
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/75 backdrop-blur-sm flex items-start justify-center pt-14 px-4">
      <div className="w-full max-w-3xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden">
        {/* Search Input Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-800">
          <Search className="w-5 h-5 text-blue-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Busque qualquer Tabela (TC 05, TCR 2, Reg 00, MTI 1240, Amex TDR), Campo (DE 55, PDS 0158), Report (VSS-130, TN3A) ou Boletim (Elo 27.1)..."
            className="w-full bg-transparent text-sm text-white placeholder:text-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="px-2 py-1 rounded text-xs text-slate-400 hover:text-white"
            >
              Limpar
            </button>
          )}
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-slate-800 overflow-x-auto bg-slate-950/60">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap border transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white border-blue-400'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-600'
              }`}
            >
              {cat === 'ALL' ? `Todos (${allItems.length})` : cat}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-800/70">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <p className="text-sm font-bold text-white">
                Nenhum atalho local encontrado para &ldquo;{query}&rdquo;.
              </p>
              <button
                onClick={() => {
                  setOpen(false);
                  router.push('/acervo');
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black inline-flex items-center gap-2"
              >
                <Database className="w-4 h-4" />
                Pesquisar &ldquo;{query}&rdquo; nos 40.129 Documentos do Acervo Normativo →
              </button>
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const active = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setOpen(false);
                    router.push(item.href);
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full px-4 py-3 text-left flex items-center justify-between gap-4 transition-colors ${
                    active ? 'bg-blue-950/50' : 'hover:bg-slate-950/60'
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-blue-500/20 border border-blue-500/30 font-mono text-[11px] font-bold text-blue-300">
                        {item.badge}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400">
                        {item.category}
                      </span>
                    </div>
                    <div className="text-sm font-black text-white truncate">{item.title}</div>
                    <div className="text-xs text-slate-300 truncate">{item.subtitle}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-blue-400 shrink-0" />
                </button>
              );
            })
          )}
        </div>

        {/* Footer Hints */}
        <div className="px-4 py-2.5 border-t border-slate-800 bg-slate-950/90 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span>
              <strong className="text-slate-200 font-mono">↑↓</strong> Navegar
            </span>
            <span>
              <strong className="text-slate-200 font-mono">Enter</strong> Abrir Módulo
            </span>
            <span>
              <strong className="text-slate-200 font-mono">Esc</strong> Fechar
            </span>
          </div>
          <span className="text-emerald-400 font-semibold">
            ● 40.129 Ativos · 17.106 Campos · 385 Releases Indexados
          </span>
        </div>
      </div>
    </div>
  );
}
