import AftClient from "./AftClient";
import { Landmark, ChevronLeft, ShieldAlert } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "AFT: Account Funding Transactions — VS Payments",
  description: "Módulo interativo de simulação de transações de aporte de conta (AFT) conforme regras oficiais Visa Direct.",
};

export default function AftPage() {
  return (
    <div style={{ background: "#030711", minHeight: "100vh" }} className="pb-20">
      {/* ── Header ── */}
      <div 
        className="dot-grid"
        style={{ 
          borderBottom: "1px solid #0f1a2e",
          background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(234,179,8,0.07) 0%, transparent 65%)",
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
                  background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}
              >
                <Landmark size={28} style={{ color: "#eab308" }} />
              </div>
              <div>
                <p className="section-eyebrow mb-1" style={{ color: "#eab308" }}>Visa Direct / Push Payments</p>
                <h1 className="font-bold text-white text-3xl md:text-4xl mb-2" style={{ letterSpacing: "-0.02em" }}>
                  AFT: Account Funding Transactions
                </h1>
                <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
                  Simule transações de aporte de saldo para carteiras digitais, corretoras e apostas. Valide os indicadores ISO 8583 e os códigos de BAI obrigatórios.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-slate-800">
               <ShieldAlert size={16} className="text-yellow-400" />
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                 Visa Direct Compliant
               </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Conteúdo ── */}
      <div className="mx-auto max-w-6xl px-6 pt-10">
        <AftClient />
      </div>
    </div>
  );
}
