"use client";

import { useState, useMemo } from "react";
import { AlertTriangle, CheckCircle2, Info, Cpu, ChevronDown, ChevronRight } from "lucide-react";
import emvData from "@/data/emv-tvr.json";
import RuleReference from "@/components/RuleReference";
import AIAssistant from "@/components/AIAssistant";

const RISK_CONFIG = {
  critical: { label: "CRÍTICO", color: "#ef4444", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.3)", icon: AlertTriangle },
  high:     { label: "ALTO",    color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)", icon: AlertTriangle },
  medium:   { label: "MÉDIO",   color: "#60a5fa", bg: "rgba(96,165,250,0.1)", border: "rgba(96,165,250,0.25)", icon: Info },
  low:      { label: "BAIXO",   color: "#4ade80", bg: "rgba(74,222,128,0.08)", border: "rgba(74,222,128,0.2)", icon: CheckCircle2 },
  none:     { label: "RFU",     color: "#475569", bg: "rgba(71,85,105,0.06)", border: "rgba(71,85,105,0.15)", icon: Info },
};

function hexToBinary(hex: string): string {
  return hex.split("").map(c => parseInt(c, 16).toString(2).padStart(4, "0")).join("");
}

function isHexValid(hex: string): boolean {
  return /^[0-9A-Fa-f]{10}$/.test(hex);
}

type BitDef = { bit: number; flag: string; risk: string; desc: string };
type ByteDef = { byte: number; label: string; bits: BitDef[] };

export default function EMVDecoderClient() {
  const [tvrHex, setTvrHex] = useState("0000000000");
  const [expandedByte, setExpandedByte] = useState<number | null>(null);
  const [activeExample, setActiveExample] = useState<string | null>(null);

  const tvr = emvData.tvr;
  const patterns = emvData.common_patterns;

  const binary = useMemo(() => {
    if (!isHexValid(tvrHex)) return null;
    return hexToBinary(tvrHex);
  }, [tvrHex]);

  const activeBits = useMemo(() => {
    if (!binary) return [];
    const results: Array<{ byteIdx: number; bitIdx: number; def: BitDef; byteLabel: string }> = [];
    (tvr.bytes as ByteDef[]).forEach((b, byteIdx) => {
      b.bits.forEach((bitDef, bitIdx) => {
        const globalBitPos = byteIdx * 8 + (7 - bitIdx);
        if (binary[globalBitPos] === "1") {
          results.push({ byteIdx, bitIdx, def: bitDef, byteLabel: b.label });
        }
      });
    });
    return results;
  }, [binary, tvr]);

  const riskSummary = useMemo(() => {
    const counts = { critical: 0, high: 0, medium: 0, low: 0, none: 0 };
    activeBits.forEach(b => {
      if (b.def.risk !== "none") counts[b.def.risk as keyof typeof counts]++;
    });
    return counts;
  }, [activeBits]);

  const overallRisk =
    riskSummary.critical > 0 ? "critical" :
    riskSummary.high > 0 ? "high" :
    riskSummary.medium > 0 ? "medium" :
    activeBits.filter(b => b.def.risk !== "none").length > 0 ? "low" : "none";

  function handleExample(hexVal: string, label: string) {
    setTvrHex(hexVal);
    setActiveExample(label);
    setExpandedByte(null);
  }

  return (
    <div className="space-y-8">

      {/* INPUT */}
      <div className="bg-code-bg border border-border rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <Cpu size={18} className="text-cyan-400" />
          <div>
            <h3 className="font-bold text-foreground text-sm">Insira o valor do TVR</h3>
            <p className="text-xs text-muted-foreground">Tag <span className="font-mono text-cyan-400">95</span> — 5 bytes em hexadecimal (10 caracteres)</p>
          </div>
          <div className="ml-auto">
            <RuleReference
              manual="EMV Book 3"
              ruleId="Annex C: Terminal Verification Results"
              description="Definição oficial dos bits do TVR conforme a especificação EMV Book 3 — Application Specification."
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={tvrHex}
              maxLength={10}
              onChange={e => { setTvrHex(e.target.value.toUpperCase()); setActiveExample(null); }}
              placeholder="Ex: C240000000"
              spellCheck={false}
              className="w-full font-mono text-xl tracking-widest bg-background border border-border rounded-xl px-4 py-3 text-cyan-300 placeholder:text-muted-foreground/30 outline-none focus:border-cyan-500/50 transition-colors uppercase"
            />
            {tvrHex.length > 0 && tvrHex.length < 10 && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{tvrHex.length}/10</span>
            )}
          </div>
          <button
            onClick={() => { setTvrHex("0000000000"); setActiveExample(null); setExpandedByte(null); }}
            className="px-4 py-3 rounded-xl border border-border bg-background text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Limpar
          </button>
        </div>

        {/* Binary display */}
        {binary && (
          <div className="font-mono text-xs flex gap-2 flex-wrap">
            {[0,1,2,3,4].map(i => (
              <div key={i} className="flex flex-col items-center gap-1">
                <span className="text-muted-foreground text-[10px]">Byte {i+1}</span>
                <div className="flex gap-0.5">
                  {binary.slice(i*8, i*8+8).split("").map((bit, j) => (
                    <span
                      key={j}
                      className={`px-1 py-0.5 rounded text-[11px] font-bold ${
                        bit === "1" ? "bg-cyan-500/20 text-cyan-300" : "bg-background text-muted-foreground/40"
                      }`}
                    >
                      {bit}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {!isHexValid(tvrHex) && tvrHex.length === 10 && (
          <p className="text-xs text-red-400">⚠ Valor inválido. Insira apenas caracteres hexadecimais (0-9, A-F).</p>
        )}
      </div>

      {/* EXEMPLOS */}
      <div>
        <p className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground mb-3">Padrões Comuns (clique para carregar)</p>
        <div className="flex flex-wrap gap-2">
          {patterns.map(p => {
            const r = RISK_CONFIG[p.risk as keyof typeof RISK_CONFIG] || RISK_CONFIG.none;
            const isActive = activeExample === p.label;
            return (
              <button
                key={p.label}
                onClick={() => handleExample(p.tvr_hex, p.label)}
                className="text-left px-3 py-2 rounded-xl border text-xs transition-all"
                style={{
                  borderColor: isActive ? r.color : "var(--border)",
                  background: isActive ? r.bg : "var(--code-bg)",
                  color: isActive ? r.color : "var(--muted-foreground)",
                }}
              >
                <span className="font-bold">{p.tvr_hex}</span>
                <span className="ml-2 opacity-70">{p.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* RESULTADO */}
      {binary && isHexValid(tvrHex) && (
        <div className="space-y-6 animate-in fade-in duration-300">

          {/* Risk Summary */}
          <div
            className="rounded-2xl border p-5 flex flex-wrap items-center gap-4"
            style={{
              background: RISK_CONFIG[overallRisk].bg,
              borderColor: RISK_CONFIG[overallRisk].border,
            }}
          >
            <div className="flex-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Diagnóstico Geral</p>
              <p className="text-xl font-black" style={{ color: RISK_CONFIG[overallRisk].color }}>
                {overallRisk === "none"
                  ? "✅ Nenhum flag de risco ativo"
                  : `⚠️ Nível ${RISK_CONFIG[overallRisk].label} — ${activeBits.filter(b => b.def.risk !== "none").length} flag(s) ativo(s)`}
              </p>
            </div>
            <div className="flex gap-3 flex-wrap items-center">
              {(["critical","high","medium","low"] as const).filter(r => riskSummary[r] > 0).map(r => (
                <div key={r} className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: RISK_CONFIG[r].bg, color: RISK_CONFIG[r].color, border: `1px solid ${RISK_CONFIG[r].border}` }}>
                  {riskSummary[r]}x {RISK_CONFIG[r].label}
                </div>
              ))}
              
              {activeBits.length > 0 && (
                <div className="ml-2 pl-4 border-l border-border/50">
                  <AIAssistant 
                    toolName="Decodificador EMV"
                    triggerLabel="Análise Forense (IA)"
                    context={`TVR Hex: ${tvrHex}. Flags ativos: ${activeBits.map(b => `${b.def.flag} (${b.def.desc})`).join(", ")}`}
                    placeholder="Pergunte sobre liability shift ou regras de fallback..."
                  />
                </div>
              )}
            </div>
          </div>

          {/* Active Flags */}
          {activeBits.filter(b => b.def.risk !== "none").length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground">Flags Ativos</p>
              {activeBits.filter(b => b.def.risk !== "none").map(({ def, byteLabel, byteIdx }) => {
                const r = RISK_CONFIG[def.risk as keyof typeof RISK_CONFIG] || RISK_CONFIG.none;
                const Icon = r.icon;
                return (
                  <div key={`${byteIdx}-${def.bit}`} className="rounded-xl border p-4 flex gap-3" style={{ background: r.bg, borderColor: r.border }}>
                    <Icon size={16} style={{ color: r.color }} className="shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded font-bold" style={{ background: `${r.color}20`, color: r.color }}>
                          Byte {byteIdx + 1} · bit {def.bit}
                        </span>
                        <span className="text-[10px] text-muted-foreground">{byteLabel}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: r.bg, color: r.color, border: `1px solid ${r.border}` }}>
                          {r.label}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-foreground mb-1">{def.flag}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{def.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* All Bytes Breakdown */}
          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground">Breakdown por Byte</p>
            {(tvr.bytes as ByteDef[]).map((byteData, byteIdx) => {
              const byteHex = tvrHex.slice(byteIdx * 2, byteIdx * 2 + 2);
              const byteBin = binary.slice(byteIdx * 8, byteIdx * 8 + 8);
              const isExpanded = expandedByte === byteIdx;
              const activeInByte = byteData.bits.filter((bit, i) => byteBin[7 - i] === "1" && bit.risk !== "none");

              return (
                <div key={byteIdx} className="bg-code-bg border border-border rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedByte(isExpanded ? null : byteIdx)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-background/50 transition-colors"
                  >
                    <span className="font-mono text-cyan-400 font-bold w-16 text-sm">{byteHex}h</span>
                    <span className="font-mono text-muted-foreground/50 text-xs tracking-widest">{byteBin}</span>
                    <span className="text-xs text-muted-foreground ml-2">{byteData.label}</span>
                    {activeInByte.length > 0 && (
                      <span className="ml-auto flex items-center gap-1 text-xs font-bold text-amber-400">
                        <AlertTriangle size={11} /> {activeInByte.length}
                      </span>
                    )}
                    {activeInByte.length === 0 && (
                      <span className="ml-auto text-xs text-emerald-400/60 flex items-center gap-1">
                        <CheckCircle2 size={11} /> OK
                      </span>
                    )}
                    {isExpanded ? <ChevronDown size={14} className="text-muted-foreground ml-1" /> : <ChevronRight size={14} className="text-muted-foreground ml-1" />}
                  </button>

                  {isExpanded && (
                    <div className="border-t border-border">
                      {byteData.bits.map((bit, i) => {
                        const isSet = byteBin[7 - i] === "1";
                        const r = RISK_CONFIG[bit.risk as keyof typeof RISK_CONFIG] || RISK_CONFIG.none;
                        if (!isSet && bit.risk === "none") return null;
                        return (
                          <div
                            key={i}
                            className="flex gap-3 px-4 py-3 border-b border-border/40 last:border-0"
                            style={{ background: isSet && bit.risk !== "none" ? r.bg : "transparent" }}
                          >
                            <span className={`font-mono text-xs font-bold shrink-0 w-4 ${isSet ? "text-cyan-300" : "text-muted-foreground/30"}`}>
                              {isSet ? "1" : "0"}
                            </span>
                            <span className="font-mono text-[10px] text-muted-foreground w-10 shrink-0 pt-0.5">b{bit.bit}</span>
                            <div className="flex-1">
                              <p className={`text-xs font-semibold mb-0.5 ${isSet && bit.risk !== "none" ? "text-foreground" : "text-muted-foreground/50"}`}>
                                {bit.flag}
                              </p>
                              {isSet && (
                                <p className="text-xs text-muted-foreground leading-relaxed">{bit.desc}</p>
                              )}
                            </div>
                            {isSet && bit.risk !== "none" && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full h-fit shrink-0" style={{ background: r.bg, color: r.color, border: `1px solid ${r.border}` }}>
                                {r.label}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
