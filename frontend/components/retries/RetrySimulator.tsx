"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw,
  ShieldAlert,
  AlertOctagon,
  CheckCircle2,
  Database,
  Lock,
  AlertTriangle,
  XCircle,
  ArrowRight,
  Zap,
} from "lucide-react";
import macData from "@/data/mac-codes.json";

// ── Mapeamento de ícones e cores por ação ─────────────────────────────────────

function getActionStyle(action: string) {
  switch (action) {
    case "Update Credentials":
      return { icon: Database, bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30", accent: "#10b981" };
    case "Retry (Soft)":
      return { icon: RefreshCw, bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/30", accent: "#3b82f6" };
    case "Block Account":
      return { icon: Lock, bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/30", accent: "#ef4444" };
    case "Block/Fraud":
      return { icon: AlertOctagon, bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/30", accent: "#f43f5e" };
    case "Contact Cardholder":
      return { icon: AlertTriangle, bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/30", accent: "#f59e0b" };
    default:
      return { icon: XCircle, bg: "bg-slate-500/10", text: "text-slate-400", border: "border-slate-500/30", accent: "#64748b" };
  }
}

// ── Componente principal ───────────────────────────────────────────────────────

export default function RetrySimulator() {
  const [selectedMac, setSelectedMac] = useState(macData[0].mac);
  const [showTree, setShowTree] = useState(false);

  const current = macData.find((m) => m.mac === selectedMac) || macData[0];
  const style = getActionStyle(current.action);
  const Icon = style.icon;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ── Painel de Seleção ── */}
        <div className="p-8 rounded-[3rem] bg-[#0a1120] border border-orange-500/20 space-y-6">
          <div className="flex items-center gap-3 text-orange-400">
            <RefreshCw size={20} />
            <h3 className="text-sm font-bold uppercase tracking-widest">Simulador de Decisão MAC</h3>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Combine o <strong>Response Code (DE 39)</strong> com o{" "}
            <strong>Merchant Advice Code (DE 48.84)</strong> para determinar a estratégia de retentativa.
          </p>

          <div className="grid grid-cols-2 gap-3">
            {macData.map((item) => {
              const s = getActionStyle(item.action);
              const isSelected = selectedMac === item.mac;
              return (
                <button
                  key={item.mac}
                  onClick={() => setSelectedMac(item.mac)}
                  className={`p-4 rounded-2xl text-left transition-all border ${
                    isSelected
                      ? "bg-orange-600 border-orange-500 text-white shadow-lg shadow-orange-600/20"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:border-orange-500/40"
                  }`}
                >
                  <div className="text-[10px] font-bold opacity-60 mb-1">MAC {item.mac}</div>
                  <div className="text-xs font-bold truncate">{item.action}</div>
                  <div className="text-[10px] opacity-50 mt-0.5">RC: {item.responseCode}</div>
                </button>
              );
            })}
          </div>

          {/* Toggle para árvore de decisão */}
          <button
            onClick={() => setShowTree(!showTree)}
            className="w-full py-2.5 rounded-xl border border-orange-500/20 text-xs font-bold text-orange-400 hover:bg-orange-500/5 transition-colors flex items-center justify-center gap-2"
          >
            <Zap size={14} />
            {showTree ? "Ocultar" : "Ver"} Fluxograma de Decisão
          </button>
        </div>

        {/* ── Output de Inteligência ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedMac}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={`p-8 rounded-[3rem] bg-[#05080f] border ${style.border} space-y-6 relative overflow-hidden`}
          >
            {/* Ícone de fundo decorativo */}
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Icon size={140} />
            </div>

            {/* Header */}
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${style.bg} ${style.text}`}>
                <Icon size={28} />
              </div>
              <div>
                <h4 className="text-xl font-black text-white">{current.action}</h4>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  MAC {current.mac} • RC {current.responseCode}
                </p>
              </div>
            </div>

            {/* Significado */}
            <div className="px-4 py-2 rounded-xl bg-white/[0.03] border border-white/5">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Significado</p>
              <p className="text-xs text-slate-300 font-medium">{current.meaning}</p>
            </div>

            {/* Descrição — BUG #1 CORRIGIDO: sem aspas literais */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <p className="text-xs text-slate-300 leading-relaxed italic">
                {current.desc}
              </p>
            </div>

            {/* Recomendação forense */}
            <div className={`flex items-start gap-3 p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20`}>
              <ShieldAlert size={18} className="text-orange-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold text-orange-400 uppercase mb-1">Recomendação Forense</p>
                <p className="text-xs text-white font-medium">{current.recommendation}</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Fluxograma de Decisão Visual (toggle) ── */}
      <AnimatePresence>
        {showTree && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-8 rounded-[2.5rem] bg-[#0a1120] border border-slate-800 space-y-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest text-center">
                Fluxograma de Decisão de Retentativa
              </h3>
              <p className="text-xs text-slate-500 text-center max-w-2xl mx-auto">
                Após uma negativa, siga este fluxo antes de decidir se tenta novamente.
              </p>

              {/* Árvore visual */}
              <div className="flex flex-col items-center gap-0">
                {/* Nó raiz */}
                <DecisionNode
                  label="Transação Negada (DE 39 ≠ 00)"
                  color="border-slate-500 bg-slate-800"
                  textColor="text-slate-300"
                />
                <Arrow />

                {/* Pergunta 1 */}
                <DiamondNode label="Existe MAC (DE 48.84)?" />

                <div className="grid grid-cols-2 gap-12 mt-0 w-full max-w-2xl">
                  {/* Branch SIM */}
                  <div className="flex flex-col items-center gap-0">
                    <Arrow label="SIM" />
                    <DiamondNode label="Qual o MAC?" small />
                    <div className="grid grid-cols-1 gap-2 mt-3 w-full">
                      {[
                        { mac: "01", action: "Atualizar credenciais (ABU/VAU)", color: "border-emerald-500/40 bg-emerald-950/30 text-emerald-300" },
                        { mac: "02", action: "Retry após 24-72h", color: "border-blue-500/40 bg-blue-950/30 text-blue-300" },
                        { mac: "03/21/24", action: "STOP PERMANENTE", color: "border-red-500/40 bg-red-950/30 text-red-300" },
                        { mac: "04/99", action: "Verificar com emissor", color: "border-amber-500/40 bg-amber-950/30 text-amber-300" },
                      ].map((m) => (
                        <div key={m.mac} className={`px-3 py-2 rounded-xl border text-[10px] font-bold ${m.color} flex items-center gap-2`}>
                          <span className="opacity-60">MAC {m.mac}:</span> {m.action}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Branch NÃO */}
                  <div className="flex flex-col items-center gap-0">
                    <Arrow label="NÃO" />
                    <DiamondNode label="RC indica permanente?" small />
                    <div className="grid grid-cols-1 gap-2 mt-3 w-full">
                      {[
                        { rc: "14, 41, 43", action: "STOP — não retente", color: "border-red-500/40 bg-red-950/30 text-red-300" },
                        { rc: "51, 65", action: "Retry em D+1 ou D+7", color: "border-blue-500/40 bg-blue-950/30 text-blue-300" },
                        { rc: "05, 12", action: "1 retry após 24h máx", color: "border-amber-500/40 bg-amber-950/30 text-amber-300" },
                      ].map((r) => (
                        <div key={r.rc} className={`px-3 py-2 rounded-xl border text-[10px] font-bold ${r.color} flex items-center gap-2`}>
                          <span className="opacity-60">RC {r.rc}:</span> {r.action}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 rounded-2xl bg-orange-500/5 border border-orange-500/10 text-center">
                <p className="text-[11px] text-orange-300 font-medium">
                  ⚠️ Mastercard limita retentativas a <strong>máx. 15 tentativas / 30 dias</strong> por PAN. Exceder gera multa via billing.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Info Card: ABU & VAU ── */}
      <div className="p-6 rounded-[2rem] bg-gradient-to-br from-emerald-900/10 to-transparent border border-emerald-500/10 flex items-center gap-6">
        <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
          <CheckCircle2 size={32} />
        </div>
        <div>
          <h5 className="text-white font-bold mb-1">Otimização via ABU / VAU</h5>
          <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
            Sempre que receber um <strong>MAC 01</strong>, não tente novamente. Isso indica que há novos dados
            disponíveis (Novo PAN ou Validade). Utilize o serviço de atualização automática de credenciais
            (Automatic Billing Updater da Mastercard ou Visa Account Updater) para sanear sua base antes da
            próxima tentativa.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Sub-componentes do Fluxograma ─────────────────────────────────────────────

function DecisionNode({ label, color, textColor }: { label: string; color: string; textColor: string }) {
  return (
    <div className={`px-6 py-3 rounded-2xl border ${color} ${textColor} text-xs font-bold text-center max-w-xs`}>
      {label}
    </div>
  );
}

function DiamondNode({ label, small }: { label: string; small?: boolean }) {
  return (
    <div
      className={`${small ? "px-4 py-2" : "px-6 py-3"} rounded-2xl border border-orange-500/40 bg-orange-950/20 text-orange-300 text-xs font-bold text-center max-w-xs`}
      style={{ clipPath: small ? undefined : undefined }}
    >
      ◆ {label}
    </div>
  );
}

function Arrow({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center">
      {label && (
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{label}</span>
      )}
      <ArrowRight size={16} className="text-slate-600 rotate-90 my-1" />
    </div>
  );
}
