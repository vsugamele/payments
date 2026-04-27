"use client";

import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import type { CalcResult } from "@/lib/types";
import RuleReference from "./RuleReference";

interface Props {
  result: CalcResult;
}

export function ResultCard({ result }: Props) {
  if (!result.sucesso) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-950/30 p-5">
        <div className="flex items-start gap-3">
          <XCircle size={20} className="text-red-400 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-red-300">Nenhuma regra encontrada</p>
            <p className="mt-1 text-sm text-red-400/80">{result.erro}</p>
          </div>
        </div>
      </div>
    );
  }

  const isVisa = result.bandeira === "visa";
  const ruleId = isVisa
    ? (result as { rule_id?: string }).rule_id
    : (result as { ird?: string }).ird;
  const descriptor = isVisa
    ? (result as { descriptor?: string }).descriptor
    : (result as { descricao_regra?: string }).descricao_regra;
  const priority = isVisa
    ? (result as { prioridade?: number }).prioridade
    : (result as { prioridade_regra?: number }).prioridade_regra;
  const aviso = (result as { aviso?: string }).aviso;

  const rate = result.rate_pct ?? 0;
  const valor = result.valor_transacao ?? 0;
  const taxa = result.taxa_intercambio ?? 0;
  const capAplicado = result.cap_aplicado;
  const accountingSign = isVisa
    ? (result as { accounting_sign?: string }).accounting_sign
    : "PAY_ISS";

  const isExpense = accountingSign === "PAY_ISS";

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <CheckCircle size={20} className="text-emerald-400 mt-0.5 shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <p className="font-bold text-white text-base">{ruleId}</p>
              {ruleId && (
                <RuleReference 
                  manual={isVisa ? "Visa Core Rules" : "Mastercard Interchange Rules"} 
                  chapter={`Rule/IRD: ${ruleId}`} 
                />
              )}
            </div>
            {descriptor && (
              <p className="text-sm text-slate-400 mt-0.5">{descriptor}</p>
            )}
          </div>
        </div>
        {priority !== undefined && (
          <span className="shrink-0 rounded-full bg-slate-700 px-2.5 py-0.5 text-xs text-slate-300">
            prio {priority}
          </span>
        )}
      </div>

      {/* Valores */}
      <div className="grid grid-cols-3 gap-3">
        <Metric label="Valor transação" value={`R$ ${valor.toFixed(2)}`} />
        <Metric label="Taxa" value={`${rate.toFixed(4)}%`} highlight />
        <Metric
          label={`Intercâmbio ${isExpense ? "(despesa)" : "(receita)"}`}
          value={`R$ ${taxa.toFixed(4)}`}
          color={isExpense ? "text-red-300" : "text-emerald-300"}
        />
      </div>

      {/* Sinal contábil */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span
          className={`rounded-full px-2.5 py-0.5 font-medium ${
            isExpense
              ? "bg-red-900/50 text-red-300"
              : "bg-emerald-900/50 text-emerald-300"
          }`}
        >
          {accountingSign}
        </span>
        {capAplicado && (
          <span className="rounded-full bg-amber-900/50 px-2.5 py-0.5 font-medium text-amber-300">
            Teto aplicado
          </span>
        )}
        <span className="rounded-full bg-slate-700 px-2.5 py-0.5 text-slate-300">
          {result.bandeira.toUpperCase()}
        </span>
      </div>

      {/* Aviso de dado corrompido */}
      {aviso && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-950/30 p-3">
          <AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-300">{aviso}</p>
        </div>
      )}
    </div>
  );
}

function Metric({
  label,
  value,
  highlight,
  color,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  color?: string;
}) {
  return (
    <div className="rounded-lg bg-slate-900/60 p-3">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p
        className={`text-lg font-bold ${
          color ?? (highlight ? "text-blue-300" : "text-white")
        }`}
      >
        {value}
      </p>
    </div>
  );
}
