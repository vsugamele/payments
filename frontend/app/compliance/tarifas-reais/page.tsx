"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft, DollarSign, Search, Scale, Layers, Database,
  Download, FileSpreadsheet, Filter, Tag, Building2, Info, CheckCircle2
} from "lucide-react";

type TabType = "intercambio" | "mcc_segmentos" | "elo_mcc" | "planilhas" | "artigos" | "downloads";

export default function TarifasReaisPage() {
  const [activeTab, setActiveTab] = useState<TabType>("intercambio");

  const [stats, setStats] = useState<any>(null);
  const [tarifasCuradas, setTarifasCuradas] = useState<any[]>([]);
  const [sqliteTarifas, setSqliteTarifas] = useState<any[]>([]);
  const [schemeFeesPlanilhas, setSchemeFeesPlanilhas] = useState<any[]>([]);
  const [eloMccReducao, setEloMccReducao] = useState<any[]>([]);
  const [eloFeeLegenda, setEloFeeLegenda] = useState<any[]>([]);
  const [eloRaizesSample, setEloRaizesSample] = useState<any[]>([]);
  const [visaPids, setVisaPids] = useState<any[]>([]);
  const [visaMccCriterios, setVisaMccCriterios] = useState<any[]>([]);
  const [mastercardMccSegmentos, setMastercardMccSegmentos] = useState<any[]>([]);
  const [mastercardCodigos, setMastercardCodigos] = useState<any[]>([]);
  const [eloMccSegmentos, setEloMccSegmentos] = useState<any[]>([]);
  const [eloAnotacao, setEloAnotacao] = useState<string>("");
  const [arquivosCatalogo, setArquivosCatalogo] = useState<any[]>([]);

  // Intercâmbio search state
  const [icQuery, setIcQuery] = useState("");
  const [icBandeira, setIcBandeira] = useState("ALL");
  const [icModalidade, setIcModalidade] = useState("ALL");
  const [icTipoRegra, setIcTipoRegra] = useState("ALL");
  const [icLimit, setIcLimit] = useState(250);
  const [icResults, setIcResults] = useState<any[]>([]);
  const [icTotal, setIcTotal] = useState(0);
  const [loadingIc, setLoadingIc] = useState(false);

  // Sub-states for MCC Segmentos tab
  const [mccSubTab, setMccSubTab] = useState<"visa" | "mastercard" | "elo">("visa");
  const [mccSegSearch, setMccSegSearch] = useState("");

  // Sub-states for Elo Fee tab
  const [eloSubTab, setEloSubTab] = useState<"mcc" | "raizes" | "legenda">("mcc");
  const [mccFilter, setMccFilter] = useState("");
  const [eloDetailedCols, setEloDetailedCols] = useState(true);
  const [raizFilter, setRaizFilter] = useState("");

  // Filters for Scheme Fees Planilhas
  const [sfBandeira, setSfBandeira] = useState("ALL");
  const [sfSearch, setSfSearch] = useState("");

  // Filters for Artigos SQLite
  const [artigoFilter, setArtigoFilter] = useState("");

  // Filters for Central de Downloads
  const [dlCatFilter, setDlCatFilter] = useState("ALL");
  const [dlBrandFilter, setDlBrandFilter] = useState("ALL");
  const [dlSearch, setDlSearch] = useState("");

  useEffect(() => {
    async function loadOverview() {
      try {
        const res = await fetch("/api/admin/tarifas-reais?action=overview");
        const data = await res.json();
        if (data.connected) {
          setStats(data.stats);
          setTarifasCuradas(data.tarifasCuradas || []);
          setSqliteTarifas(data.sqliteTarifas || []);
          setSchemeFeesPlanilhas(data.schemeFeesPlanilhas || []);
          setEloMccReducao(data.eloMccReducao || []);
          setEloFeeLegenda(data.eloFeeLegenda || []);
          setEloRaizesSample(data.eloRaizesSample || []);
          setVisaPids(data.visaPids || []);
          setVisaMccCriterios(data.visaMccCriterios || []);
          setMastercardMccSegmentos(data.mastercardMccSegmentos || []);
          setMastercardCodigos(data.mastercardCodigos || []);
          setEloMccSegmentos(data.eloMccSegmentos || []);
          setEloAnotacao(data.eloAnotacao || "");
          setArquivosCatalogo(data.arquivosCatalogo || []);
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadOverview();
  }, []);

  const runSearchIc = useCallback(async (overrides?: any) => {
    setLoadingIc(true);
    try {
      const payload = {
        action: "search_intercambio",
        q: overrides?.q !== undefined ? overrides.q : icQuery,
        bandeira: overrides?.bandeira !== undefined ? overrides.bandeira : icBandeira,
        modalidade: overrides?.modalidade !== undefined ? overrides.modalidade : icModalidade,
        tipo_regra: overrides?.tipo_regra !== undefined ? overrides.tipo_regra : icTipoRegra,
        limit: overrides?.limit !== undefined ? overrides.limit : icLimit
      };
      const res = await fetch("/api/admin/tarifas-reais", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.connected) {
        setIcResults(data.results || []);
        setIcTotal(data.totalMatches || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingIc(false);
    }
  }, [icQuery, icBandeira, icModalidade, icTipoRegra, icLimit]);

  useEffect(() => {
    runSearchIc();
  }, [runSearchIc]);

  const exportIntercambioCsv = () => {
    if (!icResults.length) return;
    const headers = [
      "Bandeira", "Modalidade", "Tipo_Regra", "Tabela", "Programa",
      "Produto_IRD_PID", "Segmento", "Parcelas", "Captura",
      "Aliquota_Pct", "Valor_Fixo_BRL", "Teto_Cap_BRL", "Fonte"
    ];
    const rows = icResults.map((r) => [
      r.bandeira || "",
      r.modalidade || "",
      r.tipo_regra || "Taxa Base",
      r.tabela || "",
      `"${String(r.programa || "").replace(/"/g, '""')}"`,
      `"${String(r.produto_ird || "").replace(/"/g, '""')}"`,
      `"${String(r.segmento || "").replace(/"/g, '""')}"`,
      `"${String(r.parcelas || "").replace(/"/g, '""')}"`,
      `"${String(r.captura || "").replace(/"/g, '""')}"`,
      r.aliquota_pct ?? "",
      r.valor_fixo_brl ?? "",
      r.teto_brl ?? "",
      `"${String(r.fonte || "").replace(/"/g, '""')}"`
    ]);
    const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map((e) => e.join(";"))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `intercambio_filtrado_${icBandeira.toLowerCase()}_${icResults.length}regras.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredArtigos = useMemo(() => {
    return sqliteTarifas.filter((t) => {
      if (!artigoFilter.trim()) return true;
      const q = artigoFilter.toLowerCase();
      return (
        (t.bandeira || "").toLowerCase().includes(q) ||
        (t.artigo || "").toLowerCase().includes(q) ||
        (t.titulo_artigo || "").toLowerCase().includes(q) ||
        (t.tarifa || "").toLowerCase().includes(q) ||
        (t.linha_faturamento || "").toLowerCase().includes(q) ||
        (t.descricao_linha || "").toLowerCase().includes(q)
      );
    });
  }, [sqliteTarifas, artigoFilter]);

  const filteredEloMcc = useMemo(() => {
    return eloMccReducao.filter((m) => {
      if (!mccFilter.trim()) return true;
      return String(m.mcc || "").toLowerCase().includes(mccFilter.toLowerCase());
    });
  }, [eloMccReducao, mccFilter]);

  const filteredRaizes = useMemo(() => {
    return eloRaizesSample.filter((r) => {
      if (!raizFilter.trim()) return true;
      return String(r.raiz_cnpj || "").toLowerCase().includes(raizFilter.toLowerCase());
    });
  }, [eloRaizesSample, raizFilter]);

  const filteredSchemeFees = useMemo(() => {
    return schemeFeesPlanilhas.filter((sf) => {
      if (sfBandeira !== "ALL" && sf.bandeira !== sfBandeira) return false;
      if (sfSearch.trim()) {
        const q = sfSearch.toLowerCase();
        const hay = `${sf.tarifa || ""} ${sf.regiao || ""} ${sf.forma || ""} ${sf.plataforma || ""} ${sf.produto || ""} ${sf.aba || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [schemeFeesPlanilhas, sfBandeira, sfSearch]);

  const filteredDownloads = useMemo(() => {
    return arquivosCatalogo.filter((item) => {
      if (dlCatFilter !== "ALL" && item.categoria !== dlCatFilter) return false;
      if (dlBrandFilter !== "ALL" && item.bandeira !== dlBrandFilter) return false;
      if (dlSearch.trim()) {
        const q = dlSearch.toLowerCase();
        const hay = `${item.nome} ${item.titulo} ${item.descricao} ${item.bandeira} ${item.categoria} ${(item.abas || []).join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [arquivosCatalogo, dlCatFilter, dlBrandFilter, dlSearch]);

  const formatSize = (kb: number) => {
    if (!kb) return "—";
    if (kb >= 1024) return `${(kb / 1024).toFixed(1)} MB`;
    return `${kb.toFixed(1)} KB`;
  };

  const formatRateDisplay = (r: any) => {
    const tipo = r.tipo_regra || "Taxa Base";
    if (tipo === "Large Ticket (Fixo + %)") {
      const fixo = r.valor_fixo_brl != null ? `R$ ${Number(r.valor_fixo_brl).toFixed(2)}` : "";
      const pct = typeof r.aliquota_pct === "number" ? `${r.aliquota_pct.toFixed(2)}%` : r.aliquota_pct;
      return `${fixo} + ${pct}`;
    }
    if (tipo === "Acréscimo (+)" && typeof r.aliquota_pct === "number") {
      return `+${r.aliquota_pct.toFixed(2)}%`;
    }
    if (tipo === "Desconto (-)" && typeof r.aliquota_pct === "number") {
      return `-${r.aliquota_pct.toFixed(2)}%`;
    }
    if (typeof r.aliquota_pct === "number") {
      return `${r.aliquota_pct.toFixed(2)}%`;
    }
    return String(r.aliquota_pct ?? "—");
  };

  const formatTierRange = (sf: any) => {
    if (sf.tier_inicio == null && sf.tier_fim == null) return "Sem Faixa (Flat)";
    const ini = sf.tier_inicio != null ? Number(sf.tier_inicio).toLocaleString("pt-BR") : "0";
    const fim = sf.tier_fim != null && sf.tier_fim !== "" ? Number(sf.tier_fim).toLocaleString("pt-BR") : "∞";
    const crit = sf.criterio_tier || sf.tier_tipo || "";
    return `${ini} a ${fim}${crit ? ` (${crit})` : ""}`;
  };

  return (
    <div className="min-h-screen bg-[#02050b] text-slate-200 pb-24">
      {/* Header */}
      <div className="border-b border-slate-800/80 bg-[#050b16]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  100% Extraído (`Tabelas/*.xlsx` + `tarifas.sqlite3`)
                </span>
                <button
                  onClick={() => setActiveTab("downloads")}
                  className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/40 hover:bg-blue-500/30 transition-colors flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  Central de Downloads ({stats?.totalArquivosDownload || 20} Planilhas .xlsx)
                </button>
              </div>
              <h1 className="text-lg md:text-xl font-bold text-white mt-0.5">
                Motor Real de Tabelas de Intercâmbio (Visa, MC, Elo), Redução MCC, Scheme Fees & Downloads
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400">Regras Intercâmbio: </span>
              <strong className="font-mono text-emerald-400">{stats?.totalIntercambioRows || 2103}</strong>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400">MCCs & Segmentos: </span>
              <strong className="font-mono text-cyan-300">
                {(stats?.totalVisaMccCriterios || 326) + (stats?.totalMastercardMccSegmentos || 76) + (stats?.totalEloMccSegmentos || 21)}
              </strong>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400">Redução Fee Elo: </span>
              <strong className="font-mono text-amber-300">{stats?.totalEloMccReducao || 381} MCCs · 311k CNPJs</strong>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400">Planilhas .xlsx: </span>
              <strong className="font-mono text-blue-300">{stats?.totalArquivosDownload || 20}</strong>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-2 overflow-x-auto border-t border-slate-800/50 pt-2 pb-2">
          <button
            onClick={() => setActiveTab("intercambio")}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === "intercambio"
                ? "bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-600/25"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            1. Intercâmbio Completo (2.103 Regras — Base, Ajustes & Large Ticket)
          </button>

          <button
            onClick={() => setActiveTab("mcc_segmentos")}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === "mcc_segmentos"
                ? "bg-cyan-600 text-white font-bold shadow-lg shadow-cyan-600/25"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            2. MCCs, Critérios NNSS & PIDs (451 Mapeamentos)
          </button>

          <button
            onClick={() => setActiveTab("elo_mcc")}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === "elo_mcc"
                ? "bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/25"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            3. Redução Fee Elo (381 MCCs + 311k Raízes CNPJ + Legenda)
          </button>

          <button
            onClick={() => setActiveTab("planilhas")}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === "planilhas"
                ? "bg-purple-600 text-white font-bold shadow-lg shadow-purple-600/25"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            4. Fee de Bandeira & Tiers (114 Faixas MC & Visa)
          </button>

          <button
            onClick={() => setActiveTab("artigos")}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === "artigos"
                ? "bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/25"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            5. Tarifas de Boletins (`tarifas.sqlite3` — 89 Tabelas)
          </button>

          <button
            onClick={() => setActiveTab("downloads")}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === "downloads"
                ? "bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/25"
                : "text-slate-400 hover:text-white hover:bg-slate-900 border border-indigo-500/30"
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            6. Central de Downloads (20 Arquivos .xlsx)
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-8">
        {/* =====================================================
            TAB 1: 2.103 REGRAS REAIS DE INTERCÂMBIO
           ===================================================== */}
        {activeTab === "intercambio" && (
          <div className="space-y-6">
            <div className="bg-[#080f1e] border border-slate-800/80 rounded-2xl p-6 space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                    Planilhas Oficiais Extraídas (`tabela_Intercambio Visa / Master / Elo.xlsx`)
                  </span>
                  <h2 className="text-base font-bold text-white">
                    Taxas Base (1.128), Acréscimos (+594), Descontos (-251) e Large Ticket Table 77 (116)
                  </h2>
                </div>

                {/* Quick Download Bar for Intercâmbio */}
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href="/api/admin/tarifas-reais?action=download&file=tabela_intercambio_visa"
                    className="px-3 py-1.5 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Visa (.xlsx)
                  </a>
                  <a
                    href="/api/admin/tarifas-reais?action=download&file=tabela_intercambio_master"
                    className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Mastercard (.xlsx)
                  </a>
                  <a
                    href="/api/admin/tarifas-reais?action=download&file=tabela_intercambio_elo"
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Elo (.xlsx)
                  </a>
                  <button
                    onClick={exportIntercambioCsv}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                    Exportar Filtro (.csv)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">
                    Buscar por IRD, PID, Programa, Parcelas, Captura ou Segmento
                  </label>
                  <input
                    type="text"
                    value={icQuery}
                    onChange={(e) => setIcQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && runSearchIc()}
                    placeholder="Ex: Infinite, Black, NFC, Large Ticket, SprMkt, Table 77, IRD..."
                    className="w-full bg-[#030711] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">
                    Bandeira
                  </label>
                  <select
                    value={icBandeira}
                    onChange={(e) => {
                      setIcBandeira(e.target.value);
                      runSearchIc({ bandeira: e.target.value });
                    }}
                    className="w-full bg-[#030711] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="ALL">Todas (2.103 — Visa 866 · MC 820 · Elo 417)</option>
                    <option value="Visa">Visa (866 regras)</option>
                    <option value="Mastercard">Mastercard (820 regras)</option>
                    <option value="Elo">Elo (417 regras)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">
                    Modalidade
                  </label>
                  <select
                    value={icModalidade}
                    onChange={(e) => {
                      setIcModalidade(e.target.value);
                      runSearchIc({ modalidade: e.target.value });
                    }}
                    className="w-full bg-[#030711] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="ALL">Crédito + Débito</option>
                    <option value="Crédito">Crédito</option>
                    <option value="Débito">Débito</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">
                    Tipo de Regra
                  </label>
                  <select
                    value={icTipoRegra}
                    onChange={(e) => {
                      setIcTipoRegra(e.target.value);
                      runSearchIc({ tipo_regra: e.target.value });
                    }}
                    className="w-full bg-[#030711] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="ALL">Todos os Tipos (2.103)</option>
                    <option value="Taxa Base">Taxa Base (1.128)</option>
                    <option value="Acréscimo (+)">Acréscimo sobre Base (+) (594)</option>
                    <option value="Desconto (-)">Desconto sobre Base (-) (251)</option>
                    <option value="Large Ticket (Fixo + %)">Large Ticket R$ + % (116)</option>
                    <option value="Teto Fixo (Cap)">Teto Fixo (Cap) (1)</option>
                    <option value="N/A (Não Aplicável)">N/A (Não Aplicável) (12)</option>
                  </select>
                </div>

                <div className="flex items-end gap-2">
                  <button
                    onClick={() => runSearchIc()}
                    className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-colors"
                  >
                    Filtrar ({icTotal})
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                <div>
                  Exibindo <strong className="text-white">{icResults.length}</strong> de{" "}
                  <strong className="text-emerald-400">{icTotal}</strong> regras encontradas
                </div>
                <div className="flex items-center gap-2">
                  <span>Limite de visualização:</span>
                  {[250, 500, 1000, 2500].map((lim) => (
                    <button
                      key={lim}
                      onClick={() => {
                        setIcLimit(lim);
                        runSearchIc({ limit: lim });
                      }}
                      className={`px-2 py-0.5 rounded font-mono text-[10px] ${
                        icLimit === lim
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold"
                          : "bg-slate-900 text-slate-400 hover:text-white"
                      }`}
                    >
                      {lim === 2500 ? "Todas (2.500)" : lim}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-[#080f1e] border border-slate-800/80 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-4">Bandeira</th>
                      <th className="py-3 px-3">Modalidade</th>
                      <th className="py-3 px-3">Tipo Regra</th>
                      <th className="py-3 px-3">Tabela</th>
                      <th className="py-3 px-4">Programa / Descrição</th>
                      <th className="py-3 px-3">Produto / IRD / PID</th>
                      <th className="py-3 px-3">Segmento</th>
                      <th className="py-3 px-3">Parcelas / Captura</th>
                      <th className="py-3 px-3">Alíquota / Ajuste</th>
                      <th className="py-3 px-3">Teto / Cap (R$)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {loadingIc ? (
                      <tr>
                        <td colSpan={10} className="py-12 text-center text-slate-400">
                          Consultando alíquotas reais...
                        </td>
                      </tr>
                    ) : (
                      icResults.map((r, i) => {
                        const tipo = r.tipo_regra || "Taxa Base";
                        return (
                          <tr key={i} className="hover:bg-slate-900/50">
                            <td className="py-2.5 px-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  r.bandeira === "Visa"
                                    ? "bg-blue-500/15 text-blue-300"
                                    : r.bandeira === "Mastercard"
                                    ? "bg-amber-500/15 text-amber-300"
                                    : "bg-emerald-500/15 text-emerald-300"
                                }`}
                              >
                                {r.bandeira}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-slate-200">{r.modalidade}</td>
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  tipo === "Taxa Base"
                                    ? "bg-emerald-500/15 text-emerald-300"
                                    : tipo === "Acréscimo (+)"
                                    ? "bg-cyan-500/15 text-cyan-300"
                                    : tipo === "Desconto (-)"
                                    ? "bg-rose-500/15 text-rose-300"
                                    : tipo === "Large Ticket (Fixo + %)"
                                    ? "bg-purple-500/15 text-purple-300"
                                    : "bg-slate-800 text-slate-400"
                                }`}
                              >
                                {tipo}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-mono text-slate-400">{r.tabela}</td>
                            <td className="py-2.5 px-4 text-white font-medium max-w-xs">{r.programa}</td>
                            <td className="py-2.5 px-3 font-mono text-blue-300">{r.produto_ird}</td>
                            <td className="py-2.5 px-3 font-mono text-slate-300">{r.segmento}</td>
                            <td className="py-2.5 px-3 text-slate-300">
                              <div>{r.parcelas}</div>
                              <div className="text-[10px] text-slate-500">{r.captura}</div>
                            </td>
                            <td
                              className={`py-2.5 px-3 font-mono font-bold text-sm whitespace-nowrap ${
                                tipo === "Acréscimo (+)"
                                  ? "text-cyan-400"
                                  : tipo === "Desconto (-)"
                                  ? "text-rose-400"
                                  : tipo === "Large Ticket (Fixo + %)"
                                  ? "text-purple-300"
                                  : "text-emerald-400"
                              }`}
                            >
                              {formatRateDisplay(r)}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-amber-300 whitespace-nowrap">
                              {r.teto_brl ? `R$ ${Number(r.teto_brl).toFixed(2)}` : "Sem Teto"}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================
            TAB 2: MCCs, CRITÉRIOS NNSS, SEGMENTOS & PIDs
           ===================================================== */}
        {activeTab === "mcc_segmentos" && (
          <div className="space-y-6">
            <div className="bg-[#080f1e] border border-slate-800/80 rounded-2xl p-6 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                    Abas Auxiliares Integras (`MCC`, `Classificação Cartão`, `Codigos`, `Anotação`)
                  </span>
                  <h2 className="text-base font-bold text-white">
                    Enquadramento de MCC por Segmento, Critérios de Edição Visa NNSS (Tabela 5-3) e PIDs
                  </h2>
                </div>
                <input
                  type="text"
                  value={mccSegSearch}
                  onChange={(e) => setMccSegSearch(e.target.value)}
                  placeholder="Buscar MCC (ex: 5411, 4900, 8220) ou segmento..."
                  className="w-full md:w-80 bg-[#030711] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setMccSubTab("visa")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    mccSubTab === "visa"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  Visa: {visaMccCriterios.length} Critérios MCC (Tabela 5-3) + {visaPids.length} PIDs
                </button>
                <button
                  onClick={() => setMccSubTab("mastercard")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    mccSubTab === "mastercard"
                      ? "bg-amber-500 text-slate-950"
                      : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  Mastercard: {mastercardMccSegmentos.length} MCCs Especializados + {mastercardCodigos.length} Siglas
                </button>
                <button
                  onClick={() => setMccSubTab("elo")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    mccSubTab === "elo"
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  Elo: {eloMccSegmentos.length} Segmentos de MCC & Tabelas Pertencentes
                </button>
              </div>
            </div>

            {mccSubTab === "visa" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Coluna 1: 21 PIDs Visa */}
                <div className="bg-[#080f1e] border border-slate-800/80 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">Classificação de Cartão Visa (PIDs)</h3>
                    <span className="text-[11px] font-mono text-blue-400">{visaPids.length} PIDs</span>
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-slate-800">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                          <th className="py-2.5 px-3">PID</th>
                          <th className="py-2.5 px-3">Produto Visa</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {visaPids.map((p, idx) => (
                          <tr key={idx} className="hover:bg-slate-900/50">
                            <td className="py-2 px-3 font-mono font-bold text-blue-300">{p.pid}</td>
                            <td className="py-2 px-3 text-slate-200">{p.produto}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Colunas 2-3: 326 Critérios MCC Visa */}
                <div className="lg:col-span-2 bg-[#080f1e] border border-slate-800/80 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">
                      Critérios de Edição dos Programas de Taxas NNSS Visa (Aba `MCC`)
                    </h3>
                    <span className="text-[11px] font-mono text-blue-400">{visaMccCriterios.length} linhas</span>
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-slate-800 max-h-[600px]">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="sticky top-0 bg-slate-900">
                        <tr className="text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                          <th className="py-2.5 px-3">Tabela</th>
                          <th className="py-2.5 px-3">Programa / Categoria</th>
                          <th className="py-2.5 px-3">MCC Inicial</th>
                          <th className="py-2.5 px-3">MCC Final (Até)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {visaMccCriterios
                          .filter((c) => {
                            if (!mccSegSearch.trim()) return true;
                            const q = mccSegSearch.toLowerCase();
                            return `${c.criterios} ${c.tabela} ${c.categoria} ${c.mcc_inicio} ${c.mcc_fim}`
                              .toLowerCase()
                              .includes(q);
                          })
                          .map((c, idx) => (
                            <tr key={idx} className="hover:bg-slate-900/50">
                              <td className="py-2 px-3 font-mono text-blue-300 whitespace-nowrap">{c.tabela}</td>
                              <td className="py-2 px-3 text-slate-200">
                                <div className="font-medium">{c.categoria}</div>
                                <div className="text-[10px] text-slate-500">{c.criterios}</div>
                              </td>
                              <td className="py-2 px-3 font-mono font-bold text-emerald-400">{c.mcc_inicio}</td>
                              <td className="py-2 px-3 font-mono text-amber-300">{c.mcc_fim || "—"}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {mccSubTab === "mastercard" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Siglas de Segmento Mastercard */}
                <div className="bg-[#080f1e] border border-slate-800/80 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">Siglas de Segmento (Aba `Codigos`)</h3>
                    <span className="text-[11px] font-mono text-amber-400">{mastercardCodigos.length} códigos</span>
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-slate-800">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                          <th className="py-2.5 px-3">Sigla</th>
                          <th className="py-2.5 px-3">Descrição do Segmento</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {mastercardCodigos.map((c, idx) => (
                          <tr key={idx} className="hover:bg-slate-900/50">
                            <td className="py-2 px-3 font-mono font-bold text-amber-300">{c.sigla}</td>
                            <td className="py-2 px-3 text-slate-200">{c.descricao}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 76 MCCs Mastercard */}
                <div className="lg:col-span-2 bg-[#080f1e] border border-slate-800/80 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">Mapeamento de MCCs Mastercard (Aba `MCC`)</h3>
                    <span className="text-[11px] font-mono text-amber-400">{mastercardMccSegmentos.length} MCCs</span>
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-slate-800 max-h-[600px]">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="sticky top-0 bg-slate-900">
                        <tr className="text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                          <th className="py-2.5 px-3">MCC</th>
                          <th className="py-2.5 px-3">Merchant Category (Segmento)</th>
                          <th className="py-2.5 px-3">Descrição Oficial</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {mastercardMccSegmentos
                          .filter((m) => {
                            if (!mccSegSearch.trim()) return true;
                            const q = mccSegSearch.toLowerCase();
                            return `${m.mcc} ${m.categoria} ${m.descricao}`.toLowerCase().includes(q);
                          })
                          .map((m, idx) => (
                            <tr key={idx} className="hover:bg-slate-900/50">
                              <td className="py-2 px-3 font-mono font-bold text-amber-300">{m.mcc}</td>
                              <td className="py-2 px-3 font-semibold text-white whitespace-nowrap">{m.categoria}</td>
                              <td className="py-2 px-3 text-slate-300">{m.descricao}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {mccSubTab === "elo" && (
              <div className="space-y-4">
                {eloAnotacao && (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs">
                    <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-amber-300 uppercase tracking-wider text-[10px] block mb-0.5">
                        Nota Técnica da Planilha (`tabela_intercambio_ Elo.xlsx` — Aba `Anotação`)
                      </strong>
                      <span className="text-slate-200">{eloAnotacao}</span>
                    </div>
                  </div>
                )}

                <div className="bg-[#080f1e] border border-slate-800/80 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">
                      Segmentos Comerciais Elo, Lista de MCCs e Tabelas Pertencentes (Aba `MCC`)
                    </h3>
                    <span className="text-[11px] font-mono text-emerald-400">{eloMccSegmentos.length} segmentos</span>
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-slate-800">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                          <th className="py-3 px-4">Segmento Elo</th>
                          <th className="py-3 px-4">MCCs Enquadrados</th>
                          <th className="py-3 px-4">Tabelas Pertencentes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {eloMccSegmentos
                          .filter((s) => {
                            if (!mccSegSearch.trim()) return true;
                            const q = mccSegSearch.toLowerCase();
                            return `${s.segmento} ${s.mccs} ${s.tabelas_pertencentes}`.toLowerCase().includes(q);
                          })
                          .map((s, idx) => (
                            <tr key={idx} className="hover:bg-slate-900/50">
                              <td className="py-2.5 px-4 font-bold text-emerald-300">{s.segmento}</td>
                              <td className="py-2.5 px-4 font-mono text-amber-200">{s.mccs}</td>
                              <td className="py-2.5 px-4 text-slate-300">{s.tabelas_pertencentes}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =====================================================
            TAB 3: TABELA ELO DE REDUÇÃO DE FEE POR MCC & CNPJ
           ===================================================== */}
        {activeTab === "elo_mcc" && (
          <div className="space-y-6">
            <div className="bg-[#080f1e] border border-slate-800/80 rounded-2xl p-6 space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                    Planilha Oficial `Tabela_fee_elo_v2.xlsx` · Vigência 30/05/2025
                  </span>
                  <h2 className="text-base font-bold text-white">
                    Redução de Fee Elo: Fee 1 (Marketing) + Fee 2 (Bandeira) Antigo vs. Nova Fee Simplificada
                  </h2>
                </div>
                <a
                  href="/api/admin/tarifas-reais?action=download&file=tabela_fee_elo_v2"
                  className="px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-2 transition-colors self-start"
                >
                  <Download className="w-4 h-4" />
                  Baixar `Tabela_fee_elo_v2.xlsx` Completa (30.7 MB)
                </a>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/60">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setEloSubTab("mcc")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      eloSubTab === "mcc"
                        ? "bg-amber-500 text-slate-950"
                        : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                    }`}
                  >
                    1. Tabela Padrão por MCC ({eloMccReducao.length} MCCs Completos)
                  </button>
                  <button
                    onClick={() => setEloSubTab("raizes")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      eloSubTab === "raizes"
                        ? "bg-amber-500 text-slate-950"
                        : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                    }`}
                  >
                    2. Tabela Especial por Raiz de CNPJ (Amostra 150 de 311.480 Raízes)
                  </button>
                  <button
                    onClick={() => setEloSubTab("legenda")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      eloSubTab === "legenda"
                        ? "bg-amber-500 text-slate-950"
                        : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                    }`}
                  >
                    3. Legenda Oficial dos Campos ({eloFeeLegenda.length} Definições)
                  </button>
                </div>

                {eloSubTab === "mcc" && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEloDetailedCols(!eloDetailedCols)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 hover:border-amber-400 transition-colors"
                    >
                      {eloDetailedCols ? "Ocultar Decomposição Bnd/Mkt & 330/377" : "Mostrar Todas as 20 Colunas (Bnd + Mkt + 13-21x + 330/377)"}
                    </button>
                    <input
                      type="text"
                      value={mccFilter}
                      onChange={(e) => setMccFilter(e.target.value)}
                      placeholder="Filtrar MCC (ex: 5411, 5812)..."
                      className="w-56 bg-[#030711] border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                )}

                {eloSubTab === "raizes" && (
                  <input
                    type="text"
                    value={raizFilter}
                    onChange={(e) => setRaizFilter(e.target.value)}
                    placeholder="Filtrar Raiz CNPJ na amostra..."
                    className="w-64 bg-[#030711] border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                )}
              </div>
            </div>

            {eloSubTab === "mcc" && (
              <div className="bg-[#080f1e] border border-slate-800/80 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto max-h-[650px]">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="sticky top-0 bg-slate-900 z-10">
                      <tr className="text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
                        <th className="py-3 px-4">MCC</th>
                        {eloDetailedCols && (
                          <>
                            <th className="py-3 px-2">Déb 71 Bnd</th>
                            <th className="py-3 px-2">Déb 71 Mkt</th>
                          </>
                        )}
                        <th className="py-3 px-3">Déb (71) Total Ant.</th>
                        <th className="py-3 px-3 text-emerald-400">Déb (71) Novo</th>
                        {eloDetailedCols && (
                          <>
                            <th className="py-3 px-2">Créd 70 Bnd</th>
                            <th className="py-3 px-2">Créd 70 Mkt</th>
                          </>
                        )}
                        <th className="py-3 px-3">Créd Vista (70) Ant.</th>
                        <th className="py-3 px-3 text-emerald-400">Créd Vista (70) Novo</th>
                        <th className="py-3 px-3">Parc 2–6x Novo</th>
                        <th className="py-3 px-3">Parc 7–12x Novo</th>
                        <th className="py-3 px-3">Parc 13–21x Novo</th>
                        {eloDetailedCols && (
                          <>
                            <th className="py-3 px-3">Crediário (330) Novo</th>
                            <th className="py-3 px-3">Carnê (377) Novo</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {filteredEloMcc.map((m, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/50">
                          <td className="py-2.5 px-4 font-bold text-amber-300 whitespace-nowrap">MCC {m.mcc}</td>
                          {eloDetailedCols && (
                            <>
                              <td className="py-2.5 px-2 text-slate-500">{m.fee_bnd_71 ?? "—"}%</td>
                              <td className="py-2.5 px-2 text-slate-500">{m.fee_mkt_71 ?? "—"}%</td>
                            </>
                          )}
                          <td className="py-2.5 px-3 text-slate-400">{m.fee_debito_71_antigo ?? "—"}%</td>
                          <td className="py-2.5 px-3 text-emerald-400 font-bold">{m.fee_debito_71_novo ?? "—"}%</td>
                          {eloDetailedCols && (
                            <>
                              <td className="py-2.5 px-2 text-slate-500">{m.fee_bnd_70 ?? "—"}%</td>
                              <td className="py-2.5 px-2 text-slate-500">{m.fee_mkt_70 ?? "—"}%</td>
                            </>
                          )}
                          <td className="py-2.5 px-3 text-slate-400">{m.fee_cred_vista_70_antigo ?? "—"}%</td>
                          <td className="py-2.5 px-3 text-emerald-400 font-bold">{m.fee_cred_vista_70_novo ?? "—"}%</td>
                          <td className="py-2.5 px-3 text-blue-300">{m.fee_parc_2_6_novo ?? "—"}%</td>
                          <td className="py-2.5 px-3 text-purple-300">{m.fee_parc_7_12_novo ?? "—"}%</td>
                          <td className="py-2.5 px-3 text-cyan-300">{m.fee_parc_13_21_novo ?? "—"}%</td>
                          {eloDetailedCols && (
                            <>
                              <td className="py-2.5 px-3 text-slate-300">{m.fee_crediario_330_novo ?? "—"}%</td>
                              <td className="py-2.5 px-3 text-slate-300">{m.fee_carne_377_novo ?? "—"}%</td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {eloSubTab === "raizes" && (
              <div className="bg-[#080f1e] border border-slate-800/80 rounded-2xl p-5 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs text-slate-400">
                  <div>
                    A aba <strong className="text-white">Raízes (Especial) - redução fee</strong> possui{" "}
                    <strong className="text-amber-300">311.480 raízes de CNPJ (8 dígitos)</strong> com{" "}
                    <strong className="text-emerald-400">18.423 perfis tarifários únicos</strong>. Abaixo está a amostra
                    estruturada das primeiras 150 raízes para inspeção imediata.
                  </div>
                </div>
                <div className="overflow-x-auto rounded-xl border border-slate-800 max-h-[550px]">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="sticky top-0 bg-slate-900">
                      <tr className="text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                        <th className="py-2.5 px-4">Raiz CNPJ (8 dígitos)</th>
                        <th className="py-2.5 px-3">Déb (71) Bnd+Mkt Ant.</th>
                        <th className="py-2.5 px-3 text-emerald-400">Déb (71) Novo</th>
                        <th className="py-2.5 px-3">Créd (70) Bnd+Mkt Ant.</th>
                        <th className="py-2.5 px-3 text-emerald-400">Créd (70) Novo</th>
                        <th className="py-2.5 px-3">Parc 2–6x Novo</th>
                        <th className="py-2.5 px-3">Parc 7–12x Novo</th>
                        <th className="py-2.5 px-3">Parc 13–21x Novo</th>
                        <th className="py-2.5 px-3">Crediário (330)</th>
                        <th className="py-2.5 px-3">Carnê (377)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {filteredRaizes.map((r, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/50">
                          <td className="py-2 px-4 font-bold text-amber-300">{r.raiz_cnpj}</td>
                          <td className="py-2 px-3 text-slate-400">
                            {r.fee_71_antigo_total}% ({r.fee_bnd_71}+{r.fee_mkt_71})
                          </td>
                          <td className="py-2 px-3 font-bold text-emerald-400">{r.fee_71_novo}%</td>
                          <td className="py-2 px-3 text-slate-400">
                            {r.fee_70_antigo_total}% ({r.fee_bnd_70}+{r.fee_mkt_70})
                          </td>
                          <td className="py-2 px-3 font-bold text-emerald-400">{r.fee_70_novo}%</td>
                          <td className="py-2 px-3 text-blue-300">{r.fee_72a_novo}%</td>
                          <td className="py-2 px-3 text-purple-300">{r.fee_72b_novo}%</td>
                          <td className="py-2 px-3 text-cyan-300">{r.fee_72c_novo}%</td>
                          <td className="py-2 px-3 text-slate-300">{r.fee_330_novo}%</td>
                          <td className="py-2 px-3 text-slate-300">{r.fee_377_novo}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {eloSubTab === "legenda" && (
              <div className="bg-[#080f1e] border border-slate-800/80 rounded-2xl p-5">
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                        <th className="py-3 px-4">Coluna / Código na Planilha</th>
                        <th className="py-3 px-4">Significado Normativo Oficial (Aba `Legenda`)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {eloFeeLegenda.map((l, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/50">
                          <td className="py-2.5 px-4 font-mono font-bold text-amber-300 whitespace-nowrap">{l.campo}</td>
                          <td className="py-2.5 px-4 text-slate-200">{l.descricao}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =====================================================
            TAB 4: TARIFAS DE BANDEIRA CONSOLIDADO (114 TIERS)
           ===================================================== */}
        {activeTab === "planilhas" && (
          <div className="bg-[#080f1e] border border-slate-800/80 rounded-2xl p-6 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400">
                  Planilhas `tarifa_bandeira_mastercard_v2.xlsx` & `tarifa_bandeira_visa_v2.xlsx`
                </span>
                <h2 className="text-base font-bold text-white">
                  Tiers Consolidados de Scheme Fees por Etapa (Autorização, Clearing, Mensal e Faixas de Volume)
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href="/api/admin/tarifas-reais?action=download&file=tarifa_bandeira_mastercard_v2"
                  className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Mastercard v2 (.xlsx)
                </a>
                <a
                  href="/api/admin/tarifas-reais?action=download&file=tarifa_bandeira_visa_v2"
                  className="px-3 py-1.5 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Visa v2 (.xlsx)
                </a>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-3">
              <select
                value={sfBandeira}
                onChange={(e) => setSfBandeira(e.target.value)}
                className="bg-[#030711] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="ALL">Todas as Bandeiras (114 Tiers)</option>
                <option value="Mastercard">Mastercard (43 Tiers)</option>
                <option value="Visa">Visa (71 Tiers)</option>
              </select>
              <input
                type="text"
                value={sfSearch}
                onChange={(e) => setSfSearch(e.target.value)}
                placeholder="Buscar por código de tarifa (ex: 2AB1006, 5F3517100, Marketing Fee, Clearing)..."
                className="flex-1 bg-[#030711] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-3">ID</th>
                    <th className="py-3 px-3">Bandeira</th>
                    <th className="py-3 px-4">Tarifa / Código de Faturamento</th>
                    <th className="py-3 px-3">Região</th>
                    <th className="py-3 px-3">Etapa / Forma</th>
                    <th className="py-3 px-3">Plataforma</th>
                    <th className="py-3 px-3">Faixa / Tier (`tier_inicio` → `tier_fim`)</th>
                    <th className="py-3 px-3">Valor</th>
                    <th className="py-3 px-3">Moeda / Tipo</th>
                    <th className="py-3 px-3">Fonte</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredSchemeFees.map((sf, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/50">
                      <td className="py-2.5 px-3 font-mono text-slate-500">{sf.id_planilha ?? "—"}</td>
                      <td className="py-2.5 px-3 font-bold text-white">{sf.bandeira}</td>
                      <td className="py-2.5 px-4 font-medium text-purple-300">{sf.tarifa}</td>
                      <td className="py-2.5 px-3 text-slate-300">{sf.regiao}</td>
                      <td className="py-2.5 px-3 text-slate-300">{sf.forma}</td>
                      <td className="py-2.5 px-3 text-slate-400">{sf.plataforma}</td>
                      <td className="py-2.5 px-3 font-mono text-amber-300 whitespace-nowrap">
                        {formatTierRange(sf)}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-emerald-400 whitespace-nowrap">
                        {String(sf.valor)}
                        {sf.valor_adicional ? ` (+${sf.valor_adicional})` : ""}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-300 whitespace-nowrap">
                        {sf.moeda} {sf.valor_tipo ? `(${sf.valor_tipo})` : ""}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[10px] text-slate-500">{sf.fonte}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =====================================================
            TAB 5: TARIFAS EXTRAÍDAS DE BOLETINS (tarifas.sqlite3)
           ===================================================== */}
        {activeTab === "artigos" && (
          <div className="space-y-6">
            {tarifasCuradas.length > 0 && (
              <div className="bg-[#080f1e] border border-emerald-500/30 rounded-2xl p-6 space-y-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                    Tarifas Auditadas Ponta-a-Ponta (`tarifas_curadas.json`)
                  </span>
                  <h2 className="text-base font-bold text-white">
                    Amarra Completa: Regra de Gatilho nos Campos ISO/Base II → Alíquota → Relatório de Conciliação
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tarifasCuradas.map((tc: any) => (
                    <div key={tc.id} className="p-4 rounded-xl bg-[#030711] border border-slate-800 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold">
                          {tc.bandeira} · {tc.codigo_evento_ou_linha}
                        </span>
                        <span className="font-mono font-bold text-emerald-400">{tc.valor}</span>
                      </div>
                      <h3 className="text-sm font-bold text-white">{tc.tarifa}</h3>
                      <p className="text-slate-300">{tc.aplicabilidade?.condicao}</p>
                      <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
                        <div>
                          <strong className="text-amber-300">Gatilho Técnico:</strong> {tc.gatilho?.regra}
                        </div>
                        <div>
                          <strong className="text-purple-300">Conciliação:</strong> {tc.conciliacao?.onde_aparece}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-[#080f1e] border border-slate-800/80 rounded-2xl p-6 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
                    Base `indice_tarifas/tarifas.sqlite3` · {sqliteTarifas.length} Linhas Extraídas de 38 Boletins
                  </span>
                  <h2 className="text-base font-bold text-white">
                    Tabelas de Tarifas e Billing Lines Publicadas em Artigos/Releases Recentes
                  </h2>
                </div>
                <input
                  type="text"
                  value={artigoFilter}
                  onChange={(e) => setArtigoFilter(e.target.value)}
                  placeholder="Filtrar por artigo (ex: AI15416, 5VAS, Embedded)..."
                  className="w-full md:w-80 bg-[#030711] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-4">Bandeira / Artigo</th>
                      <th className="py-3 px-4">Título do Comunicado</th>
                      <th className="py-3 px-3">Billing Line / Tarifa</th>
                      <th className="py-3 px-4">Valores & Condições Extraídas</th>
                      <th className="py-3 px-3">Pág. PDF</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredArtigos.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-900/50">
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 font-bold text-[10px] mr-1.5">
                            {row.bandeira}
                          </span>
                          <span className="font-mono font-bold text-white">{row.artigo}</span>
                          <div className="text-[10px] text-slate-400 mt-0.5">{row.data_publicacao}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-200 max-w-xs">
                          <div className="font-semibold line-clamp-2">{row.titulo_artigo}</div>
                          <div className="text-[10px] font-mono text-slate-400">{row.arquivo}</div>
                        </td>
                        <td className="py-3 px-3 font-mono text-purple-300">
                          <div className="font-bold">{row.linha_faturamento || row.tarifa}</div>
                          <div className="text-[11px] text-slate-400">{row.descricao_linha}</div>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-emerald-300 max-w-md">
                          {Object.entries(row.valores || {}).map(([k, v]: [string, any]) => (
                            <div key={k} className="truncate">
                              <span className="text-slate-400">{k}:</span> {String(v)}
                            </div>
                          ))}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-400">p.{row.pagina_pdf}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================
            TAB 6: CENTRAL DE DOWNLOADS (.XLSX ORIGINAIS)
           ===================================================== */}
        {activeTab === "downloads" && (
          <div className="space-y-6">
            <div className="bg-[#080f1e] border border-indigo-500/30 rounded-2xl p-6 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                    Repositório Oficial de Planilhas (`Tabelasintercambio/` e `Tabelasintercambio/Tabelas/`)
                  </span>
                  <h2 className="text-base font-bold text-white">
                    Central de Downloads: Baixe as Planilhas Excel (.xlsx) Originais de Intercâmbio, Fee de Bandeira e Auditoria
                  </h2>
                </div>
                <div className="text-xs font-mono text-slate-400">
                  Disponíveis: <strong className="text-indigo-400">{filteredDownloads.length}</strong> de{" "}
                  <strong>{arquivosCatalogo.length}</strong> arquivos
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">
                    Filtrar por Categoria
                  </label>
                  <select
                    value={dlCatFilter}
                    onChange={(e) => setDlCatFilter(e.target.value)}
                    className="w-full bg-[#030711] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="ALL">Todas as Categorias ({arquivosCatalogo.length})</option>
                    <option value="Intercâmbio">Tabelas de Intercâmbio</option>
                    <option value="Fee de Bandeira">Tabelas de Fee / Tarifa de Bandeira</option>
                    <option value="Fee Schedule & Faturas">Fee Schedule & Faturas</option>
                    <option value="Motor & Auditoria">Motor de Provisionamento & Auditoria</option>
                    <option value="Tabelas Auxiliares">Tabelas Auxiliares (MCC / Países / Regulatório)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">
                    Filtrar por Bandeira
                  </label>
                  <select
                    value={dlBrandFilter}
                    onChange={(e) => setDlBrandFilter(e.target.value)}
                    className="w-full bg-[#030711] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="ALL">Todas as Bandeiras</option>
                    <option value="Visa">Visa</option>
                    <option value="Mastercard">Mastercard</option>
                    <option value="Elo">Elo</option>
                    <option value="Multi-Bandeira">Multi-Bandeira</option>
                    <option value="Regulatório / Bacen">Regulatório / Bacen</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">
                    Buscar Arquivo, Aba ou Conteúdo
                  </label>
                  <input
                    type="text"
                    value={dlSearch}
                    onChange={(e) => setDlSearch(e.target.value)}
                    placeholder="Ex: tabela_Intercambio, fee_elo, BillingLines, T068..."
                    className="w-full bg-[#030711] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDownloads.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#080f1e] border border-slate-800/80 hover:border-indigo-500/40 rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.bandeira === "Visa"
                              ? "bg-blue-500/15 text-blue-300"
                              : item.bandeira === "Mastercard"
                              ? "bg-amber-500/15 text-amber-300"
                              : item.bandeira === "Elo"
                              ? "bg-emerald-500/15 text-emerald-300"
                              : "bg-purple-500/15 text-purple-300"
                          }`}
                        >
                          {item.bandeira}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-900 text-slate-300 border border-slate-800">
                          {item.categoria}
                        </span>
                      </div>
                      <span className="font-mono text-[11px] text-slate-400">
                        {formatSize(item.size_kb)}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-white">{item.titulo}</h3>
                      <div className="font-mono text-[11px] text-indigo-300 mt-0.5">{item.rel_path}</div>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed">{item.descricao}</p>

                    {item.abas && item.abas.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {item.abas.map((aba: string, i: number) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded bg-[#030711] border border-slate-800/80 font-mono text-[10px] text-slate-300"
                          >
                            Aba: {aba}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between">
                    <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Arquivo verificado em disco
                    </span>
                    <a
                      href={`/api/admin/tarifas-reais?action=download&file=${encodeURIComponent(item.id)}`}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 transition-colors shadow-lg shadow-indigo-600/20"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Baixar .xlsx
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
