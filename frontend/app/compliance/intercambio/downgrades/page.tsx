"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  ChevronLeft, Zap, AlertOctagon, TrendingDown, 
  ArrowRight, ShieldCheck, ShieldAlert, Clock, 
  Info, Calculator, Landmark
} from "lucide-react";

// ─── Dados Normativos (Extraídos dos Manuais v24.1) ──────────────────────────

const PRODUCTS = {
  mastercard: [
    { id: "black", name: "Black / World Elite", targetRate: 1.33, fallbackRate: 1.83, category: "Credit" },
    { id: "platinum", name: "Platinum", targetRate: 1.33, fallbackRate: 1.83, category: "Credit" },
    { id: "standard", name: "Standard / Gold", targetRate: 1.15, fallbackRate: 1.60, category: "Credit" },
    { id: "debit", name: "Debit (Regulated)", targetRate: 0.50, fallbackRate: 0.80, category: "Debit" },
  ],
  visa: [
    { id: "infinite", name: "Infinite", targetRate: 1.33, fallbackRate: 1.83, category: "Credit" },
    { id: "platinum", name: "Platinum", targetRate: 1.33, fallbackRate: 1.83, category: "Credit" },
    { id: "gold", name: "Gold / Classic", targetRate: 1.15, fallbackRate: 1.55, category: "Credit" },
    { id: "debit", name: "Debit (Regulated)", targetRate: 0.50, fallbackRate: 0.80, category: "Debit" },
  ]
};

const FAULTS = [
  { 
    id: "no_3ds", 
    name: "Ausência de 3DS / UCAF", 
    desc: "Transação e-commerce sem autenticação forte.",
    networks: ["mastercard", "visa"],
    fix: "Implementar 3DS v2.2. Garantir envio do PDS 0052 (Master) ou ECI 05/06 (Visa).",
    impactLabel: "Downgrade para Standard CNP"
  },
  { 
    id: "late_clearing", 
    name: "Atraso no Clearing (> D+1)", 
    desc: "O envio do arquivo de liquidação excedeu o prazo de timeliness.",
    networks: ["mastercard", "visa"],
    fix: "Otimizar jobs de fechamento. Enviar arquivos de clearing em no máximo 24h após a autorização.",
    impactLabel: "Non-Qual / Late Presentment"
  },
  { 
    id: "wrong_mcc", 
    name: "MCC Não Qualificado", 
    desc: "O MCC do lojista não pertence aos programas de incentivo (Ex: Supermercado).",
    networks: ["mastercard", "visa"],
    fix: "Revisar o cadastro do Merchant. Usar MCC 5411 para Supermercados para habilitar taxas de setor.",
    impactLabel: "Loss of Segment Rate"
  }
];

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function DowngradeLab() {
  const [network, setNetwork] = useState<"mastercard" | "visa">("mastercard");
  const [productId, setProductId] = useState("black");
  const [selectedFaults, setSelectedFaults] = useState<string[]>([]);
  const [amount, setAmount] = useState(1000);

  const product = useMemo(() => 
    PRODUCTS[network].find(p => p.id === productId) || PRODUCTS[network][0]
  , [network, productId]);

  const calculation = useMemo(() => {
    let currentRate = product.targetRate;
    let penalty = 0;

    if (selectedFaults.length > 0) {
      // Simplificação lógica: se houver falha, cai para o fallback
      currentRate = product.fallbackRate;
      
      // Adicional por atraso severo ou múltiplos erros
      if (selectedFaults.includes("late_clearing")) {
        currentRate += 0.20;
      }
    }

    const targetCost = (amount * product.targetRate) / 100;
    const currentCost = (amount * currentRate) / 100;
    const loss = currentCost - targetCost;

    return { currentRate, targetCost, currentCost, loss };
  }, [product, selectedFaults, amount]);

  const toggleFault = (id: string) => {
    setSelectedFaults(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  return (
    <div className="bg-background min-h-screen text-foreground pb-20">
      {/* Header */}
      <div className="border-b border-border bg-code-bg py-8 px-6">
        <div className="mx-auto max-w-5xl">
          <Link href="/compliance/intercambio" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ChevronLeft size={16} /> Voltar ao Playbook
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center">
              <TrendingDown size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Laboratório de Diagnóstico de Downgrades</h1>
              <p className="text-muted-foreground text-sm">Visualize como falhas técnicas destroem a margem da sua operação.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Painel de Configuração */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* 1. Escolha a Bandeira e Produto */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-xs font-bold">1</span>
              <h2 className="font-bold text-lg">Cenário da Transação</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Bandeira</label>
                <div className="flex p-1 bg-black/40 border border-border rounded-lg">
                  <button 
                    onClick={() => setNetwork("mastercard")}
                    className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${network === "mastercard" ? "bg-red-500 text-white shadow-lg" : "text-muted-foreground hover:text-white"}`}
                  >
                    MASTERCARD
                  </button>
                  <button 
                    onClick={() => setNetwork("visa")}
                    className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${network === "visa" ? "bg-blue-600 text-white shadow-lg" : "text-muted-foreground hover:text-white"}`}
                  >
                    VISA
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Valor da Venda (R$)</label>
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-black/40 border border-border rounded-lg px-4 py-2 text-white font-mono focus:border-indigo-500 outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Tipo de Cartão / Produto</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PRODUCTS[network].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setProductId(p.id)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      productId === p.id 
                        ? "bg-white/10 border-white/40 text-white" 
                        : "bg-black/20 border-border text-muted-foreground hover:border-white/20"
                    }`}
                  >
                    <div className="text-xs font-bold mb-1">{p.name}</div>
                    <div className="text-[10px] opacity-60">Base: {p.targetRate}%</div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* 2. Simular Falhas */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center text-xs font-bold">2</span>
              <h2 className="font-bold text-lg">Injetar Pontos de Falha Normativa</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {FAULTS.filter(f => f.networks.includes(network)).map((f) => (
                <button
                  key={f.id}
                  onClick={() => toggleFault(f.id)}
                  className={`flex items-start gap-4 p-4 rounded-xl border transition-all text-left ${
                    selectedFaults.includes(f.id)
                      ? "bg-red-500/10 border-red-500/40"
                      : "bg-black/20 border-border hover:border-white/10"
                  }`}
                >
                  <div className={`mt-1 p-2 rounded-lg ${selectedFaults.includes(f.id) ? "bg-red-500 text-white" : "bg-white/5 text-muted-foreground"}`}>
                    {f.id === "late_clearing" ? <Clock size={16} /> : <ShieldAlert size={16} />}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className={`font-bold text-sm ${selectedFaults.includes(f.id) ? "text-red-400" : "text-white"}`}>
                        {f.name}
                      </h4>
                      {selectedFaults.includes(f.id) && (
                        <span className="text-[10px] font-black uppercase px-1.5 py-0.5 bg-red-500 text-white rounded">Ativo</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Painel de Resultados */}
        <div className="space-y-6">
          <div className="sticky top-10">
            <div className="bg-gradient-to-br from-indigo-900/20 to-black border border-indigo-500/30 rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-indigo-500/20 bg-indigo-500/5">
                <h3 className="font-bold text-indigo-400 flex items-center gap-2">
                  <Calculator size={18} /> Impacto Financeiro
                </h3>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="text-center py-4">
                  <div className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-1">Taxa de Intercâmbio Atual</div>
                  <div className={`text-5xl font-black ${selectedFaults.length > 0 ? "text-red-500" : "text-emerald-500"}`}>
                    {calculation.currentRate.toFixed(2)}%
                  </div>
                  <div className="text-xs mt-2 flex items-center justify-center gap-1">
                    {selectedFaults.length > 0 ? (
                      <>
                        <TrendingDown size={14} className="text-red-400" />
                        <span className="text-red-400 font-bold">Downgrade Aplicado</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={14} className="text-emerald-400" />
                        <span className="text-emerald-400 font-bold">Qualificação Máxima</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Custo Ideal (Target)</span>
                    <span className="text-white font-mono">R$ {calculation.targetCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Custo Penalizado</span>
                    <span className="text-red-400 font-mono">R$ {calculation.currentCost.toFixed(2)}</span>
                  </div>
                  <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                    <span className="font-bold text-white">Prejuízo por Transação</span>
                    <span className="text-xl font-black text-red-500 font-mono">
                      - R$ {calculation.loss.toFixed(2)}
                    </span>
                  </div>
                </div>

                {selectedFaults.length > 0 && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl space-y-3">
                    <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase tracking-tighter">
                      <AlertOctagon size={14} /> Como corrigir (Fix Strategy)
                    </div>
                    {selectedFaults.map(id => {
                      const fault = FAULTS.find(f => f.id === id);
                      return (
                        <div key={id} className="text-[11px] text-slate-300 leading-relaxed border-l-2 border-red-500/50 pl-3 py-1">
                          {fault?.fix}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 p-5 bg-code-bg border border-border rounded-2xl">
              <h4 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
                <Landmark size={16} className="text-indigo-400" /> Referência Normativa
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Este simulador utiliza as tabelas de intercâmbio do manual <strong>{network === "mastercard" ? "Mastercard v24.1" : "Visa v3.0"}</strong>. 
                Os valores refletem o custo de intercâmbio (IRDs/FPIs) e não incluem a margem do adquirente (Scheme Fees) ou tributos.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
