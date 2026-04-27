"use client";

import { useState } from "react";
import { ShieldCheck, ShieldAlert, Key, Zap, CheckCircle2, XCircle, Info, CreditCard } from "lucide-react";
import RuleReference from "@/components/RuleReference";
import TermTooltip from "@/components/TermTooltip";

type Brand = "Visa" | "Mastercard";

type ECIResult = {
  flow: string;
  visaEci: string;
  mcEci: string;
  description: string;
  liabilityShift: boolean;
  immuneTo: string[];
  vulnerableTo: string[];
  icon: any;
  color: string;
  bg: string;
  border: string;
};

const ECI_DATA: ECIResult[] = [
  {
    flow: "Frictionless / Fully Authenticated",
    visaEci: "05",
    mcEci: "02",
    description: "Autenticação completa. O emissor validou o portador silenciosamente (Frictionless) ou via desafio (Challenge/OTP).",
    liabilityShift: true,
    immuneTo: ["Fraude (RC 10.4 Visa / 4837 Mastercard)", "Disputas de 'Transação não reconhecida'"],
    vulnerableTo: ["Produto defeituoso", "Mercadoria não entregue", "Assinatura cancelada"],
    icon: ShieldCheck,
    color: "#4ade80",
    bg: "rgba(74,222,128,0.1)",
    border: "rgba(74,222,128,0.3)",
  },
  {
    flow: "Attempts / Proof of Attempt",
    visaEci: "06",
    mcEci: "01",
    description: "O lojista tentou autenticar no 3DS, mas o emissor do cartão não participa do programa ou o ACS estava fora do ar. O lojista é premiado por tentar.",
    liabilityShift: true,
    immuneTo: ["Fraude (RC 10.4 Visa / 4837 Mastercard)"],
    vulnerableTo: ["Fraude se o lojista estiver em programa EFM/VAMP excessivo (alguns casos)"],
    icon: Zap,
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
    border: "rgba(245,158,11,0.3)",
  },
  {
    flow: "Non-Authenticated / Sem 3DS",
    visaEci: "07",
    mcEci: "00",
    description: "Transação E-commerce CNP normal sem passar pelo protocolo 3D-Secure. Risco total do lojista.",
    liabilityShift: false,
    immuneTo: [],
    vulnerableTo: ["Todo e qualquer tipo de fraude amigável ou efetiva", "RC 10.4 Visa", "RC 4837 Mastercard"],
    icon: ShieldAlert,
    color: "#ef4444",
    bg: "rgba(239,68,68,0.1)",
    border: "rgba(239,68,68,0.3)",
  },
  {
    flow: "Recurring / MIT (Merchant Initiated)",
    visaEci: "07 (MIT)",
    mcEci: "00 (MIT)",
    description: "Transações recorrentes originais não têm ECI de autenticação, dependem do TIDI original. A primeira (CIT) deve ser autenticada (ECI 05/02).",
    liabilityShift: false, // MIT assumes previous liability if CIT was 3DS, but strict MIT is merchant risk
    immuneTo: ["Fraude (Se CIT orginal foi 3DS e TIDI correto enviado)"],
    vulnerableTo: ["Chargeback de Recorrência Cancelada (RC 13.5 Visa)"],
    icon: CreditCard,
    color: "#60a5fa",
    bg: "rgba(96,165,250,0.1)",
    border: "rgba(96,165,250,0.3)",
  }
];

export default function ThreeDSMatrixClient() {
  const [selectedBrand, setSelectedBrand] = useState<Brand>("Mastercard");
  const [activeFlow, setActiveFlow] = useState<string>("Frictionless / Fully Authenticated");

  const currentData = ECI_DATA.find(d => d.flow === activeFlow) || ECI_DATA[0];
  const Icon = currentData.icon;

  return (
    <div className="space-y-8">
      {/* Brand Toggle */}
      <div className="flex gap-4 p-1 bg-code-bg border border-border w-fit rounded-xl">
        <button
          onClick={() => setSelectedBrand("Mastercard")}
          className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${
            selectedBrand === "Mastercard" ? "bg-red-500/20 text-red-500" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Mastercard
        </button>
        <button
          onClick={() => setSelectedBrand("Visa")}
          className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${
            selectedBrand === "Visa" ? "bg-blue-500/20 text-blue-500" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Visa
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Sidebar: Flow Selection */}
        <div className="md:col-span-4 space-y-3">
          <p className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground mb-4">Escolha a Situação do 3DS</p>
          {ECI_DATA.map(item => {
            const isSelected = activeFlow === item.flow;
            const ItemIcon = item.icon;
            return (
              <button
                key={item.flow}
                onClick={() => setActiveFlow(item.flow)}
                className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-3 ${
                  isSelected ? "" : "hover:bg-code-bg border-border"
                }`}
                style={{
                  background: isSelected ? item.bg : "var(--background)",
                  borderColor: isSelected ? item.color : "var(--border)",
                }}
              >
                <div style={{ color: isSelected ? item.color : "var(--muted-foreground)" }}>
                  <ItemIcon size={18} />
                </div>
                <span className={`text-sm font-bold ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>
                  {item.flow}
                </span>
              </button>
            )
          })}
        </div>

        {/* Main Display: ECI & Liability */}
        <div className="md:col-span-8 animate-in fade-in zoom-in-95 duration-300">
          <div className="p-6 rounded-2xl border bg-code-bg space-y-8" style={{ borderColor: currentData.border }}>
            
            {/* Header / ECI Display */}
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between border-b border-border/50 pb-6">
               <div className="flex items-center gap-4">
                 <div className="w-14 h-14 rounded-full flex items-center justify-center shrink-0" style={{ background: currentData.bg, border: `1px solid ${currentData.border}` }}>
                   <Icon size={24} style={{ color: currentData.color }} />
                 </div>
                 <div>
                   <p className="text-foreground font-black text-xl mb-1">{currentData.flow}</p>
                   <p className="text-sm text-muted-foreground leading-relaxed max-w-md">{currentData.description}</p>
                 </div>
               </div>
               
               <div className="shrink-0 text-center bg-background border border-border p-3 rounded-xl min-w-[120px]">
                 <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-1">
                   Valor ECI ({selectedBrand})
                 </p>
                 <p className="text-3xl font-black font-mono tracking-widest text-foreground">
                   {selectedBrand === "Mastercard" ? currentData.mcEci : currentData.visaEci}
                 </p>
               </div>
            </div>

            {/* Liability Shift Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Liability Toggle Box */}
              <div
                className="p-5 rounded-xl border flex flex-col justify-center"
                style={{
                  background: currentData.liabilityShift ? "rgba(74,222,128,0.1)" : "rgba(239,68,68,0.1)",
                  borderColor: currentData.liabilityShift ? "rgba(74,222,128,0.3)" : "rgba(239,68,68,0.3)"
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  {currentData.liabilityShift ? (
                     <CheckCircle2 size={20} className="text-emerald-400" />
                  ) : (
                     <XCircle size={20} className="text-red-400" />
                  )}
                  <h3 className="font-bold text-foreground text-lg">
                    {currentData.liabilityShift ? "Liability Shift Ativo" : "Risco do Lojista"}
                  </h3>
                </div>
                <p className={`text-sm ${currentData.liabilityShift ? "text-emerald-400/80" : "text-red-400/80"}`}>
                  {currentData.liabilityShift 
                    ? "Fraude financeira por uso indevido será custeada pelo Banco Emissor." 
                    : "Chargebacks de fraude serão debitados da conta do lojista (Adquirente)."}
                </p>
              </div>

              {/* Protective Details */}
              <div className="space-y-4">
                {currentData.immuneTo.length > 0 && (
                  <div>
                    <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">
                      <ShieldCheck size={14} /> Imune a:
                    </h4>
                    <ul className="space-y-1.5">
                      {currentData.immuneTo.map((rule, idx) => (
                        <li key={idx} className="text-xs text-muted-foreground pl-3 border-l-2 border-emerald-500/30">
                          {rule}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {currentData.vulnerableTo.length > 0 && (
                  <div>
                    <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
                      <ShieldAlert size={14} /> Ainda vulnerável a:
                    </h4>
                    <ul className="space-y-1.5">
                      {currentData.vulnerableTo.map((rule, idx) => (
                        <li key={idx} className="text-xs text-muted-foreground pl-3 border-l-2 border-amber-500/30">
                          {rule}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

            </div>

             {/* Referências Normativas */}
             <div className="pt-4 border-t border-border flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Key size={14} /> ECI: <TermTooltip term="Electronic Commerce Indicator" definition="Um campo de dois dígitos devolvido pelo MPI (Merchant Plug-In) após a tentativa 3D-Secure, que deve ser trafegado na ISO 8583 do fechamento da autorização." />
                </span>
                <RuleReference 
                  manual="EMVCo 3DS" 
                  ruleId="Liability Shift Matrix" 
                  description="Regulação oficial para inversão do ônus de fraude no e-commerce transfronteiriço e doméstico." 
                />
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
