"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft, ShieldCheck, Cpu, FileText, Search, Filter,
  CheckCircle2, AlertTriangle, Layers, Lock, Terminal, Sparkles
} from "lucide-react";
import { sendToDocStudio } from "@/lib/docStudioBridge";

export default function CentralBoletinsComportamentoPage() {
  const [activeTab, setActiveTab] = useState<"comportamento" | "planilha" | "radar" | "aes">("comportamento");
  const [planilhaAba, setPlanilhaAba] = useState<"adquirente" | "emissor" | "comparativo">("comparativo");
  const [drawerBoletim, setDrawerBoletim] = useState<any | null>(null);

  // Overview state
  const [stats, setStats] = useState<any>(null);
  const [boletins3Lentes, setBoletins3Lentes] = useState<any[]>([]);
  const [camposComportamento, setCamposComportamento] = useState<any[]>([]);
  const [glossario, setGlossario] = useState<any>({});
  const [aesMarkdown, setAesMarkdown] = useState("");
  const [releaseCycles, setReleaseCycles] = useState<string[]>([]);

  // Simulador de Perfil state
  const [selPapeis, setSelPapeis] = useState<string[]>(["emissor", "adquirente"]);
  const [selProdutos, setSelProdutos] = useState<string[]>([
    "token",
    "mdes",
    "ecommerce",
    "moneysend",
    "transfer",
    "subcredenciador",
    "cartao_credito",
    "cartao_debito",
    "prepago",
    "refund",
  ]);
  const [selBandeira, setSelBandeira] = useState("ALL");
  const [projecoes, setProjecoes] = useState<any[]>([]);
  const [loadingProj, setLoadingProj] = useState(false);
  const [selectedCampoId, setSelectedCampoId] = useState<string>("MC-DE023");

  // Radar de Releases (381 itens) state
  const [relQuery, setRelQuery] = useState("");
  const [relBandeira, setRelBandeira] = useState("ALL");
  const [relCycle, setRelCycle] = useState("ALL");
  const [relCrit, setRelCrit] = useState("ALL");
  const [apenasBrasil, setApenasBrasil] = useState(false);
  const [relResults, setRelResults] = useState<any[]>([]);
  const [relTotal, setRelTotal] = useState(0);
  const [loadingRel, setLoadingRel] = useState(false);
  const [selectedRelItem, setSelectedRelItem] = useState<any | null>(null);

  useEffect(() => {
    async function loadOverview() {
      try {
        const res = await fetch("/api/admin/boletins?action=overview");
        const data = await res.json();
        if (data.connected) {
          setStats(data.stats);
          setBoletins3Lentes(data.boletins || []);
          setCamposComportamento(data.campos || []);
          setGlossario(data.glossario || {});
          setAesMarkdown(data.aesSpecMarkdown || "");
          setReleaseCycles(data.releaseCycles || []);
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadOverview();
  }, []);

  const runProjetar = useCallback(async (papeisArr?: string[], prodsArr?: string[], band?: string) => {
    setLoadingProj(true);
    try {
      const payload = {
        action: "projetar",
        papeis: papeisArr || selPapeis,
        produtos: prodsArr || selProdutos,
        bandeiras: (band ?? selBandeira) === "ALL" ? [] : [band ?? selBandeira],
        regioes: ["Brasil", "LAC", "Global"]
      };
      const res = await fetch("/api/admin/boletins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.connected) {
        setProjecoes(data.projecoes || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingProj(false);
    }
  }, [selPapeis, selProdutos, selBandeira]);

  useEffect(() => {
    runProjetar();
  }, [runProjetar]);

  const runSearchReleases = useCallback(async (overrides?: any) => {
    setLoadingRel(true);
    try {
      const payload = {
        action: "search_releases",
        q: overrides?.q !== undefined ? overrides.q : relQuery,
        bandeira: overrides?.bandeira !== undefined ? overrides.bandeira : relBandeira,
        release: overrides?.release !== undefined ? overrides.release : relCycle,
        criticidade: overrides?.criticidade !== undefined ? overrides.criticidade : relCrit,
        apenas_impacto_br: overrides?.apenas_impacto_br !== undefined ? overrides.apenas_impacto_br : apenasBrasil,
        limit: 100
      };
      const res = await fetch("/api/admin/boletins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.connected) {
        setRelResults(data.results || []);
        setRelTotal(data.totalMatches || 0);
        if (data.results?.length && !selectedRelItem) {
          setSelectedRelItem(data.results[0]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingRel(false);
    }
  }, [relQuery, relBandeira, relCycle, relCrit, apenasBrasil, selectedRelItem]);

  useEffect(() => {
    if (activeTab === "radar" && relResults.length === 0) {
      runSearchReleases();
    }
  }, [activeTab, relResults.length, runSearchReleases]);

  // Sincronização automática com a Barra de Contexto Global do Workbench 2.0
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mapGlobalBrand = (b?: string | null) => {
      if (!b || b === "ALL") return "ALL";
      if (b === "visa") return "Visa";
      if (b === "mastercard") return "Mastercard";
      if (b === "elo") return "Elo";
      return "ALL";
    };

    const mapGlobalRole = (r?: string | null): string[] => {
      if (r === "adquirente") return ["adquirente"];
      if (r === "emissor") return ["emissor"];
      return ["emissor", "adquirente"];
    };

    const savedBrand = mapGlobalBrand(localStorage.getItem("vs_workbench_brand"));
    const savedRole = localStorage.getItem("vs_workbench_role");
    const initPapeis = mapGlobalRole(savedRole);

    setSelBandeira(savedBrand);
    setRelBandeira(savedBrand);
    setSelPapeis(initPapeis);
    if (savedRole === "adquirente" || savedRole === "emissor") {
      setPlanilhaAba(savedRole);
    }

    const onContextChange = (ev: Event) => {
      const custom = ev as CustomEvent<{ brand?: string; role?: string }>;
      const nextBrand = mapGlobalBrand(custom.detail?.brand);
      const nextPapeis = mapGlobalRole(custom.detail?.role);
      setSelBandeira(nextBrand);
      setRelBandeira(nextBrand);
      setSelPapeis(nextPapeis);
      if (custom.detail?.role === "adquirente" || custom.detail?.role === "emissor") {
        setPlanilhaAba(custom.detail.role);
      } else {
        setPlanilhaAba("comparativo");
      }
      runProjetar(nextPapeis, selProdutos, nextBrand);
      runSearchReleases({ bandeira: nextBrand });
    };

    window.addEventListener("workbench-context-change", onContextChange as EventListener);
    return () => {
      window.removeEventListener("workbench-context-change", onContextChange as EventListener);
    };
  }, [runProjetar, runSearchReleases, selProdutos]);

  const togglePapel = (p: string) => {
    const next = selPapeis.includes(p) ? selPapeis.filter((x) => x !== p) : [...selPapeis, p];
    const finalPapeis = next.length ? next : ["emissor"];
    setSelPapeis(finalPapeis);
    runProjetar(finalPapeis, selProdutos, selBandeira);
  };

  const toggleProduto = (prod: string) => {
    const next = selProdutos.includes(prod) ? selProdutos.filter((x) => x !== prod) : [...selProdutos, prod];
    setSelProdutos(next);
    runProjetar(selPapeis, next, selBandeira);
  };

  const activeCampo = camposComportamento.find((c) => c.id === selectedCampoId) || camposComportamento[0];

  const handleExportPlanilhaRelease = (aba: "adquirente" | "emissor" | "consolidado") => {
    const qCsv = (val: any) => `"${String(val ?? "").replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;
    const rows: string[] = [];

    if (aba === "adquirente" || aba === "emissor") {
      const papelAlvo = aba;
      rows.push(
        [
          "Bandeira",
          "ID / Documento",
          "Título Oficial",
          "Release",
          "Vigência",
          "Classificação",
          "Impacta Brasil?",
          "Criticidade",
          "Regulatório",
          "Papel",
          "Impacta o Papel?",
          "Campos Técnicos (DE / PDS / TCR / Reg)",
          "O que Desenvolver / Ações Técnicas",
          "Exposição Financeira & Negócio",
          "Fonte Normativa",
        ]
          .map(qCsv)
          .join(";")
      );

      for (const b of boletins3Lentes) {
        const acoesPapel: string[] = b.acoes?.[papelAlvo] || [];
        const gatPapeis: string[] = b.gatilhos?.papeis || [];
        const impactaPapel = gatPapeis.includes(papelAlvo) ? "Sim" : "Sem Impacto.";
        const vigStr = (b.vigencia || []).map((v: any) => `${v.data} (${v.detalhe})`).join(" | ");
        const camposStr = (b.lentes?.tecnica?.campos || []).join(", ");
        const acoesStr = acoesPapel.length ? acoesPapel.join(" | ") : "Sem Impacto.";

        rows.push(
          [
            b.bandeira,
            b.id,
            b.titulo,
            b.release,
            vigStr,
            b.classificacao,
            b.impacta_brasil,
            b.criticidade_base,
            b.regulatorio ? "Sim" : "Não",
            papelAlvo === "adquirente" ? "Adquirente" : "Emissor",
            impactaPapel,
            camposStr || "Regra / Compliance",
            acoesStr,
            b.lentes?.negocio?.exposicao_financeira || "",
            b.fonte || "",
          ]
            .map(qCsv)
            .join(";")
        );
      }
    } else {
      rows.push(
        [
          "ID",
          "Bandeira",
          "Identificação",
          "Título",
          "Release",
          "Publicação",
          "Vigência",
          "Classificação",
          "Impacta Brasil",
          "Criticidade",
          "Impacto Financeiro",
          "Regulatório",
          "Área Impactada",
          "Resumo Executivo",
          "Parecer Técnico",
        ]
          .map(qCsv)
          .join(";")
      );

      const sourceList = relResults.length > 0 ? relResults : boletins3Lentes;
      for (const r of sourceList) {
        rows.push(
          [
            r.id,
            r.bandeira,
            r.identificacao || r.id,
            r.titulo,
            r.release,
            r.data_publicacao || r.publicado || "",
            Array.isArray(r.vigencia) ? r.vigencia.map((v: any) => v.data).join(", ") : r.vigencia || "",
            r.classificacao,
            r.impacta_brasil,
            r.criticidade || r.criticidade_base || "",
            r.impacto_financeiro || "",
            r.regulatorio,
            r.area_impactada || (r.subdominios || []).join(", "),
            r.resumo || r.o_que_a_bandeira_esta_fazendo || "",
            r.parecer_tecnico || "",
          ]
            .map(qCsv)
            .join(";")
        );
      }
    }

    const csvContent = "\uFEFF" + rows.join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Planilha_Controle_Release_${aba.toUpperCase()}_2026_2027.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  Motor de Comportamento & Triagem de Releases
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Análise Genérica por Perfil (3 Lentes)
                </span>
              </div>
              <h1 className="text-lg md:text-xl font-bold text-white mt-0.5">
                Central de Boletins, EFs, Mandates & Impacto por Papel (381 Itens + Motor ISO)
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400">Releases Mapeados: </span>
              <strong className="font-mono text-white">{stats?.totalReleasesTracker || 385}</strong>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400">Fichas 3 Lentes: </span>
              <strong className="font-mono text-amber-300">{stats?.totalBoletins3Lentes || 8}</strong>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400">Campos Catalogados: </span>
              <strong className="font-mono text-blue-300">{stats?.totalCamposComportamento || 7}</strong>
            </div>
            <button
              onClick={() => handleExportPlanilhaRelease("adquirente")}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-sm"
            >
              📥 Planilha Aba Adquirente (.csv)
            </button>
            <button
              onClick={() => handleExportPlanilhaRelease("emissor")}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-sm"
            >
              📥 Planilha Aba Emissor (.csv)
            </button>
            <button
              onClick={() => handleExportPlanilhaRelease("consolidado")}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black transition-all shadow-sm"
            >
              📥 Consolidado MÃE (.csv)
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-2 overflow-x-auto border-t border-slate-800/50 pt-2 pb-2">
          <button
            onClick={() => setActiveTab("comportamento")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === "comportamento"
                ? "bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            1. Motor de Comportamento (3 Lentes + ▶Envia / ◀Recebe)
          </button>
          <button
            onClick={() => setActiveTab("planilha")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === "planilha"
                ? "bg-purple-600 text-white font-bold shadow-lg shadow-purple-600/25"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            2. Planilha Ao Vivo de Controle de Release (Aba Adquirente × Aba Emissor)
          </button>
          <button
            onClick={() => setActiveTab("radar")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === "radar"
                ? "bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/25"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            3. Radar de Releases & Mandates (385 Itens Visa / MC / Elo)
          </button>
          <button
            onClick={() => setActiveTab("aes")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === "aes"
                ? "bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-600/25"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            4. Dossiê Criptográfico Visa (TDES → AES 2026–2031) & Glossário ISO
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-8">
        {/* =================================================================
            TAB 1: MOTOR DE COMPORTAMENTO (3 LENTES + PROJEÇÃO POR PERFIL)
           ================================================================= */}
        {activeTab === "comportamento" && (
          <div className="space-y-8">
            {/* Simulador de Perfil Ad-Hoc */}
            <div className="bg-[#080f1e] border border-slate-800/80 rounded-2xl p-6 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                    Motor `engine/comportamento.py` · Projeção Genérica por Perfil
                  </span>
                  <h2 className="text-base font-bold text-white mt-0.5">
                    Configure o Perfil do Participante (Papel & Produtos) para Simular Impacto e Criticidade Ajustada
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-[#030711] border border-slate-800">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-2 font-bold">
                    1. Papel no Arranjo
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["emissor", "adquirente"].map((p) => (
                      <button
                        key={p}
                        onClick={() => togglePapel(p)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize border transition-all ${
                          selPapeis.includes(p)
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                            : "bg-slate-900 text-slate-400 border-slate-800"
                        }`}
                      >
                        {p === "emissor" ? "Emissor (Issuer)" : "Adquirente (Acquirer)"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#030711] border border-slate-800 md:col-span-2">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-2 font-bold">
                    2. Produtos / Fluxos Operados pelo Participante (Gatilhos)
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: "token", label: "Tokenização / VTS / MDES" },
                      { id: "ecommerce", label: "E-Commerce / CNP / 3DS" },
                      { id: "subcredenciador", label: "Subcredenciador / PayFac" },
                      { id: "cartao_credito", label: "Crédito Vista & Parcelado" },
                      { id: "cartao_debito", label: "Débito & Pré-Pago" },
                      { id: "moneysend", label: "MoneySend / Visa Direct OCT" },
                      { id: "transfer", label: "Funding AFT / P2P" },
                      { id: "refund", label: "Refund / Estorno (Edit 30)" },
                      { id: "contactless", label: "Contactless / NFC" },
                    ].map((prod) => (
                      <button
                        key={prod.id}
                        onClick={() => toggleProduto(prod.id)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          selProdutos.includes(prod.id)
                            ? "bg-blue-500/20 text-blue-300 border-blue-500/50"
                            : "bg-slate-900 text-slate-400 border-slate-800"
                        }`}
                      >
                        {prod.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Resultado das Projeções */}
              <div className="space-y-4 pt-3">
                {projecoes.map((proj, idx) => {
                  const b = proj.boletim_dados || {};
                  const impactaColor =
                    proj.impacta === "Sim"
                      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                      : proj.impacta === "Avaliar"
                      ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                      : "bg-slate-800 text-slate-400 border-slate-700";

                  return (
                    <div
                      key={b.id || idx}
                      className="rounded-2xl border border-slate-800 bg-[#040914] p-5 space-y-4"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              {b.id}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-300">
                              {b.bandeira} · Release {b.release}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-blue-500/10 text-blue-300">
                              Classificação: {b.classificacao} ({b.action_indicator})
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-white">{b.titulo}</h3>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${impactaColor}`}>
                            Impacta Perfil? {proj.impacta.toUpperCase()}
                          </span>
                          <span className="px-3 py-1 rounded-xl text-xs font-mono bg-slate-900 border border-slate-700 text-white">
                            Criticidade Ajustada: <strong>{proj.criticidade}</strong>
                          </span>
                          <button
                            onClick={() => setDrawerBoletim({ boletim: b, proj })}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition-all"
                          >
                            🔍 Inspecionar no Drawer Lateral
                          </button>
                          <button
                            onClick={() => {
                              const antesDepoisHtml = (b.antes_depois || [])
                                .map(
                                  (ad: any) => `
                                  <tr>
                                    <td style="padding: 8px 10px; border: 1px solid #cbd5e1; font-weight: 700;">${ad.o_que}</td>
                                    <td style="padding: 8px 10px; border: 1px solid #cbd5e1; color: #991b1b;">${ad.antes}</td>
                                    <td style="padding: 8px 10px; border: 1px solid #cbd5e1; color: #065f46; font-weight: 600;">${ad.depois}</td>
                                  </tr>`
                                )
                                .join("");

                              const acoesHtml = Object.entries(proj.acoes || {})
                                .map(
                                  ([papel, lista]: [string, any]) => `
                                  <h3>Ações Requeridas — Papel: ${papel.toUpperCase()}</h3>
                                  <ul>${(lista || []).map((ac: string) => `<li>${ac}</li>`).join("")}</ul>`
                                )
                                .join("");

                              const dossierHtml = `
                                <h1>Parecer Técnico & Regulatório: ${b.id} — ${b.titulo}</h1>
                                <p><strong>Bandeira:</strong> ${b.bandeira} · <strong>Release:</strong> ${b.release} · <strong>Classificação:</strong> ${b.classificacao} (${b.action_indicator}) · <strong>Criticidade Ajustada:</strong> ${proj.criticidade}</p>
                                <h2>1. O que a Bandeira está alterando</h2>
                                <p>${b.o_que_a_bandeira_esta_fazendo}</p>
                                ${
                                  antesDepoisHtml
                                    ? `<h3>Comparativo Antes vs. Depois</h3>
                                  <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin: 14px 0;">
                                    <thead>
                                      <tr style="background: #0f172a; color: #ffffff;">
                                        <th style="padding: 8px 10px; border: 1px solid #334155; text-align: left;">Escopo / Regra</th>
                                        <th style="padding: 8px 10px; border: 1px solid #334155; text-align: left;">Comportamento Anterior</th>
                                        <th style="padding: 8px 10px; border: 1px solid #334155; text-align: left;">Novo Comportamento Mandatório</th>
                                      </tr>
                                    </thead>
                                    <tbody>${antesDepoisHtml}</tbody>
                                  </table>`
                                    : ""
                                }
                                <h2>2. Análise nas 3 Lentes (Técnica, Normativa e Negócio)</h2>
                                <ul>
                                  <li><strong>Lente Técnica (Mensageria ISO/IPM):</strong> Campos afetados: <code>${(b.lentes?.tecnica?.campos || []).join(", ")}</code> — ${b.lentes?.tecnica?.nota || ""}</li>
                                  <li><strong>Lente Normativa (Compliance):</strong> ${b.lentes?.normativa?.resumo || ""} (Fonte: ${b.lentes?.normativa?.fonte_regra || ""})</li>
                                  <li><strong>Lente de Negócio & Prazo:</strong> ${b.lentes?.negocio?.exposicao_financeira || ""} — ${b.lentes?.negocio?.esforco_prazo || ""}</li>
                                </ul>
                                <h2>3. Plano de Desenvolvimento por Papel</h2>
                                ${acoesHtml}
                              `;

                              sendToDocStudio({
                                mode: "full_dossier",
                                title: `Parecer Executivo — ${b.id}: ${b.titulo}`,
                                sourceModule: "Motor de Comportamento & 3 Lentes (/compliance/boletins)",
                                html: dossierHtml,
                                metadata: {
                                  brand: b.bandeira?.toLowerCase().includes("visa")
                                    ? "visa"
                                    : b.bandeira?.toLowerCase().includes("master")
                                    ? "mastercard"
                                    : "elo",
                                  brandName: b.bandeira,
                                  referenceId: b.id,
                                  category: `${b.bandeira} Release ${b.release} • ${b.classificacao}`,
                                  effectiveDate: b.lentes?.negocio?.esforco_prazo || `Release ${b.release}`,
                                  riskLevel: proj.criticidade === "ALTA" ? "Alto" : "Médio",
                                  executiveSummary: b.o_que_a_bandeira_esta_fazendo,
                                  recommendedAction: (proj.motivos || []).join(" "),
                                },
                              });
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm transition-all"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            Gerar Parecer no Doc Studio (/editor)
                          </button>
                        </div>
                      </div>

                      {/* Motivos do Match + O que a bandeira está fazendo */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
                        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400 mb-1">
                            O que a Bandeira está fazendo
                          </div>
                          <p className="text-slate-300 leading-relaxed">{b.o_que_a_bandeira_esta_fazendo}</p>
                          {b.antes_depois?.map((ad: any, i: number) => (
                            <div key={i} className="mt-2.5 pt-2.5 border-t border-slate-800 space-y-1">
                              <div className="font-semibold text-white">{ad.o_que}</div>
                              <div className="text-rose-300/90">
                                <strong>Antes:</strong> {ad.antes}
                              </div>
                              <div className="text-emerald-300/90">
                                <strong>Depois:</strong> {ad.depois}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                            Por que este perfil foi impactado + Ações Requeridas
                          </div>
                          <ul className="list-disc list-inside text-slate-300 space-y-1">
                            {proj.motivos?.map((m: string, i: number) => (
                              <li key={i}>{m}</li>
                            ))}
                          </ul>
                          {Object.entries(proj.acoes || {}).map(([papel, lista]: [string, any]) => (
                            <div key={papel} className="mt-2 pt-2 border-t border-slate-800">
                              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                                🔧 Ações [{papel.toUpperCase()}]
                              </span>
                              <ul className="mt-1.5 space-y-1 text-slate-200">
                                {lista.map((ac: string, j: number) => (
                                  <li key={j}>• {ac}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* As 3 Lentes */}
                      {b.lentes && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
                          <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-500/25">
                            <div className="font-bold text-blue-300 text-[11px] uppercase mb-1">
                              1. Lente Técnica (Campos ISO/IPM)
                            </div>
                            <div className="font-mono text-white mb-1">
                              Campos: {(b.lentes.tecnica?.campos || []).join(", ")}
                            </div>
                            <p className="text-slate-300">{b.lentes.tecnica?.nota}</p>
                          </div>
                          <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/25">
                            <div className="font-bold text-purple-300 text-[11px] uppercase mb-1">
                              2. Lente Normativa (Compliance)
                            </div>
                            <p className="text-slate-300">{b.lentes.normativa?.resumo}</p>
                            <div className="text-[10px] font-mono text-slate-400 mt-1">
                              Fonte: {b.lentes.normativa?.fonte_regra}
                            </div>
                          </div>
                          <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/25">
                            <div className="font-bold text-emerald-300 text-[11px] uppercase mb-1">
                              3. Lente de Negócio & Prazo
                            </div>
                            <p className="text-slate-300">{b.lentes.negocio?.exposicao_financeira}</p>
                            <p className="text-[11px] text-amber-300 mt-1">{b.lentes.negocio?.esforco_prazo}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Catálogo de Campos do Motor de Comportamento (▶Envia / ◀Recebe / 🔧Desenvolver) */}
            <div className="bg-[#080f1e] border border-slate-800/80 rounded-2xl p-6 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
                    Catálogo de Comportamento por Campo (`comportamento/campos/*.json`)
                  </span>
                  <h2 className="text-base font-bold text-white mt-0.5">
                    Fluxo Ida-e-Volta (`▶ Envia`, `◀ Recebe`, `🔧 Desenvolver`) por Papel
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {camposComportamento.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCampoId(c.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all ${
                        selectedCampoId === c.id
                          ? "bg-blue-600 text-white border-blue-500"
                          : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      {c.id} ({c.nome})
                    </button>
                  ))}
                </div>
              </div>

              {activeCampo && (
                <div className="rounded-xl border border-slate-800 bg-[#030711] p-5 space-y-4 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <span className="font-mono text-blue-400 font-bold">{activeCampo.id}</span>
                      <h3 className="text-base font-bold text-white">
                        {activeCampo.campo} {activeCampo.subcampo} — {activeCampo.nome}
                      </h3>
                      <p className="text-slate-400 mt-0.5">{activeCampo.descricao_funcional}</p>
                    </div>
                    <div className="text-right font-mono text-slate-300">
                      <div>Formato: <strong className="text-amber-300">{activeCampo.formato}</strong></div>
                      <div className="text-[11px] text-slate-400">Mensagens: {(activeCampo.mensagens || []).join(", ")}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {Object.entries(activeCampo.papeis || {}).map(([papel, info]: [string, any]) => (
                      <div key={papel} className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold uppercase text-white">{papel}</span>
                          <span className="px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 font-mono text-[10px]">
                            {info.acao === "envia" ? "▶ Envia" : info.acao === "recebe" ? "◀ Recebe" : "↔ Envia/Recebe"}
                          </span>
                        </div>
                        <div className="text-[11px] text-amber-300 font-medium">
                          Obrigatoriedade: {info.obrigatoriedade}
                        </div>
                        <p className="text-slate-300">{info.funcional}</p>
                        <div className="text-slate-400 font-mono text-[11px]">Técnico: {info.campo_tecnico}</div>
                        {info.desenvolver?.length > 0 && (
                          <div className="pt-1.5 border-t border-slate-800 text-emerald-300">
                            <strong>🔧 Desenvolver:</strong>
                            <ul className="mt-1 space-y-1">
                              {info.desenvolver.map((d: string, k: number) => (
                                <li key={k}>• {d}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =================================================================
            TAB 2: PLANILHA AO VIVO DE CONTROLE DE RELEASE (ABA ADQUIRENTE × EMISSOR)
           ================================================================= */}
        {activeTab === "planilha" && (
          <div className="space-y-6">
            <div className="bg-[#080f1e] border border-slate-800/80 rounded-2xl p-6 space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400">
                    Padrão Skill `analise-boletim-bandeira` · Visão em Tela + Exportação `.csv`
                  </span>
                  <h2 className="text-base font-bold text-white mt-0.5">
                    Planilha de Controle de Release 2026 / 2027 — Aba Adquirente vs Aba Emissor
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { id: "comparativo", label: "⚖️ Comparativo Lado a Lado (Adquirente × Emissor)" },
                    { id: "adquirente", label: "🏪 Somente Aba Adquirente" },
                    { id: "emissor", label: "🏦 Somente Aba Emissor" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setPlanilhaAba(tab.id as any)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                        planilhaAba === tab.id
                          ? "bg-blue-600 text-white border-blue-500 shadow-sm"
                          : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-600"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left border-collapse text-xs tabular-nums">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-800 text-[11px] font-black uppercase tracking-wider text-slate-400">
                      <th className="py-3 px-3">Bandeira & Release</th>
                      <th className="py-3 px-3">Boletim / Vigência</th>
                      <th className="py-3 px-3">Campos (Auth & Outgoing)</th>
                      {(planilhaAba === "comparativo" || planilhaAba === "adquirente") && (
                        <th className="py-3 px-3">🏪 Aba Adquirente (Impacto & Ações)</th>
                      )}
                      {(planilhaAba === "comparativo" || planilhaAba === "emissor") && (
                        <th className="py-3 px-3">🏦 Aba Emissor (Impacto & Ações)</th>
                      )}
                      <th className="py-3 px-3">Exposição Financeira</th>
                      <th className="py-3 px-3 text-right">Inspector</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70">
                    {boletins3Lentes
                      .filter((b) =>
                        selBandeira === "ALL"
                          ? true
                          : (b.bandeira || "").toLowerCase().includes(selBandeira.toLowerCase())
                      )
                      .map((b) => {
                        const acoesAdq: string[] = b.acoes?.adquirente || [];
                        const acoesEmi: string[] = b.acoes?.emissor || [];
                        const vigStr = (b.vigencia || [])
                          .map((v: any) => `${v.data}`)
                          .join(" · ");
                        return (
                          <tr
                            key={b.id}
                            onClick={() => setDrawerBoletim({ boletim: b, proj: null })}
                            className="cursor-pointer bg-slate-900/40 hover:bg-slate-900/90 transition-colors"
                          >
                            <td className="py-3.5 px-3 align-top whitespace-nowrap">
                              <div className="font-bold text-white">{b.bandeira}</div>
                              <div className="text-[11px] font-mono text-blue-400">
                                Release {b.release}
                              </div>
                              <span className="inline-block mt-1 px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 font-mono text-[10px] font-bold">
                                {b.classificacao}
                              </span>
                            </td>
                            <td className="py-3.5 px-3 align-top min-w-[200px]">
                              <div className="font-mono font-bold text-amber-300">{b.id}</div>
                              <div className="font-bold text-white leading-snug mt-0.5">
                                {b.titulo}
                              </div>
                              <div className="text-[11px] font-mono text-emerald-400 mt-1">
                                Vigência: {vigStr || "2026/2027"}
                              </div>
                            </td>
                            <td className="py-3.5 px-3 align-top font-mono text-[11px] text-slate-300 min-w-[170px]">
                              {(b.lentes?.tecnica?.campos || []).join(", ") || "Governança / Tarifas"}
                            </td>
                            {(planilhaAba === "comparativo" || planilhaAba === "adquirente") && (
                              <td className="py-3.5 px-3 align-top min-w-[230px]">
                                {acoesAdq.length > 0 ? (
                                  <ul className="space-y-1 text-slate-200">
                                    {acoesAdq.map((ac, i) => (
                                      <li key={i}>• {ac}</li>
                                    ))}
                                  </ul>
                                ) : (
                                  <span className="text-slate-400 italic">Sem Impacto.</span>
                                )}
                              </td>
                            )}
                            {(planilhaAba === "comparativo" || planilhaAba === "emissor") && (
                              <td className="py-3.5 px-3 align-top min-w-[230px]">
                                {acoesEmi.length > 0 ? (
                                  <ul className="space-y-1 text-slate-200">
                                    {acoesEmi.map((ac, i) => (
                                      <li key={i}>• {ac}</li>
                                    ))}
                                  </ul>
                                ) : (
                                  <span className="text-slate-400 italic">Sem Impacto.</span>
                                )}
                              </td>
                            )}
                            <td className="py-3.5 px-3 align-top text-rose-300 min-w-[180px]">
                              {b.lentes?.negocio?.exposicao_financeira}
                            </td>
                            <td className="py-3.5 px-3 align-top text-right whitespace-nowrap">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDrawerBoletim({ boletim: b, proj: null });
                                }}
                                className="px-2.5 py-1.5 rounded-lg bg-blue-600 text-white text-[11px] font-bold"
                              >
                                Inspecionar ➔
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================
            TAB 3: RADAR DE RELEASES & MANDATES (385 ITENS REAIS)
           ================================================================= */}
        {activeTab === "radar" && (
          <div className="space-y-6">
            <div className="bg-[#080f1e] border border-slate-800/80 rounded-2xl p-6 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
                    Base Consolidada de Releases (`scratch_release_mandatorio.csv`) · 381 Itens
                  </span>
                  <h2 className="text-base font-bold text-white">
                    Pesquisa Executiva de Pareceres Técnicos, Vigências, Certificação e Impacto Brasil
                  </h2>
                </div>
                <div className="text-xs font-mono text-slate-400">
                  Exibindo <strong className="text-white">{relResults.length}</strong> de{" "}
                  <strong className="text-emerald-400">{relTotal}</strong> itens
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">
                    Buscar por Código, Título, BIT/DE, Assunto ou Parecer
                  </label>
                  <input
                    type="text"
                    value={relQuery}
                    onChange={(e) => setRelQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && runSearchReleases()}
                    placeholder="Ex: Release 26.1, BIT 39, CNPJ, Token, 3DS, Parcelado..."
                    className="w-full bg-[#030711] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">
                    Bandeira
                  </label>
                  <select
                    value={relBandeira}
                    onChange={(e) => {
                      setRelBandeira(e.target.value);
                      runSearchReleases({ bandeira: e.target.value });
                    }}
                    className="w-full bg-[#030711] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="ALL">Todas (Visa, MC, Elo)</option>
                    <option value="Visa">Visa</option>
                    <option value="Mastercard">Mastercard</option>
                    <option value="Elo">Elo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">
                    Criticidade
                  </label>
                  <select
                    value={relCrit}
                    onChange={(e) => {
                      setRelCrit(e.target.value);
                      runSearchReleases({ criticidade: e.target.value });
                    }}
                    className="w-full bg-[#030711] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="ALL">Todas as Criticidades</option>
                    <option value="Alto">Alta Criticidade</option>
                    <option value="Médio">Média Criticidade</option>
                    <option value="Baixo">Baixa Criticidade</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => runSearchReleases()}
                    className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition-colors"
                  >
                    Filtrar Releases
                  </button>
                </div>
              </div>
            </div>

            {/* Split View: Table + Full Parecer Inspector */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 bg-[#080f1e] border border-slate-800/80 rounded-2xl overflow-hidden">
                <div className="max-h-[680px] overflow-y-auto divide-y divide-slate-800/60">
                  {loadingRel ? (
                    <div className="p-12 text-center text-xs text-slate-400">Carregando pareceres de release...</div>
                  ) : (
                    relResults.map((item) => {
                      const isSel = selectedRelItem?.id === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setSelectedRelItem(item)}
                          className={`w-full text-left p-4 transition-colors block ${
                            isSel ? "bg-blue-950/40 border-l-4 border-l-blue-500" : "hover:bg-slate-900/50"
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  item.bandeira === "Visa"
                                    ? "bg-blue-500/15 text-blue-300"
                                    : item.bandeira === "Mastercard"
                                    ? "bg-amber-500/15 text-amber-300"
                                    : "bg-emerald-500/15 text-emerald-300"
                                }`}
                              >
                                {item.bandeira}
                              </span>
                              <span className="font-mono text-xs font-bold text-slate-200">
                                {item.identificacao}
                              </span>
                              <span className="text-[11px] text-slate-400">· {item.release}</span>
                            </div>
                            <span className="text-[11px] font-mono text-slate-400">
                              Vigência: <strong className="text-slate-200">{item.vigencia || "N/D"}</strong>
                            </span>
                          </div>
                          <div className="text-xs font-bold text-white line-clamp-1">{item.titulo}</div>
                          <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">{item.resumo}</p>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Parecer Técnico Detalhado */}
              <div className="lg:col-span-5">
                {selectedRelItem ? (
                  <div className="bg-[#080f1e] border border-slate-800/80 rounded-2xl p-6 sticky top-32 space-y-4 text-xs">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
                      <span className="px-2.5 py-1 rounded-md font-mono font-bold bg-blue-500/20 text-blue-300">
                        {selectedRelItem.bandeira} · {selectedRelItem.identificacao}
                      </span>
                      <span className="px-2.5 py-1 rounded-md font-semibold bg-amber-500/15 text-amber-300">
                        {selectedRelItem.classificacao}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white leading-snug">{selectedRelItem.titulo}</h3>

                    <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-[#030711] border border-slate-800">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Release</span>
                        <strong className="text-white">{selectedRelItem.release}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Vigência</span>
                        <strong className="text-emerald-400 font-mono">{selectedRelItem.vigencia || "Contínuo"}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Área Impactada</span>
                        <strong className="text-slate-200">{selectedRelItem.area_impactada}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Criticidade / Complexidade</span>
                        <strong className="text-amber-300">
                          {selectedRelItem.criticidade} / {selectedRelItem.complexidade}
                        </strong>
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400 mb-1.5">
                        Parecer Técnico Estruturado (Motivo do Impacto)
                      </div>
                      <div className="p-3.5 rounded-xl bg-[#030711] border border-slate-800 text-slate-200 whitespace-pre-line leading-relaxed max-h-[340px] overflow-y-auto">
                        {selectedRelItem.parecer_tecnico}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const dossierHtml = `
                          <h1>Parecer Regulatório de Release: ${selectedRelItem.identificacao} — ${selectedRelItem.titulo}</h1>
                          <p><strong>Bandeira:</strong> ${selectedRelItem.bandeira} · <strong>Ciclo:</strong> ${selectedRelItem.release} · <strong>Vigência:</strong> ${selectedRelItem.vigencia || "Contínuo"} · <strong>Classificação:</strong> ${selectedRelItem.classificacao}</p>
                          <h2>1. Sumário Executivo & Área Impactada</h2>
                          <ul>
                            <li><strong>Área / Subsistema Afetado:</strong> ${selectedRelItem.area_impactada || "Mensageria & Liquidação"}</li>
                            <li><strong>Criticidade / Complexidade:</strong> ${selectedRelItem.criticidade} / ${selectedRelItem.complexidade}</li>
                            <li><strong>Resumo Executivo:</strong> ${selectedRelItem.resumo || selectedRelItem.titulo}</li>
                          </ul>
                          <h2>2. Parecer Técnico Detalhado e Plano de Ação</h2>
                          <div style="background: #f8fafc; border-left: 4px solid #2563eb; padding: 14px 16px; border-radius: 6px; white-space: pre-line;">
                            ${selectedRelItem.parecer_tecnico}
                          </div>
                        `;

                        sendToDocStudio({
                          mode: "full_dossier",
                          title: `Parecer Release — ${selectedRelItem.identificacao}: ${selectedRelItem.titulo}`,
                          sourceModule: "Radar de Releases & Mandates (381 Itens)",
                          html: dossierHtml,
                          metadata: {
                            brand: selectedRelItem.bandeira?.toLowerCase().includes("visa")
                              ? "visa"
                              : selectedRelItem.bandeira?.toLowerCase().includes("master")
                              ? "mastercard"
                              : "elo",
                            brandName: selectedRelItem.bandeira,
                            referenceId: selectedRelItem.identificacao,
                            category: `${selectedRelItem.release} • ${selectedRelItem.area_impactada}`,
                            effectiveDate: selectedRelItem.vigencia || "Contínuo",
                            riskLevel: selectedRelItem.criticidade === "Alto" ? "Alto" : "Médio",
                            executiveSummary: selectedRelItem.resumo || selectedRelItem.titulo,
                            recommendedAction: "Avaliar impacto em autorização, clearing e certificação mandatória junto à bandeira.",
                          },
                        });
                      }}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm transition-all"
                    >
                      <FileText className="w-4 h-4" />
                      Transformar em Dossiê no Doc Studio (/editor)
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        )}

        {/* =================================================================
            TAB 3: DOSSIÊ CRIPTOGRÁFICO VISA AES vs TDES & GLOSSÁRIO ISO
           ================================================================= */}
        {activeTab === "aes" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 bg-[#080f1e] border border-slate-800/80 rounded-2xl p-6 space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                  Especificação Técnica Auditada (`comportamento/specs/visa_aes_tdes_migration.md`)
                </span>
                <h2 className="text-lg font-bold text-white mt-0.5">
                  Visa — Migração Global & Brasil de Criptografia TDES → AES (Chip/PIN, HSM & CAVV v9 Field 126.9)
                </h2>
              </div>
              <pre className="font-sans text-xs text-slate-200 whitespace-pre-wrap leading-relaxed bg-[#030711] border border-slate-800 rounded-xl p-5 overflow-x-auto">
                {aesMarkdown}
              </pre>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <div className="bg-[#080f1e] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                  Glossário Canônico (`comportamento/glossario.json`)
                </span>
                <h3 className="text-sm font-bold text-white">Mensagens ISO 8583 (MTI)</h3>
                <div className="space-y-2 text-xs">
                  {Object.entries(glossario.mensagens_iso || {}).map(([mti, desc]: [string, any]) => (
                    <div key={mti} className="p-2.5 rounded-xl bg-[#030711] border border-slate-800">
                      <span className="font-mono font-bold text-amber-300 mr-2">MTI {mti}</span>
                      <span className="text-slate-300">{desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =====================================================================
          SLIDE-OVER INSPECTOR DRAWER DE BOLETIM 3 LENTES (WORKBENCH 2.0)
         ===================================================================== */}
      {drawerBoletim && drawerBoletim.boletim && (
        <div
          className="fixed inset-0 z-[95] flex justify-end bg-slate-900/40 backdrop-blur-[2px]"
          onClick={() => setDrawerBoletim(null)}
        >
          <div
            className="w-full max-w-[480px] h-full bg-white border-l border-slate-200 shadow-2xl flex flex-col overflow-hidden text-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded bg-blue-100 border border-blue-200 text-[10px] font-mono font-black text-blue-700">
                    {drawerBoletim.boletim.bandeira} · Release {drawerBoletim.boletim.release}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-100 border border-amber-200 text-[10px] font-mono font-bold text-amber-800">
                    {drawerBoletim.boletim.id} · {drawerBoletim.boletim.classificacao}
                  </span>
                </div>
                <h3 className="text-base font-black text-slate-900 leading-snug">
                  {drawerBoletim.boletim.titulo}
                </h3>
              </div>
              <button
                onClick={() => setDrawerBoletim(null)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-xs font-bold text-slate-600 shrink-0"
              >
                ✕ Fechar
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 space-y-1.5">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Resumo Executivo da Mudança
                </div>
                <p className="text-slate-800 leading-relaxed">
                  {drawerBoletim.boletim.o_que_a_bandeira_esta_fazendo}
                </p>
              </div>

              {/* As 3 Lentes */}
              {drawerBoletim.boletim.lentes && (
                <>
                  <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 space-y-1.5">
                    <div className="text-[10px] font-black uppercase tracking-wider text-blue-700">
                      1. Lente Técnica (Mensageria ISO 8583 / Outgoing)
                    </div>
                    <div className="font-mono font-bold text-slate-900">
                      Campos: {(drawerBoletim.boletim.lentes.tecnica?.campos || []).join(", ")}
                    </div>
                    <p className="text-slate-700 leading-relaxed">
                      {drawerBoletim.boletim.lentes.tecnica?.nota}
                    </p>
                  </div>

                  <div className="rounded-xl border border-purple-200 bg-purple-50/70 p-4 space-y-1.5">
                    <div className="text-[10px] font-black uppercase tracking-wider text-purple-700">
                      2. Lente Normativa & Fonte Oficial
                    </div>
                    <p className="text-slate-800 leading-relaxed">
                      {drawerBoletim.boletim.lentes.normativa?.resumo}
                    </p>
                    <div className="font-mono text-[11px] text-slate-600">
                      Fonte: {drawerBoletim.boletim.lentes.normativa?.fonte_regra}
                    </div>
                  </div>

                  <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-4 space-y-1.5">
                    <div className="text-[10px] font-black uppercase tracking-wider text-rose-700">
                      3. Lente de Negócio, Exposição Financeira & Vigência
                    </div>
                    <p className="text-rose-900 font-semibold leading-relaxed">
                      {drawerBoletim.boletim.lentes.negocio?.exposicao_financeira}
                    </p>
                    <div className="font-mono text-[11px] text-slate-700">
                      Prazo / Esforço: {drawerBoletim.boletim.lentes.negocio?.esforco_prazo}
                    </div>
                  </div>
                </>
              )}

              {/* Ações por Papel (Aba Adquirente vs Aba Emissor) */}
              <div className="grid grid-cols-1 gap-3">
                <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-1.5">
                  <div className="text-[10px] font-black uppercase tracking-wider text-emerald-700">
                    🏪 O Que Desenvolver — Aba Adquirente / PayFac
                  </div>
                  {(drawerBoletim.boletim.acoes?.adquirente || []).length > 0 ? (
                    <ul className="space-y-1 text-slate-700">
                      {drawerBoletim.boletim.acoes.adquirente.map((ac: string, i: number) => (
                        <li key={i}>• {ac}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-500 italic">Sem Impacto.</p>
                  )}
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-1.5">
                  <div className="text-[10px] font-black uppercase tracking-wider text-blue-700">
                    🏦 O Que Desenvolver — Aba Emissor
                  </div>
                  {(drawerBoletim.boletim.acoes?.emissor || []).length > 0 ? (
                    <ul className="space-y-1 text-slate-700">
                      {drawerBoletim.boletim.acoes.emissor.map((ac: string, i: number) => (
                        <li key={i}>• {ac}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-500 italic">Sem Impacto.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleExportPlanilhaRelease("adquirente")}
                  className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold text-center"
                >
                  📥 Aba Adquirente (.csv)
                </button>
                <button
                  onClick={() => handleExportPlanilhaRelease("emissor")}
                  className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold text-center"
                >
                  📥 Aba Emissor (.csv)
                </button>
              </div>
              <button
                onClick={() => {
                  const b = drawerBoletim.boletim;
                  sendToDocStudio({
                    mode: "full_dossier",
                    title: `Parecer Executivo — ${b.id}: ${b.titulo}`,
                    sourceModule: "Hub de Releases & Boletins 2.0",
                    html: `
                      <h1>Parecer Técnico & Regulatório: ${b.id} — ${b.titulo}</h1>
                      <p><strong>Bandeira:</strong> ${b.bandeira} · <strong>Release:</strong> ${b.release} · <strong>Classificação:</strong> ${b.classificacao}</p>
                      <h2>1. O que a Bandeira está alterando</h2>
                      <p>${b.o_que_a_bandeira_esta_fazendo}</p>
                      <h2>2. Análise nas 3 Lentes</h2>
                      <ul>
                        <li><strong>Lente Técnica:</strong> Campos <code>${(b.lentes?.tecnica?.campos || []).join(", ")}</code> — ${b.lentes?.tecnica?.nota || ""}</li>
                        <li><strong>Lente Normativa:</strong> ${b.lentes?.normativa?.resumo || ""}</li>
                        <li><strong>Lente de Negócio:</strong> ${b.lentes?.negocio?.exposicao_financeira || ""}</li>
                      </ul>
                    `,
                    metadata: {
                      brand: b.bandeira?.toLowerCase().includes("visa")
                        ? "visa"
                        : b.bandeira?.toLowerCase().includes("master")
                        ? "mastercard"
                        : "elo",
                      brandName: b.bandeira,
                      referenceId: b.id,
                      category: `${b.bandeira} Release ${b.release}`,
                      effectiveDate: b.lentes?.negocio?.esforco_prazo || `Release ${b.release}`,
                      riskLevel: "Alto",
                      executiveSummary: b.o_que_a_bandeira_esta_fazendo,
                      recommendedAction: (b.acoes?.adquirente || []).join(" "),
                    },
                  });
                }}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold text-center"
              >
                📝 Enviar Dossiê Completo deste Boletim para o Doc Studio (/editor)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
