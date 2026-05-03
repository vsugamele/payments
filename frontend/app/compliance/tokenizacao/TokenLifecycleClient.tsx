"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CreditCard, 
  Smartphone, 
  RefreshCcw, 
  Pause, 
  Play, 
  Trash2, 
  Database,
  ArrowRight,
  ShieldCheck,
  Zap,
  Info,
  Clock,
  Key,
  Lock,
  Cpu,
  XCircle,
  CheckCircle2
} from "lucide-react";

type TokenStatus = "Active" | "Suspended" | "Deleted" | "Provisioning";

export default function TokenLifecycleClient() {
  const [status, setStatus] = useState<TokenStatus>("Active");
  const [panExpired, setPanExpired] = useState(false);
  const [step, setStep] = useState(3); // Começa no uso (Lifecycle)

  const steps = [
    { id: 1, name: "Enrolment", desc: "Registro do PAN no TR", icon: Database },
    { id: 2, name: "Id&V", desc: "Verificação de Identidade", icon: ShieldCheck },
    { id: 3, name: "Active", desc: "Token pronto para uso", icon: Cpu },
    { id: 4, name: "Update/Action", desc: "Gestão do Ciclo de Vida", icon: RefreshCcw }
  ];

  return (
    <div className="space-y-10">
      
      {/* ── Progressão de Provisionamento ── */}
      <div className="bg-[#0a1120] border border-slate-800 rounded-[2.5rem] p-8">
        <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-8 text-center">Nascimento de um Token (VTS/MDES)</h3>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative">
          {/* Linha de Conexão */}
          <div className="absolute top-1/2 left-0 w-full h-px bg-slate-800 -translate-y-1/2 hidden md:block" />
          
          {steps.map((s, i) => (
            <div key={s.id} className="relative z-10 flex flex-col items-center group">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${
                step >= s.id ? "bg-blue-600 border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.3)]" : "bg-slate-900 border-slate-800"
              }`}>
                <s.icon size={24} className={step >= s.id ? "text-white" : "text-slate-500"} />
              </div>
              <div className="mt-4 text-center">
                <p className={`text-xs font-bold ${step >= s.id ? "text-white" : "text-slate-500"}`}>{s.name}</p>
                <p className="text-[10px] text-slate-600 max-w-[100px] leading-tight mt-1">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Laboratório de Estados do Token ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Simulador Visual */}
        <div className="lg:col-span-7 bg-[#0a1120] border border-slate-800 rounded-[2.5rem] p-10 flex flex-col items-center justify-center min-h-[450px] relative overflow-hidden">
           {/* Glow de fundo baseado no status */}
           <div className={`absolute inset-0 opacity-10 blur-[100px] transition-colors duration-700 ${
             status === "Active" ? "bg-emerald-500" : status === "Suspended" ? "bg-orange-500" : "bg-red-500"
           }`} />

           <div className="relative z-10 flex flex-col items-center gap-12 w-full">
             
             {/* O PAN Real (Escondido no Vault) */}
             <div className="w-full max-w-sm p-6 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between opacity-40 grayscale">
               <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                   <CreditCard size={20} className="text-slate-500" />
                 </div>
                 <div>
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Funding PAN (Vault)</p>
                   <p className="text-sm font-mono text-slate-300">4532 **** **** 8891</p>
                 </div>
               </div>
               {panExpired ? (
                 <span className="px-2 py-1 rounded bg-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-tighter">Expirado</span>
               ) : (
                 <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-tighter">Válido</span>
               )}
             </div>

             <ArrowRight size={24} className="text-slate-800 rotate-90" />

             {/* O TOKEN (O que o Lojista vê) */}
             <motion.div 
               animate={status === "Suspended" ? { scale: 0.95, opacity: 0.6 } : { scale: 1, opacity: 1 }}
               className={`w-full max-w-md p-8 rounded-[2rem] border-2 transition-all duration-500 relative ${
                 status === "Active" ? "bg-blue-600/10 border-blue-500 shadow-[0_0_40px_-10px_rgba(59,130,246,0.3)]" :
                 status === "Suspended" ? "bg-orange-500/10 border-orange-500" :
                 "bg-red-500/10 border-red-500"
               }`}
             >
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Network Token (Active Status)</p>
                    <p className="text-2xl font-mono font-bold text-white tracking-widest">
                      {status === "Deleted" ? "**** **** **** ****" : "4000 1234 5678 9901"}
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    status === "Active" ? "bg-blue-500 text-white" : "bg-slate-800 text-slate-500"
                  }`}>
                    <Smartphone size={24} />
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-6">
                  <div className="flex gap-4">
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">TR-ID</p>
                      <p className="text-xs font-mono text-white">40012345678</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Expiry</p>
                      <p className="text-xs font-mono text-white">12/29</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                    status === "Active" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
                    status === "Suspended" ? "bg-orange-500/20 text-orange-400 border-orange-500/30" :
                    "bg-red-500/20 text-red-400 border-red-500/30"
                  }`}>
                    {status}
                  </div>
                </div>

                {status === "Suspended" && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] rounded-[2rem] flex items-center justify-center">
                    <p className="text-xs font-bold text-orange-400 flex items-center gap-2">
                      <Pause size={14} /> TOKEN SUSPENSO (REQ 0100 NEGADA)
                    </p>
                  </div>
                )}
             </motion.div>

             {/* Indicador de Sucesso na Autorização */}
             <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Resultado da Autorização:</p>
                <div className="flex items-center gap-2">
                  {status === "Active" ? (
                    <span className="text-emerald-400 text-xs font-bold flex items-center gap-1.5 animate-pulse">
                      <Zap size={14} /> 00 - APROVADO (ECI 05)
                    </span>
                  ) : (
                    <span className="text-red-400 text-xs font-bold flex items-center gap-1.5">
                      <XCircle size={14} /> 05 - DO NOT HONOR
                    </span>
                  )}
                </div>
             </div>
           </div>
        </div>

        {/* Controles de Ciclo de Vida */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#0a1120] border border-slate-800 rounded-[2.5rem] p-8 space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Controles de Lifecycle</h3>
            
            <div className="grid grid-cols-1 gap-3">
              <button 
                onClick={() => setStatus("Active")}
                className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  status === "Active" ? "bg-blue-600/10 border-blue-500 text-white" : "bg-slate-900/50 border-slate-800 text-slate-500 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Play size={18} />
                  <div>
                    <p className="text-xs font-bold">Resumir / Ativar</p>
                    <p className="text-[10px] opacity-60">Pronto para transacionar</p>
                  </div>
                </div>
                {status === "Active" && <CheckCircle2 size={16} className="text-blue-400" />}
              </button>

              <button 
                onClick={() => setStatus("Suspended")}
                className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  status === "Suspended" ? "bg-orange-500/10 border-orange-500 text-white" : "bg-slate-900/50 border-slate-800 text-slate-500 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Pause size={18} />
                  <div>
                    <p className="text-xs font-bold">Suspender</p>
                    <p className="text-[10px] opacity-60">Ex: Celular perdido / Bloqueio temp.</p>
                  </div>
                </div>
                {status === "Suspended" && <CheckCircle2 size={16} className="text-orange-400" />}
              </button>

              <button 
                onClick={() => setStatus("Deleted")}
                className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  status === "Deleted" ? "bg-red-500/10 border-red-500 text-white" : "bg-slate-900/50 border-slate-800 text-slate-500 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Trash2 size={18} />
                  <div>
                    <p className="text-xs font-bold">Deletar / Revogar</p>
                    <p className="text-[10px] opacity-60">Morte permanente do Token</p>
                  </div>
                </div>
                {status === "Deleted" && <CheckCircle2 size={16} className="text-red-400" />}
              </button>
            </div>

            <div className="pt-6 border-t border-slate-800 space-y-4">
               <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Mágica da Tokenização</h4>
                  <button 
                    onClick={() => setPanExpired(!panExpired)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all border ${
                      panExpired ? "bg-red-500/20 border-red-500/50 text-red-400" : "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                    }`}
                  >
                    {panExpired ? "Simular PAN Vencido" : "Simular PAN Renovado"}
                  </button>
               </div>
               <p className="text-[11px] text-slate-500 leading-relaxed">
                 Observe: Se o PAN vencer, a bandeira atualiza o Vault mas o seu <strong>Token não muda</strong>. Isso garante que a assinatura do seu cliente continue funcionando sem que ele precise digitar um novo cartão.
               </p>
            </div>
          </div>

          <div className="bg-blue-600/10 border border-blue-500/20 rounded-[2rem] p-6 flex items-start gap-4">
             <Info size={20} className="text-blue-400 shrink-0 mt-1" />
             <div>
               <p className="text-xs text-white font-bold mb-1">Impacto na Aprovação</p>
               <p className="text-[11px] text-blue-200 leading-relaxed">
                 Lojistas que usam <strong>Network Tokens</strong> (MDES/VTS) veem um aumento médio de <strong>4% a 7%</strong> na taxa de aprovação (Approval Rate) em comparação com o uso de PAN real.
               </p>
             </div>
          </div>
        </div>
      </div>

      {/* ── Tabela Comparativa ── */}
      <section className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-8 overflow-hidden">
        <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
          <Zap size={16} className="text-blue-400" /> VTS (Visa) vs MDES (Mastercard)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="p-6 rounded-2xl bg-white/5 border border-slate-800">
              <p className="text-xs font-bold text-blue-400 mb-3">Visa Token Service (VTS)</p>
              <ul className="space-y-2 text-[11px] text-slate-400 leading-relaxed">
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-blue-500 rounded-full" /> Usa <strong>DAF</strong> para Liability Shift sem 3DS.</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-blue-500 rounded-full" /> Foco em integração nativa com Apple/Google Pay.</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-blue-500 rounded-full" /> Indicadores TAF e TIDI na mensageria ISO.</li>
              </ul>
           </div>
           <div className="p-6 rounded-2xl bg-white/5 border border-slate-800">
              <p className="text-xs font-bold text-purple-400 mb-3">Mastercard Digital Enablement (MDES)</p>
              <ul className="space-y-2 text-[11px] text-slate-400 leading-relaxed">
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full" /> Protocolo <strong>Merchant Tokenization</strong> robusto.</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full" /> Integração profunda com Mastercom para disputas.</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full" /> Atualização dinâmica de tokens via MC Digital Express.</li>
              </ul>
           </div>
        </div>
      </section>
    </div>
  );
}
