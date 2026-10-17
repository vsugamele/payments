"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Eye,
  FileText,
  Sparkles,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ChevronDown,
  ChevronUp,
  DollarSign,
} from "lucide-react";
import { sendToDocStudio } from "@/lib/docStudioBridge";

interface VisaBL {
  c: string;
  inv: string;
  ld: string;
  cat: string;
  p: string;
  n: string;
  st: string;
  br: string;
  s: string;
  e: string;
  ct: string;
  cur: string;
  pr: string;
  fi: number;
  nv: number;
  nw: string;
  fs: string;
  hi: number[];
}

interface VisaFeeVersion {
  i: number;
  cat: string;
  p: string;
  n: string;
  st: string;
  s: string;
  e: string;
  br: boolean;
  nc: number;
  ct: string[];
  cur: string;
  drv: string;
  pr: string;
  b: string[];
  h: string;
  rateBullets?: string[];
  plainText?: string;
}

interface VisaChangeRow {
  cat: string;
  prod: string;
  fee: string;
  st: string;
  br: boolean;
  curStart: string;
  curEnd: string;
  prevStart: string;
  prevEnd: string;
  nVers: number;
  added: string[];
  removed: string[];
  textChanged: boolean;
  priceChanged: boolean;
  curPrice: string;
  prevPrice: string;
  curCur: string;
  prevCur: string;
  future: string;
}

interface VisaProdRow {
  cat: string;
  p: string;
  d: string;
  nf: number;
  nv: number;
  nb: number;
}

function fmtDate(iso?: string): string {
  if (!iso) return "—";
  if (iso.startsWith("9999")) return "Indeterminado";
  const d = iso.slice(0, 10);
  const parts = d.split("-");
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return d;
}

export default function VisaFeeScheduleBrPanel() {
  const [data, setData] = useState<{
    g: string;
    c: string;
    b: VisaBL[];
    f: VisaFeeVersion[];
    ch: VisaChangeRow[];
    pd: VisaProdRow[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [subTab, setSubTab] = useState<"bl" | "versoes" | "diff" | "produtos">("bl");

  // Filters for Billing Lines
  const [q, setQ] = useState("");
  const [catFilter, setCatFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [onlyNew, setOnlyNew] = useState(false);
  const [hoveredBl, setHoveredBl] = useState<VisaBL | null>(null);
  const [expandedBlCode, setExpandedBlCode] = useState<string | null>(null);
  const [selectedHistoryVersionIdx, setSelectedHistoryVersionIdx] = useState<Record<string, number>>({});

  // Filters for Versions
  const [verQ, setVerQ] = useState("");
  const [verStatus, setVerStatus] = useState("Vigente");
  const [expandedVerIdx, setExpandedVerIdx] = useState<number | null>(null);

  // Filters for Diff
  const [onlyChangedDiff, setOnlyChangedDiff] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/arquivos?action=visa_fee_schedule_br");
        const json = await res.json();
        if (json.connected && json.schedule) {
          setData(json.schedule);
          if (json.schedule.b?.length > 0) {
            setHoveredBl(json.schedule.b[0]);
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

  const categories = useMemo(() => {
    if (!data?.b) return [];
    return Array.from(new Set(data.b.map((item) => item.cat).filter(Boolean))).sort();
  }, [data]);

  const filteredBls = useMemo(() => {
    if (!data?.b) return [];
    const term = q.trim().toLowerCase();
    return data.b.filter((item) => {
      if (catFilter !== "ALL" && item.cat !== catFilter) return false;
      if (statusFilter !== "ALL" && item.st !== statusFilter) return false;
      if (onlyNew && item.nw !== "Sim") return false;
      if (!term) return true;
      const fv = data.f[item.fi];
      const hay = `${item.c} ${item.inv} ${item.ld} ${item.cat} ${item.p} ${item.n} ${item.ct} ${
        fv?.plainText || ""
      }`.toLowerCase();
      return hay.includes(term);
    });
  }, [data, q, catFilter, statusFilter, onlyNew]);

  const filteredVersions = useMemo(() => {
    if (!data?.f) return [];
    const term = verQ.trim().toLowerCase();
    return data.f.filter((fv) => {
      if (verStatus !== "ALL" && fv.st !== verStatus) return false;
      if (!term) return true;
      const hay = `${fv.cat} ${fv.p} ${fv.n} ${(fv.b || []).join(" ")} ${fv.plainText || ""}`.toLowerCase();
      return hay.includes(term);
    });
  }, [data, verQ, verStatus]);

  const filteredDiffs = useMemo(() => {
    if (!data?.ch) return [];
    return data.ch.filter((c) => {
      if (!onlyChangedDiff) return true;
      return (
        c.priceChanged ||
        c.textChanged ||
        (c.added && c.added.length > 0) ||
        (c.removed && c.removed.length > 0) ||
        Boolean(c.future)
      );
    });
  }, [data, onlyChangedDiff]);

  if (loading || !data) {
    return (
      <div className="bg-[#080f1e] border border-slate-800/80 rounded-2xl p-12 text-center text-xs text-slate-400">
        Carregando base oficial `feeschedule.visaonline.com` (454 Billing Lines · 148 Versões de Tarifa · Tabelas de Preço BRL)...
      </div>
    );
  }

  const activeHoverFv = hoveredBl ? data.f[hoveredBl.fi] : null;

  return (
    <div className="space-y-6">
      {/* Top Executive Summary & Brazil Billing Governance Rules */}
      <div className="bg-gradient-to-br from-blue-950/40 via-[#080f1e] to-indigo-950/30 border border-blue-500/30 rounded-2xl p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 text-[10px] font-bold uppercase tracking-wider">
                Fonte Oficial: feeschedule.visaonline.com · Perfil BRAZIL (LAC)
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono font-bold">
                All / Acquirer Processor / Issuer Processor
              </span>
            </div>
            <h2 className="text-lg font-extrabold text-white">
              Controle Mestre de Billing Lines & Versões de Tarifa — Visa Fee Schedule Brasil (2026)
            </h2>
            <p className="text-xs text-slate-300">
              Tabelas integrais de preços em Reais (`R$`) e Dólares (`USD`), histórico completo de vigências (`1950 → 2024 → 2026 → 2027`), comparativo de alterações e regras tributárias/cambiais do Visa Online Invoice Portal (VOIP).
            </p>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 shrink-0">
            {[
              { val: "454", lbl: "BLs Únicas", color: "text-white" },
              { val: "436", lbl: "Vigentes BR", color: "text-emerald-400" },
              { val: "11", lbl: "Novas 2026", color: "text-amber-300" },
              { val: "148", lbl: "Versões", color: "text-blue-400" },
              { val: "43", lbl: "Alteradas", color: "text-purple-300" },
              { val: "44", lbl: "Produtos", color: "text-cyan-300" },
            ].map((k, i) => (
              <div key={i} className="bg-[#030711]/90 border border-slate-800 rounded-xl px-3 py-2 text-center">
                <div className={`text-sm font-black font-mono ${k.color}`}>{k.val}</div>
                <div className="text-[9px] uppercase tracking-wider text-slate-400">{k.lbl}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Brazil Invoice Governance & Exchange Rate History */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-[#030711]/90 border border-slate-800 rounded-xl p-3.5 space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
              Ciclo de Faturamento VOIP & Vencimento (Brasil)
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Faturas emitidas no <strong className="text-white">4º dia útil</strong> de cada mês no <em>Visa Online Invoice Portal (VOIP)</em> e pagas em <strong className="text-emerald-300">BRL</strong> à <em>Visa do Brasil Empreendimentos Ltda.</em> até o <strong className="text-white">10º dia útil</strong>. Taxas do <em>Operating Certificate</em>: 1/3 no 1º mês do trimestre + adiantamento de 2/3.
            </p>
          </div>

          <div className="bg-[#030711]/90 border border-slate-800 rounded-xl p-3.5 space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              Histórico de Câmbio Anual Visa & Migração para BRL (2026)
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Taxa Fixa Anual Visa: <span className="font-mono text-slate-200">2023 = R$ 5,486642</span> · <span className="font-mono text-slate-200">2024 = R$ 4,956247</span> · <span className="font-mono text-amber-300">2025 = R$ 6,468186</span>. Em <strong className="text-white">2026</strong>, tarifas domésticas passaram a ser tabeladas diretamente em <strong className="text-emerald-300">Reais (BRL)</strong>, com reajuste anual em <strong className="text-white">Março pelo IPCA (IBGE)</strong>. Internacional usa câmbio Base II (TC 56).
            </p>
          </div>

          <div className="bg-[#030711]/90 border border-slate-800 rounded-xl p-3.5 space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
              Multas de Atraso, Gross-Up Tributário & Fora do Arranjo
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Atraso na fatura: <strong className="text-rose-300">Multa de 2% + IGP-M/FGV + 1% a.m. pro rata die</strong>. Atraso na liquidação (`5F4023210`): mínimo de <strong className="text-rose-300">R$ 3.200/dia</strong>. Preços líquidos de impostos (cláusula obrigatória de <em>Gross-Up</em>). Serviços opcionais trazem selo <em>&ldquo;Service Not Included in Visa&rsquo;s Payment Arrangements&rdquo;</em>.
            </p>
          </div>
        </div>

        {/* Sub-Tabs Navigation */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {[
            { id: "bl", label: `1. Cadastro Mestre de Billing Lines (${data.b.length})` },
            { id: "versoes", label: `2. Versões de Tarifa & Tabelas de Preço (${data.f.length})` },
            { id: "diff", label: `3. Comparativo de Alterações / Diff (${filteredDiffs.length})` },
            { id: "produtos", label: `4. Catálogo de Produtos Visa (${data.pd.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                subTab === tab.id
                  ? "bg-blue-600 text-white border-blue-500 shadow-sm"
                  : "bg-[#030711] text-slate-300 border-slate-800 hover:border-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ===================================================================
          SUB-TAB 1: 454 BILLING LINES
         =================================================================== */}
      {subTab === "bl" && (
        <div className="space-y-5">
          {/* Search & Filters */}
          <div className="bg-[#080f1e] border border-slate-800/80 rounded-2xl p-5 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-slate-400">Atalhos Rápidos (Preços em R$):</span>
              {[
                { label: "Licenciamento de BIN (5B1121000 — R$ 3.200 / Subutilizado R$ 5.400)", q: "5B1121" },
                { label: "Disputas VROL (5H4010133 — R$ 10,35 a R$ 29)", q: "5H4010" },
                { label: "Relatórios VSS (5F4020 — R$ 323/relatório)", q: "5F4020" },
                { label: "Stop Payment VSPS (5VAS006 — R$ 22,64 / Retentativa R$ 7)", q: "5VAS006" },
                { label: "Account Name Inquiry ANI / AVS OBO (R$ 0,32 / R$ 0,10)", q: "Account Name Inquiry" },
                { label: "HSM-as-a-Service & Cloud Connect (5VAS011)", q: "5VAS011" },
                { label: "Multas Non-Compliance (Gambling / AIS / VAMP)", q: "Non-compliance" },
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQ(chip.q);
                    setCatFilter("ALL");
                    setStatusFilter("ALL");
                    setOnlyNew(false);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-blue-950/60 border border-slate-800 hover:border-blue-500/40 text-[11px] text-slate-300 transition-colors"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-5">
                <input
                  type="text"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Buscar por Billing Line (ex: 5B1121008, 5H4010133), produto, descrição ou valor em R$..."
                  className="w-full bg-[#030711] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="md:col-span-3">
                <select
                  value={catFilter}
                  onChange={(e) => setCatFilter(e.target.value)}
                  className="w-full bg-[#030711] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="ALL">Todas as Categorias ({categories.length})</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-[#030711] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="ALL">Todos os Status</option>
                  <option value="Vigente">Vigentes (436)</option>
                  <option value="Encerrada">Encerradas (18)</option>
                </select>
              </div>
              <div className="md:col-span-2 flex items-center justify-between gap-2 px-2">
                <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlyNew}
                    onChange={(e) => setOnlyNew(e.target.checked)}
                    className="rounded border-slate-700"
                  />
                  <span>Só Novas (11)</span>
                </label>
                <span className="text-xs font-mono text-slate-400">
                  <strong className="text-white">{filteredBls.length}</strong> BLs
                </span>
              </div>
            </div>
          </div>

          {/* Live Hover Raio-X Card */}
          {hoveredBl && activeHoverFv && (
            <div className="bg-gradient-to-r from-blue-950/40 via-[#080f1e] to-purple-950/30 border border-blue-500/40 rounded-2xl p-5 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3 mb-4">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/20 border border-blue-500/40 text-blue-200 text-[10px] font-bold uppercase tracking-wider">
                    <Eye className="w-3.5 h-3.5" /> Raio-X Visa Fee Schedule Brasil
                  </span>
                  <span className="px-3 py-0.5 rounded-lg bg-slate-900 border border-blue-500/40 font-mono text-sm font-black text-blue-300">
                    {hoveredBl.c}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                      hoveredBl.st === "Vigente"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    {hoveredBl.st} · Vigência: {fmtDate(hoveredBl.s)} → {fmtDate(hoveredBl.e)}
                  </span>
                  {hoveredBl.nw === "Sim" && (
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-bold">
                      ★ Nova na Versão Vigente
                    </span>
                  )}
                </div>

                <button
                  onClick={() => {
                    const html = `
                      <h2>Ficha Oficial Visa Fee Schedule Brasil — ${hoveredBl.c} (${hoveredBl.inv || hoveredBl.n})</h2>
                      <p><strong>Categoria:</strong> ${hoveredBl.cat} · <strong>Produto:</strong> ${hoveredBl.p} · <strong>Tarifa:</strong> ${hoveredBl.n}</p>
                      <p><strong>Status no Brasil:</strong> ${hoveredBl.st} (${fmtDate(hoveredBl.s)} → ${fmtDate(hoveredBl.e)}) · <strong>Clientes Aplicáveis:</strong> ${hoveredBl.ct}</p>
                      <p><strong>Descrição Detalhada:</strong> ${hoveredBl.ld || hoveredBl.inv}</p>
                      <h3>Regras Oficiais e Tabela de Preços (${activeHoverFv.n})</h3>
                      <div style="border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; background: #f8fafc;">
                        ${activeHoverFv.h}
                      </div>
                    `;
                    sendToDocStudio({
                      mode: "append_html",
                      title: `Visa Fee Schedule Brasil — ${hoveredBl.c} (${hoveredBl.p})`,
                      sourceModule: "Controle Visa Fee Schedule Brasil (/compliance/arquivos)",
                      html,
                    });
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm transition-all"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Enviar Tabela & Regras para Doc Studio (/editor)
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs">
                <div className="lg:col-span-5 bg-[#030711]/90 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                    Identificação na Fatura & Descrição do Portal
                  </div>
                  <div className="text-sm font-bold text-white">{hoveredBl.inv || hoveredBl.n}</div>
                  <p className="text-slate-300 leading-relaxed">
                    {hoveredBl.ld || "Tarifa oficial publicada no portal feeschedule.visaonline.com para o perfil Brasil."}
                  </p>
                  <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
                    <div>
                      <strong>Produto / Tarifa:</strong> <span className="text-slate-200">{hoveredBl.p} — {hoveredBl.n}</span>
                    </div>
                    <div>
                      <strong>Quem Paga (Client Types):</strong> <span className="text-cyan-300">{hoveredBl.ct}</span>
                    </div>
                    <div>
                      <strong>Histórico no Portal:</strong> <span className="text-amber-300">{hoveredBl.nv} versões registradas (1ª aparição: {fmtDate(hoveredBl.fs)})</span>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-7 bg-[#030711]/90 border border-emerald-500/30 rounded-xl p-4 space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    Preços e Faixas Extraídos da Versão Atual ({activeHoverFv.rateBullets?.length || 0} linhas de preço)
                  </div>
                  {activeHoverFv.rateBullets && activeHoverFv.rateBullets.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-44 overflow-y-auto pr-1">
                      {activeHoverFv.rateBullets.map((rb, idx) => (
                        <div
                          key={idx}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 font-mono text-[11px] text-emerald-200"
                        >
                          {rb}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-[11px]">
                      Clique na linha abaixo para abrir a tabela HTML completa de regras e preços desta tarifa.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Billing Lines Table */}
          <div className="bg-[#080f1e] border border-slate-800/80 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto max-h-[680px]">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="sticky top-0 z-10 bg-slate-900 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Billing Line</th>
                    <th className="py-3 px-4">Descrição na Fatura / Portal</th>
                    <th className="py-3 px-3">Categoria / Produto</th>
                    <th className="py-3 px-3">Status & Vigência</th>
                    <th className="py-3 px-3">Clientes</th>
                    <th className="py-3 px-3">Preços Extraídos (BRL / USD)</th>
                    <th className="py-3 px-3">Versões</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredBls.map((bl) => {
                    const isExpanded = expandedBlCode === bl.c;
                    const fv = data.f[bl.fi];
                    const activeHistIdx = selectedHistoryVersionIdx[bl.c] ?? bl.fi;
                    const activeHistFv = data.f[activeHistIdx] || fv;

                    return (
                      <React.Fragment key={bl.c}>
                        <tr
                          onMouseEnter={() => setHoveredBl(bl)}
                          onClick={() => setExpandedBlCode(isExpanded ? null : bl.c)}
                          className={`cursor-pointer transition-colors ${
                            isExpanded ? "bg-blue-950/40" : "hover:bg-slate-900/60"
                          }`}
                        >
                          <td className="py-3 px-4 font-mono font-bold text-blue-300 whitespace-nowrap">
                            <div>{bl.c}</div>
                            {bl.nw === "Sim" && (
                              <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-sans font-bold">
                                NOVA
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 max-w-md">
                            <div className="font-bold text-white">{bl.inv || bl.n}</div>
                            <div className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{bl.ld}</div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-semibold text-slate-200">{bl.p}</div>
                            <div className="text-[10px] text-slate-400">{bl.cat}</div>
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                bl.st === "Vigente"
                                  ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                                  : "bg-slate-800 text-slate-400"
                              }`}
                            >
                              {bl.st}
                            </span>
                            <div className="text-[10px] font-mono text-slate-400 mt-1">
                              {fmtDate(bl.s)} → {fmtDate(bl.e)}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-[11px] text-slate-300 max-w-[160px]">{bl.ct}</td>
                          <td className="py-3 px-3 max-w-xs">
                            {fv?.rateBullets && fv.rateBullets.length > 0 ? (
                              <div className="space-y-1">
                                {fv.rateBullets.slice(0, 2).map((b, i) => (
                                  <div
                                    key={i}
                                    className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 font-mono text-[10px] text-emerald-300 truncate"
                                  >
                                    {b}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-500">Ver tabela completa ↓</span>
                            )}
                          </td>
                          <td className="py-3 px-3 font-mono text-center">
                            <span className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-[11px]">
                              {bl.nv}v {isExpanded ? "▲" : "▼"}
                            </span>
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr className="bg-[#050b16] border-b border-blue-500/30">
                            <td colSpan={7} className="p-5 space-y-4">
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="space-y-1">
                                  <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                                    Linha do Tempo de Versões da Tarifa ({bl.hi.length} períodos registrados)
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {bl.hi.map((vIdx) => {
                                      const hFv = data.f[vIdx];
                                      if (!hFv) return null;
                                      const isSel = activeHistIdx === vIdx;
                                      return (
                                        <button
                                          key={vIdx}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedHistoryVersionIdx((prev) => ({
                                              ...prev,
                                              [bl.c]: vIdx,
                                            }));
                                          }}
                                          className={`px-3 py-1.5 rounded-xl text-xs font-mono border transition-all ${
                                            isSel
                                              ? "bg-blue-600 text-white border-blue-400 font-bold"
                                              : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700"
                                          }`}
                                        >
                                          {fmtDate(hFv.s)} → {fmtDate(hFv.e)} [{hFv.st}]
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const html = `
                                      <h2>Ficha Oficial Visa Fee Schedule Brasil — ${bl.c} (${bl.inv || bl.n})</h2>
                                      <p><strong>Produto:</strong> ${bl.p} · <strong>Tarifa:</strong> ${bl.n} · <strong>Status:</strong> ${activeHistFv.st} (${fmtDate(activeHistFv.s)} → ${fmtDate(activeHistFv.e)})</p>
                                      <p>${bl.ld || ""}</p>
                                      <div style="border: 1px solid #cbd5e1; border-radius: 8px; padding: 14px; background: #f8fafc;">
                                        ${activeHistFv.h}
                                      </div>
                                    `;
                                    sendToDocStudio({
                                      mode: "append_html",
                                      title: `Visa Fee Schedule — ${bl.c} (${bl.inv || bl.p})`,
                                      sourceModule: "Visa Fee Schedule Brasil (/compliance/arquivos)",
                                      html,
                                    });
                                  }}
                                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                  Inserir Esta Versão no Doc Studio (/editor)
                                </button>
                              </div>

                              <div
                                className="bg-[#030711] border border-slate-800 rounded-xl p-4 text-xs text-slate-200 overflow-x-auto prose prose-invert max-w-none [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-slate-700 [&_td]:p-2 [&_th]:border [&_th]:border-slate-700 [&_th]:p-2 [&_th]:bg-slate-900"
                                dangerouslySetInnerHTML={{ __html: activeHistFv?.h || "" }}
                              />
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          SUB-TAB 2: 148 FEE VERSIONS
         =================================================================== */}
      {subTab === "versoes" && (
        <div className="space-y-4">
          <div className="bg-[#080f1e] border border-slate-800/80 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-3">
            <input
              type="text"
              value={verQ}
              onChange={(e) => setVerQ(e.target.value)}
              placeholder="Buscar tarifa, produto, regra ou Billing Line nas 148 versões..."
              className="flex-1 min-w-[260px] bg-[#030711] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
            />
            <div className="flex items-center gap-2">
              {["ALL", "Vigente", "Futura", "Encerrada"].map((st) => (
                <button
                  key={st}
                  onClick={() => setVerStatus(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                    verStatus === st
                      ? "bg-blue-600 text-white border-blue-500"
                      : "bg-slate-900 text-slate-300 border-slate-800"
                  }`}
                >
                  {st === "ALL" ? "Todas (148)" : st}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#080f1e] border border-slate-800/80 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto max-h-[680px]">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="sticky top-0 bg-slate-900 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Categoria / Produto</th>
                    <th className="py-3 px-4">Tarifa (Fee Schedule)</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Vigência</th>
                    <th className="py-3 px-3">BLs Vinculadas</th>
                    <th className="py-3 px-3">Resumo de Preços</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredVersions.map((fv) => {
                    const isExp = expandedVerIdx === fv.i;
                    return (
                      <React.Fragment key={fv.i}>
                        <tr
                          onClick={() => setExpandedVerIdx(isExp ? null : fv.i)}
                          className="cursor-pointer hover:bg-slate-900/60"
                        >
                          <td className="py-3 px-4">
                            <div className="font-bold text-white">{fv.p}</div>
                            <div className="text-[10px] text-slate-400">{fv.cat}</div>
                          </td>
                          <td className="py-3 px-4 font-semibold text-blue-300">{fv.n}</td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                fv.st === "Vigente"
                                  ? "bg-emerald-500/15 text-emerald-300"
                                  : fv.st === "Futura"
                                  ? "bg-amber-500/20 text-amber-300"
                                  : "bg-slate-800 text-slate-400"
                              }`}
                            >
                              {fv.st}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono text-[11px] text-slate-300 whitespace-nowrap">
                            {fmtDate(fv.s)} → {fmtDate(fv.e)}
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-300">
                            {(fv.b || []).length} BLs
                          </td>
                          <td className="py-3 px-3 max-w-sm">
                            {fv.rateBullets && fv.rateBullets.length > 0 ? (
                              <div className="font-mono text-[10px] text-emerald-300 truncate">
                                {fv.rateBullets[0]}
                              </div>
                            ) : (
                              <span className="text-slate-500">Clique para expandir tabela ↓</span>
                            )}
                          </td>
                        </tr>
                        {isExp && (
                          <tr className="bg-[#050b16] border-b border-blue-500/30">
                            <td colSpan={6} className="p-5 space-y-3">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="text-xs text-slate-300">
                                  <strong>Billing Lines ({fv.b?.length || 0}):</strong>{" "}
                                  <span className="font-mono text-blue-300">{(fv.b || []).join(", ") || "Geral"}</span>
                                </div>
                                <button
                                  onClick={() =>
                                    sendToDocStudio({
                                      mode: "append_html",
                                      title: `Tabela Oficial Visa — ${fv.p}: ${fv.n} (${fv.st})`,
                                      sourceModule: "Visa Fee Schedule Brasil (/compliance/arquivos)",
                                      html: `<h2>${fv.p} — ${fv.n} (${fv.st}: ${fmtDate(fv.s)} → ${fmtDate(fv.e)})</h2>${fv.h}`,
                                    })
                                  }
                                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                  Enviar para Doc Studio (/editor)
                                </button>
                              </div>
                              <div
                                className="bg-[#030711] border border-slate-800 rounded-xl p-4 text-xs text-slate-200 overflow-x-auto [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-slate-700 [&_td]:p-2 [&_th]:border [&_th]:border-slate-700 [&_th]:p-2"
                                dangerouslySetInnerHTML={{ __html: fv.h }}
                              />
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          SUB-TAB 3: 60 VERSION DIFFS (ALTERAÇÕES VIGENTE VS ANTERIOR)
         =================================================================== */}
      {subTab === "diff" && (
        <div className="bg-[#080f1e] border border-slate-800/80 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="text-xs font-bold text-white">
              Auditor de Alterações: Versão Vigente vs. Versão Anterior (Conversão USD → BRL, Reajustes e Novas BLs)
            </div>
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyChangedDiff}
                onChange={(e) => setOnlyChangedDiff(e.target.checked)}
              />
              <span>Exibir apenas tarifas com alteração ({filteredDiffs.length})</span>
            </label>
          </div>
          <div className="overflow-x-auto max-h-[680px]">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 bg-slate-900 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Produto / Tarifa</th>
                  <th className="py-3 px-3">Vigência Atual vs Anterior</th>
                  <th className="py-3 px-3">BLs Incluídas / Removidas</th>
                  <th className="py-3 px-3">Preço Anterior → Preço Atual</th>
                  <th className="py-3 px-3">Versão Futura</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredDiffs.map((c, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/50">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{c.prod}</div>
                      <div className="text-[11px] text-blue-300">{c.fee}</div>
                      <div className="text-[10px] text-slate-500">{c.cat}</div>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px]">
                      <div className="text-emerald-300 font-bold">
                        Atual: {fmtDate(c.curStart)} → {fmtDate(c.curEnd)}
                      </div>
                      <div className="text-slate-400">
                        Ant.: {c.prevStart ? `${fmtDate(c.prevStart)} → ${fmtDate(c.prevEnd)}` : "Sem versão anterior"}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px]">
                      {c.added && c.added.length > 0 ? (
                        <div className="text-emerald-400">+ {c.added.join(", ")}</div>
                      ) : null}
                      {c.removed && c.removed.length > 0 ? (
                        <div className="text-rose-400">- {c.removed.join(", ")}</div>
                      ) : null}
                      {(!c.added || c.added.length === 0) && (!c.removed || c.removed.length === 0) && (
                        <span className="text-slate-500">Mesmas BLs</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-[11px] max-w-md">
                      {c.priceChanged ? (
                        <div className="space-y-1 font-mono">
                          {c.prevPrice && (
                            <div className="text-rose-300/90 line-clamp-2">
                              <strong>Antes ({c.prevCur}):</strong> {c.prevPrice}
                            </div>
                          )}
                          {c.curPrice && (
                            <div className="text-emerald-300 font-bold line-clamp-2">
                              <strong>Agora ({c.curCur}):</strong> {c.curPrice}
                            </div>
                          )}
                        </div>
                      ) : c.textChanged ? (
                        <span className="px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 text-[10px] font-bold">
                          Texto / Tabela convertida para BRL no Portal
                        </span>
                      ) : (
                        <span className="text-slate-500">Sem mudança</span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px]">
                      {c.future ? (
                        <span className="px-2 py-1 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold">
                          Futura: {fmtDate(c.future)}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================================================================
          SUB-TAB 4: 44 VISA PRODUCTS
         =================================================================== */}
      {subTab === "produtos" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.pd.map((prod, idx) => (
            <div
              key={idx}
              className="bg-[#080f1e] border border-slate-800/80 hover:border-blue-500/40 rounded-2xl p-5 flex flex-col justify-between space-y-3 transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                    {prod.cat}
                  </span>
                  <div className="flex items-center gap-1.5 font-mono text-[10px]">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-bold">
                      {prod.nb} BLs vigentes
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300">
                      {prod.nf} versões
                    </span>
                  </div>
                </div>
                <h3 className="text-sm font-bold text-white">{prod.p}</h3>
                <div
                  className="text-xs text-slate-300 leading-relaxed space-y-1"
                  dangerouslySetInnerHTML={{
                    __html: prod.d || "<p>Produto integrante do Visa Fee Schedule Brasil.</p>",
                  }}
                />
              </div>
              <div className="pt-2 border-t border-slate-800/80 flex justify-end">
                <button
                  onClick={() => {
                    setQ(prod.p);
                    setSubTab("bl");
                  }}
                  className="text-[11px] font-bold text-blue-400 hover:text-blue-300"
                >
                  Ver as {prod.nb} Billing Lines deste produto →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
