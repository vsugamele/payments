"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, BookMarked, ChevronRight, ChevronDown,
  Filter, Layers, Tag, Scale, Calculator, ShieldCheck, Zap, X
} from "lucide-react";
import glossarioData from "@/data/glossario.json";

// ─── Ícones por categoria ──────────────────────────────────────────
const CATEGORY_ICONS: Record<string, React.FC<{ size?: number; style?: React.CSSProperties }>> = {
  "Autenticação": Zap,
  "Disputas": Scale,
  "Participantes": Layers,
  "Autorização": Zap,
  "Identificação": Tag,
  "Programas de Monitoramento": ShieldCheck,
  "Canais de Pagamento": Zap,
  "Liquidação": Calculator,
  "Segurança": ShieldCheck,
  "Regulatório": Scale,
  "Pricing": Calculator,
  "Tokenização": Tag,
};

const CATEGORY_COLORS: Record<string, { color: string; bg: string; border: string }> = {
  "Autenticação":              { color: "#22d3ee", bg: "rgba(34,211,238,0.1)", border: "rgba(34,211,238,0.25)" },
  "Disputas":                  { color: "#a78bfa", bg: "rgba(167,139,250,0.1)", border: "rgba(167,139,250,0.25)" },
  "Participantes":             { color: "#34d399", bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.25)" },
  "Autorização":               { color: "#60a5fa", bg: "rgba(96,165,250,0.1)", border: "rgba(96,165,250,0.25)" },
  "Identificação":             { color: "#fb923c", bg: "rgba(251,146,60,0.1)", border: "rgba(251,146,60,0.25)" },
  "Programas de Monitoramento":{ color: "#f87171", bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.25)" },
  "Canais de Pagamento":       { color: "#818cf8", bg: "rgba(129,140,248,0.1)", border: "rgba(129,140,248,0.25)" },
  "Liquidação":                { color: "#fbbf24", bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.25)" },
  "Segurança":                 { color: "#4ade80", bg: "rgba(74,222,128,0.1)", border: "rgba(74,222,128,0.25)" },
  "Regulatório":               { color: "#e879f9", bg: "rgba(232,121,249,0.1)", border: "rgba(232,121,249,0.25)" },
  "Pricing":                   { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)" },
  "Tokenização":               { color: "#38bdf8", bg: "rgba(56,189,248,0.1)", border: "rgba(56,189,248,0.25)" },
};

function getColor(cat: string) {
  return CATEGORY_COLORS[cat] ?? { color: "#60a5fa", bg: "rgba(96,165,250,0.1)", border: "rgba(96,165,250,0.25)" };
}

// Destaca o termo buscado no texto
function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase()
          ? <mark key={i} style={{ background: "rgba(251,191,36,0.3)", color: "#fbbf24", borderRadius: "2px", padding: "0 2px" }}>{part}</mark>
          : part
      )}
    </>
  );
}

type GlossarioItem = typeof glossarioData[0];

export default function GlossarioClient() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Todas");
  const [expanded, setExpanded] = useState<string | null>(null);

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

  const expandedItem = useMemo(
    () => glossarioData.find(i => i.termo === expanded) ?? null,
    [expanded]
  );

  return (
    <div className="space-y-8 pb-20">

      {/* ── Filtros e Busca ── */}
      <section className="sticky top-20 z-30 bg-[#030711]/90 backdrop-blur-md py-4 -mx-2 px-2 border-b border-slate-900/50">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Busque por termo, sigla ou definição (ex: 3DS, BRAM, VAMP)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0a1120] border border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white placeholder:text-slate-600 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar w-full md:w-auto">
            {categories.map(cat => {
              const c = getColor(cat);
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className="whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-bold transition-all border"
                  style={
                    selectedCategory === cat
                      ? { background: c.bg, borderColor: c.border, color: c.color }
                      : { background: "#0a1120", borderColor: "#1e293b", color: "#64748b" }
                  }
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Contador de resultados */}
        <div className="flex items-center gap-2 mt-2.5">
          <Filter size={12} className="text-slate-600" />
          <span className="text-xs text-slate-600">
            {filteredItems.length === glossarioData.length
              ? `${glossarioData.length} termos disponíveis`
              : `${filteredItems.length} de ${glossarioData.length} termos`}
          </span>
          {search && (
            <span className="text-xs text-yellow-500/70">· buscando por "{search}"</span>
          )}
        </div>
      </section>

      {/* ── Grid de Termos ── */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item, idx) => {
            const Icon = CATEGORY_ICONS[item.categoria] || BookMarked;
            const c = getColor(item.categoria);
            const isExpanded = expanded === item.termo;
            const shortDef = item.definicao.length > 120
              ? `${item.definicao.substring(0, 120)}…`
              : item.definicao;

            return (
              <motion.div
                key={item.termo}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15, delay: Math.min(idx * 0.015, 0.2) }}
                className="group relative border rounded-2xl flex flex-col overflow-hidden transition-all"
                style={{
                  background: isExpanded ? c.bg : "rgba(10,17,32,0.6)",
                  borderColor: isExpanded ? c.border : "rgba(30,41,59,0.6)",
                }}
              >
                {/* Card Header */}
                <div className="flex items-start gap-3 p-5">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all"
                    style={{ background: c.bg, border: `1px solid ${c.border}` }}
                  >
                    <Icon size={17} style={{ color: c.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-white leading-tight">
                      <Highlight text={item.termo} query={search} />
                      {item.sigla && (
                        <span className="ml-1.5 text-[11px] font-mono px-1.5 py-0.5 rounded" style={{ background: c.bg, color: c.color }}>
                          {item.sigla}
                        </span>
                      )}
                    </h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest mt-0.5" style={{ color: c.color }}>
                      {item.categoria}
                    </p>
                  </div>
                </div>

                {/* Definição curta com highlight */}
                <div className="px-5 pb-4 flex-1">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    <Highlight text={shortDef} query={search} />
                  </p>
                </div>

                {/* Expansão inline */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-4 space-y-3 border-t" style={{ borderColor: c.border }}>
                        <p className="text-xs text-slate-300 leading-relaxed pt-3">
                          {item.definicao}
                        </p>

                        {item.impacto && (
                          <div className="p-3 rounded-xl" style={{ background: "rgba(0,0,0,0.3)", border: `1px solid ${c.border}` }}>
                            <p className="text-[9px] font-bold uppercase tracking-widest mb-1.5" style={{ color: c.color }}>
                              ⚡ Impacto Prático
                            </p>
                            <p className="text-xs text-slate-300 leading-relaxed">{item.impacto}</p>
                          </div>
                        )}

                        {/* Bandeiras */}
                        <div className="flex gap-1.5 flex-wrap">
                          {item.bandeiras.map(b => (
                            <span
                              key={b}
                              className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                              style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}` }}
                            >
                              {b}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Footer / Expandir */}
                <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800/50">
                  <div className="flex gap-1.5 flex-wrap">
                    {item.bandeiras.slice(0, 3).map(b => (
                      <span key={b} className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[8px] font-bold text-slate-500 uppercase tracking-tighter">
                        {b}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => setExpanded(isExpanded ? null : item.termo)}
                    className="flex items-center gap-1.5 text-[11px] font-bold transition-colors hover:opacity-80"
                    style={{ color: c.color }}
                  >
                    {isExpanded ? (
                      <><ChevronDown size={13} /> Fechar</>
                    ) : (
                      <>Expandir <ChevronRight size={13} /></>
                    )}
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
          <button onClick={() => { setSearch(""); setSelectedCategory("Todas"); }} className="mt-4 text-xs text-blue-400 hover:text-blue-300">
            Limpar filtros →
          </button>
        </div>
      )}
    </div>
  );
}
