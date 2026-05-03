"use client";

import { useState } from "react";
import mastercardData from "@/data/mastercard-interchange.json";
import eloData from "@/data/elo-interchange.json";
import { CreditCard, AlertTriangle, ChevronDown, CheckCircle2, AlertOctagon, TrendingDown } from "lucide-react";

export default function IntercambioClient() {
  const [activeTab, setActiveTab] = useState<"mastercard" | "elo">("mastercard");
  const [region, setRegion] = useState<"brasil" | "intraregional_lac" | "interregional_global">("brasil");

  const data = (activeTab === "mastercard" ? mastercardData : eloData) as any;

  return (
    <div className="space-y-8">
      {/* Network Switcher */}
      <div className="flex gap-3 mb-8">
        <button
          onClick={() => setActiveTab("mastercard")}
          className={`flex-1 md:flex-none px-6 py-4 rounded-xl border font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === "mastercard"
              ? "bg-red-500/10 border-red-500/50 text-red-500"
              : "bg-code-bg border-border text-muted-foreground hover:bg-white/5"
          }`}
        >
          MASTERCARD
        </button>
        <button
          onClick={() => setActiveTab("elo")}
          className={`flex-1 md:flex-none px-6 py-4 rounded-xl border font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === "elo"
              ? "bg-green-500/10 border-green-500/50 text-green-500"
              : "bg-code-bg border-border text-muted-foreground hover:bg-white/5"
          }`}
        >
          ELO
        </button>
      </div>

      <div className="p-5 border border-border bg-code-bg rounded-xl">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
              <CreditCard size={18} className={activeTab === "mastercard" ? "text-red-500" : "text-green-500"} />
              Versão Normativa: {data.versao}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">Fonte: {data.fonte}</p>
          </div>
          <div className="px-3 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold flex items-center gap-1">
            <AlertTriangle size={14} /> BACEN RES 150
          </div>
        </div>
        <div className="mt-4 p-4 rounded-lg bg-black/40 border border-border text-sm text-slate-300 leading-relaxed">
          {data.nota_regulatoria}
        </div>
      </div>

      {/* IRDs (Apenas Mastercard, Elo não mapeia IRDs diretamente no JSON base) */}
      {activeTab === "mastercard" && "irds_base" in data && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-2 mb-4">
            <h2 className="text-xl font-bold text-foreground">{data.irds_base?.titulo}</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">{data.irds_base?.descricao}</p>

          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setRegion("brasil")}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                region === "brasil" ? "bg-red-500 text-white" : "bg-code-bg border border-border text-muted-foreground hover:text-white"
              }`}
            >
              Doméstico (Brasil)
            </button>
            <button
              onClick={() => setRegion("intraregional_lac")}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                region === "intraregional_lac" ? "bg-red-500 text-white" : "bg-code-bg border border-border text-muted-foreground hover:text-white"
              }`}
            >
              Intraregional (LAC)
            </button>
            <button
              onClick={() => setRegion("interregional_global")}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                region === "interregional_global" ? "bg-red-500 text-white" : "bg-code-bg border border-border text-muted-foreground hover:text-white"
              }`}
            >
              Interregional (Global)
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(data.irds_base as any)?.[region]?.map((ird: any) => (
              <div key={ird.id} className="p-4 rounded-xl border border-border bg-code-bg flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-mono text-lg font-bold px-2 py-0.5 rounded bg-slate-800 text-white">{ird.id}</div>
                  <div className="text-xs font-bold text-blue-400 bg-blue-400/10 px-2 py-1 rounded-md text-right">{ird.canal}</div>
                </div>
                <h4 className="font-bold text-foreground mb-1">{ird.nome}</h4>
                <p className="text-xs text-muted-foreground mb-3 flex-1">{ird.descricao}</p>
                <div className="text-xs p-2 rounded bg-black/30 border border-border mt-auto">
                  <span className="font-bold text-slate-400">Gatilho:</span> {ird.regra_acionamento}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Diferenciais (Apenas Elo) */}
      {activeTab === "elo" && "diferencial_mercado" in data && (
        <div className="p-5 border border-emerald-500/20 bg-emerald-500/5 rounded-xl">
          <h2 className="text-lg font-bold text-emerald-500 mb-3">{data.diferencial_mercado?.titulo}</h2>
          <ul className="space-y-2 text-sm text-slate-300">
            {data.diferencial_mercado?.pontos?.map((ponto: string, i: number) => (
              <li key={i} className="flex gap-2 items-start">
                <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                <span>{ponto}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Produtos e Tabelas */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-2 mb-4">
          <h2 className="text-xl font-bold text-foreground">Produtos e Taxas (MDR Funding)</h2>
        </div>
        <div className="grid grid-cols-1 gap-6">
          {data.produtos.map((prod: any) => (
            <div key={prod.id} className="border border-border rounded-xl overflow-hidden bg-code-bg">
              <div className="p-4 flex flex-col md:flex-row justify-between md:items-center gap-4" style={{ borderBottom: `2px solid ${prod.bandeira_cor}` }}>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg text-white">{prod.nome}</h3>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: `${prod.bandeira_cor}20`, color: prod.bandeira_cor }}>
                      {prod.categoria}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{prod.descricao}</p>
                </div>
                {prod.regulado_bacen && (
                  <div className="shrink-0 text-right">
                    <div className="text-xs text-amber-500 font-bold mb-0.5">TETO BACEN (Res. 150)</div>
                    <div className="text-xl font-black text-white">{prod.teto_bacen_pct.toFixed(2)}%</div>
                  </div>
                )}
              </div>
              <div className="p-0">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground bg-black/40">
                    <tr>
                      <th className="px-4 py-3 font-medium">Cenário / Canal</th>
                      <th className="px-4 py-3 font-medium">Taxa de Intercâmbio</th>
                      <th className="px-4 py-3 font-medium">Contexto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {prod.tabelas.map((tab: any, i: number) => (
                      <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-300">{tab.canal}</td>
                        <td className="px-4 py-3">
                          <span className="font-mono font-bold text-white px-2 py-1 rounded bg-white/10">
                            {tab.taxa_pct.toFixed(2)}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{tab.observacao}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cascatas de Downgrade (Apenas Mastercard) */}
      {activeTab === "mastercard" && "cascatas_downgrade" in data && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-2 mb-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <TrendingDown size={20} className="text-red-400" />
              {data.cascatas_downgrade?.titulo}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">{data.cascatas_downgrade?.descricao}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.cascatas_downgrade?.motivos_downgrade?.map((motivo: any, i: number) => (
              <div key={i} className="p-5 rounded-xl border border-red-500/20 bg-red-500/5">
                <h4 className="font-bold text-red-400 mb-1">{motivo.motivo}</h4>
                <div className="inline-block mb-3 text-xs font-bold text-white bg-red-500/30 px-2 py-0.5 rounded">
                  {motivo.impacto}
                </div>
                <p className="text-xs text-slate-400">{motivo.descricao}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Programas de Monitoramento */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-2 mb-4">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <AlertOctagon size={20} className="text-orange-500" />
            Programas de Monitoramento e Risco
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.programas_monitoramento.map((prog: any) => (
            <div key={prog.sigla} className="p-5 rounded-xl border border-border bg-code-bg flex flex-col">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 text-orange-500 font-bold flex items-center justify-center shrink-0">
                  {prog.sigla}
                </div>
                <div>
                  <h3 className="font-bold text-white">{prog.nome}</h3>
                  <p className="text-xs text-muted-foreground">Programa Oficial de Compliance</p>
                </div>
              </div>
              <div className="space-y-3 mt-auto">
                <div className="flex justify-between items-center text-sm border-b border-border pb-2">
                  <span className="text-slate-400">Limite de Risco</span>
                  <span className="font-bold text-white">
                    {(prog.threshold_chargebacks || prog.threshold_fraude).toFixed(1)} {prog.threshold_chargebacks_unit || prog.threshold_fraude_unit}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-border pb-2">
                  <span className="text-slate-400">Multas (Assessment)</span>
                  <span className="font-bold text-red-400">{prog.multa}</span>
                </div>
                {prog.impacto_lojista && (
                   <div className="text-xs text-amber-500/80 mt-2 bg-amber-500/5 p-2 rounded">
                    <strong>Impacto ao Lojista:</strong> {prog.impacto_lojista}
                   </div>
                )}
                {prog.equivalente && (
                   <div className="text-xs text-muted-foreground mt-2">
                    <strong>Equivalente:</strong> {prog.equivalente}
                   </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
