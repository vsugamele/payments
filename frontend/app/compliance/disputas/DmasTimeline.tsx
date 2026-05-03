"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DollarSign, Clock, FileText, Shield, Scale, ChevronDown, TrendingUp, GitCompare, AlertTriangle } from "lucide-react";

const MC_FASES = [
  {
    n: 1, label: "First Chargeback", sigla: "CB", prazo: "D+45",
    prazo_desc: "45 dias corridos da data de processamento",
    custo: "$0", custo_acum: "$0", risco: 0,
    color: "#ef4444", actor: "Emissor → Adquirente",
    desc: "O Banco Emissor debita o valor da transação do Adquirente via rede. O Adquirente tem acesso ao Reason Code e causa raiz pela qual o portador contestou.",
    documentos: ["Notificação automática via Mastercom", "Reason Code e descrição da causa"],
    acao: "Revisar o Reason Code. Decidir: aceitar o chargeback ou contra-atacar com Representment.",
  },
  {
    n: 2, label: "Representment", sigla: "REP", prazo: "D+45",
    prazo_desc: "45 dias corridos do recebimento do First CB",
    custo: "$0", custo_acum: "$0", risco: 15,
    color: "#f59e0b", actor: "Adquirente → Emissor",
    desc: "O Adquirente envia 'Compelling Evidence' para reverter o chargeback. O Emissor analisa e pode aceitar ou rejeitar a evidência.",
    documentos: ["Logs de transação", "Comprovante de entrega / 3DS CAVV", "Política de devolução assinada", "IP, device fingerprint, geolocalização"],
    acao: "Montar o dossiê de evidências e submeter via Mastercom dentro do prazo.",
  },
  {
    n: 3, label: "Pre-Arbitration", sigla: "PRE-ARB", prazo: "D+30",
    prazo_desc: "30 dias corridos do Representment",
    custo: "$0 + risco", custo_acum: "Risco $150+", risco: 60,
    color: "#6366f1", actor: "Emissor rejeita → Ambos decidem",
    desc: "Se o Emissor rejeitou o Representment, qualquer das partes pode escalar para Pré-Arbitragem. É a última chance de acordo antes do veredito final da bandeira.",
    documentos: ["Todos os documentos anteriores", "Notificação formal de Pre-Arb"],
    acao: "Avaliar se o valor da disputa justifica pagar o Filing Fee de USD 150. Se sim, escale. Se não, aceite o chargeback.",
  },
  {
    n: 4, label: "Arbitration", sigla: "ARB", prazo: "D+45",
    prazo_desc: "45 dias para resposta após Pre-Arb",
    custo: "USD 150 Filing + USD 250 Review", custo_acum: "USD 400+", risco: 100,
    color: "#a78bfa", actor: "Mastercard decide",
    desc: "A Mastercard analisa todo o dossiê e emite veredito final e vinculante. O perdedor paga as taxas de arbitragem. Não há recurso após este ponto.",
    documentos: ["Dossiê completo de evidências", "Filing submetido via Mastercom"],
    acao: "Envie toda documentação disponível. O veredito é FINAL. Custos: $150 Filing Fee + $250 Review Fee para o perdedor = USD 400 mínimo.",
  },
];

const VISA_FASES = [
  {
    n: 1, label: "First Chargeback (VCR)", sigla: "CB", prazo: "D+30",
    prazo_desc: "30 dias corridos — mais agressivo que MC",
    custo: "$0", custo_acum: "$0", risco: 0,
    color: "#3b82f6", actor: "Emissor → Adquirente",
    desc: "Visa Claim Resolution (VCR): o Emissor inicia via VROL. Para disputas de 'Allocation' (fraude), o Adquirente é imediatamente responsável se não houver 3DS.",
    documentos: ["Notificação via VROL", "Reason Code Visa e categoria (Allocation vs Collaboration)"],
    acao: "Identificar a categoria: Allocation (sem defesa sem 3DS) ou Collaboration (há chance de evidência). Responder em até 30 dias.",
  },
  {
    n: 2, label: "Dispute Response", sigla: "RESP", prazo: "D+30",
    prazo_desc: "30 dias para resposta",
    custo: "$0", custo_acum: "$0", risco: 20,
    color: "#06b6d4", actor: "Adquirente → VROL",
    desc: "O Adquirente envia Compelling Evidence 3.0 (CE 3.0) via VROL. Para fraude com CE 3.0 válido (duas transações anteriores do mesmo dispositivo), o Liability Shift é restaurado.",
    documentos: ["Prova de CE 3.0: Device ID + IP + endereço coerente em 2+ transações anteriores", "CAVV/3DS para Liability Shift"],
    acao: "Montar CE 3.0 se disponível. Sem CE 3.0 em disputas de fraude = sem defesa.",
  },
  {
    n: 3, label: "Arbitration (VisaNet)", sigla: "ARB", prazo: "D+30",
    prazo_desc: "30 dias após rejeição da resposta",
    custo: "USD 500 Filing Fee", custo_acum: "USD 500+", risco: 100,
    color: "#8b5cf6", actor: "Visa decide",
    desc: "Visa tem uma única fase de arbitragem — mais simples que Mastercard, mas com Filing Fee muito maior (USD 500). O veredito é final e vinculante.",
    documentos: ["Dossiê completo", "Filing via VROL"],
    acao: "Só escale se tiver confiança TOTAL e o valor for superior a USD 500. Filing Fee de $500 torna inviável para disputas menores.",
  },
];

function RiskMeter({ fases }: { fases: typeof MC_FASES }) {
  const maxFee = fases === MC_FASES ? 400 : 500;
  return (
    <div className="mb-4 rounded-xl bg-black/20 border border-slate-800/60 p-3">
      <p className="text-[9px] uppercase tracking-wider font-bold text-slate-600 mb-2.5 flex items-center gap-1">
        <TrendingUp size={9} /> Exposição financeira acumulada por fase
      </p>
      <div className="flex gap-1 items-end">
        {fases.map((f, i) => {
          const h = Math.max(4, (f.risco / 100) * 28);
          const color = f.risco === 0 ? "#22c55e" : f.risco < 50 ? "#f59e0b" : "#ef4444";
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-t-md transition-all duration-500"
                style={{ height: h, background: `${color}90`, border: `1px solid ${color}40` }}
              />
              <span className="text-[8px] font-mono font-bold leading-tight text-center" style={{ color }}>
                {f.custo_acum}
              </span>
              <span className="text-[8px] text-slate-700 leading-tight text-center">{f.sigla}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex items-center justify-between text-[8px] text-slate-700">
        <span className="flex items-center gap-1"><span className="w-2 h-1.5 rounded-sm bg-green-600 inline-block" /> Sem custo</span>
        <span className="flex items-center gap-1"><span className="w-2 h-1.5 rounded-sm bg-yellow-600 inline-block" /> Risco crescente</span>
        <span className="flex items-center gap-1"><span className="w-2 h-1.5 rounded-sm bg-red-600 inline-block" /> Custo máximo: USD {maxFee}+</span>
      </div>
    </div>
  );
}

function MiniTimeline({ label, color, fases }: { label: string; color: string; fases: typeof MC_FASES }) {
  const [sel, setSel] = useState<number | null>(null);
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 mb-3" style={{ color }}>
        <span className="w-2 h-2 rounded-full inline-block" style={{ background: color }} />
        {label}
      </p>
      {fases.map((f, i) => (
        <button
          key={i}
          onClick={() => setSel(sel === i ? null : i)}
          className="w-full text-left rounded-xl p-3 border transition-all"
          style={{
            background: sel === i ? `${f.color}10` : "rgba(0,0,0,0.2)",
            borderColor: sel === i ? `${f.color}40` : "rgba(100,116,139,0.15)",
          }}
        >
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[10px] font-bold" style={{ color: f.color }}>{f.sigla}</span>
            <span className="text-[9px] font-mono text-slate-500 flex items-center gap-0.5">
              <Clock size={8} /> {f.prazo}
            </span>
          </div>
          <p className="text-[10px] font-semibold text-white leading-tight">{f.label}</p>
          <p className="text-[9px] text-slate-500 mt-0.5">{f.actor}</p>
          {f.custo !== "$0" && (
            <div className="mt-1.5 flex items-center gap-1 text-[9px] font-bold text-red-400">
              <DollarSign size={8} /> {f.custo}
            </div>
          )}
          <AnimatePresence>
            {sel === i && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mt-2 pt-2 border-t space-y-1"
                style={{ borderColor: `${f.color}20` }}
              >
                <p className="text-[9px] text-slate-400 leading-relaxed">{f.desc}</p>
                <div className="flex items-start gap-1 px-2 py-1.5 rounded-lg text-[9px]" style={{ background: `${f.color}10` }}>
                  <Shield size={9} style={{ color: f.color }} className="shrink-0 mt-0.5" />
                  <p style={{ color: f.color }}>{f.acao}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      ))}
      <div className="rounded-xl p-2.5 border border-red-500/20 bg-red-500/5 mt-1">
        <p className="text-[9px] font-bold text-red-400 flex items-center gap-1">
          <AlertTriangle size={8} /> Custo máximo: {label.includes("Mastercard") ? "USD 400+" : "USD 500+"}
        </p>
        <p className="text-[9px] text-slate-600">{label.includes("Mastercard") ? "Filing $150 + Review $250" : "Filing fee único $500"}</p>
      </div>
    </div>
  );
}

export function DmasTimeline() {
  const [scheme, setScheme] = useState<"mastercard" | "visa">("mastercard");
  const [selectedFase, setSelectedFase] = useState<number | null>(null);
  const [compareMode, setCompareMode] = useState(false);

  const fases = scheme === "mastercard" ? MC_FASES : VISA_FASES;

  return (
    <div style={{ background: "rgba(139,92,246,0.04)", border: "1px solid rgba(139,92,246,0.15)", borderRadius: "1rem", padding: "1.5rem" }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Scale size={15} className="text-purple-400" />
          Ciclo de Disputas — Timeline Interativa
        </h3>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Compare toggle */}
          <button
            onClick={() => { setCompareMode(!compareMode); setSelectedFase(null); }}
            className="px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
            style={{
              background: compareMode ? "rgba(99,102,241,0.2)" : "transparent",
              color: compareMode ? "#a5b4fc" : "#64748b",
              border: compareMode ? "1px solid rgba(99,102,241,0.35)" : "1px solid rgba(100,116,139,0.2)",
            }}
          >
            <GitCompare size={11} />
            {compareMode ? "Voltar" : "Comparar"}
          </button>

          {/* Scheme toggle — hidden in compare mode */}
          {!compareMode && (
            <div className="flex gap-1.5 p-1 bg-black/30 rounded-xl border border-slate-800">
              {(["mastercard", "visa"] as const).map(s => (
                <button
                  key={s}
                  onClick={() => { setScheme(s); setSelectedFase(null); }}
                  className="px-3 py-1 rounded-lg text-xs font-bold transition-all"
                  style={{
                    background: scheme === s ? `${s === "mastercard" ? "#f97316" : "#3b82f6"}20` : "transparent",
                    color: scheme === s ? (s === "mastercard" ? "#fb923c" : "#60a5fa") : "#64748b",
                    border: scheme === s ? `1px solid ${s === "mastercard" ? "#f9741630" : "#3b82f630"}` : "1px solid transparent",
                  }}
                >
                  {s === "mastercard" ? "Mastercard" : "Visa"}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {compareMode ? (
        /* ── MODO COMPARATIVO ── */
        <div>
          <div className="grid grid-cols-2 gap-3 mb-4 p-3 rounded-xl bg-black/20 border border-slate-800/50">
            <div className="text-center">
              <p className="text-[9px] text-slate-600 uppercase tracking-wider">Mastercard (DMAS)</p>
              <p className="text-[11px] font-bold text-orange-400">4 fases · até D+165</p>
              <p className="text-[9px] text-slate-600">Filing $150 + Review $250</p>
            </div>
            <div className="text-center">
              <p className="text-[9px] text-slate-600 uppercase tracking-wider">Visa (VCR / VROL)</p>
              <p className="text-[11px] font-bold text-blue-400">3 fases · até D+90</p>
              <p className="text-[9px] text-slate-600">Filing único $500</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <MiniTimeline label="Mastercard (DMAS)" color="#f97316" fases={MC_FASES} />
            <MiniTimeline label="Visa (VCR)" color="#3b82f6" fases={VISA_FASES} />
          </div>
        </div>
      ) : (
        /* ── MODO NORMAL ── */
        <>
          {/* Risk Escalation Meter */}
          <RiskMeter fases={fases} />

          {/* Timeline horizontal */}
          <div className="relative mb-5">
            <div className="absolute top-5 left-5 right-5 h-0.5 bg-slate-800" style={{ zIndex: 0 }} />
            <div className="flex justify-between relative" style={{ zIndex: 1 }}>
              {fases.map((fase, i) => {
                const isSelected = selectedFase === i;
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedFase(isSelected ? null : i)}
                    className="flex flex-col items-center gap-2 group"
                    style={{ width: `${100 / fases.length}%` }}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all"
                      style={{
                        background: isSelected ? fase.color : `${fase.color}15`,
                        borderColor: fase.color,
                        color: isSelected ? "white" : fase.color,
                        boxShadow: isSelected ? `0 0 16px ${fase.color}60` : "none",
                      }}
                    >
                      {fase.sigla.length <= 3 ? fase.sigla : fase.n}
                    </div>
                    <div className="text-center px-1">
                      <p className="text-[10px] font-bold leading-tight" style={{ color: isSelected ? fase.color : "#64748b" }}>
                        {fase.label.split(" ")[0]}
                      </p>
                      <p className="text-[9px] text-slate-600 mt-0.5 flex items-center justify-center gap-0.5">
                        <Clock size={8} /> {fase.prazo}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detail panel */}
          <AnimatePresence>
            {selectedFase !== null && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                {(() => {
                  const f = fases[selectedFase];
                  return (
                    <div className="rounded-xl p-4 space-y-3 mt-2" style={{ background: `${f.color}08`, border: `1px solid ${f.color}25` }}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="font-bold text-sm text-white">{f.label}</h4>
                          <p className="text-[10px] font-mono mt-0.5" style={{ color: f.color }}>{f.actor}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-slate-500 uppercase">Prazo</p>
                          <p className="text-sm font-bold text-white">{f.prazo}</p>
                          <p className="text-[10px] text-slate-600">{f.prazo_desc}</p>
                        </div>
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>

                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                          <FileText size={10} /> Documentos necessários
                        </p>
                        <div className="space-y-1">
                          {f.documentos.map((d, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
                              <div className="w-1 h-1 rounded-full shrink-0" style={{ background: f.color }} />
                              {d}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-start gap-2 px-3 py-2 rounded-lg text-xs" style={{ background: `${f.color}10`, border: `1px solid ${f.color}20` }}>
                        <Shield size={12} style={{ color: f.color }} className="shrink-0 mt-0.5" />
                        <p style={{ color: f.color }}>{f.acao}</p>
                      </div>

                      {f.custo !== "$0" && (
                        <div className="flex items-center gap-2 text-xs text-red-400 font-bold">
                          <DollarSign size={12} />
                          Custo: {f.custo} · Acumulado: {f.custo_acum}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </motion.div>
            )}
          </AnimatePresence>

          {selectedFase === null && (
            <p className="text-[10px] text-slate-600 text-center">
              <ChevronDown size={12} className="inline mr-1" />
              Clique em uma fase para ver detalhes, prazos e documentos necessários
            </p>
          )}
        </>
      )}
    </div>
  );
}
