"use client";

import React from "react";
import { 
  Briefcase, Users, DollarSign, AlertOctagon, 
  ArrowRight, ShieldAlert, Sparkles, Building2
} from "lucide-react";

export interface ExecutiveBusinessTriadProps {
  topic: string;
  subtitle?: string;
  whatIsIt: {
    lead: string;
    explanation: string;
    analogy?: string;
  };
  painOwner: {
    primaryRole: string;
    affectedEntities: string[];
    operationalImpact: string;
  };
  financialPrice: {
    directPenalty: string;
    schemeFeesFine?: string;
    annualBleedingEstimate: string;
    consequence: string;
  };
}

export function ExecutiveBusinessTriad({
  topic,
  subtitle,
  whatIsIt,
  painOwner,
  financialPrice,
}: ExecutiveBusinessTriadProps) {
  return (
    <div className="my-8 rounded-2xl border border-slate-800 bg-[#080d16] p-6 md:p-8 shadow-xl relative overflow-hidden">
      {/* Glow de fundo sutil */}
      <div className="absolute top-0 right-1/4 w-96 h-32 bg-blue-500/5 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-10 w-96 h-32 bg-red-500/5 blur-3xl pointer-events-none rounded-full" />

      {/* Header da Seção Executiva */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-6 border-b border-slate-800/80 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Briefcase size={13} />
            Tradução para Negócios & Risco Executivo
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white">
            {topic}
          </h2>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Diretriz C-Level & Compliance</span>
        </div>
      </div>

      {/* As 3 Colunas da Tríade */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna 1: O Que É */}
        <div className="flex flex-col justify-between rounded-xl bg-slate-900/50 border border-slate-800 p-5 hover:border-blue-500/30 transition-all">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block">
                  Visão Executiva
                </span>
                <h3 className="text-sm font-bold text-white">
                  O Que É em Termos Simples
                </h3>
              </div>
            </div>

            <p className="text-xs font-semibold text-slate-200 leading-relaxed">
              {whatIsIt.lead}
            </p>

            <p className="text-xs text-slate-400 leading-relaxed">
              {whatIsIt.explanation}
            </p>

            {whatIsIt.analogy && (
              <div className="p-3 rounded-lg bg-blue-950/20 border border-blue-500/20 text-[11px] text-blue-300 italic leading-relaxed">
                💡 <strong>Analogia:</strong> {whatIsIt.analogy}
              </div>
            )}
          </div>
        </div>

        {/* Coluna 2: Quem é o Dono da Dor */}
        <div className="flex flex-col justify-between rounded-xl bg-slate-900/50 border border-slate-800 p-5 hover:border-amber-500/30 transition-all">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                  Responsabilidade
                </span>
                <h3 className="text-sm font-bold text-white">
                  Quem é o Dono da Dor
                </h3>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1">
                Liderança Principal:
              </span>
              <p className="text-xs font-bold text-amber-200">
                {painOwner.primaryRole}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1.5">
                Atores Impactados:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {painOwner.affectedEntities.map((ent, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700"
                  >
                    {ent}
                  </span>
                ))}
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed pt-1">
              <strong className="text-slate-300">Impacto na Operação:</strong> {painOwner.operationalImpact}
            </p>
          </div>
        </div>

        {/* Coluna 3: Preço Financeiro do Erro */}
        <div className="flex flex-col justify-between rounded-xl bg-slate-900/50 border border-slate-800 p-5 hover:border-red-500/30 transition-all">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 block">
                  Sangramento Financeiro
                </span>
                <h3 className="text-sm font-bold text-white">
                  Preço Financeiro do Erro
                </h3>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-red-950/20 border border-red-500/30">
              <span className="text-[10px] font-mono uppercase text-red-400 block">
                Penalidade Tarifária Direta
              </span>
              <span className="text-sm font-black font-mono text-white mt-0.5 block">
                {financialPrice.directPenalty}
              </span>
              {financialPrice.schemeFeesFine && (
                <span className="text-[11px] font-mono text-red-300 mt-1 block">
                  + {financialPrice.schemeFeesFine}
                </span>
              )}
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-500 block">
                Estimativa de Sangramento Anual:
              </span>
              <span className="text-xs font-mono font-bold text-amber-300 block">
                {financialPrice.annualBleedingEstimate}
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed pt-1">
              <strong className="text-slate-300">Consequência Final:</strong> {financialPrice.consequence}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
