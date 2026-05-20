"use client";

import { useState } from "react";
import { 
  Database, 
  HelpCircle, 
  Layers, 
  ChevronRight, 
  Tag, 
  Cpu, 
  DollarSign, 
  BookOpen,
  ArrowRight
} from "lucide-react";

export default function ClearingSimulatorClient() {
  const [pan, setPan] = useState("453211******8902");
  const [amount, setAmount] = useState(150.00);
  const [mcc, setMcc] = useState("5411");
  const [txType, setTxType] = useState<"credit" | "debit">("credit");
  const [channel, setChannel] = useState<"chip" | "contactless" | "ecommerce_3ds">("chip");

  // Simulação de custos / Scheme Fees
  const computeFees = () => {
    let mcbsFees = [];
    let visaFees = [];
    
    // Fee de autorização básica
    mcbsFees.push({ code: "2AB1006P", name: "Domestic Auth Switching Fee", cost: "BRL 0.117" });
    visaFees.push({ code: "VisaNet Switching", name: "Tarifa de Processamento VisaNet", cost: "BRL 0.098" });

    // Fees adicionais por canal
    if (channel === "contactless") {
      mcbsFees.push({ code: "2AB1706", name: "Contactless Processing Surcharge", cost: "BRL 0.019" });
      visaFees.push({ code: "VTS Contactless", name: "Tarifa Adicional por Contactless", cost: "BRL 0.012" });
    } else if (channel === "ecommerce_3ds") {
      mcbsFees.push({ code: "2AB1790", name: "AAV Validation Fee (3DS)", cost: "BRL 0.015" });
      visaFees.push({ code: "3DS Auth Service", name: "Tarifa de Validação 3DS", cost: "BRL 0.010" });
    }

    // Fee de liquidação (ad valorem)
    const mcSettlement = (amount * 0.00018).toFixed(4);
    mcbsFees.push({ code: "2AB3006M", name: "Volume-Based Settlement Fee (0.018%)", cost: `BRL ${mcSettlement}` });
    
    const visaSettlement = (amount * 0.00015).toFixed(4);
    visaFees.push({ code: "VSS Settlement Fee", name: "Tarifa Multilateral de Settlement (0.015%)", cost: `BRL ${visaSettlement}` });

    return { mcbsFees, visaFees };
  };

  const { mcbsFees, visaFees } = computeFees();

  // Gerador de formatos posicionais do Base II (TCR 0 e TCR 1)
  // Formato real do Base II TCR possui 168 caracteres
  const formatBaseIITCR0 = () => {
    const tc = txType === "credit" ? "05" : "05"; // TC 05 Venda normal
    const formattedAmount = Math.round(amount * 100).toString().padStart(12, "0");
    const formattedPan = pan.replace(/\*/g, "9").padEnd(16, " ");
    const dates = "052026"; // MMDDYY (Maio 20, 2026)
    
    return `${tc}${formattedPan}02${formattedAmount}${dates}9982736125  39  `;
  };

  const formatBaseIITCR1 = () => {
    const formattedMcc = mcc.padEnd(4, " ");
    const posMode = channel === "chip" ? "051" : channel === "contactless" ? "071" : "812";
    const eci = channel === "ecommerce_3ds" ? "5" : " ";
    
    return `1${formattedMcc}${posMode}${eci}ECOMMIT PAYMENTS     SAO PAULO    BR`;
  };

  return (
    <div className="bg-[#070d19] border border-slate-850 rounded-[2.5rem] p-8 mt-12 space-y-8">
      
      <div>
        <p className="section-eyebrow mb-1">Simulador de Clearing Deep Dive</p>
        <h3 className="text-white font-bold text-lg">BASE II (Visa) vs IPM (Mastercard)</h3>
        <p className="text-xs text-slate-400 mt-2 max-w-3xl leading-relaxed">
          Configure a transação no formulário para simular e visualizar lado a lado a estrutura real dos registros enviados à bandeira no final do dia (D+1) e entender onde as tarifas de rede (*Scheme Fees*) são coletadas.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Formulário de Input */}
        <div className="lg:col-span-4 bg-slate-950/40 border border-slate-900 rounded-2xl p-5 space-y-5">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-slate-900">
            Dados da Transação
          </h4>

          {/* PAN */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Número do Cartão (PAN)</label>
            <input 
              type="text" 
              value={pan}
              onChange={(e) => setPan(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs font-mono text-slate-300 focus:outline-none"
            />
          </div>

          {/* Valor */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Valor da Venda (R$)</label>
            <input 
              type="number" 
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs font-mono text-slate-300 focus:outline-none"
            />
          </div>

          {/* MCC */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">MCC (Ramo de Atividade)</label>
            <select
              value={mcc}
              onChange={(e) => setMcc(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none"
            >
              <option value="5411">5411 - Supermercados</option>
              <option value="5812">5812 - Restaurantes</option>
              <option value="6012">6012 - Serviços Financeiros</option>
              <option value="6211">6211 - Corretoras de Valores</option>
            </select>
          </div>

          {/* Tipo de Cartão */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Função de Pagamento</label>
            <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-850 h-[34px]">
              <button
                onClick={() => setTxType("credit")}
                className={`flex-1 text-[9px] font-bold rounded uppercase transition-all ${
                  txType === "credit" ? "bg-blue-600/20 text-blue-400" : "text-slate-500"
                }`}
              >
                Crédito
              </button>
              <button
                onClick={() => setTxType("debit")}
                className={`flex-1 text-[9px] font-bold rounded uppercase transition-all ${
                  txType === "debit" ? "bg-blue-600/20 text-blue-400" : "text-slate-500"
                }`}
              >
                Débito
              </button>
            </div>
          </div>

          {/* Canal */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Canal e Autenticação</label>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none"
            >
              <option value="chip">F2F - Chip e Senha</option>
              <option value="contactless">F2F - Contactless (NFC)</option>
              <option value="ecommerce_3ds">CNP - E-commerce com 3DS</option>
            </select>
          </div>

        </div>

        {/* Visualização de Clearing lado a lado */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Bloco Visa BASE II */}
            <div className="bg-slate-950 border border-slate-900 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-900">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Visa BASE II (VCF Layout)</span>
                <span className="text-[8px] bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold px-1.5 py-0.5 rounded font-mono">168 Bytes Posicionais</span>
              </div>

              <div className="space-y-3 font-mono text-[9px] text-slate-400">
                <div>
                  <span className="text-white font-bold block mb-1">TCR 0 (Transaction Category Record 0)</span>
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-850 text-slate-300 select-all overflow-x-auto truncate">
                    {formatBaseIITCR0()}
                  </div>
                  <div className="mt-1.5 space-y-0.5 text-[8px] text-slate-500">
                    <div>• Pos 1-2: Transaction Code = <span className="text-blue-400 font-bold">05</span> (Venda)</div>
                    <div>• Pos 3-18: PAN = <span className="text-blue-400 font-bold">{pan.replace(/\*/g, "9")}</span></div>
                    <div>• Pos 21-32: Amount = <span className="text-blue-400 font-bold">{(amount*100).toString()}</span> (R$ {amount.toFixed(2)})</div>
                  </div>
                </div>

                <div>
                  <span className="text-white font-bold block mb-1">TCR 1 (Transaction Category Record 1)</span>
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-850 text-slate-300 select-all overflow-x-auto truncate">
                    {formatBaseIITCR1()}
                  </div>
                  <div className="mt-1.5 space-y-0.5 text-[8px] text-slate-500">
                    <div>• Pos 2-5: MCC = <span className="text-blue-400 font-bold">{mcc}</span></div>
                    <div>• Pos 6-8: POS Entry Mode = <span className="text-blue-400 font-bold">{channel === "chip" ? "051" : channel === "contactless" ? "071" : "812"}</span></div>
                    <div>• Pos 9: ECI Indicator = <span className="text-blue-400 font-bold">{channel === "ecommerce_3ds" ? "5" : "Space"}</span></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bloco Mastercard IPM */}
            <div className="bg-slate-950 border border-slate-900 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-900">
                <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Mastercard IPM (Integrated Payment)</span>
                <span className="text-[8px] bg-red-500/10 border border-red-500/20 text-red-400 font-bold px-1.5 py-0.5 rounded font-mono">ISO 8583 MTI 1240</span>
              </div>

              <div className="space-y-2 font-mono text-[9px] text-slate-400">
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-850 space-y-1.5 text-slate-300 overflow-x-auto">
                  <div>MTI: <span className="text-red-400 font-bold">1240</span> (First Financial Presentment)</div>
                  <div>DE 002 (PAN): <span className="text-slate-400">{pan}</span></div>
                  <div>DE 004 (Amount): <span className="text-red-400 font-bold">{Math.round(amount*100)}</span></div>
                  <div>DE 022 (POS Entry): <span className="text-slate-400">{channel === "chip" ? "051" : channel === "contactless" ? "071" : "812"}</span></div>
                  <div>DE 026 (MCC): <span className="text-slate-400">{mcc}</span></div>
                  <div>DE 048.T42 (ECI): <span className="text-red-400 font-bold">{channel === "ecommerce_3ds" ? "242" : "0"}</span></div>
                  <div>DE 127.PDS 0148 (Settlement Currency): <span className="text-slate-400">986 (BRL)</span></div>
                </div>
                <div className="text-[8px] text-slate-500 leading-normal">
                  *Mastercard organiza o IPM em Tags e PDS (Private Data Sheets) em vez de posições fixas, facilitando a inclusão de dados dinâmicos.
                </div>
              </div>
            </div>

          </div>

          {/* Mapeamento de Custos de Bandeira (Scheme Fees) */}
          <div className="bg-slate-950 border border-slate-900 rounded-2xl p-5 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-slate-900 flex items-center gap-2">
              <DollarSign size={14} className="text-emerald-500" />
              Mapeamento de Scheme Fees Aplicados ao Record de Clearing (Adquirente ↔ Bandeira)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Visa VSS Billing */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-blue-400 uppercase">Visa Settlement Service (VSS)</p>
                <div className="space-y-2">
                  {visaFees.map((fee, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-900 p-2.5 rounded-lg border border-slate-850 text-[10px]">
                      <div className="text-slate-400">
                        <span className="text-slate-500 font-mono block text-[8px]">{fee.code}</span>
                        {fee.name}
                      </div>
                      <span className="text-white font-mono font-bold">{fee.cost}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* MCBS Billing */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-red-400 uppercase">Mastercard Consolidated Billing (MCBS)</p>
                <div className="space-y-2">
                  {mcbsFees.map((fee, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-900 p-2.5 rounded-lg border border-slate-850 text-[10px]">
                      <div className="text-slate-400">
                        <span className="text-slate-500 font-mono block text-[8px]">{fee.code}</span>
                        {fee.name}
                      </div>
                      <span className="text-white font-mono font-bold">{fee.cost}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
