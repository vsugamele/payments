"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  RefreshCw, 
  ShieldAlert, 
  AlertOctagon, 
  CheckCircle2, 
  Search, 
  Info,
  ArrowRight,
  Database,
  Lock
} from "lucide-react";
import macData from "@/data/mac-codes.json";

export default function RetrySimulator() {
  const [selectedMac, setSelectedMac] = useState(macData[0].mac);

  const current = macData.find(m => m.mac === selectedMac) || macData[0];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Painel de Seleção de Cenário */}
        <div className="p-8 rounded-[3rem] bg-[#0a1120] border border-orange-500/20 space-y-6">
          <div className="flex items-center gap-3 text-orange-400">
            <RefreshCw size={20} className="animate-spin-slow" />
            <h3 className="text-sm font-bold uppercase tracking-widest">Simulador de Decisão MAC</h3>
          </div>
          
          <div className="space-y-4">
            <p className="text-xs text-slate-400 leading-relaxed">
              Combine o <strong>Response Code (DE 39)</strong> com o <strong>Merchant Advice Code (DE 48.84)</strong> para determinar a estratégia de retentativa.
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              {macData.map(item => (
                <button
                  key={item.mac}
                  onClick={() => setSelectedMac(item.mac)}
                  className={`p-4 rounded-2xl text-left transition-all border ${
                    selectedMac === item.mac 
                      ? "bg-orange-600 border-orange-500 text-white shadow-lg shadow-orange-600/20" 
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:border-orange-500/40"
                  }`}
                >
                  <div className="text-[10px] font-bold opacity-60 mb-1">MAC {item.mac}</div>
                  <div className="text-xs font-bold truncate">{item.meaning.split("+")[1] || item.meaning}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Output de Inteligência */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={selectedMac}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="p-8 rounded-[3rem] bg-[#05080f] border border-slate-800 space-y-6 relative overflow-hidden"
          >
            <div className={`absolute top-0 right-0 p-8 opacity-5`}>
              {current.action === "Block Account" ? <AlertOctagon size={140} /> : <Database size={140} />}
            </div>

            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                current.action === "Retry (Soft)" ? "bg-blue-500/10 text-blue-400" : 
                current.action === "Update Credentials" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
              }`}>
                {current.action === "Retry (Soft)" ? <RefreshCw size={28} /> : 
                 current.action === "Update Credentials" ? <Database size={28} /> : <Lock size={28} />}
              </div>
              <div>
                <h4 className="text-xl font-black text-white">{current.action}</h4>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{current.meaning}</p>
              </div>
            </div>

            <div className="space-y-4 relative z-10">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-xs text-slate-300 leading-relaxed italic">
                  "{current.desc}"
                </p>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20">
                <ShieldAlert size={18} className="text-orange-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold text-orange-400 uppercase mb-1">Recomendação Forense</p>
                  <p className="text-xs text-white font-medium">{current.recommendation}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Info Card: ABU & VAU */}
      <div className="p-6 rounded-[2rem] bg-gradient-to-br from-emerald-900/10 to-transparent border border-emerald-500/10 flex items-center gap-6">
        <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
          <CheckCircle2 size={32} />
        </div>
        <div>
          <h5 className="text-white font-bold mb-1">Otimização via ABU / VAU</h5>
          <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
            Sempre que receber um <strong>MAC 01</strong>, não tente novamente. Isso indica que há novos dados disponíveis (Novo PAN ou Validade). Utilize o serviço de atualização automática de credenciais (Automatic Billing Updater da Mastercard ou Visa Account Updater) para sanear sua base antes da próxima tentativa.
          </p>
        </div>
      </div>
    </div>
  );
}
