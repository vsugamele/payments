"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Globe, 
  RefreshCw, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle,
  ArrowRightLeft,
  Info,
  Layers,
  Banknote
} from "lucide-react";
import crossBorderData from "@/data/cross-border.json";

export default function CrossBorderClient() {
  const [amountBRL, setAmountBRL] = useState(1000);
  const [markup, setMarkup] = useState(3.0); // 3% de markup DCC
  const exchangeRate = 5.00; // 1 USD = 5.00 BRL (Simplificado)
  
  // Cálculos DCC
  const rateWithMarkup = exchangeRate * (1 + markup / 100);
  const amountUSD_DCC = amountBRL / rateWithMarkup;
  const amountUSD_Standard = amountBRL / exchangeRate;
  
  // Lucro do Lojista
  const merchantFXProfit = amountBRL * (markup / 100);

  return (
    <div className="space-y-12">
      
      {/* ── Simulador de Checkout DCC ── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Terminal de Venda */}
        <div className="lg:col-span-7 bg-[#0a1120] border border-slate-800 rounded-[2.5rem] p-10 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[60px]" />
           
           <div className="relative z-10">
             <div className="flex items-center justify-between mb-10">
               <div>
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ponto de Venda (POS)</p>
                 <h3 className="text-xl font-bold text-white">Opção de Moeda</h3>
               </div>
               <Globe className="text-blue-400" size={24} />
             </div>

             <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 mb-8">
               <p className="text-xs text-slate-500 mb-2">Valor da Venda</p>
               <div className="flex items-end gap-2">
                 <span className="text-4xl font-black text-white">R$ {amountBRL.toLocaleString()}</span>
                 <span className="text-sm text-slate-500 mb-1">BRL</span>
               </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Opção 1: Moeda Local */}
                <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/30 hover:border-slate-600 transition-all cursor-pointer group">
                  <p className="text-[10px] font-bold text-slate-500 uppercase mb-4 tracking-tighter">Pagar em Moeda Local</p>
                  <div className="text-xl font-bold text-white mb-1">R$ {amountBRL.toLocaleString()}</div>
                  <p className="text-[10px] text-slate-500 italic">O banco do cliente fará a conversão depois.</p>
                </div>

                {/* Opção 2: DCC (USD) */}
                <div className="p-6 rounded-3xl border-2 border-emerald-500 bg-emerald-500/5 shadow-[0_0_20px_rgba(16,185,129,0.1)] relative">
                  <div className="absolute -top-3 right-6 px-3 py-1 bg-emerald-500 text-white text-[10px] font-black rounded-full uppercase">Recomendado</div>
                  <p className="text-[10px] font-bold text-emerald-400 uppercase mb-4 tracking-tighter">Pagar em sua Moeda (USD)</p>
                  <div className="text-xl font-bold text-white mb-1">$ {amountUSD_DCC.toFixed(2)}</div>
                  <p className="text-[10px] text-emerald-500/70">Taxa Fixa: 1 USD = R$ {rateWithMarkup.toFixed(2)}</p>
                  <div className="mt-4 pt-4 border-t border-emerald-500/20">
                     <p className="text-[9px] text-emerald-400 uppercase font-bold tracking-widest">DCC Disclosure:</p>
                     <p className="text-[9px] text-slate-500 leading-tight mt-1">Este valor já inclui uma taxa de serviço de {markup}% sobre a taxa de câmbio da rede.</p>
                  </div>
                </div>
             </div>
           </div>
        </div>

        {/* Painel do Lojista (Backstage) */}
        <div className="lg:col-span-5 space-y-6">
           <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 space-y-8">
              <div>
                <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-6">Configuração de Receita FX</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Markup do Lojista (DCC)</span>
                    <div className="flex items-center gap-2">
                      <input 
                        type="range" min="0" max="5" step="0.5" 
                        value={markup} onChange={(e) => setMarkup(parseFloat(e.target.value))}
                        className="w-24 accent-blue-500"
                      />
                      <span className="text-sm font-bold text-white">{markup}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-800">
                <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                  <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-2">Seu Lucro Adicional (Markup)</p>
                  <div className="flex items-center justify-center gap-2">
                    <TrendingUp className="text-emerald-400" size={20} />
                    <span className="text-3xl font-black text-white">R$ {merchantFXProfit.toFixed(2)}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-2 italic">Você acabou de ganhar R$ {merchantFXProfit.toFixed(2)} extras apenas por processar o câmbio.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                   <HelpCircle size={16} className="text-slate-500 shrink-0 mt-0.5" />
                   <p className="text-[11px] text-slate-500 leading-relaxed">
                     <span className="text-white font-bold">Por que oferecer DCC?</span> Porque o lojista divide a margem de câmbio com o adquirente. Sem DCC, quem ganha todo o spread é o Banco Emissor do cliente.
                   </p>
                </div>
              </div>
           </div>

           <div className="bg-blue-600/10 border border-blue-500/20 rounded-3xl p-6 flex items-start gap-4">
             <Info size={20} className="text-blue-400 shrink-0 mt-1" />
             <div>
               <p className="text-xs text-white font-bold mb-1">Impacto Cross-Border</p>
               <p className="text-[11px] text-blue-200 leading-relaxed italic">
                 "Ao aceitar um cartão internacional, o custo de rede sobe. O DCC ajuda a compensar as taxas ISA/IAF de 1.00% que as bandeiras cobram em transações cross-border."
               </p>
             </div>
           </div>
        </div>
      </section>

      {/* ── Grid de Regras de Câmbio ── */}
      <section className="bg-[#0a1120] border border-slate-800 rounded-[2.5rem] p-10 overflow-hidden relative">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {crossBorderData.map(item => (
              <div key={item.id} className="space-y-4 group">
                 <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-400 group-hover:border-blue-500/50 transition-all">
                    {item.id === "dcc" ? <ArrowRightLeft size={20} /> : item.id === "isa_fee" ? <Layers size={20} /> : <Banknote size={20} />}
                 </div>
                 <div>
                    <h4 className="text-sm font-bold text-white mb-2">{item.name}</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{item.description}</p>
                 </div>
                 {item.rate && <div className="text-[10px] font-black text-blue-500 uppercase">{item.rate}</div>}
              </div>
            ))}
         </div>
      </section>

      {/* ── Seção Educativa de Campos ISO ── */}
      <section className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8">
        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
           <RefreshCw size={14} /> Mensageria ISO 8583 (Câmbio)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="p-4 rounded-xl bg-white/5 border border-slate-800">
             <p className="text-[10px] font-bold text-blue-400 uppercase mb-2">DE 06</p>
             <p className="text-xs text-white font-medium italic">Billing Amount</p>
             <p className="text-[10px] text-slate-500 mt-1">O valor exato que o portador verá na sua fatura (em USD/EUR).</p>
           </div>
           <div className="p-4 rounded-xl bg-white/5 border border-slate-800">
             <p className="text-[10px] font-bold text-blue-400 uppercase mb-2">DE 10</p>
             <p className="text-xs text-white font-medium italic">Conversion Rate</p>
             <p className="text-[10px] text-slate-500 mt-1">A taxa de câmbio aplicada naquele momento exato.</p>
           </div>
           <div className="p-4 rounded-xl bg-white/5 border border-slate-800">
             <p className="text-[10px] font-bold text-blue-400 uppercase mb-2">DE 51</p>
             <p className="text-xs text-white font-medium italic">Currency Code</p>
             <p className="text-[10px] text-slate-500 mt-1">O código numérico da moeda (840 para USD, 986 para BRL).</p>
           </div>
        </div>
      </section>
    </div>
  );
}
