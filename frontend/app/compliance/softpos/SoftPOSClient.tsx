"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Smartphone, 
  Wifi, 
  ShieldCheck, 
  Cpu, 
  Lock, 
  Search, 
  CheckCircle2, 
  AlertCircle,
  SmartphoneNfc,
  RefreshCcw,
  Info,
  Layers
} from "lucide-react";
import softposData from "@/data/softpos.json";

export default function SoftPOSClient() {
  const [isScanning, setIsScanning] = useState(false);
  const [attestationPassed, setAttestationPassed] = useState<boolean | null>(null);
  const [paymentDone, setPaymentDone] = useState(false);

  const startAttestation = () => {
    setIsScanning(true);
    setAttestationPassed(null);
    setPaymentDone(false);

    // Simula checagens de segurança
    setTimeout(() => {
      setAttestationPassed(true);
      setIsScanning(false);
    }, 2500);
  };

  const simulatePayment = () => {
    if (attestationPassed) {
      setPaymentDone(true);
    }
  };

  return (
    <div className="space-y-12">
      
      {/* ── Simulador de Terminal SoftPOS ── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* O Celular do Lojista */}
        <div className="lg:col-span-6 flex justify-center py-10 bg-[#0a1120] border border-slate-800 rounded-[3rem] relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent" />
           </div>

           <div className="w-72 h-[550px] bg-slate-900 border-[6px] border-slate-800 rounded-[3rem] shadow-2xl relative flex flex-col overflow-hidden">
              {/* Top Notch */}
              <div className="h-6 w-32 bg-slate-800 absolute top-0 left-1/2 -translate-x-1/2 rounded-b-2xl z-20" />
              
              {/* App UI */}
              <div className="flex-1 p-6 pt-12 flex flex-col items-center justify-between relative z-10">
                 <div className="w-full text-center">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Acquirer Pay App</p>
                    <h4 className="text-sm font-black text-white">SoftPOS Terminal</h4>
                 </div>

                 <div className="flex-1 flex flex-col items-center justify-center w-full gap-6">
                    <AnimatePresence mode="wait">
                      {isScanning ? (
                        <motion.div 
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className="flex flex-col items-center gap-4"
                        >
                           <div className="relative">
                             <RefreshCcw size={48} className="text-blue-400 animate-spin" />
                             <Search size={20} className="text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                           </div>
                           <p className="text-[10px] text-blue-400 font-bold uppercase animate-pulse">Checando Integridade (Attestation)...</p>
                           <div className="w-full space-y-1 px-4">
                              <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 2.5 }} className="h-full bg-blue-500" />
                              </div>
                              <p className="text-[8px] text-slate-600">Verificando Root/Tamper Detection</p>
                           </div>
                        </motion.div>
                      ) : attestationPassed === null ? (
                        <div className="text-center space-y-6">
                           <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mx-auto border border-slate-700">
                             <ShieldCheck size={32} className="text-slate-600" />
                           </div>
                           <button 
                             onClick={startAttestation}
                             className="px-6 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-500 transition-all"
                           >
                             Ativar Terminal
                           </button>
                        </div>
                      ) : paymentDone ? (
                        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-4">
                           <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto border border-emerald-500/30">
                             <CheckCircle2 size={40} className="text-emerald-500" />
                           </div>
                           <div>
                             <p className="text-lg font-black text-white">R$ 45,90</p>
                             <p className="text-[10px] text-emerald-400 font-bold uppercase">Aprovado via SoftPOS</p>
                           </div>
                        </motion.div>
                      ) : (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-8 w-full">
                           <div className="relative mx-auto w-32 h-32">
                              <div className="absolute inset-0 bg-blue-500/10 rounded-full animate-ping" />
                              <div className="relative z-10 w-32 h-32 rounded-full border-4 border-blue-500/30 flex items-center justify-center text-blue-400">
                                 <Wifi size={48} className="rotate-90" />
                              </div>
                           </div>
                           <div>
                             <p className="text-xs text-slate-400 mb-2 font-medium">Aproxime o cartão ou celular</p>
                             <button 
                               onClick={simulatePayment}
                               className="w-full py-3 bg-emerald-600 text-white text-xs font-bold rounded-2xl hover:bg-emerald-500"
                             >
                               Simular Aproximação
                             </button>
                           </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                 </div>

                 {/* Botão de Home (Visual) */}
                 <div className="w-24 h-1.5 bg-slate-800 rounded-full mx-auto" />
              </div>
           </div>
        </div>

        {/* Detalhes Técnicos (O que está acontecendo) */}
        <div className="lg:col-span-6 space-y-6">
           <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 space-y-8">
              <div>
                <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-6">Processo de Segurança (Backend)</h4>
                <div className="space-y-4">
                  {softposData.map(item => (
                    <div key={item.id} className="p-5 rounded-2xl bg-white/5 border border-slate-800 hover:border-slate-700 transition-all group">
                       <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                             {item.id === "attestation" ? <ShieldCheck size={20} /> : item.id === "l2_kernel" ? <Cpu size={20} /> : <Lock size={20} />}
                          </div>
                          <div className="flex-1">
                             <h5 className="text-xs font-bold text-white mb-1">{item.name}</h5>
                             <p className="text-[11px] text-slate-500 leading-relaxed mb-2">{item.description}</p>
                             {item.checks && (
                               <div className="flex flex-wrap gap-2">
                                  {item.checks.map(c => <span key={c} className="text-[8px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">{c}</span>)}
                               </div>
                             )}
                          </div>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
           </div>

           <div className="bg-orange-500/10 border border-orange-500/20 rounded-3xl p-6 flex items-start gap-4">
             <AlertCircle size={20} className="text-orange-400 shrink-0 mt-1" />
             <div>
               <p className="text-xs text-white font-bold mb-1">Restrição de Senha (PIN)</p>
               <p className="text-[11px] text-orange-200 leading-relaxed italic">
                 "No padrão <strong>CPOC</strong>, se o valor for alto, você precisa de um hardware externo. Mas com o novo <strong>MPOC</strong>, a senha pode ser digitada na tela do celular (PIN on Glass) com proteção contra captura de vídeo e keyloggers."
               </p>
             </div>
           </div>
        </div>
      </section>

      {/* ── Diferenciais SoftPOS ── */}
      <section className="bg-blue-600/5 border border-blue-600/10 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center gap-12">
         <div className="w-20 h-20 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
           <Layers size={40} />
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            <div>
               <h4 className="text-white font-bold text-sm mb-2">Eliminação de Hardware</h4>
               <p className="text-xs text-slate-500 leading-relaxed">Redução drástica no custo de logística e manutenção (TCO) para o adquirente.</p>
            </div>
            <div>
               <h4 className="text-white font-bold text-sm mb-2">Onboarding Instantâneo</h4>
               <p className="text-xs text-slate-500 leading-relaxed">O lojista baixa o app e começa a vender em minutos, sem esperar a entrega da máquina.</p>
            </div>
         </div>
      </section>
    </div>
  );
}
