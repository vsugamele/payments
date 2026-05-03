"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scale, AlertTriangle, ShieldCheck, CheckCircle2, XCircle,
  Clock, FileText, Zap, ChevronRight, ArrowRight, Target,
  AlertOctagon, BookOpen, TrendingUp, Info, ExternalLink,
} from "lucide-react";
import disputeCodesData from "@/data/dispute-codes.json";
import Link from "next/link";

type DisputeCode = (typeof disputeCodesData)[0];

const CHANCE_CONFIG = {
  "Muito Baixa": { color: "#ef4444", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.25)", icon: XCircle,        pct: 10 },
  "Baixa":       { color: "#f97316", bg: "rgba(249,115,22,0.08)", border: "rgba(249,115,22,0.25)", icon: AlertTriangle, pct: 25 },
  "Média":       { color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.25)", icon: AlertOctagon,  pct: 55 },
  "Alta":        { color: "#10b981", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.25)", icon: CheckCircle2,  pct: 80 },
  "Muito Alta":  { color: "#6366f1", bg: "rgba(99,102,241,0.08)", border: "rgba(99,102,241,0.25)", icon: ShieldCheck,   pct: 95 },
};

const PRIORIDADE_CONFIG = {
  "CRÍTICA":          { color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
  "CRÍTICA (físico)": { color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
  "ALTA":             { color: "#f59e0b", bg: "rgba(245,158,11,0.10)" },
  "MÉDIA":            { color: "#6366f1", bg: "rgba(99,102,241,0.10)" },
};

interface Props {
  initialCode?: string; // ex: "4837" para deep-link do simulador
}

export default function AdvogadoDigitalClient({ initialCode }: Props) {
  const [selected, setSelected] = useState<DisputeCode>(
    disputeCodesData.find((d) => d.code === initialCode) ?? disputeCodesData[0]
  );
  const [activeTab, setActiveTab] = useState<"estrategia" | "evidencias" | "prevencao">("estrategia");
  const [valor, setValor] = useState(500);

  useEffect(() => {
    if (initialCode) {
      const found = disputeCodesData.find((d) => d.code === initialCode);
      if (found) setSelected(found);
    }
  }, [initialCode]);

  const chance = CHANCE_CONFIG[selected.chance_sucesso as keyof typeof CHANCE_CONFIG] ?? CHANCE_CONFIG["Média"];
  const ChanceIcon = chance.icon;
  const custoArbitragem = selected.arbitration_risk ?? 500;
  const roiPositivo = valor > custoArbitragem;
  const recoveryPct = selected.recovery_chance_pct ?? 50;

  return (
    <div className="space-y-6">

      {/* ── Alerta de IRD (quando vem do simulador) ──────────────────────────── */}
      {selected.alerta_ird && (
        <motion.div
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 p-4 rounded-xl border border-orange-500/30 bg-orange-500/5"
        >
          <AlertTriangle size={16} className="text-orange-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-orange-300 mb-0.5">
              IRD {selected.contexto_ird} detectado — Alto Risco
            </p>
            <p className="text-xs text-orange-400/80 leading-relaxed">{selected.alerta_ird}</p>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Coluna Esquerda: Seletor + Inputs ─────────────────────────────── */}
        <div className="space-y-4">

          {/* Seletor de Reason Code */}
          <div className="rounded-xl border border-slate-700 bg-slate-900/60 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-700 flex items-center gap-2">
              <Scale size={14} className="text-purple-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Reason Code</span>
            </div>
            <div className="p-2 space-y-1">
              {disputeCodesData.map((d) => {
                const isActive = d.code === selected.code;
                const cfg = CHANCE_CONFIG[d.chance_sucesso as keyof typeof CHANCE_CONFIG] ?? CHANCE_CONFIG["Média"];
                return (
                  <button
                    key={d.code}
                    onClick={() => { setSelected(d); setActiveTab("estrategia"); }}
                    className={`w-full text-left px-3 py-2.5 rounded-lg transition-all flex items-center gap-3 ${
                      isActive ? "bg-purple-500/10 border border-purple-500/30" : "hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cfg.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white">{d.code}</p>
                      <p className="text-xs text-slate-400 truncate">{d.name}</p>
                    </div>
                    {isActive && <ChevronRight size={12} className="text-purple-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Input de Valor */}
          <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-4 space-y-3">
            <p className="text-xs font-bold text-white uppercase tracking-wider">Valor do Chargeback (R$)</p>
            <input
              type="number"
              value={valor}
              onChange={(e) => setValor(Number(e.target.value) || 0)}
              className="input-base"
              placeholder="R$ 500,00"
            />
            {/* ROI Check */}
            <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg border ${
              roiPositivo
                ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
                : "bg-red-500/5 border-red-500/20 text-red-400"
            }`}>
              {roiPositivo ? <TrendingUp size={12} /> : <AlertTriangle size={12} />}
              <span className="font-medium">
                {roiPositivo
                  ? `Arbitragem pode ser válida (valor > USD ${custoArbitragem})`
                  : `Não levar à Arbitragem — taxa supera o valor`}
              </span>
            </div>
          </div>

          {/* Equivalência Cross-network */}
          <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Equivalência Cross-Network</p>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Mastercard RC</span>
                <span className="font-mono text-sm font-bold text-orange-400">{selected.code}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Visa VROL</span>
                <span className="font-mono text-sm font-bold text-blue-400">{selected.visa_equivalent}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Visa VCR Stage</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  selected.visa_stage === "Allocation"
                    ? "bg-red-500/10 text-red-400"
                    : "bg-blue-500/10 text-blue-400"
                }`}>{selected.visa_stage}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Coluna Central+Direita: Resultado do Advogado ─────────────────── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Header do Reason Code selecionado */}
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: chance.border }}>
            <div className="px-5 py-4" style={{ background: chance.bg }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-2xl font-black text-white">{selected.code}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{
                      background: `${chance.color}15`, color: chance.color, border: `1px solid ${chance.color}30`
                    }}>{selected.category}</span>
                  </div>
                  <p className="font-bold text-white text-sm mb-1">{selected.name}</p>
                  <p className="text-xs text-slate-400 leading-relaxed">{selected.description}</p>
                </div>
              </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-3 divide-x divide-slate-700 border-t border-slate-700">
              {/* Prazo */}
              <div className="px-4 py-3 flex flex-col items-center text-center">
                <Clock size={14} className="text-slate-500 mb-1" />
                <p className="text-xl font-black text-white">{selected.prazo_defesa_dias}</p>
                <p className="text-xs text-slate-400">dias p/ defesa</p>
              </div>
              {/* Chance */}
              <div className="px-4 py-3 flex flex-col items-center text-center">
                <ChanceIcon size={14} style={{ color: chance.color }} className="mb-1" />
                <p className="text-xl font-black" style={{ color: chance.color }}>{selected.chance_sucesso}</p>
                <p className="text-xs text-slate-400">chance de reverter</p>
              </div>
              {/* Success rate */}
              <div className="px-4 py-3 flex flex-col items-center text-center">
                <Target size={14} className="text-slate-500 mb-1" />
                <p className="text-xl font-black text-white">{recoveryPct}%</p>
                <p className="text-xs text-slate-400">taxa de reversão</p>
              </div>
            </div>

            {/* Barra de progresso de chance */}
            <div className="px-5 pb-4 pt-2">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Taxa de Reversão Estimada</span>
                <span style={{ color: chance.color }}>{recoveryPct}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${recoveryPct}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${chance.color}80, ${chance.color})` }}
                />
              </div>
            </div>
          </div>

          {/* Causa Raiz */}
          <div className="flex items-start gap-3 px-4 py-3 rounded-xl border border-slate-700 bg-slate-900/40">
            <Info size={14} className="text-blue-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-blue-300 mb-0.5">Causa Raiz</p>
              <p className="text-xs text-slate-400 leading-relaxed">{selected.causa_raiz}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="rounded-xl border border-slate-700 bg-slate-900/60 overflow-hidden">
            {/* Tab header */}
            <div className="flex border-b border-slate-700">
              {[
                { id: "estrategia", label: "Estratégia de Defesa", icon: Zap },
                { id: "evidencias", label: "Evidências", icon: FileText },
                { id: "prevencao", label: "Prevenção", icon: ShieldCheck },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as typeof activeTab)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-3 text-xs font-bold transition-colors ${
                    activeTab === id
                      ? "bg-purple-500/10 text-purple-300 border-b-2 border-purple-500"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Icon size={12} /> {label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="p-5"
              >
                {/* Estratégia */}
                {activeTab === "estrategia" && (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-300 leading-relaxed">{selected.estrategia_defesa}</p>
                    <div>
                      <p className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                        Ações Imediatas (nas próximas 48h)
                      </p>
                      <div className="space-y-2">
                        {selected.acoes_imediatas.map((acao, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                            <div className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                              {i + 1}
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed">{acao}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Manual Reference */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-orange-500/20 bg-orange-500/5 text-orange-400">
                        <BookOpen size={11} /> MC: {selected.manual.split("—")[1]?.trim()}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-blue-500/20 bg-blue-500/5 text-blue-400">
                        <BookOpen size={11} /> Visa: {selected.visa_manual.split("—")[1]?.trim()}
                      </span>
                    </div>
                  </div>
                )}

                {/* Evidências */}
                {activeTab === "evidencias" && (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-400 leading-relaxed mb-4">{selected.doc_required}</p>
                    {selected.compelling_evidence.map((ev, i) => {
                      const pCfg = PRIORIDADE_CONFIG[ev.prioridade as keyof typeof PRIORIDADE_CONFIG] ?? PRIORIDADE_CONFIG["MÉDIA"];
                      return (
                        <div key={i} className="p-4 rounded-xl border border-slate-700 bg-slate-800/40 space-y-2">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <FileText size={14} className="text-blue-400 shrink-0" />
                              <p className="text-sm font-bold text-white">{ev.name}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: pCfg.bg, color: pCfg.color }}>
                                {ev.prioridade}
                              </span>
                              <span className="font-mono text-xs px-1.5 py-0.5 rounded border border-slate-600 bg-slate-700 text-slate-300">
                                {ev.type}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed">{ev.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Prevenção */}
                {activeTab === "prevencao" && (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                      <ShieldCheck size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                      <p className="text-sm text-emerald-300 leading-relaxed">{selected.prevencao}</p>
                    </div>
                    {/* CTA para o simulador se canal HU */}
                    {selected.contexto_ird === "HU" && (
                      <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5">
                        <p className="text-xs font-bold text-blue-300 mb-2 flex items-center gap-1.5">
                          <Zap size={12} /> Simule o impacto financeiro do 3DS
                        </p>
                        <p className="text-xs text-slate-400 leading-relaxed mb-3">
                          Ative o 3DS e compare o custo total HU vs AU no simulador — incluindo o Non-Auth Fee 2AB3006 que deixa de ser cobrado.
                        </p>
                        <Link
                          href="/simulador?bandeira=mastercard&canal=ecommerce_3ds"
                          className="inline-flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 transition-colors"
                        >
                          <ArrowRight size={12} /> Simular HU vs AU no Simulador
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
