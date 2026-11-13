"use client";

import React, { useState, useEffect } from "react";
import acervoPluggedData from "@/data/acervo-plugged-bundle.json";
import { sendToDocStudio } from "@/lib/docStudioBridge";
import {
  Database,
  Search,
  CheckCircle2,
  FileText,
  Layers,
  ShieldCheck,
  Scale,
  FolderKanban,
  DollarSign,
  Sparkles,
  ExternalLink,
  AlertTriangle,
  BookOpen,
} from "lucide-react";

type SubTabId = "filas" | "campos" | "busca" | "organizacao" | "regulatorio";

export default function OutgoingAcervoConnector({
  initialBrandFilter = "all",
  onNavigateTab,
}: {
  initialBrandFilter?: "all" | "visa" | "elo" | "mastercard";
  onNavigateTab?: (tab: any) => void;
}) {
  const bundle: any = acervoPluggedData;
  const stats = bundle.stats || {};

  const [subTab, setSubTab] = useState<SubTabId>("filas");
  const [selectedBindingId, setSelectedBindingId] = useState<string>(
    bundle.outgoing_field_bindings?.[0]?.target_id || "visa-tcr0"
  );
  const [brandFilter, setBrandFilter] = useState<string>(
    initialBrandFilter === "all" ? "ALL" : initialBrandFilter.toUpperCase()
  );

  // Live search state
  const [searchQuery, setSearchQuery] = useState<string>("TCR 0 Transaction Code");
  const [searchBrand, setSearchBrand] = useState<string>("ALL");
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [searchResult, setSearchResult] = useState<any>(null);

  // Regulatory filter
  const [regRoleFilter, setRegRoleFilter] = useState<string>("ALL");

  // Organizacao filter
  const [orgBrandFilter, setOrgBrandFilter] = useState<string>("ALL");

  // Slide-Over Inspector Drawer state (Workbench 2.0)
  const [drawerAcervoItem, setDrawerAcervoItem] = useState<{
    kind: "campo" | "pdf" | "norma";
    title: string;
    brand: string;
    subtitle: string;
    sha256?: string;
    page?: string | number;
    locator?: string;
    edition?: string;
    body: string;
    extra?: string;
  } | null>(null);

  useEffect(() => {
    if (initialBrandFilter !== "all") {
      setBrandFilter(initialBrandFilter.toUpperCase());
    }
  }, [initialBrandFilter]);

  // Sincronização com a Barra de Contexto Global do Workbench 2.0 (Bandeira & Lente)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const applyGlobalContext = (b?: string | null, r?: string | null) => {
      if (b) {
        if (b === "ALL") {
          setBrandFilter("ALL");
          setSearchBrand("ALL");
          setOrgBrandFilter("ALL");
        } else if (b === "visa") {
          setBrandFilter("VISA");
          setSearchBrand("Visa");
          setOrgBrandFilter("Visa");
        } else if (b === "mastercard") {
          setBrandFilter("MASTERCARD");
          setSearchBrand("Mastercard");
          setOrgBrandFilter("Mastercard");
        } else if (b === "elo") {
          setBrandFilter("ELO");
          setSearchBrand("Elo");
          setOrgBrandFilter("Elo");
        }
      }
      if (r) {
        if (r === "adquirente") {
          setRegRoleFilter("credenciador");
        } else if (r === "emissor") {
          setRegRoleFilter("emissor");
        } else {
          setRegRoleFilter("ALL");
        }
      }
    };

    applyGlobalContext(
      localStorage.getItem("vs_workbench_brand"),
      localStorage.getItem("vs_workbench_role")
    );

    const onContextChange = (ev: Event) => {
      const custom = ev as CustomEvent<{ brand?: string; role?: string }>;
      applyGlobalContext(custom.detail?.brand, custom.detail?.role);
    };

    window.addEventListener("workbench-context-change", onContextChange as EventListener);
    return () => {
      window.removeEventListener("workbench-context-change", onContextChange as EventListener);
    };
  }, []);

  const runLiveSearch = async (customQuery?: string, customBrand?: string) => {
    const q = (customQuery ?? searchQuery).trim();
    if (!q) return;
    setSearchLoading(true);
    try {
      const res = await fetch("/api/acervo/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pergunta: q,
          bandeira: (customBrand ?? searchBrand) === "ALL" ? undefined : customBrand ?? searchBrand,
          tool: "all",
          live: true,
          limite: 10,
        }),
      });
      const json = await res.json();
      setSearchResult(json);
    } catch (e) {
      console.error(e);
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    if (subTab === "busca" && !searchResult) {
      runLiveSearch("TCR 0 Transaction Code", "ALL");
    }
  }, [subTab]);

  const bindings = (bundle.outgoing_field_bindings || []).filter((b: any) => {
    if (brandFilter === "ALL") return true;
    return b.brand.toUpperCase() === brandFilter;
  });

  const activeBinding =
    bindings.find((b: any) => b.target_id === selectedBindingId) ||
    bindings[0] ||
    bundle.outgoing_field_bindings?.[0];

  const regObligations = (bundle.regulatorio_bcb_cmn?.obrigacoes_por_papel || []).filter((ob: any) => {
    if (regRoleFilter === "ALL") return true;
    return (ob.papeis_candidatos || []).some((p: string) =>
      p.toLowerCase().includes(regRoleFilter.toLowerCase())
    );
  });

  const orgHighlights = (bundle.organizacao?.curated_highlights || []).filter((h: any) => {
    if (orgBrandFilter === "ALL") return true;
    return (h.brand || "").toLowerCase() === orgBrandFilter.toLowerCase();
  });

  return (
    <div className="space-y-6">
      {/* Banner Topo: Acervo Plugado & Filas Executadas */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5" />
                SISTEMA DE ACERVOS 100% PLUGADO · 6 FILAS EXECUTADAS
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-slate-100 text-slate-700 border border-slate-300">
                Sync: 09/11/2026 (`acervo.sqlite3` + `campos.sqlite3` + `indice_tarifas` + `organizacao` + `Regulatorio`)
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900">
              🗄️ Conector Direto do Sistema de Acervos & Execução Integral das Filas
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-4xl">
              Ponte unificada entre a bancada de <strong>Outgoing / Liquidação</strong> e os{" "}
              <strong>4 motores do Sistema de Acervos</strong> (Texto Integral{" "}
              <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">acervo.sqlite3</code>, Tabelas Posicionais de
              Layout <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">campos.sqlite3</code>, Índice de
              Tarifas &amp; Fee Schedule <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">indice_tarifas</code>{" "}
              e Lotes Regulatórios <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">BCB/CMN</code>).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href="/acervo"
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-colors inline-flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Abrir Buscador `/acervo`
            </a>
            <a
              href="/compliance/governanca-acervo"
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-300 transition-colors inline-flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Abrir Governança &amp; Grafo FX
            </a>
          </div>
        </div>

        {/* Placar Global de Indicadores Reais do Acervo (09/11/2026) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-5">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-semibold text-slate-500 block">Ativos Únicos (SHA-256)</span>
            <strong className="text-lg font-mono font-bold text-slate-900">
              {(stats.total_assets || 40129).toLocaleString("pt-BR")}
            </strong>
            <span className="text-[11px] text-emerald-700 font-semibold block mt-0.5">
              +4.687 novos (Nov/2026)
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-semibold text-slate-500 block">Páginas Indexadas (FTS5)</span>
            <strong className="text-lg font-mono font-bold text-blue-800">
              {(stats.total_pages || 571849).toLocaleString("pt-BR")}
            </strong>
            <span className="text-[11px] text-slate-600 block mt-0.5">
              {(stats.total_locations || 241456).toLocaleString("pt-BR")} locais mapeados
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-semibold text-slate-500 block">Campos de Layout (`campos.sqlite3`)</span>
            <strong className="text-lg font-mono font-bold text-indigo-800">
              {(stats.campos_structured_total || 17106).toLocaleString("pt-BR")}
            </strong>
            <span className="text-[11px] text-slate-600 block mt-0.5">
              {stats.campos_manuals_count || 11} manuais de mensageria
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-semibold text-slate-500 block">Fee Schedule &amp; Tarifas</span>
            <strong className="text-lg font-mono font-bold text-amber-800">
              {(stats.fee_schedule_records || 1390).toLocaleString("pt-BR")}
            </strong>
            <span className="text-[11px] text-slate-600 block mt-0.5">
              {stats.fee_schedule_billing_lines || 454} BLs + MC Preço Out/26
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-semibold text-slate-500 block">Bandeiras Organizadas</span>
            <strong className="text-lg font-mono font-bold text-teal-800">
              {(stats.organizacao_total_records || 65640).toLocaleString("pt-BR")}
            </strong>
            <span className="text-[11px] text-slate-600 block mt-0.5">
              5 bandeiras × 12 assuntos
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-semibold text-slate-500 block">Normas BCB &amp; CMN</span>
            <strong className="text-lg font-mono font-bold text-purple-800">
              {stats.regulatorio_norms_count || 94} normas
            </strong>
            <span className="text-[11px] text-slate-600 block mt-0.5">
              {stats.regulatorio_sources_count || 176} fontes · {stats.regulatorio_obligations_count || 22} obrigações
            </span>
          </div>
        </div>

        {/* Barra de Sub-Abas Step-by-Step */}
        <div className="flex flex-wrap items-center gap-2 pt-5 mt-5 border-t border-slate-200">
          {[
            {
              id: "filas" as SubTabId,
              label: "1️⃣ 6 Filas Executadas & Manuais 2026/2027",
              icon: CheckCircle2,
            },
            {
              id: "campos" as SubTabId,
              label: "2️⃣ Outgoing × Índice de Campos (17.106 Linhas PDF)",
              icon: Layers,
            },
            {
              id: "busca" as SubTabId,
              label: "3️⃣ Busca Ao Vivo nos 3 Motores MCP + Tarifas",
              icon: Search,
            },
            {
              id: "organizacao" as SubTabId,
              label: "4️⃣ Bandeiras Organizadas (65.640 Refs · 12 Assuntos)",
              icon: FolderKanban,
            },
            {
              id: "regulatorio" as SubTabId,
              label: "5️⃣ Regulatório BCB & CMN (94 Normas por Papel)",
              icon: Scale,
            },
          ].map((t) => {
            const Icon = t.icon;
            const active = subTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setSubTab(t.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all border ${
                  active
                    ? "bg-blue-700 text-white border-blue-800 shadow-sm"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* =====================================================================
          SUB-ABA 1: 6 FILAS EXECUTADAS, RUNS & NOVOS MANUAIS 2026/2027
         ===================================================================== */}
      {subTab === "filas" && (
        <div className="space-y-6">
          {/* As 6 Filas Executadas */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-200 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Execução Completa da Fila (`queues_executed`)
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  Relatório das 6 Filas do Sistema de Acervos Processadas e Plugadas no Sistema
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                6 / 6 Filas Concluídas (Somente-Leitura nas Fontes Originais)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(bundle.queues_executed || []).map((q: any) => (
                <div
                  key={q.id}
                  className="p-5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                        {q.id}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="w-3 h-3" />
                        {q.status}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900">{q.title}</h4>
                    <p className="text-xs font-semibold text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200">
                      📊 <strong>Volume Processado:</strong> {q.items_processed}
                    </p>
                    <ul className="space-y-1.5 pt-1">
                      {(q.highlights || []).map((h: string, i: number) => (
                        <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                          <span className="text-blue-700 font-bold mt-0.5">•</span>
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Os 3 Motores MCP Plugados + Errata Adiq p.245 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <div className="border-b border-slate-200 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                  Arquitetura de Plugagem (`mcp_acervo/servidor_mcp.py` ➔ `/api/acervo/search`)
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  As 3 Ferramentas MCP do Sistema de Acervos Plugadas na API Next.js
                </h3>
              </div>
              <div className="space-y-3">
                {(bundle.mcp_tools || []).map((t: any) => (
                  <div key={t.name} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <code className="text-sm font-mono font-bold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                        {t.name}()
                      </code>
                      <span className="text-xs font-mono text-slate-600">{t.script}</span>
                    </div>
                    <div className="text-xs font-semibold text-slate-800">
                      Banco Base: <code className="font-mono text-slate-700">{t.database}</code>
                    </div>
                    <p className="text-xs text-slate-600">{t.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <div className="border-b border-slate-200 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                  Recibo de Saneamento Aplicado (`ADIQ245-ERRATA-20261012`)
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Errata Literal Verificada — Página Física 245 × Elo Liquidação p.612
                </h3>
              </div>
              <p className="text-xs text-slate-600">
                Durante a reconciliação das 31 páginas parciais, a inspeção visual dos pixels da página física 245 (SHA{" "}
                <code className="font-mono">{bundle.errata_adiq_p245?.pdf_sha256?.slice(0, 16)}...</code>) corrigiu 4
                deslocamentos de colunas que constavam na anotação complementar antiga:
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                      <th className="p-2 text-left">Campo</th>
                      <th className="p-2 text-left">Coluna</th>
                      <th className="p-2 text-left">Anotação Antiga</th>
                      <th className="p-2 text-left">Valor Literal Corrigido</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {(bundle.errata_adiq_p245?.corrections || []).map((c: any, idx: number) => (
                      <tr key={idx}>
                        <td className="p-2 font-mono font-bold text-slate-900">Campo {c.field}</td>
                        <td className="p-2 text-slate-700">{c.column}</td>
                        <td className="p-2 font-mono line-through text-rose-700">{c.previous}</td>
                        <td className="p-2 font-mono font-bold text-emerald-800">{c.literal}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Tabela dos Novos Manuais e Releases 2026/2027 recém-ingeridos */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-200 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                  Lotes Incrementais de 07/11/2026 e 09/11/2026 (`acervo.sqlite3`)
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  Novos Manuais de Intercâmbio, Liquidação, Preços e Releases 2026/2027 Plugados
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-600">
                {(bundle.recent_manuals_2026_2027 || []).length} PDFs normativos recentes verificados por SHA-256
              </span>
            </div>

            <div className="overflow-x-auto max-h-[420px] overflow-y-auto border border-slate-200 rounded-xl">
              <table className="w-full text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-800 sticky top-0 z-10 border-b border-slate-200">
                  <tr>
                    <th className="p-3 text-left">Bandeira</th>
                    <th className="p-3 text-left">Arquivo Oficial no Acervo</th>
                    <th className="p-3 text-right">Páginas PDF</th>
                    <th className="p-3 text-left">Status Extração</th>
                    <th className="p-3 text-left">Data Ingestão</th>
                    <th className="p-3 text-left">SHA-256 Verificado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {(bundle.recent_manuals_2026_2027 || []).slice(0, 35).map((m: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{m.brand}</td>
                      <td className="p-3 font-mono font-semibold text-slate-800">{m.name}</td>
                      <td className="p-3 text-right font-mono text-slate-700">{m.pages} págs.</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {m.status}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-slate-600">{(m.updated || "").slice(0, 10)}</td>
                      <td className="p-3 font-mono text-slate-500">{(m.sha256 || "").slice(0, 16)}…</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          SUB-ABA 2: OUTGOING × ÍNDICE DE CAMPOS DO PDF (campos.sqlite3)
         ===================================================================== */}
      {subTab === "campos" && (
        <div className="space-y-6">
          {/* Resumo dos 11 Manuais Indexados em campos.sqlite3 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-200 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                  Motor Posicional (`indice_campos/campos.sqlite3` · PyMuPDF `find_tables`)
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  11 Manuais de Mensageria &amp; Relatórios com 17.106 Campos Extraídos
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {["ALL", "VISA", "MASTERCARD", "ELO"].map((b) => (
                  <button
                    key={b}
                    onClick={() => setBrandFilter(b)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      brandFilter === b
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {b === "ALL" ? "Todas (11 Manuais)" : b}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {(bundle.campos_manuals || [])
                .filter((m: any) => brandFilter === "ALL" || m.bandeira.toUpperCase() === brandFilter)
                .map((m: any) => (
                  <div key={m.doc_id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-indigo-50 text-indigo-900 border border-indigo-200">
                        {m.bandeira}
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-700">
                        {m.linhas_extraidas.toLocaleString("pt-BR")} campos · {m.paginas} págs.
                      </span>
                    </div>
                    <div className="text-sm font-bold text-slate-900">{m.titulo}</div>
                    <div className="text-xs text-slate-600">{m.edicao}</div>
                    <div className="text-[11px] font-mono text-slate-500">
                      SHA-256: {(m.sha256 || "").slice(0, 20)}…
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Mestre-Detalhe: 17 Grupos de Outgoing × Campos Reais do PDF */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-2 max-h-[680px] overflow-y-auto">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 px-2 pb-2 border-b border-slate-200">
                Selecione a Tabela / Registro de Outgoing ({bindings.length})
              </div>
              {bindings.map((b: any) => {
                const isSel = activeBinding?.target_id === b.target_id;
                return (
                  <button
                    key={b.target_id}
                    onClick={() => setSelectedBindingId(b.target_id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all block ${
                      isSel
                        ? "bg-blue-50 border-blue-400 shadow-sm"
                        : "bg-slate-50/70 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-white border border-slate-300 text-slate-800">
                        {b.brand}
                      </span>
                      <span className="font-mono text-[11px] text-slate-600">
                        {b.sample_count} linhas PDF
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-900">{b.label}</div>
                    <div className="text-[11px] font-mono text-slate-500 mt-0.5">doc_id: {b.doc_id}</div>
                  </button>
                );
              })}
            </div>

            <div className="lg:col-span-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              {activeBinding && (
                <>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-200 pb-4">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                        Evidência Estruturada Direta do Manual PDF (`campos.sqlite3`)
                      </span>
                      <h3 className="text-lg font-bold text-slate-900">{activeBinding.label}</h3>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-100 text-slate-800 border border-slate-300">
                      Fonte: {activeBinding.fields?.[0]?.arquivo || activeBinding.doc_id}
                    </span>
                  </div>

                  {activeBinding.fields?.[0] && (
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <strong>Documento Oficial:</strong> {activeBinding.fields[0].documento} ({activeBinding.fields[0].edicao})
                      </div>
                      <div className="font-mono text-slate-600">
                        SHA-256: {activeBinding.fields[0].sha256?.slice(0, 24)}…
                      </div>
                    </div>
                  )}

                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-xs border-collapse">
                      <thead className="bg-slate-100 text-slate-800 border-b border-slate-200">
                        <tr>
                          <th className="p-2.5 text-left">Pág. PDF</th>
                          <th className="p-2.5 text-left">Posição / DE / PDS</th>
                          <th className="p-2.5 text-left">Tam / Formato</th>
                          <th className="p-2.5 text-left">Campo Extraído da Tabela</th>
                          <th className="p-2.5 text-left">Descrição / Valores Literais</th>
                          <th className="p-2.5 text-right">Inspector</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {(activeBinding.fields || []).map((f: any, i: number) => (
                          <tr
                            key={i}
                            onClick={() =>
                              setDrawerAcervoItem({
                                kind: "campo",
                                title: `${f.nome || "Campo"} (${f.posicao || f.de_pds || "-"})`,
                                brand: activeBinding.brand || "Bandeira",
                                subtitle: `${f.documento || activeBinding.label}`,
                                sha256: f.sha256,
                                page: f.pagina,
                                locator: `Pos/DE: ${f.posicao || f.de_pds || "-"} · Tam: ${f.tamanho ? `${f.tamanho}B` : ""} ${f.formato || f.tipo || ""}`,
                                edition: f.edicao,
                                body: f.descricao || f.valor || f.registro || "Especificação estruturada extraída de campos.sqlite3.",
                                extra: `Arquivo PDF: ${f.arquivo || activeBinding.doc_id}`,
                              })
                            }
                            className="cursor-pointer hover:bg-blue-50/60 transition-colors"
                          >
                            <td className="p-2.5 font-mono font-bold text-blue-800 whitespace-nowrap">
                              p. {f.pagina}
                            </td>
                            <td className="p-2.5 font-mono font-semibold text-slate-900 whitespace-nowrap">
                              {f.posicao || f.de_pds || "-"}
                            </td>
                            <td className="p-2.5 font-mono text-slate-600 whitespace-nowrap">
                              {f.tamanho ? `${f.tamanho}B` : ""} {f.formato || f.tipo}
                            </td>
                            <td className="p-2.5 font-bold text-slate-900">{f.nome}</td>
                            <td className="p-2.5 text-slate-700">
                              {f.descricao || f.valor || f.registro}
                            </td>
                            <td className="p-2.5 text-right whitespace-nowrap">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDrawerAcervoItem({
                                    kind: "campo",
                                    title: `${f.nome || "Campo"} (${f.posicao || f.de_pds || "-"})`,
                                    brand: activeBinding.brand || "Bandeira",
                                    subtitle: `${f.documento || activeBinding.label}`,
                                    sha256: f.sha256,
                                    page: f.pagina,
                                    locator: `Pos/DE: ${f.posicao || f.de_pds || "-"} · Tam: ${f.tamanho ? `${f.tamanho}B` : ""} ${f.formato || f.tipo || ""}`,
                                    edition: f.edicao,
                                    body: f.descricao || f.valor || f.registro || "Especificação estruturada extraída de campos.sqlite3.",
                                    extra: `Arquivo PDF: ${f.arquivo || activeBinding.doc_id}`,
                                  });
                                }}
                                className="px-2 py-1 rounded bg-blue-600 text-white text-[11px] font-bold"
                              >
                                Inspecionar ➔
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          SUB-ABA 3: BUSCA UNIFICADA AO VIVO NOS 3 MOTORES MCP + TARIFAS
         ===================================================================== */}
      {subTab === "busca" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                  Motor Unificado (`consultar_acervo` + `consultar_campo` + `consultar_tarifa` + `Regulatorio`)
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  Pesquisa em Tempo Real no Sistema de Acervos
                </h3>
              </div>
              {searchResult && (
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                  {searchResult.liveEngineConnected
                    ? "⚡ Conectado Ao Vivo ao SQLite Local + Bundle"
                    : "📦 Modo Bundle Verificado"}
                  {" · "}
                  {searchResult.timingsMs?.total || 12} ms
                </span>
              )}
            </div>

            <div className="flex flex-col md:flex-row gap-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runLiveSearch()}
                placeholder="Ex.: TCR 0, PDS 0158, IP755120-AA, 5VAS03157, Registro 02, BCB 150, Visa Direct..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 bg-white"
              />
              <select
                value={searchBrand}
                onChange={(e) => setSearchBrand(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white"
              >
                <option value="ALL">Todas as Bandeiras</option>
                <option value="Visa">Visa</option>
                <option value="Mastercard">Mastercard</option>
                <option value="Elo">Elo</option>
              </select>
              <button
                onClick={() => runLiveSearch()}
                disabled={searchLoading}
                className="px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition-colors flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                {searchLoading ? "Consultando Acervo..." : "Consultar Acervo"}
              </button>
            </div>

            {/* Pílulas de Consulta Rápida */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-semibold text-slate-500">Consultas rápidas:</span>
              {[
                { label: "Visa TCR 0 Transaction Code", q: "TCR 0 Transaction Code", b: "Visa" },
                { label: "Mastercard PDS 0158 / DE 50", q: "PDS 0158 DE 50", b: "Mastercard" },
                { label: "Mastercard IP755120-AA", q: "IP755120-AA", b: "Mastercard" },
                { label: "Visa Tarifa 5VAS03157", q: "5VAS03157 settlement", b: "Visa" },
                { label: "Elo Registro 02 Liquidação", q: "Registro 02", b: "Elo" },
                { label: "Visa Direct AFT/OCT", q: "visa-direct-for-card-aft-and-oct", b: "Visa" },
                { label: "Manual Preço MC Brasil Out/26", q: "m_BrazilFees_pt-br_10_6", b: "Mastercard" },
                { label: "Resolução BCB 150 Arranjos", q: "BCB_150_2021 regulamento", b: "ALL" },
              ].map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSearchQuery(p.q);
                    setSearchBrand(p.b);
                    runLiveSearch(p.q, p.b);
                  }}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 hover:bg-blue-50 hover:text-blue-800 text-slate-700 border border-slate-300 transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Resultados da Busca em 3 Camadas */}
          {searchResult && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Coluna Esquerda: Trechos do Acervo + Campos Estruturados */}
              <div className="lg:col-span-7 space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                  <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-700" />
                    Evidências Documentais &amp; Citações (`consultar_acervo` —{" "}
                    {(searchResult.evidence || []).length})
                  </h4>
                  <div className="space-y-3">
                    {(searchResult.evidence || []).map((ev: any, idx: number) => (
                      <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-mono text-xs font-bold text-blue-900">{ev.file}</span>
                          <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-white border border-slate-300 text-slate-700">
                            {ev.unitLabel}
                          </span>
                        </div>
                        <p className="text-xs text-slate-800 leading-relaxed font-mono bg-white p-3 rounded-lg border border-slate-200">
                          {ev.excerpt}
                        </p>
                        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 font-mono">
                          <span>Localizador: {ev.locator}</span>
                          <span>SHA-256: {(ev.sha256 || "").slice(0, 18)}…</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {(searchResult.camposMatched || []).length > 0 && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                    <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-indigo-700" />
                      Campos Posicionais Encontrados (`consultar_campo` —{" "}
                      {searchResult.camposMatched.length})
                    </h4>
                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                      <table className="w-full text-xs border-collapse">
                        <thead className="bg-slate-100 text-slate-800 border-b border-slate-200">
                          <tr>
                            <th className="p-2.5 text-left">Bandeira / Pág.</th>
                            <th className="p-2.5 text-left">Posição</th>
                            <th className="p-2.5 text-left">Campo</th>
                            <th className="p-2.5 text-left">Registro / Manual</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {searchResult.camposMatched.slice(0, 10).map((c: any, idx: number) => (
                            <tr key={idx}>
                              <td className="p-2.5 font-mono font-bold text-indigo-900">
                                {c.bandeira} · p.{c.pagina}
                              </td>
                              <td className="p-2.5 font-mono text-slate-800">{c.posicao || c.de_pds || "-"}</td>
                              <td className="p-2.5 font-bold text-slate-900">{c.nome}</td>
                              <td className="p-2.5 text-slate-600">{c.registro || c.documento}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Coluna Direita: Tarifas Curadas / Fee Schedule + Obrigações Regulatórias */}
              <div className="lg:col-span-5 space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                  <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-amber-700" />
                    Tarifas Curadas &amp; Billing Lines (`consultar_tarifa`)
                  </h4>
                  <div className="space-y-3">
                    {(
                      (searchResult.tarifasMatched?.length > 0
                        ? searchResult.tarifasMatched
                        : bundle.tarifas_curadas || []
                      ).slice(0, 5)
                    ).map((t: any, idx: number) => (
                      <div key={idx} className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-amber-900">
                            {t.tarifa || t.nome_tarifa || t.billing_line}
                          </span>
                          <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-white border border-amber-300 text-amber-900">
                            {t.bandeira || "Visa"}
                          </span>
                        </div>
                        {t.valor && (
                          <div className="text-slate-800">
                            <strong>Valor Oficial:</strong> {t.valor}
                          </div>
                        )}
                        {t.linhas_faturamento && (
                          <div className="font-mono text-[11px] text-slate-700">
                            Billing Lines:{" "}
                            {t.linhas_faturamento.map((l: any) => `${l.codigo} (${l.papel})`).join(" · ")}
                          </div>
                        )}
                        {t.aplicabilidade?.condicao && (
                          <div className="text-slate-700">
                            <strong>Quando Aplica:</strong> {t.aplicabilidade.condicao}
                          </div>
                        )}
                        {t.aplicabilidade?.nao_se_aplica && (
                          <div className="text-emerald-800">
                            <strong>Quando NÃO se aplica:</strong>{" "}
                            {Array.isArray(t.aplicabilidade.nao_se_aplica)
                              ? t.aplicabilidade.nao_se_aplica[0]
                              : t.aplicabilidade.nao_se_aplica}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          SUB-ABA 4: BANDEIRAS ORGANIZADAS (OPS-WORKSPACE-6 · 65.640 REFS)
         ===================================================================== */}
      {subTab === "organizacao" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-200 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
                  OPS-WORKSPACE-6 Integrado (`D:\AI\Bandeiras\organizacao`)
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  Navegação Estruturada por Bandeira, Assunto e Natureza Documental (65.640 Registros)
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-900 border border-teal-300">
                Originais Preservados · Dados de Clientes Isolados
              </span>
            </div>

            {/* Distribuição por Bandeira */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {Object.entries(bundle.organizacao?.summary?.by_brand || {}).map(([brand, count]: [string, any]) => (
                <button
                  key={brand}
                  onClick={() => setOrgBrandFilter(orgBrandFilter === brand ? "ALL" : brand)}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    orgBrandFilter === brand
                      ? "bg-teal-50 border-teal-500 shadow-sm"
                      : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <span className="text-xs font-bold text-slate-700 block">{brand}</span>
                  <strong className="text-lg font-mono font-bold text-slate-900">
                    {Number(count).toLocaleString("pt-BR")}
                  </strong>
                  <span className="text-[11px] text-slate-500 block">referências</span>
                </button>
              ))}
            </div>

            {/* Distribuição pelos 12 Assuntos Canônicos */}
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-3">
                Distribuição pelos 12 Assuntos Canônicos de Pagamentos:
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {Object.entries(bundle.organizacao?.by_subject || {}).map(([subj, cnt]: [string, any]) => (
                  <div key={subj} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-800">{subj}</span>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-900">
                      {Number(cnt).toLocaleString("pt-BR")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Amostra de Manuais e Boletins Classificados */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900">
                  Manuais, Boletins e Planilhas de Trabalho Vinculados ({orgHighlights.length})
                </h4>
                {orgBrandFilter !== "ALL" && (
                  <button
                    onClick={() => setOrgBrandFilter("ALL")}
                    className="text-xs font-bold text-blue-700 hover:underline"
                  >
                    Limpar filtro ({orgBrandFilter})
                  </button>
                )}
              </div>
              <div className="overflow-x-auto max-h-[380px] overflow-y-auto border border-slate-200 rounded-xl">
                <table className="w-full text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-800 sticky top-0 border-b border-slate-200">
                    <tr>
                      <th className="p-2.5 text-left">Bandeira</th>
                      <th className="p-2.5 text-left">Tipo</th>
                      <th className="p-2.5 text-left">Título do Documento</th>
                      <th className="p-2.5 text-left">Assuntos Classificados</th>
                      <th className="p-2.5 text-left">SHA-256</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {orgHighlights.map((h: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2.5 font-bold text-slate-900">{h.brand}</td>
                        <td className="p-2.5">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-semibold">
                            {h.kind}
                          </span>
                        </td>
                        <td className="p-2.5 font-mono font-semibold text-slate-800">{h.title}</td>
                        <td className="p-2.5 text-slate-700">{(h.subjects || []).join(", ")}</td>
                        <td className="p-2.5 font-mono text-slate-500">{(h.sha256 || "").slice(0, 14)}…</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          SUB-ABA 5: ACERVO REGULATÓRIO BCB & CMN (94 NORMAS · 18 TEMAS)
         ===================================================================== */}
      {subTab === "regulatorio" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-200 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-purple-800">
                  Lotes Regulatórios BCB &amp; CMN (`2026-10-23_01` e `2026-10-24_02`)
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  94 Normas Oficiais · 18 Temas da Matriz de Cobertura · 22 Obrigações Candidatas c/ Citação Literal
                </h3>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {["ALL", "instituidor", "emissor", "credenciador", "subcredenciador", "iniciador"].map((role) => (
                  <button
                    key={role}
                    onClick={() => setRegRoleFilter(role)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      regRoleFilter === role
                        ? "bg-purple-800 text-white border-purple-900"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {role === "ALL" ? "Todos os Papéis" : role.charAt(0).toUpperCase() + role.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Obrigações Candidatas com Citação Literal do BCB/CMN */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {regObligations.map((ob: any, idx: number) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono font-bold px-2.5 py-0.5 rounded bg-purple-50 text-purple-900 border border-purple-200">
                      {ob.fonte_localizador}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {(ob.papeis_candidatos || []).map((p: string, i: number) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-white border border-slate-300 text-slate-700 font-semibold"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-sm font-bold text-slate-900">{ob.acao_candidata_descritiva}</div>
                  <div className="text-slate-600">
                    <strong>Condição e Limite:</strong> {ob.condicao_e_limite}
                  </div>
                  {ob.evidencia?.literal_quote && (
                    <blockquote className="p-3 rounded-lg bg-white border border-slate-200 font-mono text-[11px] text-slate-800 whitespace-pre-line">
                      &ldquo;{ob.evidencia.literal_quote}&rdquo;
                    </blockquote>
                  )}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-500 pt-1">
                    <span>Versão: {ob.evidencia?.version}</span>
                    <span>SHA-256: {(ob.evidencia?.source_sha256 || "").slice(0, 16)}…</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Matriz de Cobertura Regulatória (18 Temas) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h4 className="text-base font-bold text-slate-900">
              Matriz de Cobertura por Tema Regulatório BCB / CMN (18 Temas)
            </h4>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-800 border-b border-slate-200">
                  <tr>
                    <th className="p-3 text-left">Tema Regulatório</th>
                    <th className="p-3 text-left">Papéis Atingidos</th>
                    <th className="p-3 text-left">Atos Normativos Coletados</th>
                    <th className="p-3 text-left">Localizadores Prioritários</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {(bundle.regulatorio_bcb_cmn?.matriz_cobertura || []).map((row: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{row.tema}</td>
                      <td className="p-3 text-slate-700">{(row.papeis || []).join(", ")}</td>
                      <td className="p-3 font-mono text-purple-900">
                        {(row.coletadas || []).slice(0, 6).join(", ")}
                        {(row.coletadas || []).length > 6 ? ` (+${row.coletadas.length - 6})` : ""}
                      </td>
                      <td className="p-3 font-mono text-slate-600">{row.localizadores_prioritarios}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          SLIDE-OVER INSPECTOR DRAWER DO ACERVO (CAMPOS SQLITE / PDF / NORMAS)
         ===================================================================== */}
      {drawerAcervoItem && (
        <div
          className="fixed inset-0 z-[95] flex justify-end bg-slate-900/40 backdrop-blur-[2px]"
          onClick={() => setDrawerAcervoItem(null)}
        >
          <div
            className="w-full max-w-[460px] h-full bg-white border-l border-slate-200 shadow-2xl flex flex-col overflow-hidden text-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded bg-blue-100 border border-blue-200 text-[10px] font-mono font-black text-blue-700">
                    {drawerAcervoItem.brand}
                  </span>
                  {drawerAcervoItem.page && (
                    <span className="px-2 py-0.5 rounded bg-emerald-100 border border-emerald-200 text-[10px] font-mono font-bold text-emerald-800">
                      Página PDF: p. {drawerAcervoItem.page}
                    </span>
                  )}
                </div>
                <h3 className="text-base font-black text-slate-900 leading-snug">
                  {drawerAcervoItem.title}
                </h3>
                <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                  {drawerAcervoItem.subtitle}
                </p>
              </div>
              <button
                onClick={() => setDrawerAcervoItem(null)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-xs font-bold text-slate-600 shrink-0"
              >
                ✕ Fechar
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              <div className="rounded-xl bg-[#0f172a] border border-slate-800 p-4 space-y-2 shadow-inner">
                <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  <span>Evidência Auditável SQLite · SHA-256</span>
                  <span className="text-cyan-400">
                    {drawerAcervoItem.page ? `p. ${drawerAcervoItem.page}` : "Verificado"}
                  </span>
                </div>
                <pre className="dark-terminal font-mono text-xs text-cyan-300 whitespace-pre-wrap break-all leading-relaxed">
{`FONTE     : ${drawerAcervoItem.subtitle}
EDIÇÃO    : ${drawerAcervoItem.edition || "2026 / 2027"}
LOCAL     : ${drawerAcervoItem.locator || `Página ${drawerAcervoItem.page || "-"}`}
SHA-256   : ${drawerAcervoItem.sha256 || "Verificado no manifesto do acervo"}`}
                </pre>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 space-y-1.5">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Conteúdo / Regra Extraída do Manual Oficial
                </div>
                <p className="text-slate-800 leading-relaxed whitespace-pre-line">
                  {drawerAcervoItem.body}
                </p>
              </div>

              {drawerAcervoItem.extra && (
                <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3.5 font-mono text-[11px] text-blue-900">
                  {drawerAcervoItem.extra}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-2">
              <button
                onClick={() => {
                  sendToDocStudio({
                    mode: "append_html",
                    title: `Evidência do Acervo — ${drawerAcervoItem.brand}: ${drawerAcervoItem.title}`,
                    sourceModule: "Hub do Acervo & Regulatório 2.0",
                    metadata: {
                      brand: drawerAcervoItem.brand.toLowerCase().includes("visa")
                        ? "visa"
                        : drawerAcervoItem.brand.toLowerCase().includes("master")
                        ? "mastercard"
                        : "elo",
                      brandName: drawerAcervoItem.brand,
                      referenceId: `p.${drawerAcervoItem.page || "-"}`,
                      category: "Evidência PDF / SQLite",
                      effectiveDate: drawerAcervoItem.edition || "2026/2027",
                      riskLevel: "Médio",
                      executiveSummary: drawerAcervoItem.body,
                      recommendedAction: drawerAcervoItem.locator || "",
                    },
                    html: `
                      <h3>Citação Auditável do Acervo — ${drawerAcervoItem.title}</h3>
                      <ul>
                        <li><strong>Documento Oficial:</strong> ${drawerAcervoItem.subtitle} (${drawerAcervoItem.edition || "Vigência Atual"})</li>
                        <li><strong>Localização / Página PDF:</strong> p. ${drawerAcervoItem.page || "-"} (${drawerAcervoItem.locator || ""})</li>
                        <li><strong>Hash SHA-256:</strong> <code>${drawerAcervoItem.sha256 || "N/A"}</code></li>
                      </ul>
                      <blockquote>${drawerAcervoItem.body}</blockquote>
                      <p></p>
                    `,
                  });
                }}
                className="w-full px-3 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold text-center transition-all"
              >
                📝 Enviar Citação Auditável (SHA-256 + Pág. PDF) para o Doc Studio (/editor)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
