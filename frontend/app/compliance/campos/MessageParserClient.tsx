"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Terminal, 
  Search, 
  Info, 
  AlertTriangle, 
  ArrowRight, 
  Zap, 
  FileCode, 
  ShieldCheck, 
  Layers,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import impactMapData from "@/data/iso-impact-map.json";

interface FieldResult {
  id: string;
  name: string;
  value: string;
  valueDescription: string;
  impact: string;
  impactDesc: string;
  educational: string;
}

export default function MessageParserClient() {
  const [rawLog, setRawLog] = useState("");
  const [parsedFields, setParsedFields] = useState<FieldResult[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  const handleParse = () => {
    if (!rawLog.trim()) return;

    setIsScanning(true);
    
    // Simula delay de "escaneamento" para efeito visual premium
    setTimeout(() => {
      const results: FieldResult[] = [];
      const lines = rawLog.split("\n");

      impactMapData.forEach((field) => {
        // Regex flexível para pegar formatos: DE 22: 010, DE022=010, PDS 0158: HU, etc.
        const fieldKey = field.id.replace("DE", "DE ?").replace("PDS", "PDS ?");
        const regex = new RegExp(`${fieldKey}[:= ]+([A-Z0-9]+)`, "i");
        
        for (const line of lines) {
          const match = line.match(regex);
          if (match) {
            const val = match[1].toUpperCase();
            results.push({
              id: field.id,
              name: field.name,
              value: val,
              valueDescription: (field.values as any)[val] || "Valor não mapeado ou específico de variante.",
              impact: field.impact,
              impactDesc: field.impact_desc,
              educational: field.description
            });
            break;
          }
        }
      });

      setParsedFields(results);
      setIsScanning(false);
    }, 800);
  };

  return (
    <div className="space-y-8">
      {/* ── Área de Entrada de Log ── */}
      <section className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Terminal size={18} className="text-blue-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Laboratório de Mensageria</h2>
          </div>
          <button 
            onClick={() => setRawLog("DE 022: 010\nPDS 0158: HU\nDE 003: 00")}
            className="text-[10px] font-bold text-slate-500 hover:text-blue-400 transition-colors uppercase tracking-widest"
          >
            Carregar Log de Exemplo (Mastercard)
          </button>
        </div>

        <div className="relative group">
          <textarea
            value={rawLog}
            onChange={(e) => setRawLog(e.target.value)}
            placeholder="Cole aqui o log bruto (IPM, ISO 8583 ou strings chave-valor)..."
            className="w-full h-48 bg-[#0a1120] border border-slate-800 rounded-2xl p-5 text-sm font-mono text-emerald-400 placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all resize-none"
          />
          <button
            onClick={handleParse}
            disabled={isScanning || !rawLog}
            className={`absolute bottom-4 right-4 px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-all ${
              isScanning || !rawLog 
                ? "bg-slate-800 text-slate-500 cursor-not-allowed" 
                : "bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-900/20"
            }`}
          >
            {isScanning ? (
              <Zap size={14} className="animate-spin" />
            ) : (
              <Search size={14} />
            )}
            Escanear Impacto
          </button>
        </div>
      </section>

      {/* ── Resultados do Parse ── */}
      <AnimatePresence mode="wait">
        {parsedFields.length > 0 && !isScanning ? (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-800" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Diagnóstico Pedagógico ({parsedFields.length} campos detectados)
              </span>
              <div className="h-px flex-1 bg-slate-800" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {parsedFields.map((f, i) => (
                <motion.div
                  key={f.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="group relative bg-[#0d1526] border border-slate-800 rounded-2xl p-5 hover:border-blue-500/30 transition-all overflow-hidden"
                >
                  {/* Badge de Impacto */}
                  <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-[9px] font-black uppercase tracking-widest border-l border-b ${
                    f.impact === "CRÍTICO" ? "bg-red-500/10 text-red-400 border-red-500/20" : 
                    f.impact === "ALTO" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                    "bg-blue-500/10 text-blue-400 border-blue-500/20"
                  }`}>
                    {f.impact} IMPACTO
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                      <FileCode size={18} className="text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{f.id}</h3>
                      <h4 className="text-sm font-bold text-white mb-2 truncate">{f.name}</h4>
                      
                      {/* Valor e Descrição */}
                      <div className="bg-black/30 rounded-lg p-3 border border-slate-800/50 mb-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg font-black text-emerald-400 font-mono">{f.value}</span>
                          <ArrowRight size={12} className="text-slate-600" />
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed italic">
                          "{f.valueDescription}"
                        </p>
                      </div>

                      {/* Por que isso importa? (Foco Educativo) */}
                      <div className="space-y-3">
                        <div>
                          <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                            <Info size={11} /> Definição Técnica
                          </p>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            {f.educational}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                            <Layers size={11} /> Consequência no Intercâmbio
                          </p>
                          <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                            {f.impactDesc}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA Educativo para o Simulador */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-blue-600/5 border border-blue-600/20 rounded-2xl p-6 text-center"
            >
              <ShieldCheck size={24} className="text-blue-400 mx-auto mb-3" />
              <h3 className="text-white font-bold mb-2">Quer ver o impacto real na margem?</h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
                Agora que você decodificou os campos, insira esses valores no nosso **Simulador de Intercâmbio** para ver o cálculo exato da taxa final.
              </p>
              <a 
                href="/simulador"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
              >
                Ir para o Simulador de Taxas
                <ArrowRight size={14} />
              </a>
            </motion.div>
          </motion.section>
        ) : rawLog && !isScanning ? (
           <div className="text-center py-12 bg-slate-900/20 border border-slate-800 rounded-2xl">
             <Info size={32} className="text-slate-700 mx-auto mb-3" />
             <p className="text-sm text-slate-500">Nenhum campo de impacto conhecido foi detectado neste log.</p>
           </div>
        ) : isScanning ? (
           <div className="space-y-4">
             {[1, 2].map(i => (
               <div key={i} className="h-32 bg-slate-900/50 border border-slate-800 rounded-2xl animate-pulse" />
             ))}
           </div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
