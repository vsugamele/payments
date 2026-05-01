"use client";

import React from "react";
import { ArrowRight, DollarSign, TrendingDown, TrendingUp, Briefcase } from "lucide-react";
import TermTooltip from "./TermTooltip";

interface ProvisioningWaterfallProps {
  valorTransacao: number;
  mdrPct: number;
  interchangePct: number;
  schemeFeePct: number;
  bandeira: string;
}

export function ProvisioningWaterfall({
  valorTransacao,
  mdrPct,
  interchangePct,
  schemeFeePct,
  bandeira,
}: ProvisioningWaterfallProps) {
  const isVisa = bandeira.toLowerCase() === "visa";

  const receitaMdr = (valorTransacao * mdrPct) / 100;
  const custoIntercambio = (valorTransacao * interchangePct) / 100;
  const custoSchemeFee = (valorTransacao * schemeFeePct) / 100;
  const margemLiquida = receitaMdr - custoIntercambio - custoSchemeFee;
  
  const isLucro = margemLiquida >= 0;

  const formatBRL = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  return (
    <div className="mt-8 rounded-xl border border-slate-700 bg-[#0d1520] overflow-hidden">
      <div className="border-b border-slate-700/50 bg-slate-800/40 p-4">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <Briefcase size={16} className="text-blue-400" />
          Simulador de Spread / Provisionamento de Adquirente
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Demonstração de como a Adquirente contabiliza a transação no seu processo de clearing (
          {isVisa ? "VSS / Base II" : "GCMS"}) e settlement.
        </p>
      </div>

      <div className="p-5">
        <div className="space-y-4">
          
          {/* Receita MDR */}
          <div className="flex items-center justify-between rounded-lg bg-emerald-900/10 border border-emerald-500/20 p-3">
            <div>
              <span className="block text-xs font-bold text-emerald-400">1. RECEITA BRUTA (MDR {mdrPct.toFixed(2)}%)</span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Descontado do Lojista</span>
            </div>
            <span className="text-base font-mono font-bold text-emerald-400">
              + {formatBRL(receitaMdr)}
            </span>
          </div>

          <div className="pl-4 flex flex-col items-start space-y-2 relative border-l-2 border-slate-700 ml-4">
            
            {/* Custo Intercambio */}
            <div className="w-full flex items-center justify-between relative">
               <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-4 h-[2px] bg-slate-700"></div>
               <div className="flex-1 rounded-lg bg-rose-900/10 border border-rose-500/20 p-3">
                 <div className="flex justify-between items-center">
                    <div>
                      <span className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
                         <TrendingDown size={14} /> 2. CUSTO INTERCÂMBIO ({interchangePct.toFixed(2)}%)
                      </span>
                      <span className="text-[11px] text-slate-400 mt-0.5 block">
                        Repassado para o Banco Emissor
                      </span>
                    </div>
                    <span className="text-sm font-mono font-bold text-rose-400">
                      - {formatBRL(custoIntercambio)}
                    </span>
                 </div>
               </div>
            </div>

            {/* Custo Scheme Fee */}
            <div className="w-full flex items-center justify-between relative">
               <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-4 h-[2px] bg-slate-700"></div>
               <div className="flex-1 rounded-lg bg-rose-900/10 border border-rose-500/20 p-3">
                 <div className="flex justify-between items-center">
                    <div>
                      <span className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
                         <TrendingDown size={14} /> 3. SCHEME FEE / BRAND FEE ({schemeFeePct.toFixed(2)}%)
                      </span>
                      <span className="text-[11px] text-slate-400 mt-0.5 block">
                        Taxa da {isVisa ? "Visa" : "Mastercard"} (Estimativa)
                      </span>
                    </div>
                    <span className="text-sm font-mono font-bold text-rose-400">
                      - {formatBRL(custoSchemeFee)}
                    </span>
                 </div>
               </div>
            </div>

          </div>

          {/* Resultado Liquido */}
          <div className={`flex items-center justify-between rounded-lg border p-4 mt-2 ${
            isLucro 
              ? "bg-emerald-900/20 border-emerald-500/30" 
              : "bg-rose-900/20 border-rose-500/30"
          }`}>
            <div>
              <span className={`block text-xs font-black uppercase tracking-wider ${isLucro ? "text-emerald-400" : "text-rose-400"}`}>
                = Margem Líquida (Spread Adquirente)
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                {isLucro 
                  ? "A adquirente teve lucro nesta transação após pagar o ecossistema."
                  : "A adquirente teve PREJUÍZO (Intercâmbio/Custos maiores que o MDR)."}
              </span>
            </div>
            <div className={`text-xl font-mono font-bold flex items-center gap-2 ${isLucro ? "text-emerald-400" : "text-rose-400"}`}>
              {isLucro ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
              {isLucro ? "+" : ""}{formatBRL(margemLiquida)}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
