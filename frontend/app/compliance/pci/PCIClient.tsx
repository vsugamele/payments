"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, ShieldAlert, Cpu, CheckCircle2, XCircle, 
  AlertTriangle, Key, Zap, ArrowRight, ShieldCheck,
  History, Lock, Terminal, Info
} from "lucide-react";
import pciV4Data from "@/data/pci-v4-changes.json";

type PCILevel = "SAQ A" | "SAQ A-EP" | "SAQ D";

type PCIData = {
  saq: PCILevel;
  reqCount: number;
  description: string;
  panStored: boolean;
  networkTokens: boolean;
  penTest: boolean;
  asvScans: boolean;
  color: string;
  bg: string;
  border: string;
};

const PCI_SCENARIOS: Record<string, PCIData> = {
  "iframe": {
    saq: "SAQ A",
    reqCount: 22,
    description: "Todo o processamento do cartão ocorre via iFrame ou Hosted Page de um provedor Nível 1. O lojista não tem acesso ao PAN em nenhum momento.",
    panStored: false,
    networkTokens: false,
    penTest: false,
    asvScans: false,
    color: "#4ade80",
    bg: "rgba(74,222,128,0.1)",
    border: "rgba(74,222,128,0.3)",
  },
  "api": {
    saq: "SAQ D",
    reqCount: 328,
    description: "O lojista recebe o PAN completo em claro na sua API (servidor) antes de enviar para a Adquirente. Escopo máximo de auditoria.",
    panStored: true,
    networkTokens: false,
    penTest: true,
    asvScans: true,
    color: "#ef4444",
    bg: "rgba(239,68,68,0.1)",
    border: "rgba(239,68,68,0.3)",
  },
  "token": {
    saq: "SAQ A",
    reqCount: 22,
    description: "O lojista recebe apenas um Network Token ou Gateway Token (TR). O PAN nunca toca os servidores. Carga regulatória baixíssima.",
    panStored: false,
    networkTokens: true,
    penTest: false,
    asvScans: false,
    color: "#2dd4bf",
    bg: "rgba(45,212,191,0.1)",
    border: "rgba(45,212,191,0.3)",
  },
  "js": {
    saq: "SAQ A-EP",
    reqCount: 191,
    description: "O lojista cria o formulário, mas o JS do provedor envia os dados direto para o gateway. O servidor não vê o PAN, mas controla a página do formulário.",
    panStored: false,
    networkTokens: false,
    penTest: true,
    asvScans: true,
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
    border: "rgba(245,158,11,0.3)",
  }
};

export default function PCIClient() {
  const [activeTab, setActiveTab] = useState<"saq" | "v4">("v4");
  const [activeScenario, setActiveScenario] = useState<string>("api");
  const data = PCI_SCENARIOS[activeScenario];

  return (
    <div className="space-y-8">
      
      {/* Tabs Principais */}
      <div className="flex p-1 bg-[#0a1120] border border-slate-800 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab("v4")}
          className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${
            activeTab === "v4" ? "bg-blue-600 text-white shadow-lg" : "text-slate-500 hover:text-white"
          }`}
        >
          <Zap size={14} /> Novidades v4.0
        </button>
        <button
          onClick={() => setActiveTab("saq")}
          className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${
            activeTab === "saq" ? "bg-blue-600 text-white shadow-lg" : "text-slate-500 hover:text-white"
          }`}
        >
          <Shield size={14} /> Calculadora SAQ
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "v4" ? (
          <motion.div
            key="v4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pciV4Data.map((item, idx) => (
                <div key={item.id} className="bg-[#0a1120] border border-slate-800 rounded-3xl p-6 hover:border-blue-500/30 transition-all group">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                        {item.id === "mfa" ? <Key size={20} /> : item.id === "skimming" ? <Terminal size={20} /> : item.id === "custom" ? <ShieldCheck size={20} /> : <Lock size={20} />}
                      </div>
                      {item.title}
                    </h3>
                    <span className={`text-[10px] font-black px-2 py-1 rounded border ${
                      item.impact === "CRÍTICO" ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-orange-500/10 text-orange-400 border-orange-500/20"
                    }`}>
                      {item.impact}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-4 mb-6">
                    <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Padrão v3.2.1</p>
                      <p className="text-xs text-slate-400">{item.v3_rule}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                      <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">O Salto v4.0</p>
                      <p className="text-xs text-white font-medium leading-relaxed">{item.v4_rule}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-bold bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10">
                    <ShieldCheck size={14} /> {item.benefit}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-orange-500/5 border border-orange-500/20 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-400 shrink-0">
                <History size={32} />
              </div>
              <div>
                <h4 className="text-white font-bold mb-1">Prazo de Transição</h4>
                <p className="text-sm text-slate-400 leading-relaxed">
                  A versão 3.2.1 expirou em Março de 2024. A partir de agora, as avaliações já devem seguir a v4.0. Requisitos marcados como "Best Practice" tornam-se mandatórios em Março de 2025.
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="saq"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
             {/* Opções de Escopo (O que já existia) */}
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { id: "api", label: "Captura via API Própria", icon: AlertTriangle, desc: "Servidor acessa PAN" },
                { id: "js", label: "JavaScript / React", icon: Cpu, desc: "Front-end captura e envia" },
                { id: "iframe", label: "iFrame / Hosted Page", icon: Shield, desc: "Provedor T1 faz captura" },
                { id: "token", label: "Network Token API", icon: Key, desc: "Trafega apenas Tokens" },
              ].map(item => {
                const isSelected = activeScenario === item.id;
                const Icon = item.icon;
                const color = PCI_SCENARIOS[item.id].color;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveScenario(item.id)}
                    className={`p-4 rounded-xl border text-left transition-all ${isSelected ? "" : "hover:bg-[#0a1120]"}`}
                    style={{
                      borderColor: isSelected ? color : "rgba(255,255,255,0.06)",
                      background: isSelected ? PCI_SCENARIOS[item.id].bg : "rgba(255,255,255,0.02)",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1" style={{ color: isSelected ? color : "var(--muted-foreground)" }}>
                       <Icon size={16} />
                       <span className="font-bold text-xs text-white">{item.label}</span>
                    </div>
                    <p className="text-[10px] text-slate-500">{item.desc}</p>
                  </button>
                );
              })}
            </div>

            {/* Resultados do Escopo */}
            <div className="p-8 rounded-[2rem] border border-slate-800 bg-[#0a1120]">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-4xl font-black" style={{ color: data.color }}>{data.saq}</h2>
                    <span className="px-3 py-1 text-xs font-bold rounded-full" style={{ background: data.bg, color: data.color, border: `1px solid ${data.border}` }}>
                      {data.reqCount} Requisitos
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed max-w-xl">
                    {data.description}
                  </p>
                </div>
                <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Custo de Auditoria</p>
                  <p className="text-sm font-bold text-white">
                    {data.saq === "SAQ D" ? "R$ 50k - 200k / ano" : "R$ 5k - 20k / ano"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-8">
                <div className="space-y-4">
                  <h3 className="text-xs uppercase tracking-wider font-bold text-slate-500 flex items-center gap-2">
                    <ShieldAlert size={14} /> Dados em Risco (Req. 3)
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-black/20 p-4 rounded-2xl border border-slate-800">
                      <span className="text-sm font-bold text-slate-200">PAN Estocado / Transitado</span>
                      {data.panStored ? <XCircle size={18} className="text-red-400" /> : <CheckCircle2 size={18} className="text-emerald-400" />}
                    </div>
                    <div className="flex items-center justify-between bg-black/20 p-4 rounded-2xl border border-slate-800">
                      <span className="text-sm font-bold text-slate-200">Network Tokens (VTS/MDES)</span>
                      {data.networkTokens ? <CheckCircle2 size={18} className="text-emerald-400" /> : <XCircle size={18} className="text-red-400" />}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs uppercase tracking-wider font-bold text-slate-500 flex items-center gap-2">
                    <Cpu size={14} /> Testes de Segurança (Req. 11)
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-black/20 p-4 rounded-2xl border border-slate-800">
                      <span className="text-sm font-bold text-slate-200">ASV Scans</span>
                      {data.asvScans ? <span className="text-xs font-bold px-2 py-1 bg-amber-500/20 text-amber-400 rounded-md">Trimestral</span> : <span className="text-xs text-emerald-400">Isento</span>}
                    </div>
                    <div className="flex items-center justify-between bg-black/20 p-4 rounded-2xl border border-slate-800">
                      <span className="text-sm font-bold text-slate-200">Penetration Testing</span>
                      {data.penTest ? <span className="text-xs font-bold px-2 py-1 bg-red-500/20 text-red-500 rounded-md">Anual</span> : <span className="text-xs text-emerald-400">Isento</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Guia: BIN de 8 Dígitos vs PCI DSS ── */}
      <section className="p-8 rounded-[3rem] bg-indigo-500/5 border border-indigo-500/20 space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Cpu size={120} className="text-indigo-400" />
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
            <Shield size={32} />
          </div>
          <div>
            <h3 className="text-xl font-black text-white uppercase tracking-tight">O Impacto dos BINs de 8 Dígitos</h3>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Compliance & Segurança de Dados</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
          <div className="space-y-4">
            <p className="text-sm text-slate-400 leading-relaxed">
              Desde abril de 2022, a expansão do BIN para 8 dígitos é mandatória. No entanto, existe uma confusão comum sobre o <strong>truncamento de dados</strong> para fins de PCI DSS.
            </p>
            <div className="p-5 rounded-2xl bg-[#0a1120] border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 size={16} />
                <span className="text-xs font-bold uppercase tracking-widest">A Regra de Ouro (SDP)</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed italic">
                "Empresas não são obrigadas a mudar para o formato '8+4' imediatamente se o mascaramento '6+4' (primeiros 6 e últimos 4) ainda atende ao seu negócio."
              </p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                As regras do programa <strong>Site Data Protection (SDP)</strong> da Mastercard permitem continuar com 6+4 sem alterações para fins de auditoria, desde que o PAN completo não seja exposto.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle size={16} className="text-orange-500" /> Pontos de Atenção PCI v4.0
            </h4>
            <ul className="space-y-3">
              {[
                { title: "Truncamento 8+4", desc: "Aumenta o risco de exposição do PAN se não houver controles rígidos de acesso." },
                { title: "Risco de Identificação", desc: "Com 8 dígitos de BIN e 4 finais, sobram poucos dígitos para anonimização real." },
                { title: "Legacy Systems", desc: "Verifique se seu banco de dados suporta o campo de BIN expandido sem truncar dados reais." }
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-slate-300">{item.title}</p>
                    <p className="text-[10px] text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Footer Educativo */}
      <div className="p-6 rounded-3xl bg-blue-600/5 border border-blue-600/10 flex items-start gap-4">
        <Info size={20} className="text-blue-400 shrink-0 mt-1" />
        <div>
          <p className="text-xs text-slate-400 leading-relaxed">
            <strong>O que é o PCI DSS?</strong> O Payment Card Industry Data Security Standard é o padrão global de segurança para qualquer empresa que processe, armazene ou transmita dados de cartões. O não cumprimento (Non-compliance) pode gerar multas mensais de **$5.000 a $100.000** aplicadas pelas bandeiras.
          </p>
        </div>
      </div>
    </div>
  );
}
