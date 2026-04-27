"use client";

import FlowDiagram from "@/components/FlowEcosystem/FlowDiagram";

export default function ArquiteturaPage() {
  return (
    <div className="w-full h-full p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          SaaS Visual de Arquitetura
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Explore o fluxo completo de transação (Autorização → Clearing → Liquidação) comparando as malhas VisaNet (VSS) e Banknet (IPM).
        </p>
      </div>
      
      <FlowDiagram />
    </div>
  );
}
