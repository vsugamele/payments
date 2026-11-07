import React from 'react';
import Link from 'next/link';
import OutgoingClient from './OutgoingClient';

export const metadata = {
  title: 'Arquitetura & Fluxos de Outgoing (Tabelas Separadas) | Payments Compliance',
  description:
    'Mapa completo e separado de cada tabela de Outgoing (Visa Base II TCR 0 a TCR E, Elo Liquidação 26.2 B0/00 a 09/BZ, Mastercard IPM MTI 1644/1240/1442/1740), com o que é cada uma, o que tem nela, layout posicional, obrigatório vs condicional e 8 fluxos desenhados passo a passo.',
};

export default function OutgoingArchitecturePage() {
  return (
    <main className="min-h-screen bg-[#020617] text-slate-100">
      {/* Top Bar */}
      <header className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
            >
              ← Cockpit (/admin)
            </Link>
            <div className="h-4 w-px bg-slate-800 hidden sm:block" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-widest text-blue-400">
                  Módulo 02 · Clearing & Liquidação
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
                  Manuais Abril–Agosto/2026
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-black text-white">
                Arquitetura de Outgoing: Tabelas Separadas, Layouts (M vs C) & Desenho de Cada Fluxo
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/compliance/arquivos"
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:border-blue-500/40 hover:text-white transition-colors"
            >
              Simulador de Mensagens
            </Link>
            <Link
              href="/compliance/gcms"
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:border-emerald-500/40 hover:text-white transition-colors"
            >
              Mastercard GCMS Deep Dive
            </Link>
            <Link
              href="/comparativo"
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:border-amber-500/40 hover:text-white transition-colors"
            >
              Comparativo Autorização × Clearing
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <OutgoingClient />
      </div>
    </main>
  );
}
