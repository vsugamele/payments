"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, 
  Settings, 
  FileCode, 
  ShieldCheck, 
  Info,
  ChevronRight,
  Database,
  Cpu,
  Zap
} from "lucide-react";
import clearingMapping from "@/data/clearing-mapping.json";

export default function ClearingTransformer() {
  const [selectedId, setSelectedId] = useState(clearingMapping[0].id);

  const selected = clearingMapping.find(m => m.id === selectedId) || clearingMapping[0];

  return (
    <div className="p-8 rounded-[3rem] bg-[#0a1120] border border-blue-500/20">
      <div className="flex flex-col lg:flex-row gap-12">
        
        {/* Menu Lateral de Seleção */}
        <div className="w-full lg:w-72 space-y-3">
          <div className="flex items-center gap-2 mb-6 text-blue-400">
            <Settings size={18} />
            <h3 className="text-sm font-bold uppercase tracking-widest">Jabuticabas BR</h3>
          </div>
          {clearingMapping.map(item => (
            <button
              key={item.id}
              onClick={() => setSelectedId(item.id)}
              className={`w-full text-left p-4 rounded-2xl transition-all flex items-center justify-between group ${
                selectedId === item.id 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                  : "bg-slate-900/50 text-slate-400 hover:bg-slate-800"
              }`}
            >
              <span className="text-sm font-bold">{item.titulo}</span>
              <ChevronRight size={16} className={selectedId === item.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"} />
            </button>
          ))}
        </div>

        {/* Visualizador de Transformação */}
        <div className="flex-1 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            
            {/* Bloco de Autorização */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 relative">
              <div className="absolute -top-3 left-6 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Autorização ISO 8583
              </div>
              <div className="flex items-center gap-3 text-blue-400">
                <Zap size={20} />
                <h4 className="text-lg font-black">{selected.auth.field}</h4>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase">{selected.auth.subelement}</p>
                <div className="p-3 rounded-xl bg-black/40 font-mono text-emerald-400 text-sm">
                  Value: {selected.auth.value}
                </div>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {selected.auth.desc}
              </p>
            </div>

            {/* Seta de Transformação */}
            <div className="flex flex-col items-center justify-center gap-4 py-6 md:py-0">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 animate-pulse">
                <ArrowRight size={24} className="rotate-90 md:rotate-0" />
              </div>
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">Engine de Clearing</span>
            </div>

            {/* Bloco de Clearing */}
            <div className="p-6 rounded-3xl bg-blue-900/10 border border-blue-500/20 space-y-4 relative">
              <div className="absolute -top-3 left-6 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-[10px] font-bold text-blue-400 uppercase tracking-widest text-nowrap">
                Clearing {selected.clearing.field}
              </div>
              <div className="flex items-center gap-3 text-blue-400">
                <Database size={20} />
                <h4 className="text-lg font-black">{selected.clearing.pds}</h4>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-blue-500/60 uppercase">{selected.clearing.subelement}</p>
                <div className="p-3 rounded-xl bg-blue-950/40 font-mono text-blue-300 text-sm">
                  Structure: Full Data Object
                </div>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {selected.clearing.desc}
              </p>
            </div>
          </div>

          {/* Regra de Negócio Explicação */}
          <div className="p-6 rounded-[2rem] bg-gradient-to-r from-blue-600/10 to-transparent border border-blue-500/10 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-400 shrink-0">
              <Info size={20} />
            </div>
            <div>
              <h5 className="text-sm font-bold text-white mb-1">Regra Normativa</h5>
              <p className="text-xs text-slate-400 leading-relaxed">
                {selected.regra}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
