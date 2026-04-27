"use client";

import type { CascataStep } from "@/lib/types";
import { CheckCircle, XCircle, ChevronDown, ChevronUp, ArrowDown } from "lucide-react";
import { useState } from "react";
import RuleReference from "./RuleReference";

interface Props {
  steps: CascataStep[];
  winnerRuleId?: string;
}

export function Cascata({ steps, winnerRuleId }: Props) {
  const [expanded, setExpanded] = useState(true);
  const [showAll, setShowAll] = useState(false);

  if (!steps.length) return null;

  const failures = steps.filter((s) => !s.result);
  const winner = steps.find((s) => s.result);

  // Exibir X falhas iniciais se showAll for false
  let visible = showAll ? steps : steps.slice(0, 5);
  
  // Garantir que a regra vencedora (se houver) esteja sempre visível no final
  if (!showAll && winner && !visible.find(s => s.rule_id === winnerRuleId)) {
     visible = [...visible, winner];
  }
  
  const hasMore = steps.length > visible.length;

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header colapsável */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-4 text-left bg-slate-800/80 hover:bg-slate-800 transition-colors border-b border-slate-700/50"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
            <ArrowDown size={18} />
          </div>
          <div>
            <span className="block text-sm font-bold text-slate-200">
              Timeline de Avaliação (Cascata)
            </span>
            <span className="block text-xs text-slate-400 mt-0.5">
              {steps.length} regras testadas · {failures.length} reprovadas
            </span>
          </div>
        </div>
        {expanded ? (
          <ChevronUp size={20} className="text-slate-400" />
        ) : (
          <ChevronDown size={20} className="text-slate-400" />
        )}
      </button>

      {expanded && (
        <div className="px-5 py-6 bg-slate-900/50">
          <div className="relative border-l-[3px] border-slate-800 ml-3 space-y-6">
            {visible.map((step, i) => {
              const isWinner = step.result && step.rule_id === winnerRuleId;
              
              // Se não for o ganhador e showAll for false e for o último item visível antes do winner
              const isLastBeforeWinner = !showAll && !isWinner && i === visible.length - 2 && winner;

              return (
                <div key={`${step.rule_id}-${i}`} className="relative pl-6">
                  {/* Ponto / Nó na linha do tempo */}
                  <span className={`absolute -left-[10px] top-3 flex h-[17px] w-[17px] items-center justify-center rounded-full ring-4 ring-slate-900 ${
                    isWinner ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-slate-700"
                  }`}>
                    {isWinner && <CheckCircle size={12} className="text-emerald-950" />}
                  </span>

                  {/* Conteúdo do Card */}
                  <div className={`rounded-xl border p-4 transition-all duration-300 ${
                    isWinner 
                      ? "bg-emerald-900/20 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]" 
                      : "bg-slate-800/30 border-slate-700/50 opacity-60 hover:opacity-100 hover:bg-slate-800/60"
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded-md ${
                            isWinner ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-700/50 text-slate-400"
                          }`}>
                            {step.rule_id}
                          </span>
                          <span className="text-[10px] font-medium uppercase tracking-widest text-slate-500">
                            Prio: {step.priority}
                          </span>
                        </div>
                        <p className={`text-sm ${isWinner ? "text-slate-200 font-medium" : "text-slate-400"}`}>
                          {step.descriptor ?? step.description}
                        </p>
                      </div>

                      {/* Status / Ação à direita */}
                      <div className="shrink-0 flex sm:flex-col items-center sm:items-end gap-3 sm:gap-2">
                         {isWinner ? (
                           <>
                             <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
                               <CheckCircle size={14} /> MATCH VENCEDOR
                             </span>
                             <RuleReference 
                                manual="Regras de Intercâmbio" 
                                chapter={`Regra: ${step.rule_id}`} 
                                label="VER DETALHE"
                             />
                           </>
                         ) : (
                           <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-800/80 px-2.5 py-1 text-xs font-medium text-slate-500">
                             <XCircle size={12} /> Pulou
                           </span>
                         )}
                      </div>
                    </div>
                  </div>

                  {/* Ponto tracejado indicando continuidade se houver regras ocultadas */}
                  {isLastBeforeWinner && hasMore && (
                     <div className="absolute -bottom-7 -left-[9px] w-4 flex flex-col items-center justify-center pointer-events-none">
                       <div className="h-5 border-l-[3px] border-dashed border-slate-600"></div>
                     </div>
                  )}
                </div>
              );
            })}
          </div>

          {hasMore && (
            <div className="mt-8 text-center pl-3">
              <button
                onClick={() => setShowAll((v) => !v)}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-800 px-5 py-2.5 text-xs font-medium text-slate-300 shadow-sm transition-all hover:bg-slate-700 hover:text-white"
              >
                {showAll ? (
                  <>Ver menos etapas <ChevronUp size={14} /></>
                ) : (
                  <>Revelar mais {steps.length - visible.length} regras falhas <ChevronDown size={14} /></>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
