"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Cpu,
  Calculator,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Play,
  Layers,
  Database,
  CreditCard,
  ShieldAlert,
  Sparkles,
  Code2,
  Sliders,
} from "lucide-react";

export default function ProvisionamentoCascataPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [simLoading, setSimLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"simulador" | "irds" | "regras" | "mccs">("simulador");

  // Simulation form state
  const [form, setForm] = useState<any>({
    bandeira: "mastercard",
    valor: 250.0,
    pan: "2227631234567890",
    PRODUCT_TYPE: "CREDIT",
    tier: "Consumer platinum",
    CARD_PRESENT_ID: 1,
    PAYPASS_IND: 0,
    ECSLI: "",
    MCC: 5411,
    INSTALLMENTS: 1,
    DOCUMENT_TYPE: 2,
    ACQR_COUNTRY_CODE: 76,
    ISSR_COUNTRY_CODE: 76,
    SETTL_FLAG: "9",
    PID: "I^",
    AFS: "C",
    ECI: "05",
    POS_ENTRY_MODE: "81",
    INST: 1,
    MANDATORY_DATA: "PRESENT",
    TIMELINESS: 0,
  });

  const [simResult, setSimResult] = useState<any>(null);
  const [showFailedRules, setShowFailedRules] = useState(true);
  const [ruleBrandFilter, setRuleBrandFilter] = useState<"all" | "mastercard" | "maestro" | "visa">("all");
  const [ruleSearch, setRuleSearch] = useState("");
  const [mccSearch, setMccSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/provisionamento?action=overview")
      .then((r) => r.json())
      .then((res) => {
        setData(res);
        if (res.default_simulation) {
          setSimResult(res.default_simulation);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const runSimulation = async (overrideParams?: any) => {
    const payload = overrideParams || form;
    setSimLoading(true);
    try {
      const res = await fetch("/api/admin/provisionamento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      setSimResult(json);
    } finally {
      setSimLoading(false);
    }
  };

  const applyPreset = (preset: any) => {
    const merged = { ...form, ...preset.params };
    setForm(merged);
    runSimulation(merged);
  };

  const filteredRules = useMemo(() => {
    if (!data) return [];
    const list: any[] = [];
    if (ruleBrandFilter === "all" || ruleBrandFilter === "mastercard") {
      for (const r of data.mc_rules || []) {
        list.push({
          brand: "Mastercard",
          priority: r.priority,
          rule_id: String(r.rule_id),
          code: r.ird,
          description: r.description,
          expression: r.expression,
          rate_info: "Via Tabela IRD / Ajuste IA",
          corrupted: false,
        });
      }
    }
    if (ruleBrandFilter === "all" || ruleBrandFilter === "maestro") {
      for (const r of data.maestro_rules || []) {
        list.push({
          brand: "Maestro",
          priority: r.priority,
          rule_id: String(r.rule_id),
          code: r.pseudo_ird,
          description: r.description,
          expression: r.expression,
          rate_info: `${r.rate_pct}%${r.cap_brl ? ` (Cap R$ ${r.cap_brl})` : ""}`,
          corrupted: false,
        });
      }
    }
    if (ruleBrandFilter === "all" || ruleBrandFilter === "visa") {
      for (const r of data.visa_rules || []) {
        list.push({
          brand: "Visa",
          priority: r.priority,
          rule_id: String(r.rule_id),
          code: r.accounting_sign || "DR",
          description: r.descriptor,
          expression: r.expression,
          rate_info: `${r.rate_pct}%${r.fixed_fee > 0 ? ` + R$ ${r.fixed_fee}` : ""}${r.cap_fee > 0 ? ` (Cap R$ ${r.cap_fee})` : ""}`,
          corrupted: Boolean(r.rate_corrupted),
        });
      }
    }
    const q = ruleSearch.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (r) =>
        r.rule_id.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.expression.toLowerCase().includes(q)
    );
  }, [data, ruleBrandFilter, ruleSearch]);

  const filteredMccs = useMemo(() => {
    if (!data?.mcc_to_segment) return [];
    const q = mccSearch.trim().toLowerCase();
    if (!q) return data.mcc_to_segment;
    return data.mcc_to_segment.filter(
      (m: any) =>
        String(m.mcc).includes(q) ||
        String(m.segment || "").toLowerCase().includes(q)
    );
  }, [data, mccSearch]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b14] text-slate-100 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-400 font-mono">
            Inicializando Compilador Booleano & Motor de Provisionamento (engine/calculator.py)...
          </p>
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const cascataList = simResult?.cascata || [];
  const displayedCascata = showFailedRules
    ? cascataList
    : cascataList.filter((c: any) => c.result);

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 mb-2 font-mono"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao Cockpit do Proprietário
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Calculator className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                  Motor Determinístico de Provisionamento & Trace de Cascata
                </h1>
                <p className="text-sm text-slate-400 mt-0.5">
                  Compilador de expressões booleanas (`engine/calculator.py`), diagnóstico de IRDs de ajuste (`ADJUSTMENT_IRD_BASE`) e lookup de BIN (`IP0040T1`).
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/compliance/mpe-forense"
              className="px-3.5 py-2 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-medium hover:bg-purple-500/20 transition"
            >
              Laboratório MPE T068 →
            </Link>
            <Link
              href="/compliance/tarifas-reais"
              className="px-3.5 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium hover:bg-emerald-500/20 transition"
            >
              1.128 Alíquotas Reais →
            </Link>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
            <div className="text-xs text-slate-400">Regras Mastercard</div>
            <div className="text-2xl font-bold text-blue-400 mt-1">{stats.mc_rules_count || 87}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Compiladas por prioridade</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
            <div className="text-xs text-slate-400">Regras Visa Clearing</div>
            <div className="text-2xl font-bold text-cyan-400 mt-1">{stats.visa_rules_count || 48}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">PID + AFS + PEM + ECI</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
            <div className="text-xs text-slate-400">Regras Maestro</div>
            <div className="text-2xl font-bold text-indigo-400 mt-1">{stats.maestro_rules_count || 6}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Com Cap BRL por segmento</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
            <div className="text-xs text-slate-400">Taxas Base (IA / Diretas)</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">{stats.base_rates_count || 173}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">IRD × Tier × Segmento</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
            <div className="text-xs text-slate-400">Ajustes sobre Base IA</div>
            <div className="text-2xl font-bold text-amber-400 mt-1">{stats.adjustments_count || 139}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">HU, AU, AV, AW, JV, JW, IV, IW</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
            <div className="text-xs text-slate-400">Alertas de Planilha</div>
            <div className="text-2xl font-bold text-rose-400 mt-1">{stats.visa_corrupted_rules_count || 0}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">`rate_corrupted` detectados</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
          {[
            { id: "simulador", label: "1. Simulador Determinístico & Trace de Cascata", icon: Play },
            { id: "irds", label: "2. Diagnóstico de IRDs & Ajustes sobre IA (12 IRDs)", icon: Sliders },
            { id: "regras", label: "3. Regras Booleanas Compiladas (141)", icon: Code2 },
            { id: "mccs", label: "4. Mapeamento MCC → Segmento (70 MCCs)", icon: Layers },
          ].map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition ${
                  active
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                    : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: SIMULADOR & CASCATA */}
        {activeTab === "simulador" && (
          <div className="space-y-6">
            {/* Presets Bar */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" /> Cenários Prontos de Teste Forense (Clique para simular)
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                {(data?.presets || []).map((p: any) => (
                  <button
                    key={p.id}
                    onClick={() => applyPreset(p)}
                    className="text-left p-3 rounded-lg bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-blue-500/40 transition group"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                        {p.badge}
                      </span>
                    </div>
                    <div className="text-xs font-medium text-slate-200 group-hover:text-white line-clamp-2">
                      {p.title}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Simulator Form + Result Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Parameters */}
              <div className="lg:col-span-5 p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-blue-400" /> Parâmetros Técnicos ISO 8583 / Clearing
                  </h2>
                  <select
                    value={form.bandeira}
                    onChange={(e) => setForm({ ...form, bandeira: e.target.value })}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-semibold text-blue-300"
                  >
                    <option value="mastercard">Mastercard (GCMS / IPM)</option>
                    <option value="maestro">Maestro (Single/Dual)</option>
                    <option value="visa">Visa (Base II Clearing)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Valor da Transação (BRL)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.valor}
                      onChange={(e) => setForm({ ...form, valor: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                    />
                  </div>

                  {form.bandeira !== "visa" ? (
                    <>
                      <div>
                        <label className="text-slate-400 block mb-1">PAN / BIN (Opcional - IP0040T1)</label>
                        <input
                          type="text"
                          placeholder="Ex: 2227631234567890"
                          value={form.pan}
                          onChange={(e) => setForm({ ...form, pan: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-amber-300 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">PRODUCT_TYPE</label>
                        <select
                          value={form.PRODUCT_TYPE}
                          onChange={(e) => setForm({ ...form, PRODUCT_TYPE: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                        >
                          <option value="CREDIT">CREDIT</option>
                          <option value="DEBIT">DEBIT</option>
                          <option value="PREPAID">PREPAID</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">Tier do Cartão</label>
                        <select
                          value={form.tier}
                          onChange={(e) => setForm({ ...form, tier: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                        >
                          <option value="Consumer standard">Consumer standard</option>
                          <option value="Consumer gold">Consumer gold</option>
                          <option value="Consumer platinum">Consumer platinum</option>
                          <option value="Consumer black">Consumer black</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">CARD_PRESENT_ID</label>
                        <select
                          value={form.CARD_PRESENT_ID}
                          onChange={(e) => setForm({ ...form, CARD_PRESENT_ID: parseInt(e.target.value, 10) })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                        >
                          <option value={1}>1 — Card Present (Físico)</option>
                          <option value={0}>0 — Card Not Present (E-comm)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">PAYPASS_IND (Contactless)</label>
                        <select
                          value={form.PAYPASS_IND}
                          onChange={(e) => setForm({ ...form, PAYPASS_IND: parseInt(e.target.value, 10) })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                        >
                          <option value={0}>0 — Chip / Tarja / E-comm</option>
                          <option value={1}>1 — Contactless (Tap/NFC)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">ECSLI (Autenticação 3DS)</label>
                        <select
                          value={form.ECSLI}
                          onChange={(e) => setForm({ ...form, ECSLI: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                        >
                          <option value="">(Vazio — Sem 3DS)</option>
                          <option value="FRICTIONLESS">FRICTIONLESS (3DS Autenticado)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">MCC (DE 18)</label>
                        <input
                          type="number"
                          value={form.MCC}
                          onChange={(e) => setForm({ ...form, MCC: parseInt(e.target.value, 10) || 5411 })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">INSTALLMENTS (Parcelas)</label>
                        <input
                          type="number"
                          min={1}
                          max={24}
                          value={form.INSTALLMENTS}
                          onChange={(e) => setForm({ ...form, INSTALLMENTS: parseInt(e.target.value, 10) || 1 })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">DOCUMENT_TYPE (2=PF, 1=PJ)</label>
                        <select
                          value={form.DOCUMENT_TYPE}
                          onChange={(e) => setForm({ ...form, DOCUMENT_TYPE: parseInt(e.target.value, 10) })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                        >
                          <option value={2}>2 — Pessoa Física (Consumer)</option>
                          <option value={1}>1 — Pessoa Jurídica (Commercial)</option>
                        </select>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="text-slate-400 block mb-1">PID (Product ID Visa)</label>
                        <select
                          value={form.PID}
                          onChange={(e) => setForm({ ...form, PID: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                        >
                          <option value="F^">F^ — Visa Classic / Prepaid</option>
                          <option value="P^">P^ — Visa Gold</option>
                          <option value="N^">N^ — Visa Platinum</option>
                          <option value="C^">C^ — Visa Signature</option>
                          <option value="I^">I^ — Visa Infinite</option>
                          <option value="I1">I1 — Visa Infinite HNW</option>
                          <option value="K^">K^ — Visa Business</option>
                          <option value="S^">S^ — Visa Corporate</option>
                          <option value="S4">S4 — Visa Agro</option>
                          <option value="J3">J3 — Visa Vale</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">AFS (Account Funding Source)</label>
                        <select
                          value={form.AFS}
                          onChange={(e) => setForm({ ...form, AFS: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                        >
                          <option value="C">C — Credit</option>
                          <option value="D">D — Debit</option>
                          <option value="P">P — Prepaid</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">POS_ENTRY_MODE</label>
                        <select
                          value={form.POS_ENTRY_MODE}
                          onChange={(e) => setForm({ ...form, POS_ENTRY_MODE: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                        >
                          <option value="05">05 — Chip EMV Contact</option>
                          <option value="07">07 — Contactless EMV</option>
                          <option value="81">81 — E-Commerce</option>
                          <option value="01">01 — Manual / Digitado</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">ECI (Electronic Commerce Ind)</label>
                        <select
                          value={form.ECI}
                          onChange={(e) => setForm({ ...form, ECI: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                        >
                          <option value="05">05 — 3DS Totalmente Autenticado</option>
                          <option value="06">06 — 3DS Tentativa (Merchant)</option>
                          <option value="07">07 — Não Autenticado</option>
                          <option value="">(Vazio — Presencial)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">MCC (String)</label>
                        <input
                          type="text"
                          value={form.MCC}
                          onChange={(e) => setForm({ ...form, MCC: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">INST (Parcelas Visa)</label>
                        <input
                          type="number"
                          min={1}
                          max={24}
                          value={form.INST}
                          onChange={(e) => setForm({ ...form, INST: parseInt(e.target.value, 10) || 1 })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">MANDATORY_DATA</label>
                        <select
                          value={form.MANDATORY_DATA}
                          onChange={(e) => setForm({ ...form, MANDATORY_DATA: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                        >
                          <option value="PRESENT">PRESENT (Qualificado)</option>
                          <option value="">(Ausente → Aciona BR-NON-QUAL)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">SETTL_FLAG</label>
                        <select
                          value={form.SETTL_FLAG}
                          onChange={(e) => setForm({ ...form, SETTL_FLAG: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                        >
                          <option value="9">9 — Doméstico Brasil</option>
                          <option value="8">8 — Doméstico Nacional</option>
                          <option value="0">0 — Internacional Cross-Border</option>
                        </select>
                      </div>
                    </>
                  )}
                </div>

                <button
                  onClick={() => runSimulation()}
                  disabled={simLoading}
                  className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-blue-600/20"
                >
                  <Play className="w-4 h-4" />
                  {simLoading ? "Avaliando Cascata Booleana..." : "Executar Motor & Gerar Trace da Cascata"}
                </button>
              </div>

              {/* Right Column: Result & BIN Info */}
              <div className="lg:col-span-7 space-y-4">
                {simResult && (
                  <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        {simResult.sucesso ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <XCircle className="w-5 h-5 text-rose-400" />
                        )}
                        <h3 className="text-base font-bold text-white">
                          {simResult.sucesso
                            ? `Regra Vencedora: ${simResult.rule_id} (${simResult.ird})`
                            : "Nenhuma Regra Enquadrada"}
                        </h3>
                      </div>
                      <span className="text-xs font-mono px-2.5 py-1 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                        Prioridade #{simResult.prioridade || "N/A"} • {cascataList.length} regras avaliadas
                      </span>
                    </div>

                    {simResult.sucesso ? (
                      <>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800">
                            <div className="text-[11px] text-slate-400">IRD / Código</div>
                            <div className="text-xl font-bold text-amber-400 font-mono mt-0.5">
                              {simResult.ird}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate">
                              {simResult.descricao_regra}
                            </div>
                          </div>
                          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800">
                            <div className="text-[11px] text-slate-400">Alíquota Aplicada</div>
                            <div className="text-xl font-bold text-emerald-400 font-mono mt-0.5">
                              {simResult.rate_pct}%
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {simResult.rate_resolution?.mode}
                            </div>
                          </div>
                          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800">
                            <div className="text-[11px] text-slate-400">Intercâmbio Calculado</div>
                            <div className="text-xl font-bold text-white font-mono mt-0.5">
                              {simResult.taxa_intercambio_fmt}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              Sobre R$ {Number(simResult.valor_transacao || 0).toFixed(2)}
                            </div>
                          </div>
                          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800">
                            <div className="text-[11px] text-slate-400">Segmento / Tier</div>
                            <div className="text-sm font-bold text-blue-300 mt-1 truncate">
                              {simResult.segment}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate">
                              {simResult.tier}
                            </div>
                          </div>
                        </div>

                        {/* Decomposição da Taxa (Base IA + Ajuste ou Teto) */}
                        <div className="p-3.5 rounded-lg bg-slate-950/90 border border-slate-800/80 text-xs space-y-1.5">
                          <div className="font-semibold text-slate-300 flex items-center justify-between">
                            <span>Fórmula de Resolução da Alíquota (`_lookup_rate`):</span>
                            <span className="font-mono text-blue-400">{simResult.rate_resolution?.mode}</span>
                          </div>
                          {simResult.rate_resolution?.mode?.startsWith("ADJUSTMENT_OVER_") ? (
                            <p className="text-slate-400 font-mono">
                              Taxa Final ({simResult.rate_pct}%) = Base IA ({simResult.rate_resolution.base_ia_pct}%) + Ajuste IRD {simResult.ird} ({simResult.rate_resolution.adjustment_pct >= 0 ? `+${simResult.rate_resolution.adjustment_pct}` : simResult.rate_resolution.adjustment_pct}%)
                            </p>
                          ) : (
                            <p className="text-slate-400 font-mono">
                              Expressão Vencedora: <span className="text-emerald-300">{simResult.expression}</span>
                              {simResult.cap_aplicado ? " • TETO (CAP) APLICADO!" : ""}
                            </p>
                          )}
                        </div>

                        {simResult.aviso && (
                          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>{simResult.aviso}</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                        {simResult.erro}
                      </div>
                    )}

                    {/* BIN Lookup Card if present */}
                    {simResult.bin_info && (
                      <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                            <CreditCard className="w-4 h-4" /> Lookup Real de BIN executado na Tabela MPE `IP0040T1`
                          </span>
                          <span className="text-[11px] font-mono text-amber-400">
                            ICA Emissor: {simResult.bin_info.issuer_ica}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono">
                          <div className="bg-slate-950 p-2 rounded border border-slate-800">
                            <span className="text-slate-500 block text-[10px]">Faixa Inicial</span>
                            <span className="text-slate-200">{simResult.bin_info.range_start}</span>
                          </div>
                          <div className="bg-slate-950 p-2 rounded border border-slate-800">
                            <span className="text-slate-500 block text-[10px]">Faixa Final</span>
                            <span className="text-slate-200">{simResult.bin_info.range_end}</span>
                          </div>
                          <div className="bg-slate-950 p-2 rounded border border-slate-800">
                            <span className="text-slate-500 block text-[10px]">Produto MPE</span>
                            <span className="text-emerald-400 font-bold">{simResult.bin_info.product_start}</span>
                          </div>
                          <div className="bg-slate-950 p-2 rounded border border-slate-800">
                            <span className="text-slate-500 block text-[10px]">País / Região</span>
                            <span className="text-blue-300">
                              {simResult.bin_info.country_alpha} ({simResult.bin_info.country_num}) • Reg {simResult.bin_info.region}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Context Variables Evaluated */}
                    <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800">
                      <div className="text-[11px] font-semibold text-slate-400 mb-2">
                        Vetor de Contexto (`ctx`) compilado para avaliação:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(simResult.ctx || {}).map(([k, v]) => (
                          <span
                            key={k}
                            className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300"
                          >
                            <span className="text-slate-500">{k}=</span>
                            <span className="text-blue-300">{v === null ? "NULL" : String(v)}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Full Cascade Trace Step-by-Step */}
            <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white">
                    Trilha de Auditoria da Cascata Booleana (`cascata` passo a passo)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Inspeção cláusula a cláusula da Prioridade #1 até a regra vencedora. Cláusulas em vermelho indicam a condição exata que rejeitou a regra de maior prioridade.
                  </p>
                </div>
                <label className="inline-flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showFailedRules}
                    onChange={(e) => setShowFailedRules(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-950"
                  />
                  Exibir regras anteriores que deram FALSE ({cascataList.length - 1} regras)
                </label>
              </div>

              <div className="space-y-2.5 max-h-[560px] overflow-y-auto pr-1">
                {displayedCascata.map((step: any, idx: number) => (
                  <div
                    key={`${step.rule_id}-${idx}`}
                    className={`p-3.5 rounded-lg border transition ${
                      step.result
                        ? "bg-emerald-500/10 border-emerald-500/40"
                        : "bg-slate-950/70 border-slate-800/80"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                            step.result
                              ? "bg-emerald-500 text-slate-950"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          P#{step.priority}
                        </span>
                        <span className="text-xs font-bold font-mono text-white">
                          Regra {step.rule_id}
                        </span>
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          {step.ird}
                        </span>
                        <span className="text-xs text-slate-300">{step.description}</span>
                      </div>
                      <span
                        className={`text-xs font-mono font-bold ${
                          step.result ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {step.result ? "✓ MATCH (TRUE — VENCEDORA)" : "✗ SKIP (FALSE)"}
                      </span>
                    </div>

                    <div className="text-[11px] font-mono text-slate-400 bg-slate-900/90 p-2 rounded border border-slate-800 mb-2 overflow-x-auto">
                      {step.expression}
                    </div>

                    {/* Atomic Clauses */}
                    <div className="flex flex-wrap gap-1.5">
                      {(step.clauses || []).map((cl: any, cIdx: number) => (
                        <span
                          key={cIdx}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                            cl.passed
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                              : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                          }`}
                        >
                          {cl.passed ? "✓" : "✗"} {cl.var} {cl.op} {cl.expected}{" "}
                          <span className="opacity-75">[atual: {cl.actual}]</span>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DIAGNÓSTICO DE IRDS & AJUSTES */}
        {activeTab === "irds" && (
          <div className="space-y-6">
            <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
              <div>
                <h2 className="text-lg font-bold text-white">
                  Diagnóstico de Cobertura de IRDs & Matriz de Ajustes sobre `IA` (`diagnose_irds.py` + `analyze_adjustments.py`)
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Verifica quais IRDs possuem taxa direta em `ic_base_rates` e quais são calculados por spread/ajuste (`ic_adjustments`) sobre a taxa base `IA` (`ADJUSTMENT_IRD_BASE`).
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60">
                      <th className="p-3 font-mono">IRD</th>
                      <th className="p-3">Descrição & Canal</th>
                      <th className="p-3">Parcelas</th>
                      <th className="p-3">Regras Ativas</th>
                      <th className="p-3">Modo de Resolução</th>
                      <th className="p-3 font-mono">Ajuste Base</th>
                      <th className="p-3 font-mono">Standard (Base)</th>
                      <th className="p-3 font-mono">Gold (Base)</th>
                      <th className="p-3 font-mono">Platinum (Base)</th>
                      <th className="p-3 font-mono">Black (Base)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70">
                    {(data?.ird_diagnostics || []).map((row: any) => (
                      <tr key={row.ird} className="hover:bg-slate-800/30">
                        <td className="p-3 font-mono font-bold text-amber-400 text-sm">{row.ird}</td>
                        <td className="p-3">
                          <div className="font-semibold text-slate-200">{row.desc}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{row.channel}</div>
                          {row.normative_alert && (
                            <div className="mt-1 text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded inline-block">
                              ⚠️ {row.normative_alert}
                            </div>
                          )}
                        </td>
                        <td className="p-3 font-mono text-slate-300">{row.installments}</td>
                        <td className="p-3 font-mono">
                          <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                            {row.active_rules_count} regras (P#{row.min_priority}–{row.max_priority})
                          </span>
                        </td>
                        <td className="p-3 font-mono">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] ${
                              row.resolution_mode === "DIRECT_BASE_RATE"
                                ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                                : "bg-purple-500/10 text-purple-300 border border-purple-500/20"
                            }`}
                          >
                            {row.resolution_mode}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-slate-300">
                          {row.base_adjustment_pct !== null && row.base_adjustment_pct !== undefined
                            ? `${row.base_adjustment_pct >= 0 ? "+" : ""}${row.base_adjustment_pct.toFixed(4)}%`
                            : "Direta"}
                        </td>
                        {["Consumer standard", "Consumer gold", "Consumer platinum", "Consumer black"].map(
                          (tKey) => {
                            const cell = row.tier_rates_base?.[tKey];
                            return (
                              <td key={tKey} className="p-3 font-mono">
                                {cell?.final_pct !== null && cell?.final_pct !== undefined ? (
                                  <div>
                                    <span className="text-emerald-400 font-bold">
                                      {cell.final_pct.toFixed(2)}%
                                    </span>
                                    {cell.mode === "ADJ_OVER_IA" && (
                                      <span className="block text-[10px] text-slate-500">
                                        ({cell.base_ia}% {cell.adj >= 0 ? `+${cell.adj}%` : `${cell.adj}%`})
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-rose-400">N/A</span>
                                )}
                              </td>
                            );
                          }
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: REGRAS COMPILADAS */}
        {activeTab === "regras" && (
          <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "all", label: "Todas (141)" },
                  { id: "mastercard", label: "Mastercard (87)" },
                  { id: "visa", label: "Visa Clearing (48)" },
                  { id: "maestro", label: "Maestro (6)" },
                ].map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setRuleBrandFilter(b.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                      ruleBrandFilter === b.id
                        ? "bg-blue-600 text-white"
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
                  placeholder="Filtrar por IRD, Rule ID, expressão, ECI..."
                  value={ruleSearch}
                  onChange={(e) => setRuleSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="sticky top-0 bg-slate-950 z-10">
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="p-3">Bandeira</th>
                    <th className="p-3 font-mono">Prioridade</th>
                    <th className="p-3 font-mono">Rule ID</th>
                    <th className="p-3 font-mono">IRD / Sign</th>
                    <th className="p-3">Descrição</th>
                    <th className="p-3">Taxa / Resolução</th>
                    <th className="p-3">Expressão Booleana Compilada</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {filteredRules.map((r, i) => (
                    <tr key={`${r.brand}-${r.rule_id}-${i}`} className="hover:bg-slate-800/30">
                      <td className="p-3 font-semibold text-slate-200">{r.brand}</td>
                      <td className="p-3 font-mono text-blue-400">#{r.priority}</td>
                      <td className="p-3 font-mono font-bold text-white">{r.rule_id}</td>
                      <td className="p-3 font-mono text-amber-400 font-bold">{r.code}</td>
                      <td className="p-3 text-slate-300">
                        {r.description}
                        {r.corrupted && (
                          <span className="ml-2 px-2 py-0.5 rounded bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-mono">
                            rate_corrupted
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-mono text-emerald-400">{r.rate_info}</td>
                      <td className="p-3 font-mono text-[11px] text-slate-400 max-w-md break-all">
                        {r.expression}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: MCC -> SEGMENTO */}
        {activeTab === "mccs" && (
          <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-white">
                  Tabela `ic_mcc_to_segment` (70 MCCs Especializados)
                </h2>
                <p className="text-xs text-slate-400">
                  Qualquer MCC ausente desta tabela recebe automaticamente o segmento `Base` no cálculo determinístico (`_get_segment`).
                </p>
              </div>
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar MCC (ex: 5411) ou segmento..."
                  value={mccSearch}
                  onChange={(e) => setMccSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
              {filteredMccs.map((m: any) => (
                <div
                  key={m.mcc}
                  className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between"
                >
                  <span className="font-mono font-bold text-amber-400 text-sm">MCC {m.mcc}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 font-medium">
                    {m.segment}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
