"use client";

import { useState } from "react";
import matchCodesData from "../../../data/match-codes.json";
import { 
  AlertOctagon, 
  CheckCircle2, 
  ChevronRight, 
  Server, 
  Search, 
  ShieldAlert, 
  UserPlus, 
  Edit3, 
  Trash2, 
  Bell, 
  BarChart3, 
  Info,
  Globe,
  User,
  Shield
} from "lucide-react";

export default function MatchClient() {
  const [activeTab, setActiveTab] = useState<"inquiry" | "add" | "manage" | "retroactive" | "dashboard">("inquiry");
  
  // Lista de merchants simulados em cache (adicionados dinamicamente para fins de teste)
  const [merchantsList, setMerchantsList] = useState<any[]>([
    {
      name: "Loja de Eletronicos X",
      dba: "EletroX",
      cnpj: "12345678000104", // Final 04 (Chargebacks)
      url: "www.eletrox.com.br",
      owner: "Carlos Silva",
      ownerCpf: "11122233344",
      reasonCode: "04",
      addedDate: "2026-02-10",
      acquirerId: "ACQ_99827",
      refId: "M-98273612"
    },
    {
      name: "Servicos Digitais Beta",
      dba: "BetaPay",
      cnpj: "98765432000108", // Final 08 (Lavagem de Dinheiro)
      url: "www.betapay.net",
      owner: "Ana Souza",
      ownerCpf: "55566677788",
      reasonCode: "08",
      addedDate: "2026-04-15",
      acquirerId: "ACQ_88412",
      refId: "M-88412093"
    }
  ]);

  // Logs de notificações retroativas (retroactive inquiries)
  const [retroactiveLogs, setRetroactiveLogs] = useState<any[]>([
    {
      timestamp: "2026-05-18T14:32:00Z",
      merchantCnpj: "12345678000104",
      merchantName: "Loja de Eletronicos X",
      reasonCode: "04",
      listedByAcquirer: "ACQ_99827",
      alertType: "Retroactive Match Hit",
      desc: "Lojista consultado pela sua credenciadora em 01/02/2026 foi inserido no MATCH por outra adquirente hoje."
    }
  ]);

  // Form Fields - Inquiry
  const [inquiryCnpj, setInquiryCnpj] = useState("");
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryOwner, setInquiryOwner] = useState("");
  const [inquiryUrl, setInquiryUrl] = useState("");
  const [inquiryLoading, setInquiryLoading] = useState(false);
  const [inquiryResult, setInquiryResult] = useState<any>(null);

  // Form Fields - Add
  const [addCnpj, setAddCnpj] = useState("");
  const [addName, setAddName] = useState("");
  const [addDba, setAddDba] = useState("");
  const [addUrl, setAddUrl] = useState("");
  const [addOwner, setAddOwner] = useState("");
  const [addOwnerCpf, setAddOwnerCpf] = useState("");
  const [addReason, setAddReason] = useState("01"); // Default: Fraud
  const [addSuccessMsg, setAddSuccessMsg] = useState("");

  // Fields - Delete/Modify Action
  const [selectedMerchantIndex, setSelectedMerchantIndex] = useState<number | null>(null);
  const [deleteReasonText, setDeleteReasonText] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modifyReasonCode, setModifyReasonCode] = useState("");
  const [showModifyModal, setShowModifyModal] = useState(false);

  // Executa o Screening/Inquiry
  const runInquiry = () => {
    setInquiryLoading(true);
    setInquiryResult(null);

    setTimeout(() => {
      // 1. Limpa entradas
      const cleanCnpj = inquiryCnpj.replace(/\D/g, "");
      
      // 2. Busca no cache local de merchants simulados
      let matchFound = merchantsList.find(m => m.cnpj.replace(/\D/g, "") === cleanCnpj);

      // 3. Fallback: lógica legada baseada no final do CNPJ
      if (!matchFound && cleanCnpj.length >= 2) {
        const lastDigits = cleanCnpj.slice(-2);
        const codeFound = matchCodesData.find((c) => c.code === lastDigits);
        if (codeFound && lastDigits !== "00") {
          matchFound = {
            name: inquiryName || "Merchant Teste Auto-Hit",
            dba: "DBA Auto-Hit",
            cnpj: inquiryCnpj,
            url: inquiryUrl || "www.testehit.com",
            owner: inquiryOwner || "Socio Auto-Hit",
            reasonCode: lastDigits,
            refId: `AUTO-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
            addedDate: new Date().toISOString().split("T")[0]
          };
        }
      }

      if (matchFound) {
        const reasonDetail = matchCodesData.find(c => c.code === matchFound.reasonCode) || {
          code: matchFound.reasonCode,
          name: "Outros motivos",
          description: "Especificação interna do regulamento de riscos.",
          action: "Submeter a análise forense manual antes de onboardar."
        };

        setInquiryResult({
          matchFound: true,
          merchant: matchFound,
          reason: reasonDetail,
          apiResponse: {
            "MatchSystem": "MATCH_PRO_V2",
            "InquiryReference": `REQ-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
            "Timestamp": new Date().toISOString(),
            "Result": "EXACT_MATCH",
            "MatchedEntities": [
              {
                "EntityIdentifier": matchFound.cnpj,
                "EntityType": "MERCHANT",
                "ReasonCode": matchFound.reasonCode,
                "ReasonDescription": reasonDetail.name,
                "OwnerNameMatched": inquiryOwner ? (inquiryOwner.toLowerCase() === matchFound.owner?.toLowerCase() ? "YES" : "NO") : "NOT_SUBMITTED",
                "UrlMatched": inquiryUrl ? (inquiryUrl.toLowerCase() === matchFound.url?.toLowerCase() ? "YES" : "NO") : "NOT_SUBMITTED",
                "AddedByAcquirerId": matchFound.acquirerId || "ACQ_99827",
                "AddedDate": matchFound.addedDate
              }
            ]
          }
        });
      } else {
        setInquiryResult({
          matchFound: false,
          apiResponse: {
            "MatchSystem": "MATCH_PRO_V2",
            "InquiryReference": `REQ-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
            "Timestamp": new Date().toISOString(),
            "Result": "NO_MATCH",
            "MatchedEntities": []
          }
        });
      }
      setInquiryLoading(false);
    }, 1100);
  };

  // Cadastra um novo comerciante restrito (Add Merchant)
  const addMerchant = () => {
    if (!addCnpj || !addName) return;

    const refId = `M-${Math.floor(10000000 + Math.random() * 90000000)}`;
    const newMerchant = {
      name: addName,
      dba: addDba || addName,
      cnpj: addCnpj,
      url: addUrl,
      owner: addOwner,
      ownerCpf: addOwnerCpf,
      reasonCode: addReason,
      addedDate: new Date().toISOString().split("T")[0],
      acquirerId: "ACQ_99827",
      refId: refId
    };

    setMerchantsList(prev => [newMerchant, ...prev]);
    
    // Simula uma notificação retroativa para qualquer adquirente fictício que tenha consultado este CNPJ anteriormente
    setRetroactiveLogs(prev => [
      {
        timestamp: new Date().toISOString(),
        merchantCnpj: addCnpj,
        merchantName: addName,
        reasonCode: addReason,
        listedByAcquirer: "ACQ_99827",
        alertType: "Retroactive Match Hit (Live)",
        desc: `Alerta disparado pelo sistema MATCH Pro: O lojista '${addName}' que foi consultado nos últimos 120 dias acaba de ser incluído na base restritiva.`
      },
      ...prev
    ]);

    setAddSuccessMsg(`Lojista cadastrado no MATCH com sucesso! Referência gerada: ${refId}`);
    
    // Reseta campos
    setAddCnpj("");
    setAddName("");
    setAddDba("");
    setAddUrl("");
    setAddOwner("");
    setAddOwnerCpf("");
    
    setTimeout(() => setAddSuccessMsg(""), 5000);
  };

  // Exclui Lojista (Delete Merchant)
  const deleteMerchant = () => {
    if (selectedMerchantIndex === null || !deleteReasonText) return;

    const targetMerchant = merchantsList[selectedMerchantIndex];
    setMerchantsList(prev => prev.filter((_, idx) => idx !== selectedMerchantIndex));

    // Adiciona log de remoção nas notificações como histórico regulatório
    setRetroactiveLogs(prev => [
      {
        timestamp: new Date().toISOString(),
        merchantCnpj: targetMerchant.cnpj,
        merchantName: targetMerchant.name,
        reasonCode: targetMerchant.reasonCode,
        listedByAcquirer: "ACQ_99827",
        alertType: "Merchant Removal Log",
        desc: `Exclusão solicitada com sucesso. Justificativa: ${deleteReasonText}`
      },
      ...prev
    ]);

    setShowDeleteModal(false);
    setSelectedMerchantIndex(null);
    setDeleteReasonText("");
  };

  // Edita Lojista (Modify Merchant)
  const modifyMerchant = () => {
    if (selectedMerchantIndex === null || !modifyReasonCode) return;

    setMerchantsList(prev => prev.map((m, idx) => {
      if (idx === selectedMerchantIndex) {
        return { ...m, reasonCode: modifyReasonCode };
      }
      return m;
    }));

    setShowModifyModal(false);
    setSelectedMerchantIndex(null);
  };

  return (
    <div className="mx-auto max-w-6xl px-6 pt-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* ── Menu Lateral de Ações (Abas) ── */}
      <div className="lg:col-span-3 space-y-2">
         <button
           onClick={() => setActiveTab("inquiry")}
           className={`w-full text-left p-3.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 ${
             activeTab === "inquiry" 
               ? "bg-blue-600/20 border-blue-500 text-blue-400" 
               : "bg-slate-900/50 border-slate-800 text-slate-400 hover:bg-slate-900"
           }`}
         >
           <Search size={14} /> Inquiry (Screening)
         </button>
         <button
           onClick={() => setActiveTab("add")}
           className={`w-full text-left p-3.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 ${
             activeTab === "add" 
               ? "bg-blue-600/20 border-blue-500 text-blue-400" 
               : "bg-slate-900/50 border-slate-800 text-slate-400 hover:bg-slate-900"
           }`}
         >
           <UserPlus size={14} /> Add Restrict Merchant
         </button>
         <button
           onClick={() => setActiveTab("manage")}
           className={`w-full text-left p-3.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 ${
             activeTab === "manage" 
               ? "bg-blue-600/20 border-blue-500 text-blue-400" 
               : "bg-slate-900/50 border-slate-800 text-slate-400 hover:bg-slate-900"
           }`}
         >
           <Edit3 size={14} /> Modify / Delete Merchant
         </button>
         <button
           onClick={() => setActiveTab("retroactive")}
           className={`w-full text-left p-3.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 relative ${
             activeTab === "retroactive" 
               ? "bg-blue-600/20 border-blue-500 text-blue-400" 
               : "bg-slate-900/50 border-slate-800 text-slate-400 hover:bg-slate-900"
           }`}
         >
           <Bell size={14} /> Retroactive Alerts
           <span className="absolute right-3 bg-red-600 text-white font-mono text-[8px] font-bold px-1.5 py-0.5 rounded-full">
             {retroactiveLogs.filter(l => l.alertType.includes("Hit")).length}
           </span>
         </button>
         <button
           onClick={() => setActiveTab("dashboard")}
           className={`w-full text-left p-3.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 ${
             activeTab === "dashboard" 
               ? "bg-blue-600/20 border-blue-500 text-blue-400" 
               : "bg-slate-900/50 border-slate-800 text-slate-400 hover:bg-slate-900"
           }`}
         >
           <BarChart3 size={14} /> ICA Performance Dashboard
         </button>
      </div>

      {/* ── Bloco Principal da Aba Ativa ── */}
      <div className="lg:col-span-9 space-y-6">
         
         {/* 1. ABA INQUIRY */}
         {activeTab === "inquiry" && (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 space-y-5">
                 <div className="pb-3 border-b border-slate-800 flex items-center gap-2">
                    <Search className="text-blue-500" size={16} />
                    <h3 className="text-white font-bold text-sm">MATCH Pro Screening Onboarding</h3>
                 </div>

                 <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">CNPJ / ID Comercial</label>
                      <input
                        type="text"
                        placeholder="Ex: 12.345.678/0001-04"
                        value={inquiryCnpj}
                        onChange={(e) => setInquiryCnpj(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-300 focus:outline-none focus:border-blue-500"
                      />
                      <p className="text-[9px] text-slate-500 leading-normal">
                        *Dica: use um CNPJ cadastrado ou final correspondente aos códigos do dicionário.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Razão Social (Opcional)</label>
                      <input
                        type="text"
                        placeholder="Ex: Lojista S.A."
                        value={inquiryName}
                        onChange={(e) => setInquiryName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-300 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nome do Sócio Principal (Opcional)</label>
                      <input
                        type="text"
                        placeholder="Ex: Carlos Silva"
                        value={inquiryOwner}
                        onChange={(e) => setInquiryOwner(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-300 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Website URL (Opcional)</label>
                      <input
                        type="text"
                        placeholder="Ex: www.eletrox.com.br"
                        value={inquiryUrl}
                        onChange={(e) => setInquiryUrl(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-300 focus:outline-none"
                      />
                    </div>

                    <button
                      onClick={runInquiry}
                      disabled={inquiryLoading || !inquiryCnpj}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-xl transition-all disabled:opacity-40"
                    >
                      {inquiryLoading ? "Processando API..." : "Submeter Screening Online"}
                    </button>
                 </div>
              </div>

              {/* Resultado do Screening */}
              <div className="space-y-6">
                 {!inquiryResult && !inquiryLoading && (
                   <div className="h-full min-h-[300px] border border-dashed border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-center text-center">
                     <Search size={32} className="text-slate-600 mb-3" />
                     <h4 className="text-xs font-bold text-slate-400">Aguardando consulta</h4>
                     <p className="text-[10px] text-slate-500 mt-1 max-w-[200px]">Utilize o formulário ao lado para verificar a reputação do lojista no MATCH.</p>
                   </div>
                 )}

                 {inquiryLoading && (
                   <div className="h-full min-h-[300px] bg-slate-900/30 border border-slate-850 rounded-3xl p-6 flex flex-col items-center justify-center text-center animate-pulse">
                     <Server size={32} className="text-blue-500 animate-bounce mb-3" />
                     <p className="text-xs text-white font-bold">Consultando Mastercard MATCH Pro API...</p>
                   </div>
                 )}

                 {inquiryResult && !inquiryLoading && (
                   <div className="space-y-4">
                      {inquiryResult.matchFound ? (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-5 space-y-4">
                           <div className="flex items-start gap-3">
                              <ShieldAlert size={20} className="text-red-500 shrink-0 mt-0.5" />
                              <div>
                                 <h4 className="text-sm font-black text-red-500">Inquiry Result: EXACT MATCH</h4>
                                 <p className="text-xs text-white font-medium mt-1">
                                   O lojista constava na base de restrições globais.
                                 </p>
                              </div>
                           </div>

                           <div className="bg-slate-950 p-4 rounded-xl border border-red-500/10 text-xs space-y-2">
                              <div className="flex items-center justify-between">
                                 <span className="text-slate-500 text-[10px] uppercase font-bold">CNPJ Relacionado</span>
                                 <span className="text-white font-mono font-bold">{inquiryResult.merchant.cnpj}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                 <span className="text-slate-500 text-[10px] uppercase font-bold">Código MATCH</span>
                                 <span className="bg-red-500/20 text-red-400 font-bold px-2 py-0.5 rounded text-[10px]">{inquiryResult.reason.code}</span>
                              </div>
                              <p className="text-slate-400 font-bold text-xs mt-2">{inquiryResult.reason.name}</p>
                              <p className="text-slate-500 text-[10px] leading-relaxed italic">{inquiryResult.reason.description}</p>
                              
                              <div className="mt-3 p-3 bg-red-500/5 border border-red-500/10 text-red-400 text-[10px] font-bold rounded-lg leading-normal">
                                Recomendações: {inquiryResult.reason.action}
                              </div>
                           </div>
                        </div>
                      ) : (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-5 flex gap-3">
                           <CheckCircle2 size={20} className="text-emerald-500 shrink-0 mt-0.5" />
                           <div>
                              <h4 className="text-sm font-black text-emerald-500">Inquiry Result: NO MATCH</h4>
                              <p className="text-xs text-slate-400 leading-relaxed mt-1">
                                Nenhum registro restritivo foi encontrado para este CNPJ no sistema MATCH Pro. Credenciamento autorizado para prosseguir.
                              </p>
                           </div>
                        </div>
                      )}

                      {/* Payload da API */}
                      <div className="bg-slate-950 border border-slate-900 rounded-2xl overflow-hidden">
                        <div className="px-4 py-2 bg-slate-900 border-b border-slate-850 flex items-center justify-between text-[10px]">
                           <span className="font-mono text-slate-500 uppercase tracking-widest font-bold">API Raw Response</span>
                           <span className="text-emerald-400 font-bold">200 OK</span>
                        </div>
                        <pre className="p-4 text-[10px] font-mono text-blue-300 overflow-x-auto max-h-56 custom-scrollbar">
                           {JSON.stringify(inquiryResult.apiResponse, null, 2)}
                        </pre>
                      </div>
                   </div>
                 )}
              </div>
           </div>
         )}

         {/* 2. ABA ADD MERCHANT */}
         {activeTab === "add" && (
           <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 space-y-6">
              <div className="pb-3 border-b border-slate-800 flex items-center gap-2">
                 <UserPlus className="text-blue-500" size={16} />
                 <h3 className="text-white font-bold text-sm">Add Merchant to MATCH Restrict List</h3>
              </div>

              {addSuccessMsg && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 font-bold">
                   {addSuccessMsg}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 
                 <div className="space-y-4">
                    <div className="space-y-1">
                       <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Razão Social</label>
                       <input 
                         type="text" 
                         value={addName}
                         onChange={(e) => setAddName(e.target.value)}
                         placeholder="Ex: Comercial Falsa S.A."
                         className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none"
                       />
                    </div>

                    <div className="space-y-1">
                       <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nome Fantasia (DBA)</label>
                       <input 
                         type="text" 
                         value={addDba}
                         onChange={(e) => setAddDba(e.target.value)}
                         placeholder="Ex: Fantasia Beta"
                         className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none"
                       />
                    </div>

                    <div className="space-y-1">
                       <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">CNPJ</label>
                       <input 
                         type="text" 
                         value={addCnpj}
                         onChange={(e) => setAddCnpj(e.target.value)}
                         placeholder="Ex: 12345678000104"
                         className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none font-mono"
                       />
                    </div>

                    <div className="space-y-1">
                       <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Website URL</label>
                       <input 
                         type="text" 
                         value={addUrl}
                         onChange={(e) => setAddUrl(e.target.value)}
                         placeholder="Ex: www.fraudecomercial.com"
                         className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none"
                       />
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div className="space-y-1">
                       <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nome do Sócio</label>
                       <input 
                         type="text" 
                         value={addOwner}
                         onChange={(e) => setAddOwner(e.target.value)}
                         placeholder="Ex: Proprietário Cúmplice"
                         className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none"
                       />
                    </div>

                    <div className="space-y-1">
                       <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">CPF do Sócio</label>
                       <input 
                         type="text" 
                         value={addOwnerCpf}
                         onChange={(e) => setAddOwnerCpf(e.target.value)}
                         placeholder="Ex: 99988877766"
                         className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none font-mono"
                       />
                    </div>

                    <div className="space-y-1">
                       <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Motivo Regulatório de Listagem</label>
                       <select
                         value={addReason}
                         onChange={(e) => setAddReason(e.target.value)}
                         className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-305 focus:outline-none"
                       >
                         {matchCodesData.map(c => (
                           <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
                         ))}
                       </select>
                    </div>

                    <div className="pt-2">
                       <button
                         onClick={addMerchant}
                         className="w-full py-3 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition-all"
                       >
                         Registrar na Lista Restritiva
                       </button>
                    </div>
                 </div>

              </div>
           </div>
         )}

         {/* 3. ABA MANAGE (MODIFY / DELETE) */}
         {activeTab === "manage" && (
           <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 space-y-6">
              <div className="pb-3 border-b border-slate-800 flex items-center gap-2">
                 <Edit3 className="text-blue-500" size={16} />
                 <h3 className="text-white font-bold text-sm">Gerenciamento de Registros Activos (Sua Credenciadora)</h3>
              </div>

              <div className="space-y-3">
                 {merchantsList.length === 0 ? (
                   <p className="text-xs text-slate-500 italic text-center py-8">Nenhum lojista restrito registrado no seu ICA.</p>
                 ) : (
                   merchantsList.map((m, idx) => {
                     const rName = matchCodesData.find(c => c.code === m.reasonCode)?.name || "Motivo desconhecido";
                     return (
                       <div key={idx} className="bg-slate-950 border border-slate-850 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                             <h4 className="text-xs font-bold text-white flex items-center gap-2">
                               {m.name} 
                               <span className="text-[9px] bg-red-500/10 text-red-400 font-mono px-2 py-0.5 rounded">
                                 Motivo {m.reasonCode}
                               </span>
                             </h4>
                             <p className="text-[10px] text-slate-500 mt-1">CNPJ: {m.cnpj} | Ref ID: {m.refId}</p>
                             <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{rName}</p>
                          </div>

                          <div className="flex gap-2">
                             <button
                               onClick={() => {
                                 setSelectedMerchantIndex(idx);
                                 setModifyReasonCode(m.reasonCode);
                                 setShowModifyModal(true);
                               }}
                               className="px-3 py-1.5 bg-slate-900 border border-slate-800 text-[10px] text-slate-300 font-bold hover:text-white rounded-lg transition-all"
                             >
                               Modificar
                             </button>
                             <button
                               onClick={() => {
                                 setSelectedMerchantIndex(idx);
                                 setShowDeleteModal(true);
                               }}
                               className="px-3 py-1.5 bg-red-950 border border-red-900/30 text-[10px] text-red-400 font-bold hover:bg-red-900/20 rounded-lg transition-all"
                             >
                               Excluir
                             </button>
                          </div>
                       </div>
                     );
                   })
                 )}
              </div>

              {/* Modals para Simulação */}
              {showDeleteModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                   <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4">
                      <h4 className="text-white font-bold text-sm">Confirmar Exclusão Regulatória</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                         De acordo com as regras da Mastercard, a remoção de um comerciante do MATCH exige uma justificativa fundamentada. O descumprimento pode causar penalidades.
                      </p>
                      <div className="space-y-1">
                         <label className="text-[9px] font-bold text-slate-500 uppercase">Motivo da Remoção</label>
                         <textarea
                           placeholder="Ex: Cadastrado por erro administrativo ou auditoria concluída."
                           value={deleteReasonText}
                           onChange={(e) => setDeleteReasonText(e.target.value)}
                           className="w-full h-20 bg-slate-950 border border-slate-850 rounded-xl p-3 text-xs text-slate-300 focus:outline-none"
                         />
                      </div>
                      <div className="flex gap-2 pt-2">
                         <button 
                           onClick={deleteMerchant}
                           disabled={!deleteReasonText}
                           className="flex-1 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white text-xs font-bold rounded-lg"
                         >
                           Sim, Excluir
                         </button>
                         <button 
                           onClick={() => setShowDeleteModal(false)}
                           className="flex-1 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-lg"
                         >
                           Cancelar
                         </button>
                      </div>
                   </div>
                </div>
              )}

              {showModifyModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                   <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4">
                      <h4 className="text-white font-bold text-sm">Modificar Código de Risco</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                         Altere a enquadração do motivo de rescisão deste lojista. A mudança será transmitida imediatamente a todas as adquirentes consultadas retrospectivamente.
                      </p>
                      <div className="space-y-1">
                         <label className="text-[9px] font-bold text-slate-500 uppercase">Novo Motivo</label>
                         <select
                           value={modifyReasonCode}
                           onChange={(e) => setModifyReasonCode(e.target.value)}
                           className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-300"
                         >
                           {matchCodesData.map(c => (
                             <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
                           ))}
                         </select>
                      </div>
                      <div className="flex gap-2 pt-2">
                         <button 
                           onClick={modifyMerchant}
                           className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg"
                         >
                           Salvar Alterações
                         </button>
                         <button 
                           onClick={() => setShowModifyModal(false)}
                           className="flex-1 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-lg"
                         >
                           Cancelar
                         </button>
                      </div>
                   </div>
                </div>
              )}

           </div>
         )}

         {/* 4. ABA RETROACTIVE ALERTS */}
         {activeTab === "retroactive" && (
           <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 space-y-6">
              <div className="pb-3 border-b border-slate-800 flex items-center gap-2">
                 <Bell className="text-blue-500" size={16} />
                 <h3 className="text-white font-bold text-sm">Alertas Retroativos Recorrentes</h3>
              </div>

              <div className="space-y-3">
                 {retroactiveLogs.map((log, idx) => (
                   <div key={idx} className="bg-slate-950 border border-slate-850 rounded-2xl p-4 space-y-2">
                      <div className="flex justify-between items-start gap-2">
                         <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold px-2 py-0.5 rounded font-mono">
                            {log.alertType}
                         </span>
                         <span className="text-[8px] font-mono text-slate-600">{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                      <h4 className="text-xs font-bold text-white mt-1">Lojista: {log.merchantName} ({log.merchantCnpj})</h4>
                      <p className="text-[10px] text-slate-400 leading-relaxed mt-1">{log.desc}</p>
                      <div className="text-[9px] text-slate-500">Listado pelo ICA de origem: <span className="font-mono text-slate-400 font-bold">{log.listedByAcquirer}</span></div>
                   </div>
                 ))}
              </div>
           </div>
         )}

         {/* 5. ABA DASHBOARD */}
         {activeTab === "dashboard" && (
           <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 space-y-6">
              <div className="pb-3 border-b border-slate-800 flex items-center gap-2">
                 <BarChart3 className="text-blue-500" size={16} />
                 <h3 className="text-white font-bold text-sm">ICA Performance Hub (Member Testing Facility)</h3>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 text-center">
                    <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider mb-1">Total Screenings</p>
                    <p className="text-xl font-extrabold text-white font-mono">1,482</p>
                 </div>
                 <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 text-center">
                    <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider mb-1">MATCH Hits</p>
                    <p className="text-xl font-extrabold text-red-400 font-mono">42</p>
                 </div>
                 <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 text-center">
                    <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider mb-1">Inscrições Ativas</p>
                    <p className="text-xl font-extrabold text-white font-mono">{merchantsList.length}</p>
                 </div>
                 <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 text-center">
                    <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider mb-1">Notificações</p>
                    <p className="text-xl font-extrabold text-amber-400 font-mono">{retroactiveLogs.length}</p>
                 </div>
              </div>

              <div className="bg-slate-950 p-5 rounded-3xl border border-slate-850 space-y-4">
                 <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <Info size={14} className="text-blue-500" />
                    Regras de Auditoria MATCH Pro (Mastercard)
                 </h4>
                 <p className="text-[11px] text-slate-400 leading-relaxed">
                    Toda credenciadora tem a obrigação regulatória de submeter comerciantes que foram descredenciados por infrações como fraude excessiva, lavagem de dinheiro, práticas comerciais desonestas ou falência à base MATCH dentro de 5 dias úteis. A falha no registro ou a inclusão de dados imprecisos pode acarretar em multas severas de conformidade cobradas nas faturas do ciclo global da Mastercard.
                 </p>
              </div>
           </div>
         )}

      </div>

      {/* Dicionário Completo de Reason Codes na base */}
      <div className="lg:col-span-12 mt-6">
        <h4 className="section-eyebrow mb-4">Dicionário de Reason Codes Disponíveis</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {matchCodesData.map((code) => (
            <div key={code.code} className="flex gap-4 p-4 rounded-2xl border border-slate-850 bg-slate-900/30 hover:bg-slate-900 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 font-mono font-bold shrink-0">
                {code.code}
              </div>
              <div>
                <h5 className="text-xs font-bold text-white">{code.name}</h5>
                <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">{code.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
