"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft, DollarSign, Search, Scale, Layers, Database,
  CheckCircle2, Sparkles, Filter
} from "lucide-react";

export default function TarifasReaisPage() {
  const [activeTab, setActiveTab] = useState<"intercambio" | "artigos" | "elo_mcc" | "planilhas">("intercambio");

  const [stats, setStats] = useState<any>(null);
  const [tarifasCuradas, setTarifasCuradas] = useState<any[]>([]);
  const [sqliteTarifas, setSqliteTarifas] = useState<any[]>([]);
  const [schemeFeesPlanilhas, setSchemeFeesPlanilhas] = useState<any[]>([]);
  const [eloMccReducao, setEloMccReducao] = useState<any[]>([]);

  // Intercâmbio search state
  const [icQuery, setIcQuery] = useState("");
  const [icBandeira, setIcBandeira] = useState("ALL");
  const [icModalidade, setIcModalidade] = useState("ALL");
  const [icResults, setIcResults] = useState<any[]>([]);
  const [icTotal, setIcTotal] = useState(0);
  const [loadingIc, setLoadingIc] = useState(false);

  // Filters for Artigos & Elo MCC
  const [artigoFilter, setArtigoFilter] = useState("");
  const [mccFilter, setMccFilter] = useState("");

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
        limit: 120
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
  }, [icQuery, icBandeira, icModalidade]);

  useEffect(() => {
    runSearchIc();
  }, [runSearchIc]);

  const filteredArtigos = sqliteTarifas.filter((t) => {
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

  const filteredEloMcc = eloMccReducao.filter((m) => {
    if (!mccFilter.trim()) return true;
    return String(m.mcc || "").toLowerCase().includes(mccFilter.toLowerCase());
  });

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
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Tabelas Reais (`Tabelas/*.xlsx` + `tarifas.sqlite3`)
                </span>
              </div>
              <h1 className="text-lg md:text-xl font-bold text-white mt-0.5">
                Motor Real de Tabelas de Intercâmbio (Visa, MC, Elo), Redução MCC & Fee Schedule
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400">Alíquotas Intercâmbio: </span>
              <strong className="font-mono text-emerald-400">{stats?.totalIntercambioRows || 1128}</strong>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400">Artigos Tarifas SQLite: </span>
              <strong className="font-mono text-blue-300">{stats?.totalSqliteArtigosTarifas || 89}</strong>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400">MCCs Redução Elo: </span>
              <strong className="font-mono text-amber-300">{stats?.totalEloMccReducao || 381}</strong>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-2 overflow-x-auto border-t border-slate-800/50 pt-2 pb-2">
          <button
            onClick={() => setActiveTab("intercambio")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === "intercambio"
                ? "bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-600/25"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            1. Alíquotas Reais de Intercâmbio (1.128 Regras — Visa / MC / Elo)
          </button>
          <button
            onClick={() => setActiveTab("artigos")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === "artigos"
                ? "bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/25"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            2. Tarifas de Boletins & Curadas (`tarifas.sqlite3` — 89 Tabelas)
          </button>
          <button
            onClick={() => setActiveTab("elo_mcc")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === "elo_mcc"
                ? "bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/25"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            3. Tabela Elo de Redução de Fee por MCC (`Tabela_fee_elo_v2.xlsx`)
          </button>
          <button
            onClick={() => setActiveTab("planilhas")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === "planilhas"
                ? "bg-purple-600 text-white font-bold shadow-lg shadow-purple-600/25"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            4. Tarifas de Bandeira Consolidado (`tarifa_bandeira_v2.xlsx` — 114 Tiers)
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-8">
        {/* =====================================================
            TAB 1: 1.128 ALÍQUOTAS REAIS DE INTERCÂMBIO
           ===================================================== */}
        {activeTab === "intercambio" && (
          <div className="space-y-6">
            <div className="bg-[#080f1e] border border-slate-800/80 rounded-2xl p-6 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                    Planilhas Oficiais Extraídas (`tabela_Intercambio Visa / Master / Elo.xlsx`)
                  </span>
                  <h2 className="text-base font-bold text-white">
                    Consulta de Alíquotas (%), Teto em R$ (Cap), IRD Mastercard, PID Visa e Arranjo Elo
                  </h2>
                </div>
                <div className="text-xs font-mono text-slate-400">
                  Encontradas: <strong className="text-emerald-400">{icTotal}</strong> alíquotas
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">
                    Buscar por IRD, PID, Programa, Parcelas, Captura ou Segmento
                  </label>
                  <input
                    type="text"
                    value={icQuery}
                    onChange={(e) => setIcQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && runSearchIc()}
                    placeholder="Ex: Infinite, Black, Platinum, Token, Recorrente, 7-12, IRD..."
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
                    <option value="ALL">Todas (Visa 866 · MC 219 · Elo 43)</option>
                    <option value="Visa">Visa (866 regras)</option>
                    <option value="Mastercard">Mastercard (219 regras)</option>
                    <option value="Elo">Elo (43 regras)</option>
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

                <div className="flex items-end">
                  <button
                    onClick={() => runSearchIc()}
                    className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-colors"
                  >
                    Filtrar Alíquotas
                  </button>
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
                      <th className="py-3 px-3">Tabela</th>
                      <th className="py-3 px-4">Programa / Descrição</th>
                      <th className="py-3 px-3">Produto / IRD / PID</th>
                      <th className="py-3 px-3">Parcelas / Captura</th>
                      <th className="py-3 px-3">Alíquota (%)</th>
                      <th className="py-3 px-3">Teto / Cap (R$)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {loadingIc ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-400">
                          Consultando alíquotas reais...
                        </td>
                      </tr>
                    ) : (
                      icResults.map((r, i) => (
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
                          <td className="py-2.5 px-3 font-mono text-slate-400">{r.tabela}</td>
                          <td className="py-2.5 px-4 text-white font-medium max-w-xs">{r.programa}</td>
                          <td className="py-2.5 px-3 font-mono text-blue-300">{r.produto_ird}</td>
                          <td className="py-2.5 px-3 text-slate-300">
                            <div>{r.parcelas}</div>
                            <div className="text-[10px] text-slate-500">{r.captura}</div>
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-emerald-400 text-sm">
                            {typeof r.aliquota_pct === "number" ? `${r.aliquota_pct.toFixed(2)}%` : r.aliquota_pct}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-amber-300">
                            {r.teto_brl ? `R$ ${Number(r.teto_brl).toFixed(2)}` : "Sem Teto"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================
            TAB 2: TARIFAS EXTRAÍDAS DE BOLETINS (tarifas.sqlite3)
           ===================================================== */}
        {activeTab === "artigos" && (
          <div className="space-y-6">
            {/* Tarifas Curadas com Gatilho Técnico & Conciliação */}
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

            {/* 89 Tabelas de Tarifas de Artigos (tarifas.sqlite3) */}
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
            TAB 3: TABELA ELO DE REDUÇÃO DE FEE POR MCC
           ===================================================== */}
        {activeTab === "elo_mcc" && (
          <div className="bg-[#080f1e] border border-slate-800/80 rounded-2xl p-6 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                  Planilha `Tabela_fee_elo_v2.xlsx` · Redução de Fee por MCC
                </span>
                <h2 className="text-base font-bold text-white">
                  Comparativo de Taxas Elo Antes × Depois por MCC (Débito 71, Crédito à Vista 70 e Parcelado 72)
                </h2>
              </div>
              <input
                type="text"
                value={mccFilter}
                onChange={(e) => setMccFilter(e.target.value)}
                placeholder="Filtrar por código MCC (ex: 5411, 5812)..."
                className="w-full md:w-72 bg-[#030711] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">MCC</th>
                    <th className="py-3 px-3">Débito (71) Anterior</th>
                    <th className="py-3 px-3">Débito (71) Novo</th>
                    <th className="py-3 px-3">Crédito Vista (70) Anterior</th>
                    <th className="py-3 px-3">Crédito Vista (70) Novo</th>
                    <th className="py-3 px-3">Parcelado 2–6x Novo</th>
                    <th className="py-3 px-3">Parcelado 7–12x Novo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {filteredEloMcc.map((m, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/50">
                      <td className="py-2.5 px-4 font-bold text-amber-300">MCC {m.mcc}</td>
                      <td className="py-2.5 px-3 text-slate-400">{String(m.fee_debito_71_antigo ?? "—")}</td>
                      <td className="py-2.5 px-3 text-emerald-400 font-bold">{String(m.fee_debito_71_novo ?? "—")}</td>
                      <td className="py-2.5 px-3 text-slate-400">{String(m.fee_cred_vista_70_antigo ?? "—")}</td>
                      <td className="py-2.5 px-3 text-emerald-400 font-bold">{String(m.fee_cred_vista_70_novo ?? "—")}</td>
                      <td className="py-2.5 px-3 text-blue-300">{String(m.fee_parc_2_6_novo ?? "—")}</td>
                      <td className="py-2.5 px-3 text-purple-300">{String(m.fee_parc_7_12_novo ?? "—")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =====================================================
            TAB 4: TARIFAS DE BANDEIRA CONSOLIDADO (114 TIERS)
           ===================================================== */}
        {activeTab === "planilhas" && (
          <div className="bg-[#080f1e] border border-slate-800/80 rounded-2xl p-6 space-y-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400">
                Planilhas `tarifa_bandeira_mastercard_v2.xlsx` & `tarifa_bandeira_visa_v2.xlsx`
              </span>
              <h2 className="text-base font-bold text-white">
                Tiers Consolidados de Scheme Fees por Etapa (Autorização, Clearing e Mensal)
              </h2>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Bandeira</th>
                    <th className="py-3 px-4">Tarifa / Código</th>
                    <th className="py-3 px-3">Região</th>
                    <th className="py-3 px-3">Etapa</th>
                    <th className="py-3 px-3">Plataforma</th>
                    <th className="py-3 px-3">Valor</th>
                    <th className="py-3 px-3">Moeda / Tipo</th>
                    <th className="py-3 px-3">Fonte</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {schemeFeesPlanilhas.map((sf, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/50">
                      <td className="py-2.5 px-4 font-bold text-white">{sf.bandeira}</td>
                      <td className="py-2.5 px-4 font-medium text-purple-300">{sf.tarifa}</td>
                      <td className="py-2.5 px-3 text-slate-300">{sf.regiao}</td>
                      <td className="py-2.5 px-3 text-slate-300">{sf.forma}</td>
                      <td className="py-2.5 px-3 text-slate-400">{sf.plataforma}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">{String(sf.valor)}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-300">
                        {sf.moeda} ({sf.valor_tipo})
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[10px] text-slate-500">{sf.fonte}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
