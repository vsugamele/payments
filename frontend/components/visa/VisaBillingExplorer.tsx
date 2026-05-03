"use client";

import { useState, useMemo } from "react";
import { 
  Search, 
  Table as TableIcon, 
  Filter, 
  ChevronRight, 
  Download,
  AlertCircle,
  FileText
} from "lucide-react";
import fullBillingData from "@/data/visa-billing-full.json";

export default function VisaBillingExplorer() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  const categories = useMemo(() => {
    const cats = new Set(fullBillingData.map((f: any) => f["Fee category"]));
    return ["All", ...Array.from(cats)].filter(c => c && c !== "NaN");
  }, []);

  const filteredData = useMemo(() => {
    return fullBillingData.filter((f: any) => {
      const matchesSearch = 
        f["Billing Line"]?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        f["Invoice Description"]?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        f["Long Description"]?.toString().toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = filterCategory === "All" || f["Fee category"] === filterCategory;
      
      return matchesSearch && matchesCategory;
    }).slice(0, 100); // Limit to 100 for performance in preview
  }, [searchTerm, filterCategory]);

  return (
    <div className="space-y-6">
      <div className="p-8 rounded-[2.5rem] bg-[#0a1120] border border-blue-500/10 space-y-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text"
              placeholder="Busque por Billing Line, Descrição ou Termo técnico..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#05080f] border border-slate-700 rounded-2xl py-3 pl-12 pr-4 text-white text-sm focus:border-blue-500 outline-none transition-all"
            />
          </div>
          
          <div className="flex gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900 border border-slate-800">
              <Filter size={16} className="text-blue-400" />
              <select 
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-300 outline-none"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <button className="px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-2">
              <Download size={16} /> Exportar
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                <th className="px-4 py-4">Line</th>
                <th className="px-4 py-4">Description</th>
                <th className="px-4 py-4">Category / Group</th>
                <th className="px-4 py-4">Client Type</th>
                <th className="px-4 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredData.map((row: any, idx) => (
                <tr key={idx} className="group hover:bg-white/5 transition-colors">
                  <td className="px-4 py-4 font-mono text-xs text-blue-400 font-bold">{row["Billing Line"]}</td>
                  <td className="px-4 py-4 max-w-md">
                    <p className="text-xs font-bold text-white mb-1">{row["Invoice Description"]}</p>
                    <p className="text-[10px] text-slate-500 line-clamp-1 group-hover:line-clamp-none transition-all">{row["Long Description"]}</p>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-[10px] text-slate-400 block font-bold">{row["Fee category"]}</span>
                    <span className="text-[9px] text-slate-600">{row["Fee Group"]}</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1">
                      {row["Client Type"]?.split(";").map((t: string) => (
                        <span key={t} className="px-1.5 py-0.5 rounded bg-slate-800 text-[9px] text-slate-500 border border-slate-700">
                          {t.trim()}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button className="text-slate-500 group-hover:text-blue-400 transition-colors">
                      <ChevronRight size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredData.length === 0 && (
          <div className="py-20 text-center space-y-4">
            <AlertCircle size={48} className="text-slate-800 mx-auto" />
            <p className="text-slate-500 text-sm">Nenhuma billing line encontrada para os termos buscados.</p>
          </div>
        )}

        <div className="pt-6 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-widest">
          <span>Mostrando {filteredData.length} de {fullBillingData.length} linhas</span>
          <div className="flex items-center gap-2">
            <FileText size={12} className="text-blue-500" />
            Source: Visa Fee Schedule BRAZIL
          </div>
        </div>
      </div>
    </div>
  );
}
