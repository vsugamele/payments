"use client";

import { useState, useMemo } from "react";
import { ShieldAlert, ShieldCheck, Info, Code, LayoutList, Search, CheckCircle2, AlertOctagon } from "lucide-react";
import deFields from "@/data/de-fields.json";
import mccList from "@/data/mcc-list.json";
import retentativas from "@/data/retentativas.json";

// MCC lookup helper — mcc-list.json schema: { mcc: number, nome: string, mcName: string, categoria: string }
type MccEntry = { mcc: number; nome: string; mcName: string; categoria: string; tcc?: string };

function lookupMcc(code: string) {
  const num = parseInt(code, 10);
  if (isNaN(num)) return null;
  const found = (mccList as MccEntry[]).find(m => m.mcc === num);
  return found ?? null;
}

// Retentativas lookup helper
function lookupRetry(code: string) {
  return (retentativas as { code: string; titulo: string; retry_permitido: boolean; nivel_risco: string; acao_exigida: string; categoria_tipo: string }[])
    .find(r => r.code === code) ?? null;
}

export default function ValidatorTab() {
  const [mode, setMode] = useState<'visual' | 'json' | 'retry'>('visual');
  const [entryMode, setEntryMode] = useState("81");
  const [hasUCAF, setHasUCAF] = useState(false);
  const [hasEMV, setHasEMV] = useState(false);
  const [mcc, setMcc] = useState("5411");
  const [responseCode, setResponseCode] = useState("51");

  const [jsonPayload, setJsonPayload] = useState('{\n  "de2": "4111111111111111",\n  "de3": "000000",\n  "de4": "000000010000",\n  "de18": "5411",\n  "de22": "81",\n  "de48_61": ""\n}');

  // Lookup MCC em tempo real
  const mccInfo = useMemo(() => lookupMcc(mcc), [mcc]);
  const retryInfo = useMemo(() => lookupRetry(responseCode), [responseCode]);

  // Visual Mode Results — agora com 8+ regras
  const visualResults: Array<{ type: string; title: string; msg: string }> = [];

  if (entryMode === "81") {
    if (!hasUCAF) {
      visualResults.push({ type: "danger", title: "E-Commerce sem Autenticação 3DS (UCAF Ausente)", msg: "Transação forçada para Intercâmbio Base/Non-Qual. Risco de chargeback 100% no Adquirente. Liability Shift não existe sem ECI 05/06." });
    } else {
      visualResults.push({ type: "success", title: "E-Commerce Autenticado (Liability Shift Ativo)", msg: "Liability Shift confirmado para o Emissor. Qualifica para taxas TAF/SCOF. ECI 05 = autenticação completa, ECI 06 = stand-in." });
    }
    if (!hasEMV) {
      visualResults.push({ type: "info", title: "E-Commerce: DE 55 Não Necessário", msg: "Para POS Entry Mode 81 (e-commerce), o DE 55 (EMV) não é enviado — o canal é card-not-present por definição." });
    }
  }

  if (entryMode === "07" || entryMode === "05") {
    if (!hasEMV) {
      visualResults.push({ type: "danger", title: "Dados EMV Ausentes (DE 55 Obrigatório)", msg: "POS Entry Mode 05/07 indica leitura de chip ou contactless. A ausência do DE 55 causa rejeição no switch. Transação sofrerá Downgrade ou Reject." });
    } else {
      visualResults.push({ type: "success", title: "Leitura de Chip Válida (EMV OK)", msg: "Dados EMV presentes no DE 55. Qualifica para taxas de chip integrado. Garanta que o TVR não possui flags críticos setados." });
    }
  }

  if (entryMode === "10") {
    visualResults.push({ type: "info", title: "COF/Recorrência (DE 22 = 10)", msg: "Stored Credential: DE 48.22 é obrigatório com o networkTransactionId da CIT original. Ausência do DE 48.22 = chargeback RC 4853 automático (Mastercard)." });
    if (!hasUCAF) {
      visualResults.push({ type: "warning", title: "MIT sem networkTransactionId pode gerar 4853", msg: "Toda transação MIT (Merchant Initiated) deve referenciar o networkTransactionId da transação CIT original. Solicite ao gateway o campo de vinculação." });
    }
  }

  if (entryMode === "01") {
    visualResults.push({ type: "warning", title: "Digitação Manual (POS Entry 01)", msg: "Altíssimo risco de fraude em POS e downgrade de intercâmbio. Aceitar somente em terminais não-attended e MCCs autorizados (ex: 5999, 7999)." });
    visualResults.push({ type: "danger", title: "Digitação Manual: Liability no Adquirente", msg: "Sem chip EMV ou 3DS, qualquer chargeback de fraude é automaticamente do Adquirente. Exige CVV2 e AVS para mínima proteção." });
  }

  if (mcc === "6012" || mcc === "6211" || mcc === "7995" || mcc === "5816") {
    visualResults.push({ type: "warning", title: "MCC Regulamentado / Alto Risco", msg: "Exige envio de identificadores adicionais: Wallet ID, BRAM registration ou dados específicos de risco. MCC de jogos (7995) requer validação de idade e KYC." });
  }

  if (mccInfo && mccInfo.categoria === "Travel & Transportation" && entryMode === "81") {
    visualResults.push({ type: "info", title: "MCC de Viagem em E-Commerce", msg: "Transações de viagem online têm maior taxa de chargeback. Reforce 3DS e coleta de dados de passageiro (passenger name, travel legs) para CE 3.0 se necessário." });
  }

  if (entryMode === "81" && hasUCAF && hasEMV) {
    visualResults.push({ type: "info", title: "DE 55 com POS Entry 81 (E-com) — Atenção", msg: "Enviar DE 55 em e-commerce (81) é incomum e pode causar confusão no switch. Token transactions (DPAN) que incluem cryptogram podem ser exceção — verifique o gateway." });
  }

  // JSON Mode Results
  const getJsonResults = () => {
    try {
      const parsed = JSON.parse(jsonPayload);
      const res: Array<{ type: string; title: string; msg: string }> = [];
      const keys = Object.keys(parsed);
      let identified = 0;

      keys.forEach(k => {
        const cleanKey = k.toLowerCase().replace(/[^a-z0-9]/g, '');
        const targetId = cleanKey.startsWith('de') ? cleanKey : `de${cleanKey}`;
        const field = deFields.find(f => f.id === targetId || f.id.replace('-', '_') === targetId);

        if (field) {
          identified++;
          const val = String(parsed[k]);
          let isValid = true;
          let warningMsg = "";

          if (field.tipo.startsWith('n') && !field.tipo.includes('an')) {
            if (/[^0-9]/.test(val) && val !== "") {
              isValid = false;
              warningMsg = "Deveria conter apenas números.";
            }
          }

          if (field.tipo === "n6" && val.length !== 6) { isValid = false; warningMsg = `Tamanho inválido (esperado 6, recebido ${val.length}).`; }
          if (field.tipo === "n12" && val.length !== 12) { isValid = false; warningMsg = `Tamanho inválido (esperado 12, recebido ${val.length}).`; }

          if (isValid) {
            res.push({ type: "success", title: `${field.numero} (Válido)`, msg: `Tipo ${field.tipo} respeitado. Valor: ${val || '(vazio)'}` });
          } else {
            res.push({ type: "danger", title: `${field.numero} (Formato Inválido)`, msg: warningMsg });
          }
        }
      });

      if (identified === 0 && keys.length > 0) {
        return [{ type: "warning", title: "Nenhum campo ISO identificado", msg: "Use chaves como 'de3', 'de4', 'de22' no JSON." }];
      }
      return res;
    } catch {
      return [{ type: "danger", title: "JSON Inválido", msg: "O payload fornecido não é um JSON válido." }];
    }
  };

  const currentResults = mode === 'visual' ? visualResults : mode === 'json' ? getJsonResults() : [];

  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl">

      {/* Mode tabs */}
      <div className="flex gap-2 p-1 bg-code-bg border border-border rounded-lg self-start">
        <button
          onClick={() => setMode('visual')}
          className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${mode === 'visual' ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <LayoutList size={16} /> Guiado
        </button>
        <button
          onClick={() => setMode('json')}
          className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${mode === 'json' ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <Code size={16} /> Payload JSON
        </button>
        <button
          onClick={() => setMode('retry')}
          className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${mode === 'retry' ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <Search size={16} /> Response Code
        </button>
      </div>

      <div className="p-6 rounded-2xl" style={{ background: "var(--input)", border: "1px solid var(--border)" }}>

        {/* ── Modo Guiado ── */}
        {mode === 'visual' && (
          <>
            <h2 className="text-foreground font-semibold mb-4 text-lg">Simular Requisição de Autorização</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-sm text-foreground">DE 22: Modo de Entrada</span>
                <select
                  className="input-base bg-background p-2 rounded text-foreground border border-border"
                  value={entryMode}
                  onChange={(e) => setEntryMode(e.target.value)}
                >
                  <option value="81">81 - E-commerce (Digitado online)</option>
                  <option value="07">07 - Contactless (NFC)</option>
                  <option value="05">05 - Chip com contato (EMV)</option>
                  <option value="01">01 - Manual (Digitado no POS)</option>
                  <option value="10">10 - Credencial Armazenada (COF/MIT)</option>
                </select>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-sm text-foreground">DE 18: MCC</span>
                <input
                  type="text"
                  maxLength={4}
                  className="input-base bg-background p-2 rounded text-foreground border border-border font-mono"
                  value={mcc}
                  onChange={(e) => setMcc(e.target.value)}
                  placeholder="Ex: 5411"
                />
                {/* MCC Lookup em tempo real */}
                {mcc.length === 4 && (
                  <div className={`flex items-center gap-2 text-xs px-2 py-1.5 rounded-lg border ${
                    mccInfo
                      ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
                      : "bg-red-500/5 border-red-500/20 text-red-400"
                  }`}>
                    {mccInfo
                      ? <><CheckCircle2 size={11} /> <span className="font-medium">{mccInfo.nome}</span></>
                      : <><AlertOctagon size={11} /> MCC não encontrado na base</>
                    }
                  </div>
                )}
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <label className="flex items-center gap-2 mt-2 cursor-pointer text-foreground text-sm">
                <input type="checkbox" checked={hasUCAF} onChange={(e) => setHasUCAF(e.target.checked)} className="w-4 h-4 text-primary bg-background border-border rounded" />
                <span>Enviar Tag UCAF / 3DS (DE 48.61)</span>
              </label>
              <label className="flex items-center gap-2 mt-2 cursor-pointer text-foreground text-sm">
                <input type="checkbox" checked={hasEMV} onChange={(e) => setHasEMV(e.target.checked)} className="w-4 h-4 text-primary bg-background border-border rounded" />
                <span>Enviar Dados de Chip (DE 55)</span>
              </label>
            </div>
          </>
        )}

        {/* ── Modo JSON ── */}
        {mode === 'json' && (
          <>
            <h2 className="text-foreground font-semibold mb-2 text-lg">Validar Payload ISO 8583</h2>
            <p className="text-muted-foreground text-sm mb-4">Cole o JSON com campos DE 1–128. O motor valida tipo e tamanho conforme a rede.</p>
            <textarea
              rows={8}
              className="w-full bg-background p-3 rounded text-code-text font-mono text-sm border border-border outline-none focus:border-primary"
              value={jsonPayload}
              onChange={(e) => setJsonPayload(e.target.value)}
            />
          </>
        )}

        {/* ── Modo Response Code Lookup ── */}
        {mode === 'retry' && (
          <>
            <h2 className="text-foreground font-semibold mb-2 text-lg">Lookup de Response Code</h2>
            <p className="text-muted-foreground text-sm mb-4">
              Insira o Response Code (DE 39) recebido na negativa para ver a estratégia de retentativa correta por bandeira.
            </p>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm text-foreground">Response Code (DE 39)</span>
              <select
                className="input-base bg-background p-3 rounded text-foreground border border-border font-mono"
                value={responseCode}
                onChange={e => setResponseCode(e.target.value)}
              >
                {(retentativas as { code: string; titulo: string }[]).map(r => (
                  <option key={r.code} value={r.code}>{r.code} — {r.titulo}</option>
                ))}
              </select>
            </label>

            {retryInfo && (
              <div className={`mt-4 space-y-3 p-4 rounded-xl border ${
                retryInfo.retry_permitido ? "bg-blue-500/5 border-blue-500/20" : "bg-red-500/5 border-red-500/20"
              }`}>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="font-bold text-foreground text-sm">{retryInfo.titulo}</h3>
                  <div className="flex gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      retryInfo.retry_permitido ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                    }`}>
                      {retryInfo.retry_permitido ? "✅ Retry Permitido" : "🚫 Hard Decline"}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-slate-800 text-slate-300">
                      {retryInfo.nivel_risco}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{retryInfo.acao_exigida}</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Resultados */}
      {mode !== 'retry' && (
        <div className="mt-2">
          <h3 className="text-sm uppercase tracking-wider text-muted-foreground font-semibold mb-4">
            {mode === 'visual' ? "Relatório de Diagnóstico" : "Varredura de Integridade ISO 8583"}
          </h3>
          <div className="flex flex-col gap-3">
            {currentResults.length === 0 && (
              <p className="text-muted-foreground text-sm">Nenhum alerta levantado.</p>
            )}
            {currentResults.map((res, i) => {
              let bg = "", border = "", icon;
              if (res.type === "danger") {
                bg = "rgba(239,68,68,0.1)"; border = "1px solid rgba(239,68,68,0.3)";
                icon = <ShieldAlert size={20} className="text-red-500 mt-0.5 shrink-0" />;
              } else if (res.type === "success") {
                bg = "rgba(34,197,94,0.1)"; border = "1px solid rgba(34,197,94,0.3)";
                icon = <ShieldCheck size={20} className="text-green-500 mt-0.5 shrink-0" />;
              } else if (res.type === "warning") {
                bg = "rgba(234,179,8,0.1)"; border = "1px solid rgba(234,179,8,0.3)";
                icon = <Info size={20} className="text-yellow-500 mt-0.5 shrink-0" />;
              } else {
                bg = "rgba(96,165,250,0.08)"; border = "1px solid rgba(96,165,250,0.2)";
                icon = <Info size={20} className="text-blue-400 mt-0.5 shrink-0" />;
              }
              return (
                <div key={i} className="flex gap-4 p-4 rounded-xl items-start" style={{ background: bg, border }}>
                  {icon}
                  <div>
                    <h4 className="font-semibold text-foreground text-sm mb-1">{res.title}</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">{res.msg}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
