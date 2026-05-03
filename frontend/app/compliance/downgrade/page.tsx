import DowngradeClient from "./DowngradeClient";
import { TrendingDown, ChevronLeft, Info } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Downgrade Lab: Otimização de Intercâmbio — VS Payments",
  description: "Descubra quanto sua operação perde por ineficiência técnica. Simule downgrades de intercâmbio e aprenda a proteger sua margem de lucro.",
};

export default function DowngradePage() {
  return (
    <div style={{ background: "#030711", minHeight: "100vh" }} className="pb-20">
      {/* ── Header ── */}
      <div 
        className="dot-grid"
        style={{ 
          borderBottom: "1px solid #0f1a2e",
          background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(239,68,68,0.1) 0%, transparent 65%)",
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
                  background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}
              >
                <TrendingDown size={28} style={{ color: "#f87171" }} />
              </div>
              <div>
                <p className="section-eyebrow mb-1" style={{ color: "#f87171" }}>Interchange Optimization</p>
                <h1 className="font-bold text-white text-3xl md:text-4xl mb-2" style={{ letterSpacing: "-0.02em" }}>
                  Downgrade Lab <br className="hidden md:block" /> & Recuperação de Margem
                </h1>
                <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
                  Aprenda a caçar as perdas invisíveis. Descubra como erros de mensageria e atrasos no clearing corroem o lucro real da adquirente.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-slate-800">
               <Info size={16} className="text-slate-500" />
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                 Diferença entre o Lucro e o Prejuízo
               </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Conteúdo ── */}
      <div className="mx-auto max-w-6xl px-6 pt-10">
        <DowngradeClient />
      </div>
    </div>
  );
}
