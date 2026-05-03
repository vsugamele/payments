"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Terminal, 
  Send, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Cpu,
  FileJson,
  RefreshCw
} from "lucide-react";

export default function GcmsTester() {
  const [formData, setFormData] = useState({
    posEntryMode: "05",
    eci: "",
    mcc: "5411",
    ird: "IA",
    amount: "150.00"
  });

  const [logs, setLogs] = useState<{type: 'info' | 'success' | 'error', message: string, timestamp: string}[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);

  // Cenários pré-definidos
  const SCENARIOS = [
    {
      id: "ok",
      label: "✅ Transação Perfeita",
      desc: "Chip EMV + IRD correto",
      fraud: false,
      color: "#10b981",
      data: { posEntryMode: "05", eci: "", mcc: "5411", ird: "IA", amount: "150.00" }
    },
    {
      id: "fraude_campo",
      label: "🚨 Fraude de Campo",
      desc: "E-com (81) com IRD físico",
      fraud: true,
      color: "#ef4444",
      data: { posEntryMode: "81", eci: "", mcc: "5411", ird: "IA", amount: "500.00" }
    },
    {
      id: "downgrade_3ds",
      label: "⚠️ Downgrade 3DS",
      desc: "ECI 07 com IRD autenticado",
      fraud: true,
      color: "#f59e0b",
      data: { posEntryMode: "81", eci: "07", mcc: "5411", ird: "AW", amount: "250.00" }
    },
    {
      id: "fallback_mag",
      label: "🔄 Fallback Magstripe",
      desc: "Tarja magnética (POS Entry 90)",
      fraud: false,
      color: "#6366f1",
      data: { posEntryMode: "90", eci: "", mcc: "5411", ird: "IA", amount: "80.00" }
    },
    {
      id: "parcelado_sem_pds",
      label: "🇧🇷 Parcelado s/ PDS",
      desc: "Chip EMV sem PDS 0181",
      fraud: true,
      color: "#f97316",
      data: { posEntryMode: "05", eci: "", mcc: "5411", ird: "IA", amount: "1200.00" }
    },
  ];

  const loadScenario = (s: typeof SCENARIOS[0]) => {
    setFormData(s.data);
    setActiveScenario(s.id);
    setLogs([]);
  };

  const posEntryModes = [
    { value: "05", label: "05 - Chip EMV Integrado" },
    { value: "10", label: "10 - Contactless (NFC)" },
    { value: "81", label: "81 - E-commerce" },
    { value: "90", label: "90 - Tarja Magnética" },
  ];

  const eciModes = [
    { value: "", label: "N/A (Físico)" },
    { value: "05", label: "05 - 3DS Autenticado Total" },
    { value: "06", label: "06 - 3DS Tentativa (Stand-in)" },
    { value: "07", label: "07 - E-commerce sem 3DS" },
  ];

  const irds = [
    { value: "IA", label: "IA - Presencial" },
    { value: "JA", label: "JA - Contactless" },
    { value: "HU", label: "HU - E-commerce sem 3DS" },
    { value: "AW", label: "AW - E-commerce com 3DS" },
  ];

  const addLog = (type: 'info' | 'success' | 'error', message: string) => {
    const time = new Date().toISOString().split('T')[1].substring(0, 12);
    setLogs(prev => [...prev, { type, message, timestamp: time }]);
  };

  const handleSimulate = () => {
    setIsProcessing(true);
    setLogs([]); // limpa logs anteriores

    setTimeout(() => {
      addLog('info', `INICIANDO INGESTÃO IPM... [DE 22: ${formData.posEntryMode}, DE 48: ${formData.eci || 'VAZIO'}]`);
      
      setTimeout(() => {
        addLog('info', `GCMS EDIT CHECK: Avaliando tabela T168 (IRD Validation)... IRD Submetido: ${formData.ird}`);
        
        setTimeout(() => {
          // Lógica de Validação T168 Simplificada
          let isRejected = false;
          let errorMessage = "";

          // Regra 1: E-commerce (81) não pode ter IRD Presencial (IA/JA)
          if (formData.posEntryMode === "81" && (formData.ird === "IA" || formData.ird === "JA")) {
            isRejected = true;
            errorMessage = "EDIT T168 FATAL: POS Entry Mode 81 (E-com) incompatível com IRD Presencial (IA/JA). Possível fraude de manipulação de campo.";
          }
          
          // Regra 2: Físico (05/10) não pode ter IRD de E-commerce (HU/AW)
          else if ((formData.posEntryMode === "05" || formData.posEntryMode === "10") && (formData.ird === "HU" || formData.ird === "AW")) {
            isRejected = true;
            errorMessage = "EDIT T168 FATAL: POS Entry Mode físico (05/10) incompatível com IRD Digital (HU/AW).";
          }

          // Regra 3: Se ECI é 07 (sem 3DS), não pode cobrar IRD de 3DS (AW)
          else if (formData.posEntryMode === "81" && formData.eci === "07" && formData.ird === "AW") {
            isRejected = true;
            errorMessage = "EDIT T165/T168: ECI 07 indica ausência de 3DS. Submissão de IRD AW (Autenticado) rejeitada por Downgrade para HU.";
          }

          // Regra 4: Contactless (JA) exige POS Entry Mode 10
          else if (formData.ird === "JA" && formData.posEntryMode !== "10") {
             isRejected = true;
             errorMessage = "EDIT T168: IRD JA (Contactless) submetido, mas POS Entry Mode não é 10. Rejeição de lote.";
          }

          if (isRejected) {
            addLog('error', errorMessage);
            setTimeout(() => {
              addLog('error', "CLEARING REJECTED: Transação devolvida ao adquirente. Fee de rejeição (T165) de $0.02 aplicado.");
              setIsProcessing(false);
            }, 800);
          } else {
            addLog('success', "EDIT T168 PASSED: Compatibilidade de canais verificada com sucesso.");
            setTimeout(() => {
              addLog('success', "CLEARING ACCEPTED: Transação roteada para o emissor (T112). Posição de Settlement atualizada.");
              setIsProcessing(false);
            }, 800);
          }
        }, 1200);
      }, 1000);
    }, 500);
  };

  return (
    <div className="bg-[#0a1120] border border-slate-800 rounded-3xl overflow-hidden flex flex-col md:flex-row h-[600px] shadow-2xl">
      
      {/* Coluna de Configuração */}
      <div className="w-full md:w-1/3 border-r border-slate-800 p-6 bg-slate-900/50 flex flex-col">
        <div className="flex items-center gap-2 mb-6">
          <Cpu size={18} className="text-purple-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-widest">Montar IPM Record</h3>
        </div>

        <div className="space-y-4 flex-1">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">DE 22: POS Entry Mode</label>
            <select 
              value={formData.posEntryMode}
              onChange={(e) => setFormData({...formData, posEntryMode: e.target.value})}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
            >
              {posEntryModes.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">DE 48 (ECI)</label>
            <select 
              value={formData.eci}
              onChange={(e) => setFormData({...formData, eci: e.target.value})}
              disabled={formData.posEntryMode !== "81"}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 disabled:opacity-50"
            >
              {eciModes.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">DE 18: MCC</label>
            <input 
              type="text" 
              value={formData.mcc}
              onChange={(e) => setFormData({...formData, mcc: e.target.value})}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">IRD Submetido</label>
            <select 
              value={formData.ird}
              onChange={(e) => setFormData({...formData, ird: e.target.value})}
              className="w-full bg-purple-900/20 border border-purple-500/50 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-400 font-mono"
            >
              {irds.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
        </div>

        <button
          onClick={handleSimulate}
          disabled={isProcessing}
          className="w-full mt-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isProcessing ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
          {isProcessing ? 'Enviando...' : 'Submeter ao GCMS'}
        </button>
      </div>

      {/* Coluna do Terminal */}
      <div className="w-full md:w-2/3 bg-[#05080f] flex flex-col relative font-mono text-xs">
      {/* Cenários pré-definidos */}
        <div className="border-b border-slate-800 pb-4 mb-4">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Cenários Rápidos</p>
          <div className="space-y-1.5">
            {SCENARIOS.map(s => (
              <button
                key={s.id}
                onClick={() => loadScenario(s)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all flex items-center gap-2 border ${
                  activeScenario === s.id
                    ? "border-opacity-60 font-bold"
                    : "border-slate-700 hover:border-slate-600"
                }`}
                style={{
                  background: activeScenario === s.id ? `${s.color}15` : "transparent",
                  borderColor: activeScenario === s.id ? `${s.color}40` : undefined,
                  color: activeScenario === s.id ? s.color : "#94a3b8",
                }}
              >
                <span className="flex-1 truncate">{s.label}</span>
                {s.fraud && (
                  <span className="text-[9px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded shrink-0">FRAUDE</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Formulário de campos */}
        <div className="px-4 py-3 bg-[#0f1524] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Terminal size={14} className="text-slate-500" />
            <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">GCMS Edit Rule Logger</span>
          </div>
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
          </div>
        </div>

        {/* Terminal Output */}
        <div className="flex-1 p-6 overflow-y-auto space-y-3">
          {logs.length === 0 && !isProcessing && (
            <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-4 opacity-50">
              <FileJson size={32} />
              <p>Aguardando submissão de arquivo IPM...</p>
            </div>
          )}

          <AnimatePresence>
            {logs.map((log, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start gap-3 leading-relaxed"
              >
                <span className="text-slate-600 shrink-0">[{log.timestamp}]</span>
                {log.type === 'info' && <span className="text-blue-400 shrink-0">{"->"}</span>}
                {log.type === 'success' && <CheckCircle size={14} className="text-emerald-500 shrink-0 mt-0.5" />}
                {log.type === 'error' && <XCircle size={14} className="text-red-500 shrink-0 mt-0.5" />}
                
                <span className={`
                  ${log.type === 'info' ? 'text-slate-300' : ''}
                  ${log.type === 'success' ? 'text-emerald-400 font-bold' : ''}
                  ${log.type === 'error' ? 'text-red-400 font-bold' : ''}
                `}>
                  {log.message}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>

          {isProcessing && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-slate-500"
            >
              <div className="w-1.5 h-4 bg-slate-500 animate-pulse" />
              <span>Processando...</span>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
