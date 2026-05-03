import GlossarioClient from "./GlossarioClient";
import { BookMarked, ChevronLeft, Command } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Glossário Técnico de Pagamentos — VS Payments",
  description: "Dicionário normativo completo: de 3DS e VAMP até Tokenização e IRD. Entenda os termos técnicos da indústria de pagamentos.",
};

export default function GlossarioPage() {
  return (
    <div style={{ background: "#030711", minHeight: "100vh" }}>
      {/* ── Header ── */}
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
            href="/" 
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-6 transition-colors"
          >
            <ChevronLeft size={14} /> Voltar ao Início
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
                <BookMarked size={26} style={{ color: "#60a5fa" }} />
              </div>
              <div>
                <p className="section-eyebrow mb-1">Cérebro Normativo</p>
                <h1 className="font-bold text-white text-3xl md:text-4xl mb-2" style={{ letterSpacing: "-0.02em" }}>
                  Glossário Técnico <br className="hidden md:block" /> de Pagamentos
                </h1>
                <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
                  A enciclopédia definitiva do ecossistema. De siglas de mensageria ISO aos complexos programas de monitoramento das bandeiras.
                </p>
              </div>
            </div>

            {/* Hint Cmd+K */}
            <div className="hidden lg:flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/5 border border-slate-800">
               <Command size={14} className="text-slate-500" />
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pressione <kbd className="text-white">Cmd+K</kbd> em qualquer lugar</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Conteúdo ── */}
      <div className="mx-auto max-w-6xl px-6 pt-10">
        <GlossarioClient />
      </div>
    </div>
  );
}
