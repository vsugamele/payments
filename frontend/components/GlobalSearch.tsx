"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Command, X, Book, Scale, Calculator, 
  Terminal, ShieldCheck, ChevronRight, Hash, ExternalLink,
  Zap, Database, Globe
} from "lucide-react";
import { useRouter } from "next/navigation";
import glossarioData from "@/data/glossario.json";
import mccData from "@/data/mcc-list.json";

// Tipos para os resultados da busca
interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: "mcc" | "disputa" | "iso" | "ferramenta" | "glossario" | "compliance";
  url: string;
  icon: any;
}

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Shortcut Cmd+K ou Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  // Lógica de busca em tempo real nos arquivos JSON
  const results = useMemo(() => {
    if (query.length < 2) return [];

    const searchResults: SearchResult[] = [];
    const q = query.toLowerCase();

    // 1. Buscar no Glossário (Siglas e Termos)
    glossarioData.forEach(item => {
      if (item.termo.toLowerCase().includes(q) || item.sigla?.toLowerCase().includes(q)) {
        searchResults.push({
          id: `gloss-${item.termo}`,
          title: item.sigla ? `${item.sigla} - ${item.termo}` : item.termo,
          description: item.definicao,
          category: "glossario",
          url: `/glossario?search=${item.sigla || item.termo}`,
          icon: Book
        });
      }
    });

    // 2. Buscar nos MCCs
    mccData.slice(0, 500).forEach(mcc => {
      if (String(mcc.mcc).includes(q) || mcc.mcName.toLowerCase().includes(q) || mcc.nome?.toLowerCase().includes(q)) {
        searchResults.push({
          id: `mcc-${mcc.mcc}`,
          title: `MCC ${mcc.mcc}`,
          description: mcc.mcName,
          category: "mcc",
          url: `/canais?mcc=${mcc.mcc}`,
          icon: Hash
        });
      }
    });

    // 3. Ferramentas e Páginas fixas
    const pages = [
      { t: "Simulador de Intercâmbio", d: "Cálculo de IC e Scheme Fees", u: "/simulador", c: "ferramenta", i: Calculator },
      { t: "Advogado Digital (Disputas)", d: "Defesa forense de chargebacks", u: "/compliance/disputas", c: "ferramenta", i: Scale },
      { t: "Laboratório de Mensageria", d: "Parser de logs ISO 8583 / IPM", u: "/compliance/campos", c: "ferramenta", i: Terminal },
      { t: "Programa TPE Mastercard", d: "Excelência e Retentativas", u: "/compliance/tpe", c: "compliance", i: Zap },
      { t: "Explorador GCMS", d: "Tabelas de Clearing Mastercard", u: "/compliance/gcms", c: "compliance", i: Database },
      { t: "Mapa do Ecossistema", d: "Arquitetura Macro de Pagamentos", u: "/ecossistema", c: "compliance", i: Globe }
    ];

    pages.forEach(p => {
      if (p.t.toLowerCase().includes(q) || p.d.toLowerCase().includes(q)) {
        searchResults.push({
          id: `page-${p.u}`,
          title: p.t,
          description: p.d,
          category: p.c as any,
          url: p.u,
          icon: p.i
        });
      }
    });

    return searchResults.slice(0, 8); // Limitar a 8 resultados para manter limpo
  }, [query]);

  const handleSelect = (url: string) => {
    setIsOpen(false);
    router.push(url);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all text-slate-500 hover:text-slate-400 group"
      >
        <Search size={14} className="group-hover:text-blue-400 transition-colors" />
        <span className="text-[11px] font-bold uppercase tracking-wider">Search Brain...</span>
        <div className="flex items-center gap-1 ml-4 opacity-50">
          <Command size={10} />
          <span className="text-[10px] font-bold">K</span>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[12vh] px-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-[#030711]/90 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="relative w-full max-w-2xl bg-[#0f172a] border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              {/* Input */}
              <div className="flex items-center gap-4 px-6 py-5 border-b border-slate-800 bg-[#0f172a]">
                <Search size={22} className="text-blue-400" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Busque por 'GCMS', '4837', 'MCC 5411' ou 'TPE'..."
                  className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-slate-600 text-lg font-medium"
                />
                <div className="flex items-center gap-2">
                   <kbd className="px-2 py-1 rounded bg-slate-800 text-slate-500 text-[10px] font-bold border border-slate-700">ESC</kbd>
                </div>
              </div>

              {/* Resultados */}
              <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-3">
                {results.length > 0 ? (
                  <div className="space-y-1">
                    {results.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => handleSelect(result.url)}
                        className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-all group text-left border border-transparent hover:border-slate-800"
                      >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-slate-800 group-hover:scale-110 transition-transform ${
                          result.category === "disputa" ? "bg-red-500/10 text-red-400" :
                          result.category === "mcc" ? "bg-orange-500/10 text-orange-400" :
                          result.category === "iso" ? "bg-emerald-500/10 text-emerald-400" :
                          result.category === "compliance" ? "bg-purple-500/10 text-purple-400" :
                          "bg-blue-500/10 text-blue-400"
                        }`}>
                          <result.icon size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                              {result.title}
                            </p>
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-500">
                              {result.category}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 truncate leading-relaxed">
                            {result.description}
                          </p>
                        </div>
                        <ChevronRight size={16} className="text-slate-700 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                      </button>
                    ))}
                  </div>
                ) : query.length >= 2 ? (
                  <div className="py-16 text-center">
                    <Search size={40} className="text-slate-800 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold">Nenhum rastro encontrado para "{query}"</p>
                    <p className="text-xs text-slate-600 mt-2">Tente siglas técnicas como IRD, MTI ou MCC.</p>
                  </div>
                ) : (
                  <div className="p-6">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6">Atalhos Táticos</p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { t: "Simulador IC", d: "Cálculos Financeiros", u: "/simulador", i: Calculator },
                        { t: "Advogado Digital", d: "Chargebacks", u: "/compliance/disputas", i: Scale },
                        { t: "Programa TPE", d: "Excelência Mastercard", u: "/compliance/tpe", i: Zap },
                        { t: "Manual GCMS", d: "Tabelas de Clearing", u: "/compliance/gcms", i: Database }
                      ].map(s => (
                        <button 
                          key={s.t}
                          onClick={() => handleSelect(s.u)}
                          className="flex items-center gap-4 p-4 rounded-3xl bg-white/5 border border-slate-800/50 hover:border-blue-500/30 transition-all text-left group"
                        >
                          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <s.i size={18} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white">{s.t}</p>
                            <p className="text-[10px] text-slate-500">{s.d}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-slate-800 bg-[#0a1120] flex items-center justify-between text-[10px] font-bold text-slate-500">
                <div className="flex items-center gap-6">
                  <span className="flex items-center gap-2">
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-white font-mono">ENTER</kbd> Selecionar
                  </span>
                  <span className="flex items-center gap-2">
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-white font-mono">↑↓</kbd> Navegar
                  </span>
                </div>
                <div className="flex items-center gap-2 text-blue-500">
                  <ShieldCheck size={12} />
                  <span>Cérebro Normativo v2.5</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
