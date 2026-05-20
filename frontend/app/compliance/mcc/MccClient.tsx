"use client";

import React, { useState, useMemo } from "react";
import mccData from "@/data/mcc-list.json";
import AIAssistant from "@/components/AIAssistant";
import { AlertTriangle, ShieldAlert, Calculator, ExternalLink, Info, CheckCircle2, ListFilter, X, Search } from "lucide-react";
import Link from "next/link";
import TermTooltip from "@/components/TermTooltip";

type MccEntry = typeof mccData[number];

const ALL_CATS = Array.from(new Set(mccData.map((m) => m.categoria).filter(Boolean))).sort();

const TCC_LABEL: Record<string, string> = {
  A: "Auto/Vehicle Rental",
  F: "Food & Restaurant",
  H: "Hotel/Motel",
  L: "Liquor Store",
  O: "Oil Company",
  R: "Retail",
  T: "Travel Agency",
  U: "Unknown",
  X: "Transport/Airline",
};

function pad(n: number) {
  return String(n).padStart(4, "0");
}

const HIGH_RISK_MCCS = new Set([
  7995, 5967, 5912, 5966, 5962, 6051, 4829, 5993, 7273,
]);

// ─── MCC Intelligence Map (Interchange + Monitoring Programs) ─────────────────
type MccIntel = {
  interchange: { network: string; product: string; rate: string; condition: string }[];
  programs: { name: string; threshold: string; color: string; desc: string }[];
  chargebackRisk: "Muito Baixo" | "Baixo" | "Médio" | "Alto" | "Crítico";
  highTicketThreshold?: string;
  notes?: string;
};

const MCC_INTEL: Record<number, MccIntel> = {
  5411: {
    interchange: [
      { network: "Visa", product: "Visa Classic (CP)", rate: "1.65% + R$0.05", condition: "Chip + PIN" },
      { network: "Visa", product: "Visa Infinite (CP)", rate: "1.85% + R$0.05", condition: "Chip ou NFC" },
      { network: "Mastercard", product: "Mastercard Standard (CP)", rate: "1.70%", condition: "EMV present" },
    ],
    programs: [{ name: "VAMP", threshold: "CB > 0.75%", color: "#f59e0b", desc: "Monitoramento padrão Visa." }],
    chargebackRisk: "Baixo",
    notes: "Grocery recebe tarifa subsidiada por ser categoria de necessidade básica. Transações Chip têm taxa preferencial.",
  },
  5812: {
    interchange: [
      { network: "Visa", product: "Visa Classic (CP)", rate: "1.80%", condition: "Qualquer terminal EMV" },
      { network: "Mastercard", product: "MC Standard (CP)", rate: "1.80%", condition: "Terminal PCI aprovado" },
      { network: "Visa", product: "Visa Classic (CNP)", rate: "2.15%", condition: "E-commerce sem 3DS" },
    ],
    programs: [{ name: "VAMP", threshold: "CB > 0.75%", color: "#f59e0b", desc: "Monitoramento padrão." }],
    chargebackRisk: "Baixo",
    notes: "Restaurantes têm baixo risco de fraude por serem tipicamente presenciais.",
  },
  5814: {
    interchange: [
      { network: "Visa", product: "Visa Classic (CP)", rate: "1.55%", condition: "Transação EMV contactless" },
      { network: "Mastercard", product: "MC Standard (CP)", rate: "1.55%", condition: "Contactless habilitado" },
    ],
    programs: [{ name: "VAMP", threshold: "CB > 0.75%", color: "#f59e0b", desc: "Monitoramento padrão." }],
    chargebackRisk: "Muito Baixo",
    notes: "Fast food tem o menor MDR por TCC F e ticket médio baixo. Beneficia-se muito do Small Ticket.",
  },
  7995: {
    interchange: [
      { network: "Visa", product: "Qualquer produto", rate: "Negado*", condition: "Depende de licença especial" },
      { network: "Mastercard", product: "Qualquer produto", rate: "2.90%+", condition: "Sujeito a aprovação BRAM" },
    ],
    programs: [
      { name: "BRAM", threshold: "Inspeção periódica", color: "#ef4444", desc: "Programa de alto risco Mastercard. Requer EDD e relatório mensal." },
      { name: "VIRP", threshold: "CB > 1%", color: "#ef4444", desc: "Programa de integridade Visa para apostas." },
      { name: "ECP", threshold: "CB > 1.5%", color: "#dc2626", desc: "Excessive Chargeback Program — multa de USD 50/CB." },
    ],
    chargebackRisk: "Crítico",
    highTicketThreshold: "USD 500",
    notes: "Requer licença de jogo válida e aprovação da bandeira ANTES de transacionar. Não há Liability Shift sem 3DS.",
  },
  6051: {
    interchange: [
      { network: "Mastercard", product: "Quasi-Cash Standard", rate: "Isento*", condition: "TCC U — sem MDR padrão" },
      { network: "Visa", product: "Cash-Like Txn", rate: "Flat fee", condition: "Aprovação Visa obrigatória" },
    ],
    programs: [
      { name: "BRAM", threshold: "Revisão obrigatória", color: "#ef4444", desc: "Crypto/exchanges são monitorados como Quasi-Cash." },
      { name: "VIRP", threshold: "CB > 1%", color: "#ef4444", desc: "Monitoramento de integridade Visa." },
    ],
    chargebackRisk: "Crítico",
    notes: "Transações Quasi-Cash não participam de programas de recompensa. Limite de R$500 por transação em alguns emissores.",
  },
  5912: {
    interchange: [
      { network: "Visa", product: "Visa Classic (CNP)", rate: "2.20%", condition: "E-commerce requer 3DS" },
      { network: "Mastercard", product: "MC Standard (CNP)", rate: "2.25%", condition: "3DS obrigatório" },
    ],
    programs: [
      { name: "BRAM", threshold: "Supervisão anual", color: "#ef4444", desc: "Farmácias são monitoradas por risco de fraude em medicamentos controlados." },
    ],
    chargebackRisk: "Alto",
    notes: "Medicamentos de venda livre têm MDR padrão. Prescrição controlada requer controles adicionais de KYC.",
  },
  4829: {
    interchange: [
      { network: "Mastercard", product: "MC Send / AFT", rate: "Invertido: receita de $0.05", condition: "OCT com TTI correto" },
      { network: "Visa", product: "Visa Direct OCT", rate: "Invertido: receita de $0.10", condition: "BAI = FT, GP, etc." },
    ],
    programs: [
      { name: "BRAM", threshold: "Revisão obrigatória", color: "#ef4444", desc: "Money Transfer é um dos 5 MCCs de maior risco BRAM/MATCH." },
      { name: "AML Monitor", threshold: "Transações > USD 1000", color: "#dc2626", desc: "Reportável ao COAF/FinCEN conforme regulação local." },
    ],
    chargebackRisk: "Crítico",
    highTicketThreshold: "USD 1.000",
    notes: "O Intercâmbio em OCTs é INVERTIDO — o adquirente recebe, não paga. Oportunidade de receita para programas de Gig Economy.",
  },
  4511: {
    interchange: [
      { network: "Visa", product: "Visa Business (CNP)", rate: "2.05%", condition: "3DS preferencial" },
      { network: "Mastercard", product: "World Elite (CNP)", rate: "2.15%", condition: "UCAF preenchido" },
    ],
    programs: [{ name: "VAMP", threshold: "CB > 0.75%", color: "#f59e0b", desc: "Airlines têm monitoramento padrão mas alto ticket." }],
    chargebackRisk: "Médio",
    highTicketThreshold: "USD 2.500",
    notes: "Airlines têm alto ticket. Transações acima de USD 2.500 ativam controles adicionais no emissor. Recomendado 3DS2.",
  },
  5966: {
    interchange: [
      { network: "Visa", product: "Visa Classic (CNP)", rate: "2.30%", condition: "3DS2 obrigatório" },
      { network: "Mastercard", product: "MC Standard (CNP)", rate: "2.35%", condition: "UCAF = 2 obrigatório" },
    ],
    programs: [
      { name: "BRAM", threshold: "Revisão trimestral", color: "#ef4444", desc: "Direct Marketing é categoria de risco elevado por alta incidência de disputa." },
      { name: "ECP", threshold: "CB > 1.5%", color: "#dc2626", desc: "Programa de Excessive Chargeback — penalidade financeira crescente." },
    ],
    chargebackRisk: "Alto",
    notes: "Direct Marketing requer 3DS2 em 100% das transações CNP. Sem 3DS não há Liability Shift — o adquirente assume o risco.",
  },
};


const RISK_COLOR: Record<string, { color: string; bg: string }> = {
  "Muito Baixo": { color: "#4ade80", bg: "rgba(74,222,128,0.1)" },
  "Baixo":       { color: "#60a5fa", bg: "rgba(96,165,250,0.1)" },
  "Médio":       { color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  "Alto":        { color: "#f97316", bg: "rgba(249,115,22,0.1)" },
  "Crítico":     { color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
};

function highlight(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase().trim());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-primary/20 text-primary rounded-sm px-0.5">{text.slice(idx, idx + query.trim().length)}</mark>
      {text.slice(idx + query.trim().length)}
    </>
  );
}

function MccDetails({ mcc, onClose }: { mcc: MccEntry; onClose: () => void }) {
  const isHighRisk = HIGH_RISK_MCCS.has(mcc.mcc);
  const intel = MCC_INTEL[mcc.mcc] ?? null;
  const riskCfg = intel ? (RISK_COLOR[intel.chargebackRisk] ?? RISK_COLOR["Médio"]) : null;
  
  return (
    <div className="bg-code-bg border border-primary/30 rounded-2xl p-6 space-y-6 animate-in slide-in-from-right-4 duration-300">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${isHighRisk ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'}`}>
            {isHighRisk ? <ShieldAlert size={24} /> : <Info size={24} />}
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2 flex-wrap">
              MCC {String(mcc.mcc).padStart(4, "0")} 
              {isHighRisk && <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full border border-red-500/30 uppercase tracking-widest font-black">High Risk</span>}
              {intel && <span className="text-[10px] px-2 py-0.5 rounded-full border font-black uppercase tracking-widest" style={{ color: riskCfg!.color, background: riskCfg!.bg, borderColor: `${riskCfg!.color}30` }}>CB Risco: {intel.chargebackRisk}</span>}
            </h2>
            <p className="text-sm text-muted-foreground">{mcc.nome}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg text-muted-foreground"><X size={20} /></button>
      </div>

      {/* High Ticket Alert */}
      {intel?.highTicketThreshold && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
          <AlertTriangle size={16} className="text-amber-400 shrink-0" />
          <p className="text-xs text-amber-300">
            <span className="font-bold">High Ticket ativo:</span> Transações acima de <span className="font-mono font-black">{intel.highTicketThreshold}</span> ativam controles adicionais no emissor e requerem 3DS2 obrigatório.
          </p>
        </div>
      )}

      {/* Intelligence Grid */}
      {intel ? (
        <div className="space-y-4">

          {/* Interchange Rates Table */}
          <div className="bg-background/50 border border-border rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-emerald-500/5">
              <Calculator size={14} className="text-emerald-400" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-400">Faixas de Intercâmbio — por Produto</h3>
            </div>
            <div className="divide-y divide-border/30">
              {intel.interchange.map((row, i) => (
                <div key={i} className="grid grid-cols-4 gap-2 px-4 py-2.5 text-[11px] hover:bg-white/3 transition-colors">
                  <span className="font-bold text-white">{row.network}</span>
                  <span className="text-slate-400 col-span-1 truncate">{row.product}</span>
                  <span className="font-mono font-black text-emerald-400">{row.rate}</span>
                  <span className="text-slate-500 text-[10px] truncate">{row.condition}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Monitoring Programs */}
          <div className="bg-background/50 border border-border rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-red-500/5">
              <ShieldAlert size={14} className="text-red-400" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-red-400">Programas de Monitoramento Ativos</h3>
            </div>
            <div className="p-3 space-y-2">
              {intel.programs.map((prog, i) => (
                <div key={i} className="flex items-start gap-3 p-2 rounded-lg" style={{ background: `${prog.color}08`, border: `1px solid ${prog.color}20` }}>
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded shrink-0 mt-0.5 font-mono" style={{ color: prog.color, background: `${prog.color}20` }}>{prog.name}</span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold" style={{ color: prog.color }}>{prog.threshold}</p>
                    <p className="text-[10px] text-slate-500 leading-snug mt-0.5">{prog.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          {intel.notes && (
            <div className="p-3 rounded-xl bg-indigo-500/8 border border-indigo-500/20 flex gap-2">
              <CheckCircle2 size={14} className="text-indigo-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-300 leading-relaxed">{intel.notes}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-background/50 border border-border p-4 rounded-xl space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <AlertTriangle size={14} className="text-amber-400" /> Compliance & Risco
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {isHighRisk 
                ? <>Este MCC pertence a uma categoria de alto risco monitorada pelos programas <TermTooltip term="BRAM" definition="Business Risk Assessment and Mitigation." /> e <TermTooltip term="VIRP" definition="Visa Integrity Risk Program." />.</>
                : "Categoria de risco padrão. Sujeito às regras gerais de monitoramento."}
            </p>
          </div>
          <div className="bg-background/50 border border-border p-4 rounded-xl space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Calculator size={14} className="text-emerald-400" /> Impacto no Pricing
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              O MCC é o principal eixo da cascata de intercâmbio. Consulte o simulador para ver as faixas aplicáveis.
            </p>
            <Link 
              href={`/simulador?mcc=${mcc.mcc}`}
              className="flex items-center justify-center gap-2 w-full py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold transition-all"
            >
              Simular Intercâmbio <ExternalLink size={12} />
            </Link>
          </div>
        </div>
      )}

      {/* AI */}
      <div className="pt-4 border-t border-border/50">
        <p className="text-[11px] text-muted-foreground mb-3 font-medium uppercase tracking-wider">Normativa e Jurisprudência</p>
        <AIAssistant 
          toolName="Compliance Matrix"
          triggerLabel={`Análise Normativa para MCC ${mcc.mcc}`}
          context={`Analise o MCC ${mcc.mcc} (${mcc.nome}). Explique os principais programas de monitoria (BRAM, VIRP, MATCH) e as restrições normativas para este ramo de atividade.`}
          placeholder={`Quais são os limites de chargeback para o MCC ${mcc.mcc}?`}
        />
      </div>
    </div>
  );
}


export default function MccClient() {
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [selectedMcc, setSelectedMcc] = useState<MccEntry | null>(null);
  const [page, setPage] = useState(0);
  const PER_PAGE = 60;

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    setPage(0);
    return mccData.filter((m) => {
      const matchCat = activeCat ? m.categoria === activeCat : true;
      if (!q) return matchCat;
      return (
        matchCat &&
        (pad(m.mcc).includes(q) ||
          m.nome.toLowerCase().includes(q) ||
          (m.mcName ?? "").toLowerCase().includes(q) ||
          (m.categoria ?? "").toLowerCase().includes(q) ||
          (m.tccNome ?? "").toLowerCase().includes(q))
      );
    });
  }, [query, activeCat]);

  const visible = filtered.slice(0, (page + 1) * PER_PAGE);
  const hasMore = visible.length < filtered.length;

  return (
    <div className="mx-auto max-w-6xl px-6 pt-8" style={{ paddingBottom: "4rem" }}>
      
      {/* Detail Overlay / Panel */}
      {selectedMcc && (
        <div className="mb-8">
          <MccDetails mcc={selectedMcc} onClose={() => setSelectedMcc(null)} />
        </div>
      )}
      <div style={{ position: "relative", marginBottom: "1rem" }}>
        <Search size={15} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "var(--border)", pointerEvents: "none" }} />
        <input
          type="text"
          className="input-base"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(0); }}
          placeholder="Buscar por código (ex: 5411), nome (ex: grocery, restaurant, airline)…"
          style={{ paddingLeft: "2.25rem", paddingRight: query ? "2.25rem" : "0.75rem" }}
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setPage(0); }}
            style={{ position: "absolute", right: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "var(--muted-foreground)", background: "none", border: "none", cursor: "pointer" }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Category filters */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "1.5rem" }}>
        <button
          onClick={() => { setActiveCat(null); setPage(0); }}
          style={{
            fontSize: "0.7rem", fontWeight: 600,
            padding: "0.2rem 0.65rem",
            borderRadius: "9999px",
            border: "1px solid",
            borderColor: !activeCat ? "#3b82f6" : "#1e293b",
            background: !activeCat ? "rgba(37,99,235,0.15)" : "#050b18",
            color: !activeCat ? "#60a5fa" : "#475569",
            cursor: "pointer",
          }}
        >
          Todos ({mccData.length})
        </button>
        {ALL_CATS.map((cat) => {
          const count = mccData.filter((m) => m.categoria === cat).length;
          const isActive = activeCat === cat;
          return (
            <button
              key={cat}
              onClick={() => { setActiveCat(isActive ? null : cat); setPage(0); }}
              style={{
                fontSize: "0.7rem", fontWeight: 600,
                padding: "0.2rem 0.65rem",
                borderRadius: "9999px",
                border: "1px solid",
                borderColor: isActive ? "#60a5fa" : "#1e293b",
                background: isActive ? "rgba(37,99,235,0.12)" : "#050b18",
                color: isActive ? "#60a5fa" : "#475569",
                cursor: "pointer",
              }}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Count */}
      <p style={{ fontSize: "0.72rem", color: "var(--border)", marginBottom: "1rem" }}>
        {filtered.length.toLocaleString("pt-BR")} MCC{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
        {query && ` para "${query}"`}
      </p>

      {/* Table */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <Search size={32} style={{ color: "#1e293b", margin: "0 auto 1rem" }} />
          <p style={{ color: "var(--border)" }}>Nenhum MCC encontrado para "{query}"</p>
        </div>
      ) : (
        <>
          <div
            style={{
              background: "var(--code-bg)",
              border: "1px solid #0f172a",
              borderRadius: "1rem",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "80px 1fr 140px 80px",
                gap: "0",
                background: "#050b18",
                borderBottom: "1px solid #0f172a",
                padding: "0.625rem 1rem",
              }}
            >
              {["MCC", "Descrição", "Categoria", "TCC"].map((h) => (
                <p key={h} style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--border)" }}>
                  {h}
                </p>
              ))}
            </div>

            {/* Rows */}
            {visible.map((m, i) => (
              <div
                key={m.mcc}
                style={{
                  display: "grid",
                  gridTemplateColumns: "80px 1fr 140px 80px",
                  borderBottom: i < visible.length - 1 ? "1px solid #0a0f1e" : "none",
                  padding: "0.6rem 1rem",
                  transition: "background 0.1s",
                  cursor: "pointer",
                  background: selectedMcc?.mcc === m.mcc ? "rgba(37,99,235,0.05)" : "",
                  borderColor: selectedMcc?.mcc === m.mcc ? "var(--primary)" : ""
                }}
                onClick={() => setSelectedMcc(m)}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "")}
              >
                <div className="flex items-center gap-2">
                  <span style={{ fontFamily: "var(--font-geist-mono)", fontSize: "0.82rem", fontWeight: 700, color: "var(--code-text)" }}>
                    {highlight(pad(m.mcc), query)}
                  </span>
                  {HIGH_RISK_MCCS.has(m.mcc) && <AlertTriangle size={12} className="text-red-400" aria-label="High Risk MCC" />}
                </div>
                <div>
                  <p style={{ fontSize: "0.82rem", color: "var(--foreground)", lineHeight: 1.3 }}>
                    {highlight(m.nome, query)}
                  </p>
                  {m.mcName && (
                    <p style={{ fontSize: "0.72rem", color: "var(--border)", marginTop: "0.15rem" }}>
                      {highlight(m.mcName, query)}
                    </p>
                  )}
                </div>
                <span style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", lineHeight: 1.4 }}>
                  {highlight(m.categoria ?? "", query)}
                </span>
                <div>
                  {m.tcc ? (
                    <span
                      title={TCC_LABEL[m.tcc] ?? m.tcc}
                      style={{
                        fontFamily: "var(--font-geist-mono)",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        color: "#a78bfa",
                        background: "rgba(139,92,246,0.1)",
                        padding: "0.15rem 0.4rem",
                        borderRadius: "0.25rem",
                      }}
                    >
                      {m.tcc}
                    </span>
                  ) : (
                    <span style={{ color: "#1e293b", fontSize: "0.72rem" }}>—</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {hasMore && (
            <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
              <button
                onClick={() => setPage((p) => p + 1)}
                className="btn-outline"
                style={{ fontSize: "0.8rem", padding: "0.5rem 1.5rem" }}
              >
                Carregar mais ({filtered.length - visible.length} restantes)
              </button>
            </div>
          )}
        </>
      )}

      {/* TCC legend */}
      <div style={{ marginTop: "2.5rem", background: "#050b18", border: "1px solid #0f172a", borderRadius: "0.875rem", padding: "1.25rem 1.5rem" }}>
        <p style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--border)", marginBottom: "0.875rem" }}>
          Transaction Category Code (TCC)
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {Object.entries(TCC_LABEL).map(([code, label]) => (
            <div key={code} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <span style={{ fontFamily: "var(--font-geist-mono)", fontSize: "0.72rem", fontWeight: 700, color: "#a78bfa", background: "rgba(139,92,246,0.1)", padding: "0.15rem 0.4rem", borderRadius: "0.25rem" }}>
                {code}
              </span>
              <span style={{ fontSize: "0.72rem", color: "var(--border)" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
