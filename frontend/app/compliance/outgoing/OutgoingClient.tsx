'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  OUTGOING_BRANDS,
  OUTGOING_FLOWS,
  OUTGOING_MATRIX,
  OUTGOING_MATRIX_COLUMNS,
  OUTGOING_TABLES,
  OutgoingBrandId,
  OutgoingFieldSpec,
  OutgoingTableSpec,
} from '@/data/outgoing-tables-flows';
import { sendToDocStudio } from '@/lib/docStudioBridge';
import {
  InteractiveRuleSandbox,
  InteractiveSwimlaneDiagram,
  InteractiveWireInspector,
  OutgoingArchitectureBlueprint,
} from './OutgoingDeveloperDiagrams';

type MainTab = 'tables' | 'flows' | 'matrix' | 'sandbox';
type TablePresenceFilter = 'ALL' | 'Obrigatório' | 'Condicional';
type FieldStatusFilter = 'ALL' | 'M' | 'C';

const BRAND_ORDER: OutgoingBrandId[] = ['visa', 'elo', 'mastercard'];

const BRAND_STYLES: Record<
  OutgoingBrandId,
  {
    pillActive: string;
    pillInactive: string;
    border: string;
    bgSoft: string;
    textAccent: string;
    badgeBg: string;
  }
> = {
  visa: {
    pillActive: 'bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-950/50',
    pillInactive: 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-blue-500/50',
    border: 'border-blue-500/30',
    bgSoft: 'bg-blue-950/20',
    textAccent: 'text-blue-400',
    badgeBg: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  },
  elo: {
    pillActive: 'bg-amber-500 text-slate-950 border-amber-300 shadow-lg shadow-amber-950/50 font-black',
    pillInactive: 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-amber-500/50',
    border: 'border-amber-500/30',
    bgSoft: 'bg-amber-950/20',
    textAccent: 'text-amber-400',
    badgeBg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  },
  mastercard: {
    pillActive: 'bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-950/50',
    pillInactive: 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-emerald-500/50',
    border: 'border-emerald-500/30',
    bgSoft: 'bg-emerald-950/20',
    textAccent: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  },
};

function parseNumericSize(sizeStr: string): number {
  const match = sizeStr.match(/(\d+)/);
  if (!match) return 8;
  const n = parseInt(match[1], 10);
  return Number.isNaN(n) ? 8 : Math.max(3, Math.min(n, 60));
}

export default function OutgoingClient() {
  const [selectedBrand, setSelectedBrand] = useState<OutgoingBrandId>('elo');
  const [activeTab, setActiveTab] = useState<MainTab>('tables');
  const [showBlueprint, setShowBlueprint] = useState<boolean>(true);

  // State for Tab 1 (Separated Tables)
  const [tablePresenceFilter, setTablePresenceFilter] = useState<TablePresenceFilter>('ALL');
  const [tableSearch, setTableSearch] = useState('');
  const [selectedTableIdByBrand, setSelectedTableIdByBrand] = useState<Record<OutgoingBrandId, string>>({
    visa: 'visa-tcr0',
    elo: 'elo-reg00',
    mastercard: 'mc-1240-base',
  });
  const [fieldStatusFilter, setFieldStatusFilter] = useState<FieldStatusFilter>('ALL');
  const [fieldSearch, setFieldSearch] = useState('');
  const [highlightedFieldNo, setHighlightedFieldNo] = useState<string | null>(null);

  // State for Tab 2 (Separated Flows)
  const [selectedFlowId, setSelectedFlowId] = useState<string>('flow-1-pos-chip');
  const [compareAllBrandsInFlow, setCompareAllBrandsInFlow] = useState<boolean>(false);

  // State for Tab 3 (Matrix)
  const [selectedMatrixCell, setSelectedMatrixCell] = useState<{
    tableId: string;
    tableCode: string;
    tableName: string;
    colId: string;
    colLabel: string;
    status: 'M' | 'C' | 'O' | '-';
    note: string;
  } | null>(null);

  const brandMeta = OUTGOING_BRANDS[selectedBrand];
  const brandStyle = BRAND_STYLES[selectedBrand];

  const brandTables = useMemo(
    () => OUTGOING_TABLES.filter((t) => t.brand === selectedBrand),
    [selectedBrand]
  );

  const filteredTables = useMemo(() => {
    return brandTables.filter((t) => {
      if (tablePresenceFilter !== 'ALL' && t.presenceStatus !== tablePresenceFilter) {
        return false;
      }
      if (tableSearch.trim()) {
        const q = tableSearch.toLowerCase();
        const matchHeader =
          t.code.toLowerCase().includes(q) ||
          t.title.toLowerCase().includes(q) ||
          t.subtitle.toLowerCase().includes(q) ||
          t.whatItIs.toLowerCase().includes(q);
        const matchField = t.fields.some(
          (f) =>
            f.name.toLowerCase().includes(q) ||
            f.pos.toLowerCase().includes(q) ||
            f.description.toLowerCase().includes(q)
        );
        return matchHeader || matchField;
      }
      return true;
    });
  }, [brandTables, tablePresenceFilter, tableSearch]);

  const activeTable: OutgoingTableSpec = useMemo(() => {
    const currentId = selectedTableIdByBrand[selectedBrand];
    return (
      brandTables.find((t) => t.id === currentId) ||
      filteredTables[0] ||
      brandTables[0]
    );
  }, [brandTables, filteredTables, selectedBrand, selectedTableIdByBrand]);

  const filteredFields: OutgoingFieldSpec[] = useMemo(() => {
    if (!activeTable) return [];
    return activeTable.fields.filter((f) => {
      if (fieldStatusFilter !== 'ALL' && f.status !== fieldStatusFilter) {
        return false;
      }
      if (fieldSearch.trim()) {
        const q = fieldSearch.toLowerCase();
        return (
          f.name.toLowerCase().includes(q) ||
          f.fieldNo.toLowerCase().includes(q) ||
          f.pos.toLowerCase().includes(q) ||
          f.conditionRule.toLowerCase().includes(q) ||
          f.description.toLowerCase().includes(q) ||
          f.failureImpact.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [activeTable, fieldStatusFilter, fieldSearch]);

  const activeFlow = useMemo(
    () => OUTGOING_FLOWS.find((f) => f.id === selectedFlowId) || OUTGOING_FLOWS[0],
    [selectedFlowId]
  );

  const mandatoryTablesCount = useMemo(
    () => brandTables.filter((t) => t.presenceStatus === 'Obrigatório').length,
    [brandTables]
  );
  const conditionalTablesCount = useMemo(
    () => brandTables.filter((t) => t.presenceStatus === 'Condicional').length,
    [brandTables]
  );

  const handleOpenTableFromAnywhere = (brand: OutgoingBrandId, tableId: string) => {
    setSelectedBrand(brand);
    setSelectedTableIdByBrand((prev) => ({ ...prev, [brand]: tableId }));
    setTablePresenceFilter('ALL');
    setTableSearch('');
    setActiveTab('tables');
  };

  const handleOpenFlowFromMatrix = (colId: string) => {
    const flowIndex = parseInt(colId.replace('f', ''), 10) - 1;
    const targetFlow = OUTGOING_FLOWS[flowIndex];
    if (targetFlow) {
      setSelectedFlowId(targetFlow.id);
      setActiveTab('flows');
    }
  };

  return (
    <div className="space-y-6">
      {/* =====================================================================
          1. SELETOR DE BANDEIRA + ARQUITETURA DO ARQUIVO OUTGOING
         ===================================================================== */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-5 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-400 mb-1">
              <span>Arquitetura de Liquidação (Clearing / Outgoing)</span>
              <span>•</span>
              <span>Tabelas Separadas & Fluxos Fim a Fim</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white">
              Selecione a Bandeira para Inspecionar Cada Tabela e Cada Fluxo de Outgoing
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {BRAND_ORDER.map((bId) => {
              const b = OUTGOING_BRANDS[bId];
              const isSelected = selectedBrand === bId;
              const st = BRAND_STYLES[bId];
              const totalTabs = OUTGOING_TABLES.filter((t) => t.brand === bId).length;
              return (
                <button
                  key={bId}
                  onClick={() => {
                    setSelectedBrand(bId);
                    setSelectedMatrixCell(null);
                    setHighlightedFieldNo(null);
                  }}
                  className={`px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-bold transition-all flex items-center gap-2.5 ${
                    isSelected ? st.pillActive : st.pillInactive
                  }`}
                >
                  <span>{b.name}</span>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-mono ${
                      isSelected ? 'bg-black/25 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {totalTabs} tabelas
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Resumo Normativo da Bandeira Ativa */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-5">
          <div className="lg:col-span-7 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-1 rounded-md border text-xs font-bold ${brandStyle.badgeBg}`}>
                {brandMeta.badge}
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-800/90 border border-slate-700 text-xs font-mono text-slate-300">
                Fonte: {brandMeta.manualTitle}
              </span>
              <span className="px-2.5 py-1 rounded-md bg-emerald-950/60 border border-emerald-500/30 text-xs font-mono text-emerald-300">
                {brandMeta.version} · Vigência: {brandMeta.effectiveDate}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {brandMeta.overviewSummary}
            </p>

            <div className="rounded-xl bg-slate-950/90 border border-slate-800 p-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Fórmula de Encadeamento Físico no Arquivo de Outgoing ({brandMeta.name})
              </div>
              <div className="font-mono text-xs text-blue-300 break-words leading-relaxed">
                {brandMeta.hierarchyFormula}
              </div>
            </div>
          </div>

          {/* Janelas Diárias de Envio & Contadores */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-3 rounded-xl bg-slate-950/70 border border-slate-800/90 p-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Janelas / Cutoffs de Outgoing
              </span>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold">
                  {mandatoryTablesCount} Obrigatórias
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
                  {conditionalTablesCount} Condicionais
                </span>
              </div>
            </div>

            <div className="space-y-2">
              {brandMeta.dailyWindows.map((w, idx) => (
                <div
                  key={idx}
                  className="rounded-lg bg-slate-900/90 border border-slate-800/80 px-3 py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1"
                >
                  <div>
                    <div className="text-xs font-bold text-white">{w.label}</div>
                    <div className="text-[11px] text-slate-400">{w.scope}</div>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-amber-300 shrink-0">
                    {w.windowTime}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================================
          2. NAVEGAÇÃO ENTRE AS 3 VISÕES PRINCIPAIS
         ===================================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 p-2 rounded-2xl">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('tables')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'tables'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-950/50'
                : 'text-slate-300 hover:bg-slate-800/70'
            }`}
          >
            <span>📋 1. Cada Tabela de Outgoing (Separada)</span>
            <span className="px-2 py-0.5 rounded bg-black/25 text-[11px] font-mono">
              O que é · O que tem · Layout · M/C
            </span>
          </button>

          <button
            onClick={() => setActiveTab('flows')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'flows'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-950/50'
                : 'text-slate-300 hover:bg-slate-800/70'
            }`}
          >
            <span>🔀 2. Desenho de Cada Fluxo (8 Cenários)</span>
            <span className="px-2 py-0.5 rounded bg-black/25 text-[11px] font-mono">
              Sequência de Lote + De-Para
            </span>
          </button>

          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'matrix'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-950/50'
                : 'text-slate-300 hover:bg-slate-800/70'
            }`}
          >
            <span>📐 3. Matriz Tabelas × Fluxos (M / C / N/A)</span>
          </button>

          <button
            onClick={() => setActiveTab('sandbox')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'sandbox'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/50'
                : 'text-emerald-300 hover:bg-slate-800/70 border border-emerald-500/30'
            }`}
          >
            <span>⚡ 4. Sandbox Gatilhos [C ➔ M]</span>
            <span className="px-2 py-0.5 rounded bg-black/25 text-[11px] font-mono">
              Playground
            </span>
          </button>
        </div>

        <div className="flex items-center gap-3 pr-2">
          <button
            onClick={() => setShowBlueprint((prev) => !prev)}
            className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 hover:border-blue-400 text-xs font-bold text-blue-300 transition-all"
          >
            {showBlueprint ? '▾ Ocultar Blueprint Arquitetural' : '▸ Ver Blueprint Arquitetural (MC/Visa Dev)'}
          </button>
          <Link
            href="/compliance/arquivos"
            className="text-xs font-semibold text-slate-400 hover:text-blue-400 transition-colors"
          >
            Ver Simulador de Mensagens →
          </Link>
        </div>
      </div>

      {/* BLUEPRINT VISUAL DA ARQUITETURA FÍSICA (INSPIRADO NO MASTERCARD & VISA DEVELOPERS) */}
      {showBlueprint && (
        <OutgoingArchitectureBlueprint
          brand={selectedBrand}
          onSelectTable={handleOpenTableFromAnywhere}
        />
      )}

      {/* =====================================================================
          ABA 1 — CADA TABELA DE OUTGOING SEPARADA
         ===================================================================== */}
      {activeTab === 'tables' && activeTable && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Coluna Esquerda: Lista Separada de Cada Tabela da Bandeira */}
          <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-wider text-white">
                  Tabelas de Outgoing · {brandMeta.name}
                </h3>
                <span className="text-xs font-mono text-slate-400">
                  {filteredTables.length} de {brandTables.length}
                </span>
              </div>

              {/* Busca rápida de tabela ou campo */}
              <input
                type="text"
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                placeholder="Buscar tabela ou campo (ex: TCR 5, Reg 02, CAVV, IBGE, 0195)..."
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />

              {/* Filtro Obrigatório vs Condicional */}
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                {(['ALL', 'Obrigatório', 'Condicional'] as TablePresenceFilter[]).map((filterVal) => {
                  const active = tablePresenceFilter === filterVal;
                  return (
                    <button
                      key={filterVal}
                      onClick={() => setTablePresenceFilter(filterVal)}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-bold border transition-all ${
                        active
                          ? 'bg-blue-600/25 border-blue-400 text-white'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {filterVal === 'ALL'
                        ? `Todas (${brandTables.length})`
                        : filterVal === 'Obrigatório'
                        ? `Obrigatórias (${mandatoryTablesCount})`
                        : `Condicionais (${conditionalTablesCount})`}
                    </button>
                  );
                })}
              </div>

              {/* Lista de Cartões Individuais por Tabela */}
              <div className="space-y-2 max-h-[680px] overflow-y-auto pr-1">
                {filteredTables.map((t, index) => {
                  const isSelected = t.id === activeTable.id;
                  const isMandatory = t.presenceStatus === 'Obrigatório';
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        setSelectedTableIdByBrand((prev) => ({
                          ...prev,
                          [selectedBrand]: t.id,
                        }));
                        setHighlightedFieldNo(null);
                      }}
                      className={`w-full text-left rounded-xl p-3.5 border transition-all ${
                        isSelected
                          ? 'bg-blue-950/40 border-blue-400 shadow-lg shadow-blue-950/30'
                          : 'bg-slate-950/70 border-slate-800/90 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-slate-800 text-slate-300 font-mono text-[10px] flex items-center justify-center font-bold">
                            {index + 1}
                          </span>
                          <span className="font-mono text-xs font-black text-blue-300">
                            {t.code}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            isMandatory
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {t.presenceStatus}
                        </span>
                      </div>

                      <div className="text-xs font-bold text-white leading-snug mb-1">
                        {t.title}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {t.subtitle}
                      </div>

                      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-800/60 text-[10px] text-slate-400 font-mono">
                        <span>{t.category}</span>
                        <span>{t.fields.length} blocos/campos</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Coluna Direita: Desenho Completo da Tabela Selecionada */}
          <div className="lg:col-span-8 space-y-6">
            {/* CABEÇALHO E BLOCO 1: O QUE É CADA UMA */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-5 shadow-xl">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 pb-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-lg bg-blue-600 text-white font-mono text-xs font-black">
                      {activeTable.code}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-black uppercase border ${
                        activeTable.presenceStatus === 'Obrigatório'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}
                    >
                      Tabela {activeTable.presenceStatus}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-mono">
                      {activeTable.direction}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 text-xs font-mono">
                      {activeTable.sizeSpec}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-white pt-1">
                    {activeTable.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400">
                    {activeTable.subtitle}
                  </p>
                </div>

                <button
                  onClick={() => {
                    const fieldsRows = activeTable.fields
                      .map(
                        (f) =>
                          `<tr><td><code>${f.fieldNo}</code></td><td><strong>${f.name}</strong></td><td><code>${f.pos}</code> (${f.size} · ${f.format})</td><td><strong>[${f.status}]</strong> ${f.conditionRule}</td><td>${f.description}<br/><em>Ex: ${f.example}</em></td><td>${f.failureImpact}</td></tr>`
                      )
                      .join('');
                    sendToDocStudio({
                      mode: 'append_html',
                      title: `Especificação Outgoing — ${brandMeta.name} — ${activeTable.code}`,
                      sourceModule: 'Tabelas & Fluxos de Outgoing',
                      html: `
                        <h2>${brandMeta.name} — ${activeTable.code}: ${activeTable.title}</h2>
                        <p><strong>Status Geral:</strong> ${activeTable.presenceStatus} — ${activeTable.presenceSummary}</p>
                        <p><strong>Fonte Normativa:</strong> ${activeTable.sourceRef.manual} (${activeTable.sourceRef.version} · Vigência: ${activeTable.sourceRef.effectiveDate} · ${activeTable.sourceRef.pages})</p>
                        <h3>1. O Que É Esta Tabela</h3>
                        <p>${activeTable.whatItIs}</p>
                        <h3>2. Layout Posicional & Regras [M] / [C]</h3>
                        <table>
                          <thead>
                            <tr><th>#</th><th>Campo</th><th>Posição / Tam</th><th>Status & Regra</th><th>O Que Carrega</th><th>Impacto de Erro</th></tr>
                          </thead>
                          <tbody>${fieldsRows}</tbody>
                        </table>
                      `,
                      metadata: {
                        brand: selectedBrand,
                        brandName: brandMeta.name,
                        referenceId: activeTable.code,
                        category: activeTable.category,
                        effectiveDate: activeTable.sourceRef.effectiveDate,
                        executiveSummary: activeTable.whatItIs,
                      },
                    });
                  }}
                  className="px-3.5 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-xs font-bold text-blue-300 transition-all shrink-0"
                >
                  📄 Enviar Tabela p/ Doc Studio
                </button>
              </div>

              {/* SEÇÃO 1: O QUE É ESTA TABELA */}
              <div className="rounded-xl bg-slate-950/90 border border-slate-800 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-blue-400">
                    1. O Que É Esta Tabela no Arquivo de Outgoing
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {activeTable.sourceRef.manual} ({activeTable.sourceRef.pages})
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {activeTable.whatItIs}
                </p>
                <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-amber-300">
                  <span>📌 Regra Sintética de Presença:</span>
                  <span className="text-slate-200 font-normal">{activeTable.presenceSummary}</span>
                </div>
              </div>

              {/* SEÇÃO 2: QUANDO É OBRIGATÓRIA vs QUANDO É CONDICIONAL */}
              <div className="space-y-2">
                <div className="text-xs font-black uppercase tracking-wider text-blue-400">
                  2. Obrigatório vs Condicional (Regras de Presença da Tabela)
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-xl bg-emerald-950/20 border border-emerald-500/30 p-4 space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                      <span>Quando Esta Tabela é OBRIGATÓRIA [M]</span>
                    </div>
                    <ul className="space-y-2 text-xs text-slate-200 leading-relaxed">
                      {activeTable.whenMandatory.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xl bg-amber-950/20 border border-amber-500/30 p-4 space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <span>Quando é CONDICIONAL ou Não Enviada [C]</span>
                    </div>
                    <ul className="space-y-2 text-xs text-slate-200 leading-relaxed">
                      {activeTable.whenConditionalOrNotUsed.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-amber-400 font-bold mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* SEÇÃO 3: O QUE TEM NELA (BLOCOS FUNCIONAIS + RÉGUA VISUAL) */}
              <div className="space-y-3">
                <div className="text-xs font-black uppercase tracking-wider text-blue-400">
                  3. O Que Tem Nela (Agrupamento Funcional de Dados)
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {activeTable.whatItContains.map((blk, i) => (
                    <div
                      key={i}
                      className="rounded-xl bg-slate-950/80 border border-slate-800 p-4 flex flex-col justify-between gap-3"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2 py-0.5 rounded bg-blue-500/15 border border-blue-500/30 text-[10px] font-mono font-bold text-blue-300">
                            {blk.badge}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            Bloco {i + 1}
                          </span>
                        </div>
                        <h4 className="text-xs font-black text-white">{blk.title}</h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          {blk.summary}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 flex flex-wrap gap-1">
                        {blk.keyFields.map((kf, kIdx) => (
                          <span
                            key={kIdx}
                            className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-300"
                          >
                            {kf}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Régua Visual Interativa de Campos / Bytes */}
                <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-200">
                      📐 Desenho Visual do Registro ({activeTable.code}) — Clique em um bloco para destacar no Layout
                    </span>
                    <div className="flex items-center gap-3 text-[11px]">
                      <span className="flex items-center gap-1 text-emerald-300">
                        <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/50 border border-emerald-400" />
                        Obrigatório [M]
                      </span>
                      <span className="flex items-center gap-1 text-amber-300">
                        <span className="w-2.5 h-2.5 rounded-sm bg-amber-500/50 border border-amber-400" />
                        Condicional [C]
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {activeTable.fields.map((f) => {
                      const weight = parseNumericSize(f.size);
                      const isM = f.status === 'M';
                      const isHighlighted = highlightedFieldNo === f.fieldNo;
                      return (
                        <button
                          key={`${f.fieldNo}-${f.pos}`}
                          onClick={() =>
                            setHighlightedFieldNo(isHighlighted ? null : f.fieldNo)
                          }
                          style={{ flexGrow: weight }}
                          className={`min-w-[110px] rounded-lg p-2 text-left border transition-all ${
                            isHighlighted
                              ? 'ring-2 ring-white bg-blue-900/60 border-white'
                              : isM
                              ? 'bg-emerald-950/35 border-emerald-500/40 hover:border-emerald-400'
                              : 'bg-amber-950/35 border-amber-500/40 hover:border-amber-400'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 text-[10px] font-mono">
                            <span className="font-bold text-white">{f.pos}</span>
                            <span
                              className={`px-1 rounded font-black ${
                                isM
                                  ? 'bg-emerald-500/30 text-emerald-200'
                                  : 'bg-amber-500/30 text-amber-200'
                              }`}
                            >
                              {f.status} · {f.size}
                            </span>
                          </div>
                          <div className="text-[11px] font-bold text-slate-200 truncate mt-0.5">
                            {f.name}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* BLOCO 3.5: DEVELOPER PAYLOAD & WIRE INSPECTOR (VISA / MASTERCARD DEVELOPER UX) */}
            <InteractiveWireInspector
              table={activeTable}
              highlightedFieldNo={highlightedFieldNo}
              onSelectField={(no) => setHighlightedFieldNo(no)}
            />

            {/* BLOCO 4: LAYOUT COMPLETO CAMPO A CAMPO */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-blue-400">
                    4. Layout Completo Campo a Campo · {activeTable.code}
                  </span>
                  <h4 className="text-base font-black text-white">
                    Posição, Tamanho, Formato, Regra Obrigatório [M] vs Condicional [C] e Impacto de Erro
                  </h4>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {(['ALL', 'M', 'C'] as FieldStatusFilter[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => setFieldStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        fieldStatusFilter === st
                          ? 'bg-blue-600 text-white border-blue-400'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {st === 'ALL'
                        ? `Todos (${activeTable.fields.length})`
                        : st === 'M'
                        ? `Obrigatórios [M] (${activeTable.fields.filter((f) => f.status === 'M').length})`
                        : `Condicionais [C] (${activeTable.fields.filter((f) => f.status === 'C').length})`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={fieldSearch}
                  onChange={(e) => setFieldSearch(e.target.value)}
                  placeholder="Filtrar campo dentro desta tabela por nome, posição, tag, condição ou erro..."
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
                {highlightedFieldNo && (
                  <button
                    onClick={() => setHighlightedFieldNo(null)}
                    className="px-3 py-2 rounded-xl bg-slate-800 text-xs font-bold text-slate-300 hover:text-white shrink-0"
                  >
                    Limpar Destaque ({highlightedFieldNo})
                  </button>
                )}
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-800 text-[11px] font-black uppercase tracking-wider text-slate-400">
                      <th className="py-3 px-3">Campo / Tag</th>
                      <th className="py-3 px-3">Posição & Tam.</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3">Nome do Campo & Descrição</th>
                      <th className="py-3 px-3">Regra Obrigatório vs Condicional</th>
                      <th className="py-3 px-3">Impacto se Ausente / Inválido</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70 text-xs">
                    {filteredFields.map((f) => {
                      const isM = f.status === 'M';
                      const isHighlighted = highlightedFieldNo === f.fieldNo;
                      return (
                        <tr
                          key={`${f.fieldNo}-${f.pos}`}
                          className={`transition-colors ${
                            isHighlighted
                              ? 'bg-blue-950/60'
                              : 'bg-slate-900/40 hover:bg-slate-900/90'
                          }`}
                        >
                          <td className="py-3.5 px-3 font-mono font-bold text-blue-300 whitespace-nowrap align-top">
                            #{f.fieldNo}
                          </td>
                          <td className="py-3.5 px-3 font-mono whitespace-nowrap align-top">
                            <div className="font-bold text-white">{f.pos}</div>
                            <div className="text-[11px] text-slate-400">
                              Tam: {f.size} · {f.format}
                            </div>
                          </td>
                          <td className="py-3.5 px-3 align-top whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-black uppercase border ${
                                isM
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              }`}
                            >
                              {isM ? 'M · Obrigatório' : 'C · Condicional'}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 align-top min-w-[220px]">
                            <div className="font-bold text-white mb-1">{f.name}</div>
                            <div className="text-slate-300 leading-relaxed mb-1.5">
                              {f.description}
                            </div>
                            <div className="inline-block px-2 py-0.5 rounded bg-slate-950 border border-slate-800 font-mono text-[11px] text-cyan-300">
                              Ex: {f.example}
                            </div>
                          </td>
                          <td className="py-3.5 px-3 align-top text-slate-200 leading-relaxed min-w-[220px]">
                            {f.conditionRule}
                          </td>
                          <td className="py-3.5 px-3 align-top text-rose-300/90 leading-relaxed min-w-[200px]">
                            {f.failureImpact}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          ABA 2 — DESENHO DE CADA FLUXO DE OUTGOING (SEPARADO PASSO A PASSO)
         ===================================================================== */}
      {activeTab === 'flows' && activeFlow && (
        <div className="space-y-6">
          {/* Seletor dos 8 Fluxos Operacionais Separados */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-blue-400">
                  Catálogo de Fluxos de Outgoing (8 Cenários Operacionais Separados)
                </span>
                <h3 className="text-lg font-black text-white">
                  Escolha o Fluxo para Ver o Desenho Exato das Tabelas que Saem no Arquivo
                </h3>
              </div>

              <button
                onClick={() => setCompareAllBrandsInFlow((prev) => !prev)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                  compareAllBrandsInFlow
                    ? 'bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-950/50'
                    : 'bg-slate-950 text-slate-300 border-slate-700 hover:border-purple-400'
                }`}
              >
                {compareAllBrandsInFlow
                  ? '✓ Modo Comparativo 3 Bandeiras Ativo (Visa × Elo × Mastercard)'
                  : '⇄ Comparar Visa × Elo × Mastercard neste Fluxo'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {OUTGOING_FLOWS.map((fl) => {
                const isSelected = fl.id === activeFlow.id;
                return (
                  <button
                    key={fl.id}
                    onClick={() => setSelectedFlowId(fl.id)}
                    className={`rounded-xl p-3.5 text-left border transition-all flex flex-col justify-between gap-2 ${
                      isSelected
                        ? 'bg-blue-950/50 border-blue-400 shadow-lg shadow-blue-950/40'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-mono text-[11px] font-black text-blue-400">
                          {fl.number}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-300">
                          {fl.tag}
                        </span>
                      </div>
                      <div className="text-xs font-black text-white leading-snug">
                        {fl.title}
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-2">
                      {fl.subtitle}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Renderização do Fluxo Selecionado (1 Bandeira ou Comparativo das 3) */}
          {(compareAllBrandsInFlow ? BRAND_ORDER : [selectedBrand]).map((bId) => {
            const bMeta = OUTGOING_BRANDS[bId];
            const bFlow = activeFlow.byBrand[bId];
            const bSt = BRAND_STYLES[bId];

            return (
              <div
                key={bId}
                className={`rounded-2xl border ${bSt.border} bg-slate-900/80 p-6 space-y-6 shadow-xl`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-lg border text-xs font-black ${bSt.badgeBg}`}>
                        {bMeta.name}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-blue-300">
                        {activeFlow.number} · {activeFlow.tag}
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-white pt-1">
                      {activeFlow.title} — {bMeta.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-4xl">
                      {bFlow.summary}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      const seqRows = bFlow.recordSequence
                        .map(
                          (st) =>
                            `<tr><td>${st.order}</td><td><strong>${st.tableCode}</strong> (${st.tableName})</td><td>${st.statusInFlow}</td><td>${st.roleInFlow}</td><td>${st.keyValuesInFlow.join(' | ')}</td></tr>`
                        )
                        .join('');
                      sendToDocStudio({
                        mode: 'append_html',
                        title: `Fluxo de Outgoing — ${activeFlow.title} (${bMeta.name})`,
                        sourceModule: 'Tabelas & Fluxos de Outgoing',
                        html: `
                          <h2>${activeFlow.number}: ${activeFlow.title} — ${bMeta.name}</h2>
                          <p>${bFlow.summary}</p>
                          <p><strong>Comportamento no Lote:</strong> ${bFlow.architectureNote}</p>
                          <p><strong>Regra Brasil:</strong> ${bFlow.brazilSpecificRule}</p>
                          <h3>Sequência Exata de Tabelas no Arquivo de Outgoing</h3>
                          <table>
                            <thead>
                              <tr><th>Ordem</th><th>Tabela / Registro</th><th>Status no Fluxo</th><th>Papel</th><th>Valores-Chave</th></tr>
                            </thead>
                            <tbody>${seqRows}</tbody>
                          </table>
                        `,
                        metadata: {
                          brand: bId,
                          brandName: bMeta.name,
                          referenceId: activeFlow.number,
                          category: activeFlow.tag,
                          effectiveDate: bMeta.effectiveDate,
                          executiveSummary: bFlow.summary,
                        },
                      });
                    }}
                    className="px-3.5 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-xs font-bold text-blue-300 transition-all shrink-0"
                  >
                    📄 Exportar Fluxo p/ Doc Studio
                  </button>
                </div>

                {/* Alertas de Regra Arquitetural & Regra Brasil */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-xl bg-slate-950/90 border border-slate-800 p-4 space-y-1">
                    <div className="text-xs font-black uppercase tracking-wider text-blue-400">
                      ⚙️ Comportamento Arquitetural no Lote Outgoing
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {bFlow.architectureNote}
                    </p>
                  </div>

                  <div className="rounded-xl bg-emerald-950/20 border border-emerald-500/30 p-4 space-y-1">
                    <div className="text-xs font-black uppercase tracking-wider text-emerald-300">
                      🇧🇷 Regra Específica do Mercado Brasileiro neste Fluxo
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed font-medium">
                      {bFlow.brazilSpecificRule}
                    </p>
                  </div>
                </div>

                {/* DIAGRAMA DE SEQUÊNCIA 5 ATORES (SWIMLANE DUAL-MESSAGE ESTILO VISA/MC DEVELOPER) */}
                <InteractiveSwimlaneDiagram
                  brand={bId}
                  flow={activeFlow}
                  onSelectTable={handleOpenTableFromAnywhere}
                />

                {/* DESENHO VISUAL DA SEQUÊNCIA DE TABELAS NO ARQUIVO */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-blue-400">
                      1. Desenho da Sequência Física de Tabelas no Arquivo Outgoing (Passo a Passo)
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Clique em &quot;Inspecionar Layout&quot; para abrir os campos da tabela
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                    {bFlow.recordSequence.map((step) => {
                      const isMandatoryStep = step.statusInFlow === 'Obrigatório no Fluxo';
                      const isEnvelope = step.statusInFlow === 'Envelope do Lote';
                      return (
                        <div
                          key={step.order}
                          className={`rounded-xl p-4 border flex flex-col justify-between gap-3 ${
                            isEnvelope
                              ? 'bg-slate-950/60 border-slate-800'
                              : isMandatoryStep
                              ? 'bg-emerald-950/15 border-emerald-500/35'
                              : 'bg-amber-950/15 border-amber-500/35'
                          }`}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-mono text-xs font-black flex items-center justify-center">
                                  {step.order}
                                </span>
                                <span className="font-mono text-xs font-black text-white">
                                  {step.tableCode}
                                </span>
                              </div>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  isEnvelope
                                    ? 'bg-slate-800 text-slate-300'
                                    : isMandatoryStep
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                }`}
                              >
                                {step.statusInFlow}
                              </span>
                            </div>

                            <div className="text-xs font-bold text-slate-100">
                              {step.tableName}
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed">
                              {step.roleInFlow}
                            </p>
                          </div>

                          <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
                            <div className="flex flex-wrap gap-1">
                              {step.keyValuesInFlow.map((kv, kIdx) => (
                                <span
                                  key={kIdx}
                                  className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 font-mono text-[10px] text-cyan-300"
                                >
                                  {kv}
                                </span>
                              ))}
                            </div>

                            <button
                              onClick={() =>
                                handleOpenTableFromAnywhere(bId, step.tableId)
                              }
                              className="w-full py-1.5 px-3 rounded-lg bg-slate-800/90 hover:bg-blue-600 text-slate-200 hover:text-white text-[11px] font-bold transition-colors text-center"
                            >
                              Inspecionar Layout Completo ({step.tableCode}) →
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ESCALONAMENTO: O QUE ERA CONDICIONAL E VIRA OBRIGATÓRIO NESTE FLUXO + DE-PARA */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
                  {/* Escalonamento C -> M */}
                  <div className="rounded-xl bg-amber-950/15 border border-amber-500/30 p-4 space-y-3">
                    <div className="text-xs font-black uppercase tracking-wider text-amber-300">
                      2. O Que é Condicional no Manual Geral, mas Vira 100% OBRIGATÓRIO Neste Fluxo
                    </div>
                    <div className="space-y-2.5">
                      {bFlow.conditionalTurnedMandatory.map((esc, idx) => (
                        <div
                          key={idx}
                          className="rounded-lg bg-slate-950/90 border border-slate-800 p-3 space-y-1.5"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-mono text-xs font-black text-white">
                              {esc.target}
                            </span>
                            <div className="flex items-center gap-1.5 text-[10px] font-bold">
                              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                                {esc.generalStatus}
                              </span>
                              <span className="text-slate-400">➔</span>
                              <span className="px-2 py-0.5 rounded bg-emerald-500/25 text-emerald-300 border border-emerald-500/40">
                                {esc.statusInThisFlow}
                              </span>
                            </div>
                          </div>
                          <div className="text-xs text-slate-300">
                            <strong className="text-slate-100">Gatilho:</strong> {esc.triggerCondition}
                          </div>
                          <div className="text-xs text-rose-300">
                            <strong>Se faltar no Outgoing:</strong> {esc.consequenceIfMissing}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* De-Para Autorização -> Outgoing */}
                  <div className="rounded-xl bg-blue-950/15 border border-blue-500/30 p-4 space-y-3">
                    <div className="text-xs font-black uppercase tracking-wider text-blue-300">
                      3. De-Para: Autorização (0100/0110) ➔ Tabelas de Outgoing
                    </div>
                    <div className="space-y-2.5">
                      {bFlow.authToClearingDePara.map((dp, idx) => (
                        <div
                          key={idx}
                          className="rounded-lg bg-slate-950/90 border border-slate-800 p-3 space-y-1"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                            <span className="text-cyan-300 font-bold">{dp.authField}</span>
                            <span className="text-slate-500">➔</span>
                            <span className="text-emerald-300 font-bold">
                              {dp.outgoingTable} · {dp.outgoingField}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {dp.rule}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =====================================================================
          ABA 3 — MATRIZ CRUZADA: TABELAS × FLUXOS (M / C / O / N/A)
         ===================================================================== */}
      {activeTab === 'matrix' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-blue-400">
                Matriz de Obrigatoriedade por Cenário · {brandMeta.name}
              </span>
              <h3 className="text-lg sm:text-xl font-black text-white">
                Quando Cada Tabela de Outgoing é Obrigatória [M], Condicional [C] ou Não Aplicável [-]
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
              <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                M = Obrigatório no Fluxo
              </span>
              <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                C = Condicional no Fluxo
              </span>
              <span className="px-2.5 py-1 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40">
                O = Opcional
              </span>
              <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-400">
                - = Não Enviado
              </span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-[11px] font-black uppercase tracking-wider text-slate-300">
                  <th className="py-3.5 px-3">Tabela Separada ({brandMeta.name})</th>
                  <th className="py-3.5 px-3">Status Geral</th>
                  {OUTGOING_MATRIX_COLUMNS.map((col) => (
                    <th key={col.id} className="py-3.5 px-2.5 text-center">
                      <button
                        onClick={() => handleOpenFlowFromMatrix(col.id)}
                        className="hover:text-blue-400 transition-colors underline decoration-slate-700 underline-offset-4"
                        title={`Abrir ${col.label}`}
                      >
                        {col.short}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-xs">
                {OUTGOING_MATRIX[selectedBrand].map((row) => (
                  <tr key={row.tableId} className="bg-slate-900/40 hover:bg-slate-900/90">
                    <td className="py-3 px-3 whitespace-nowrap">
                      <button
                        onClick={() =>
                          handleOpenTableFromAnywhere(selectedBrand, row.tableId)
                        }
                        className="text-left group"
                      >
                        <div className="font-mono font-black text-blue-300 group-hover:underline">
                          {row.tableCode}
                        </div>
                        <div className="text-[11px] text-slate-300">{row.tableName}</div>
                      </button>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          row.generalStatus === 'Obrigatório'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {row.generalStatus}
                      </span>
                    </td>
                    {OUTGOING_MATRIX_COLUMNS.map((col) => {
                      const cell = row.cells[col.id];
                      const st = cell?.status || '-';
                      const isSelectedCell =
                        selectedMatrixCell?.tableId === row.tableId &&
                        selectedMatrixCell?.colId === col.id;
                      return (
                        <td key={col.id} className="py-2.5 px-2 text-center">
                          <button
                            onClick={() =>
                              setSelectedMatrixCell({
                                tableId: row.tableId,
                                tableCode: row.tableCode,
                                tableName: row.tableName,
                                colId: col.id,
                                colLabel: col.label,
                                status: st,
                                note: cell?.note || '',
                              })
                            }
                            title={cell?.note}
                            className={`w-10 h-8 rounded-lg font-mono text-xs font-black border transition-all ${
                              isSelectedCell ? 'ring-2 ring-white scale-105 ' : ''
                            }${
                              st === 'M'
                                ? 'bg-emerald-500/25 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/40'
                                : st === 'C'
                                ? 'bg-amber-500/25 text-amber-300 border-amber-500/40 hover:bg-amber-500/40'
                                : st === 'O'
                                ? 'bg-blue-500/25 text-blue-300 border-blue-500/40 hover:bg-blue-500/40'
                                : 'bg-slate-950 text-slate-600 border-slate-800 hover:text-slate-400'
                            }`}
                          >
                            {st}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Detalhe da Célula Clicada na Matriz */}
          {selectedMatrixCell ? (
            <div className="rounded-xl bg-slate-950 border border-blue-500/40 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="font-black text-blue-300">
                    {selectedMatrixCell.tableCode} ({selectedMatrixCell.tableName})
                  </span>
                  <span className="text-slate-500">×</span>
                  <span className="font-bold text-white">
                    {selectedMatrixCell.colLabel}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded font-black ${
                      selectedMatrixCell.status === 'M'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : selectedMatrixCell.status === 'C'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    Status = {selectedMatrixCell.status}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200">
                  {selectedMatrixCell.note}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() =>
                    handleOpenTableFromAnywhere(
                      selectedBrand,
                      selectedMatrixCell.tableId
                    )
                  }
                  className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
                >
                  Abrir Tabela ({selectedMatrixCell.tableCode})
                </button>
                <button
                  onClick={() => handleOpenFlowFromMatrix(selectedMatrixCell.colId)}
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
                >
                  Abrir Fluxo
                </button>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 text-center py-1">
              💡 Clique em qualquer célula (`M`, `C`, `O` ou `-`) da matriz acima para ver a regra normativa exata daquela tabela naquele fluxo.
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          ABA 4 — SANDBOX DE GATILHOS [C ➔ M] & SIMULADOR DE LOTE (PLAYGROUND)
         ===================================================================== */}
      {activeTab === 'sandbox' && (
        <InteractiveRuleSandbox
          selectedBrand={selectedBrand}
          onSelectTable={handleOpenTableFromAnywhere}
        />
      )}
    </div>
  );
}
