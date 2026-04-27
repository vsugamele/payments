"use client";

import { useState } from "react";
import { ArrowLeftRight, Bitcoin, CreditCard, Banknote, ShieldAlert, ArrowRight, CornerDownRight } from "lucide-react";
import data from "@/data/quasicash-rules.json";
import TermTooltip from "@/components/TermTooltip";

export default function QuasiCashClient() {
  const [selectedCase, setSelectedCase] = useState(data[0]);

  return (
    <div className="grid lg:grid-cols-4 gap-8">
      {/* MENU LATERAL */}
      <div className="space-y-4 lg:col-span-1">
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Modelos de Operação</h3>
        <div className="flex flex-col gap-2">
          {data.map((item) => {
            const isActive = selectedCase.id === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSelectedCase(item)}
                className={`text-left p-4 rounded-xl border transition-all ${
                  isActive ? "bg-primary text-primary-foreground border-primary" : "bg-code-bg border-border hover:border-primary/50 text-foreground"
                }`}
              >
                <div className="font-bold text-sm mb-1">{item.name}</div>
                <div className={`text-[10px] uppercase font-bold tracking-wider ${isActive ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                  {item.operation_type}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* DETALHAMENTO ARQUITETURAL */}
      <div className="lg:col-span-3 space-y-6">
        {/* Cabecalho do Tipo de Fluxo */}
        <div className="bg-code-bg border border-border p-6 rounded-2xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">
                  {selectedCase.operation_type}
                </span>
                <span className="bg-background border border-border px-2 py-1 rounded text-xs font-mono font-bold text-foreground">
                  MCC {selectedCase.mcc.split(" -")[0]}
                </span>
              </div>
              <h2 className="text-2xl font-black text-foreground mb-4">{selectedCase.mcc}</h2>
              <p className="text-sm text-foreground/80 leading-relaxed max-w-3xl">
                {selectedCase.description}
              </p>
            </div>
          </div>
        </div>

        {/* Diagrama de Fluxo Direcional */}
        <div className="p-8 pb-10 bg-black/40 border border-border rounded-2xl relative overflow-hidden flex flex-col items-center justify-center">
          <div className="absolute top-4 left-4 flex items-center gap-2 text-muted-foreground/50">
            <ArrowLeftRight size={16} /> <span className="text-[10px] uppercase font-bold tracking-widest">Money Flow</span>
          </div>

          <div className="flex items-center justify-center gap-4 mt-6">
             <div className="flex flex-col items-center p-4 bg-background border border-border rounded-xl w-32 shadow-xl z-10 text-center">
                <CreditCard size={32} className="text-muted-foreground mb-2" />
                <span className="font-bold text-sm">Emissor</span>
                <span className="text-[10px] text-muted-foreground">(Portador)</span>
             </div>

             <div className="flex flex-col items-center relative w-48 shrink-0">
               <ArrowRight size={24} className={`text-emerald-500 ${selectedCase.money_flow.includes("Exchange") && selectedCase.money_flow.startsWith("Exchange") ? "rotate-180 text-blue-500" : ""}`} />
               <div className="text-center mt-2 w-full">
                 <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${
                   selectedCase.money_flow.startsWith("Exchange") ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                 }`}>
                   {selectedCase.operation_type.includes("OCT") ? "Funding Out (OCT)" : "Funding In (AFT)"}
                 </span>
               </div>
             </div>

             <div className="flex flex-col items-center p-4 bg-background border border-border rounded-xl w-40 shadow-xl z-10 text-center">
                {selectedCase.mcc.includes("6051") ? <Bitcoin size={32} className="text-amber-500 mb-2" /> : <Banknote size={32} className="text-emerald-500 mb-2" />}
                <span className="font-bold text-sm truncate max-w-full">
                  {selectedCase.mcc.includes("6051") ? "Exchange Cripto" : selectedCase.mcc.includes("6540") ? "Digital Wallet" : "Casinos / Bets"}
                </span>
                <span className="text-[10px] text-muted-foreground">(Adquirente)</span>
             </div>
          </div>
        </div>

        {/* Regras por Bandeira Side-by-Side */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-code-bg border border-border p-5 rounded-xl flex flex-col h-full">
            <h4 className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-3 border-b border-border/50 pb-2 flex items-center justify-between">
              Regra Visa (Visa Direct/AFT)
              <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png" alt="Visa" className="h-3 opacity-50 grayscale" />
            </h4>
            <p className="text-sm text-foreground/80 leading-relaxed bg-background p-3 rounded-md border border-border/50 h-full">
              {selectedCase.visa_rule}
            </p>
          </div>
          <div className="bg-code-bg border border-border p-5 rounded-xl flex flex-col h-full">
            <h4 className="text-xs font-bold text-red-500 uppercase tracking-widest mb-3 border-b border-border/50 pb-2 flex items-center justify-between">
              Regra Mastercard (Send/AFT)
               <div className="flex -space-x-1 grayscale opacity-50">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500 mix-blend-multiply"></div>
               </div>
            </h4>
            <p className="text-sm text-foreground/80 leading-relaxed bg-background p-3 rounded-md border border-border/50 h-full">
              {selectedCase.mastercard_rule}
            </p>
          </div>
        </div>

        {/* ISO 8583 Indicators */}
        <div className="bg-background border border-border p-6 rounded-2xl">
          <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
            <CornerDownRight size={18} className="text-muted-foreground" />
            Impacto Técnico na Mensagem ISO 8583
          </h3>
          <div className="grid sm:grid-cols-3 gap-4">
            {Object.entries(selectedCase.iso_indicators).map(([field, value]) => (
              <div key={field} className="bg-code-bg p-3 rounded-xl border border-border">
                <div className="text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">{field.replace("_", " ")}</div>
                <div className="text-sm font-mono text-primary font-bold">{String(value)}</div>
              </div>
            ))}
            <div className={`p-3 rounded-xl border ${selectedCase.chargeback_risk === "Altíssimo" ? "bg-red-500/10 border-red-500/20" : selectedCase.chargeback_risk === "Alto" ? "bg-amber-500/10 border-amber-500/20" : "bg-emerald-500/10 border-emerald-500/20"}`}>
               <div className="text-[10px] font-bold text-foreground mb-1 uppercase tracking-wider flex items-center gap-1">
                 <ShieldAlert size={12} /> Risco Lavagem/Chargeback
               </div>
               <div className={`text-sm font-bold ${selectedCase.chargeback_risk === "Altíssimo" ? "text-red-500" : selectedCase.chargeback_risk === "Alto" ? "text-amber-500" : "text-emerald-500"}`}>
                 {selectedCase.chargeback_risk}
               </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
