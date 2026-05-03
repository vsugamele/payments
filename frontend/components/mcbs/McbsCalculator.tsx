"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Calculator, 
  DollarSign, 
  Activity, 
  ShieldCheck, 
  RefreshCw, 
  AlertTriangle,
  Download,
  CreditCard,
  Wifi,
  BarChart
} from "lucide-react";

export default function McbsCalculator() {
  const [metrics, setMetrics] = useState({
    volumeBrl: 50000000, // 50M BRL
    txnCount: 500000,    // 500k transações
    ecommercePct: 30,    // 30% e-commerce
    threeDsPct: 80,      // 80% do e-commerce usa 3DS
    contactlessPct: 50,  // 50% do físico usa NFC
    chargebacks: 150,    // 150 chargebacks
  });

  const [isCalculated, setIsCalculated] = useState(false);

  // Cálculos Básicos
  const ecommerceTxns = Math.floor(metrics.txnCount * (metrics.ecommercePct / 100));
  const physicalTxns = metrics.txnCount - ecommerceTxns;
  
  const threeDsTxns = Math.floor(ecommerceTxns * (metrics.threeDsPct / 100));
  const nonThreeDsTxns = ecommerceTxns - threeDsTxns;
  const contactlessTxns = Math.floor(physicalTxns * (metrics.contactlessPct / 100));

  // Tabela de Custos Simplificada (Estimativa Educacional)
  // 1. Fee de Rede Base (Auth): ~ R$ 0.04 por transação (Média dos Tiers AA/AB)
  const authFee = metrics.txnCount * 0.04;

  // 2. E-commerce sem autenticação (AN - 2AB3006M): ~ R$ 0.00029 por BRL
  const ecomNoAuthVol = (metrics.volumeBrl * (metrics.ecommercePct/100)) * (1 - metrics.threeDsPct/100);
  const unauthEcomFee = ecomNoAuthVol * 0.00029;

  // 3. Validação 3DS (AB - 2AB1790): R$ 0.0155 por txn
  const threeDsFee = threeDsTxns * 0.0155;

  // 4. Tokenização NFC (AB - 2AB1706): R$ 0.019 por txn
  const nfcFee = contactlessTxns * 0.019;

  // 5. Chargebacks (C2 - 2CI201716): R$ 114.74 por item
  const chargebackFee = metrics.chargebacks * 114.74;

  // 6. Taxas Fixas e Conectividade (Estimativa)
  const fixedFees = 5000; // AML, ABU min, Conectividade base

  const totalFee = authFee + unauthEcomFee + threeDsFee + nfcFee + chargebackFee + fixedFees;
  const effectiveRate = (totalFee / metrics.volumeBrl) * 100;

  const handleCalculate = () => {
    setIsCalculated(true);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Coluna 1: Formulário de Inputs */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-[#0a1120] border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-800/50">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Activity size={20} />
            </div>
            <div>
              <h3 className="text-white font-bold">Métricas do Adquirente</h3>
              <p className="text-xs text-slate-500">Insira os volumes mensais previstos</p>
            </div>
          </div>

          <div className="space-y-5">
            {/* TPV */}
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">TPV Mensal (R$)</label>
                <span className="text-sm font-mono text-white">
                  R$ {(metrics.volumeBrl / 1000000).toFixed(1)} Milhões
                </span>
              </div>
              <input 
                type="range" min="1000000" max="500000000" step="1000000"
                value={metrics.volumeBrl}
                onChange={(e) => setMetrics({...metrics, volumeBrl: Number(e.target.value)})}
                className="w-full accent-blue-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Qtd Transações */}
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Qtd Transações</label>
                <span className="text-sm font-mono text-white">
                  {metrics.txnCount.toLocaleString('pt-BR')} txns
                </span>
              </div>
              <input 
                type="range" min="10000" max="5000000" step="10000"
                value={metrics.txnCount}
                onChange={(e) => setMetrics({...metrics, txnCount: Number(e.target.value)})}
                className="w-full accent-blue-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              {/* E-commerce % */}
              <div className="space-y-2 p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">E-commerce</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" min="0" max="100"
                    value={metrics.ecommercePct}
                    onChange={(e) => setMetrics({...metrics, ecommercePct: Number(e.target.value)})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-md px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-slate-400 text-sm">%</span>
                </div>
              </div>

              {/* 3DS % */}
              <div className="space-y-2 p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Adoção 3DS</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" min="0" max="100"
                    value={metrics.threeDsPct}
                    onChange={(e) => setMetrics({...metrics, threeDsPct: Number(e.target.value)})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-md px-2 py-1 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-slate-400 text-sm">%</span>
                </div>
              </div>

              {/* Contactless % */}
              <div className="space-y-2 p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">NFC Físico</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" min="0" max="100"
                    value={metrics.contactlessPct}
                    onChange={(e) => setMetrics({...metrics, contactlessPct: Number(e.target.value)})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-md px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-slate-400 text-sm">%</span>
                </div>
              </div>

              {/* Chargebacks */}
              <div className="space-y-2 p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Chargebacks</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" min="0"
                    value={metrics.chargebacks}
                    onChange={(e) => setMetrics({...metrics, chargebacks: Number(e.target.value)})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-md px-2 py-1 text-sm text-white focus:outline-none focus:border-red-500"
                  />
                  <span className="text-slate-400 text-sm">Qtd</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleCalculate}
              className="w-full mt-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <Calculator size={16} /> Gerar Fatura Simulada
            </button>
          </div>
        </div>
      </div>

      {/* Coluna 2: Resultado (Fatura Simulada) */}
      <div className="lg:col-span-7">
        {!isCalculated ? (
          <div className="h-full min-h-[400px] border border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center text-slate-500 space-y-4">
            <BarChart size={48} className="opacity-20" />
            <p className="text-sm">Ajuste as métricas e clique em "Gerar Fatura Simulada"</p>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl overflow-hidden shadow-2xl relative"
          >
            {/* Header da Fatura (Estilo Papel) */}
            <div className="bg-slate-50 p-8 border-b border-slate-200">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">MCBS Invoice</h2>
                  <p className="text-sm text-slate-500 font-medium">Mastercard Consolidated Billing System</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Company ID</p>
                  <p className="font-mono text-slate-700">1952536378</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-white border border-slate-100 rounded-lg shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">TPV Processado</p>
                  <p className="text-sm font-bold text-slate-800">R$ {(metrics.volumeBrl/1000000).toFixed(1)}M</p>
                </div>
                <div className="p-3 bg-white border border-slate-100 rounded-lg shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Fee</p>
                  <p className="text-sm font-bold text-blue-600">R$ {totalFee.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                </div>
                <div className="p-3 bg-white border border-slate-100 rounded-lg shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Taxa Efetiva</p>
                  <p className="text-sm font-bold text-emerald-600">{effectiveRate.toFixed(4)}%</p>
                </div>
              </div>
            </div>

            {/* Corpo da Fatura */}
            <div className="p-8">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-200">
                    <th className="py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Service / Billing Event</th>
                    <th className="py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Volume</th>
                    <th className="py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Rate</th>
                    <th className="py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Total (BRL)</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {/* Fee de Rede */}
                  <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-4">
                      <p className="font-bold text-slate-800">Network Fee (2AB1006)</p>
                      <p className="text-xs text-slate-500">Autorizações Domésticas Tiered</p>
                    </td>
                    <td className="py-4 text-right font-mono text-slate-600">{metrics.txnCount.toLocaleString()}</td>
                    <td className="py-4 text-right font-mono text-slate-500 text-xs">~ R$ 0.0400</td>
                    <td className="py-4 text-right font-mono font-medium text-slate-800">R$ {authFee.toLocaleString('pt-BR', {minimumFractionDigits:2})}</td>
                  </tr>

                  {/* 3DS Fee */}
                  <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-4">
                      <p className="font-bold text-slate-800">SecureCode Auth (2AB1790)</p>
                      <p className="text-xs text-slate-500">E-commerce Autenticado (3DS)</p>
                    </td>
                    <td className="py-4 text-right font-mono text-slate-600">{threeDsTxns.toLocaleString()}</td>
                    <td className="py-4 text-right font-mono text-slate-500 text-xs">R$ 0.0155</td>
                    <td className="py-4 text-right font-mono font-medium text-slate-800">R$ {threeDsFee.toLocaleString('pt-BR', {minimumFractionDigits:2})}</td>
                  </tr>

                  {/* Non-Auth Ecom Fee */}
                  <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-4">
                      <p className="font-bold text-slate-800">Unauth E-com (2AB3006M)</p>
                      <p className="text-xs text-slate-500 text-orange-500/80">Risco: E-commerce sem 3DS (Amount-based)</p>
                    </td>
                    <td className="py-4 text-right font-mono text-slate-600 text-xs">R$ {(ecomNoAuthVol/1000).toFixed(0)}k</td>
                    <td className="py-4 text-right font-mono text-slate-500 text-xs">0.029%</td>
                    <td className="py-4 text-right font-mono font-medium text-slate-800">R$ {unauthEcomFee.toLocaleString('pt-BR', {minimumFractionDigits:2})}</td>
                  </tr>

                  {/* Tokenização NFC */}
                  <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-4">
                      <p className="font-bold text-slate-800">NFC Mapping (2AB1706)</p>
                      <p className="text-xs text-slate-500">Transações Contactless Presenciais</p>
                    </td>
                    <td className="py-4 text-right font-mono text-slate-600">{contactlessTxns.toLocaleString()}</td>
                    <td className="py-4 text-right font-mono text-slate-500 text-xs">R$ 0.0190</td>
                    <td className="py-4 text-right font-mono font-medium text-slate-800">R$ {nfcFee.toLocaleString('pt-BR', {minimumFractionDigits:2})}</td>
                  </tr>

                  {/* Chargebacks */}
                  <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors bg-red-50/30">
                    <td className="py-4">
                      <p className="font-bold text-slate-800">Chargeback Process (2CI201716)</p>
                      <p className="text-xs text-red-500/80 font-medium">Processamento de disputas</p>
                    </td>
                    <td className="py-4 text-right font-mono text-slate-600">{metrics.chargebacks.toLocaleString()}</td>
                    <td className="py-4 text-right font-mono text-slate-500 text-xs">R$ 114.74</td>
                    <td className="py-4 text-right font-mono font-medium text-slate-800">R$ {chargebackFee.toLocaleString('pt-BR', {minimumFractionDigits:2})}</td>
                  </tr>

                  {/* Fixed Fees */}
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="py-4">
                      <p className="font-bold text-slate-800">Fixed & Connectivity Fees</p>
                      <p className="text-xs text-slate-500">AML, ABU Min, Global Switch</p>
                    </td>
                    <td className="py-4 text-right font-mono text-slate-600">--</td>
                    <td className="py-4 text-right font-mono text-slate-500 text-xs">Fixed</td>
                    <td className="py-4 text-right font-mono font-medium text-slate-800">R$ {fixedFees.toLocaleString('pt-BR', {minimumFractionDigits:2})}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} className="py-6 text-right font-bold text-slate-800 text-lg">TOTAL ESTIMADO</td>
                    <td className="py-6 text-right font-mono font-black text-blue-600 text-xl border-t-2 border-slate-800">
                      R$ {totalFee.toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2})}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="bg-slate-800 p-4 text-center">
              <p className="text-[10px] text-slate-400">
                Esta é uma simulação educacional das tarifas (Scheme Fees) cobradas via GCMS/MCBS.
                Os valores reais variam conforme contratos específicos e tiers exatos de volume. 
                Não reflete repasses de MDR ou Intercâmbio.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
