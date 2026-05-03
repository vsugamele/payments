import VisaInfraClient from "./VisaInfraClient";
import { Server, ChevronLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Infraestrutura Core Visa: VCX, VSS & PSR — VS Payments",
  description: "Explore o coração tecnológico da Visa: do gerenciamento de arquivos no VCX ao motor de liquidação VSS e as regras PSR.",
};

export default function VisaInfraPage() {
  return (
    <div style={{ background: "#030711", minHeight: "100vh" }} className="pb-20">
      {/* ── Header ── */}
      <div 
        className="dot-grid"
        style={{ 
          borderBottom: "1px solid #0f1a2e",
          background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(59,130,246,0.1) 0%, transparent 65%)",
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
                <Server size={28} style={{ color: "#60a5fa" }} />
              </div>
              <div>
                <p className="section-eyebrow mb-1" style={{ color: "#60a5fa" }}>Core Systems & Governance</p>
                <h1 className="font-bold text-white text-3xl md:text-4xl mb-2" style={{ letterSpacing: "-0.02em" }}>
                  A Jornada do Settlement: <br className="hidden md:block" /> VCX, VSS & PSR
                </h1>
                <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
                  Descubra os bastidores da liquidação financeira global. Do portal de clearing ao motor de cálculo que movimenta trilhões.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-slate-800">
               <ShieldCheck size={16} className="text-blue-400" />
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                 Visa Systemic Integrity
               </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Conteúdo ── */}
      <div className="mx-auto max-w-6xl px-6 pt-10">
        <VisaInfraClient />
      </div>
    </div>
  );
}
