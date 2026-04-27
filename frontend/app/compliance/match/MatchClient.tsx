"use client";

import { useState } from "react";
import matchCodesData from "../../../data/match-codes.json";
import { AlertOctagon, CheckCircle2, ChevronRight, Server, Search, ShieldAlert } from "lucide-react";

export default function MatchClient() {
  const [cnpj, setCnpj] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const simulateMatch = () => {
    setLoading(true);
    setResult(null);

    // Simulando tempo de rede para dar sensação de API call
    setTimeout(() => {
      // Regra de simulação local:
      // Pega os 2 últimos dígitos do CNPJ para decidir o reason code.
      // Se não achar um código válido, ou se terminar em 00, dá No Match.
      const lastDigits = cnpj.replace(/\D/g, "").slice(-2);
      const matchedCode = matchCodesData.find((c) => c.code === lastDigits);

      if (matchedCode && cnpj !== "" && lastDigits !== "00") {
        setResult({
          matchFound: true,
          matchType: "Exact Match",
          merchant: {
            name: name || "Lojista Desconhecido",
            cnpj: cnpj,
          },
          reason: matchedCode,
          apiResponse: {
            "MatchSystem": "MATCH_PRO_V2",
            "InquiryReference": `REQ-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
            "Timestamp": new Date().toISOString(),
            "Result": "EXACT_MATCH",
            "MatchedEntities": [
              {
                "EntityIdentifier": cnpj,
                "EntityType": "MERCHANT",
                "ReasonCode": matchedCode.code,
                "ReasonDescription": matchedCode.name,
                "AddedByAcquirerId": "ACQ_99827",
                "AddedDate": "2024-11-15T10:00:00Z"
              }
            ]
          }
        });
      } else {
        setResult({
          matchFound: false,
          apiResponse: {
            "MatchSystem": "MATCH_PRO_V2",
            "InquiryReference": `REQ-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
            "Timestamp": new Date().toISOString(),
            "Result": "NO_MATCH",
            "MatchedEntities": []
          }
        });
      }
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="mx-auto max-w-6xl px-6 pt-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* ── Esquerda: Formulário de Inquiry ── */}
      <div>
        <div style={{ background: "var(--code-bg)", border: "1px solid var(--border)", borderRadius: "1rem", overflow: "hidden" }}>
          <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border)" }}>
            <h2 className="text-sm font-bold flex items-center gap-2 text-foreground">
              <Server size={16} className="text-primary" />
              MATCH Pro Inquiry Endpoint
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Simula o endpoint POST /merchant/screening. Finalize o CNPJ com o código do MATCH desejado (ex: final 04) para simular um HIT. Use 00 para NO MATCH.
            </p>
          </div>
          
          <div className="p-6 space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                ID do Lojista (CNPJ / SSN)
              </label>
              <input
                type="text"
                placeholder="Ex para Chargeback: 00.000.000/0001-04"
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
                className="input-base font-mono text-sm"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Razão Social (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ex: Lojista Teste Ltda"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-base"
              />
            </div>

            <button
              onClick={simulateMatch}
              disabled={loading || cnpj.length < 2}
              className="btn-primary w-full inline-flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
            >
              {loading ? (
                <>Processando API...</>
              ) : (
                <>
                  <Search size={14} />
                  Executar Screening Online
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mt-8">
          <p className="section-eyebrow mb-4">Dicionário de Reason Codes Disponíveis</p>
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {matchCodesData.map((code) => (
              <div key={code.code} className="flex gap-4 p-3 rounded-xl border border-border bg-input transition-colors hover:bg-muted">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 font-bold shrink-0">
                  {code.code}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">{code.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{code.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Direita: Resultado ── */}
      <div>
        {!result && !loading && (
          <div className="h-full min-h-[300px] flex flex-col items-center justify-center border border-dashed border-border rounded-xl p-8 text-center bg-input/50">
            <Search size={40} className="text-muted-foreground mb-4 opacity-50" />
            <p className="text-sm text-foreground font-medium">Nenhuma consulta realizada</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              Use o formulário para simular uma requisição sincrona de Onboarding Screening via MATCH Pro.
            </p>
          </div>
        )}

        {loading && (
          <div className="h-full min-h-[300px] flex flex-col items-center justify-center border border-border rounded-xl p-8 text-center bg-input animate-pulse">
            <Server size={32} className="text-primary mb-4 animate-bounce" />
            <p className="text-sm text-foreground font-medium">Comunicando com Mastercard MATCH Pro...</p>
          </div>
        )}

        {result && !loading && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Visual Header */}
            {result.matchFound ? (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                    <ShieldAlert size={24} className="text-red-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-red-500 flex items-center gap-2">
                      Inquiry Result: Exact Match
                    </h2>
                    <p className="text-sm text-foreground font-medium mt-1">
                      O lojista <span className="font-bold">{result.merchant.name}</span> consta na base restritiva.
                    </p>
                    <div className="mt-4 p-4 rounded-lg bg-background border border-red-500/20">
                      <div className="flex items-center gap-2 text-red-500 font-bold mb-2">
                        <span className="bg-red-500/20 px-2 py-0.5 rounded text-xs">Code {result.reason.code}</span>
                        {result.reason.name}
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">{result.reason.description}</p>
                      <div className="text-xs bg-red-500/10 border border-red-500/20 p-2 rounded text-red-400 font-medium font-mono">
                        Ação sugerida: {result.reason.action}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={24} className="text-green-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-green-500">Inquiry Result: No Match</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Nenhum histórico restritivo encontrado. Onboarding liberado no aspecto Mastercard MATCH.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* API Payload Representation */}
            <div>
              <p className="section-eyebrow mb-3 flex items-center gap-2">
                <Server size={12} /> API JSON Response
              </p>
              <div className="rounded-xl border border-border bg-[#0a1120] overflow-hidden">
                <div className="px-4 py-2 bg-[#101a2d] border-b border-[#1e293b] flex items-center justify-between">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                    Response Headers
                  </span>
                  <span className="text-[10px] font-mono text-green-400">
                    200 OK
                  </span>
                </div>
                <pre className="p-4 text-xs font-mono text-blue-300 overflow-x-auto">
                  {JSON.stringify(result.apiResponse, null, 2)}
                </pre>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
