"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Terminal, AlertTriangle, DollarSign, Info, ArrowRightLeft, ShieldAlert, Zap, Calculator, TrendingUp, Tag
} from "lucide-react";
import mcbsEvents from "@/data/mcbs-events.json";

// Categoria → cor
const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  Authorization: { bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.25)", text: "#60a5fa" },
  Security:      { bg: "rgba(139,92,246,0.08)", border: "rgba(139,92,246,0.25)", text: "#a78bfa" },
  Network:       { bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.25)", text: "#34d399" },
  Penalties:     { bg: "rgba(239,68,68,0.08)",  border: "rgba(239,68,68,0.25)",  text: "#f87171" },
  "Cross-Border":{ bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.25)", text: "#fbbf24" },
  Tokenization:  { bg: "rgba(99,102,241,0.08)", border: "rgba(99,102,241,0.25)", text: "#818cf8" },
  Disputes:      { bg: "rgba(249,115,22,0.08)", border: "rgba(249,115,22,0.25)", text: "#fb923c" },
  Services:      { bg: "rgba(20,184,166,0.08)", border: "rgba(20,184,166,0.25)", text: "#2dd4bf" },
};

// Categorias únicas para filtro
const ALL_CATEGORIES = ["Todos", ...Array.from(new Set(mcbsEvents.map(e => e.category)))];

export default function McbsTranslator() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCat, setFilterCat] = useState("Todos");

  // Calculadora QMR
  const [gdvUsd, setGdvUsd] = useState(100000);
  const [qmrRate, setQmrRate] = useState(5.42);

  const gdvBrl = (gdvUsd * qmrRate).toFixed(2);
  const feeEstimate = ((gdvUsd * qmrRate) * 0.00085).toFixed(2); // ~0.085% network fee

  const filteredEvents = useMemo(() => {
    let list = mcbsEvents;
    if (filterCat !== "Todos") list = list.filter(e => e.category === filterCat);
    if (searchTerm) list = list.filter(e =>
      e.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return list;
  }, [searchTerm, filterCat]);

  return (
    <div className="space-y-8">
      {/* ── Regra de Câmbio QMR ── */}
      <section className="p-8 rounded-[2.5rem] bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <ArrowRightLeft size={28} />
          </div>
          <div className="flex-1 space-y-2">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              A Regra de Ouro do Câmbio MCBS
              <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-mono uppercase tracking-widest">QMR Rate</span>
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              As faturas Mastercard são geradas em <strong>USD (GDV)</strong>. A conversão para BRL usa a <strong>Taxa Média do Trimestre</strong> reportada no <strong>QMR (Quarterly Mastercard Report)</strong> — não o PTAX do dia. Isso gera uma defasagem planejada no custo real.
            </p>
          </div>
        </div>

        {/* ── Calculadora QMR interativa ── */}
        <div className="mt-6 p-6 rounded-2xl bg-black/30 border border-amber-500/10 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Calculator size={16} className="text-amber-400" />
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Calculadora QMR — Projeção de Custo BRL</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">GDV (USD)</label>
              <input
                type="number"
                value={gdvUsd}
                onChange={e => setGdvUsd(Number(e.target.value))}
                className="w-full bg-[#05080f] border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm font-mono focus:border-amber-500 outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Taxa QMR (BRL/USD)</label>
              <input
                type="number"
                step="0.01"
                value={qmrRate}
                onChange={e => setQmrRate(Number(e.target.value))}
                className="w-full bg-[#05080f] border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm font-mono focus:border-amber-500 outline-none transition-colors"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
              <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1">GDV em BRL</p>
              <p className="text-2xl font-black text-white">R$ {Number(gdvBrl).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-center">
              <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mb-1">Fee Network Est. (0.085%)</p>
              <p className="text-2xl font-black text-white">R$ {Number(feeEstimate).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
          <p className="text-[10px] text-slate-600 text-center">* Estimativa baseada em taxa média de Network Access Fee. Valores reais variam por contrato.</p>
        </div>
      </section>

      {/* ── Tradutor / Decoder ── */}
      <section className="relative p-8 rounded-[3rem] bg-[#0a1120] border border-orange-500/20 overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Terminal size={140} className="text-orange-500" />
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-black text-white tracking-tight mb-2 flex items-center gap-3">
            <Zap className="text-orange-500" /> MCBS Billing Event Decoder
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            A Mastercard não cobra apenas transações — ela cobra <strong>eventos</strong>. Busque pelo código ou descrição.
          </p>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Ex: 2AB1001, Cut-off, Authorization..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-[#05080f] border border-slate-800 rounded-[2rem] py-3.5 pl-12 pr-5 text-white focus:border-orange-500 outline-none transition-all placeholder:text-slate-700"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {ALL_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCat(cat)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all border ${
                  filterCat === cat
                    ? "bg-orange-600 border-orange-500 text-white"
                    : "bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Contador */}
        {(searchTerm || filterCat !== "Todos") && (
          <p className="text-[11px] text-slate-500 mb-4">{filteredEvents.length} evento(s) encontrado(s)</p>
        )}

        {/* Grid de cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredEvents.length > 0 ? filteredEvents.map((e, idx) => {
              const colors = CATEGORY_COLORS[e.category] ?? { bg: "rgba(100,116,139,0.08)", border: "rgba(100,116,139,0.25)", text: "#94a3b8" };
              const isPenalty = e.category === "Penalties";
              return (
                <motion.div
                  key={e.event}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: Math.min(idx * 0.04, 0.3) }}
                  className="group p-5 rounded-3xl border hover:border-opacity-60 transition-all"
                  style={{ background: colors.bg, borderColor: colors.border }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="px-2.5 py-1 rounded-lg font-mono text-sm font-bold" style={{ background: `${colors.text}18`, color: colors.text, border: `1px solid ${colors.text}30` }}>
                      {e.event}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {isPenalty && <AlertTriangle size={12} className="text-red-400" />}
                      <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: colors.text }}>{e.category}</span>
                    </div>
                  </div>
                  <h4 className="text-sm font-bold text-white mb-2">{e.name}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed mb-3">{e.description}</p>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-xl border" style={{ color: colors.text, background: `${colors.text}08`, borderColor: `${colors.text}20` }}>
                    <TrendingUp size={11} />
                    IMPACTO: {e.impact}
                  </div>
                </motion.div>
              );
            }) : !searchTerm && filterCat === "Todos" ? (
              // Estado inicial: mostrar categorias como preview, não cards fantasma
              <div className="col-span-full">
                <p className="text-xs text-slate-500 mb-4 text-center">Selecione uma categoria ou busque um evento:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(CATEGORY_COLORS).map(([cat, colors]) => {
                    const count = mcbsEvents.filter(e => e.category === cat).length;
                    return (
                      <button
                        key={cat}
                        onClick={() => setFilterCat(cat)}
                        className="p-4 rounded-2xl border text-left transition-all hover:scale-105"
                        style={{ background: colors.bg, borderColor: colors.border }}
                      >
                        <Tag size={14} style={{ color: colors.text }} className="mb-2" />
                        <p className="text-xs font-bold" style={{ color: colors.text }}>{cat}</p>
                        <p className="text-[10px] text-slate-600 mt-0.5">{count} evento{count !== 1 ? "s" : ""}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="col-span-full py-10 text-center">
                <p className="text-slate-500 text-sm">Nenhum evento encontrado para &quot;{searchTerm}&quot;</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ── Multas Dolorosas ── */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-7 rounded-[2.5rem] bg-red-500/5 border border-red-500/10 space-y-4">
          <div className="flex items-center gap-3 text-red-400">
            <ShieldAlert size={20} />
            <h3 className="text-sm font-bold uppercase tracking-widest">Alerta: Multas Recorrentes</h3>
          </div>
          {[
            { code: "2PN1011", title: "Cut-off Fail", desc: "Perder a janela de envio do GCMS pode custar até $10.000 USD/arquivo atrasado. Acumula mensalmente." },
            { code: "2PN1005", title: "Excessive Auth Attempts", desc: "Adquirentes que permitem ataques ou loops de retry sem bloqueio pagam multas automáticas na invoice." },
            { code: "2CB1010", title: "Arbitration Fee", desc: "$500 USD por arbitration perdida no Mastercom. Incentivo para resolver antes de escalar." },
          ].map(item => (
            <div key={item.code} className="p-4 rounded-2xl bg-[#0a1120] border border-red-500/20">
              <p className="text-xs font-bold text-white mb-1"><span className="text-red-400 font-mono">{item.code}</span> — {item.title}</p>
              <p className="text-[11px] text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="p-7 rounded-[2.5rem] bg-blue-500/5 border border-blue-500/10 flex flex-col justify-center text-center space-y-4">
          <DollarSign className="text-blue-400 mx-auto" size={40} />
          <h3 className="text-lg font-bold text-white">Auditoria de Fatura</h3>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
            Uma transação de R$ 100 pode gerar até <strong>5 eventos diferentes</strong> de billing MCBS. Auditá-los é a diferença entre lucro e prejuízo na adquirência.
          </p>
          <div className="flex items-center justify-center gap-2 text-[11px] text-blue-300 bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-2">
            <Info size={13} />
            Use a Calculadora QMR acima para projetar custos reais em BRL.
          </div>
        </div>
      </section>
    </div>
  );
}
