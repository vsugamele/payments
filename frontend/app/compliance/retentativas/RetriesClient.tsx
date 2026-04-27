"use client";

import { useState } from "react";
import { Search, AlertTriangle, CheckCircle2, XCircle, ShieldAlert, BadgeInfo, Info } from "lucide-react";
import data from "@/data/retentativas.json";
import TermTooltip from "@/components/TermTooltip";
import RuleReference from "@/components/RuleReference";

type RCData = typeof data[0];

export default function RetriesClient() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRC, setSelectedRC] = useState<RCData | null>(
    data.find((d) => d.code === "51") || data[0]
  );

  const filteredData = data.filter(
    (item) =>
      item.code.includes(searchTerm) ||
      item.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="grid lg:grid-cols-12 gap-8">
      {/* ── Lateral Esquerda (Busca e Menu) ── */}
      <div className="lg:col-span-4 space-y-6">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-3 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por código (Ex: 05, 51) ou nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-background border border-border rounded-xl py-3 pl-10 pr-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
          />
        </div>

        <div className="bg-code-bg border border-border rounded-xl  max-h-[600px] overflow-y-auto">
          {filteredData.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Nenhum código encontrado para '{searchTerm}'
            </div>
          ) : (
            <ul className="divide-y divide-border/50">
              {filteredData.map((item) => {
                const isSelected = selectedRC?.code === item.code;
                const isHard = item.categoria_tipo === "Hard Decline";
                const isSuccess = item.categoria_tipo === "Success";

                return (
                  <li key={item.code}>
                    <button
                      onClick={() => setSelectedRC(item)}
                      className={`w-full text-left px-5 py-4 transition-colors hover:bg-muted/50 ${
                        isSelected ? "bg-muted/60" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-3">
                          <span
                            className={`font-mono text-sm font-bold px-2 py-0.5 rounded ${
                              isSelected
                                ? "bg-primary text-primary-foreground"
                                : "bg-background border border-border"
                            }`}
                          >
                            RC {item.code}
                          </span>
                          <p
                            className={`text-sm font-semibold truncate ${
                              isSelected ? "text-foreground" : "text-muted-foreground"
                            }`}
                          >
                            {item.titulo}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-2">
                        {isSuccess ? (
                          <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-emerald-400">
                            <CheckCircle2 size={12} /> Aprovada
                          </span>
                        ) : isHard ? (
                          <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-red-500">
                            <XCircle size={12} /> Hard Decline
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-amber-500">
                            <AlertTriangle size={12} /> Soft Decline
                          </span>
                        )}
                        <span className="text-[10px] text-muted-foreground uppercase border border-border/60 px-1 rounded">
                          Risco: {item.nivel_risco}
                        </span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* ── Painel Direito (Detalhes do Código) ── */}
      <div className="lg:col-span-8">
        {selectedRC ? (
          <div className="bg-code-bg border border-border rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className={`p-6 border-b ${
              selectedRC.categoria_tipo === "Hard Decline" ? "border-red-500/20 bg-red-500/5" :
              selectedRC.categoria_tipo === "Soft Decline" ? "border-amber-500/20 bg-amber-500/5" :
              "border-emerald-500/20 bg-emerald-500/5"
            }`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${
                    selectedRC.categoria_tipo === "Hard Decline" ? "bg-red-500/10 border-red-500/30 text-red-500" :
                    selectedRC.categoria_tipo === "Soft Decline" ? "bg-amber-500/10 border-amber-500/30 text-amber-500" :
                    "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                  }`}>
                    {selectedRC.categoria_tipo === "Hard Decline" ? <XCircle size={28} /> : 
                     selectedRC.categoria_tipo === "Soft Decline" ? <AlertTriangle size={28} /> : 
                     <CheckCircle2 size={28} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-2xl font-black text-foreground">RC {selectedRC.code}</h2>
                      <span className={`px-2 py-0.5 text-xs font-bold uppercase rounded-md border ${
                        selectedRC.categoria_tipo === "Hard Decline" ? "bg-red-500/10 border-red-500/20 text-red-500" :
                        selectedRC.categoria_tipo === "Soft Decline" ? "bg-amber-500/10 border-amber-500/20 text-amber-500" :
                        "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                      }`}>
                        {selectedRC.categoria_tipo}
                      </span>
                    </div>
                    <p className="text-lg text-foreground font-medium">{selectedRC.titulo}</p>
                  </div>
                </div>
              </div>

              <p className="mt-5 text-sm text-muted-foreground leading-relaxed">
                {selectedRC.descricao}
              </p>
            </div>

            <div className="p-6 space-y-8">
              
              {/* Verdict Section */}
              <div>
                <h3 className="text-xs uppercase font-bold tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                  <ShieldAlert size={14} /> Conduta de Autorização
                </h3>
                <div className={`p-4 rounded-xl border flex gap-4 ${
                  selectedRC.retry_permitido ? "bg-amber-500/5 border-amber-500/20" : 
                  selectedRC.categoria_tipo === "Success" ? "bg-emerald-500/5 border-emerald-500/20" : 
                  "bg-red-500/5 border-red-500/20"
                }`}>
                  <div className="mt-1">
                    {selectedRC.retry_permitido ? <AlertTriangle size={18} className="text-amber-500" /> : 
                     selectedRC.categoria_tipo === "Success" ? <CheckCircle2 size={18} className="text-emerald-500" /> : 
                     <XCircle size={18} className="text-red-500" />}
                  </div>
                  <div>
                    <p className={`text-sm font-bold mb-1 ${
                      selectedRC.retry_permitido ? "text-amber-500" : 
                      selectedRC.categoria_tipo === "Success" ? "text-emerald-500" : 
                      "text-red-500"
                    }`}>
                      {selectedRC.retry_permitido ? "Retentativas Permitidas sob Condições Estratégicas" : "Bloqueio ou Término do Fluxo"}
                    </p>
                    <p className="text-sm text-foreground/80 leading-relaxed">
                      {selectedRC.acao_exigida}
                    </p>
                  </div>
                </div>
              </div>

              {/* Band-Specific Rules */}
              <div>
                <h3 className="text-xs uppercase font-bold tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                  <BadgeInfo size={14} /> Regras Específicas por Cartão
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Visa Rule */}
                  <div className="p-4 rounded-xl bg-background border border-border">
                    <div className="flex items-center justify-between mb-3 border-b border-border/50 pb-2">
                      <span className="font-bold text-blue-500">Regra Visa</span>
                      <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png" alt="Visa" className="h-3 opacity-50 grayscale" />
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed h-[80px] overflow-y-auto pr-2 custom-scrollbar">
                      {selectedRC.detalhes.visa}
                    </p>
                  </div>

                  {/* Mastercard Rule */}
                  <div className="p-4 rounded-xl bg-background border border-border">
                    <div className="flex items-center justify-between mb-3 border-b border-border/50 pb-2">
                      <span className="font-bold text-red-500">Regra Mastercard</span>
                      {/* Logo simulação */}
                      <div className="flex -space-x-2 grayscale opacity-50">
                        <div className="w-4 h-4 rounded-full bg-red-500"></div>
                        <div className="w-4 h-4 rounded-full bg-amber-500 mix-blend-multiply"></div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed h-[80px] overflow-y-auto pr-2 custom-scrollbar">
                      {selectedRC.detalhes.mastercard}
                    </p>
                  </div>
                </div>
                
                {selectedRC.code === "51" && (
                  <div className="mt-4 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 text-sm">
                    <div className="flex items-start gap-2 text-blue-400">
                      <Info size={16} className="mt-0.5" />
                      <div>
                        <strong>Aviso Crítico de Autorização (Visa Rule):</strong> Tentar cobrar um RC 51 mais do que 15 vezes em um período de 30 dias usando o mesmo cartão e o mesmo histórico gera incidência de <TermTooltip term="Excessive Retries" definition="Prática proibida pelo Core Rules sujeita à multas pesadas por transação." /> e Chargebacks por Taxa Administrativa indébita.
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        ) : (
          <div className="h-full min-h-[400px] flex items-center justify-center border border-dashed border-border rounded-2xl text-muted-foreground">
            Selecione um código à esquerda para analisar as regras.
          </div>
        )}
      </div>
    </div>
  );
}
