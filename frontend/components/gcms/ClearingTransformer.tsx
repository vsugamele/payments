"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Settings, FileCode, Info, ChevronRight, Database, Zap, Copy, CheckCircle2 } from "lucide-react";
import clearingMapping from "@/data/clearing-mapping.json";

type MappingItem = typeof clearingMapping[0] & { clearing: { clearingValue?: string } };

export default function ClearingTransformer() {
  const [selectedId, setSelectedId] = useState(clearingMapping[0].id);
  const [copied, setCopied] = useState(false);

  const selected = (clearingMapping.find(m => m.id === selectedId) || clearingMapping[0]) as MappingItem;
  const clearingValue = selected.clearing.clearingValue ?? "N/A";
  const chunks = clearingValue.match(/.{1,4}/g) ?? [clearingValue];

  const handleCopy = () => {
    navigator.clipboard.writeText(clearingValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-8 rounded-[3rem] bg-[#0a1120] border border-blue-500/20">
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Lateral */}
        <div className="w-full lg:w-60 space-y-2 shrink-0">
          <div className="flex items-center gap-2 mb-4 text-blue-400">
            <Settings size={16} />
            <h3 className="text-xs font-bold uppercase tracking-widest">Jabuticabas BR</h3>
          </div>
          {clearingMapping.map(item => (
            <button
              key={item.id}
              onClick={() => setSelectedId(item.id)}
              className={`w-full text-left p-3.5 rounded-2xl transition-all flex items-center justify-between group ${
                selectedId === item.id
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "bg-slate-900/50 text-slate-400 hover:bg-slate-800"
              }`}
            >
              <span className="text-sm font-bold">{item.titulo}</span>
              <ChevronRight size={14} className={selectedId === item.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"} />
            </button>
          ))}
        </div>

        {/* Conteúdo */}
        <div className="flex-1 min-w-0 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div key={selectedId} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-6">

              {/* Cards de transformação */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
                {/* Auth */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-700 space-y-3 relative">
                  <div className="absolute -top-3 left-4 px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Autorização ISO 8583</div>
                  <div className="flex items-center gap-2 text-blue-400 mt-1">
                    <Zap size={16} />
                    <h4 className="text-base font-black">{selected.auth.field}</h4>
                    <span className="text-[9px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded">ONLINE</span>
                  </div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">{selected.auth.subelement}</p>
                  <div className="p-2.5 rounded-xl bg-black/40 font-mono text-emerald-400 text-sm">
                    value: <strong>{selected.auth.value}</strong>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{selected.auth.desc}</p>
                </div>

                {/* Seta */}
                <div className="flex flex-col items-center justify-center gap-2 py-4 md:py-0">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 animate-pulse">
                    <ArrowRight size={20} className="rotate-90 md:rotate-0" />
                  </div>
                  <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest text-center">Engine Clearing</p>
                </div>

                {/* Clearing */}
                <div className="p-5 rounded-2xl bg-blue-900/10 border border-blue-500/20 space-y-3 relative">
                  <div className="absolute -top-3 left-4 px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-[10px] font-bold text-blue-400 uppercase tracking-widest whitespace-nowrap">Clearing {selected.clearing.field}</div>
                  <div className="flex items-center gap-2 text-blue-300 mt-1">
                    <Database size={16} />
                    <h4 className="text-base font-black">{selected.clearing.pds}</h4>
                    <span className="text-[9px] font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.5 rounded">BATCH</span>
                  </div>
                  <p className="text-[10px] font-bold text-blue-500/60 uppercase">{selected.clearing.subelement}</p>
                  <div className="p-2.5 rounded-xl bg-blue-950/40 font-mono text-blue-300 text-sm">
                    struct: <strong>Full Data Object</strong>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{selected.clearing.desc}</p>
                </div>
              </div>

              {/* Payload PDS Simulado — Bug #6 CORRIGIDO: valor dinâmico do JSON */}
              <div className="rounded-2xl overflow-hidden border border-slate-800">
                <div className="flex items-center justify-between px-5 py-3 bg-slate-900/70 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <FileCode size={13} className="text-emerald-400" />
                    <span className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">Payload {selected.clearing.pds} — Simulado</span>
                  </div>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-bold text-slate-400 hover:text-white transition-all"
                  >
                    {copied ? <><CheckCircle2 size={11} className="text-emerald-400" /><span className="text-emerald-400">Copiado!</span></> : <><Copy size={11} />Copiar</>}
                  </button>
                </div>
                <div className="p-5 bg-[#05080f] font-mono space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {chunks.map((chunk, i) => (
                      <span key={i} className="text-xs text-emerald-400 bg-emerald-950/30 px-2 py-1 rounded border border-emerald-900/50">{chunk}</span>
                    ))}
                  </div>
                  <div className="text-[10px] text-slate-600 border-t border-slate-800 pt-2">
                    <span className="text-slate-500">Raw: </span>
                    <span className="text-slate-400">{clearingValue}</span>
                  </div>
                </div>
              </div>

              {/* Regra normativa */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-600/10 to-transparent border border-blue-500/10 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-400 shrink-0">
                  <Info size={16} />
                </div>
                <div>
                  <h5 className="text-sm font-bold text-white mb-1">Regra Normativa</h5>
                  <p className="text-xs text-slate-400 leading-relaxed">{selected.regra}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
