"use client";

import { useState } from "react";
import { Search, ShieldAlert, Crosshair, Map, DollarSign, ExternalLink } from "lucide-react";
import data from "@/data/bram-rules.json";

export default function BRAMClient() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = data.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.mccs.some(mcc => mcc.includes(searchTerm))
  );

  return (
    <div className="space-y-12">
      {/* Barra de Pesquisa */}
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <h2 className="text-3xl font-black text-foreground">Avaliador de Risco e Alta Regulamentação</h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Evite multas de até US$ 100.000. Selecione a operação do Lojista e descubra se o negócio dispara o radar do Business Risk Assessment and Mitigation (BRAM) ou recai sob o Merchant Registration Program (MRP) e o programa VIPR da Visa.
        </p>

        <div className="relative max-w-xl mx-auto shadow-2xl rounded-2xl overflow-hidden border border-border/50">
          <Search size={22} className="absolute left-4 top-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Pesquise: Farmácia, Apostas, Tabaco ou MCC (ex: 5967, 7995)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-background border-none py-4 pl-12 pr-4 text-base focus:ring-0 outline-none placeholder:text-muted-foreground/60 transition-all font-medium"
          />
        </div>
      </div>

      {/* Grid de Risco */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredData.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed rounded-2xl">
            Nenhum enquadramento restrito encontrado para '{searchTerm}'. Isso não exime a exigência de KYB normal.
          </div>
        ) : (
          filteredData.map((item) => {
            const isCritical = item.risk_level === "Crítico";
            
            return (
              <div key={item.id} className={`flex flex-col bg-code-bg rounded-2xl border p-5 transition-shadow hover:shadow-xl ${
                isCritical ? "border-red-500/30" : "border-border"
              }`}>
                {/* Header Card */}
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-2.5 rounded-xl border ${
                    isCritical ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                  }`}>
                    {isCritical ? <Crosshair size={22} /> : <ShieldAlert size={22} />}
                  </div>
                  <div className="flex gap-1.5 flex-wrap justify-end max-w-[150px]">
                     {item.mccs.map((mcc, idx) => (
                       <span key={idx} className="px-2 py-0.5 text-[10px] font-bold bg-background text-foreground rounded border border-border">
                         MCC {mcc}
                       </span>
                     ))}
                  </div>
                </div>

                <div className="mb-4">
                  <span className={`text-[10px] font-black uppercase tracking-wider mb-1 block ${
                    isCritical ? "text-red-500" : "text-amber-500"
                  }`}>
                    {item.category}
                  </span>
                  <h3 className="text-xl font-bold text-foreground mb-2 leading-tight">{item.name}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Warning Boxes */}
                <div className="mt-auto space-y-3 pt-4 border-t border-border/50">
                  <div className="flex items-start gap-2.5">
                    <DollarSign size={14} className="text-red-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-snug">
                      <strong className="text-foreground block mb-0.5">Penalidade Mastercard:</strong>
                      <span className="text-muted-foreground">{item.nc_assessment}</span>
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <ExternalLink size={14} className="text-blue-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-snug">
                      <strong className="text-foreground block mb-0.5">Impacto Visa Equivalent:</strong>
                      <span className="text-muted-foreground">{item.compliance_visa}</span>
                    </p>
                  </div>
                   <div className="flex items-start gap-2.5 p-2 bg-background rounded-lg border border-border/50">
                    <Map size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-snug">
                      <strong className="text-foreground block mb-0.5">Ação & Restrição QMAP:</strong>
                      <span className="text-muted-foreground">{item.registration}</span>
                    </p>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
