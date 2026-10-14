"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Database, Search, Terminal, FileCode2, DollarSign, Layers,
  ArrowLeft, RefreshCw, CheckCircle2, Filter, Copy, Check,
  BookOpen, ArrowRight, Sparkles, ShieldCheck, Cpu, Sliders,
  Eye, ChevronDown, ChevronUp, Info
} from "lucide-react";

interface DocumentoMeta {
  doc_id: string;
  bandeira: string;
  titulo: string;
  arquivo: string;
  edicao: string;
  paginas: number;
  linhas: number;
}

interface FeaturedLayout {
  id: string;
  bandeira: string;
  sistema: string;
  codigo: string;
  nome: string;
  doc_id: string;
  page_start: number;
  page_end: number;
  registro_filter: string;
  total_bytes: number;
  fluxo: string;
  descricao: string;
}

interface LayoutField {
  id: number;
  pagina: number;
  registro: string;
  pos_inicio: number;
  pos_fim: number;
  tamanho: number;
  formato: string;
  nome: string;
  descricao: string;
  de?: string | null;
  pds?: string | null;
  sample_value?: string;
}

interface CampoRow {
  id: number;
  doc_id: string;
  manual_titulo: string;
  edicao: string;
  bandeira: string;
  pagina: number;
  tipo: string;
  registro: string;
  de: string | null;
  pds: string | null;
  subcampo: string | null;
  posicao: string | null;
  pos_inicio: number | null;
  pos_fim: number | null;
  tamanho: number | null;
  formato: string | null;
  nome: string | null;
  valor: string | null;
  descricao: string | null;
}

interface BillingRow {
  bandeira: string;
  sistema: string;
  codigo: string;
  serviceId: string;
  serviceLabelPt?: string;
  nome: string;
  quemPaga: string;
  descricao: string;
  explicacaoPt?: string;
  gatilhoPt?: string;
  rates: string[];
  fonte: string;
  reconciliacao: string;
}

const SEGMENT_COLORS = [
  "bg-blue-500/20 border-blue-500/40 text-blue-200",
  "bg-purple-500/20 border-purple-500/40 text-purple-200",
  "bg-emerald-500/20 border-emerald-500/40 text-emerald-200",
  "bg-amber-500/20 border-amber-500/40 text-amber-200",
  "bg-cyan-500/20 border-cyan-500/40 text-cyan-200",
  "bg-rose-500/20 border-rose-500/40 text-rose-200",
  "bg-indigo-500/20 border-indigo-500/40 text-indigo-200",
];

export default function CentralArquivosPage() {
  const [activeTab, setActiveTab] = useState<"parser" | "campos" | "billing" | "arquitetura">("parser");

  // Overview state
  const [stats, setStats] = useState<any>(null);
  const [documentos, setDocumentos] = useState<DocumentoMeta[]>([]);
  const [featuredLayouts, setFeaturedLayouts] = useState<FeaturedLayout[]>([]);
  const [loadingOverview, setLoadingOverview] = useState(true);

  // Tab 1: Parser Studio state
  const [selectedPresetId, setSelectedPresetId] = useState("visa_tc05_tcr0");
  const [currentPreset, setCurrentPreset] = useState<FeaturedLayout | null>(null);
  const [layoutFields, setLayoutFields] = useState<LayoutField[]>([]);
  const [rawLine, setRawLine] = useState("");
  const [defaultSampleLine, setDefaultSampleLine] = useState("");
  const [selectedFieldIdx, setSelectedFieldIdx] = useState<number | null>(0);
  const [loadingLayout, setLoadingLayout] = useState(false);
  const [copiedLine, setCopiedLine] = useState(false);

  // Tab 2: Explorador de Campos state
  const [campoQuery, setCampoQuery] = useState("");
  const [campoBandeira, setCampoBandeira] = useState("ALL");
  const [campoDocId, setCampoDocId] = useState("ALL");
  const [campoTipo, setCampoTipo] = useState("ALL");
  const [campoDE, setCampoDE] = useState("");
  const [campoPDS, setCampoPDS] = useState("");
  const [campoPosicao, setCampoPosicao] = useState("");
  const [onlyPositional, setOnlyPositional] = useState(false);
  const [campoResults, setCampoResults] = useState<CampoRow[]>([]);
  const [campoTotal, setCampoTotal] = useState(0);
  const [loadingCampos, setLoadingCampos] = useState(false);
  const [hoveredCampo, setHoveredCampo] = useState<CampoRow | null>(null);
  const [expandedCampoId, setExpandedCampoId] = useState<number | null>(null);

  // Tab 3: Motor de Faturamento MCBS & VSS state
  const [billingQuery, setBillingQuery] = useState("");
  const [billingBrand, setBillingBrand] = useState("ALL");
  const [billingRole, setBillingRole] = useState("ALL");
  const [billingServiceId, setBillingServiceId] = useState("ALL");
  const [mcbsServiceIds, setMcbsServiceIds] = useState<string[]>([]);
  const [billingResults, setBillingResults] = useState<BillingRow[]>([]);
  const [billingTotals, setBillingTotals] = useState({ mcbs: 0, visa: 0, total: 0 });
  const [loadingBilling, setLoadingBilling] = useState(false);
  const [hoveredBilling, setHoveredBilling] = useState<BillingRow | null>(null);
  const [expandedBillingKey, setExpandedBillingKey] = useState<string | null>(null);

  // Load overview on mount + support ?tab= query param
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam === "parser" || tabParam === "campos" || tabParam === "billing" || tabParam === "arquitetura") {
        setActiveTab(tabParam);
      }
    }
    async function fetchOverview() {
      setLoadingOverview(true);
      try {
        const res = await fetch("/api/admin/arquivos?action=overview");
        const data = await res.json();
        if (data.connected) {
          setStats(data.stats);
          setDocumentos(data.documentos || []);
          setFeaturedLayouts(data.featuredLayouts || []);
        }
      } catch (e) {
        console.error("Erro ao carregar overview:", e);
      } finally {
        setLoadingOverview(false);
      }
    }
    fetchOverview();
  }, []);

  // Load positional layout when preset changes
  const loadLayoutPreset = useCallback(async (presetId: string) => {
    setLoadingLayout(true);
    try {
      const res = await fetch(`/api/admin/arquivos?action=get_layout&preset_id=${encodeURIComponent(presetId)}`);
      const data = await res.json();
      if (data.connected) {
        setCurrentPreset(data.preset);
        setLayoutFields(data.fields || []);
        setRawLine(data.sampleLine || "");
        setDefaultSampleLine(data.sampleLine || "");
        setSelectedFieldIdx(data.fields?.length ? 0 : null);
      }
    } catch (e) {
      console.error("Erro ao carregar layout:", e);
    } finally {
      setLoadingLayout(false);
    }
  }, []);

  useEffect(() => {
    loadLayoutPreset(selectedPresetId);
  }, [selectedPresetId, loadLayoutPreset]);

  // Search Campos
  const runSearchCampos = useCallback(async (overrides?: Partial<{
    q: string; bandeira: string; doc_id: string; tipo: string; de: string; pds: string; posicao: string; only_positional: boolean;
  }>) => {
    setLoadingCampos(true);
    try {
      const payload = {
        action: "search_campos",
        q: overrides?.q !== undefined ? overrides.q : campoQuery,
        bandeira: overrides?.bandeira !== undefined ? overrides.bandeira : campoBandeira,
        doc_id: overrides?.doc_id !== undefined ? overrides.doc_id : campoDocId,
        tipo: overrides?.tipo !== undefined ? overrides.tipo : campoTipo,
        de: overrides?.de !== undefined ? overrides.de : campoDE,
        pds: overrides?.pds !== undefined ? overrides.pds : campoPDS,
        posicao: overrides?.posicao !== undefined ? overrides.posicao : campoPosicao,
        only_positional: overrides?.only_positional !== undefined ? overrides.only_positional : onlyPositional,
        limit: 100
      };
      const res = await fetch("/api/admin/arquivos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.connected) {
        const list = data.results || [];
        setCampoResults(list);
        setCampoTotal(data.totalMatches || 0);
        setHoveredCampo(list[0] || null);
      }
    } catch (e) {
      console.error("Erro ao buscar campos:", e);
    } finally {
      setLoadingCampos(false);
    }
  }, [campoQuery, campoBandeira, campoDocId, campoTipo, campoDE, campoPDS, campoPosicao, onlyPositional]);

  useEffect(() => {
    if (activeTab === "campos" && campoResults.length === 0) {
      runSearchCampos();
    }
  }, [activeTab, campoResults.length, runSearchCampos]);

  // Search Billing
  const runSearchBilling = useCallback(async (overrides?: Partial<{
    q: string; brand: string; role: string; service_id: string;
  }>) => {
    setLoadingBilling(true);
    try {
      const payload = {
        action: "search_billing",
        q: overrides?.q !== undefined ? overrides.q : billingQuery,
        brand: overrides?.brand !== undefined ? overrides.brand : billingBrand,
        role: overrides?.role !== undefined ? overrides.role : billingRole,
        service_id: overrides?.service_id !== undefined ? overrides.service_id : billingServiceId,
        limit: 80
      };
      const res = await fetch("/api/admin/arquivos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.connected) {
        const list = data.results || [];
        setBillingResults(list);
        setHoveredBilling(list[0] || null);
        setBillingTotals({
          mcbs: data.totalMcbsMatched || 0,
          visa: data.totalVisaMatched || 0,
          total: data.totalMatched || 0
        });
        if (data.mcbsServiceIds?.length) {
          setMcbsServiceIds(data.mcbsServiceIds);
        }
      }
    } catch (e) {
      console.error("Erro ao buscar faturamento:", e);
    } finally {
      setLoadingBilling(false);
    }
  }, [billingQuery, billingBrand, billingRole, billingServiceId]);

  useEffect(() => {
    if (activeTab === "billing" && billingResults.length === 0) {
      runSearchBilling();
    }
  }, [activeTab, billingResults.length, runSearchBilling]);

  const handleCopyRawLine = () => {
    navigator.clipboard.writeText(rawLine);
    setCopiedLine(true);
    setTimeout(() => setCopiedLine(false), 2000);
  };

  const extractSlice = (posIni: number, posFim: number) => {
    const startIdx = Math.max(0, posIni - 1);
    const endIdx = Math.max(startIdx, posFim);
    if (startIdx >= rawLine.length) return "";
    return rawLine.slice(startIdx, endIdx);
  };

  const activeField = selectedFieldIdx !== null && layoutFields[selectedFieldIdx]
    ? layoutFields[selectedFieldIdx]
    : null;

  return (
    <div className="min-h-screen bg-[#02050b] text-slate-200 pb-24">
      {/* Top Header */}
      <div className="border-b border-slate-800/80 bg-[#050b16]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
              title="Voltar ao Cockpit"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-500/15 text-blue-400 border border-blue-500/30">
                  Engenharia de Arquivos & Faturamento
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  SQLite + JSON Local Ativo
                </span>
              </div>
              <h1 className="text-lg md:text-xl font-bold text-white tracking-tight mt-0.5">
                Sistema Completo: GCMS, MPE, MCBS, Base II, VSS & Elo 26.2
              </h1>
            </div>
          </div>

          {/* KPI Pills */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-slate-400">Campos:</span>
              <span className="font-mono font-bold text-white">
                {stats ? stats.totalCampos.toLocaleString("pt-BR") : "17.106"}
              </span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-2">
              <DollarSign className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-slate-400">MCBS Brasil:</span>
              <span className="font-mono font-bold text-purple-300">
                {stats ? stats.totalMcbsEvents.toLocaleString("pt-BR") : "2.267"} eventos
              </span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400">Visa Billing:</span>
              <span className="font-mono font-bold text-amber-300">
                {stats ? stats.totalVisaBillingLines.toLocaleString("pt-BR") : "10.914"} linhas
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-2 overflow-x-auto border-t border-slate-800/50 pt-2 pb-2">
          <button
            onClick={() => setActiveTab("parser")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === "parser"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            1. Decodificador Posicional Byte-a-Byte (Parser Studio)
          </button>
          <button
            onClick={() => setActiveTab("campos")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === "campos"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            2. Explorador de Campos & Tabelas (17.106 Campos)
          </button>
          <button
            onClick={() => setActiveTab("billing")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === "billing"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/25"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            3. Motor de Faturamento MCBS (2.267) & Visa VSS (10.914)
          </button>
          <button
            onClick={() => setActiveTab("arquitetura")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === "arquitetura"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/25"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            4. Manuais Indexados & Fluxo Quem-Envia / Quem-Recebe
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pt-8">
        {/* =========================================================
            TAB 1: DECODIFICADOR POSICIONAL BYTE-A-BYTE (PARSER STUDIO)
           ========================================================= */}
        {activeTab === "parser" && (
          <div className="space-y-6">
            {/* Preset Selector Grid */}
            <div className="bg-[#080f1e] border border-slate-800/80 rounded-2xl p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
                    Passo 1 · Selecione o Registro ou Tabela Posicional Oficial
                  </span>
                  <h2 className="text-base font-bold text-white mt-0.5">
                    Layouts Reais Extraídos dos Manuais 2026 (Base II, VSS, MPE/GCMS e Elo 26.2)
                  </h2>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Fatiamento determinístico por coluna inicial e final (`pos_inicio`..`pos_fim`)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {featuredLayouts.map((preset) => {
                  const isSelected = selectedPresetId === preset.id;
                  const brandBadge =
                    preset.bandeira === "Visa"
                      ? "bg-blue-500/15 text-blue-300 border-blue-500/30"
                      : preset.bandeira === "Mastercard"
                      ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                      : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";

                  return (
                    <button
                      key={preset.id}
                      onClick={() => setSelectedPresetId(preset.id)}
                      className={`text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                        isSelected
                          ? "bg-blue-950/40 border-blue-500 shadow-md shadow-blue-500/10"
                          : "bg-slate-900/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${brandBadge}`}>
                            {preset.bandeira} · {preset.codigo}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {preset.total_bytes} bytes · p.{preset.page_start}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-white line-clamp-1">{preset.nome}</p>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{preset.descricao}</p>
                      </div>
                      <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                        <span className="truncate">{preset.fluxo}</span>
                        <span className="text-blue-400 font-semibold ml-2 shrink-0">
                          {isSelected ? "Ativo ●" : "Carregar →"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Layout Header + Raw String Editor */}
            {currentPreset && (
              <div className="bg-[#080f1e] border border-slate-800/80 rounded-2xl p-6 space-y-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        {currentPreset.bandeira} — {currentPreset.codigo}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        Manual: <strong className="text-slate-200">{currentPreset.doc_id}</strong> (páginas {currentPreset.page_start} a {currentPreset.page_end})
                      </span>
                      <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                        Fluxo: {currentPreset.fluxo}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white">{currentPreset.nome}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{currentPreset.descricao}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setRawLine(defaultSampleLine)}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Restaurar Exemplo Real
                    </button>
                    <button
                      onClick={handleCopyRawLine}
                      className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
                    >
                      {copiedLine ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedLine ? "Copiado!" : "Copiar Linha Raw"}
                    </button>
                  </div>
                </div>

                {/* Raw Positional Input Box */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <label className="font-semibold text-slate-300 flex items-center gap-2">
                      <FileCode2 className="w-4 h-4 text-blue-400" />
                      Linha Posicional Bruta (Edite ou cole uma linha real do arquivo {currentPreset.codigo} para decodificar em tempo real):
                    </label>
                    <span className="font-mono text-slate-400">
                      Comprimento atual: <strong className="text-white">{rawLine.length}</strong> / {currentPreset.total_bytes} bytes
                    </span>
                  </div>
                  <textarea
                    value={rawLine}
                    onChange={(e) => setRawLine(e.target.value)}
                    rows={3}
                    spellCheck={false}
                    className="w-full font-mono text-xs bg-[#030711] border border-slate-700/80 focus:border-blue-500 rounded-xl p-3.5 text-emerald-300 tracking-wider leading-relaxed focus:outline-none"
                  />
                </div>

                {/* Interactive Visual Byte Map */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-300">
                      Régua Visual de Bytes (Clique em qualquer bloco para inspecionar o campo):
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {layoutFields.length} campos posicionais mapeados neste registro
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-[#030711] border border-slate-800/90 max-h-56 overflow-y-auto">
                    {layoutFields.map((field, idx) => {
                      const sliceVal = extractSlice(field.pos_inicio, field.pos_fim);
                      const colorClass = SEGMENT_COLORS[idx % SEGMENT_COLORS.length];
                      const isSelected = selectedFieldIdx === idx;
                      return (
                        <button
                          key={`${field.id}-${idx}`}
                          onClick={() => setSelectedFieldIdx(idx)}
                          className={`px-2 py-1 rounded-lg border text-left transition-all ${colorClass} ${
                            isSelected ? "ring-2 ring-white scale-[1.03] z-10" : "opacity-85 hover:opacity-100"
                          }`}
                          title={`${field.nome} (Pos ${field.pos_inicio}–${field.pos_fim})`}
                        >
                          <div className="text-[9px] font-mono opacity-75 flex items-center justify-between gap-1.5">
                            <span>
                              [{field.pos_inicio}..{field.pos_fim}]
                            </span>
                            <span>{field.tamanho}B</span>
                          </div>
                          <div className="font-mono text-xs font-bold tracking-wider truncate max-w-[140px]">
                            {sliceVal.trim() ? sliceVal : "␣".repeat(Math.min(field.tamanho, 6))}
                          </div>
                          <div className="text-[9px] truncate max-w-[140px] opacity-90">{field.nome}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Field Deep Inspector */}
                {activeField && (
                  <div className="p-4 rounded-xl bg-blue-950/25 border border-blue-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                          Bytes {activeField.pos_inicio} a {activeField.pos_fim} ({activeField.tamanho} bytes)
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                          Formato: {activeField.formato}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400">
                          Página {activeField.pagina} do PDF
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-white">{activeField.nome}</h4>
                      <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                        {activeField.descricao || "Campo posicional oficial extraído diretamente da tabela de especificação do manual."}
                      </p>
                    </div>
                    <div className="bg-[#030711] border border-slate-800 rounded-xl px-4 py-3 shrink-0 min-w-[220px]">
                      <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">
                        Valor Decodificado na Linha
                      </div>
                      <div className="font-mono text-sm font-bold text-emerald-400 break-all">
                        &quot;{extractSlice(activeField.pos_inicio, activeField.pos_fim)}&quot;
                      </div>
                    </div>
                  </div>
                )}

                {/* Full Byte-by-Byte Table */}
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
                        <th className="py-2.5 px-3">Posição</th>
                        <th className="py-2.5 px-3">Tam.</th>
                        <th className="py-2.5 px-3">Formato</th>
                        <th className="py-2.5 px-3">Campo / Elemento</th>
                        <th className="py-2.5 px-3">Valor Extraído (Live)</th>
                        <th className="py-2.5 px-3">Especificação & Regras de Domínio</th>
                        <th className="py-2.5 px-3">Pág.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {loadingLayout ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-400">
                            Carregando estrutura posicional do SQLite...
                          </td>
                        </tr>
                      ) : (
                        layoutFields.map((field, idx) => {
                          const val = extractSlice(field.pos_inicio, field.pos_fim);
                          const isSelected = selectedFieldIdx === idx;
                          return (
                            <tr
                              key={`${field.id}-${idx}`}
                              onClick={() => setSelectedFieldIdx(idx)}
                              className={`cursor-pointer transition-colors ${
                                isSelected ? "bg-blue-950/40" : "hover:bg-slate-900/50"
                              }`}
                            >
                              <td className="py-2.5 px-3 font-mono font-bold text-blue-300 whitespace-nowrap">
                                {field.pos_inicio}–{field.pos_fim}
                              </td>
                              <td className="py-2.5 px-3 font-mono text-slate-400 whitespace-nowrap">
                                {field.tamanho}B
                              </td>
                              <td className="py-2.5 px-3 font-mono text-amber-300 whitespace-nowrap">
                                {field.formato}
                              </td>
                              <td className="py-2.5 px-3 font-semibold text-white">
                                {field.nome}
                              </td>
                              <td className="py-2.5 px-3 font-mono">
                                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-emerald-300">
                                  {val}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-slate-400 max-w-md">
                                <div className="line-clamp-2">{field.descricao || "—"}</div>
                              </td>
                              <td className="py-2.5 px-3 font-mono text-slate-400 whitespace-nowrap">
                                p.{field.pagina}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================
            TAB 2: EXPLORADOR DE CAMPOS & TABELAS (17.106 CAMPOS)
           ========================================================= */}
        {activeTab === "campos" && (
          <div className="space-y-6">
            <div className="bg-[#080f1e] border border-slate-800/80 rounded-2xl p-6 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
                    Motor SQLite (`campos.sqlite3`) · 17.106 Registros Extraídos
                  </span>
                  <h2 className="text-base font-bold text-white">
                    Busca Unificada por Registro, Tabela MPE, TC/TCR, DE, PDS ou Posição de Byte
                  </h2>
                </div>
                <div className="text-xs text-slate-400 font-mono">
                   Resultados encontrados: <strong className="text-white">{campoTotal.toLocaleString("pt-BR")}</strong>
                </div>
              </div>

              {/* Quick Filter Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] text-slate-400 mr-1">Atalhos Rápidos:</span>
                {[
                  { label: "Mastercard IP0040T1 (BIN Range)", q: "IP0040T1", bandeira: "Mastercard", de: "", pds: "", pos: "" },
                  { label: "Mastercard DE 48 / PDS 0158 (IRD)", q: "", bandeira: "Mastercard", de: "48", pds: "0158", pos: "" },
                  { label: "Visa Posição 168 (Reimbursement Attribute)", q: "Reimbursement", bandeira: "Visa", de: "", pds: "", pos: "168" },
                  { label: "Visa Fee Program Indicator (FPI)", q: "Fee Program Indicator", bandeira: "Visa", de: "", pds: "", pos: "" },
                  { label: "Visa TC 46 (VSS Settlement)", q: "TC 46", bandeira: "Visa", de: "", pds: "", pos: "" },
                  { label: "Elo IRQ (Intercâmbio Recalculado)", q: "IRQ", bandeira: "Elo", de: "", pds: "", pos: "" },
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCampoQuery(chip.q);
                      setCampoBandeira(chip.bandeira);
                      setCampoDE(chip.de);
                      setCampoPDS(chip.pds);
                      setCampoPosicao(chip.pos);
                      runSearchCampos({
                        q: chip.q,
                        bandeira: chip.bandeira,
                        de: chip.de,
                        pds: chip.pds,
                        posicao: chip.pos
                      });
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-blue-950/60 border border-slate-800 hover:border-blue-500/40 text-[11px] text-slate-300 transition-colors"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              {/* Filter Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
                <div className="lg:col-span-2">
                  <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">
                    Busca Textual (Campo, Tabela, Registro, Descrição)
                  </label>
                  <input
                    type="text"
                    value={campoQuery}
                    onChange={(e) => setCampoQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && runSearchCampos()}
                    placeholder="Ex: IP0040T1, Reimbursement, ARN, V22120..."
                    className="w-full bg-[#030711] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">
                    Bandeira
                  </label>
                  <select
                    value={campoBandeira}
                    onChange={(e) => setCampoBandeira(e.target.value)}
                    className="w-full bg-[#030711] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="ALL">Todas as Bandeiras</option>
                    <option value="Mastercard">Mastercard (7.045)</option>
                    <option value="Visa">Visa (9.284)</option>
                    <option value="Elo">Elo (777)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">
                    Manual Oficial (11)
                  </label>
                  <select
                    value={campoDocId}
                    onChange={(e) => setCampoDocId(e.target.value)}
                    className="w-full bg-[#030711] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="ALL">Todos os 11 Manuais</option>
                    {documentos.map((d) => (
                      <option key={d.doc_id} value={d.doc_id}>
                        {d.bandeira} — {d.doc_id} ({d.linhas})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">
                      DE (ISO)
                    </label>
                    <input
                      type="text"
                      value={campoDE}
                      onChange={(e) => setCampoDE(e.target.value)}
                      placeholder="Ex: 48"
                      className="w-full bg-[#030711] border border-slate-800 rounded-xl px-2.5 py-2 text-xs font-mono text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">
                      PDS (Tag)
                    </label>
                    <input
                      type="text"
                      value={campoPDS}
                      onChange={(e) => setCampoPDS(e.target.value)}
                      placeholder="0158"
                      className="w-full bg-[#030711] border border-slate-800 rounded-xl px-2.5 py-2 text-xs font-mono text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">
                      Posição Byte
                    </label>
                    <input
                      type="text"
                      value={campoPosicao}
                      onChange={(e) => setCampoPosicao(e.target.value)}
                      placeholder="Ex: 168"
                      className="w-full bg-[#030711] border border-slate-800 rounded-xl px-2.5 py-2 text-xs font-mono text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={() => runSearchCampos()}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition-colors shrink-0"
                  >
                    Filtrar
                  </button>
                </div>
              </div>
            </div>

            {/* Live Hover Inspector for Campos */}
            {hoveredCampo && (
              <div className="bg-gradient-to-r from-blue-950/40 via-[#080f1e] to-indigo-950/30 border border-blue-500/30 rounded-2xl p-5 shadow-lg transition-all">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3 mb-3">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-300 text-[10px] font-bold uppercase tracking-wider">
                      <Eye className="w-3.5 h-3.5" /> Raio-X ao Passar o Mouse
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-white">
                      {hoveredCampo.bandeira} · {hoveredCampo.doc_id} (p.{hoveredCampo.pagina})
                    </span>
                    {hoveredCampo.pos_inicio !== null && hoveredCampo.pos_fim !== null && (
                      <span className="px-2.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono text-xs font-bold">
                        Bytes {hoveredCampo.pos_inicio}–{hoveredCampo.pos_fim} ({hoveredCampo.tamanho} Bytes · Formato {hoveredCampo.formato || "N/A"})
                      </span>
                    )}
                    {(hoveredCampo.de || hoveredCampo.pds) && (
                      <span className="px-2.5 py-0.5 rounded bg-purple-500/15 border border-purple-500/30 text-purple-300 font-mono text-xs font-bold">
                        {hoveredCampo.de ? `ISO DE ${hoveredCampo.de}` : ""} {hoveredCampo.pds ? `· PDS ${hoveredCampo.pds}` : ""} {hoveredCampo.subcampo ? `· Sub ${hoveredCampo.subcampo}` : ""}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Passe o mouse sobre qualquer linha abaixo ou clique para fixar/expandir
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
                  <div className="bg-[#030711]/90 border border-slate-800/90 rounded-xl p-3.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400 mb-1">
                      Campo / Registro Oficial
                    </div>
                    <div className="text-sm font-bold text-white">{hoveredCampo.nome || hoveredCampo.registro || "Registro Técnico"}</div>
                    <div className="text-[11px] font-mono text-slate-400 mt-1">
                      Registro/Tabela: <span className="text-slate-200">{hoveredCampo.registro || hoveredCampo.tipo}</span>
                    </div>
                    {hoveredCampo.valor && (
                      <div className="mt-1.5 inline-block px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 font-mono text-[11px] text-emerald-300">
                        Código / Valor: {hoveredCampo.valor}
                      </div>
                    )}
                  </div>

                  <div className="lg:col-span-2 bg-[#030711]/90 border border-slate-800/90 rounded-xl p-3.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-1">
                      Especificação Completa do Manual ({hoveredCampo.manual_titulo} — Ed. {hoveredCampo.edicao})
                    </div>
                    <p className="text-slate-200 leading-relaxed whitespace-pre-line">
                      {hoveredCampo.descricao || "Campo estrutural mapeado diretamente das tabelas técnicas oficiais."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Results Table */}
            <div className="bg-[#080f1e] border border-slate-800/80 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-4">Bandeira / Manual</th>
                      <th className="py-3 px-3">Registro / Tabela</th>
                      <th className="py-3 px-3">Posição / DE / PDS</th>
                      <th className="py-3 px-3">Formato</th>
                      <th className="py-3 px-4">Nome do Campo / Valor</th>
                      <th className="py-3 px-4">Descrição Técnica Oficial (Passe o mouse ou clique)</th>
                      <th className="py-3 px-3">Pág. PDF</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {loadingCampos ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400">
                          Consultando 17.106 campos em `campos.sqlite3`...
                        </td>
                      </tr>
                    ) : campoResults.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400">
                          Nenhum campo encontrado com os filtros atuais.
                        </td>
                      </tr>
                    ) : (
                      campoResults.map((row) => {
                        const isExpanded = expandedCampoId === row.id;
                        const isHovered = hoveredCampo?.id === row.id;
                        return (
                          <React.Fragment key={row.id}>
                            <tr
                              onMouseEnter={() => setHoveredCampo(row)}
                              onClick={() => setExpandedCampoId(isExpanded ? null : row.id)}
                              className={`cursor-pointer transition-colors ${
                                isExpanded
                                  ? "bg-blue-950/40"
                                  : isHovered
                                  ? "bg-slate-900/80"
                                  : "hover:bg-slate-900/50"
                              }`}
                            >
                              <td className="py-2.5 px-4 whitespace-nowrap">
                                <span
                                  className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold mr-1.5 ${
                                    row.bandeira === "Visa"
                                      ? "bg-blue-500/15 text-blue-300"
                                      : row.bandeira === "Mastercard"
                                      ? "bg-amber-500/15 text-amber-300"
                                      : "bg-emerald-500/15 text-emerald-300"
                                  }`}
                                >
                                  {row.bandeira}
                                </span>
                                <div className="text-[11px] font-mono text-slate-400 mt-0.5">{row.doc_id}</div>
                              </td>
                              <td className="py-2.5 px-3 text-slate-300 font-mono text-[11px] max-w-[200px]">
                                <div className="line-clamp-2">{row.registro || row.tipo}</div>
                              </td>
                              <td className="py-2.5 px-3 font-mono whitespace-nowrap">
                                {row.pos_inicio !== null && row.pos_fim !== null ? (
                                  <span className="px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30 font-bold">
                                    Pos {row.pos_inicio}–{row.pos_fim} ({row.tamanho}B)
                                  </span>
                                ) : row.de || row.pds ? (
                                  <span className="px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30 font-bold">
                                    {row.de ? `DE ${row.de}` : ""} {row.pds ? `PDS ${row.pds}` : ""}
                                  </span>
                                ) : (
                                  <span className="text-slate-500">{row.tipo}</span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 font-mono text-amber-300 whitespace-nowrap">
                                {row.formato || "—"}
                              </td>
                              <td className="py-2.5 px-4 font-semibold text-white max-w-[240px]">
                                <div>{row.nome || "—"}</div>
                                {row.valor && (
                                  <div className="text-[11px] font-mono text-emerald-400 mt-0.5">
                                    Valor/Código: {row.valor}
                                  </div>
                                )}
                              </td>
                              <td className="py-2.5 px-4 text-slate-300 max-w-md">
                                <div className={isExpanded ? "leading-relaxed text-white" : "line-clamp-2 leading-relaxed"}>
                                  {row.descricao || "—"}
                                </div>
                                <div className="text-[10px] text-blue-400 mt-1 flex items-center gap-1 font-medium">
                                  {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                  {isExpanded ? "Ocultar ficha técnica" : "Clique para expandir ficha completa"}
                                </div>
                              </td>
                              <td className="py-2.5 px-3 font-mono text-slate-400 whitespace-nowrap">
                                p.{row.pagina}
                              </td>
                            </tr>
                            {isExpanded && (
                              <tr className="bg-blue-950/25 border-b border-blue-500/30">
                                <td colSpan={7} className="p-4">
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                    <div className="bg-[#030711] border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                                      <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                                        Origem Normativa & Localização
                                      </div>
                                      <div className="text-white font-semibold">{row.manual_titulo}</div>
                                      <div className="text-slate-400 font-mono text-[11px]">
                                        Doc ID: {row.doc_id} · Edição: {row.edicao} · Página PDF: {row.pagina}
                                      </div>
                                      <div className="text-slate-300 font-mono text-[11px]">
                                        Tipo: {row.tipo} · Registro: {row.registro || "—"}
                                      </div>
                                    </div>
                                    <div className="md:col-span-2 bg-[#030711] border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                                      <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                                        Texto Integral da Regra / Descrição do Campo
                                      </div>
                                      <p className="text-slate-200 leading-relaxed whitespace-pre-line">
                                        {row.descricao || "Sem descrição textual adicional."}
                                      </p>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 3: MOTOR DE FATURAMENTO MCBS (2.267) & VISA VSS (10.914)
           ========================================================= */}
        {activeTab === "billing" && (
          <div className="space-y-6">
            <div className="bg-[#080f1e] border border-slate-800/80 rounded-2xl p-6 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400">
                    Motor de Scheme Fees & Billing Events · Brasil & Cross-Border
                  </span>
                  <h2 className="text-base font-bold text-white">
                    Consulta Integrada: 2.267 Eventos MCBS Brasil (`Manual MCBS - Billing - BRAZIL.pdf`) + 10.914 Visa Billing Lines
                  </h2>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300">
                    MCBS: {billingTotals.mcbs.toLocaleString("pt-BR")}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300">
                    Visa VSS: {billingTotals.visa.toLocaleString("pt-BR")}
                  </span>
                </div>
              </div>

              {/* Quick Billing Search Chips */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] text-slate-400">Consultas Frequentes:</span>
                {[
                  { label: "Mastercard 2AB1006", q: "2AB1006", brand: "Mastercard" },
                  { label: "Mastercard Digital Enablement (2NW)", q: "2NW", brand: "Mastercard" },
                  { label: "Mastercard 3DS / Identity Check", q: "Identity Check", brand: "Mastercard" },
                  { label: "Mastercard Chargeback (1CA / 2CA)", q: "Chargeback", brand: "Mastercard" },
                  { label: "Visa Internacional / Cross-Border", q: "International", brand: "Visa" },
                  { label: "Visa Token / VTS", q: "Token", brand: "Visa" },
                ].map((chip, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setBillingQuery(chip.q);
                      setBillingBrand(chip.brand);
                      runSearchBilling({ q: chip.q, brand: chip.brand });
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-purple-950/50 border border-slate-800 hover:border-purple-500/40 text-[11px] text-slate-300 transition-colors"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              {/* Billing Filter Controls */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-1">
                <div className="md:col-span-2">
                  <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">
                    Código de Evento MCBS / Billing Line Visa / Palavra-Chave
                  </label>
                  <input
                    type="text"
                    value={billingQuery}
                    onChange={(e) => setBillingQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && runSearchBilling()}
                    placeholder="Ex: 2AB1006, 2NW0519, Cross Border, Token, Dispute..."
                    className="w-full bg-[#030711] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">
                    Bandeira / Sistema
                  </label>
                  <select
                    value={billingBrand}
                    onChange={(e) => setBillingBrand(e.target.value)}
                    className="w-full bg-[#030711] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="ALL">Mastercard MCBS + Visa VSS</option>
                    <option value="Mastercard">Mastercard MCBS Brasil (2.267)</option>
                    <option value="Visa">Visa VSS Billing Lines (10.914)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">
                    Quem Paga (Sujeito Passivo)
                  </label>
                  <select
                    value={billingRole}
                    onChange={(e) => setBillingRole(e.target.value)}
                    className="w-full bg-[#030711] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="ALL">Todos (Adquirente & Emissor)</option>
                    <option value="Adquirente">Cobrado do Adquirente (Acquirer)</option>
                    <option value="Emissor">Cobrado do Emissor (Issuer)</option>
                  </select>
                </div>

                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">
                      Service ID (MCBS)
                    </label>
                    <select
                      value={billingServiceId}
                      onChange={(e) => setBillingServiceId(e.target.value)}
                      className="w-full bg-[#030711] border border-slate-800 rounded-xl px-2.5 py-2 text-xs font-mono text-white focus:border-purple-500 focus:outline-none"
                    >
                      <option value="ALL">Todos</option>
                      {mcbsServiceIds.map((sid) => (
                        <option key={sid} value={sid}>
                          Service {sid}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={() => runSearchBilling()}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white transition-colors shrink-0"
                  >
                    Buscar
                  </button>
                </div>
              </div>
            </div>

            {/* LIVE HOVER INSPECTOR FOR BILLING (RAIO-X DO EVENTO) */}
            {hoveredBilling && (
              <div className="bg-gradient-to-r from-purple-950/40 via-[#080f1e] to-blue-950/30 border border-purple-500/40 rounded-2xl p-5 shadow-xl transition-all">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3 mb-4">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/20 border border-purple-500/40 text-purple-200 text-[10px] font-bold uppercase tracking-wider">
                      <Eye className="w-3.5 h-3.5" /> Raio-X do Evento (Passe o mouse ou clique na linha)
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                        hoveredBilling.bandeira === "Mastercard"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          : "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                      }`}
                    >
                      {hoveredBilling.bandeira} · {hoveredBilling.sistema}
                    </span>
                    <span className="px-3 py-0.5 rounded-lg bg-slate-900 border border-purple-500/40 font-mono text-sm font-extrabold text-purple-300">
                      {hoveredBilling.codigo}
                    </span>
                    <span className="px-2.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-xs font-mono text-slate-200">
                      Service {hoveredBilling.serviceId} — {hoveredBilling.serviceLabelPt || "Serviço Regulamentado"}
                    </span>
                    <span className="px-2.5 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold">
                      Quem Paga: {hoveredBilling.quemPaga}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    Fonte: {hoveredBilling.fonte}
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs">
                  {/* Col 1: O que é em Português Claro */}
                  <div className="lg:col-span-5 bg-[#030711]/90 border border-slate-800/90 rounded-xl p-4 space-y-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5" /> Do que se trata (Explicação Executiva)
                    </div>
                    <div className="text-sm font-bold text-white">{hoveredBilling.nome}</div>
                    <p className="text-slate-200 leading-relaxed">
                      {hoveredBilling.explicacaoPt ||
                        `Evento oficial de faturamento ${hoveredBilling.sistema} (${hoveredBilling.codigo}) aplicável ao ${hoveredBilling.quemPaga}.`}
                    </p>
                    <div className="pt-2 border-t border-slate-800/80">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-0.5">
                        Gatilho Técnico & Mensageria:
                      </span>
                      <span className="text-slate-300">
                        {hoveredBilling.gatilhoPt || "Disparado conforme regra de negócio do evento e liquidado na fatura da bandeira."}
                      </span>
                    </div>
                  </div>

                  {/* Col 2: Regra Normativa Original Completa */}
                  <div className="lg:col-span-4 bg-[#030711]/90 border border-slate-800/90 rounded-xl p-4 space-y-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                      Regra Oficial Completa (Manual da Bandeira)
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      {hoveredBilling.descricao}
                    </p>
                    <div className="pt-2 border-t border-slate-800/80">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                        Como Conciliar no Backoffice:
                      </span>
                      <span className="text-slate-200 font-medium">{hoveredBilling.reconciliacao}</span>
                    </div>
                  </div>

                  {/* Col 3: Alíquotas e Tiers Limpos */}
                  <div className="lg:col-span-3 bg-[#030711]/90 border border-emerald-500/30 rounded-xl p-4 space-y-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                      Alíquotas & Tiers Extraídos ({hoveredBilling.rates?.length || 0})
                    </div>
                    {hoveredBilling.rates && hoveredBilling.rates.length > 0 ? (
                      <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                        {hoveredBilling.rates.map((r, i) => (
                          <div
                            key={i}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 font-mono text-xs text-emerald-200 font-semibold"
                          >
                            {r}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-slate-400 text-[11px] leading-relaxed">
                        Tarifa variável por faixa de volume mensal (Tiered Schedule) ou cotação cambial da fatura. Consulte a página indicada em <strong className="text-white">{hoveredBilling.fonte}</strong>.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Billing Cards / Table */}
            <div className="bg-[#080f1e] border border-slate-800/80 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-4">Bandeira</th>
                      <th className="py-3 px-3">Event ID / Billing Line</th>
                      <th className="py-3 px-3">Service / Grupo</th>
                      <th className="py-3 px-3">Quem Paga</th>
                      <th className="py-3 px-4">Nome & Explicação (Passe o mouse ou clique)</th>
                      <th className="py-3 px-4">Alíquotas / Tiers Extraídos</th>
                      <th className="py-3 px-4">Conciliação & Fonte</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {loadingBilling ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400">
                          Consultando os 13.181 eventos de faturamento MCBS Brasil e Visa VSS...
                        </td>
                      </tr>
                    ) : billingResults.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400">
                          Nenhum evento de faturamento encontrado para o filtro selecionado.
                        </td>
                      </tr>
                    ) : (
                      billingResults.map((b, idx) => {
                        const rowKey = `${b.codigo}-${idx}`;
                        const isExpanded = expandedBillingKey === rowKey;
                        const isHovered = hoveredBilling?.codigo === b.codigo && hoveredBilling?.fonte === b.fonte;
                        return (
                          <React.Fragment key={rowKey}>
                            <tr
                              onMouseEnter={() => setHoveredBilling(b)}
                              onClick={() => setExpandedBillingKey(isExpanded ? null : rowKey)}
                              className={`cursor-pointer transition-colors ${
                                isExpanded
                                  ? "bg-purple-950/35"
                                  : isHovered
                                  ? "bg-slate-900/80"
                                  : "hover:bg-slate-900/50"
                              }`}
                            >
                              <td className="py-3 px-4 whitespace-nowrap">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    b.bandeira === "Mastercard"
                                      ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                                      : "bg-blue-500/15 text-blue-300 border border-blue-500/30"
                                  }`}
                                >
                                  {b.bandeira}
                                </span>
                              </td>
                              <td className="py-3 px-3 font-mono font-bold text-purple-300 whitespace-nowrap">
                                {b.codigo}
                              </td>
                              <td className="py-3 px-3 whitespace-nowrap">
                                <div className="font-mono font-bold text-slate-200">{b.serviceId}</div>
                                {b.serviceLabelPt && (
                                  <div className="text-[10px] text-slate-400 max-w-[150px] truncate" title={b.serviceLabelPt}>
                                    {b.serviceLabelPt}
                                  </div>
                                )}
                              </td>
                              <td className="py-3 px-3 whitespace-nowrap">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                    b.quemPaga.includes("Adquirente") && !b.quemPaga.includes("Emissor")
                                      ? "bg-cyan-500/15 text-cyan-300"
                                      : b.quemPaga.includes("Emissor") && !b.quemPaga.includes("Adquirente")
                                      ? "bg-rose-500/15 text-rose-300"
                                      : "bg-slate-800 text-slate-300"
                                  }`}
                                >
                                  {b.quemPaga}
                                </span>
                              </td>
                              <td className="py-3 px-4 max-w-md">
                                <div className="font-bold text-white">{b.nome}</div>
                                {b.explicacaoPt && (
                                  <div className="text-purple-300/90 text-[11px] font-medium mt-0.5 line-clamp-1">
                                    {b.explicacaoPt}
                                  </div>
                                )}
                                <div className="text-slate-400 text-[11px] line-clamp-2 mt-0.5">{b.descricao}</div>
                                <div className="text-[10px] text-purple-400 mt-1 flex items-center gap-1 font-medium">
                                  {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                  {isExpanded ? "Ocultar detalhes" : "Passe o mouse ou clique para abrir Raio-X"}
                                </div>
                              </td>
                              <td className="py-3 px-4 font-mono text-[11px] text-emerald-300 max-w-xs">
                                {b.rates && b.rates.length > 0 ? (
                                  <div className="space-y-1">
                                    {b.rates.slice(0, 3).map((r, i) => (
                                      <div
                                        key={i}
                                        className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 truncate"
                                        title={r}
                                      >
                                        • {r}
                                      </div>
                                    ))}
                                    {b.rates.length > 3 && (
                                      <div className="text-[10px] text-emerald-400 pl-1">
                                        + {b.rates.length - 3} faixas/regiões (passe o mouse)
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-slate-500">Por faixa de volume (ver manual)</span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-[11px] text-slate-400">
                                <div className="text-slate-200 font-medium">{b.reconciliacao}</div>
                                <div className="font-mono text-[10px] text-slate-400 mt-0.5">{b.fonte}</div>
                              </td>
                            </tr>
                            {isExpanded && (
                              <tr className="bg-purple-950/25 border-b border-purple-500/30">
                                <td colSpan={7} className="p-4">
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                    <div className="bg-[#030711] border border-slate-800 rounded-xl p-4 space-y-2">
                                      <div className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                                        O que é esta tarifa (Português)
                                      </div>
                                      <p className="text-slate-200 leading-relaxed">
                                        {b.explicacaoPt || b.descricao}
                                      </p>
                                      {b.gatilhoPt && (
                                        <div className="pt-2 border-t border-slate-800 text-slate-300">
                                          <strong className="text-amber-300">Gatilho:</strong> {b.gatilhoPt}
                                        </div>
                                      )}
                                    </div>
                                    <div className="bg-[#030711] border border-slate-800 rounded-xl p-4 space-y-2">
                                      <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                                        Descrição Original Completa ({b.fonte})
                                      </div>
                                      <p className="text-slate-200 leading-relaxed">{b.descricao}</p>
                                      <div className="pt-2 border-t border-slate-800 text-slate-400">
                                        <strong className="text-slate-200">Conciliação:</strong> {b.reconciliacao}
                                      </div>
                                    </div>
                                    <div className="bg-[#030711] border border-slate-800 rounded-xl p-4 space-y-2">
                                      <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                                        Todas as Alíquotas & Regiões Extraídas
                                      </div>
                                      {b.rates && b.rates.length > 0 ? (
                                        <div className="space-y-1.5">
                                          {b.rates.map((r, i) => (
                                            <div
                                              key={i}
                                              className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/25 font-mono text-emerald-200"
                                            >
                                              • {r}
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <p className="text-slate-400">
                                          Alíquota escalonada por tier de volume no manual oficial ({b.fonte}).
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 4: ARQUITETURA DOS 11 MANUAIS & MATRIZ OPERACIONAL
           ========================================================= */}
        {activeTab === "arquitetura" && (
          <div className="space-y-6">
            {/* 11 Indexed Manuals Table */}
            <div className="bg-[#080f1e] border border-slate-800/80 rounded-2xl p-6 space-y-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                  Rastreabilidade Normativa · 11 Manuais Técnicos Indexados em `campos.sqlite3`
                </span>
                <h2 className="text-base font-bold text-white mt-0.5">
                  Catálogo de Manuais de Mensageria, Clearing, Tabelas MPE e Relatórios de Liquidação (Edições 2026)
                </h2>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-4">ID do Documento</th>
                      <th className="py-3 px-3">Bandeira</th>
                      <th className="py-3 px-4">Título Oficial do Manual</th>
                      <th className="py-3 px-3">Edição / Release</th>
                      <th className="py-3 px-3">Páginas</th>
                      <th className="py-3 px-3">Campos Extraídos</th>
                      <th className="py-3 px-3">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {documentos.map((doc) => (
                      <tr key={doc.doc_id} className="hover:bg-slate-900/50">
                        <td className="py-3 px-4 font-mono font-bold text-blue-300">{doc.doc_id}</td>
                        <td className="py-3 px-3">{doc.bandeira}</td>
                        <td className="py-3 px-4 font-semibold text-white">{doc.titulo}</td>
                        <td className="py-3 px-3 font-mono text-slate-300">{doc.edicao}</td>
                        <td className="py-3 px-3 font-mono text-slate-400">{doc.paginas} págs</td>
                        <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                          {doc.linhas.toLocaleString("pt-BR")}
                        </td>
                        <td className="py-3 px-3">
                          <button
                            onClick={() => {
                              setCampoDocId(doc.doc_id);
                              setCampoBandeira("ALL");
                              setActiveTab("campos");
                              runSearchCampos({ doc_id: doc.doc_id, bandeira: "ALL" });
                            }}
                            className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 text-[11px] font-semibold transition-colors"
                          >
                            Explorar Campos →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Operational Comparison Matrix */}
            <div className="bg-[#080f1e] border border-slate-800/80 rounded-2xl p-6 space-y-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
                  Arquitetura Comparada · Quem Envia → Quem Recebe → Como Concilia
                </span>
                <h2 className="text-base font-bold text-white mt-0.5">
                  Equivalência de Sistemas entre Mastercard (GCMS/MPE/MCBS), Visa (Base II/VSS) e Elo (26.2)
                </h2>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-4">Etapa Operacional</th>
                      <th className="py-3 px-4">Mastercard (GCMS / IPM / MCBS)</th>
                      <th className="py-3 px-4">Visa (Base I / Base II / VSS)</th>
                      <th className="py-3 px-4">Elo (Mensageria 26.2)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    <tr>
                      <td className="py-3 px-4 font-bold text-white">1. Tabelas de Parâmetros & BINs</td>
                      <td className="py-3 px-4">
                        <strong>MPE (Mastercard Parameter Extract)</strong>: Tabelas <code className="text-amber-300">IP0040T1</code> (BIN Range), <code className="text-amber-300">IP0052T1</code> (Fee Group), <code className="text-amber-300">IP0053T1</code> (Fee Type) e <code className="text-amber-300">IP0072T1</code> (ICA Member).
                      </td>
                      <td className="py-3 px-4">
                        <strong>ARDEF / TC 55 RCRF</strong>: Tabelas de Account Range e Edit Package 4.0 (<code className="text-blue-300">visa_tc50_92</code>).
                      </td>
                      <td className="py-3 px-4">
                        <strong>Tabela de BINs Elo</strong> + Range Inferior/Superior nos registros de liquidação.
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-white">2. Apresentação de Clearing (Compra)</td>
                      <td className="py-3 px-4">
                        <strong>Arquivo IPM</strong>: Mensagem <code className="text-amber-300">MTI 1240 / Function 200</code> (First Presentment). Formato variável ISO 8583 com DEs e PDS (<code className="text-amber-300">PDS 0158</code> = IRD).
                      </td>
                      <td className="py-3 px-4">
                        <strong>Base II Draft Data</strong>: <code className="text-blue-300">TC 05 / TC 06 / TC 07</code> em blocos fixos de <strong>168 bytes</strong> (<code className="text-blue-300">TCR 0, TCR 1, TCR 2 BR, TCR 5, TCR 7</code>).
                      </td>
                      <td className="py-3 px-4">
                        <strong>Arquivo de Liquidação Elo</strong>: Registros posicionais de até 1.000 bytes (<code className="text-emerald-300">B0, 00, 01, 02, 05, 07 SDR, BZ</code>).
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-white">3. Qualificador da Tarifa de Intercâmbio</td>
                      <td className="py-3 px-4">
                        <strong>IRD (Interchange Rate Designator)</strong>: 2 caracteres enviados no <code className="text-amber-300">DE 48 / PDS 0158</code> e calculados via <code className="text-amber-300">IP0052T1 → IP0053T1</code>.
                      </td>
                      <td className="py-3 px-4">
                        <strong>Reimbursement Attribute</strong> (Posição 168 do TCR 0) + <strong>Fee Program Indicator (FPI)</strong> (Posições 76–78 do TCR 1).
                      </td>
                      <td className="py-3 px-4">
                        <strong>IRQ (Código de Classificação da Taxa)</strong>: 8 posições alfanuméricas (ex: Posições 159–166 do <code className="text-emerald-300">Registro 45</code>).
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-white">4. Relatórios de Liquidação & Intercâmbio</td>
                      <td className="py-3 px-4">
                        <strong>GCMS Reports</strong>: <code className="text-amber-300">IP755120-AA</code> (Clearing Detail), <code className="text-amber-300">IP755020-AA</code> (Interchange Detail), <code className="text-amber-300">IP714010-AA</code> (Accepted Errors).
                      </td>
                      <td className="py-3 px-4">
                        <strong>Visa Settlement Service (VSS)</strong>: <code className="text-blue-300">VSS-110</code> (Summary), <code className="text-blue-300">VSS-120/130</code> (Interchange), raw <code className="text-blue-300">TC 46 Subgroup 4</code> e <code className="text-blue-300">V22120</code>.
                      </td>
                      <td className="py-3 px-4">
                        <strong>Elo Settlement Reports 26.2</strong> + <code className="text-emerald-300">Registro 45</code> (Intercâmbios Recalculados) e <code className="text-emerald-300">Registro 25</code> (Detalhe de FEEs).
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-white">5. Faturamento da Bandeira (Scheme Fees)</td>
                      <td className="py-3 px-4">
                        <strong>MCBS (Mastercard Consolidated Billing System)</strong>: 2.267 eventos no manual Brasil, cobrados via <code className="text-amber-300">IPM MTI 1740</code> e fatura MCBS por Service ID (<code className="text-amber-300">AA, AB, CA, CI, 2NW...</code>).
                      </td>
                      <td className="py-3 px-4">
                        <strong>VSS-140 (Visa Charges)</strong>: 10.914 linhas de faturamento (<code className="text-blue-300">Billing Lines</code>) reportadas no <code className="text-blue-300">VSS-140</code> / <code className="text-blue-300">TC 46 Subgroup 5</code>.
                      </td>
                      <td className="py-3 px-4">
                        <strong>Relatórios de Tarifas & Fee Collection Elo</strong> (<code className="text-emerald-300">Registro 25</code> e relatórios de billing).
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
