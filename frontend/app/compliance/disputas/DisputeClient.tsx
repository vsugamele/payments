"use client";

import { useState } from "react";
import disputeCodesData from "../../../data/dispute-codes.json";
import { Scale, ArrowRight, UploadCloud, Server, ShieldCheck, AlertCircle, CheckCircle2, ChevronRight, FileText, BadgeDollarSign, Calculator, BookOpen } from "lucide-react";
import TermTooltip from "@/components/TermTooltip";
import RuleReference from "@/components/RuleReference";
import DisputeDecisionTree from "@/components/DisputeDecisionTree";

type Stage = "First Chargeback" | "Representment" | "Pre-Arbitration" | "Arbitration";

const STAGES: Stage[] = ["First Chargeback", "Representment", "Pre-Arbitration", "Arbitration"];

export default function DisputeClient() {
  const [selectedCode, setSelectedCode] = useState(disputeCodesData[0]);
  const [currentStage, setCurrentStage] = useState<Stage>("First Chargeback");
  const [loading, setLoading] = useState(false);
  const [transactionId] = useState(`TXN-${Math.random().toString(36).substring(2, 12).toUpperCase()}`);
  const [disputeId] = useState(`DSP-${Math.random().toString(36).substring(2, 10).toUpperCase()}`);
  const [disputeAmount, setDisputeAmount] = useState<number>(149.90);

  const handleStageChange = (stage: Stage) => {
    setLoading(true);
    setTimeout(() => {
      setCurrentStage(stage);
      setLoading(false);
    }, 600);
  };

  // Funções geradoras de payloads fake:
  const getPayload = (stage: Stage) => {
    switch (stage) {
      case "First Chargeback":
        return {
          "Endpoint": "POST /mastercom/v6/claim/chargebacks",
          "Body": {
            "claimId": disputeId,
            "currency": "BRL",
            "reasonCode": selectedCode.code,
            "amount": disputeAmount.toFixed(2),
            "transactionId": transactionId
          }
        };
      case "Representment":
        return {
          "Endpoint": "POST /mastercom/v6/claim/chargebacks (Reversal)",
          "Body": {
            "claimId": disputeId,
            "chargebackType": "REPRESENTMENT",
            "documentIndicator": "true",
            "reasonCode": selectedCode.code,
            "amount": disputeAmount.toFixed(2),
            "documentIds": ["DOC-898234", "DOC-112344"]
          }
        };
      case "Pre-Arbitration":
        return {
          "Endpoint": "POST /mastercom/v6/claim/cases",
          "Body": {
            "claimId": disputeId,
            "caseType": "PRE_ARBITRATION",
            "violationCode": selectedCode.code,
            "drfDocumentIndicator": "true"
          }
        };
      case "Arbitration":
        return {
          "Endpoint": "POST /mastercom/v6/claim/cases (Escalate)",
          "Body": {
            "claimId": disputeId,
            "caseType": "ARBITRATION",
            "feeAcceptance": true,
            "amount": disputeAmount.toFixed(2)
          }
        };
      }
  };

  const getFinancialAdvice = () => {
    const cost = selectedCode.arbitration_risk || 500;
    if (disputeAmount < cost) {
      return { 
        recommend: false, 
        message: `Atenção: O chargeback é de R$ ${disputeAmount.toFixed(2)}, mas as taxas (fees) caso você perca a arbitragem na bandeira podem chegar a USD/EUR ${cost}. Não recomendável avançar além de Representment pela equação de risco.`
      };
    }
    return {
      recommend: true,
      message: `O chargeback possui alto valor (R$ ${disputeAmount.toFixed(2)}). Se você confia plenamente nas Compelling Evidences atreladas a este caso, a defesa escalada em Arbitragem é matematicamente justificável.`
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* ── Esquerda: Controles ── */}
      <div className="space-y-6">
        
        {/* Painel Configurator */}
        <div style={{ background: "var(--code-bg)", border: "1px solid var(--border)", borderRadius: "1rem", overflow: "hidden" }}>
          <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border)" }}>
            <h2 className="text-sm font-bold flex items-center gap-2 text-foreground">
              <Scale size={16} className="text-purple-500" />
              Configuração da Disputa
            </h2>
          </div>
          
          <div className="p-6 space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-2">
                    Chargeback Value (R$)
                  </label>
                  <input
                    type="number"
                    className="input-base"
                    value={disputeAmount}
                    onChange={(e) => setDisputeAmount(Number(e.target.value) || 0)}
                  />
               </div>
               <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-2">
                    Bandeira Opcional
                  </label>
                  <div className="p-2 border border-border bg-background rounded-lg text-xs flex items-center text-muted-foreground opacity-50 cursor-not-allowed">
                    Mastercard (API Lock)
                  </div>
               </div>
            </div>

            <div className="mt-6 mb-4">
               <DisputeDecisionTree onCodeSelected={(code) => {
                 const match = disputeCodesData.find((c) => c.code === code);
                 if (match) {
                   setSelectedCode(match as any);
                   handleStageChange("First Chargeback");
                 }
               }} />
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground mt-4 mb-2 bg-background p-3 rounded-lg border border-border">
               <span className="uppercase tracking-wider font-medium flex items-center gap-2">
                 <Server size={14} /> Código Resolvido na Árvore:
               </span>
               <span className="font-mono text-purple-400 font-bold px-2 py-0.5 rounded border border-purple-500/30 bg-purple-500/10">
                 RC {selectedCode.code} - {selectedCode.name}
               </span>
            </div>

            {/* Cross Network Mapping */}
            <div className="flex items-center gap-4 mt-2 mb-4 bg-background border border-border p-3 rounded-xl">
               <div className="text-xs">
                 <span className="text-muted-foreground block mb-0.5">VROL Visa Equivalent:</span>
                 <span className="font-bold text-foreground bg-input px-2 py-0.5 rounded border border-border">{selectedCode.visa_equivalent}</span>
               </div>
               <div className="w-[1px] h-6 bg-border mx-2"></div>
               <div className="text-xs">
                 <span className="text-muted-foreground block mb-0.5">Visa VCR Stage:</span>
                 <span className={`font-bold ${selectedCode.visa_stage === "Allocation" ? "text-red-400" : "text-blue-400"}`}>{selectedCode.visa_stage}</span>
               </div>
            </div>

          </div>
        </div>

        {/* Timeline Interaction */}
        <div className="space-y-3">
          <p className="section-eyebrow mb-1">Ações da Lifecycle (Interaja)</p>
          {STAGES.map((stage, idx) => {
            const isActive = stage === currentStage;
            const isPast = STAGES.indexOf(currentStage) > idx;

            return (
              <button
                key={stage}
                onClick={() => handleStageChange(stage)}
                className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between ${
                  isActive
                    ? "border-purple-500 bg-purple-500/10 ring-1 ring-purple-500/50"
                    : isPast
                    ? "border-border bg-input opacity-70 hover:opacity-100 cursor-pointer"
                    : "border-border bg-input/50 text-muted-foreground hover:border-border cursor-pointer grayscale opacity-50 hover:grayscale-0 hover:opacity-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                    isActive ? "bg-purple-500/20 text-purple-500 border-purple-500/30 font-bold" :
                    isPast ? "bg-green-500/20 text-green-500 border-green-500/30" :
                    "bg-muted text-muted-foreground border-border"
                  }`}>
                    {isPast ? <CheckCircle2 size={14} /> : idx + 1}
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${isActive ? "text-purple-400" : isPast ? "text-foreground" : "text-muted-foreground"}`}>
                      {stage === "Representment" ? <TermTooltip term="Representment" definition="Fase de Defesa (Re-apresentação) onde o Adquirente contesta o chargeback anexando evidências." /> : 
                       stage === "Pre-Arbitration" ? <TermTooltip term="Pre-Arbitration" definition="Pré-Arbitragem (Caso Especial). Adquirente rejeita o segundo chargeback do Emissor." /> :
                       stage === "Arbitration" ? <TermTooltip term="Arbitration" definition="Arbitragem Final. A Bandeira age como juíza e aplica multas ao perdedor." /> :
                       stage
                      }
                    </p>
                  </div>
                </div>
                {isActive && <ChevronRight size={18} className="text-purple-500" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Direita: Payload / Compelling Dev ── */}
      <div>
        <div className="sticky top-8 space-y-6">

           {/* Painel de Viabilidade (Se estivermos no stage 3 ou 4) */}
           { (currentStage === "Pre-Arbitration" || currentStage === "Arbitration") && (
             <div className={`p-4 rounded-xl border animate-in fade-in slide-in-from-bottom-4 duration-300 ${
                getFinancialAdvice().recommend 
                ? "bg-blue-500/10 border-blue-500/30 text-blue-500" 
                : "bg-red-500/10 border-red-500/30 text-red-500"
             }`}>
               <h4 className="text-sm font-bold flex items-center gap-2 mb-2">
                 <Calculator size={16}/> ROI Checker: Viabilidade de Arbitragem
               </h4>
               <p className="text-xs leading-relaxed opacity-90">{getFinancialAdvice().message}</p>
             </div>
           )}

           {/* JSON Payload Viewer */}
          <div className={`transition-opacity duration-300 ${loading ? "opacity-50" : "opacity-100"}`}>
            <p className="section-eyebrow mb-2 flex items-center gap-2">
              <Server size={14} /> Integração DMAS API (Request)
            </p>
            <div className="rounded-xl border border-border bg-[#0a1120] overflow-hidden shadow-xl">
              <div className="px-4 py-3 bg-[#101a2d] border-b border-[#1e293b] flex items-center justify-between">
                <span className="text-xs font-mono text-muted-foreground">
                  {currentStage.toLowerCase().replace(" ", "-")}.json
                </span>
              </div>
              <div className="p-4 bg-[#0a1120]">
                {loading ? (
                   <div className="flex items-center justify-center h-[120px]">
                     <ArrowRight size={24} className="animate-spin text-purple-500/50" />
                   </div>
                ) : (
                  <pre className="text-xs font-mono text-emerald-300 overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(getPayload(currentStage), null, 2)}
                  </pre>
                )}
              </div>
            </div>
          </div>

          {/* Compelling Evidence Card */}
          { (currentStage === "Representment" || currentStage === "Pre-Arbitration") && (
               <div className="flex items-center justify-between mb-2 mt-6">
                 <p className="section-eyebrow flex items-center gap-2 m-0">
                   <UploadCloud size={14} /> Required Compelling Evidence
                 </p>
                 {(selectedCode as any).manualBase && (
                    <RuleReference 
                       ruleId={(selectedCode as any).manualReference} 
                       manual={(selectedCode as any).manualBase}
                       description="Fundamentação teórica oficial extraída dos guias para reverter chargebacks."
                    />
                 )}
               </div>
               <div className="border border-border bg-input rounded-xl overflow-hidden p-0">
                  <div className="border-b border-border bg-muted/50 p-3 italic text-xs text-muted-foreground">
                     "Para vencer a disputa <strong>{selectedCode.code}</strong> na fase representativa, a <TermTooltip term="Mastercom" definition="Plataforma principal de gestão e clearing de disputas da Mastercard" /> exige documentalmente:"
                  </div>
                  <div className="p-4 space-y-3">
                     {selectedCode.compelling_evidence?.map((ce, index) => (
                        <div key={index} className="flex items-start gap-3 bg-background border border-border p-3 rounded-lg">
                           <FileText size={18} className="shrink-0 text-blue-500 mt-0.5" />
                           <div>
                             <h4 className="text-sm font-bold text-foreground">{ce.name}</h4>
                             <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                                {ce.desc}
                             </p>
                             <span className="inline-block mt-2 font-mono text-[9px] px-1.5 py-0.5 border border-border bg-input rounded text-foreground uppercase">Formato aceito: {ce.type}</span>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
