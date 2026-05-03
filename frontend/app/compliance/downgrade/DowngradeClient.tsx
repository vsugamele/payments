"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  TrendingDown, 
  AlertTriangle, 
  ArrowDownRight, 
  DollarSign, 
  ChevronRight,
  Zap,
  ShieldAlert,
  Clock,
  Settings,
  Search,
  CheckCircle2,
  XCircle,
  HelpCircle
} from "lucide-react";
import downgradeRules from "@/data/downgrade-rules.json";

export default function DowngradeClient() {
  const [activeRules, setActiveRules] = useState<string[]>([]);
  const [volume, setVolume] = useState(1000000); // R$ 1 Milhão
  const baseRate = 0.50; // Taxa ideal (ex: Supermercado Merit 1)

  const toggleRule = (id: string) => {
    setActiveRules(prev => 
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const totalDowngradeImpact = activeRules.reduce((acc, id) => {
    const rule = downgradeRules.find(r => r.id === id);
    return acc + (rule?.impact_pct || 0);
  }, 0);

  const finalRate = baseRate + totalDowngradeImpact;
  const financialLoss = (totalDowngradeImpact / 100) * volume;

  return (
    <div className="space-y-10">
      
      {/* ── Painel de Controle de Cenário ── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Lado Esquerdo: Simulador de Erros */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Settings className="text-blue-400" size={20} />
              <h2 className="text-sm font-bold text-white uppercase tracking-widest">Configurador de Ineficiência</h2>
            </div>
            <span className="text-[10px] text-slate-500 font-bold px-2 py-1 bg-slate-900 rounded border border-slate-800">
              Cenário Base: 0.50% (Ideal)
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {downgradeRules.map((rule) => {
              const isActive = activeRules.includes(rule.id);
              return (
                <button
                  key={rule.id}
                  onClick={() => toggleRule(rule.id)}
                  className={`w-full text-left p-5 rounded-3xl border transition-all flex items-center justify-between group ${
                    isActive 
                      ? "bg-red-500/10 border-red-500/50 shadow-[0_0_20px_-5px_rgba(239,68,68,0.2)]" 
                      : "bg-[#0a1120] border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${
                      isActive ? "bg-red-500 text-white border-red-400" : "bg-slate-900 border-slate-800"
                    }`}>
                      {rule.category === "Operacional" ? <Clock size={20} /> : rule.category === "Segurança" ? <ShieldAlert size={20} /> : <Zap size={20} />}
                    </div>
                    <div>
                      <h3 className={`text-sm font-bold mb-0.5 transition-colors ${isActive ? "text-white" : "text-slate-300"}`}>
                        {rule.name}
                      </h3>
                      <p className="text-[10px] text-slate-500 leading-tight max-w-[300px]">
                        {rule.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-black mb-1 ${isActive ? "text-red-400" : "text-slate-500"}`}>
                      +{rule.impact_pct.toFixed(2)}%
                    </p>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                      isActive ? "border-red-500 bg-red-500" : "border-slate-700"
                    }`}>
                      {isActive && <CheckCircle2 size={10} className="text-white" />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Lado Direito: Impacto no P&L */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 space-y-6">
            <div className="bg-gradient-to-br from-[#0f172a] to-[#030711] border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden relative">
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-[60px]" />
              
              <div className="relative z-10 space-y-8">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Métrica de Intercâmbio Rebaixado</p>
                  <div className="flex items-end gap-3">
                    <span className={`text-6xl font-black tracking-tighter transition-colors ${activeRules.length > 0 ? "text-red-500" : "text-emerald-500"}`}>
                      {finalRate.toFixed(2)}%
                    </span>
                    <div className="mb-2">
                       <p className="text-[10px] font-bold text-slate-500 uppercase">Taxa Final</p>
                       <p className={`text-xs font-bold ${activeRules.length > 0 ? "text-red-400" : "text-emerald-400"}`}>
                         {activeRules.length > 0 ? "Downgrade Aplicado" : "Optimal Performance"}
                       </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-8 border-t border-slate-800/50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">Volume Transacionado</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-300 font-mono">R$</span>
                      <input 
                        type="number" 
                        value={volume} 
                        onChange={(e) => setVolume(parseInt(e.target.value))}
                        className="bg-transparent border-b border-slate-700 text-sm text-white font-bold w-28 text-right outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">Perda de Margem (Lucro Real)</span>
                    <span className="text-lg font-bold text-red-500">- R$ {financialLoss.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <div className={`p-4 rounded-2xl transition-all ${activeRules.length > 0 ? "bg-red-500/5 border border-red-500/20" : "bg-emerald-500/5 border border-emerald-500/20"}`}>
                   <div className="flex items-start gap-3">
                     <HelpCircle size={16} className={activeRules.length > 0 ? "text-red-400" : "text-emerald-400"} />
                     <p className="text-[11px] text-slate-400 leading-relaxed">
                       {activeRules.length > 0 
                         ? `Sua margem bruta de adquirente foi corroída em R$ ${financialLoss.toLocaleString()}. Este valor vai direto para o Banco Emissor como penalidade normativa.`
                         : "Parabéns. Sua operação está 100% otimizada. Você está capturando o intercâmbio mais baixo possível para este cenário."}
                     </p>
                   </div>
                </div>
              </div>
            </div>

            {/* Insight de Otimização */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6">
              <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Zap size={12} /> Diagnóstico Técnico
              </h4>
              <div className="space-y-4">
                {activeRules.length === 0 && (
                  <p className="text-xs text-slate-500 italic">Nenhum erro operacional detectado.</p>
                )}
                {activeRules.map(id => {
                  const rule = downgradeRules.find(r => r.id === id);
                  return (
                    <div key={id} className="flex items-start gap-3">
                      <div className="w-1 h-1 rounded-full bg-red-500 mt-1.5 shrink-0" />
                      <p className="text-[11px] text-slate-300">
                        <span className="font-bold text-white">{rule?.name}:</span> {rule?.reason}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer Educativo ── */}
      <div className="bg-blue-600/5 border border-blue-600/10 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8">
        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
          <TrendingDown size={32} />
        </div>
        <div>
          <h3 className="text-white font-bold mb-2">O que é a Gestão de Interchange?</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Adquirentes de alta performance têm times dedicados apenas a caçar downgrades. Pequenos ajustes no código do gateway (enviar o Entry Mode correto ou liquidar em D+1) podem economizar milhões de reais em intercâmbio.
          </p>
        </div>
      </div>
    </div>
  );
}
