import PayoutClient from "./PayoutClient";
import { Zap, ChevronLeft, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Push Payments: Visa Direct & MC Send — VS Payments",
  description: "O futuro dos pagamentos instantâneos. Explore o fluxo AFT/OCT e aprenda como liquidar valores em tempo real via rede de cartões.",
};

export default function PayoutPage() {
  return (
    <div style={{ background: "#030711", minHeight: "100vh" }} className="pb-20">
      {/* ── Header ── */}
      <div 
        className="dot-grid"
        style={{ 
          borderBottom: "1px solid #0f1a2e",
          background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(16,185,129,0.1) 0%, transparent 65%)",
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
                  background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}
              >
                <ArrowUpRight size={28} style={{ color: "#10b981" }} />
              </div>
              <div>
                <p className="section-eyebrow mb-1" style={{ color: "#10b981" }}>Real-time Money Movement</p>
                <h1 className="font-bold text-white text-3xl md:text-4xl mb-2" style={{ letterSpacing: "-0.02em" }}>
                  Push Payments: <br className="hidden md:block" /> Visa Direct & MC Send
                </h1>
                <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
                  Transforme o cartão em um trilho de depósito instantâneo. Aprenda como o ecossistema de Payouts funciona para Gig Economy, Gaming e P2P.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-slate-800">
               <Zap size={16} className="text-emerald-400" />
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                 Mandato Fast Funds: &lt; 30 min
               </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Conteúdo ── */}
      <div className="mx-auto max-w-6xl px-6 pt-10">
        <PayoutClient />
      </div>
    </div>
  );
}
