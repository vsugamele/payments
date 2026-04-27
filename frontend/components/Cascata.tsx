"use client";

import type { CascataStep } from "@/lib/types";
import { CheckCircle, XCircle, ChevronDown, ChevronUp } from "lucide-react";
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
  const visible = showAll ? steps : steps.slice(0, 8);
  const hasMore = steps.length > 8;

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/60">
      {/* Header colapsável */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-200">
            Cascata de Avaliação
          </span>
          <span className="rounded-full bg-slate-700 px-2 py-0.5 text-xs text-slate-400">
            {steps.length} regras testadas · {failures.length} reprovadas
          </span>
        </div>
        {expanded ? (
          <ChevronUp size={16} className="text-slate-400" />
        ) : (
          <ChevronDown size={16} className="text-slate-400" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-slate-700 px-5 py-4 space-y-1">
          {visible.map((step, i) => {
            const isWinner = step.result && step.rule_id === winnerRuleId;
            return (
              <div
                key={i}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  isWinner
                    ? "bg-emerald-900/30 border border-emerald-500/30"
                    : step.result
                    ? "bg-emerald-900/20"
                    : "hover:bg-slate-700/30"
                }`}
              >
                {/* ícone */}
                {step.result ? (
                  <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                ) : (
                  <XCircle size={14} className="text-slate-600 shrink-0" />
                )}

                {/* prioridade */}
                <span className="w-8 text-right text-xs text-slate-500 shrink-0">
                  {step.priority}
                </span>

                {/* rule id */}
                <span
                  className={`font-mono text-xs font-medium shrink-0 ${
                    step.result ? "text-emerald-300" : "text-slate-400"
                  }`}
                >
                  {step.rule_id}
                </span>

                {/* descrição */}
                {(step.descriptor ?? step.description) && (
                  <span className="text-xs text-slate-500 truncate">
                    {step.descriptor ?? step.description}
                  </span>
                )}

                {isWinner && (
                  <div className="ml-auto flex items-center gap-2">
                    <RuleReference 
                      manual="Tabelas de Intercâmbio" 
                      chapter={`Regra avaliada: ${step.rule_id}`} 
                      label="VER REGRA"
                    />
                    <span className="shrink-0 rounded-full bg-emerald-700 px-2 py-0.5 text-xs font-bold text-emerald-100">
                      VENCEDORA
                    </span>
                  </div>
                )}
              </div>
            );
          })}

          {hasMore && (
            <button
              onClick={() => setShowAll((v) => !v)}
              className="mt-2 w-full rounded-lg border border-slate-700 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              {showAll
                ? "Mostrar menos"
                : `Ver mais ${steps.length - 8} regras`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
