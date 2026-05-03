"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, ChevronRight, Info, RefreshCw } from "lucide-react";
import TermTooltip from "@/components/TermTooltip";

/* ─── Types ─────────────────────────────────────────────────── */
interface Inputs {
  // VAMP
  vamp_tc40: string;
  vamp_total: string;
  // VIRP (Visa)
  virp_mcc_wrong: boolean;
  virp_volume_usd: string;
  // ECP
  ecp_chargebacks: string;
  ecp_approved: string;
  // EFM
  efm_fraud_usd: string;
  efm_settled_usd: string;
  efm_3ds_pct: string;
  // PED (Elo)
  ped_disputes: string;
  ped_approved: string;
  // PEF (Elo)
  pef_fraud_brl: string;
  pef_settled_brl: string;
  pef_3ds_pct: string;
}

interface Finding {
  programa: string;
  bandeira: string;
  nivel: string;
  cor: "green" | "yellow" | "orange" | "red";
  mensagem: string;
  penalidade_mes1: number;
  bps?: number;
  detalhe?: string;
}

/* ─── Helpers ────────────────────────────────────────────────── */
const N = (v: string) => parseFloat(v.replace(",", ".")) || 0;

const BAND_COLOR: Record<string, string> = {
  Visa: "rgba(37,99,235,0.15)",
  Mastercard: "rgba(239,68,68,0.12)",
  Elo: "rgba(34,197,94,0.12)",
};
const BAND_TEXT: Record<string, string> = {
  Visa: "#60a5fa",
  Mastercard: "#f87171",
  Elo: "#4ade80",
};

const LEVEL_STYLES = {
  green:  { bg: "rgba(34,197,94,0.07)",  border: "rgba(34,197,94,0.2)",  text: "#4ade80" },
  yellow: { bg: "rgba(234,179,8,0.07)",  border: "rgba(234,179,8,0.2)",  text: "#fbbf24" },
  orange: { bg: "rgba(249,115,22,0.07)", border: "rgba(249,115,22,0.2)", text: "#fb923c" },
  red:    { bg: "rgba(239,68,68,0.08)",  border: "rgba(239,68,68,0.2)",  text: "#f87171" },
};

function bps(n: number) {
  return `${(n * 100).toFixed(2)} bps`;
}
function usd(n: number) {
  return `US$ ${n.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

/* ─── Engine ─────────────────────────────────────────────────── */
function evaluate(inp: Inputs): Finding[] {
  const results: Finding[] = [];

  /* VAMP */
  const tc40 = N(inp.vamp_tc40);
  const vampTotal = N(inp.vamp_total);
  if (vampTotal > 0) {
    const rate = tc40 / vampTotal;
    const rateBps = rate * 10000;
    if (rateBps >= 70 && tc40 >= 1500) {
      results.push({
        programa: "VAMP", bandeira: "Visa", nivel: "Excessive",
        cor: "red",
        mensagem: `Taxa ${bps(rate)} ≥ 70bps com ${tc40.toLocaleString()} transações TC40/TC15 — enquadra em Excessive.`,
        penalidade_mes1: 10000, bps: rateBps,
        detalhe: "Mês 1: US$10K | Mês 2: US$20K | Mês 3+: US$30K",
      });
    } else if (rateBps >= 50 && tc40 >= 1500) {
      results.push({
        programa: "VAMP", bandeira: "Visa", nivel: "Above Standard",
        cor: "yellow",
        mensagem: `Taxa ${bps(rate)} ≥ 50bps com ${tc40.toLocaleString()} transações — enquadra em Above Standard.`,
        penalidade_mes1: 5000, bps: rateBps,
        detalhe: "Mês 1: US$5K | Mês 2: US$10K | Mês 3+: US$15K",
      });
    } else if (rateBps >= 30) {
      results.push({
        programa: "VAMP", bandeira: "Visa", nivel: "Atenção",
        cor: "orange",
        mensagem: `Taxa ${bps(rate)} — abaixo do threshold mas requer monitoramento. Risco de enquadramento futuro.`,
        penalidade_mes1: 0, bps: rateBps,
      });
    } else {
      results.push({
        programa: "VAMP", bandeira: "Visa", nivel: "OK",
        cor: "green",
        mensagem: `Taxa ${bps(rate)} — abaixo de 50bps. Fora do programa.`,
        penalidade_mes1: 0, bps: rateBps,
      });
    }
  }

  /* VIRP — Visa Integrity Risk Program */
  const virpVolume = N(inp.virp_volume_usd);
  if (inp.virp_mcc_wrong && virpVolume > 0) {
    if (virpVolume >= 100000) {
      results.push({
        programa: "VIRP", bandeira: "Visa", nivel: "Violação Confirmada",
        cor: "red",
        mensagem: `Volume de ${usd(virpVolume)} com MCC incorreto. VIRP multa por uso indevido de MCC que altera benefícios de intercâmbio, benefícios ao titular ou conformidade regulatória.`,
        penalidade_mes1: 25000,
        detalhe: "Penalidade: US$25K + encerramento do MID após revisão. Exige remediação documentada.",
      });
    } else {
      results.push({
        programa: "VIRP", bandeira: "Visa", nivel: "Risco Identificado",
        cor: "orange",
        mensagem: `Volume de ${usd(virpVolume)} com possível MCC incorreto. Abaixo do threshold de penalidade, mas sujeito a auditoria e notificação formal.`,
        penalidade_mes1: 0,
        detalhe: "Recomendação: corrigir o MCC imediatamente para evitar escalada.",
      });
    }
  } else if (!inp.virp_mcc_wrong && virpVolume > 0) {
    results.push({
      programa: "VIRP", bandeira: "Visa", nivel: "OK",
      cor: "green",
      mensagem: `MCC declarado como correto. Portfólio fora do programa VIRP para este volume.`,
      penalidade_mes1: 0,
    });
  }

  /* ECP */
  const ecpCB = N(inp.ecp_chargebacks);
  const ecpApproved = N(inp.ecp_approved);
  if (ecpApproved > 0) {
    const rate = ecpCB / ecpApproved;
    const rateBps = rate * 10000;
    if (ecpCB >= 300 && rateBps >= 300) {
      results.push({
        programa: "ECP", bandeira: "Mastercard", nivel: "HECM",
        cor: "red",
        mensagem: `${ecpCB} chargebacks e taxa ${bps(rate)} ≥ 300bps — enquadra em HECM (High Excessive).`,
        penalidade_mes1: 2000, bps: rateBps,
        detalhe: "Mês 1: US$2K | 2: US$4K | 3: US$8K | 4: US$12K | 5: US$16K | 6+: US$20K",
      });
    } else if (ecpCB >= 100 && rateBps >= 150) {
      results.push({
        programa: "ECP", bandeira: "Mastercard", nivel: "ECM",
        cor: "yellow",
        mensagem: `${ecpCB} chargebacks e taxa ${bps(rate)} ≥ 150bps — enquadra em ECM (Excessive).`,
        penalidade_mes1: 1000, bps: rateBps,
        detalhe: "Mês 1: US$1K | 2: US$2K | 3: US$4K | 4: US$6K | 5: US$8K | 6+: US$10K",
      });
    } else if (rateBps >= 100) {
      results.push({
        programa: "ECP", bandeira: "Mastercard", nivel: "Atenção",
        cor: "orange",
        mensagem: `Taxa ${bps(rate)} — próximo ao threshold. Monitorar de perto.`,
        penalidade_mes1: 0, bps: rateBps,
      });
    } else {
      results.push({
        programa: "ECP", bandeira: "Mastercard", nivel: "OK",
        cor: "green",
        mensagem: `Taxa ${bps(rate)} com ${ecpCB} chargebacks — fora do programa.`,
        penalidade_mes1: 0, bps: rateBps,
      });
    }
  }

  /* EFM */
  const efmFraud = N(inp.efm_fraud_usd);
  const efmSettled = N(inp.efm_settled_usd);
  const efm3ds = N(inp.efm_3ds_pct);
  if (efmSettled > 0 && efmFraud >= 50000) {
    const rate = efmFraud / efmSettled;
    const rateBps = rate * 10000;
    if (efm3ds < 10) {
      if (rateBps >= 150) {
        results.push({
          programa: "EFM", bandeira: "Mastercard", nivel: "Nível 3 (150bps+)",
          cor: "red",
          mensagem: `Fraude ${bps(rate)} com ${efm3ds}% 3DS — enquadra em EFM Nível 3.`,
          penalidade_mes1: 2000, bps: rateBps,
          detalhe: "Mês 1: US$2K | Mês 2: US$4K | Mês 3+: US$8K",
        });
      } else if (rateBps >= 100) {
        results.push({
          programa: "EFM", bandeira: "Mastercard", nivel: "Nível 2 (100-149bps)",
          cor: "orange",
          mensagem: `Fraude ${bps(rate)} com ${efm3ds}% 3DS — enquadra em EFM Nível 2.`,
          penalidade_mes1: 1000, bps: rateBps,
          detalhe: "Mês 1: US$1K | Mês 2: US$2K | Mês 3+: US$4K",
        });
      } else if (rateBps >= 50) {
        results.push({
          programa: "EFM", bandeira: "Mastercard", nivel: "Nível 1 (50-99bps)",
          cor: "yellow",
          mensagem: `Fraude ${bps(rate)} com ${efm3ds}% 3DS — enquadra em EFM Nível 1.`,
          penalidade_mes1: 500, bps: rateBps,
          detalhe: "Mês 1: US$500 | Mês 2: US$1K | Mês 3+: US$2K",
        });
      } else {
        results.push({
          programa: "EFM", bandeira: "Mastercard", nivel: "OK",
          cor: "green",
          mensagem: `Fraude ${bps(rate)} — abaixo de 50bps. Fora do programa.`,
          penalidade_mes1: 0, bps: rateBps,
        });
      }
    } else {
      results.push({
        programa: "EFM", bandeira: "Mastercard", nivel: "3DS OK",
        cor: "green",
        mensagem: `${efm3ds}% de autenticação 3DS — acima de 10%. Isento do EFM.`,
        penalidade_mes1: 0,
      });
    }
  } else if (efmFraud > 0 && efmFraud < 50000) {
    results.push({
      programa: "EFM", bandeira: "Mastercard", nivel: "Abaixo do Limite",
      cor: "green",
      mensagem: `Volume de fraude ${usd(efmFraud)} — abaixo de US$50K. Fora do EFM.`,
      penalidade_mes1: 0,
    });
  }

  /* PED (Elo) */
  const pedDisputes = N(inp.ped_disputes);
  const pedApproved = N(inp.ped_approved);
  if (pedApproved > 0) {
    const rate = pedDisputes / pedApproved;
    const pct = rate * 100;
    if (pct > 1.49 && pedApproved > 1000 && pedDisputes > 100) {
      results.push({
        programa: "PED", bandeira: "Elo", nivel: "Alerta",
        cor: "yellow",
        mensagem: `Taxa de disputas ${pct.toFixed(2)}% > 1,49% com ${pedDisputes} disputas — enquadra em PED.`,
        penalidade_mes1: 0,
        detalhe: "Plano de remediação em 30d. Penalidade R$15K se sem melhora em 60d.",
      });
    } else if (pct > 1.0) {
      results.push({
        programa: "PED", bandeira: "Elo", nivel: "Atenção",
        cor: "orange",
        mensagem: `Taxa ${pct.toFixed(2)}% — próxima ao threshold de 1,49%. Monitorar.`,
        penalidade_mes1: 0,
      });
    } else {
      results.push({
        programa: "PED", bandeira: "Elo", nivel: "OK",
        cor: "green",
        mensagem: `Taxa de disputas ${pct.toFixed(2)}% — fora do programa PED.`,
        penalidade_mes1: 0,
      });
    }
  }

  /* PEF (Elo) */
  const pefFraud = N(inp.pef_fraud_brl);
  const pefSettled = N(inp.pef_settled_brl);
  const pef3ds = N(inp.pef_3ds_pct);
  if (pefSettled > 0 && pefFraud >= 150000) {
    const rate = pefFraud / pefSettled;
    const rateBps = rate * 10000;
    if (pef3ds < 10) {
      if (rateBps >= 100) {
        results.push({
          programa: "PEF", bandeira: "Elo", nivel: "Nível 2",
          cor: "red",
          mensagem: `Fraude ${bps(rate)} e 3DS ${pef3ds}% — enquadra em PEF Nível 2.`,
          penalidade_mes1: 2000, bps: rateBps,
          detalhe: "Mês 1: R$2K | Mês 2: R$4K | Mês 3+: R$8K",
        });
      } else if (rateBps >= 50) {
        results.push({
          programa: "PEF", bandeira: "Elo", nivel: "Nível 1",
          cor: "yellow",
          mensagem: `Fraude ${bps(rate)} e 3DS ${pef3ds}% — enquadra em PEF Nível 1.`,
          penalidade_mes1: 500, bps: rateBps,
          detalhe: "Mês 1: R$500 | Mês 2: R$1K | Mês 3+: R$2K",
        });
      } else {
        results.push({
          programa: "PEF", bandeira: "Elo", nivel: "OK",
          cor: "green",
          mensagem: `Fraude ${bps(rate)} — fora do PEF.`,
          penalidade_mes1: 0, bps: rateBps,
        });
      }
    } else {
      results.push({
        programa: "PEF", bandeira: "Elo", nivel: "3DS OK",
        cor: "green",
        mensagem: `${pef3ds}% de autenticação 3DS — isento do PEF.`,
        penalidade_mes1: 0,
      });
    }
  }

  return results;
}

/* ─── Input group ───────────────────────────────────────────── */
function InputGroup({ label, value, onChange, placeholder, hint }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <div>
      <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "var(--muted-foreground)", marginBottom: "0.375rem" }}>
        {label}
      </label>
      <input
        type="text"
        inputMode="decimal"
        className="input-base"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "0"}
      />
      {hint && <p style={{ fontSize: "0.7rem", color: "var(--border)", marginTop: "0.25rem" }}>{hint}</p>}
    </div>
  );
}

/* ─── Section card ──────────────────────────────────────────── */
function SectionCard({ title, bandeira, children }: { title: React.ReactNode; bandeira: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "var(--code-bg)", border: "1px solid var(--border)", borderRadius: "1rem", overflow: "hidden" }}>
      <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--foreground)" }}>{title}</span>
        <span
          className="tag"
          style={{ background: BAND_COLOR[bandeira], color: BAND_TEXT[bandeira], border: "none", fontSize: "0.65rem" }}
        >
          {bandeira}
        </span>
      </div>
      <div style={{ padding: "1.25rem 1.5rem", display: "grid", gap: "0.875rem", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}>
        {children}
      </div>
    </div>
  );
}

/* ─── Result card ───────────────────────────────────────────── */
function ResultCard({ finding }: { finding: Finding }) {
  const s = LEVEL_STYLES[finding.cor];
  return (
    <div style={{ background: s.bg, border: `1px solid ${s.border}`, borderLeft: `3px solid ${s.text}`, borderRadius: "0.75rem", padding: "1.25rem" }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span style={{ fontSize: "0.85rem", fontWeight: 700, color: s.text }}>{finding.programa}</span>
          <span className="tag" style={{ background: BAND_COLOR[finding.bandeira], color: BAND_TEXT[finding.bandeira], border: "none", fontSize: "0.6rem" }}>
            {finding.bandeira}
          </span>
        </div>
        <span style={{ fontSize: "0.7rem", color: s.text, fontWeight: 600 }}>{finding.nivel}</span>
      </div>
      <p style={{ fontSize: "0.82rem", color: "var(--muted-foreground)", lineHeight: 1.6, marginBottom: finding.detalhe ? "0.75rem" : 0 }}>
        {finding.mensagem}
      </p>
      {finding.detalhe && (
        <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: "0.375rem", padding: "0.5rem 0.75rem" }}>
          <p style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", fontFamily: "var(--font-geist-mono)" }}>{finding.detalhe}</p>
        </div>
      )}
      {finding.penalidade_mes1 > 0 && (
        <div className="flex items-center gap-1.5 mt-3">
          <AlertTriangle size={11} style={{ color: s.text }} />
          <span style={{ fontSize: "0.75rem", fontWeight: 600, color: s.text }}>
            Penalidade mês 1: {usd(finding.penalidade_mes1)}
          </span>
        </div>
      )}
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────── */
const EMPTY: Inputs = {
  vamp_tc40: "", vamp_total: "",
  virp_mcc_wrong: false, virp_volume_usd: "",
  ecp_chargebacks: "", ecp_approved: "",
  efm_fraud_usd: "", efm_settled_usd: "", efm_3ds_pct: "",
  ped_disputes: "", ped_approved: "",
  pef_fraud_brl: "", pef_settled_brl: "", pef_3ds_pct: "",
};

/* ─── Preset Scenarios ────────────────────────────────────────── */
const PRESETS = [
  {
    id: "saudavel",
    label: "Lojista Saudável",
    emoji: "✅",
    desc: "Portfólio controlado — todos os programas em verde",
    color: "#4ade80",
    data: {
      vamp_tc40: "300", vamp_total: "250000",
      virp_mcc_wrong: false, virp_volume_usd: "80000",
      ecp_chargebacks: "40", ecp_approved: "8000",
      efm_fraud_usd: "30000", efm_settled_usd: "5000000", efm_3ds_pct: "25",
      ped_disputes: "50", ped_approved: "6000",
      pef_fraud_brl: "80000", pef_settled_brl: "8000000", pef_3ds_pct: "20",
    } as Inputs,
  },
  {
    id: "risco",
    label: "Em Risco (ECP + VAMP)",
    emoji: "⚠️",
    desc: "Próximo dos thresholds — monitoramento urgente",
    color: "#fbbf24",
    data: {
      vamp_tc40: "1600", vamp_total: "300000",
      virp_mcc_wrong: false, virp_volume_usd: "90000",
      ecp_chargebacks: "110", ecp_approved: "6000",
      efm_fraud_usd: "65000", efm_settled_usd: "4500000", efm_3ds_pct: "7",
      ped_disputes: "80", ped_approved: "4500",
      pef_fraud_brl: "120000", pef_settled_brl: "6000000", pef_3ds_pct: "6",
    } as Inputs,
  },
  {
    id: "critico",
    label: "Situação Crítica",
    emoji: "🚨",
    desc: "Multas ativas em múltiplos programas",
    color: "#f87171",
    data: {
      vamp_tc40: "2500", vamp_total: "200000",
      virp_mcc_wrong: true, virp_volume_usd: "150000",
      ecp_chargebacks: "350", ecp_approved: "9000",
      efm_fraud_usd: "90000", efm_settled_usd: "4000000", efm_3ds_pct: "3",
      ped_disputes: "160", ped_approved: "8000",
      pef_fraud_brl: "250000", pef_settled_brl: "5000000", pef_3ds_pct: "2",
    } as Inputs,
  },
];

export default function RiscoClient() {
  const [inp, setInp] = useState<Inputs>(EMPTY);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const loadPreset = (p: typeof PRESETS[0]) => {
    setInp(p.data);
    setActivePreset(p.id);
  };

  const set = (k: keyof Inputs) => (v: string) => setInp((p) => ({ ...p, [k]: v }));
  const setBool = (k: keyof Inputs) => (v: boolean) => setInp((p) => ({ ...p, [k]: v }));

  // Reativo: calcula sempre que há algum input
  const hasAnyInput = Object.entries(inp).some(([, v]) => v !== "" && v !== false);

  const results = useMemo(() => {
    if (!hasAnyInput) return [];
    return evaluate(inp);
  }, [inp, hasAnyInput]);

  const riskCount = results.filter((r) => r.cor === "red" || r.cor === "orange" || r.cor === "yellow").length;
  const penaltyTotal = results.reduce((acc, r) => acc + r.penalidade_mes1, 0);

  return (
    <div className="mx-auto max-w-4xl px-6 pt-12" style={{ paddingBottom: "4rem" }}>

      {/* ── Cenários de Exemplo ── */}
      <div style={{ marginBottom: "2rem" }}>
        <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.875rem" }}>
          Carregar Cenário de Exemplo
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem" }}>
          {PRESETS.map(p => (
            <button
              key={p.id}
              onClick={() => loadPreset(p)}
              style={{
                background: activePreset === p.id ? `${p.color}12` : "var(--code-bg)",
                border: `1px solid ${activePreset === p.id ? p.color + "40" : "var(--border)"}`,
                borderRadius: "0.875rem",
                padding: "0.875rem 1rem",
                textAlign: "left",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                <span>{p.emoji}</span>
                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: activePreset === p.id ? p.color : "var(--foreground)" }}>{p.label}</span>
              </div>
              <p style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", lineHeight: 1.4 }}>{p.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Summary banner (reactive) */}
      {hasAnyInput && results.length > 0 && (
        <div
          style={{
            background: riskCount > 0 ? "rgba(239,68,68,0.07)" : "rgba(34,197,94,0.07)",
            border: `1px solid ${riskCount > 0 ? "rgba(239,68,68,0.2)" : "rgba(34,197,94,0.2)"}`,
            borderRadius: "1rem",
            padding: "1.5rem",
            marginBottom: "2rem",
            display: "flex",
            gap: "1rem",
            alignItems: "center",
          }}
        >
          {riskCount > 0
            ? <AlertTriangle size={22} style={{ color: "#f87171", flexShrink: 0 }} />
            : <CheckCircle2 size={22} style={{ color: "#4ade80", flexShrink: 0 }} />
          }
          <div>
            <p style={{ fontWeight: 700, color: riskCount > 0 ? "#f87171" : "#4ade80", fontSize: "0.95rem", marginBottom: "0.25rem" }}>
              {riskCount > 0
                ? `${riskCount} programa${riskCount > 1 ? "s" : ""} com risco de enquadramento`
                : "Portfólio dentro dos limites dos programas avaliados"}
            </p>
            {penaltyTotal > 0 && (
              <p style={{ fontSize: "0.82rem", color: "var(--muted-foreground)" }}>
                Penalidade estimada no 1º mês: <strong style={{ color: "#f87171" }}>{usd(penaltyTotal)}</strong>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div style={{ display: "flex", gap: "0.5rem", background: "var(--code-bg)", border: "1px solid var(--border)", borderRadius: "0.75rem", padding: "0.875rem 1.25rem", marginBottom: "2rem" }}>
        <Info size={14} style={{ color: "var(--border)", flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontSize: "0.75rem", color: "var(--border)", lineHeight: 1.6 }}>
          Esta calculadora é uma ferramenta de orientação baseada nos thresholds públicos dos programas.
          Valores reais dependem de dados oficiais da bandeira, períodos de apuração e regras específicas de cada programa.
          Consulte a documentação oficial ou um especialista para decisões de compliance.
        </p>
      </div>

      <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "1fr" }}>
        {/* VAMP */}
        <SectionCard title={<>VAMP — <TermTooltip term="Visa Acquirer Monitoring" definition="Programa oficial da Visa focado na contagem absoluta de arquivos TC40 reportados. Multas podem chegar a USD 30.000 mensais no tier máximo."/></>} bandeira="Visa">
          <InputGroup label="TC40 + TC15 (qtde)" value={inp.vamp_tc40} onChange={set("vamp_tc40")} placeholder="ex: 850" hint="Fraudes reportadas" />
          <InputGroup label="Total liquidadas" value={inp.vamp_total} onChange={set("vamp_total")} placeholder="ex: 180000" hint="Transações settled" />
        </SectionCard>

        {/* VIRP */}
        <SectionCard title={<>VIRP — <TermTooltip term="Visa Integrity Risk Program" definition="Programa desenhado contra lavagem de dinheiro, tráfego ilícito e preenchimento incorreto de MCCs."/></>} bandeira="Visa">
          <InputGroup label="Volume no MID (US$)" value={inp.virp_volume_usd} onChange={set("virp_volume_usd")} placeholder="ex: 120000" hint="Volume mensal liquidado" />
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", paddingTop: "0.25rem" }}>
            <input
              type="checkbox"
              id="virp_mcc"
              checked={inp.virp_mcc_wrong}
              onChange={(e) => setBool("virp_mcc_wrong")(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <label htmlFor="virp_mcc" style={{ fontSize: "0.78rem", color: "var(--muted-foreground)", cursor: "pointer" }}>
              MCC suspeito / incorreto para a atividade
            </label>
          </div>
        </SectionCard>

        {/* ECP */}
        <SectionCard title={<>ECP — <TermTooltip term="Excessive Chargeback Program" definition="Programa oficial da Mastercard, focado puramente e estritamente no volume matemático de Chargebacks averbados no mês em relação ao seu volume de aprovadas."/></>} bandeira="Mastercard">
          <InputGroup label="Chargebacks (qtde)" value={inp.ecp_chargebacks} onChange={set("ecp_chargebacks")} placeholder="ex: 120" />
          <InputGroup label="Aprovadas (mês ant.)" value={inp.ecp_approved} onChange={set("ecp_approved")} placeholder="ex: 5000" />
        </SectionCard>

        {/* EFM */}
        <SectionCard title={<>EFM — <TermTooltip term="Excessive Fraud Merchant" definition="Semelhante ao VAMP da Visa, mas da Mastercard. Observa a Fraude em si (Dinheiro liquidado). Cuidado: o EFM cobra isenção matemática se seu portfólio rodar pelo menos 10% com o protocolo 3DS."/></>} bandeira="Mastercard">
          <InputGroup label="Fraude (US$)" value={inp.efm_fraud_usd} onChange={set("efm_fraud_usd")} placeholder="ex: 75000" hint="≥ US$50K para EFM" />
          <InputGroup label="Volume liquidado (US$)" value={inp.efm_settled_usd} onChange={set("efm_settled_usd")} placeholder="ex: 10000000" />
          <InputGroup label="% transações c/ 3DS" value={inp.efm_3ds_pct} onChange={set("efm_3ds_pct")} placeholder="ex: 8.5" hint="< 10% = risco EFM" />
        </SectionCard>

        {/* PED */}
        <SectionCard title="PED — Programa de Excelência em Disputas" bandeira="Elo">
          <InputGroup label="Disputas (qtde)" value={inp.ped_disputes} onChange={set("ped_disputes")} placeholder="ex: 120" hint="> 100 para PED" />
          <InputGroup label="Aprovadas" value={inp.ped_approved} onChange={set("ped_approved")} placeholder="ex: 5000" hint="> 1.000 para PED" />
        </SectionCard>

        {/* PEF */}
        <SectionCard title="PEF — Programa de Excelência em Fraude" bandeira="Elo">
          <InputGroup label="Fraude (R$)" value={inp.pef_fraud_brl} onChange={set("pef_fraud_brl")} placeholder="ex: 200000" hint="≥ R$150K para PEF" />
          <InputGroup label="Volume liquidado (R$)" value={inp.pef_settled_brl} onChange={set("pef_settled_brl")} placeholder="ex: 30000000" />
          <InputGroup label="% transações c/ 3DS" value={inp.pef_3ds_pct} onChange={set("pef_3ds_pct")} placeholder="ex: 6" hint="< 10% = risco PEF" />
        </SectionCard>
      </div>

      {/* CTA — limpar */}
      {hasAnyInput && (
        <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <RefreshCw size={12} className="animate-spin" style={{ animationDuration: "3s" }} />
            Calculando em tempo real
          </div>
          <button
            onClick={() => setInp(EMPTY)}
            className="btn-outline"
            style={{ padding: "0.5rem 1rem", fontSize: "0.8rem" }}
          >
            Limpar campos
          </button>
        </div>
      )}

      {/* Results */}
      {hasAnyInput && results.length > 0 && (
        <div style={{ marginTop: "2.5rem" }}>
          <p className="section-eyebrow mb-4">Resultado da análise</p>
          <div style={{ display: "grid", gap: "0.875rem" }}>
            {results.map((r) => (
              <ResultCard key={r.programa} finding={r} />
            ))}
          </div>
          <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <p style={{ fontSize: "0.8rem", color: "var(--border)" }}>Ver thresholds detalhados e estratégias de remediação:</p>
            <Link href="/compliance/programas" style={{ fontSize: "0.8rem", color: "var(--primary)", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
              Diretório de Programas <ChevronRight size={12} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
