"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Terminal, 
  AlertTriangle, 
  DollarSign, 
  Info, 
  ArrowRightLeft,
  ShieldAlert,
  Zap
} from "lucide-react";
import mcbsEvents from "@/data/mcbs-events.json";

export default function McbsTranslator() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredEvents = useMemo(() => {
    if (!searchTerm) return [];
    return mcbsEvents.filter(e => 
      e.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  return (
    <div className="space-y-8">
      {/* ── Regra de Câmbio QMR ── */}
      <section className="p-8 rounded-[2.5rem] bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20">
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <ArrowRightLeft size={32} />
          </div>
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl font-bold text-white flex items-center gap-2 justify-center md:justify-start">
              A Regra de Ouro do Câmbio MCBS <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-mono uppercase tracking-widest">QMR Rate</span>
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed max-w-4xl">
              As faturas Mastercard são geradas em <strong>USD (Gross Dollar Volume)</strong>. A conversão para BRL nas faturas brasileiras não utiliza o PTAX do dia, mas sim a <strong>Taxa Média do Trimestre</strong> reportada no <strong>QMR (Quarterly Mastercard Report)</strong>. Isso gera uma defasagem planejada no custo real do adquirente.
            </p>
          </div>
        </div>
      </section>

      {/* ── Tradutor / Decoder ── */}
      <section className="relative p-10 rounded-[3rem] bg-[#0a1120] border border-orange-500/20 overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Terminal size={140} className="text-orange-500" />
        </div>

        <div className="max-w-2xl mb-10">
          <h2 className="text-2xl font-black text-white tracking-tight mb-4 flex items-center gap-3">
            <Zap className="text-orange-500" /> MCBS Billing Event Decoder
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-8">
            A Mastercard não cobra apenas transações. Ela cobra <strong>eventos</strong>. Digite o código do Billing Event para decifrar o que a caixa-preta do MCBS está cobrando.
          </p>

          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input 
              type="text"
              placeholder="Ex: 2AB1001, 2PN1011, ASI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#05080f] border-2 border-slate-800 rounded-[2rem] py-5 pl-14 pr-6 text-white text-lg focus:border-orange-500 outline-none transition-all placeholder:text-slate-700"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence>
            {filteredEvents.length > 0 ? (
              filteredEvents.map((e, idx) => (
                <motion.div 
                  key={e.event}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group p-6 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-orange-500/40 transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="px-3 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 font-mono text-sm font-bold">
                      {e.event}
                    </div>
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{e.category}</span>
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">{e.name}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">{e.description}</p>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-orange-500/80 bg-orange-500/5 px-3 py-2 rounded-xl border border-orange-500/10">
                    <AlertTriangle size={12} /> IMPACTO: {e.impact}
                  </div>
                </motion.div>
              ))
            ) : searchTerm ? (
              <div className="col-span-full py-10 text-center">
                <p className="text-slate-500 text-sm">Nenhum evento encontrado para "{searchTerm}"</p>
              </div>
            ) : (
              <div className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-4 opacity-40">
                {mcbsEvents.slice(0, 3).map(e => (
                  <div key={e.event} className="p-4 border border-dashed border-slate-700 rounded-2xl">
                    <p className="text-xs font-mono text-slate-500">{e.event}</p>
                    <p className="text-[10px] text-slate-600 truncate">{e.name}</p>
                  </div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ── Seção de Multas Dolorosas ── */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 rounded-[2.5rem] bg-red-500/5 border border-red-500/10 space-y-4">
          <div className="flex items-center gap-3 text-red-400">
            <ShieldAlert size={20} />
            <h3 className="text-sm font-bold uppercase tracking-widest">Alerta: Multas de Compliance</h3>
          </div>
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#0a1120] border border-red-500/20">
              <p className="text-xs font-bold text-white mb-1">2PN1011 - Cut-off Fail</p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Perder a janela de envio do GCMS para liquidação custa caro. A Mastercard aplica multas que podem chegar a milhares de dólares por arquivo atrasado.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-[#0a1120] border border-red-500/20">
              <p className="text-xs font-bold text-white mb-1">2PN1005 - Excessive Auth attempts</p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Adquirentes que permitem ataques de força bruta sem bloqueio pagam multas punitivas automáticas na invoice.
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 rounded-[2.5rem] bg-blue-500/5 border border-blue-500/10 flex flex-col justify-center text-center">
          <DollarSign className="text-blue-400 mx-auto mb-4" size={40} />
          <h3 className="text-lg font-bold text-white mb-2">Entenda seu faturamento</h3>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
            O MCBS é granular. Cada transação de R$ 100 pode gerar até 5 "eventos" diferentes de cobrança. Auditá-los é a diferença entre lucro e prejuízo na adquirência.
          </p>
        </div>
      </section>
    </div>
  );
}
