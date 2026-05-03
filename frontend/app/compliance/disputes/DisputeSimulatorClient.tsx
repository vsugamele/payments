"use client";

import { useState } from "react";
import { Search, ShieldAlert, Gavel, FileCheck, Info, Skull, ArrowRight, ShieldCheck, SearchCheck } from "lucide-react";
import data from "@/data/dispute-codes.json";
import RuleReference from "@/components/RuleReference";

export default function DisputeSimulatorClient() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDispute, setSelectedDispute] = useState<any>(data[0]); // Default to 4837 Fraud

  const filteredData = data.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.includes(searchTerm) ||
      item.visa_equivalent.includes(searchTerm)
  );

  return (
    <div className="grid lg:grid-cols-12 gap-8">
      {/* ── Lateral Esquerda (Busca e Menu) ── */}
      <div className="lg:col-span-4 space-y-6">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-3 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por código 4837, 10.4..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-background border border-border rounded-xl py-3 pl-10 pr-4 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all"
          />
        </div>

        <div className="bg-code-bg border border-border rounded-xl max-h-[650px] overflow-y-auto custom-scrollbar">
          {filteredData.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Nenhuma disputa encontrada para '{searchTerm}'
            </div>
          ) : (
            <ul className="divide-y divide-border/50">
              {filteredData.map((item) => {
                const isSelected = selectedDispute?.code === item.code;
                const isFraud = item.category === "Fraud";

                return (
                  <li key={item.code}>
                    <button
                      onClick={() => setSelectedDispute(item)}
                      className={`w-full text-left px-5 py-4 transition-colors hover:bg-muted/50 ${
                        isSelected ? "bg-muted/60" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`font-mono text-sm font-black px-2 py-0.5 rounded border ${
                            isSelected
                              ? "bg-red-500 text-white border-red-500"
                              : "bg-background border-border text-foreground"
                          }`}
                        >
                          RC {item.code}
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-muted-foreground">
                           Visa
                           <span className="bg-blue-500/10 text-blue-500 border border-blue-500/20 px-1 rounded">
                             {item.visa_equivalent}
                           </span>
                        </div>
                      </div>

                      <p
                        className={`text-sm font-bold truncate mt-2 ${
                          isSelected ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {item.name}
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 border rounded ${
                           isFraud ? "text-red-400 border-red-400/30" : "text-slate-400 border-slate-400/30"
                        }`}>
                          {item.category}
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

      {/* ── Painel Direito (Detalhes Analíticos) ── */}
      <div className="lg:col-span-8">
        {selectedDispute ? (
          <div className="bg-code-bg border border-border rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 shadow-sm flex flex-col h-full">
            
            {/* Header Diagnóstico */}
            <div className={`p-6 border-b relative overflow-hidden ${
              selectedDispute.recovery_chance === "Critically Low" || selectedDispute.recovery_chance === "Very Low" 
              ? "border-red-500/20 bg-red-500/5" : "border-slate-500/20 bg-slate-500/5"
            }`}>
              
              {/* Marca d'agua */}
              <div className="absolute -right-6 -bottom-10 opacity-[0.03] rotate-[-10deg] pointer-events-none">
                <Gavel size={200} />
              </div>

              <div className="flex items-start justify-between relative z-10 gap-x-4">
                 <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border shadow-sm ${
                      selectedDispute.recovery_chance === "Critically Low" ? "bg-red-500/10 border-red-500/30 text-red-500" :
                      "bg-slate-500/10 border-slate-500/30 text-slate-500"
                    }`}>
                      {selectedDispute.recovery_chance === "Critically Low" ? <Skull size={28} /> : 
                       <Gavel size={28} />}
                    </div>
                    <div>
                      <div className="flex gap-4">
                         <div>
                            <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-0.5">Mastercard</span>
                            <div className="flex items-center gap-2 mb-1">
                               <h2 className="text-2xl font-black text-foreground">RC {selectedDispute.code}</h2>
                               <span className="px-1.5 py-0.5 text-[9px] tracking-wider font-bold uppercase rounded border bg-amber-500/10 border-amber-500/20 text-amber-500">
                                  {selectedDispute.mastercom_stage}
                               </span>
                            </div>
                         </div>
                         <div className="w-px bg-border my-1"></div>
                         <div>
                             <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-0.5">Visa VROL</span>
                             <div className="flex items-center gap-2 mb-1">
                                <h2 className="text-2xl font-black text-blue-500">{selectedDispute.visa_equivalent}</h2>
                                <span className="px-1.5 py-0.5 text-[9px] tracking-wider font-bold uppercase rounded border bg-blue-500/10 border-blue-500/20 text-blue-500">
                                   {selectedDispute.visa_stage}
                                </span>
                             </div>
                         </div>
                      </div>
                      
                      <p className="text-lg text-foreground font-medium mt-1">{selectedDispute.name}</p>
                    </div>
                 </div>

                 {/* Custo de Arbitragem */}
                 <div className="text-right shrink-0 bg-background/50 border border-border p-3 rounded-lg">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Custo de Arbitragem VROL/Mastercom</span>
                    <span className="text-xl font-black text-red-400">US$ {selectedDispute.arbitration_risk}</span>
                 </div>
              </div>

              <div className="mt-5 text-sm text-foreground/90 leading-relaxed font-medium relative z-10 p-4 bg-background rounded-lg border border-border shadow-sm">
                {selectedDispute.description}
              </div>
            </div>

            <div className="p-6 space-y-6 flex-1 bg-gradient-to-b from-transparent to-muted/20">
              
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 shadow-sm">
                    <h3 className="text-xs uppercase font-bold tracking-wider text-red-500 mb-2 flex items-center gap-2">
                       <ShieldAlert size={14} /> Chance de Reversão
                    </h3>
                    <p className={`text-xl font-black ${
                        selectedDispute.recovery_chance === "Critically Low" ? "text-red-500" :
                        selectedDispute.recovery_chance === "High" ? "text-emerald-500" : "text-amber-500"
                    }`}>
                       {selectedDispute.recovery_chance}
                    </p>
                 </div>

                 <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 shadow-sm">
                    <h3 className="text-xs uppercase font-bold tracking-wider text-blue-500 mb-2 flex items-center gap-2">
                       <ShieldCheck size={14} /> Tese de Defesa Mandatória
                    </h3>
                    <p className="text-xs text-foreground/80 font-medium">
                       {selectedDispute.doc_required}
                    </p>
                 </div>
              </div>

              {/* Compelling Evidence Box */}
              <div>
                <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2 border-b border-border pb-2">
                  <FileCheck size={16} className="text-emerald-500" />
                  Checklist de Defesa (Compelling Evidence)
                </h3>
                
                <div className="space-y-3">
                  {selectedDispute.compelling_evidence.map((ev: any, i: number) => (
                    <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-background border border-border shadow-sm">
                       <div className="mt-0.5 bg-emerald-500/10 text-emerald-500 font-mono text-[10px] font-bold px-2 py-1 rounded border border-emerald-500/20 shrink-0">
                          {ev.type}
                       </div>
                       <div>
                          <p className="text-sm font-bold text-foreground mb-1">{ev.name}</p>
                          <p className="text-xs text-muted-foreground leading-relaxed">{ev.desc}</p>
                       </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fundamentações Legais */}
              <div className="pt-4 border-t border-border grid sm:grid-cols-2 gap-6">
                 <div>
                    <h4 className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-muted-foreground mb-2">
                       <ArrowRight size={12} /> Referência Mastercard
                    </h4>
                    <RuleReference 
                       manual={selectedDispute.manualBase}
                       ruleId={selectedDispute.code}
                       description={selectedDispute.manualReference}
                    />
                 </div>
                 <div>
                    <h4 className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-muted-foreground mb-2">
                       <ArrowRight size={12} /> Referência Visa
                    </h4>
                    <RuleReference 
                       manual={selectedDispute.visaManualBase || "VDMG"}
                       ruleId={selectedDispute.visa_equivalent}
                       description={selectedDispute.visaManualReference || `Condition ${selectedDispute.visa_equivalent}`}
                    />
                 </div>
              </div>

            </div>
          </div>
        ) : (
          <div className="h-full min-h-[400px] flex items-center justify-center border border-dashed border-border rounded-2xl text-muted-foreground">
            Selecione uma categoria de Chargeback à esquerda para analisar o dossiê.
          </div>
        )}
      </div>
    </div>
  );
}
