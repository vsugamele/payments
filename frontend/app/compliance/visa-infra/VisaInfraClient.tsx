"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Network, 
  Database, 
  Calculator, 
  Gavel, 
  ArrowRight, 
  ChevronRight,
  ShieldAlert,
  Server,
  Cloud,
  FileText,
  Activity
} from "lucide-react";
import visaInfraData from "@/data/visa-infra.json";

export default function VisaInfraClient() {
  return (
    <div className="space-y-16">
      
      {/* ── Diagrama de Fluxo de Dados ── */}
      <section className="bg-[#0a1120] border border-slate-800 rounded-[2.5rem] p-10 lg:p-16 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none bg-[radial-gradient(circle_at_30%_30%,_#3b82f6_0%,_transparent_50%)]" />
        
        <div className="relative z-10">
          <div className="text-center mb-16">
            <h3 className="text-2xl font-bold text-white mb-2">A Jornada dos Bits (Visa Plumbing)</h3>
            <p className="text-sm text-slate-500">Como a transação sai do terminal e vira liquidação financeira.</p>
          </div>

          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 max-w-6xl mx-auto">
            
            {/* 1. Autorização */}
            <div className="flex flex-col items-center gap-4 text-center group">
               <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-all">
                 <Network size={28} />
               </div>
               <div>
                 <p className="text-xs font-black text-white uppercase tracking-tighter">VisaNet</p>
                 <p className="text-[10px] text-slate-500 max-w-[100px]">Autorização em Tempo Real</p>
               </div>
            </div>

            <ArrowRight className="hidden lg:block text-slate-800" size={20} />

            {/* 2. Clearing (VCX) */}
            <div className="flex flex-col items-center gap-4 text-center group">
               <div className="w-24 h-24 rounded-3xl bg-blue-600 border-2 border-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.3)] flex flex-col items-center justify-center text-white relative">
                 <div className="absolute -top-3 px-2 py-0.5 bg-blue-400 text-[8px] font-black rounded uppercase">VCX Portal</div>
                 <Database size={32} />
                 <p className="mt-2 text-[10px] font-bold">Base II</p>
               </div>
               <div>
                 <p className="text-xs font-black text-white uppercase tracking-tighter">Clearing</p>
                 <p className="text-[10px] text-slate-500 max-w-[120px]">Captura e Validação de Arquivos</p>
               </div>
            </div>

            <ArrowRight className="hidden lg:block text-slate-800" size={20} />

            {/* 3. Settlement (VSS) */}
            <div className="flex flex-col items-center gap-4 text-center group">
               <div className="w-24 h-24 rounded-3xl bg-emerald-600 border-2 border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)] flex flex-col items-center justify-center text-white relative">
                 <div className="absolute -top-3 px-2 py-0.5 bg-emerald-400 text-[8px] font-black rounded uppercase">VSS Engine</div>
                 <Calculator size={32} />
                 <p className="mt-2 text-[10px] font-bold">Calculation</p>
               </div>
               <div>
                 <p className="text-xs font-black text-white uppercase tracking-tighter">Settlement</p>
                 <p className="text-[10px] text-slate-500 max-w-[120px]">Posição Líquida e Câmbio</p>
               </div>
            </div>

            <ArrowRight className="hidden lg:block text-slate-800" size={20} />

            {/* 4. Funds Transfer */}
            <div className="flex flex-col items-center gap-4 text-center group">
               <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                 <Activity size={28} />
               </div>
               <div>
                 <p className="text-xs font-black text-white uppercase tracking-tighter">Liquidação</p>
                 <p className="text-[10px] text-slate-500 max-w-[100px]">Transferência no Banco Central</p>
               </div>
            </div>

          </div>

          {/* Camada PSR (A Lei) */}
          <div className="mt-16 pt-8 border-t border-slate-800/50 flex flex-col items-center">
             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                <Gavel size={12} className="text-orange-400" /> Governança PSR (Payment Service Rules)
             </div>
             <p className="text-xs text-slate-500 text-center max-w-2xl leading-relaxed">
               Todas as etapas acima são regidas pelas <strong>PSR</strong>. Qualquer falha na mensageria do VCX ou erro no cálculo do VSS pode ser auditado sob estas regras, com penalidades que garantem a integridade da rede.
             </p>
          </div>
        </div>
      </section>

      {/* ── Cards de Detalhes ── */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {visaInfraData.map(item => (
           <div key={item.id} className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-8 hover:border-slate-700 transition-all flex flex-col h-full">
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${
                  item.id === "vcx" ? "bg-blue-600/10 border-blue-500/20 text-blue-400" :
                  item.id === "vss" ? "bg-emerald-600/10 border-emerald-500/20 text-emerald-400" :
                  "bg-orange-600/10 border-orange-500/20 text-orange-400"
                }`}>
                   {item.id === "vcx" ? <Server size={24} /> : item.id === "vss" ? <Cloud size={24} /> : <FileText size={24} />}
                </div>
                <div>
                   <h4 className="text-sm font-bold text-white uppercase tracking-tighter">{item.name}</h4>
                   <p className="text-[10px] text-slate-500 font-bold uppercase">{item.id === "psr" ? "Regulamentação" : "Plumbing"}</p>
                </div>
              </div>
              
              <div className="flex-1 space-y-4">
                 <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
                 <div className="pt-4 border-t border-white/5 space-y-2">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Principais Funções:</p>
                    <p className="text-[11px] text-slate-300 leading-tight">
                      {item.function || item.topics?.join(", ")}
                    </p>
                 </div>
              </div>

              <div className="mt-8 flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/5">
                 <ShieldAlert size={14} className="text-slate-500" />
                 <p className="text-[10px] text-slate-500 leading-tight">
                   {item.benefit || item.impact || item.enforcement}
                 </p>
              </div>
           </div>
         ))}
      </section>

      {/* ── Footer de Referência ── */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
         <div className="flex items-center gap-4">
           <FileText className="text-slate-500" size={32} />
           <div>
             <h4 className="text-sm font-bold text-white">Manual VSS Volume 1 & 2</h4>
             <p className="text-[10px] text-slate-500 italic">Essencial para CFOs e times de tesouraria de adquirentes.</p>
           </div>
         </div>
         <button className="px-6 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold border border-slate-700 hover:bg-slate-700 transition-all">
           Consultar no Acervo
         </button>
      </div>
    </div>
  );
}
