"use client";

import { useState } from "react";
import { ShieldAlert, ShieldCheck, Info, Code, LayoutList } from "lucide-react";
import deFields from "@/data/de-fields.json";

export default function ValidatorTab() {
  const [mode, setMode] = useState<'visual'|'json'>('visual');
  const [entryMode, setEntryMode] = useState("81");
  const [hasUCAF, setHasUCAF] = useState(false);
  const [hasEMV, setHasEMV] = useState(false);
  const [mcc, setMcc] = useState("5411");
  
  const [jsonPayload, setJsonPayload] = useState('{\n  "de2": "4111111111111111",\n  "de3": "000000",\n  "de4": "000000010000",\n  "de18": "5411",\n  "de22": "81",\n  "de48_61": ""\n}');

  // Visual Mode Results
  const visualResults = [];
  if (entryMode === "81") {
    if (!hasUCAF) {
      visualResults.push({ type: "danger", title: "E-Commerce sem Autenticação 3DS (UCAF Ausente)", msg: "Transação forçada para Intercâmbio Base/Non-Qual. Risco de chargeback 100% no Adquirente." });
    } else {
      visualResults.push({ type: "success", title: "E-Commerce Autenticado (Liability Shift)", msg: "Liability Shift confirmado para o Emissor. Qualifica para taxas TAF/SCOF." });
    }
  }
  if (entryMode === "05" || entryMode === "07") {
    if (!hasEMV) {
      visualResults.push({ type: "danger", title: "Dados EMV Inconsistentes", msg: "A presença do DE 55 é mandatória. A transação sofrerá Reject." });
    } else {
      visualResults.push({ type: "success", title: "Leitura de Cartão Física Válida", msg: "Marcadores de EMV devem ser carregados no DE 55 para intercâmbio Retail." });
    }
  }
  if (entryMode === "01") {
    visualResults.push({ type: "warning", title: "Digitação Manual", msg: "Altíssimo risco de fraude em POS e downgrade de intercâmbio, exceto em MCCs regulados." });
  }
  if (mcc === "6012" || mcc === "6211" || mcc === "7995") {
      visualResults.push({ type: "warning", title: "MCC Regulamentado", msg: "Exigido envio de identificadores adicionais como Wallet ID ou cadastro BRAM." });
  }

  // JSON Mode Results
  const getJsonResults = () => {
    try {
      const parsed = JSON.parse(jsonPayload);
      const res: Array<{type: string; title: string; msg: string}> = [];
      const keys = Object.keys(parsed);
      
      let identified = 0;
      keys.forEach(k => {
        // Normaliza chave "de2", "DE2", "2"
        const cleanKey = k.toLowerCase().replace(/[^a-z0-9]/g, '');
        const targetId = cleanKey.startsWith('de') ? cleanKey : `de${cleanKey}`;
        const field = deFields.find(f => f.id === targetId || f.id.replace('-','_') === targetId);
        
        if (field) {
          identified++;
          const val = String(parsed[k]);
          
          // Validação basica formato
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
        return [{ type: "warning", title: "Nenhum campo ISO identificado", msg: "Certifique-se de usar chaves como 'de3', 'de4', 'de22' no JSON." }];
      }
      
      return res;
    } catch(e) {
      return [{ type: "danger", title: "JSON Inválido", msg: "O payload fornecido não é um JSON válido." }];
    }
  };

  const currentResults = mode === 'visual' ? visualResults : getJsonResults();

  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl">
    
      <div className="flex gap-2 p-1 bg-code-bg border border-border rounded-lg self-start">
        <button 
          onClick={() => setMode('visual')}
          className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${mode === 'visual' ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <LayoutList size={16} /> Guiado (Principais)
        </button>
        <button 
          onClick={() => setMode('json')}
          className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${mode === 'json' ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <Code size={16} /> Payload JSON Completo
        </button>
      </div>

      <div className="p-6 rounded-2xl" style={{ background: "var(--input)", border: "1px solid var(--border)" }}>
        {mode === 'visual' ? (
          <>
            <h2 className="text-foreground font-semibold mb-4 text-lg">Simular Requisição Comum</h2>
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
                  <option value="10">10 - Credencial Armazenada (COF)</option>
                </select>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-sm text-foreground">DE 18: MCC</span>
                <input
                  type="text"
                  maxLength={4}
                  className="input-base bg-background p-2 rounded text-foreground border border-border"
                  value={mcc}
                  onChange={(e) => setMcc(e.target.value)}
                />
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <label className="flex items-center gap-2 mt-4 cursor-pointer text-foreground text-sm">
                <input type="checkbox" checked={hasUCAF} onChange={(e) => setHasUCAF(e.target.checked)} className="w-4 h-4 text-primary bg-background border-border rounded" />
                <span>Enviar Tag UCAF / 3DS (DE 48.61)</span>
              </label>
              <label className="flex items-center gap-2 mt-4 cursor-pointer text-foreground text-sm">
                <input type="checkbox" checked={hasEMV} onChange={(e) => setHasEMV(e.target.checked)} className="w-4 h-4 text-primary bg-background border-border rounded" />
                <span>Enviar Dados de Chip (DE 55)</span>
              </label>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-foreground font-semibold mb-2 text-lg">Validar Payload Avançado ISO 8583</h2>
            <p className="text-muted-foreground text-sm mb-4">Cole o seu JSON. O motor irá varrer todos os campos mapeados (DE 1 a DE 128) garantindo integridade de tipo (n6, n12, an) conforme rede.</p>
            <textarea 
              rows={8}
              className="w-full bg-background p-3 rounded text-code-text font-mono text-sm border border-border outline-none focus:border-primary"
              value={jsonPayload}
              onChange={(e) => setJsonPayload(e.target.value)}
            />
          </>
        )}
      </div>

      <div className="mt-2">
        <h3 className="text-sm uppercase tracking-wider text-muted-foreground font-semibold mb-4">
           {mode === 'visual' ? "Relatório de Diagnóstico Prático" : "Varredura de Integridade ISO 8583"}
        </h3>
        <div className="flex flex-col gap-3">
          {currentResults.length === 0 && (
             <p className="text-muted-foreground text-sm">Nenhum alerta levantado.</p>
          )}
          {currentResults.map((res, i) => {
            let bg, border, icon;
            if (res.type === "danger") {
              bg = "rgba(239,68,68,0.1)"; border = "1px solid rgba(239,68,68,0.3)";
              icon = <ShieldAlert size={20} className="text-red-500 mt-0.5 shrink-0" />;
            } else if (res.type === "success") {
              bg = "rgba(34,197,94,0.1)"; border = "1px solid rgba(34,197,94,0.3)";
              icon = <ShieldCheck size={20} className="text-green-500 mt-0.5 shrink-0" />;
            } else {
              bg = "rgba(234,179,8,0.1)"; border = "1px solid rgba(234,179,8,0.3)";
              icon = <Info size={20} className="text-yellow-500 mt-0.5 shrink-0" />;
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
    </div>
  );
}
