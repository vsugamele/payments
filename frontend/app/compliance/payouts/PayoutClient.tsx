"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Zap, 
  Clock, 
  ShieldCheck, 
  Users, 
  Smartphone, 
  CreditCard,
  ArrowRight,
  Info,
  DollarSign,
  AlertCircle
} from "lucide-react";
import pushData from "@/data/push-payments.json";
import AIAssistant from "@/components/AIAssistant";


function StepIconDisplay({ stepIndex, steps }: { stepIndex: number; steps: { icon: any }[] }) {
  const Icon = steps[stepIndex]?.icon;
  if (!Icon) return null;
  return (
    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-blue-400 shrink-0">
      <Icon size={20} />
    </div>
  );
}

export default function PayoutClient() {
  const [step, setStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const steps = [
    { name: "Sender Initiation", icon: Users, desc: "Remetente inicia o envio de R$ 500,00" },
    { name: "AFT (Pull)", icon: ArrowDownLeft, desc: "Débito no cartão do remetente (Funding)" },
    { name: "Network Routing", icon: Zap, desc: "Visa Direct / MC Send processando" },
    { name: "OCT (Push)", icon: ArrowUpRight, desc: "Crédito na conta do destinatário (Payout)" },
    { name: "Fast Funds", icon: Clock, desc: "Disponibilização em < 30 min" }
  ];

  const handleSimulate = () => {
    setIsProcessing(true);
    setStep(0);
    const interval = setInterval(() => {
      setStep(prev => {
        if (prev >= 4) {
          clearInterval(interval);
          setIsProcessing(false);
          return 4;
        }
        return prev + 1;
      });
    }, 1500);
  };

  return (
    <div className="space-y-10">
      
      {/* ── Simulador de Fluxo Push ── */}
      <section className="bg-[#0a1120] border border-slate-800 rounded-[2.5rem] p-8 lg:p-12 relative overflow-hidden">
        {/* Background Visual */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/4" />
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-white mb-2">Simulador de Real-time Payout</h3>
            <p className="text-sm text-slate-500">Veja como o dinheiro se move do cartão A para o cartão B instantaneamente.</p>
          </div>

          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 w-full max-w-5xl">
            
            {/* Sender */}
            <div className={`p-6 rounded-3xl border-2 transition-all duration-500 ${step >= 1 ? "bg-blue-600/10 border-blue-500" : "bg-slate-900 border-slate-800"}`}>
               <Smartphone size={32} className={step >= 1 ? "text-blue-400" : "text-slate-600"} />
               <div className="mt-4">
                 <p className="text-[10px] font-bold text-slate-500 uppercase">Remetente</p>
                 <p className="text-sm font-bold text-white">André Silva</p>
               </div>
            </div>

            <div className="flex-1 flex flex-col items-center gap-4">
               {/* Transação AFT */}
               <div className="w-full h-px bg-slate-800 relative">
                  <AnimatePresence>
                    {isProcessing && step === 1 && (
                      <motion.div 
                        initial={{ left: 0 }} animate={{ left: "100%" }}
                        className="absolute -top-1 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]"
                      />
                    )}
                  </AnimatePresence>
               </div>
               <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${step >= 1 ? "bg-blue-500/20 text-blue-400" : "text-slate-700"}`}>
                 AFT (Pull)
               </span>
            </div>

            {/* Network Hub */}
            <div className={`w-20 h-20 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${step >= 2 ? "bg-white text-blue-600 border-blue-400 scale-110 shadow-[0_0_40px_rgba(59,130,246,0.2)]" : "bg-slate-900 border-slate-800 text-slate-700"}`}>
               <Zap size={32} className={step >= 2 ? "animate-pulse" : ""} />
            </div>

            <div className="flex-1 flex flex-col items-center gap-4">
               {/* Transação OCT */}
               <div className="w-full h-px bg-slate-800 relative">
                  <AnimatePresence>
                    {isProcessing && step === 3 && (
                      <motion.div 
                        initial={{ left: 0 }} animate={{ left: "100%" }}
                        className="absolute -top-1 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"
                      />
                    )}
                  </AnimatePresence>
               </div>
               <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${step >= 3 ? "bg-emerald-500/20 text-emerald-400" : "text-slate-700"}`}>
                 OCT (Push)
               </span>
            </div>

            {/* Receiver */}
            <div className={`p-6 rounded-3xl border-2 transition-all duration-500 ${step >= 3 ? "bg-emerald-600/10 border-emerald-500" : "bg-slate-900 border-slate-800"}`}>
               <CreditCard size={32} className={step >= 3 ? "text-emerald-400" : "text-slate-600"} />
               <div className="mt-4">
                 <p className="text-[10px] font-bold text-slate-500 uppercase">Destinatário</p>
                 <p className="text-sm font-bold text-white">Carla Dias</p>
               </div>
            </div>

          </div>

          <button 
            onClick={handleSimulate}
            disabled={isProcessing}
            className={`mt-12 px-8 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 ${
              isProcessing ? "bg-slate-800 text-slate-500 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-500 shadow-xl shadow-blue-600/20"
            }`}
          >
            {isProcessing ? "Processando Payout..." : "Iniciar Envio Real-time"}
            {!isProcessing && <ArrowRight size={18} />}
          </button>
        </div>

        {/* Info Box do Passo Atual */}
        <div className="mt-12 max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-6 rounded-2xl bg-white/5 border border-slate-800 flex items-start gap-4"
            >
               <StepIconDisplay stepIndex={step} steps={steps} />
               <div>
                 <h4 className="text-white font-bold text-sm mb-1">{steps[step].name}</h4>
                 <p className="text-xs text-slate-400">{steps[step].desc}</p>
                 {step === 4 && (
                   <p className="text-[10px] text-emerald-400 font-bold mt-2 uppercase tracking-widest flex items-center gap-1">
                     <ShieldCheck size={12} /> Mandato Fast Funds Cumprido
                   </p>
                 )}
               </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ── Detalhes Normativos ── */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
           <div className="flex items-center gap-3">
             <DollarSign className="text-emerald-400" size={20} />
             <h2 className="text-sm font-bold text-white uppercase tracking-widest">Regras de Negócio (Payout)</h2>
           </div>
           
           <div className="space-y-4">
             {pushData.map((item: any) => (
               <div key={item.id} className="p-6 rounded-[2rem] bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-bold text-white">{item.name}</h4>
                    {item.mti && <span className="text-[9px] font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-500">{item.mti}</span>}
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">{item.description}</p>
                  <div className="flex items-center gap-2 text-[10px] text-blue-400 font-bold">
                    <Zap size={10} /> Impacto: {item.impact || item.sla}
                  </div>
               </div>
             ))}
           </div>
        </div>

        <div className="space-y-6">
           <div className="flex items-center gap-3">
             <AlertCircle className="text-orange-400" size={20} />
             <h2 className="text-sm font-bold text-white uppercase tracking-widest">Riscos & Compliance</h2>
           </div>
           
           <div className="p-8 rounded-[2.5rem] bg-orange-500/5 border border-orange-500/10 space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white mb-1">AML / KYC</h5>
                    <p className="text-[11px] text-slate-500 leading-relaxed">O adquirente deve garantir que tanto o remetente quanto o destinatário não estejam em listas de sanções (OFAC/Interpol).</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
                    <Smartphone size={20} />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white mb-1">Mobile Security</h5>
                    <p className="text-[11px] text-slate-500 leading-relaxed">Payouts via App exigem biometria obrigatória para mitigar fraudes de 'Account Takeover'.</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Exemplo Gig Economy</p>
                <p className="text-xs text-slate-500 leading-relaxed italic">
                  "Um motorista de Uber finaliza a corrida às 23:45. Ele solicita o saque. Através da trilha <strong>Visa Direct</strong>, o saldo cai na conta dele às 23:47, mesmo sendo domingo."
                </p>
              </div>

              <div className="pt-4 border-t border-orange-500/10">
                <AIAssistant 
                  toolName="Laboratório de Payouts"
                  triggerLabel="Consultar Manuais sobre Push Payments"
                  context="Riscos de Push Payments (Visa Direct, Mastercard Send), OCT e AFT, responsabilidades do emissor e compliance (Fast Funds)."
                  placeholder="Quais as regras de exceção do Visa Direct para apostas (Gambling)?"
                />
              </div>
           </div>
        </div>
      </section>
    </div>
  );
}
