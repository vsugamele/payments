import React from 'react';
import Link from 'next/link';
import OutgoingClient from './OutgoingClient';

export const metadata = {
  title: 'Arquitetura & Fluxos de Outgoing (Tabelas Separadas) | Payments Compliance',
  description:
    'Mapa completo e separado de cada tabela de Outgoing (Visa Base II TCR 0 a TCR E, Elo Liquidação 26.2 B0/00 a 09/BZ, Mastercard IPM MTI 1644/1240/1442/1740), com o que é cada uma, o que tem nela, layout posicional, obrigatório vs condicional, mapa de bits e relatórios do dia a dia.',
};

export default function OutgoingArchitecturePage() {
  return (
    <main className="min-h-screen bg-[#020617] text-slate-100 pb-20">
      {/* Header Editorial Limpo e Legível */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-300 hover:border-blue-500 transition-colors"
            >
              ← Voltar ao Cockpit
            </Link>
            <div>
              <div className="flex items-center gap-2.5 mb-0.5">
                <span className="text-xs font-extrabold uppercase tracking-wider text-blue-400">
                  Clearing & Liquidação (Outgoing)
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
                  Manuais Oficiais 2026
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Tabelas de Outgoing Separadas, Fluxos, Mapa de Bits & Relatórios
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/compliance/arquivos"
              className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-300 hover:border-blue-500 transition-colors"
            >
              Simulador de Mensagens
            </Link>
            <Link
              href="/comparativo"
              className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-300 hover:border-blue-500 transition-colors"
            >
              Autorização × Clearing
            </Link>
          </div>
        </div>
      </header>

      {/* Container Principal com Respiro Visual */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <OutgoingClient />
      </div>
    </main>
  );
}
