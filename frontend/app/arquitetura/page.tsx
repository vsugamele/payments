'use client';

import React, { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import FlowDiagram from '@/components/FlowEcosystem/FlowDiagram';
import { OutgoingServerTopologyBlueprint } from '@/app/compliance/outgoing/OutgoingServerTopologyBlueprint';
import { OutgoingBrandId } from '@/data/outgoing-tables-flows';

export default function ArquiteturaPage() {
  const router = useRouter();
  const [activeView, setActiveView] = useState<'c4_topology' | 'node_graph' | 'both'>('c4_topology');

  const handleSelectOutgoingTable = (brand: OutgoingBrandId, tableId: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('vs_workbench_brand', brand);
    }
    router.push(`/compliance/outgoing?tab=tables&brand=${brand}&table=${tableId}`);
  };

  return (
    <div className="w-full h-full p-4 md:p-6 lg:p-8 max-w-[1650px] mx-auto space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/30 text-[10px] font-mono font-bold uppercase tracking-widest text-blue-400 mb-1.5">
            <span>🖧 ESTAÇÃO 1 · INFRAESTRUTURA, SERVIDORES, HSM & INTEGRAÇÕES DE BANDEIRAS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            Topologia de Servidores, Redes & Protocolos (Modelo C4)
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-4xl">
            Mapeamento completo de onde cada servidor fica (Zonas PCI-DSS 1 a 5), como se conecta (Sockets ISO 8583, HSM Thales PayShield, Visa EAS/DEX/EP747, Mastercard MIP/MFE, Elo STI/SFTP, Amex GNS/CAS e RSFN CIP/SLC) e o que trafega em cada cabo.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {[
            { id: 'c4_topology', label: '1. Blueprint C4 (Servidores, HSM & Cabos)' },
            { id: 'node_graph', label: '2. Grafo Interativo (Canvas de Nós)' },
            { id: 'both', label: '3. Exibir Ambos' },
          ].map((btn) => (
            <button
              key={btn.id}
              type="button"
              onClick={() => setActiveView(btn.id as 'c4_topology' | 'node_graph' | 'both')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                activeView === btn.id
                  ? 'bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-950/50'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-600'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {(activeView === 'c4_topology' || activeView === 'both') && (
        <OutgoingServerTopologyBlueprint
          initialBrand="all"
          onSelectTable={handleSelectOutgoingTable}
        />
      )}

      {(activeView === 'node_graph' || activeView === 'both') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-wider text-blue-400">
              Grafo Interativo de Atores & Mensagens (Canvas Drag & Zoom)
            </h2>
          </div>
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-96 text-muted-foreground text-sm">
                Carregando diagrama…
              </div>
            }
          >
            <FlowDiagram />
          </Suspense>
        </div>
      )}
    </div>
  );
}
