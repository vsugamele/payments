"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import disputeCodes from "@/data/dispute-codes.json";
import {
  ChevronLeft, Shield, ShieldAlert, AlertTriangle, CheckCircle2,
  FileText, Zap, TrendingDown, Clock, Scale, Filter, Search, X,
  BarChart3, Gavel, AlertOctagon
} from "lucide-react";

type DisputeCode = typeof disputeCodes[number];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CHANCE_CONFIG: Record<string, { color: string; bg: string; bar: number; icon: typeof Shield }> = {
  "Muito Baixa": { color: "#ef4444", bg: "rgba(239,68,68,0.1)",  bar: 10, icon: ShieldAlert },
  "Baixa":       { color: "#f97316", bg: "rgba(249,115,22,0.1)", bar: 30, icon: ShieldAlert },
  "Média":       { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", bar: 55, icon: Shield },
  "Alta":        { color: "#10b981", bg: "rgba(16,185,129,0.1)", bar: 80, icon: CheckCircle2 },
  "Muito Alta":  { color: "#4ade80", bg: "rgba(74,222,128,0.1)", bar: 95, icon: CheckCircle2 },
};

const CAT_COLOR: Record<string, string> = {
  "Fraud":            "#ef4444",
  "Consumer Dispute": "#f59e0b",
  "Processing Error": "#10b981",
  "Authorization":    "#6366f1",
  "Liability":        "#a78bfa",
};

const PRIORITY_COLOR: Record<string, { color: string; bg: string }> = {
  "CRÍTICA":       { color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
  "CRÍTICA (físico)": { color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
  "ALTA":          { color: "#f59e0b", bg: "rgba(245,158,11,0.10)" },
  "MÉDIA":         { color: "#60a5fa", bg: "rgba(96,165,250,0.10)" },
};

// ─── Sub-Components ───────────────────────────────────────────────────────────

function WinGauge({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Taxa de Reversão Est.</span>
        <span className="font-black text-sm font-mono" style={{ color }}>{pct}%</span>
      </div>
      <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}80, ${color})` }}
        />
      </div>
    </div>
  );
}

function EvidenceCard({ ev }: { ev: { name: string; type: string; prioridade: string; desc: string } }) {
  const pri = PRIORITY_COLOR[ev.prioridade] ?? { color: "#64748b", bg: "rgba(100,116,139,0.1)" };
  return (
    <div className="p-3 rounded-xl border space-y-2" style={{ background: pri.bg, borderColor: `${pri.color}30` }}>
      <div className="flex items-start justify-between gap-2">
        <span className="text-[11px] font-bold text-white leading-tight">{ev.name}</span>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[9px] font-black px-1.5 py-0.5 rounded uppercase" style={{ color: pri.color, background: `${pri.color}20` }}>
            {ev.prioridade}
          </span>
          <span className="text-[9px] font-mono text-slate-500 bg-black/30 px-1.5 py-0.5 rounded">{ev.type}</span>
        </div>
      </div>
      <p className="text-[10px] text-slate-400 leading-relaxed">{ev.desc}</p>
    </div>
  );
}

function CodeCard({ code, isSelected, onClick }: { code: DisputeCode; isSelected: boolean; onClick: () => void }) {
  const cfg = CHANCE_CONFIG[code.chance_sucesso] ?? CHANCE_CONFIG["Média"];
  const catColor = CAT_COLOR[code.category] ?? "#64748b";
  const Icon = cfg.icon;

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl group"
      style={{
        background: isSelected ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.02)",
        borderColor: isSelected ? catColor : "#0f172a",
        boxShadow: isSelected ? `0 0 0 1px ${catColor}40, 0 8px 32px ${catColor}15` : "none",
      }}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="p-2 rounded-xl shrink-0" style={{ background: cfg.bg }}>
          <Icon size={16} style={{ color: cfg.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className="font-black text-white font-mono text-sm">{code.code}</span>
            {code.visa_equivalent && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20">
                ≈ Visa {code.visa_equivalent}
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 leading-tight line-clamp-1">{code.name}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-[10px]">
          <span className="px-1.5 py-0.5 rounded font-bold" style={{ color: catColor, background: `${catColor}15` }}>
            {code.category}
          </span>
          <span className="flex items-center gap-1 text-slate-500">
            <Clock size={9} /> D+{code.prazo_defesa_dias}
          </span>
        </div>
        <WinGauge pct={code.recovery_chance_pct} color={cfg.color} />
      </div>
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ReasonCodeMatrix() {
  const [selected, setSelected] = useState<DisputeCode | null>(null);
  const [query, setQuery] = useState("");
  const [filterCat, setFilterCat] = useState<string | null>(null);
  const [filterBandeira, setFilterBandeira] = useState<"all" | "mastercard" | "visa">("all");

  const categories = Array.from(new Set(disputeCodes.map(c => c.category)));

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return disputeCodes.filter(c => {
      const matchCat = filterCat ? c.category === filterCat : true;
      const matchBandeira = filterBandeira === "all" ? true :
        filterBandeira === "mastercard" ? c.bandeira === "Mastercard" : c.bandeira === "Visa";
      if (!q) return matchCat && matchBandeira;
      return matchCat && matchBandeira && (
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        (c.visa_equivalent ?? "").toLowerCase().includes(q)
      );
    });
  }, [query, filterCat, filterBandeira]);

  const sel = selected;
  const selCfg = sel ? (CHANCE_CONFIG[sel.chance_sucesso] ?? CHANCE_CONFIG["Média"]) : null;

  return (
    <div className="min-h-screen pb-20" style={{ background: "#030711" }}>

      {/* Header */}
      <div className="border-b border-[#0f1a2e] py-10 px-6" style={{
        background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(239,68,68,0.10) 0%, transparent 65%)",
      }}>
        <div className="mx-auto max-w-6xl">
          <Link href="/compliance/disputas" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-6 transition-colors">
            <ChevronLeft size={16} /> Voltar às Disputas
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <Gavel size={22} className="text-red-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-1">Matriz Interativa</p>
              <h1 className="text-2xl font-bold text-white" style={{ letterSpacing: "-0.02em" }}>
                Reason Codes de Chargeback
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Selecione um código para ver estratégia de defesa, checklist de evidências e probabilidade de vitória.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 pt-8">

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center mb-6">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar por código, nome…"
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none focus:border-white/20 transition-colors"
            />
            {query && (
              <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Network toggle */}
          <div className="flex p-1 bg-black/40 border border-white/10 rounded-xl gap-1">
            {(["all", "mastercard", "visa"] as const).map(b => (
              <button
                key={b}
                onClick={() => setFilterBandeira(b)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                style={{
                  background: filterBandeira === b ? (b === "mastercard" ? "#ef444430" : b === "visa" ? "#3b82f630" : "#ffffff15") : "transparent",
                  color: filterBandeira === b ? (b === "mastercard" ? "#f87171" : b === "visa" ? "#60a5fa" : "#fff") : "#64748b",
                }}
              >
                {b === "all" ? "Todas" : b === "mastercard" ? "Mastercard" : "Visa"}
              </button>
            ))}
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap gap-1.5">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCat(filterCat === cat ? null : cat)}
                className="px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all"
                style={{
                  color: filterCat === cat ? CAT_COLOR[cat] : "#475569",
                  borderColor: filterCat === cat ? `${CAT_COLOR[cat]}50` : "#1e293b",
                  background: filterCat === cat ? `${CAT_COLOR[cat]}15` : "#050b18",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Main layout: grid + detail panel */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Card grid */}
          <div className="lg:col-span-2 space-y-3">
            <p className="text-[11px] text-slate-600 mb-3 font-bold uppercase tracking-widest">
              {filtered.length} código{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
            </p>
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-slate-600">
                <Search size={32} className="mx-auto mb-3 opacity-40" />
                <p className="text-sm">Nenhum código encontrado.</p>
              </div>
            ) : (
              filtered.map(code => (
                <CodeCard
                  key={code.code}
                  code={code}
                  isSelected={selected?.code === code.code}
                  onClick={() => setSelected(selected?.code === code.code ? null : code)}
                />
              ))
            )}
          </div>

          {/* Detail Panel */}
          <div className="lg:col-span-3">
            {!sel ? (
              <div className="sticky top-8 flex flex-col items-center justify-center h-80 rounded-2xl border border-dashed border-white/10 text-slate-600">
                <Gavel size={40} className="mb-4 opacity-30" />
                <p className="text-sm font-bold">Selecione um Reason Code</p>
                <p className="text-xs mt-1 opacity-60">para ver a estratégia completa de defesa</p>
              </div>
            ) : (
              <div className="sticky top-8 space-y-4">

                {/* Header Card */}
                <div
                  className="rounded-2xl p-6 border"
                  style={{ background: `${CAT_COLOR[sel.category] ?? "#64748b"}08`, borderColor: `${CAT_COLOR[sel.category] ?? "#64748b"}25` }}
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-black text-white text-2xl font-mono">{sel.code}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ color: CAT_COLOR[sel.category], background: `${CAT_COLOR[sel.category]}20` }}>
                          {sel.category}
                        </span>
                        {sel.visa_equivalent && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-blue-500/15 text-blue-400 border border-blue-500/20">
                            Visa {sel.visa_equivalent} ({sel.visa_stage})
                          </span>
                        )}
                      </div>
                      <h2 className="text-lg font-bold text-white">{sel.name}</h2>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[10px] text-slate-500 uppercase font-bold">Prazo Defesa</p>
                      <p className="text-xl font-black text-white">D+{sel.prazo_defesa_dias}</p>
                    </div>
                  </div>

                  <WinGauge pct={sel.recovery_chance_pct} color={selCfg!.color} />

                  <div className="mt-3 flex items-center gap-2 text-xs px-3 py-2 rounded-lg" style={{ background: `${selCfg!.color}12`, border: `1px solid ${selCfg!.color}25` }}>
                    <BarChart3 size={13} style={{ color: selCfg!.color }} className="shrink-0" />
                    <span style={{ color: selCfg!.color }} className="font-bold">Probabilidade: {sel.chance_sucesso}</span>
                  </div>
                </div>

                {/* IRD Alert */}
                {sel.alerta_ird && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 space-y-1.5">
                    <p className="text-[10px] font-black text-red-400 uppercase tracking-widest flex items-center gap-1.5">
                      <AlertOctagon size={12} /> Alerta IRD — {sel.contexto_ird}
                    </p>
                    <p className="text-[11px] text-slate-300 leading-relaxed">{sel.alerta_ird}</p>
                  </div>
                )}

                {/* Causa + Estratégia */}
                <div className="rounded-xl border border-white/8 bg-white/3 p-4 space-y-3">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Causa Raiz</p>
                    <p className="text-sm text-slate-300 leading-relaxed">{sel.causa_raiz}</p>
                  </div>
                  <div className="border-t border-white/5 pt-3">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Estratégia de Defesa</p>
                    <p className="text-sm text-slate-300 leading-relaxed">{sel.estrategia_defesa}</p>
                  </div>
                </div>

                {/* Evidências */}
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    <FileText size={11} /> Compelling Evidence — por Prioridade
                  </p>
                  {sel.compelling_evidence.map((ev, i) => (
                    <EvidenceCard key={i} ev={ev} />
                  ))}
                </div>

                {/* Ações Imediatas */}
                <div className="p-4 rounded-xl bg-indigo-500/8 border border-indigo-500/20 space-y-3">
                  <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Zap size={11} /> Ações Imediatas (Primeiras 24h)
                  </p>
                  <div className="space-y-2">
                    {sel.acoes_imediatas.map((a, i) => (
                      <div key={i} className="flex items-start gap-2 text-[11px] text-slate-300">
                        <span className="w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[9px] font-black shrink-0 mt-0.5">{i + 1}</span>
                        {a}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Prevenção */}
                <div className="p-4 rounded-xl bg-emerald-500/8 border border-emerald-500/20">
                  <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <CheckCircle2 size={11} /> Prevenção Definitiva
                  </p>
                  <p className="text-[11px] text-slate-300 leading-relaxed">{sel.prevencao}</p>
                </div>

                {/* Arbitration Cost */}
                <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Scale size={16} className="text-red-400" />
                    <div>
                      <p className="text-[10px] font-bold text-red-400 uppercase">Risco de Arbitragem</p>
                      <p className="text-[10px] text-slate-500">Filing + Review Fee</p>
                    </div>
                  </div>
                  <span className="font-black text-lg text-red-400 font-mono">USD {sel.arbitration_risk.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
