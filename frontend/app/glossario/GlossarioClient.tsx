"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  BookMarked, 
  ChevronRight, 
  ArrowRight, 
  ExternalLink,
  Filter,
  Layers,
  Tag,
  Scale,
  Calculator,
  ShieldCheck,
  Zap
} from "lucide-react";
import glossarioData from "@/data/glossario.json";

// Ícones por categoria
const CATEGORY_ICONS: Record<string, any> = {
  "Autenticação": Zap,
  "Disputas": Scale,
  "Participantes": Layers,
  "Autorização": CpuIcon,
  "Identificação": Tag,
  "Programas de Monitoramento": ShieldCheck,
  "Canais de Pagamento": NetworkIcon,
  "Liquidação": Calculator,
  "Segurança": LockIcon,
  "Regulatório": GavelIcon,
  "Pricing": DollarSignIcon,
  "Tokenização": KeyIcon,
};

function CpuIcon(props: any) { return <Zap {...props} />; }
function NetworkIcon(props: any) { return <Zap {...props} />; }
function LockIcon(props: any) { return <ShieldCheck {...props} />; }
function GavelIcon(props: any) { return <Scale {...props} />; }
function DollarSignIcon(props: any) { return <Calculator {...props} />; }
function KeyIcon(props: any) { return <Tag {...props} />; }

export default function GlossarioClient() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Todas");

  const categories = useMemo(() => {
    const cats = new Set(glossarioData.map(i => i.categoria));
    return ["Todas", ...Array.from(cats).sort()];
  }, []);

  const filteredItems = useMemo(() => {
    return glossarioData.filter(item => {
      const matchesSearch = 
        item.termo.toLowerCase().includes(search.toLowerCase()) ||
        (item.sigla?.toLowerCase().includes(search.toLowerCase())) ||
        item.definicao.toLowerCase().includes(search.toLowerCase());
      
      const matchesCategory = selectedCategory === "Todas" || item.categoria === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [search, selectedCategory]);

  return (
    <div className="space-y-8 pb-20">
      
      {/* ── Filtros e Busca ── */}
      <section className="sticky top-20 z-30 bg-[#030711]/80 backdrop-blur-md py-4 -mx-2 px-2 border-b border-slate-900/50">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Busque por termo ou sigla (ex: 3DS, BRAM, VAMP)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0a1120] border border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white placeholder:text-slate-600 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar w-full md:w-auto">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                  selectedCategory === cat 
                    ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20" 
                    : "bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Grid de Termos ── */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item, idx) => {
            const Icon = CATEGORY_ICONS[item.categoria] || BookMarked;
            return (
              <motion.div
                key={item.termo}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: idx * 0.02 }}
                className="group relative bg-[#0a1120]/40 border border-slate-800/60 rounded-[2rem] p-6 hover:border-blue-500/30 hover:bg-[#0a1120] transition-all flex flex-col h-full group-hover:shadow-[0_0_40px_-10px_rgba(59,130,246,0.1)]"
              >
                {/* Header Termo */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-blue-400 group-hover:border-blue-500/30 transition-all">
                      <Icon size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors leading-tight">
                        {item.termo} {item.sigla && <span className="text-blue-500/50 ml-1">({item.sigla})</span>}
                      </h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{item.categoria}</p>
                    </div>
                  </div>
                </div>

                {/* Definição */}
                <p className="text-xs text-slate-400 leading-relaxed mb-6 flex-grow">
                  {item.definicao.length > 160 ? `${item.definicao.substring(0, 160)}...` : item.definicao}
                </p>

                {/* Impacto / Mão na Massa */}
                {item.impacto && (
                  <div className="mb-6 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                    <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                      <Zap size={10} /> Impacto Prático
                    </p>
                    <p className="text-[10px] text-slate-400 leading-tight italic">
                      {item.impacto.substring(0, 80)}...
                    </p>
                  </div>
                )}

                {/* Footer / Bandeiras */}
                <div className="mt-auto pt-4 border-t border-slate-800/50 flex items-center justify-between">
                  <div className="flex gap-1.5">
                    {item.bandeiras.map(b => (
                      <span key={b} className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[8px] font-bold text-slate-500 uppercase tracking-tighter">
                        {b}
                      </span>
                    ))}
                  </div>
                  <button className="text-[10px] font-bold text-blue-400 flex items-center gap-1.5 group/btn">
                    Expandir <ChevronRight size={12} className="group-hover/btn:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </section>

      {/* ── Empty State ── */}
      {filteredItems.length === 0 && (
        <div className="py-24 text-center">
          <BookMarked size={48} className="text-slate-800 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-400">Nenhum termo encontrado</h3>
          <p className="text-sm text-slate-600">Tente buscar por termos mais genéricos ou mude a categoria.</p>
        </div>
      )}
    </div>
  );
}
