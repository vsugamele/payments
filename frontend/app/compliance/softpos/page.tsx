import SoftPOSClient from "./SoftPOSClient";
import { SmartphoneNfc, ChevronLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "SoftPOS & Tap to Phone: O Fim do Hardware — VS Payments",
  description: "Entenda como transformar qualquer smartphone em um terminal de pagamento seguro seguindo os padrões PCI CPOC e MPOC.",
};

export default function SoftPOSPage() {
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
                <SmartphoneNfc size={28} style={{ color: "#60a5fa" }} />
              </div>
              <div>
                <p className="section-eyebrow mb-1" style={{ color: "#60a5fa" }}>COTS Payment Technology</p>
                <h1 className="font-bold text-white text-3xl md:text-4xl mb-2" style={{ letterSpacing: "-0.02em" }}>
                  SoftPOS: Tap to Phone <br className="hidden md:block" /> & Mobile Acceptance
                </h1>
                <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
                  A tecnologia que dispensa a maquininha. Explore como a atestação de segurança e o processamento em nuvem permitem transformar celulares em terminais EMV.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-slate-800">
               <ShieldCheck size={16} className="text-blue-400" />
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                 PCI MPOC Certified
               </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Conteúdo ── */}
      <div className="mx-auto max-w-6xl px-6 pt-10">
        <SoftPOSClient />
      </div>
    </div>
  );
}
