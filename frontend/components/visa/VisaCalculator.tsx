"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Calculator, 
  FileText, 
  TrendingUp, 
  ChevronRight, 
  Info, 
  ArrowDownToLine,
  PieChart,
  DollarSign,
  Briefcase
} from "lucide-react";
import visaBillingData from "@/data/visa-billing.json";

export default function VisaCalculator() {
  const [tpv, setTpv] = useState(10000000); // 10M TPV
  const [transactions, setTransactions] = useState(50000);
  const [debitPercent, setDebitPercent] = useState(40);
  const [creditPercent, setCreditPercent] = useState(60);

  const results = useMemo(() => {
    const debitTpv = tpv * (debitPercent / 100);
    const creditTpv = tpv * (creditPercent / 100);

    const fees = visaBillingData.map(fee => {
      let amount = 0;
      if (fee.line === "5B1106453") amount = creditTpv * fee.rate;
      if (fee.line === "5B1106456") amount = debitTpv * fee.rate;
      if (fee.line === "5B1107045") amount = creditTpv * fee.rate;
      if (fee.line === "5B1106602") amount = creditTpv * fee.rate;
      if (fee.line === "5B1106458") amount = fee.rate; // Minimum fee
      if (fee.line === "VBASS_FEE") amount = transactions * fee.rate;

      return { ...fee, amount };
    });

    const total = fees.reduce((acc, f) => acc + f.amount, 0);
    const effectiveRate = (total / tpv) * 100;

    return { fees, total, effectiveRate };
  }, [tpv, transactions, debitPercent, creditPercent]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* ── Painel de Controle ── */}
      <div className="lg:col-span-1 space-y-6">
        <div className="p-8 rounded-[2.5rem] bg-[#0a1120] border border-blue-500/10 space-y-8">
          <div className="flex items-center gap-3">
            <Calculator className="text-blue-400" size={20} />
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Configuração do Volume</h3>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex justify-between">
                TPV Mensal (BRL)
                <span className="text-blue-400">R$ {tpv.toLocaleString()}</span>
              </label>
              <input 
                type="range" min="1000000" max="100000000" step="1000000"
                value={tpv} onChange={(e) => setTpv(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex justify-between">
                Qtd Transações
                <span className="text-blue-400">{transactions.toLocaleString()}</span>
              </label>
              <input 
                type="range" min="1000" max="500000" step="1000"
                value={transactions} onChange={(e) => setTransactions(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Débito %</label>
                <input 
                  type="number" value={debitPercent} onChange={(e) => setDebitPercent(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white text-sm focus:border-blue-500 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Crédito %</label>
                <input 
                  type="number" value={creditPercent} onChange={(e) => setCreditPercent(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white text-sm focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">
            <div className="flex items-start gap-3">
              <Info size={14} className="text-blue-400 mt-0.5" />
              <p className="text-[10px] text-slate-500 leading-relaxed">
                As taxas são estimativas baseadas no VFS (Visa Fee Schedule) Brasil 2024. O faturamento real ocorre via VSS (Visa Settlement Service).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Visualização da Fatura (Invoice) ── */}
      <div className="lg:col-span-2 space-y-6">
        <div className="p-10 rounded-[3rem] bg-[#0a1120] border border-blue-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <FileText size={160} className="text-blue-500" />
          </div>

          <div className="flex justify-between items-start mb-10">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">Visa Invoice Simulator</h2>
              <p className="text-xs text-slate-500 font-mono">BILLING_REPORT_ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Scheme Fees</p>
              <h3 className="text-3xl font-black text-blue-400">R$ {results.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-12 px-4 pb-2 border-b border-slate-800 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
              <div className="col-span-2">Billing Line</div>
              <div className="col-span-6">Description</div>
              <div className="col-span-4 text-right">Amount (BRL)</div>
            </div>

            {results.fees.map((fee, idx) => (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={fee.line} 
                className="grid grid-cols-12 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors group border-b border-slate-800/30"
              >
                <div className="col-span-2 font-mono text-[11px] text-blue-500">{fee.line}</div>
                <div className="col-span-6">
                  <p className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors">{fee.name}</p>
                  <p className="text-[10px] text-slate-500">{fee.description}</p>
                </div>
                <div className="col-span-4 text-right text-xs font-bold text-slate-300 self-center">
                  R$ {fee.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </motion.div>
            ))}
          </div>

          {/* ── Resumo Métrico ── */}
          <div className="mt-10 grid grid-cols-3 gap-6 pt-8 border-t border-slate-800">
            <div className="p-5 rounded-3xl bg-blue-500/5 border border-blue-500/10">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                <TrendingUp size={12} className="text-emerald-400" /> Taxa Efetiva
              </p>
              <h4 className="text-xl font-black text-white">{results.effectiveRate.toFixed(4)}%</h4>
            </div>
            <div className="p-5 rounded-3xl bg-blue-500/5 border border-blue-500/10 text-center">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Service ID Count</p>
              <h4 className="text-xl font-black text-white">{results.fees.length}</h4>
            </div>
            <div className="p-5 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-right">
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-2">Net Settlement Impact</p>
              <h4 className="text-xl font-black text-white text-emerald-400">- R$ {results.total.toLocaleString()}</h4>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button className="px-6 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-white text-xs font-bold hover:bg-slate-800 transition-all flex items-center gap-2">
            <ArrowDownToLine size={16} /> Exportar VSS Report
          </button>
        </div>
      </div>
    </div>
  );
}
