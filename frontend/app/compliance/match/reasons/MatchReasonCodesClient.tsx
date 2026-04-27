"use client";

import { useState } from "react";
import { Search, AlertTriangle, ShieldX, Skull, Info, Clock, ArchiveRestore, ShieldOff } from "lucide-react";
import data from "@/data/match-reasons.json";

export default function MatchReasonCodesClient() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMatch, setSelectedMatch] = useState(data[2]); // Defaulting to Lavagem

  const filteredData = data.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.includes(searchTerm)
  );

  return (
    <div className="grid lg:grid-cols-12 gap-8">
      {/* ── Lateral Esquerda (Busca e Menu) ── */}
      <div className="lg:col-span-4 space-y-6">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-3 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar RC ex: 14, 04 ou nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-background border border-border rounded-xl py-3 pl-10 pr-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
          />
        </div>

        <div className="bg-code-bg border border-border rounded-xl max-h-[600px] overflow-y-auto custom-scrollbar">
          {filteredData.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Nenhum código encontrado para '{searchTerm}'
            </div>
          ) : (
            <ul className="divide-y divide-border/50">
              {filteredData.map((item) => {
                const isSelected = selectedMatch?.code === item.code;
                const isBan = item.severity === "Banimento Definitivo";
                const isCritical = item.severity === "Crítico";

                return (
                  <li key={item.code}>
                    <button
                      onClick={() => setSelectedMatch(item)}
                      className={`w-full text-left px-5 py-4 transition-colors hover:bg-muted/50 ${
                        isSelected ? "bg-muted/60" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-1">
                        <span
                          className={`font-mono text-sm font-black px-2 py-0.5 rounded border ${
                            isSelected
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background border-border text-foreground"
                          }`}
                        >
                          RC {item.code}
                        </span>
                        <p
                          className={`text-sm font-bold truncate ${
                            isSelected ? "text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {item.name}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 mt-3">
                        <span className={`flex items-center gap-1 text-[10px] uppercase font-bold px-1.5 py-0.5 border rounded ${
                           isBan ? "text-red-500 border-red-500/30 bg-red-500/10" : 
                           isCritical ? "text-orange-500 border-orange-500/30 bg-orange-500/10" : 
                           "text-amber-500 border-amber-500/30 bg-amber-500/10"
                        }`}>
                          {isBan ? <Skull size={10} /> : isCritical ? <ShieldX size={10} /> : <AlertTriangle size={10} />}
                          {item.severity}
                        </span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* ── Painel Direito (Detalhes do Código) ── */}
      <div className="lg:col-span-8">
        {selectedMatch ? (
          <div className="bg-code-bg border border-border rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 shadow-sm">
            {/* Header */}
            <div className={`p-6 border-b relative overflow-hidden ${
              selectedMatch.severity === "Banimento Definitivo" ? "border-red-500/20 bg-red-500/5" :
              selectedMatch.severity === "Crítico" ? "border-orange-500/20 bg-orange-500/5" :
              "border-amber-500/20 bg-amber-500/5"
            }`}>
              
              {/* Marca d'agua */}
              <div className="absolute -right-6 -bottom-10 opacity-[0.03] rotate-[-10deg] pointer-events-none">
                <Skull size={200} />
              </div>

              <div className="flex items-center gap-4 relative z-10">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border shadow-sm ${
                  selectedMatch.severity === "Banimento Definitivo" ? "bg-red-500/10 border-red-500/30 text-red-500" :
                  selectedMatch.severity === "Crítico" ? "bg-orange-500/10 border-orange-500/30 text-orange-500" :
                  "bg-amber-500/10 border-amber-500/30 text-amber-500"
                }`}>
                  {selectedMatch.severity === "Banimento Definitivo" ? <Skull size={28} /> : 
                   selectedMatch.severity === "Crítico" ? <ShieldX size={28} /> : 
                   <AlertTriangle size={28} />}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-2xl font-black text-foreground">Reason Code {selectedMatch.code}</h2>
                    <span className={`px-2 py-0.5 text-[10px] tracking-wider font-black uppercase rounded border ${
                      selectedMatch.severity === "Banimento Definitivo" ? "bg-red-500/10 border-red-500/20 text-red-500" :
                      selectedMatch.severity === "Crítico" ? "bg-orange-500/10 border-orange-500/20 text-orange-500" :
                      "bg-amber-500/10 border-amber-500/20 text-amber-500"
                    }`}>
                      {selectedMatch.severity}
                    </span>
                  </div>
                  <p className="text-lg text-foreground font-medium">{selectedMatch.name}</p>
                </div>
              </div>

              <div className="mt-5 text-sm text-foreground/90 leading-relaxed font-medium relative z-10 p-4 bg-background rounded-lg border border-border shadow-sm">
                {selectedMatch.description}
              </div>
            </div>

            <div className="p-6 space-y-6">
              
              {/* Liability Shift Warning */}
              <div>
                <h3 className="text-xs uppercase font-bold tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                  <ShieldOff size={14} /> Direitos e Responsabilidade em Intervenção (Ignorar o banimento)
                </h3>
                <div className={`p-5 rounded-xl border flex gap-4 shadow-sm ${
                  selectedMatch.severity === "Banimento Definitivo" || selectedMatch.severity === "Crítico" 
                    ? "bg-red-500/5 border-red-500/20" 
                    : "bg-amber-500/5 border-amber-500/20"
                }`}>
                  <div className="mt-1">
                    {selectedMatch.severity === "Banimento Definitivo" || selectedMatch.severity === "Crítico" 
                      ? <Skull size={18} className="text-red-500" /> 
                      : <AlertTriangle size={18} className="text-amber-500" />}
                  </div>
                  <div>
                    <p className={`text-sm font-bold mb-1 ${
                      selectedMatch.severity === "Banimento Definitivo" || selectedMatch.severity === "Crítico" 
                        ? "text-red-500" 
                        : "text-amber-500"
                    }`}>
                      Consequência Jurídica ao Adquirente
                    </p>
                    <p className="text-sm text-foreground/80 leading-relaxed font-medium">
                      {selectedMatch.liability_shift}
                    </p>
                  </div>
                </div>
              </div>

              {/* Technical / Meta info */}
              <div className="grid sm:grid-cols-2 gap-4">
                 
                 <div className="p-4 rounded-xl border border-border bg-background flex flex-col justify-between shadow-sm">
                   <div className="flex items-center gap-2 text-muted-foreground mb-2">
                     <ArchiveRestore size={16} />
                     <span className="text-xs font-bold uppercase tracking-wider">Ação Retro-Match</span>
                   </div>
                   <p className="text-sm text-foreground/80 font-medium">
                     {selectedMatch.retro_match}
                   </p>
                 </div>

                 <div className="p-4 rounded-xl border border-border bg-background flex flex-col justify-between shadow-sm">
                   <div className="flex items-center gap-2 text-muted-foreground mb-2">
                     <Clock size={16} />
                     <span className="text-xs font-bold uppercase tracking-wider">Retenção de Arquivo</span>
                   </div>
                   <p className="text-sm font-black text-foreground">
                     {selectedMatch.retention_period}
                   </p>
                 </div>

              </div>

              {/* Equivalence Base Visa */}
              <div className="mt-4 p-4 rounded-lg bg-indigo-500/5 border border-indigo-500/20 text-sm shadow-sm">
                 <div className="flex items-start gap-2 text-indigo-400">
                   <Info size={16} className="mt-0.5 shrink-0" />
                   <div>
                     <strong className="block mb-1 text-indigo-500">Equivalência Visa VMAS (Visa Merchant Alert Service):</strong>
                     <span className="text-indigo-400 font-medium">{selectedMatch.visa_equivalent}</span>
                   </div>
                 </div>
              </div>

            </div>
          </div>
        ) : (
          <div className="h-full min-h-[400px] flex items-center justify-center border border-dashed border-border rounded-2xl text-muted-foreground">
            Selecione um código MATCH à esquerda para projetar o dossiê.
          </div>
        )}
      </div>
    </div>
  );
}
