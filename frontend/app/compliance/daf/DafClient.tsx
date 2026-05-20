"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Shield, 
  TrendingUp, 
  Coins, 
  HelpCircle, 
  AlertTriangle, 
  CheckCircle2, 
  Cpu, 
  Database,
  Layers,
  ArrowRight
} from "lucide-react";

export default function DafClient() {
  // Sliders
  const [volume, setVolume] = useState(200000); // transações mensais
  const [avgTicket, setAvgTicket] = useState(120); // R$
  const [fraudBps, setFraudBps] = useState(8); // bps (1 bp = 0.01%)
  const [tokenShare, setTokenShare] = useState(70); // % das transações que usam Token de Rede

  // Constantes de mercado aproximadas
  const nonAuthFeeRate = 0.0003; // 0.03% (similar ao service fee de não autenticação)
  const nonAuthFeeFixed = 0.12; // R$ por tx não segura
  const auth3dsServerFee = 0.025; // R$ custo fixo de 3DS Server
  const frictionAbandonmentRate = 0.04; // 4% de abandono em desafios 3DS

  // Cômputo do volume financeiro total
  const financialVolume = volume * avgTicket;
  const fraudRate = fraudBps / 10000;
  const totalFraudCost = financialVolume * fraudRate;

  // 1. Cenário CNP Comum (Sem 3DS, Sem Token)
  const cnpNonAuthFees = volume * (nonAuthFeeFixed + (avgTicket * nonAuthFeeRate));
  const cnpFraudCost = totalFraudCost;
  const cnpApprovalRate = 81.5;
  const cnpSales = financialVolume * (cnpApprovalRate / 100);
  const cnpNetValue = cnpSales - cnpFraudCost - cnpNonAuthFees;

  // 2. Cenário 3DS Padrão
  // Assumindo que 75% passa frictionless e 25% exige desafio (onde temos 4% de abandono no desafio)
  const secure3dsFees = volume * auth3dsServerFee;
  const secure3dsFraudCost = 0; // Liability shift protege o lojista
  const secure3dsApprovalRate = 87.0;
  const secure3dsAbandonmentLoss = volume * 0.25 * frictionAbandonmentRate * avgTicket;
  const secure3dsSales = (financialVolume * (secure3dsApprovalRate / 100)) - secure3dsAbandonmentLoss;
  const secure3dsNetValue = secure3dsSales - secure3dsFraudCost - secure3dsFees;

  // 3. Cenário Visa VTS + DAF (Token de Rede)
  // Somente a parcela tokenizada aproveita o DAF
  const tokenVolume = volume * (tokenShare / 100);
  const nonTokenVolume = volume * (1 - tokenShare / 100);

  // Parcela tokenizada: R$ 0 de Non-Auth Fee, R$ 0 de taxa 3DS, 0% abandono, ECI 05 (Liability Shift)
  const dafNonAuthFees = nonTokenVolume * (nonAuthFeeFixed + (avgTicket * nonAuthFeeRate));
  const dafFraudCost = totalFraudCost * (1 - tokenShare / 100); // Fraude protegida na parte Token/DAF
  const daf3dsFees = 0; 
  const dafApprovalRate = 90.5; // Aprovação mais alta do Token de Rede (+2.5% em relação ao 3DS)
  const dafSales = financialVolume * (dafApprovalRate / 100);
  const dafNetValue = dafSales - dafFraudCost - dafNonAuthFees;

  // Economia Líquida DAF vs CNP Comum
  const netSavingsVsCnp = dafNetValue - cnpNetValue;
  // Economia Líquida DAF vs 3DS
  const netSavingsVs3ds = dafNetValue - secure3dsNetValue;

  const isEnforced = fraudBps >= 10; // 10 bps é o threshold do programa da Visa

  return (
    <div className="space-y-12">
      
      {/* Alerta de Threshold de Fraude */}
      <div className={`p-6 rounded-3xl border transition-all flex items-start gap-4 ${
        isEnforced 
          ? "bg-red-500/10 border-red-500/30 text-red-200" 
          : "bg-emerald-500/5 border-emerald-500/10 text-emerald-200"
      }`}>
        {isEnforced ? (
          <AlertTriangle size={24} className="text-red-500 shrink-0 mt-1 animate-pulse" />
        ) : (
          <CheckCircle2 size={24} className="text-emerald-500 shrink-0 mt-1" />
        )}
        <div>
          <h4 className="text-sm font-bold text-white mb-1">
            {isEnforced 
              ? "Enforcement Ativo: Limite de Fraude Excedido (≥ 10 bps)" 
              : "Status do Merchant: Saudável (< 10 bps)"}
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            {isEnforced 
              ? "Atenção: Conforme as regras da Visa, se o índice de fraude do estabelecimento comercial atingir ou ultrapassar 10 bps (0,10% do volume financeiro) por dois meses consecutivos, a Visa rebaixará as transações DAF de ECI 05 para ECI 07 (não autenticada). O Liability Shift é revogado e o adquirente/lojista passa a arcar com os custos de chargeback."
              : "O estabelecimento está operando abaixo do limite de 10 bps de fraude. As transações tokenizadas qualificadas pelo DAF continuam recebendo ECI 05 e proteção total contra chargebacks de fraude pela bandeira."}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Taxa de Fraude Atual:</span>
            <span className={`text-xs font-mono font-bold ${isEnforced ? "text-red-400" : "text-emerald-400"}`}>
              {fraudBps} bps ({(fraudBps / 100).toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>

      {/* Sliders de Simulação */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-slate-900/40 border border-slate-800 rounded-3xl p-6">
        
        {/* Slider 1: Transações Mensais */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-400">
            <span>Transações / Mês</span>
            <span className="text-white font-mono">{volume.toLocaleString()}</span>
          </div>
          <input 
            type="range" 
            min="10000" 
            max="1000000" 
            step="10000"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        {/* Slider 2: Ticket Médio */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-400">
            <span>Ticket Médio</span>
            <span className="text-white font-mono">R$ {avgTicket}</span>
          </div>
          <input 
            type="range" 
            min="20" 
            max="500" 
            step="5"
            value={avgTicket}
            onChange={(e) => setAvgTicket(Number(e.target.value))}
            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        {/* Slider 3: Taxa de Fraude */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-400">
            <span>Taxa de Fraude</span>
            <span className="text-white font-mono">{fraudBps} bps</span>
          </div>
          <input 
            type="range" 
            min="1" 
            max="30" 
            step="1"
            value={fraudBps}
            onChange={(e) => setFraudBps(Number(e.target.value))}
            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        {/* Slider 4: Penetração do Token */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-400">
            <span>Penetração do Token</span>
            <span className="text-white font-mono">{tokenShare}%</span>
          </div>
          <input 
            type="range" 
            min="10" 
            max="95" 
            step="5"
            value={tokenShare}
            onChange={(e) => setTokenShare(Number(e.target.value))}
            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

      </section>

      {/* Resultados da Calculadora Comparativa */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Cartão 1: CNP Tradicional */}
        <div className="bg-[#0b1220] border border-slate-850 rounded-[2rem] p-6 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-slate-600" />
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Cenário Baselines</span>
            <h4 className="text-base font-extrabold text-white">CNP Tradicional (Sem 3DS)</h4>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between text-xs pb-2 border-b border-slate-900">
              <span className="text-slate-400">Taxa de Aprovação</span>
              <span className="text-red-400 font-bold font-mono">{cnpApprovalRate}%</span>
            </div>
            <div className="flex justify-between text-xs pb-2 border-b border-slate-900">
              <span className="text-slate-400">Non-Auth Surfee</span>
              <span className="text-white font-mono">R$ {cnpNonAuthFees.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-xs pb-2 border-b border-slate-900">
              <span className="text-slate-400">Custo com Fraude</span>
              <span className="text-red-400 font-mono">R$ {cnpFraudCost.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-xs pt-4">
              <span className="text-slate-500 font-bold">Faturamento Líquido</span>
              <span className="text-white font-bold font-mono">
                R$ {cnpNetValue.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>
          <div className="p-3 bg-red-950/15 border border-red-900/20 rounded-2xl text-[10px] text-red-400 leading-relaxed">
             <strong>Risco Comercial:</strong> Lojista assume 100% dos chargebacks por fraude e é penalizado com tarifas adicionais de não autenticação.
          </div>
        </div>

        {/* Cartão 2: 3-D Secure */}
        <div className="bg-[#0b1220] border border-slate-850 rounded-[2rem] p-6 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500" />
          <div>
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-1">Autenticação Comum</span>
            <h4 className="text-base font-extrabold text-white">EMV 3DS (Challenge & Frictionless)</h4>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between text-xs pb-2 border-b border-slate-900">
              <span className="text-slate-400">Taxa de Aprovação</span>
              <span className="text-indigo-400 font-bold font-mono">{secure3dsApprovalRate}%</span>
            </div>
            <div className="flex justify-between text-xs pb-2 border-b border-slate-900">
              <span className="text-slate-400">Custos 3DS Server</span>
              <span className="text-white font-mono">R$ {secure3dsFees.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-xs pb-2 border-b border-slate-900">
              <span className="text-slate-400">Abandono de Carrinho</span>
              <span className="text-red-400 font-mono">R$ {secure3dsAbandonmentLoss.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-xs pt-4">
              <span className="text-slate-500 font-bold">Faturamento Líquido</span>
              <span className="text-white font-bold font-mono">
                R$ {secure3dsNetValue.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>
          <div className="p-3 bg-indigo-950/15 border border-indigo-900/20 rounded-2xl text-[10px] text-indigo-300 leading-relaxed">
             <strong>Atrito no Checkout:</strong> Desafios de autenticação (OTP/App) causam cerca de {frictionAbandonmentRate*100}% de queda nas transações desafiadas.
          </div>
        </div>

        {/* Cartão 3: Visa Token + DAF */}
        <div className="bg-[#0b1b30] border border-blue-500/20 rounded-[2rem] p-6 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-blue-500" />
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block mb-1">Recomendado</span>
              <h4 className="text-base font-extrabold text-white">VTS + Digital Auth (DAF)</h4>
            </div>
            <span className="bg-blue-500/20 border border-blue-500/30 text-blue-400 text-[8px] font-extrabold px-2 py-0.5 rounded uppercase">
              Frictionless
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between text-xs pb-2 border-b border-[#0f2a4e]">
              <span className="text-slate-300">Taxa de Aprovação</span>
              <span className="text-emerald-400 font-bold font-mono">{dafApprovalRate}%</span>
            </div>
            <div className="flex justify-between text-xs pb-2 border-b border-[#0f2a4e]">
              <span className="text-slate-300">Non-Auth Fees Restantes</span>
              <span className="text-white font-mono">R$ {dafNonAuthFees.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-xs pb-2 border-b border-[#0f2a4e]">
              <span className="text-slate-300">Custo com Fraude</span>
              <span className="text-slate-400 font-mono">R$ {dafFraudCost.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-xs pt-4">
              <span className="text-blue-300 font-bold">Faturamento Líquido</span>
              <span className="text-emerald-400 font-bold font-mono">
                R$ {dafNetValue.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-[10px] text-emerald-400 leading-relaxed">
             <strong>Melhor ROI:</strong> Sem taxas adicionais ou abandono. A bandeira assume o risco da fraude (ECI 05) de forma invisível.
          </div>
        </div>

      </section>

      {/* Resumo da Economia */}
      <section className="bg-blue-600/5 border border-blue-500/15 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h4 className="text-white font-bold text-base mb-1">Economia Projetada com o DAF</h4>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
            Com a transição para tokens de rede autenticados sob a chancela do DAF, o lojista elimina tarifas regulatórias extras de não autenticação e custos de chargebacks em {tokenShare}% do seu portfólio.
          </p>
        </div>
        <div className="flex gap-4 shrink-0 font-mono text-center">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 min-w-[130px]">
            <p className="text-[8px] text-slate-500 uppercase tracking-wider mb-1">Economia vs CNP</p>
            <p className="text-sm text-emerald-400 font-extrabold">
              + R$ {Math.max(0, netSavingsVsCnp).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}/mês
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 min-w-[130px]">
            <p className="text-[8px] text-slate-500 uppercase tracking-wider mb-1">Economia vs 3DS</p>
            <p className="text-sm text-emerald-400 font-extrabold">
              + R$ {Math.max(0, netSavingsVs3ds).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}/mês
            </p>
          </div>
        </div>
      </section>

      {/* ISO 8583 Authorization Fields */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <div className="lg:col-span-5 bg-slate-900/50 border border-slate-800 rounded-3xl p-6 space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Cpu className="text-blue-400" size={18} />
            <h4 className="text-white font-bold text-sm">Visualizador de Payload de Autorização</h4>
          </div>

          <div className="space-y-3 font-mono text-[11px]">
            
            {/* Field 34 */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-900">
              <div className="flex justify-between items-center mb-1">
                <span className="text-blue-400 font-bold">DE 034</span>
                <span className="text-[9px] text-slate-500">Acceptance Env Data</span>
              </div>
              <p className="text-[10px] text-slate-400">DSID 01 — Tag C0 (Auth Program)</p>
              <div className="mt-2 text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 inline-block">
                Value: "1" (DAF)
              </div>
            </div>

            {/* Field 60.8 */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-900">
              <div className="flex justify-between items-center mb-1">
                <span className="text-blue-400 font-bold">DE 060.8</span>
                <span className="text-[9px] text-slate-500">Payment Indicator</span>
              </div>
              <div className="mt-1 text-slate-300 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800 inline-block">
                Value: "C" (Token de Rede)
              </div>
            </div>

            {/* Field 126.9 */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-900">
              <div className="flex justify-between items-center mb-1">
                <span className="text-blue-400 font-bold">DE 126.9</span>
                <span className="text-[9px] text-slate-500">CAVV / TAVV</span>
              </div>
              <p className="text-[10px] text-slate-400">CAVV U3 V7 com Indicador DAF</p>
              <div className="mt-2 text-slate-300 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800 inline-block truncate max-w-full">
                Value: "jHhBCwAAAAAA..." (TAVV Cryptogram)
              </div>
            </div>

            {/* ECI */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-900 flex justify-between items-center">
              <div>
                <span className="text-blue-400 font-bold">ECI</span> - Electronic Commerce Indicator
              </div>
              <div className={`text-xs font-bold px-2 py-0.5 rounded border ${
                isEnforced 
                  ? "bg-red-500/10 border-red-500/20 text-red-400" 
                  : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              }`}>
                {isEnforced ? "07" : "05"}
              </div>
            </div>

          </div>
        </div>

        {/* Detalhes de Funcionamento Técnico */}
        <div className="lg:col-span-7 bg-[#0a1120] border border-slate-850 rounded-[2.5rem] p-8 space-y-6">
          <h4 className="text-white font-bold text-sm">Arquitetura Técnica do DAF (Visa)</h4>
          <div className="space-y-4 text-xs text-slate-400 leading-relaxed">
            
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400 font-bold shrink-0">
                1
              </div>
              <div>
                <h5 className="text-white font-bold mb-1">Geração de Token de Rede (VTS)</h5>
                <p>
                  O lojista ou seu gateway solicita a tokenização do cartão real (PAN) criando um Token de Rede (DPAN). A Visa gera e vincula o Token ao dispositivo ou ao comércio eletrônico específico (*Merchant Token*).
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400 font-bold shrink-0">
                2
              </div>
              <div>
                <h5 className="text-white font-bold mb-1">Autenticação Inicial & Recorrência</h5>
                <p>
                  No primeiro fluxo ou de forma transparente nos bastidores, o Token Requestor/Gateway envia dados adicionais do portador (como dados do dispositivo) para a VisaNet. Em resposta, a VisaNet emite um **TAVV (Token Authentication Verification Value)** de nível DAF.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400 font-bold shrink-0">
                3
              </div>
              <div>
                <h5 className="text-white font-bold mb-1">Roteamento e Liability Shift</h5>
                <p>
                  Durante a autorização, a transação trafega com o indicador de programa DAF (F34 = 1) e ECI 05. O emissor recebe a garantia de autenticação provida pela própria rede de tokenização da Visa, reduzindo declínios falsos e assumindo o risco da fraude financeira.
                </p>
              </div>
            </div>

          </div>
        </div>

      </section>

    </div>
  );
}
