import TokenLifecycleClient from "./TokenLifecycleClient";
import DafSimulator from "@/components/DafSimulator";
import TermTooltip from "@/components/TermTooltip";
import { ArrowRight, BookOpen, ShieldCheck, Key, Zap, ChevronLeft } from "lucide-react";
import Link from "next/link";
import RuleReference from "@/components/RuleReference";

export const metadata = {
  title: "Tokenização & Ciclo de Vida: O Futuro do PAN | VS Payments",
  description: "Aprenda por que o Token é 'vivo' e como ele garante taxas de aprovação maiores e proteção contra expiração de cartões.",
};

export default function TokenizacaoPage() {
  return (
    <div style={{ background: "#030711", minHeight: "100vh" }} className="pb-20">
      {/* ── Header Premium ── */}
      <div 
        className="dot-grid"
        style={{ 
          borderBottom: "1px solid #0f1a2e",
          background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(59,130,246,0.12) 0%, transparent 65%)",
          padding: "4rem 1.5rem 3.5rem"
        }}
      >
        <div className="mx-auto max-w-6xl">
          <Link 
            href="/compliance" 
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-6 transition-colors"
          >
            <ChevronLeft size={14} /> Voltar ao Command Center
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex items-start gap-4">
              <div 
                style={{ 
                  width: 56, height: 56, borderRadius: "1.2rem", flexShrink: 0,
                  background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}
              >
                <Key size={26} style={{ color: "#60a5fa" }} />
              </div>
              <div>
                <p className="section-eyebrow mb-1">Tecnologia de Segurança</p>
                <h1 className="font-bold text-white text-3xl md:text-4xl mb-2" style={{ letterSpacing: "-0.02em" }}>
                  Tokenização & <br className="hidden md:block" /> Ciclo de Vida (VTS/MDES)
                </h1>
                <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
                  O fim do número estático. Entenda como a substituição do PAN por tokens criptográficos aumenta a segurança e a taxa de aprovação em recorrências.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-slate-800">
               <Zap size={16} className="text-blue-400" />
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                 +7% Approval Rate em Recorrência
               </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 pt-12 space-y-24">
        
        {/* ── Módulo 1: O Ciclo de Vida Interativo ── */}
        <section>
          <div className="mb-10 max-w-3xl">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              1. Laboratório de Ciclo de Vida
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Diferente de um número de cartão físico, um token pode ser <strong>suspenso</strong>, <strong>resumido</strong> ou <strong>atualizado</strong> sem que o cliente precise digitar nada. Experimente os estados abaixo para entender a lógica das bandeiras.
            </p>
          </div>
          <TokenLifecycleClient />
        </section>

        {/* ── Módulo 2: DAF & Isenção de 3DS ── */}
        <section className="pt-12 border-t border-slate-900">
          <div className="mb-10 max-w-3xl">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              2. Simulador DAF (Digital Auth Framework)
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              O DAF permite que transações de carteiras digitais (Apple Pay/Google Pay) tenham <strong>Liability Shift</strong> imediato. Isso ocorre porque a biometria do celular substitui a necessidade do desafio 3DS.
            </p>
          </div>
          <DafSimulator />
        </section>

        {/* ── Seção de Referência Normativa ── */}
        <section className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-10">
           <div className="flex items-center gap-3 mb-8">
             <BookOpen className="text-slate-500" size={20} />
             <h3 className="text-sm font-bold text-white uppercase tracking-widest">Fundamentos da Tokenização</h3>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-sm text-slate-400 leading-relaxed">
             <div className="space-y-4">
               <p>
                 <strong className="text-white">O Fim do PAN em Claro:</strong> No e-commerce tradicional, um cartão é digitado e o lojista processa o <TermTooltip term="PAN" definition="Primary Account Number" />. Sem o auxílio do 3DS, qualquer tentativa de fraude gera um Chargeback cujo ônus (Liability) é inteiramente do Lojista.
               </p>
               <p>
                 <strong className="text-white">Criptogramas:</strong> A Tokenização Cloud e o Apple Pay mudaram o jogo. Em vez de números expostos, o emissor gera um <em className="text-blue-400">Cryptogram</em> de uso único atrelado ao dispositivo.
               </p>
             </div>
             <div className="space-y-4 p-6 bg-slate-900 border border-slate-800 rounded-2xl">
               <div className="flex items-center gap-2 text-blue-400 font-bold mb-2">
                 <ShieldCheck size={16} /> Regra de Ouro (TIDI/TAF)
               </div>
               <p className="text-xs">
                 Para transações subsequentes de Cloud Tokens sem novo desafio, o adquirente deve passar o <strong>TIDI</strong> (Token ID Indicator) na mensageria ISO para provar a validade da relação Merchant-Token. <RuleReference manual="Visa Core Rules" chapter="Chapter 8: Tokenization" label="VCR: Tokenization" />
               </p>
             </div>
           </div>
        </section>

      </div>
    </div>
  );
}
