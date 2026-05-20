"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Landmark, 
  HelpCircle, 
  Info, 
  CheckCircle2, 
  AlertCircle, 
  Play, 
  RotateCcw, 
  Database,
  ArrowRight,
  UserCheck
} from "lucide-react";

// Categorias e regras baseadas no manual oficial
const BAI_CATEGORIES = [
  {
    code: "AA",
    name: "Account-to-Account Transfer",
    desc: "Aporte para conta de mesma titularidade (Me-to-Me) em outra instituição.",
    suggestedMccs: ["6012", "6211", "4829"],
    notes: "Utilizado principalmente para corretoras e transferências entre contas bancárias do mesmo CPF."
  },
  {
    code: "FT",
    name: "Funds Transfer",
    desc: "Transferência genérica para recarga de carteira digital de propósito geral (Stored Value).",
    suggestedMccs: ["6540", "6012", "4829", "6211"],
    notes: "Deve ser alterado para LA se mais de 50% das vendas anuais do provedor forem cripto/ativos líquidos."
  },
  {
    code: "LA",
    name: "Liquid Assets",
    desc: "Aporte de saldo destinado especificamente à compra direta de criptoativos ou ativos altamente líquidos.",
    suggestedMccs: ["6051", "6012", "6211"],
    notes: "Regra mandatória desde Outubro de 2024. Exige marcador de Ativo Líquido/Crypto no DE 60.4."
  },
  {
    code: "PP",
    name: "Person-to-Person (P2P)",
    desc: "Transferência internacional ou nacional enviada para outra pessoa física (Me-to-You).",
    suggestedMccs: ["4829", "6012"],
    notes: "Ideal para remessas familiares e pagamentos P2P em carteiras digitais."
  },
  {
    code: "WT",
    name: "Staged Digital Wallet Transfer",
    desc: "Aporte em carteiras com rede proprietária de aceitação (ex: PayPal, Mercado Pago).",
    suggestedMccs: ["6051", "6012"],
    notes: "Uso exclusivo por operadores registrados como SDWO (Staged Digital Wallet Operator)."
  },
  {
    code: "BI",
    name: "Bank-Initiated P2P",
    desc: "Transferência P2P iniciada diretamente por internet banking emissor.",
    suggestedMccs: ["6012"],
    notes: "Uso restrito e habilitado sob demanda em mercados específicos."
  }
];

const MCC_DESCRIPTIONS: Record<string, string> = {
  "4829": "Non-Financial Wire Transfer Money Orders (Remessa)",
  "6012": "Financial Institutions (Bancos/Instituições Financeiras)",
  "6051": "Non-Financial Quasi-Cash / Cryptos / Foreign Currency",
  "6211": "Security Brokers/Dealers (Corretoras de Valores)",
  "6540": "Non-Financial Stored Value Card Purchase/Load (Carteiras)"
};

export default function AftClient() {
  const [selectedBai, setSelectedBai] = useState(BAI_CATEGORIES[0]);
  const [mcc, setMcc] = useState(selectedBai.suggestedMccs[0]);
  const [amount, setAmount] = useState("150.00");
  const [isCrossBorder, setIsCrossBorder] = useState(false);
  const [senderName, setSenderName] = useState("VINICIUS SUGAMELE");
  const [recipientName, setRecipientName] = useState("ECOMMIT PAYMENTS");
  
  // States para simulação
  const [simulated, setSimulated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleBaiChange = (baiCode: string) => {
    const found = BAI_CATEGORIES.find(b => b.code === baiCode)!;
    setSelectedBai(found);
    setMcc(found.suggestedMccs[0]);
    setSimulated(false);
  };

  const runSimulation = () => {
    setLoading(true);
    setSimulated(false);
    
    setTimeout(() => {
      // Validações normativas
      const errors = [];
      const warnings = [];
      
      // Validação 1: Cross-Border exige Sender/Recipient em F104
      if (isCrossBorder) {
        if (!senderName || !recipientName) {
          errors.push({
            code: "V.I.P. 0494",
            title: "Data Element Missing or Invalid",
            desc: "Transações cross-border de AFT exigem obrigatoriamente a presença dos campos de Sender Data e Recipient Name no Field 104."
          });
        }
      }

      // Validação 2: MCC correto para LA
      if (selectedBai.code === "LA" && mcc !== "6051" && mcc !== "6012" && mcc !== "6211") {
        warnings.push({
          title: "Inconsistência de MCC no Liquid Assets",
          desc: "Embora permitido sob condições específicas, o regulamento da Visa aconselha o uso de MCC 6051 ou 6012 para transações de compra de ativos líquidos e cripto."
        });
      }

      // Validação 3: Liquid/Crypto Indicator
      const isCryptoMcc = mcc === "6051" || selectedBai.code === "LA";

      // Determinar Interchange Fee (IRD) estimado
      let interchangeRate = "0.80%";
      let interchangeFixed = "R$ 0.00";
      let irdName = "AFT Domestic Regulated Debit";
      
      if (isCrossBorder) {
        interchangeRate = "1.15%";
        interchangeFixed = "$0.10";
        irdName = "AFT Cross-Border Debit Standard";
      } else if (mcc === "6211") {
        interchangeRate = "0.50%";
        irdName = "AFT Security Broker Preferred";
      }

      setResults({
        success: errors.length === 0,
        errors,
        warnings,
        interchange: {
          rate: interchangeRate,
          fixed: interchangeFixed,
          ird: irdName
        },
        payload: {
          de3: "001000", // Código de compra comum para aporte
          de18: mcc,
          de60_4: isCryptoMcc ? "7" : null,
          de104_usage2_hex57: selectedBai.code,
          de104_sender: isCrossBorder ? senderName : "Não enviado (Doméstico)",
          de104_recipient: isCrossBorder ? recipientName : "Não enviado (Doméstico)"
        }
      });
      setLoading(false);
      setSimulated(true);
    }, 1000);
  };

  const resetForm = () => {
    setSelectedBai(BAI_CATEGORIES[0]);
    setMcc(BAI_CATEGORIES[0].suggestedMccs[0]);
    setAmount("150.00");
    setIsCrossBorder(false);
    setSenderName("VINICIUS SUGAMELE");
    setRecipientName("ECOMMIT PAYMENTS");
    setSimulated(false);
    setResults(null);
  };

  return (
    <div className="space-y-10">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Formulário de Parâmetros AFT */}
        <div className="lg:col-span-5 bg-slate-900/50 border border-slate-800 rounded-3xl p-6 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <Landmark className="text-yellow-400" size={20} />
            <h3 className="text-white font-bold text-base">Parâmetros da Transação</h3>
          </div>

          {/* BAI Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              AFT Category (BAI Code)
              <span className="text-[10px] text-yellow-500 font-mono">F104 U2 H57</span>
            </label>
            <select 
              value={selectedBai.code}
              onChange={(e) => handleBaiChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:border-yellow-500 transition-colors"
            >
              {BAI_CATEGORIES.map(b => (
                <option key={b.code} value={b.code}>
                  {b.code} - {b.name}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 leading-relaxed italic mt-1">
              {selectedBai.desc}
            </p>
          </div>

          {/* MCC Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Merchant Category Code (MCC)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {selectedBai.suggestedMccs.map(m => (
                <button
                  key={m}
                  onClick={() => setMcc(m)}
                  className={`py-2 px-3 text-xs font-mono rounded-lg border transition-all ${
                    mcc === m 
                      ? "bg-yellow-500/10 border-yellow-500 text-yellow-400 font-bold"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-500 font-medium">
              Significado: {MCC_DESCRIPTIONS[mcc] || "Código específico"}
            </p>
          </div>

          {/* Valor */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Valor (Amount)
              </label>
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-slate-200 text-sm font-mono focus:outline-none focus:border-yellow-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Território
              </label>
              <div className="flex bg-slate-950 rounded-xl p-1 border border-slate-850 h-[42px]">
                <button
                  onClick={() => setIsCrossBorder(false)}
                  className={`flex-1 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all ${
                    !isCrossBorder ? "bg-yellow-500/20 text-yellow-400" : "text-slate-500"
                  }`}
                >
                  Doméstico
                </button>
                <button
                  onClick={() => setIsCrossBorder(true)}
                  className={`flex-1 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all ${
                    isCrossBorder ? "bg-yellow-500/20 text-yellow-400" : "text-slate-500"
                  }`}
                >
                  Cross-Border
                </button>
              </div>
            </div>
          </div>

          {/* Informações de Sender/Recipient (Obrigatórias em Cross-border) */}
          <div className="space-y-4 pt-4 border-t border-slate-800/60">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <UserCheck size={14} className="text-yellow-400" />
              Detalhamento de Identidade (F104)
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Sender Name (Ordenante)
                </label>
                <input
                  type="text"
                  placeholder="Nome do portador"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value.toUpperCase())}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-slate-200 text-xs font-mono focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Recipient Name (Favorecido)
                </label>
                <input
                  type="text"
                  placeholder="Instituição/Favorecido"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value.toUpperCase())}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-slate-200 text-xs font-mono focus:outline-none focus:border-yellow-500"
                />
              </div>
            </div>
            {isCrossBorder && (
              <p className="text-[10px] text-amber-400/90 leading-relaxed bg-amber-950/20 border border-amber-900/30 p-3 rounded-xl flex gap-2">
                <Info size={14} className="shrink-0 mt-0.5" />
                <span>
                  <strong>Aviso:</strong> A ausência de nome de remetente ou favorecido em transações transfronteiriças causará rejeição sistêmica imediata na VisaNet.
                </span>
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={runSimulation}
              disabled={loading}
              className="flex-1 py-3 bg-yellow-500 text-slate-950 text-xs font-black rounded-xl hover:bg-yellow-400 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Simulando...</span>
              ) : (
                <>
                  <Play size={14} fill="currentColor" /> Simular AFT
                </>
              )}
            </button>
            <button
              onClick={resetForm}
              className="px-4 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-700 transition-all flex items-center justify-center"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>

        {/* Simulador da Payload ISO 8583 & Resposta */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Mapeamento de Bits ISO 8583 */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Database className="text-yellow-400" size={18} />
                <h4 className="text-white font-bold text-sm">Geração de Bits / ISO 8583 Mapping</h4>
              </div>
              <span className="text-[9px] bg-slate-800 text-slate-400 border border-slate-700 font-mono px-2 py-0.5 rounded">
                Base II / V.I.P.
              </span>
            </div>

            <div className="space-y-3 font-mono text-[11px]">
              
              {/* Bit 3 */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-900 flex justify-between items-center">
                <div>
                  <span className="text-yellow-400 font-bold">DE 003</span> - Processing Code
                </div>
                <div className="text-slate-300 font-bold bg-slate-900 px-3 py-1 rounded border border-slate-800">
                  {simulated ? results.payload.de3 : "001000"}
                </div>
              </div>

              {/* Bit 18 */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-900 flex justify-between items-center">
                <div>
                  <span className="text-yellow-400 font-bold">DE 018</span> - Merchant Category Code (MCC)
                </div>
                <div className="text-slate-300 font-bold bg-slate-900 px-3 py-1 rounded border border-slate-800">
                  {simulated ? results.payload.de18 : mcc}
                </div>
              </div>

              {/* Bit 60.4 */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-900 flex justify-between items-center">
                <div>
                  <span className="text-yellow-400 font-bold">DE 060.4</span> - Special Condition (Crypto Indicator)
                </div>
                <div className="text-slate-300 font-bold bg-slate-900 px-3 py-1 rounded border border-slate-800">
                  {simulated ? (results.payload.de60_4 || "N/A") : (mcc === "6051" || selectedBai.code === "LA" ? "7" : "N/A")}
                </div>
              </div>

              {/* Bit 104 U2 Hex 57 */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-900 flex justify-between items-center">
                <div>
                  <span className="text-yellow-400 font-bold">DE 104.U2.57</span> - Business Application Identifier (BAI)
                </div>
                <div className="text-yellow-400 font-bold bg-yellow-500/10 px-3 py-1 rounded border border-yellow-500/25">
                  {selectedBai.code}
                </div>
              </div>

              {/* Bit 104 Cross-border details */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-900 space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-yellow-400 font-bold">DE 104.U5</span> - Sender/Recipient Identity
                  </div>
                  <span className={`text-[8px] px-2 py-0.5 rounded font-bold uppercase ${isCrossBorder ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-slate-900 text-slate-600 border border-slate-800"}`}>
                    {isCrossBorder ? "Ativo (Cross-Border)" : "Inativo (Doméstico)"}
                  </span>
                </div>
                {simulated && isCrossBorder && (
                  <div className="pt-2 border-t border-slate-900 space-y-1 text-slate-400 text-[10px]">
                    <div>Sender: <span className="text-slate-300 font-bold">{results.payload.de104_sender}</span></div>
                    <div>Recipient: <span className="text-slate-300 font-bold">{results.payload.de104_recipient}</span></div>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Resultado da Simulação */}
          <AnimatePresence mode="wait">
            {simulated && results && (
              <motion.div 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                
                {/* Status Box */}
                {results.success ? (
                  <div className="p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl flex gap-4">
                    <CheckCircle2 size={24} className="text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-white mb-1">AFT Autenticada e Aprovada</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        A transação atende aos critérios normativos da Visa para transações de depósito. Os bits e tags obrigatórias foram informados corretamente na autorização.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-3xl flex gap-4">
                    <AlertCircle size={24} className="text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-red-400 mb-2">Transação Rejeitada sistemicamente</h4>
                      <div className="space-y-3">
                        {results.errors.map((e: any, idx: number) => (
                          <div key={idx} className="p-3 bg-red-950/20 border border-red-900/30 rounded-xl">
                            <span className="text-[10px] font-bold text-red-500 font-mono block mb-1">{e.code}</span>
                            <h5 className="text-xs font-bold text-white mb-0.5">{e.title}</h5>
                            <p className="text-[11px] text-slate-400 leading-relaxed">{e.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Warnings Box */}
                {results.warnings.length > 0 && (
                  <div className="p-5 bg-amber-500/10 border border-amber-500/25 rounded-3xl flex gap-4">
                    <AlertCircle size={24} className="text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-amber-400 mb-2">Alertas de Risco / Compliance</h4>
                      <div className="space-y-2">
                        {results.warnings.map((w: any, idx: number) => (
                          <div key={idx}>
                            <h5 className="text-xs font-bold text-white mb-0.5">{w.title}</h5>
                            <p className="text-[11px] text-slate-400 leading-relaxed">{w.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Resumo Tarifário */}
                <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                    Detalhamento de Custos e Intercâmbio (IRD)
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-900">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Qualificador IRD</p>
                      <p className="text-xs text-white font-bold">{results.interchange.ird}</p>
                    </div>
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-900">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Taxa de Intercâmbio (Aprox)</p>
                      <p className="text-sm text-yellow-400 font-extrabold font-mono">
                        {results.interchange.rate} <span className="text-[10px] text-slate-400 font-normal">{results.interchange.fixed !== "R$ 0.00" ? `+ ${results.interchange.fixed}` : ""}</span>
                      </p>
                    </div>
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </div>

      {/* Regras e Contexto Normativo do Manual */}
      <section className="bg-slate-900/30 border border-slate-800/80 rounded-[2rem] p-8 space-y-6">
        <h4 className="text-white font-bold text-base flex items-center gap-2">
          <Info className="text-yellow-400" size={18} />
          Diretrizes Técnicas — Manual de AFT da Visa Direct
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <h5 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
              Mudança para BAI "LA"
            </h5>
            <p className="text-xs text-slate-400 leading-relaxed">
              Desde 19 de Outubro de 2024, qualquer instituição de câmbio de moeda estrangeira ou criptoativos deve classificar seus aportes de saldo com o código **LA (Liquid Assets)** ao invés de **FT (Funds Transfer)** se a sua receita anual provier em 50% ou mais de transações de ativos não-fiat.
            </p>
          </div>
          <div className="space-y-2">
            <h5 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
              Velocity Limits da Visa
            </h5>
            <p className="text-xs text-slate-400 leading-relaxed">
              A Visa impõe limites padrão de frequência e volume acumulado diário para mitigar lavagem de dinheiro em cartões de débito que financiam carteiras virtuais, aplicando limites mais severos para transações transfronteiriças (cross-border).
            </p>
          </div>
          <div className="space-y-2">
            <h5 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
              Reject Code 0494
            </h5>
            <p className="text-xs text-slate-400 leading-relaxed">
              O sistema autorizador V.I.P. da Visa possui validações ativas de integridade estrutural. Caso uma AFT transfronteiriça não forneça os dados de identificação do portador ordenante (Field 104), ela é negada na hora com o código de rejeição 0494.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
