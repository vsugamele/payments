import GCMSClient from "./GCMSClient";
import { Database, ChevronLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "GCMS: Global Clearing Management System — VS Payments",
  description: "Entenda a arquitetura de clearing da Mastercard. Explore as tabelas T165, T168 e o fluxo de arquivos IPM para liquidação global.",
};

export default function GCMSPage() {
  return (
    <div style={{ background: "#030711", minHeight: "100vh" }} className="pb-20">
      {/* ── Header ── */}
      <div 
        className="dot-grid"
        style={{ 
          borderBottom: "1px solid #0f1a2e",
          background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(168,85,247,0.12) 0%, transparent 65%)",
          padding: "4rem 1.5rem 3rem"
        }}
      >
        <div className="mx-auto max-w-6xl">
          <Link 
            href="/compliance" 
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-6 transition-colors"
          >
            <ChevronLeft size={14} /> Voltar ao Command Center
          </Link>

          <div className="flex items-start gap-4 mb-4">
            <div 
              style={{ 
                width: 48, height: 48, borderRadius: "0.875rem", flexShrink: 0,
                background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}
            >
              <Database size={22} style={{ color: "#a78bfa" }} />
            </div>
            <div>
              <p className="section-eyebrow mb-1">Infraestrutura de Rede</p>
              <h1 className="font-bold text-white text-2xl md:text-3xl mb-2" style={{ letterSpacing: "-0.02em" }}>
                GCMS: O Coração do Clearing Global
              </h1>
              <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
                O Global Clearing Management System é a engine que processa as mensagens financeiras da Mastercard. 
                Aprenda como os arquivos IPM são validados e como as Tabelas de Valores (T-Tables) ditam o settlement.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Conteúdo ── */}
      <div className="mx-auto max-w-6xl px-6 pt-10">
        <GCMSClient />
      </div>
    </div>
  );
}
