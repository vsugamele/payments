"use client";

import { useState } from "react";
import disputeCodesData from "../../../data/dispute-codes.json";
import { Scale, ArrowRight, UploadCloud, Server, ShieldCheck, AlertCircle, CheckCircle2, ChevronRight, FileText, BadgeDollarSign, Calculator, BookOpen, Info } from "lucide-react";
import TermTooltip from "@/components/TermTooltip";
import RuleReference from "@/components/RuleReference";
import DisputeDecisionTree from "@/components/DisputeDecisionTree";

type Stage = "First Chargeback" | "Representment" | "Pre-Arbitration" | "Arbitration";
type VisaStage = "First Chargeback (VCR)" | "Dispute Response" | "Arbitration (VisaNet)";
type Scheme = "mastercard" | "visa";

const STAGES: Stage[] = ["First Chargeback", "Representment", "Pre-Arbitration", "Arbitration"];
const VISA_STAGES: VisaStage[] = ["First Chargeback (VCR)", "Dispute Response", "Arbitration (VisaNet)"];

const VISA_STAGE_META: Record<VisaStage, { color: string; desc: string; prazo: string }> = {
  "First Chargeback (VCR)": { color: "#3b82f6", prazo: "D+30", desc: "Visa Claim Resolution. Para Allocation (fraude sem 3DS), adquirente já é responsável. Para Collaboration, há chance de defesa." },
  "Dispute Response":       { color: "#06b6d4", prazo: "D+30", desc: "Envio de Compelling Evidence 3.0 via VROL. CE 3.0 exige Device ID + IP + endereço iguais em 2+ transações não disputadas anteriores." },
  "Arbitration (VisaNet)":  { color: "#8b5cf6", prazo: "D+30", desc: "Filing fee único de USD 500. A Visa emite veredito final. Só escále se o valor superar USD 500 e houver confiança total nas evidências." },
};

export default function DisputeClient() {
  const [selectedCode, setSelectedCode] = useState(disputeCodesData[0]);
  const [currentStage, setCurrentStage] = useState<Stage>("First Chargeback");
  const [currentVisaStage, setCurrentVisaStage] = useState<VisaStage>("First Chargeback (VCR)");
  const [scheme, setScheme] = useState<Scheme>("mastercard");
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

  const handleVisaStageChange = (stage: VisaStage) => {
    setLoading(true);
    setTimeout(() => { setCurrentVisaStage(stage); setLoading(false); }, 600);
  };

  const getVisaPayload = (stage: VisaStage) => {
    switch (stage) {
      case "First Chargeback (VCR)":
        return { "Endpoint": "POST /vrol/v2/cases", "Body": { "caseId": disputeId, "currency": "BRL", "reasonCode": selectedCode.visa_equivalent ?? "13.1", "amount": disputeAmount.toFixed(2), "transactionId": transactionId, "category": selectedCode.visa_stage ?? "Collaboration" } };
      case "Dispute Response":
        return { "Endpoint": `PUT /vrol/v2/cases/${disputeId}/respond`, "Body": { "responseType": "COMPELLING_EVIDENCE_3", "deviceId": "DEV-a3f8b2", "ipAddress": "189.28.xx.xx", "priorTransactions": [{ "txnId": `TXN-PREV-${Math.random().toString(36).substring(2,8).toUpperCase()}`, "date": "2024-10-12", "sameDevice": true }, { "txnId": `TXN-PREV-${Math.random().toString(36).substring(2,8).toUpperCase()}`, "date": "2024-11-01", "sameDevice": true }] } };
      case "Arbitration (VisaNet)":
        return { "Endpoint": `POST /vrol/v2/cases/${disputeId}/arbitration`, "Body": { "filingFeeAccepted": true, "filingFeeAmount": 500, "currency": "USD", "evidenceSummary": "CE 3.0 compliant, device match confirmed", "amount": disputeAmount.toFixed(2) } };
    }
  };

  // Funções geradoras de payloads fake (Mastercard):
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
    const filingFee = scheme === "visa" ? 500 : (selectedCode.arbitration_risk || 400);
    if (disputeAmount < filingFee) {
      return {
        recommend: false,
        message: `Atenção: O chargeback é de R$ ${disputeAmount.toFixed(2)}, mas o Filing Fee de ${scheme === "visa" ? "Visa (VROL)" : "Mastercard"} é USD ${filingFee}. Não é matematicamente viável escalar — absorva o chargeback.`
      };
    }
    return {
      recommend: true,
      message: `Alto valor (R$ ${disputeAmount.toFixed(2)}) justifica arbitragem. ${scheme === "visa" ? "CE 3.0 com Device ID + IP coerentes em 2+ transações anteriores é sua melhor defesa via VROL." : "Monte o dossiê completo via Mastercom antes do vencimento do prazo."}`
    };
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* ── Esquerda: Controles ── */}
      <div className="space-y-6">
        
        {/* Painel Configurator */}
        <div style={{ background: "var(--code-bg)", border: "1px solid var(--border)", borderRadius: "1rem", overflow: "hidden" }}>
          <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold flex items-center gap-2 text-foreground">
                <Scale size={16} className="text-purple-500" />
                Configuração da Disputa
              </h2>
              {/* Scheme toggle */}
              <div className="flex gap-1 p-0.5 bg-black/30 rounded-lg border border-border">
                {(["mastercard", "visa"] as Scheme[]).map(s => (
                  <button key={s} onClick={() => setScheme(s)}
                    className="px-2.5 py-1 rounded-md text-[10px] font-bold transition-all"
                    style={{
                      background: scheme === s ? (s === "mastercard" ? "rgba(249,115,22,0.2)" : "rgba(59,130,246,0.2)") : "transparent",
                      color: scheme === s ? (s === "mastercard" ? "#fb923c" : "#60a5fa") : "#64748b",
                    }}>
                    {s === "mastercard" ? "🔴 MC" : "🔵 Visa"}
                  </button>
                ))}
              </div>
            </div>
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
          <p className="section-eyebrow mb-1">
            Ações da Lifecycle — {scheme === "mastercard" ? "Mastercard (DMAS)" : "Visa (VROL/VCR)"}
          </p>

          {scheme === "mastercard" ? (
            STAGES.map((stage, idx) => {
              const isActive = stage === currentStage;
              const isPast = STAGES.indexOf(currentStage) > idx;
              return (
                <button key={stage} onClick={() => handleStageChange(stage)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between ${
                    isActive ? "border-purple-500 bg-purple-500/10 ring-1 ring-purple-500/50"
                    : isPast ? "border-border bg-input opacity-70 hover:opacity-100"
                    : "border-border bg-input/50 text-muted-foreground grayscale opacity-50 hover:grayscale-0 hover:opacity-100"
                  }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                      isActive ? "bg-purple-500/20 text-purple-500 border-purple-500/30 font-bold"
                      : isPast ? "bg-green-500/20 text-green-500 border-green-500/30"
                      : "bg-muted text-muted-foreground border-border"
                    }`}>
                      {isPast ? <CheckCircle2 size={14} /> : idx + 1}
                    </div>
                    <p className={`text-sm font-bold ${isActive ? "text-purple-400" : isPast ? "text-foreground" : "text-muted-foreground"}`}>
                      {stage === "Representment" ? <TermTooltip term="Representment" definition="Fase de Defesa onde o Adquirente contesta o chargeback com evidências." />
                      : stage === "Pre-Arbitration" ? <TermTooltip term="Pre-Arbitration" definition="Pré-Arbitragem. Última chance antes da bandeira decidir." />
                      : stage === "Arbitration" ? <TermTooltip term="Arbitration" definition="Arbitragem Final. A Mastercard age como juíza. Multas ao perdedor." />
                      : stage}
                    </p>
                  </div>
                  {isActive && <ChevronRight size={18} className="text-purple-500" />}
                </button>
              );
            })
          ) : (
            VISA_STAGES.map((stage, idx) => {
              const isActive = stage === currentVisaStage;
              const isPast = VISA_STAGES.indexOf(currentVisaStage) > idx;
              const meta = VISA_STAGE_META[stage];
              return (
                <button key={stage} onClick={() => handleVisaStageChange(stage)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between ${
                    isActive ? "ring-1" : isPast ? "opacity-70 hover:opacity-100" : "opacity-50 hover:opacity-100"
                  }`}
                  style={{
                    borderColor: isActive ? meta.color : "var(--border)",
                    background: isActive ? `${meta.color}10` : "var(--code-bg)",
                    boxShadow: isActive ? `0 0 0 1px ${meta.color}50` : "none",
                  }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border"
                      style={{
                        background: isPast ? "rgba(74,222,128,0.15)" : `${meta.color}15`,
                        borderColor: isPast ? "rgba(74,222,128,0.3)" : `${meta.color}30`,
                        color: isPast ? "#4ade80" : meta.color,
                      }}>
                      {isPast ? <CheckCircle2 size={14} /> : idx + 1}
                    </div>
                    <div>
                      <p className="text-sm font-bold" style={{ color: isActive ? meta.color : isPast ? "var(--foreground)" : "var(--muted-foreground)" }}>
                        {stage}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{meta.prazo}</p>
                    </div>
                  </div>
                  {isActive && <ChevronRight size={18} style={{ color: meta.color }} />}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── Direita: Payload / Compelling Dev ── */}
      <div>
        <div className="sticky top-8 space-y-6">

           {/* Painel de Viabilidade (Se estivermos no stage 3 ou 4) */}
           { ((scheme === "mastercard" && (currentStage === "Pre-Arbitration" || currentStage === "Arbitration")) ||
              (scheme === "visa" && currentVisaStage === "Arbitration (VisaNet)")) && (
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
              <Server size={14} /> {scheme === "mastercard" ? "Integração DMAS API (Mastercom)" : "Integração VROL API (Visa)"}
            </p>
            <div className="rounded-xl border border-border bg-[#0a1120] overflow-hidden shadow-xl">
              <div className="px-4 py-3 bg-[#101a2d] border-b border-[#1e293b] flex items-center justify-between">
                <span className="text-xs font-mono text-muted-foreground">
                  {scheme === "mastercard"
                    ? currentStage.toLowerCase().replace(/ /g, "-") + ".json"
                    : currentVisaStage.toLowerCase().replace(/ /g, "-").replace(/[()]/g, "") + ".json"}
                </span>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded border"
                  style={{ color: scheme === "mastercard" ? "#fb923c" : "#60a5fa", borderColor: scheme === "mastercard" ? "#f9741620" : "#3b82f620", background: scheme === "mastercard" ? "#f9741608" : "#3b82f608" }}>
                  {scheme === "mastercard" ? "Mastercom v6" : "VROL v2"}
                </span>
              </div>
              <div className="p-4 bg-[#0a1120]">
                {loading ? (
                   <div className="flex items-center justify-center h-[120px]">
                     <ArrowRight size={24} className="animate-spin text-purple-500/50" />
                   </div>
                ) : (
                  <pre className="text-xs font-mono text-emerald-300 overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(
                      scheme === "mastercard" ? getPayload(currentStage) : getVisaPayload(currentVisaStage),
                      null, 2
                    )}
                  </pre>
                )}
              </div>
            </div>
          </div>

          {/* Compelling Evidence Card */}
          {/* Visa CE 3.0 info panel */}
          {scheme === "visa" && currentVisaStage === "Dispute Response" && (
            <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4 space-y-3">
              <p className="text-xs font-bold text-cyan-400 flex items-center gap-2 uppercase tracking-wider">
                <ShieldCheck size={14} /> Compelling Evidence 3.0 (CE 3.0)
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Para reverter disputas de <strong className="text-white">fraude (Allocation)</strong> via VROL, a Visa exige CE 3.0:
              </p>
              {[
                { name: "Transações anteriores não disputadas", desc: "Mínimo 2 transações do mesmo device/IP antes da disputa, no intervalo de 120–365 dias.", type: "JSON / Log" },
                { name: "Device ID idêntico", desc: "O mesmo Device Fingerprint ou Device ID precisa constar nas transações de referência.", type: "String" },
                { name: "Endereço IP coerente", desc: "IP de origem igual ou na mesma sub-rede das transações anteriores.", type: "IPv4/IPv6" },
              ].map((ce, i) => (
                <div key={i} className="flex items-start gap-3 bg-background border border-border p-3 rounded-lg">
                  <FileText size={16} className="shrink-0 text-cyan-400 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-foreground">{ce.name}</h4>
                    <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{ce.desc}</p>
                    <span className="inline-block mt-2 font-mono text-[9px] px-1.5 py-0.5 border border-border bg-input rounded text-foreground uppercase">Formato: {ce.type}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          { scheme === "mastercard" && (currentStage === "Representment" || currentStage === "Pre-Arbitration") && (
               <>
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
                     Para vencer a disputa <strong>{selectedCode.code}</strong> na fase representativa, a <TermTooltip term="Mastercom" definition="Plataforma principal de gestão e clearing de disputas da Mastercard" /> exige documentalmente:
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
               </>
          )}

        </div>
      </div>

      {/* ── Alertas Normativos Críticos ── */}
      <div className="col-span-1 lg:col-span-2 mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-border pt-12">
        <div className="p-8 rounded-[2.5rem] bg-amber-500/5 border border-amber-500/10 space-y-6">
          <div className="flex items-center gap-3 text-amber-500">
            <AlertCircle size={24} />
            <h3 className="text-lg font-black uppercase tracking-widest">Timeframes & Late Presentment</h3>
          </div>
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-background border border-border">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-white uppercase tracking-widest">Padrão Geral</span>
                <span className="px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-400 font-mono text-[10px] font-bold">7 Dias</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                O prazo padrão para envio do clearing (presentment) é de 7 dias. Ultrapassar este prazo gera o risco de chargeback por <strong>Late Presentment</strong>.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-red-400 uppercase tracking-widest text-nowrap">MoneySend / Gaming</span>
                <span className="px-2 py-0.5 rounded-lg bg-red-500/20 text-red-400 font-mono text-[10px] font-bold">1 Dia Corrido</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                <strong>ATENÇÃO:</strong> Para transações de MoneySend ou Gaming, o envio deve ser feito em até 1 dia corrido. A falha gera perda imediata de disputa.
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 rounded-[2.5rem] bg-blue-500/5 border border-blue-500/10 space-y-6">
          <div className="flex items-center gap-3 text-blue-400">
            <ShieldCheck size={24} />
            <h3 className="text-lg font-black uppercase tracking-widest">Nova Regra: Refund Auth</h3>
          </div>
          <div className="space-y-4">
            <div className="p-6 rounded-2xl bg-background border border-border relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <BadgeDollarSign size={80} className="text-blue-500" />
              </div>
              <p className="text-sm font-bold text-white mb-2">Autorização Online para Reembolsos</p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                O mercado brasileiro agora exige autorização online prévia para <strong>Refunds (Proc Code 20)</strong>. Isso garante que o cartão de destino não foi cancelado ou bloqueado, evitando erros de clearing e disputas por crédito não processado.
              </p>
              <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-blue-400 uppercase">
                <Info size={14} /> Mandatório para todos os adquirentes
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
