"use client";

import { useState } from "react";
import {
  GitMerge, User, Store, ChevronRight, CheckCircle2,
  AlertTriangle, Code2, BookOpen, TerminalSquare, RefreshCw,
  CalendarOff, Clock, TrendingUp, CreditCard
} from "lucide-react";
import credData from "@/data/stored-credentials.json";
import RuleReference from "@/components/RuleReference";
import TermTooltip from "@/components/TermTooltip";
import Link from "next/link";

type MitType = {
  id: string;
  label: string;
  desc: string;
  exemplos: string[];
  fields: Record<string, string>;
  timeline: string;
  chargeback_risk_code: string;
  manualBase?: string;
  manualReference?: string;
};

const MIT_ICONS: Record<string, any> = {
  mit_recurring: RefreshCw,
  mit_installment: CreditCard,
  mit_unscheduled: TrendingUp,
  mit_incremental: TrendingUp,
  mit_resubmission: TerminalSquare,
  mit_noshow: CalendarOff,
  mit_delayed: Clock,
};

const MIT_COLORS: Record<string, { color: string; bg: string; border: string }> = {
  mit_recurring:     { color: "#60a5fa", bg: "rgba(96,165,250,0.08)",   border: "rgba(96,165,250,0.25)" },
  mit_installment:   { color: "#a78bfa", bg: "rgba(167,139,250,0.08)",  border: "rgba(167,139,250,0.25)" },
  mit_unscheduled:   { color: "#f59e0b", bg: "rgba(245,158,11,0.08)",   border: "rgba(245,158,11,0.25)" },
  mit_incremental:   { color: "#2dd4bf", bg: "rgba(45,212,191,0.08)",   border: "rgba(45,212,191,0.25)" },
  mit_resubmission:  { color: "#f87171", bg: "rgba(248,113,113,0.08)",  border: "rgba(248,113,113,0.25)" },
  mit_noshow:        { color: "#fb923c", bg: "rgba(251,146,60,0.08)",   border: "rgba(251,146,60,0.25)" },
  mit_delayed:       { color: "#94a3b8", bg: "rgba(148,163,184,0.08)",  border: "rgba(148,163,184,0.25)" },
};

const RC_COLOR: Record<string, string> = {
  "4837": "#ef4444", "4853": "#f59e0b", "4834": "#3b82f6", "4808": "#8b5cf6", "4870": "#6b7280",
};

const WIZARD_STEPS = [
  { id: "presence", q: "O portador do cartão está presente (física ou digitalmente) e inicia ATIVAMENTE este pagamento?" },
  { id: "agreement", q: "Existe um acordo prévio com o portador para cobranças futuras sem a presença dele?" },
  { id: "type", q: "Como essa cobrança foi acordada com o portador?" },
];

export default function StoredCredentialsClient() {
  const [viewMode, setViewMode] = useState<"wizard" | "map">("wizard");
  const [step, setStep] = useState(0);
  const [selectedMit, setSelectedMit] = useState<MitType | null>(null);
  const [result, setResult] = useState<{ isCIT: boolean } | null>(null);

  const citData = credData.find(d => d.id === "cit")!;
  const mitData = credData.find(d => d.id === "mit")!;
  const mitTypes: MitType[] = mitData.tipos as unknown as MitType[];

  const reset = () => { setStep(0); setSelectedMit(null); setResult(null); };

  return (
    <div className="space-y-8">
      {/* Mode Switcher */}
      <div className="flex bg-code-bg border border-border rounded-xl p-1 w-fit">
        {["wizard", "map"].map(m => (
          <button
            key={m}
            onClick={() => { setViewMode(m as any); reset(); }}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
              viewMode === m ? "bg-background border border-border text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {m === "wizard" ? "🧭 Classificador Interativo" : "📊 Mapa Completo MIT/CIT"}
          </button>
        ))}
      </div>

      {viewMode === "wizard" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-300">
          {/* LEFT: Wizard */}
          <div className="space-y-6">
            {/* Step 0: Is portador present? */}
            {step === 0 && (
              <div className="space-y-4">
                <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                  Passo 1 de 2 — Presença do Portador
                </p>
                <div className="bg-code-bg border border-border rounded-xl p-5">
                  <p className="text-sm font-bold text-foreground mb-4">
                    O portador do cartão está presente e inicia <em>ativamente</em> este pagamento?
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => { setResult({ isCIT: true }); setStep(2); }}
                      className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all flex flex-col items-center gap-2"
                    >
                      <User size={22} className="text-emerald-400" />
                      <span className="text-sm font-bold text-emerald-400">Sim — Portador Presente</span>
                      <span className="text-[11px] text-muted-foreground text-center">Checkout, POS, 3DS ativo</span>
                    </button>
                    <button
                      onClick={() => setStep(1)}
                      className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 transition-all flex flex-col items-center gap-2"
                    >
                      <Store size={22} className="text-amber-400" />
                      <span className="text-sm font-bold text-amber-400">Não — Só o Lojista</span>
                      <span className="text-[11px] text-muted-foreground text-center">Recorrência, parcela, auto-recarga</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Which MIT type? */}
            {step === 1 && !selectedMit && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <button onClick={reset} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                    ← Voltar
                  </button>
                  <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                    Passo 2 — Tipo de MIT
                  </p>
                </div>
                <p className="text-sm font-bold text-foreground bg-code-bg border border-border rounded-xl p-4">
                  Como essa cobrança foi acordada com o portador?
                </p>
                {mitTypes.map(mit => {
                  const Icon = MIT_ICONS[mit.id] || ChevronRight;
                  const col = MIT_COLORS[mit.id] || { color: "#94a3b8", bg: "rgba(148,163,184,0.1)", border: "rgba(148,163,184,0.2)" };
                  return (
                    <button
                      key={mit.id}
                      onClick={() => { setSelectedMit(mit); setStep(2); setResult({ isCIT: false }); }}
                      className="w-full text-left p-4 rounded-xl border transition-all flex items-start gap-4 hover:ring-1"
                      style={{ background: col.bg, borderColor: col.border }}
                    >
                      <div className="p-2 rounded-lg shrink-0 mt-0.5" style={{ background: `${col.color}20`, border: `1px solid ${col.color}30` }}>
                        <Icon size={16} style={{ color: col.color }} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-foreground">{mit.label}</h4>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{mit.desc}</p>
                      </div>
                      <ChevronRight size={14} className="text-muted-foreground mt-1 shrink-0" />
                    </button>
                  );
                })}
              </div>
            )}

            {/* Step 2: Reset */}
            {step === 2 && (
              <button
                onClick={reset}
                className="w-full p-3 rounded-xl border border-border bg-code-bg text-sm text-muted-foreground hover:text-foreground transition-all hover:border-border"
              >
                ← Classificar outra transação
              </button>
            )}
          </div>

          {/* RIGHT: Result Panel */}
          <div className="sticky top-8">
            {step === 0 && !result && (
              <div className="h-full flex items-center justify-center rounded-2xl border border-dashed border-border p-12 text-center">
                <div>
                  <GitMerge size={32} className="text-muted-foreground mx-auto mb-3 opacity-30" />
                  <p className="text-sm text-muted-foreground opacity-50">Responda as perguntas para ver<br />os campos ISO 8583 obrigatórios</p>
                </div>
              </div>
            )}

            {step === 2 && result?.isCIT && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="rounded-2xl border p-5" style={{ borderColor: "rgba(34,197,94,0.3)", background: "rgba(34,197,94,0.05)" }}>
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle2 size={20} className="text-emerald-400" />
                    <div>
                      <h3 className="font-bold text-foreground">Esta é uma CIT</h3>
                      <p className="text-xs text-muted-foreground">Cardholder Initiated Transaction</p>
                    </div>
                    <RuleReference ruleId={citData.manualReference} manual={citData.manualBase} description="Definição normativa de Stored Credentials (CIT) conforme os manuais de produto das bandeiras." />
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-5">{citData.description}</p>

                  <p className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground mb-3">
                    <Code2 size={12} className="inline mr-1.5" />Campos ISO 8583 obrigatórios
                  </p>
                  {Object.entries(citData.tipos[0].fields).map(([k, v]) => (
                    <div key={k} className="flex gap-3 py-2 border-b border-border last:border-0 text-xs">
                      <span className="font-mono text-emerald-400 font-bold shrink-0 w-40">{k}</span>
                      <span className="text-muted-foreground">{v}</span>
                    </div>
                  ))}

                  <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                    <p className="text-xs text-amber-300 font-semibold flex items-center gap-1.5">
                      <AlertTriangle size={13} />
                      ⚠️ Guarde o networkTransactionId retornado por esta CIT!
                    </p>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                      Este ID é o âncora. Todo MIT futuro neste portador DEVE referenciá-lo ou será tratado como transação não autorizada (RC 4837).
                    </p>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && result && !result.isCIT && selectedMit && (() => {
              const col = MIT_COLORS[selectedMit.id] || { color: "#94a3b8", bg: "rgba(148,163,184,0.08)", border: "rgba(148,163,184,0.25)" };
              const Icon = MIT_ICONS[selectedMit.id] || Store;
              return (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  {/* Header */}
                  <div className="rounded-2xl border p-5" style={{ background: col.bg, borderColor: col.border }}>
                    <div className="flex items-center gap-3 mb-3">
                      <Icon size={20} style={{ color: col.color }} />
                      <div className="flex-1">
                        <h3 className="font-bold text-foreground">{selectedMit.label}</h3>
                        <p className="text-xs text-muted-foreground">Merchant Initiated Transaction</p>
                      </div>
                      {selectedMit.manualBase && (
                        <RuleReference
                          ruleId={selectedMit.manualReference}
                          manual={selectedMit.manualBase}
                          description={`Definição e regras normativas para ${selectedMit.label} conforme os manuais das bandeiras.`}
                        />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{selectedMit.desc}</p>
                  </div>

                  {/* Exemplos */}
                  <div className="bg-code-bg border border-border rounded-xl p-4">
                    <p className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground mb-3">Exemplos Práticos</p>
                    <ul className="space-y-1">
                      {selectedMit.exemplos.map(e => (
                        <li key={e} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <span style={{ color: col.color }}>▸</span> {e}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Fields */}
                  <div className="bg-code-bg border border-border rounded-xl overflow-hidden">
                    <div className="px-4 py-3 bg-background/50 border-b border-border">
                      <p className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground flex items-center gap-1.5">
                        <Code2 size={12} />Campos ISO 8583 Obrigatórios
                      </p>
                    </div>
                    <div className="p-4 space-y-0 font-mono text-xs">
                      {Object.entries(selectedMit.fields).map(([k, v]) => (
                        <div key={k} className="flex gap-3 py-2.5 border-b border-border/50 last:border-0">
                          <span style={{ color: col.color }} className="font-bold shrink-0 w-44">{k}</span>
                          <span className="text-muted-foreground leading-relaxed">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Timeline + Risk */}
                  <div className="grid grid-cols-1 gap-3">
                    <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5">
                      <p className="text-xs font-bold text-blue-400 mb-1.5 flex items-center gap-1.5">
                        <Clock size={12} />Regra de Prazo
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{selectedMit.timeline}</p>
                    </div>
                    <div className="p-4 rounded-xl border" style={{ borderColor: `${RC_COLOR[selectedMit.chargeback_risk_code]}30`, background: `${RC_COLOR[selectedMit.chargeback_risk_code]}08` }}>
                      <p className="text-xs font-bold mb-1.5" style={{ color: RC_COLOR[selectedMit.chargeback_risk_code] }}>
                        <AlertTriangle size={12} className="inline mr-1.5" />
                        Chargeback Risk: RC {selectedMit.chargeback_risk_code}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Se esta transação não for sinalizada corretamente, o Emissor pode abrir o Reason Code {selectedMit.chargeback_risk_code}.{" "}
                        <Link href="/compliance/disputas" className="underline hover:text-foreground transition-colors">Ver como defender →</Link>
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      ) : (
        // MAP VIEW
        <div className="animate-in fade-in duration-300 space-y-6">
          {/* CIT */}
          <div className="rounded-2xl border p-6" style={{ borderColor: "rgba(34,197,94,0.25)", background: "rgba(34,197,94,0.04)" }}>
            <div className="flex items-center gap-3 mb-4">
              <User size={20} className="text-emerald-400" />
              <div>
                <h3 className="font-bold text-foreground">CIT — Cardholder Initiated Transaction</h3>
                <p className="text-xs text-muted-foreground">{citData.description}</p>
              </div>
            </div>
            <div className="bg-[#0a1120] border border-border rounded-xl p-5 font-mono text-[11px] leading-6 overflow-x-auto">
              <pre className="text-emerald-300/80 whitespace-pre">{
`CIT (Portador Presente)
 │
 ├── Autenticação 3DS ativa? SIM → Liability Shift garantido em caso de fraude.
 ├── É a PRIMEIRA transação de um ciclo de recorrência?
 │    └── SIM → [DE 48.22.3 = C] — Armazene o networkTransactionId retornado.
 └── Compra pontual sem armazenamento de credencial?
      └── Processo normal. Nenhum Stored Credential indicator necessário.`}
              </pre>
            </div>
          </div>

          {/* MIT */}
          <div className="rounded-2xl border p-6" style={{ borderColor: "rgba(245,158,11,0.25)", background: "rgba(245,158,11,0.04)" }}>
            <div className="flex items-center gap-3 mb-5">
              <Store size={20} className="text-amber-400" />
              <div>
                <h3 className="font-bold text-foreground">MIT — Merchant Initiated Transaction (7 subtipos)</h3>
                <p className="text-xs text-muted-foreground">Portador não presente. networkTransactionId da CIT original é sempre obrigatório.</p>
              </div>
            </div>
            <div className="bg-[#0a1120] border border-border rounded-xl p-5 font-mono text-[11px] leading-6 overflow-x-auto mb-6">
              <pre className="text-amber-300/80 whitespace-pre">{
`MIT (Portador Ausente)
 │   ⚠️  Regra Mestra: SEMPRE referenciar networkTransactionId da CIT original.
 │
 ├── [RECURRING]     Intervalo fixo + Valor fixo/variável → DE 48.22 = RECURRING
 │                   Risco Chargeback: RC 4853 (Cancelamento Ignorado)
 │
 ├── [INSTALLMENT]   Nº parcelas acordado → DE 48.22 = INSTALMENT | DE 64 = X/Total
 │                   Risco Chargeback: RC 4834 (Valor Divergente)
 │
 ├── [UNSCHEDULED]   Evento-trigger (saldo baixo, uso) → DE 48.22 = UNSCHEDULED
 │                   Risco Chargeback: RC 4837 (Não Autorizado)
 │
 ├── [INCREMENTAL]   Adição a uma autorização aberta → DE 48.63 = Incremental Flag
 │                   Risco Chargeback: RC 4834 (Valor Divergente)
 │
 ├── [RESUBMISSION]  Retentativa pós-soft decline (R51/R61) → Max 4x em 15 dias
 │                   ⛔  Proibido para R05/R41 (Do Not Honor / Lost Card)
 │                   Risco Chargeback: RC 4808 (Sem Autorização Válida)
 │
 ├── [NO-SHOW]       Penalidade por cancelamento tardio → DE 48.22 = NS
 │                   MCC obrigatório: Hospitalidade (7011, 7512, 4722)
 │
 └── [DELAYED CHARGE] Cobrança pós-checkout → DE 48.22 = DC (prazo: 7 dias)
                       MCC obrigatório: Hotel / Locadora`}
              </pre>
            </div>
            {/* Tabela de referência rápida */}
            <p className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground mb-3">Referência Rápida</p>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-background/50 border-b border-border">
                    <th className="text-left px-4 py-3 font-bold text-muted-foreground">Tipo MIT</th>
                    <th className="text-left px-4 py-3 font-bold text-muted-foreground">DE 48.22 (MC)</th>
                    <th className="text-left px-4 py-3 font-bold text-muted-foreground">Visa Model</th>
                    <th className="text-left px-4 py-3 font-bold text-muted-foreground">RC Risco</th>
                    <th className="text-left px-4 py-3 font-bold text-muted-foreground">Manual</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {mitTypes.map(mit => {
                    const col = MIT_COLORS[mit.id];
                    return (
                      <tr key={mit.id} className="hover:bg-code-bg transition-colors">
                        <td className="px-4 py-3 font-bold text-foreground">{mit.label.replace("MIT ", "")}</td>
                        <td className="px-4 py-3 font-mono text-muted-foreground">{mit.fields["DE48_22_Mastercard"] || "—"}</td>
                        <td className="px-4 py-3 font-mono text-muted-foreground">{mit.fields["Visa_StoredCredential_model"] || "—"}</td>
                        <td className="px-4 py-3">
                          <span className="font-mono font-bold px-2 py-0.5 rounded text-[10px]" style={{ color: RC_COLOR[mit.chargeback_risk_code], background: `${RC_COLOR[mit.chargeback_risk_code]}15` }}>
                            {mit.chargeback_risk_code}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {mit.manualBase && (
                            <RuleReference ruleId={mit.manualReference} manual={mit.manualBase} description={`Regras normativas para ${mit.label}.`} />
                          )}
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
    </div>
  );
}
