"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  ShieldCheck,
  FileText,
  Database,
  AlertTriangle,
  Search,
  Layers,
  CheckCircle2,
  XCircle,
  BookOpen,
  Globe,
  Terminal,
} from "lucide-react";

export default function SubcredenciadoresPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"matriz" | "dossie" | "mcbs_reports" | "catalogo">("matriz");

  // Interactive PayFac validator state
  const [pfId, setPfId] = useState("98765432101");
  const [subMerchantId, setSubMerchantId] = useState("SUBM00012345");
  const [softDescriptor, setSoftDescriptor] = useState("PAYFAC*LOJAEXEMPLO");
  const [annualVolUsd, setAnnualVolUsd] = useState(450000);
  const [cipHomologado, setCipHomologado] = useState(true);
  const [ammfSubmitted, setAmmfSubmitted] = useState(true);

  // Catalog search
  const [catQuery, setCatQuery] = useState("");
  const [catTypeFilter, setCatTypeFilter] = useState<"all" | "manual" | "boletim">("all");
  const [dossieSchemeFilter, setDossieSchemeFilter] = useState<string>("ALL");

  useEffect(() => {
    fetch("/api/admin/subcredenciadores?action=overview")
      .then((r) => r.json())
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const catalogItems = useMemo(() => {
    if (!data?.catalogo_master) return [];
    const manuals = data.catalogo_master.manuals || [];
    const bulletins = data.catalogo_master.bulletins || [];
    let merged =
      catTypeFilter === "manual"
        ? manuals
        : catTypeFilter === "boletim"
        ? bulletins
        : [...manuals, ...bulletins];
    const q = catQuery.trim().toLowerCase();
    if (!q) return merged;
    return merged.filter(
      (it: any) =>
        String(it.titulo || "").toLowerCase().includes(q) ||
        String(it.arquivo || "").toLowerCase().includes(q) ||
        String(it.bandeira || "").toLowerCase().includes(q)
    );
  }, [data, catQuery, catTypeFilter]);

  const filteredPdfPages = useMemo(() => {
    if (!data?.pdf_pages) return [];
    if (dossieSchemeFilter === "ALL") return data.pdf_pages;
    return data.pdf_pages.filter((p: any) => p.scheme === dossieSchemeFilter);
  }, [data, dossieSchemeFilter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b14] text-slate-100 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-400 font-mono">
            Carregando Playbook de Subcredenciadores, Relatórios MCBS e Catálogo Master...
          </p>
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const hasAsterisk = softDescriptor.includes("*");
  const pfIdValid = pfId.trim().length >= 6 && pfId.trim().length <= 15;
  const subIdValid = subMerchantId.trim().length >= 3 && subMerchantId.trim().length <= 15;
  const exceedsMcThreshold = annualVolUsd > 1000000;

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 text-xs text-emerald-400 hover:text-emerald-300 mb-2 font-mono"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao Cockpit do Proprietário
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                  Arquitetura de Subcredenciadores (PayFac), Relatórios MCBS & Catálogo Master
                </h1>
                <p className="text-sm text-slate-400 mt-0.5">
                  Regras de patrocínio (Sponsor/Acquirer), campos obrigatórios (`DE 48 SE 37`, `Dataset ID 56`, `Bit 43/58`), backlog `BACKLOG_MCBS_REPORTS.md` e `catalogo.xlsx` (35.336 SHA256).
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/compliance/governanca-acervo"
              className="px-3.5 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-medium hover:bg-cyan-500/20 transition"
            >
              Grafo FX & Governança →
            </Link>
            <Link
              href="/compliance/conciliacao"
              className="px-3.5 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium hover:bg-amber-500/20 transition"
            >
              Batimento CIP / SLC →
            </Link>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
            <div className="text-xs text-slate-400">Artefatos no `catalogo.xlsx`</div>
            <div className="text-xl font-bold text-emerald-400 font-mono mt-1">
              {Number(stats.total_catalogo_sha256 || 35336).toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Indexados por SHA256</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
            <div className="text-xs text-slate-400">Manuais Catalogados</div>
            <div className="text-xl font-bold text-blue-400 font-mono mt-1">
              {stats.total_manuals_cataloged || 831}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Visa, MC, Elo, Amex</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
            <div className="text-xs text-slate-400">Boletins no Catálogo</div>
            <div className="text-xl font-bold text-amber-400 font-mono mt-1">
              {Number(stats.total_bulletins_cataloged || 6787).toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Releases & Announcements</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
            <div className="text-xs text-slate-400">Páginas Spec PayFac</div>
            <div className="text-xl font-bold text-purple-400 font-mono mt-1">
              {stats.payfac_pdf_pages || 17} págs
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">+ {stats.payfac_pptx_slides || 15} slides arquitetura</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
            <div className="text-xs text-slate-400">Entradas MCBS Reports</div>
            <div className="text-xl font-bold text-cyan-400 font-mono mt-1">
              {stats.mcbs_backlog_entries || 15}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">TN3A, T0CH, AB111010-AA</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
            <div className="text-xs text-slate-400">Travas Normativas</div>
            <div className="text-xl font-bold text-rose-400 font-mono mt-1">
              {stats.mcbs_backlog_dependencies || 5}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Conflitos literais mapeados</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
          {[
            { id: "matriz", label: "1. Matriz Técnica PayFac (Mastercard, Visa, Elo) & Validador", icon: ShieldCheck },
            { id: "dossie", label: "2. Especificação de Integração (17 Págs + 15 Slides)", icon: FileText },
            { id: "mcbs_reports", label: "3. Backlog Auditado MCBS Reports (`TN3A` / `AB111010`)", icon: Layers },
            { id: "catalogo", label: "4. Inventário Mestre `catalogo.xlsx` (35.336 SHA256)", icon: Database },
          ].map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition ${
                  active
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                    : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: PAYFAC MATRIX & VALIDATOR */}
        {activeTab === "matriz" && (
          <div className="space-y-6">
            {/* Interactive PayFac Compliance Simulator */}
            <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" /> Simulador de Conformidade de Subcredenciador (PayFac / Sub-Merchant Validator)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Teste os parâmetros de um Sub-merchant patrocinado contra as travas de mensageria e volume da Mastercard, Visa e Elo.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">PF ID / ID-Subcredenciador</label>
                  <input
                    type="text"
                    value={pfId}
                    onChange={(e) => setPfId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Sub-Merchant ID (até 15 AN)</label>
                  <input
                    type="text"
                    value={subMerchantId}
                    onChange={(e) => setSubMerchantId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-slate-400 block mb-1">DE 43 / Bit 43 SoftDescriptor (`PF*LOJA`)</label>
                  <input
                    type="text"
                    value={softDescriptor}
                    onChange={(e) => setSoftDescriptor(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-amber-300 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">TPV Anual Sub-merchant (USD)</label>
                  <input
                    type="number"
                    step={50000}
                    value={annualVolUsd}
                    onChange={(e) => setAnnualVolUsd(Number(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
                <div className="flex flex-col justify-center gap-1.5 pt-2">
                  <label className="inline-flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={cipHomologado}
                      onChange={(e) => setCipHomologado(e.target.checked)}
                    />
                    Liquidação CIP / SLC Ativa
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={ammfSubmitted}
                      onChange={(e) => setAmmfSubmitted(e.target.checked)}
                    />
                    Reporte Visa AMMF Enviado
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                <div
                  className={`p-3.5 rounded-lg border text-xs ${
                    pfIdValid && subIdValid && !exceedsMcThreshold
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                      : "bg-amber-500/10 border-amber-500/30 text-amber-300"
                  }`}
                >
                  <div className="font-bold flex items-center justify-between mb-1">
                    <span>Mastercard (`DE 48 SE 37`)</span>
                    <span>{pfIdValid && subIdValid && !exceedsMcThreshold ? "✓ CONFORME" : "⚠️ ALERTA"}</span>
                  </div>
                  <p className="text-[11px] opacity-90">
                    {exceedsMcThreshold
                      ? `TPV USD ${annualVolUsd.toLocaleString()} excede USD 1.000.000/ano: Obrigatório contrato direto (Merchant Agreement) com o Adquirente Sponsor.`
                      : `DE 48 SE 37 SF 1 (${pfId}) e SF 3 (${subMerchantId}) válidos dentro do limite de sub-merchant.`}
                  </p>
                </div>

                <div
                  className={`p-3.5 rounded-lg border text-xs ${
                    pfIdValid && subIdValid && ammfSubmitted
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                      : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                  }`}
                >
                  <div className="font-bold flex items-center justify-between mb-1">
                    <span>Visa (`Dataset ID 56` + `AMMF`)</span>
                    <span>{pfIdValid && subIdValid && ammfSubmitted ? "✓ CONFORME" : "✗ PENDÊNCIA"}</span>
                  </div>
                  <p className="text-[11px] opacity-90">
                    {ammfSubmitted
                      ? `Dataset ID 56 Tag 01 (${pfId}) e Tag 02 (${subMerchantId}, ≤15B) + AMMF regular (Regras Visa 0007630 / 0006574).`
                      : "Obrigatório envio periódico do Acquirer Merchant Master File (AMMF) pelo Adquirente para a Visa."}
                  </p>
                </div>

                <div
                  className={`p-3.5 rounded-lg border text-xs ${
                    hasAsterisk && cipHomologado
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                      : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                  }`}
                >
                  <div className="font-bold flex items-center justify-between mb-1">
                    <span>Elo (`Bit 43/58` + Trilha `CIP`)</span>
                    <span>{hasAsterisk && cipHomologado ? "✓ CONFORME" : "✗ PENDÊNCIA"}</span>
                  </div>
                  <p className="text-[11px] opacity-90">
                    {!hasAsterisk
                      ? "Bit 43 (Pos 1-22) exige separador '*' no SoftDescriptor entre Subcredenciador e EC."
                      : !cipHomologado
                      ? "Liquidação centralizada via CIP obrigatória no prazo regulatório vigente."
                      : `SoftDescriptor '${softDescriptor}' e liquidação CIP homologados conforme Trilha Elo.`}
                  </p>
                </div>
              </div>
            </div>

            {/* 3 Schemes Technical Cards */}
            <div className="space-y-5">
              {(data?.payfac_matrix || []).map((scheme: any) => (
                <div
                  key={scheme.bandeira}
                  className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-xs font-mono uppercase px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {scheme.bandeira}
                      </span>
                      <h3 className="text-lg font-bold text-white mt-1">{scheme.papel_registro}</h3>
                    </div>
                    <div className="text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1.5 rounded border border-slate-800">
                      Portal: {scheme.portal_registro}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-slate-400 font-semibold block mb-1">
                        Regra de Patrocínio (Sponsorship & Responsabilidade Objetiva):
                      </span>
                      <span className="text-slate-200">{scheme.regra_patrocinio}</span>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-slate-400 font-semibold block mb-1">
                        Governança de Volume, KYC & Reporte Cadastral:
                      </span>
                      <span className="text-slate-200">{scheme.limite_volume_submerchant}</span>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60">
                          <th className="p-2.5 font-mono">Campo / Tag / Bit</th>
                          <th className="p-2.5">Nome Técnico</th>
                          <th className="p-2.5">Mensageria</th>
                          <th className="p-2.5">Status</th>
                          <th className="p-2.5">Regra de Preenchimento</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/70">
                        {(scheme.campos_iso_clearing || []).map((c: any, idx: number) => (
                          <tr key={idx} className="hover:bg-slate-800/30">
                            <td className="p-2.5 font-mono font-bold text-amber-400">{c.campo}</td>
                            <td className="p-2.5 font-semibold text-white">{c.nome}</td>
                            <td className="p-2.5 font-mono text-blue-300">{c.msg}</td>
                            <td className="p-2.5">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                  c.obrigatoriedade === "Obrigatório"
                                    ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                                    : "bg-amber-500/10 text-amber-300 border border-amber-500/30"
                                }`}
                              >
                                {c.obrigatoriedade}
                              </span>
                            </td>
                            <td className="p-2.5 text-slate-300">{c.detalhe}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: TECHNICAL SPEC PAGES & SLIDES */}
        {activeTab === "dossie" && (
          <div className="space-y-6">
            <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <h2 className="text-base font-bold text-white">
                    Especificação Técnica de Integração de Facilitadores de Pagamento (17 Páginas)
                  </h2>
                  <p className="text-xs text-slate-400">
                    Extraído integralmente do documento técnico de especificação Dual Message, Single Message, AMMF, Dataset ID 56 e Certificação Elo.
                  </p>
                </div>
                <div className="flex gap-1.5">
                  {["ALL", "Mastercard", "Visa", "Elo"].map((sc) => (
                    <button
                      key={sc}
                      onClick={() => setDossieSchemeFilter(sc)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                        dossieSchemeFilter === sc
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-950 text-slate-400 border border-slate-800"
                      }`}
                    >
                      {sc === "ALL" ? "Todas (17)" : sc}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[540px] overflow-y-auto pr-1">
                {filteredPdfPages.map((p: any) => (
                  <div
                    key={p.page}
                    className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-emerald-400">
                        Página #{p.page}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 font-mono text-[11px]">
                        {p.scheme}
                      </span>
                    </div>
                    <pre className="text-xs text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
                      {p.content}
                    </pre>
                  </div>
                ))}
              </div>
            </div>

            {/* PPTX Architecture Slides */}
            <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white">
                Arquitetura Executiva & Roadmap de Subcredenciamento (15 Slides)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {(data?.pptx_slides || []).map((sl: any) => (
                  <div
                    key={sl.slide}
                    className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-amber-400 font-bold">Slide #{sl.slide}</span>
                    </div>
                    <div className="text-xs font-bold text-white">{sl.title}</div>
                    <div className="space-y-1 text-[11px] text-slate-400">
                      {(sl.blocks || []).slice(1, 6).map((b: string, i: number) => (
                        <p key={i} className="line-clamp-3">
                          • {b}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MCBS REPORTS BACKLOG */}
        {activeTab === "mcbs_reports" && (
          <div className="space-y-6">
            <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <h2 className="text-base font-bold text-white">
                    Backlog Auditado de Relatórios MCBS (`BACKLOG_MCBS_REPORTS.md`)
                  </h2>
                  <p className="text-xs text-slate-400">
                    Matriz das 15 entradas mapeadas com evidência SHA256 (`{data?.mcbs_reports_backlog?.source_sha256?.slice(0, 24)}...`), separando obrigação comprovada de escopo condicional.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60">
                      <th className="p-3 font-mono">Relatório / Entrada</th>
                      <th className="p-3">Obrigação / Condição Registrada nas Evidências</th>
                      <th className="p-3">Verificação Necessária antes de Parser</th>
                      <th className="p-3 font-mono">Chaves de Evidência</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70">
                    {(data?.mcbs_reports_backlog?.entries || []).map((e: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-800/30">
                        <td className="p-3 font-mono font-bold text-cyan-400">{e.entrada}</td>
                        <td className="p-3 text-slate-200">{e.obrigacao_condicao}</td>
                        <td className="p-3 text-slate-400">{e.trabalho_necessario}</td>
                        <td className="p-3 font-mono text-amber-300">{e.evidencias}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 5 Normative Dependencies */}
              <div className="pt-4 space-y-2.5">
                <h3 className="text-sm font-bold text-rose-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> 5 Dependências Normativas que NÃO Podem Virar Certeza Silenciosa
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(data?.mcbs_reports_backlog?.dependencies || []).map((d: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-lg bg-rose-500/5 border border-rose-500/20 text-xs space-y-1"
                    >
                      <div className="font-mono font-bold text-rose-300">{d.code}</div>
                      <p className="text-slate-300 leading-relaxed">{d.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CATALOGO.XLSX MASTER */}
        {activeTab === "catalogo" && (
          <div className="space-y-6">
            {/* Breakdown Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-slate-300 uppercase">Por Tipo Documental</div>
                {Object.entries(data?.catalogo_master?.by_tipo || {}).map(([k, v]: any) => (
                  <div key={k} className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">{k}</span>
                    <span className="text-emerald-400 font-bold">{Number(v).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-slate-300 uppercase">Por Natureza de Arquivo</div>
                {Object.entries(data?.catalogo_master?.by_natureza || {}).map(([k, v]: any) => (
                  <div key={k} className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400 truncate max-w-[200px]">{k}</span>
                    <span className="text-blue-400 font-bold">{Number(v).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-slate-300 uppercase">Por Bandeira Candidata</div>
                {Object.entries(data?.catalogo_master?.by_bandeira || {})
                  .slice(0, 7)
                  .map(([k, v]: any) => (
                    <div key={k} className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400 truncate max-w-[200px]">{k}</span>
                      <span className="text-amber-400 font-bold">{Number(v).toLocaleString()}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Explorer of Manuals & Bulletins */}
            <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex gap-2">
                  {[
                    { id: "all", label: "Manuais + Boletins Curados" },
                    { id: "manual", label: "Apenas Manuais (831)" },
                    { id: "boletim", label: "Apenas Boletins (6.787)" },
                  ].map((b) => (
                    <button
                      key={b.id}
                      onClick={() => setCatTypeFilter(b.id as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                        catTypeFilter === b.id
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-950 text-slate-400 border border-slate-800"
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Buscar manual/boletim por título, bandeira, arquivo..."
                    value={catQuery}
                    onChange={(e) => setCatQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="overflow-x-auto max-h-[520px] overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="sticky top-0 bg-slate-950 z-10">
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="p-3">Tipo</th>
                      <th className="p-3">Bandeira</th>
                      <th className="p-3">Título Catalogado</th>
                      <th className="p-3 font-mono">Arquivo</th>
                      <th className="p-3 font-mono">Edição / Pub</th>
                      <th className="p-3 font-mono">SHA256</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70">
                    {catalogItems.slice(0, 150).map((it: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-800/30">
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                              it.tipo === "manual"
                                ? "bg-blue-500/10 text-blue-300 border border-blue-500/20"
                                : "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                            }`}
                          >
                            {it.tipo}
                          </span>
                        </td>
                        <td className="p-3 font-semibold text-slate-200">{it.bandeira}</td>
                        <td className="p-3 text-slate-300 max-w-md">{it.titulo}</td>
                        <td className="p-3 font-mono text-slate-400 max-w-xs truncate">{it.arquivo}</td>
                        <td className="p-3 font-mono text-slate-400">{it.edicao}</td>
                        <td className="p-3 font-mono text-[11px] text-emerald-400">{it.sha256}</td>
                      </tr>
                    ))}
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
