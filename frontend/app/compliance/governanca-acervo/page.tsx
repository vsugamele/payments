"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft, Globe, ShieldCheck, AlertTriangle, Database,
  FileText, Layers, CheckCircle2, Search
} from "lucide-react";

export default function GovernancaAcervoPage() {
  const [activeTab, setActiveTab] = useState<"grafo" | "conflitos" | "auditoria">("grafo");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [brandFilter, setBrandFilter] = useState("ALL");
  const [compFilter, setCompFilter] = useState("ALL");
  const [selectedEdge, setSelectedEdge] = useState<any>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/governanca-acervo");
        const json = await res.json();
        if (json.connected) {
          setData(json);
          if (json.edges?.length) {
            setSelectedEdge(json.edges[0]);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const edges = (data?.edges || []).filter((e: any) => {
    if (brandFilter !== "ALL" && e.brand !== brandFilter) return false;
    if (compFilter !== "ALL" && e.component !== compFilter) return false;
    return true;
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
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  Grafo Normativo Auditado (`D:\AI\Bandeiras`)
                </span>
              </div>
              <h1 className="text-lg md:text-xl font-bold text-white mt-0.5">
                Mapa Auditado de Liquidação Internacional (FX / Multicurrency) & Governança do Acervo
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400">Relações c/ Citação Literal: </span>
              <strong className="font-mono text-cyan-300">{data?.graphMeta?.totalEdges || 31}</strong>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400">Cobertura Revisão: </span>
              <strong className="font-mono text-emerald-400">
                {data?.graphMeta?.coverage?.literal_completed || 132}/{data?.graphMeta?.coverage?.total || 163}
              </strong>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400">Claims Curados: </span>
              <strong className="font-mono text-amber-300">{data?.coverage?.curated_claims || 169}</strong>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-2 overflow-x-auto border-t border-slate-800/50 pt-2 pb-2">
          <button
            onClick={() => setActiveTab("grafo")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === "grafo"
                ? "bg-cyan-600 text-white font-bold shadow-lg shadow-cyan-600/25"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            1. Grafo de Liquidação Internacional & Evidências Literais (31 Arestas V01–M14)
          </button>
          <button
            onClick={() => setActiveTab("conflitos")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === "conflitos"
                ? "bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/25"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            2. Divergências & Bloqueios Documentais (TN3A MCBS, TC 33.A & VSS)
          </button>
          <button
            onClick={() => setActiveTab("auditoria")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === "auditoria"
                ? "bg-purple-600 text-white font-bold shadow-lg shadow-purple-600/25"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            3. Cobertura do Acervo (`coverage.json`) & Documentos c/ Ação Requerida
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-8">
        {/* =====================================================
            TAB 1: GRAFO AUDITADO DE LIQUIDAÇÃO INTERNACIONAL
           ===================================================== */}
        {activeTab === "grafo" && (
          <div className="space-y-6">
            <div className="bg-[#080f1e] border border-slate-800/80 rounded-2xl p-6 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                    Mapa Auditado (`D:\AI\Bandeiras\mapa-liquidacao-internacional\graph.json`)
                  </span>
                  <h2 className="text-base font-bold text-white">
                    Evidências Literais de Multicurrency, Conversão FX, DE 5 / DE 50 / DE 51, TC 05 e VSS-110/210/467/600
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={brandFilter}
                    onChange={(e) => setBrandFilter(e.target.value)}
                    className="bg-[#030711] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="ALL">Visa + Mastercard (31 arestas)</option>
                    <option value="Visa">Visa (V01–V17)</option>
                    <option value="Mastercard">Mastercard (M01–M14)</option>
                  </select>
                  <select
                    value={compFilter}
                    onChange={(e) => setCompFilter(e.target.value)}
                    className="bg-[#030711] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="ALL">Todas as Etapas</option>
                    <option value="authorization">Authorization (DE 5 / DE 51)</option>
                    <option value="financial">Single Message (DE 50 / DE 9 / FREC)</option>
                    <option value="clearing">Clearing (Base II / TC 05 / TC 33)</option>
                    <option value="settlement">Settlement (VSS / TC 46 / SRE)</option>
                    <option value="billing">Billing (MCBS / TN3A)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 bg-[#080f1e] border border-slate-800/80 rounded-2xl overflow-hidden">
                <div className="max-h-[680px] overflow-y-auto divide-y divide-slate-800/60">
                  {edges.map((e: any) => {
                    const isSel = selectedEdge?.id === e.id;
                    return (
                      <button
                        key={e.id}
                        onClick={() => setSelectedEdge(e)}
                        className={`w-full text-left p-4 transition-colors block ${
                          isSel ? "bg-cyan-950/35 border-l-4 border-l-cyan-400" : "hover:bg-slate-900/50"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                              {e.id}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                e.brand === "Visa"
                                  ? "bg-blue-500/15 text-blue-300"
                                  : "bg-amber-500/15 text-amber-300"
                              }`}
                            >
                              {e.brand}
                            </span>
                            <span className="text-[11px] font-mono text-slate-400">
                              {e.from} → {e.to}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                            {e.component}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-white">{e.label}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{e.direction}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="lg:col-span-5">
                {selectedEdge && (
                  <div className="bg-[#080f1e] border border-slate-800/80 rounded-2xl p-6 sticky top-32 space-y-4 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <span className="font-mono font-bold text-cyan-300 text-sm">
                        Aresta {selectedEdge.id} ({selectedEdge.brand})
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                        Papel: {selectedEdge.role}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white">{selectedEdge.label}</h3>

                    <div className="space-y-2 p-3.5 rounded-xl bg-[#030711] border border-slate-800">
                      <div>
                        <span className="text-[10px] uppercase text-slate-400 block">Direção Técnica</span>
                        <strong className="text-slate-200">{selectedEdge.direction}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-slate-400 block">Aplicabilidade</span>
                        <span className="text-slate-300">{selectedEdge.applicability}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-amber-400 block">Limitações Auditadas (No Invention)</span>
                        <span className="text-amber-200/90">{selectedEdge.limitations}</span>
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-1.5">
                        Citação Literal Verificada no PDF ({selectedEdge.document_title} · p.{selectedEdge.physical_page})
                      </div>
                      <blockquote className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 font-mono text-[11px] text-emerald-200 whitespace-pre-line leading-relaxed">
                        &ldquo;{selectedEdge.quote}&rdquo;
                      </blockquote>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =====================================================
            TAB 2: CONFLITOS E BLOQUEIOS DOCUMENTAIS (TN3A / TC33)
           ===================================================== */}
        {activeTab === "conflitos" && (
          <div className="space-y-6">
            {(data?.modules || []).map((mod: any) => (
              <div key={mod.id} className="bg-[#080f1e] border border-slate-800/80 rounded-2xl p-6 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <span className="font-mono text-xs font-bold text-amber-400">{mod.id}</span>
                    <h2 className="text-base font-bold text-white">{mod.title}</h2>
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold">
                    Status: {mod.status}
                  </span>
                </div>

                <div>
                  <div className="text-xs font-bold text-slate-300 mb-2">Requisitos Normativos & Operacionais:</div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {(mod.requirements || []).map((req: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-cyan-400">•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {mod.known_conflicts?.length > 0 && (
                  <div className="pt-3 border-t border-slate-800 space-y-2">
                    <div className="text-xs font-bold text-rose-400">
                      Divergências / Conflitos Literais Detectados entre Boletim PDF × Planilha XLSX:
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {mod.known_conflicts.map((c: any) => (
                        <div key={c.id} className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30 text-xs space-y-1">
                          <div className="font-mono font-bold text-rose-300">{c.id}</div>
                          <p className="text-slate-200">{c.finding}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* =====================================================
            TAB 3: COBERTURA DO ACERVO & AÇÃO REQUERIDA
           ===================================================== */}
        {activeTab === "auditoria" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-[#080f1e] border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Locais Inventariados</span>
                <strong className="text-xl font-mono text-white">
                  {(data?.coverage?.locations || 28918).toLocaleString("pt-BR")}
                </strong>
              </div>
              <div className="p-4 rounded-2xl bg-[#080f1e] border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Ativos Únicos (SHA-256)</span>
                <strong className="text-xl font-mono text-emerald-400">
                  {(data?.coverage?.unique_assets || 8582).toLocaleString("pt-BR")}
                </strong>
              </div>
              <div className="p-4 rounded-2xl bg-[#080f1e] border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Observações de Metadados</span>
                <strong className="text-xl font-mono text-blue-400">
                  {(data?.coverage?.metadata_observations || 41015).toLocaleString("pt-BR")}
                </strong>
              </div>
              <div className="p-4 rounded-2xl bg-[#080f1e] border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Relações Mapeadas</span>
                <strong className="text-xl font-mono text-purple-400">
                  {(data?.coverage?.relations || 166538).toLocaleString("pt-BR")}
                </strong>
              </div>
            </div>

            <div className="bg-[#080f1e] border border-slate-800/80 rounded-2xl p-6 space-y-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400">
                  Fila de Saneamento (`action_needed_documents.json`)
                </span>
                <h2 className="text-base font-bold text-white">
                  Documentos Corrompidos, Criptografados (DRM/RMS) ou Zero-Bytes que Exigem Substituição na Fonte
                </h2>
              </div>

              <div className="space-y-3">
                {(data?.actionNeeded || []).map((doc: any, i: number) => (
                  <div key={i} className="p-4 rounded-xl bg-[#030711] border border-rose-500/30 text-xs space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-mono font-bold text-white">{doc.file}</span>
                      <span className="font-mono text-[11px] text-rose-300">{doc.bytes} bytes</span>
                    </div>
                    <div className="text-amber-300">
                      <strong>Diagnóstico:</strong> {doc.reason}
                    </div>
                    <div className="text-slate-400">
                      <strong>Ação Recomendada:</strong> {doc.required_action}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
