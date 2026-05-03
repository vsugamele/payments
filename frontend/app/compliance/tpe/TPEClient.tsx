"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Zap, 
  Target, 
  AlertOctagon, 
  TrendingDown, 
  ArrowRight, 
  Calculator, 
  CheckCircle2, 
  XCircle,
  BarChart3,
  Search,
  Settings,
  ChevronRight,
  ShieldAlert
} from "lucide-react";
import tpeData from "@/data/mastercard-tpe.json";

export default function TPEClient() {
  const [retries, setRetries] = useState(15);
  const [volume, setVolume] = useState(10000);

  // Cálculo de multa de retentativa (exemplo simplificado do programa Optimizer)
  const excessiveRetries = Math.max(0, retries - 10);
  const penaltyPerTransaction = 0.05; // USD
  const totalPenalty = volume * excessiveRetries * penaltyPerTransaction;

  return (
    <div className="space-y-10">
      
      {/* ── Dashboard de Eficiência (Métrica TPE) ── */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#0a1120] border border-slate-800 rounded-[2rem] p-8">
          <div className="flex items-center gap-3 mb-6">
            <Target className="text-blue-400" size={24} />
            <h2 className="text-xl font-bold text-white">Simulador de Penalidades TPE</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block">
                Volume de Transações Negadas (Mês)
              </label>
              <input 
                type="range" min="1000" max="100000" step="1000"
                value={volume} onChange={(e) => setVolume(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between font-mono text-sm">
                <span className="text-slate-400">{volume.toLocaleString()} txs</span>
                <span className="text-blue-400 font-bold">Volume Crítico</span>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block">
                Média de Retentativas por Cartão (24h)
              </label>
              <input 
                type="range" min="1" max="30" step="1"
                value={retries} onChange={(e) => setRetries(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-500"
              />
              <div className="flex justify-between font-mono text-sm">
                <span className={retries > 10 ? "text-red-400 font-bold" : "text-emerald-400"}>
                  {retries} Tentativas {retries > 10 ? "(Acima do Limite)" : "(Safe)"}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/20 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1">Impacto Financeiro Estimado (Monthly Billing)</p>
              <h3 className="text-3xl font-black text-white">USD {totalPenalty.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
              <p className="text-xs text-slate-500 mt-2">Baseado no item **Authorization Optimizer** da Mastercard.</p>
            </div>
            <div className="flex gap-3">
              <div className="text-center p-3 px-6 rounded-xl bg-slate-900 border border-slate-800">
                <p className="text-[10px] text-slate-500 uppercase font-bold">Txs Excedentes</p>
                <p className="text-lg font-bold text-white">{excessiveRetries * volume}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Card Pedagógico TPE */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] p-8 text-white flex flex-col justify-between shadow-2xl">
          <div>
            <Zap size={32} className="mb-6 opacity-80" />
            <h3 className="text-xl font-bold mb-4 leading-tight">Por que o TPE existe?</h3>
            <p className="text-sm text-blue-100 leading-relaxed">
              A Mastercard pune a <strong>ineficiência</strong>. Retentar transações sem fundos (RC 51) consome recursos do switch e aumenta o risco de fraude. O TPE força o adquirente a ter uma engenharia de mensageria impecável.
            </p>
          </div>
          <div className="pt-6 border-t border-white/20 mt-6">
            <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-2">Dica de Ouro</p>
            <p className="text-sm font-medium">Use a regra de 'Cool Down': Cartão negado por RC 51? Espere 24h para tentar de novo.</p>
          </div>
        </div>
      </section>

      {/* ── Lista de Regras TPE ── */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="text-slate-400" size={20} />
            <h2 className="text-sm font-bold text-white uppercase tracking-widest">Matriz de Monitoramento TPE</h2>
          </div>
          <span className="text-[10px] font-bold text-slate-500">Mastercard v2025.1</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tpeData.map((item) => (
            <div key={item.id} className="bg-[#0a1120] border border-slate-800 rounded-3xl p-6 hover:border-slate-600 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-400">
                  {item.id === "retry_optimizer" ? <TrendingDown size={24} /> : item.id === "data_integrity" ? <ShieldAlert size={24} /> : <BarChart3 size={24} />}
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Penalidade</p>
                  <p className="text-xs font-bold text-red-400">{item.penalty}</p>
                </div>
              </div>

              <h3 className="text-white font-bold mb-2">{item.name}</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">{item.description}</p>
              
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center justify-between">
                   <span className="text-[10px] font-bold text-slate-500 uppercase">Limite Aceitável</span>
                   <span className="text-xs text-white font-mono">{item.threshold}</span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-start gap-3">
                   <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                   <p className="text-[11px] text-slate-300 leading-tight">
                     <span className="font-bold text-emerald-400">Ação Sugerida:</span> {item.tip}
                   </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Call to Action ── */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 flex items-center justify-between">
        <div>
          <h4 className="text-white font-bold mb-1">Quer auditar seus logs ISO 8583?</h4>
          <p className="text-xs text-slate-400">Nosso parser detecta campos mal preenchidos que podem gerar multas TPE.</p>
        </div>
        <button className="px-6 py-2.5 bg-white text-black rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-slate-200 transition-all">
          Ir para Laboratório de Logs <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
