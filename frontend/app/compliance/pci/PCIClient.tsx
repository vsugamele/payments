"use client";

import { useState } from "react";
import { Shield, ShieldAlert, Cpu, CheckCircle2, XCircle, AlertTriangle, Key } from "lucide-react";
import RuleReference from "@/components/RuleReference";
import TermTooltip from "@/components/TermTooltip";

type PCILevel = "SAQ A" | "SAQ A-EP" | "SAQ D";

type PCIData = {
  saq: PCILevel;
  reqCount: number;
  description: string;
  panStored: boolean;
  networkTokens: boolean;
  penTest: boolean;
  asvScans: boolean;
  color: string;
  bg: string;
  border: string;
};

const PCI_SCENARIOS: Record<string, PCIData> = {
  "iframe": {
    saq: "SAQ A",
    reqCount: 22,
    description: "Todo o processamento do cartão ocorre via iFrame ou Hosted Page de um provedor Nível 1. O lojista não tem acesso ao PAN em nenhum momento.",
    panStored: false,
    networkTokens: false,
    penTest: false,
    asvScans: false,
    color: "#4ade80",
    bg: "rgba(74,222,128,0.1)",
    border: "rgba(74,222,128,0.3)",
  },
  "api": {
    saq: "SAQ D",
    reqCount: 328,
    description: "O lojista recebe o PAN completo em claro na sua API (servidor) antes de enviar para a Adquirente. Escopo máximo de auditoria.",
    panStored: true,
    networkTokens: false,
    penTest: true,
    asvScans: true,
    color: "#ef4444",
    bg: "rgba(239,68,68,0.1)",
    border: "rgba(239,68,68,0.3)",
  },
  "token": {
    saq: "SAQ A",
    reqCount: 22,
    description: "O lojista recebe apenas um Network Token ou Gateway Token (TR). O PAN nunca toca os servidores. Carga regulatória baixíssima.",
    panStored: false,
    networkTokens: true,
    penTest: false,
    asvScans: false,
    color: "#2dd4bf",
    bg: "rgba(45,212,191,0.1)",
    border: "rgba(45,212,191,0.3)",
  },
  "js": {
    saq: "SAQ A-EP",
    reqCount: 191,
    description: "O lojista cria o formulário, mas o JS do provedor envia os dados direto para o gateway. O servidor não vê o PAN, mas controla a página do formulário.",
    panStored: false,
    networkTokens: false,
    penTest: true,
    asvScans: true,
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
    border: "rgba(245,158,11,0.3)",
  }
};

export default function PCIClient() {
  const [activeScenario, setActiveScenario] = useState<string>("api");
  const data = PCI_SCENARIOS[activeScenario];

  return (
    <div className="space-y-6">
      
      {/* Opções de Escopo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { id: "api", label: "Captura via API Própria", icon: AlertTriangle, desc: "Servidor acessa PAN" },
          { id: "js", label: "JavaScript / React", icon: Cpu, desc: "Front-end captura e envia" },
          { id: "iframe", label: "iFrame / Hosted Page", icon: Shield, desc: "Provedor T1 faz captura" },
          { id: "token", label: "Network Token API", icon: Key, desc: "Trafega apenas Tokens" },
        ].map(item => {
          const isSelected = activeScenario === item.id;
          const Icon = item.icon;
          const color = PCI_SCENARIOS[item.id].color;
          return (
            <button
              key={item.id}
              onClick={() => setActiveScenario(item.id)}
              className={`p-4 rounded-xl border text-left transition-all ${isSelected ? "" : "hover:bg-code-bg"}`}
              style={{
                borderColor: isSelected ? color : "var(--border)",
                background: isSelected ? PCI_SCENARIOS[item.id].bg : "var(--background)",
              }}
            >
              <div className="flex items-center gap-2 mb-1" style={{ color: isSelected ? color : "var(--muted-foreground)" }}>
                 <Icon size={16} />
                 <span className="font-bold text-sm text-foreground">{item.label}</span>
              </div>
              <p className="text-[10px] text-muted-foreground">{item.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Resultados do Escopo */}
      <div className="mt-8 animate-in fade-in duration-300">
         <div className="p-6 rounded-2xl border bg-code-bg" style={{ borderColor: data.border }}>
           <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-border/50">
             
             <div>
               <div className="flex items-center gap-3 mb-2">
                 <h2 className="text-3xl font-black" style={{ color: data.color }}>{data.saq}</h2>
                 <span className="px-3 py-1 text-xs font-bold rounded-full" style={{ background: data.bg, color: data.color, border: `1px solid ${data.border}` }}>
                   {data.reqCount} Requisitos
                 </span>
               </div>
               <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
                 {data.description}
               </p>
             </div>

           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
             <div className="space-y-4">
               <h3 className="text-xs uppercase tracking-wider font-bold text-muted-foreground flex items-center gap-2">
                 <ShieldAlert size={14} /> Dados em Risco (Req. 3)
               </h3>
               <div className="space-y-3">
                 <div className="flex items-center justify-between bg-background p-3 rounded-xl border border-border">
                   <span className="text-sm font-bold text-foreground">PAN Estocado / Transitado</span>
                   {data.panStored ? <XCircle size={16} className="text-red-400" /> : <CheckCircle2 size={16} className="text-emerald-400" />}
                 </div>
                 <div className="flex items-center justify-between bg-background p-3 rounded-xl border border-border">
                   <span className="text-sm font-bold text-foreground">Uso de Network Tokens (VTS/MDES)</span>
                   {data.networkTokens ? <CheckCircle2 size={16} className="text-emerald-400" /> : <XCircle size={16} className="text-red-400" />}
                 </div>
               </div>
             </div>

             <div className="space-y-4">
               <h3 className="text-xs uppercase tracking-wider font-bold text-muted-foreground flex items-center gap-2">
                 <Cpu size={14} /> Testes de Segurança (Req. 11)
               </h3>
               <div className="space-y-3">
                 <div className="flex items-center justify-between bg-background p-3 rounded-xl border border-border">
                   <span className="text-sm font-bold text-foreground">ASV Scans (Vulnerabilidades)</span>
                   {data.asvScans ? <span className="text-xs font-bold px-2 py-1 bg-amber-500/20 text-amber-400 rounded-md">Trimestral</span> : <span className="text-xs text-emerald-400">Isento</span>}
                 </div>
                 <div className="flex items-center justify-between bg-background p-3 rounded-xl border border-border">
                   <span className="text-sm font-bold text-foreground">Penetration Testing (Pen Test)</span>
                   {data.penTest ? <span className="text-xs font-bold px-2 py-1 bg-red-500/20 text-red-500 rounded-md">Anual / Obrigatório</span> : <span className="text-xs text-emerald-400">Isento</span>}
                 </div>
               </div>
             </div>
           </div>

         </div>
      </div>

    </div>
  );
}
