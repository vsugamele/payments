import TPEClient from "./TPEClient";
import { Zap, ChevronLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "TPE: Transaction Processing Excellence — VS Payments",
  description: "Monitore a eficiência da sua autorização. Evite multas da Mastercard por excesso de retentativas e má qualidade de dados ISO 8583.",
};

export default function TPEPage() {
  return (
    <div style={{ background: "#030711", minHeight: "100vh" }} className="pb-20">
      {/* ── Header ── */}
      <div 
        className="dot-grid"
        style={{ 
          borderBottom: "1px solid #0f1a2e",
          background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(37,99,235,0.1) 0%, transparent 65%)",
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

          <div className="flex items-start gap-4 mb-4">
            <div 
              style={{ 
                width: 48, height: 48, borderRadius: "0.875rem", flexShrink: 0,
                background: "rgba(37,99,235,0.12)", border: "1px solid rgba(37,99,235,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}
            >
              <Zap size={22} style={{ color: "#3b82f6" }} />
            </div>
            <div>
              <p className="section-eyebrow mb-1">Qualidade de Autorização</p>
              <h1 className="font-bold text-white text-2xl md:text-3xl mb-2" style={{ letterSpacing: "-0.02em" }}>
                Programa TPE Mastercard
              </h1>
              <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
                O Transaction Processing Excellence monitora a integridade técnica da sua operação. 
                Não basta aprovar a venda; é preciso aprovar com os dados corretos e sem sobrecarregar a rede.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Conteúdo ── */}
      <div className="mx-auto max-w-6xl px-6 pt-10">
        <TPEClient />
      </div>
    </div>
  );
}
