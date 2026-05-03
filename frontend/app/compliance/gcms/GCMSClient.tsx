"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Database, 
  FileJson, 
  ArrowRight, 
  Cpu, 
  Settings, 
  Table as TableIcon,
  Info,
  Zap,
  Server,
  FileCode,
  ShieldCheck,
  ChevronRight,
  Clock,
  DollarSign,
  Terminal
} from "lucide-react";

import gcmsData from "@/data/gcms-tables.json";
import GcmsTester from "@/components/gcms/GcmsTester";

export default function GCMSClient() {
  const [selectedTable, setSelectedTable] = useState(gcmsData[0]);

  return (
    <div className="space-y-10">
      {/* ── Introdução Pedagógica ao GCMS ── */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <Cpu size={20} className="text-blue-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-widest">O Ciclo do Clearing (Noturno)</h2>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed max-w-3xl">
            Diferente da autorização (que é em milissegundos), o **GCMS** processa arquivos em lotes (Batches). 
            É aqui que a Mastercard recebe os arquivos **IPM (Integrated Product Messages)** do adquirente, 
            valida cada transação contra as tabelas normativas e decide o valor final de liquidação.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <FileCode size={14} /> Inbound (Presentment)
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                O Adquirente envia as vendas confirmadas. O GCMS verifica se o IRD condiz com o MCC e produto.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider">
                <FileJson size={14} /> Outbound (Clearing)
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                O GCMS envia ao Emissor os detalhes para débito na conta do cliente e crédito ao adquirente.
              </p>
            </div>
          </div>
        </div>

        {/* Card de Status do Sistema */}
        <div className="bg-[#0a1120] border border-slate-800 rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Mastercard Network Status</p>
            <div className="flex items-center justify-between py-2 border-b border-slate-800/50">
              <span className="text-xs text-slate-400">Sistema</span>
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> OPERACIONAL
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-800/50">
              <span className="text-xs text-slate-400">Próxima Janela</span>
              <span className="text-xs font-mono text-white">23:00 GMT-3</span>
            </div>
          </div>
          <div className="mt-6 flex items-center gap-3 p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
            <Clock size={16} className="text-blue-400" />
            <p className="text-[10px] text-blue-300 font-medium leading-tight">
              Os arquivos IPM são processados em 6 janelas diárias de clearing global.
            </p>
          </div>
        </div>
      </section>

      {/* ── Explorador de Tabelas ── */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <TableIcon size={18} className="text-purple-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-widest">Explorador de Tabelas GCMS</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Menu Lateral */}
          <div className="lg:col-span-4 space-y-2">
            {gcmsData.map((t) => {
              const isActive = selectedTable.table === t.table;
              return (
                <button
                  key={t.table}
                  onClick={() => setSelectedTable(t)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between group ${
                    isActive 
                      ? "bg-purple-600/10 border-purple-500/50 text-white" 
                      : "bg-slate-900/40 border-slate-800 text-slate-500 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-black text-xs border ${
                      isActive ? "bg-purple-500 text-white border-purple-400" : "bg-slate-800 border-slate-700 group-hover:bg-slate-700"
                    }`}>
                      {t.table}
                    </div>
                    <div>
                      <p className="text-xs font-bold leading-none mb-1">{t.name}</p>
                      <p className="text-[10px] opacity-60 font-medium uppercase tracking-wider">{t.usage}</p>
                    </div>
                  </div>
                  {isActive && <ChevronRight size={16} className="text-purple-400" />}
                </button>
              );
            })}
          </div>

          {/* Área de Conteúdo da Tabela */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedTable.table}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-[#0a1120] border border-slate-800 rounded-3xl overflow-hidden"
              >
                {/* Header do Detalhe */}
                <div className="p-8 border-b border-slate-800 bg-gradient-to-br from-purple-500/5 to-transparent">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="font-mono text-3xl font-black text-purple-400">{selectedTable.table}</span>
                    <div className="h-6 w-px bg-slate-800" />
                    <h3 className="text-xl font-bold text-white">{selectedTable.name}</h3>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed mb-6">
                    {selectedTable.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-3">
                    <div className="px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                      <Zap size={12} /> Impacto: {selectedTable.impact.split(':')[0]}
                    </div>
                    <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                      <Settings size={12} /> Uso: {selectedTable.usage}
                    </div>
                  </div>
                </div>

                {/* Campos da Tabela */}
                <div className="p-8 space-y-6">
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Database size={12} /> Estrutura de Campos (Payload)
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {selectedTable.fields.map((field) => (
                        <div key={field} className="px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-500/40" />
                          {field}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-orange-500/5 border border-orange-500/20 flex items-start gap-3">
                    <Info size={16} className="text-orange-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-orange-300 mb-1">Dica Educacional</p>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {selectedTable.impact}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Footer / CTA */}
                <div className="px-8 py-5 bg-slate-900/50 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Referência: Global Clearing Guide v24.1</span>
                  <button className="text-xs font-bold text-purple-400 flex items-center gap-2 hover:text-purple-300 transition-colors">
                    Ver manual técnico <ChevronRight size={14} />
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ── GCMS Edit Rule Tester ── */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <Terminal size={18} className="text-purple-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-widest">Simulador Forense: Rejeição T168</h2>
        </div>
        <p className="text-sm text-slate-400 leading-relaxed max-w-3xl mb-4">
          O principal desafio operacional do GCMS são os <strong>Edits (Rejeições)</strong>. O adquirente tenta cobrar um intercâmbio (IRD), mas a Mastercard rejeita ou aplica um downgrade porque os dados da transação (POS Entry Mode, ECI) são incompatíveis. Teste os cenários abaixo.
        </p>
        <GcmsTester />
      </section>

      {/* ── Guia de Orientação: O Workflow de Auditoria ── */}
      <section className="space-y-8 bg-[#0a1120] border border-blue-500/20 rounded-[2.5rem] p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] -z-10" />
        
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-[0.2em]">
            Guia de Orientação Forense
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Como Cruzar os Dados do Clearing</h2>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto">
            Para auditar uma transação Mastercard, você não olha apenas uma tabela. Você segue o fluxo de interconectividade abaixo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {/* Linha conectora (Desktop) */}
          <div className="absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-slate-800 to-transparent hidden md:block" />

          {[
            {
              step: "01",
              title: "Identificação",
              tables: ["IP0030", "IP0016"],
              desc: "Comece pelo BIN. O GCMS localiza o emissor e o produto (Gold, Black, etc) para saber qual 'range' de taxas é permitido."
            },
            {
              step: "02",
              title: "Habilitação",
              tables: ["T161", "T162"],
              desc: "Cruze com o Programa de Intercâmbio. O lojista (MCC) e o adquirente participam de programas especiais (Educação, Gov)?"
            },
            {
              step: "03",
              title: "Qualificação",
              tables: ["T160", "T164"],
              desc: "Verifique o IRD. A transação tem os dados necessários (ECI, 3DS) para se qualificar para a melhor taxa ou sofrerá downgrade?"
            },
            {
              step: "04",
              title: "Execução",
              tables: ["T165", "T145"],
              desc: "Aplicação final da taxa e mapeamento para o faturamento MCBS. O ciclo se fecha com o valor líquido de liquidação."
            }
          ].map((item, idx) => (
            <div key={idx} className="relative z-10 p-6 rounded-3xl bg-slate-900/40 border border-slate-800 hover:border-blue-500/30 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-black text-lg mb-6 group-hover:scale-110 transition-transform">
                {item.step}
              </div>
              <h4 className="text-sm font-bold text-white mb-2">{item.title}</h4>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {item.tables.map(t => (
                  <span key={t} className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-400 border border-slate-700">{t}</span>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 p-6 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Info size={20} className="text-blue-400 shrink-0" />
            <p className="text-xs text-slate-400 leading-relaxed">
              <strong>Dica de Especialista:</strong> Sempre valide o <span className="text-blue-300">IP0008 (PDS Attributes)</span> em transações e-commerce. É lá que o dado de 3DS 2.0 é cruzado com a tabela T164 para garantir o IRD AW.
            </p>
          </div>
          <button className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-white text-[10px] font-bold uppercase tracking-wider transition-colors shrink-0">
            Download do Guia PDF
          </button>
        </div>
      </section>

      {/* ── Visual Flow: Do Log ao GCMS ── */}
      <section className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-8">
        <h3 className="text-center text-sm font-bold text-white uppercase tracking-widest mb-10">O Caminho do Dado Financeiro</h3>
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 max-w-4xl mx-auto relative">
           {/* Conexões (Desktop) */}
           <div className="absolute top-1/2 left-0 w-full h-px bg-slate-800 -translate-y-1/2 hidden md:block" style={{ zIndex: 0 }} />
           
           {[
             { step: "AUTH", icon: Zap, label: "0100 (Real-time)", desc: "Captura do Approval Code" },
             { step: "BATCH", icon: FileCode, label: "IPM File", desc: "Consolidação de transações" },
             { step: "GCMS", icon: Cpu, label: "Clearing", desc: "Aplicação de T165/T168", active: true },
             { step: "BANK", icon: DollarSign, label: "Settlement", desc: "Movimentação financeira" }
           ].map((s, i) => (
             <div key={i} className="relative z-10 flex flex-col items-center text-center space-y-3 group">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${
                  s.active ? "bg-purple-600 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.3)]" : "bg-slate-900 border-slate-800 group-hover:border-slate-600"
                }`}>
                  <s.icon size={24} className={s.active ? "text-white" : "text-slate-500"} />
                </div>
                <div>
                  <p className={`text-xs font-bold ${s.active ? "text-white" : "text-slate-400"}`}>{s.label}</p>
                  <p className="text-[10px] text-slate-500 max-w-[100px]">{s.desc}</p>
                </div>
             </div>
           ))}
        </div>
      </section>
    </div>
  );
}
