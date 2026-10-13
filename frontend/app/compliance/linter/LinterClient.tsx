"use client";

import React, { useState, useMemo } from "react";
import { 
  Terminal, ShieldAlert, CheckCircle2, AlertTriangle, 
  XCircle, Copy, Check, RefreshCw, FileText, ArrowRight,
  Cpu, Lock, Database, Layers, Sparkles, BookOpen, ExternalLink,
  ChevronDown, ChevronUp, Sliders
} from "lucide-react";
import Link from "next/link";

interface LintIssue {
  severity: "error" | "warning" | "info" | "pass";
  code: string;
  field: string;
  ruleTitle: string;
  message: string;
  financialImpact?: string;
  acervoRef?: string;
}

interface DecodedField {
  tag: string;
  name: string;
  rawValue: string;
  decodedMeaning: string;
  category: "mti" | "identificacao" | "valor" | "canal" | "emv" | "3ds" | "clearing";
  status: "valid" | "warning" | "error";
  statusNote?: string;
}

interface PresetMessage {
  id: string;
  name: string;
  category: string;
  badge: string;
  description: string;
  raw: string;
}

const PRESETS: PresetMessage[] = [
  {
    id: "auth_3ds_valid",
    name: "0100 Autorização E-Commerce com 3DS 2.2 (Conforme)",
    category: "Autorização",
    badge: "Tier Prime · 3DS OK",
    description: "Transação de e-commerce devidamente autenticada via 3DS 2.2 com CAVV transportado no DE 048 e ECI 05.",
    raw: `MTI: 0100
DE 003: 000000
DE 004: 000000025000
DE 011: 492019
DE 012: 143522
DE 013: 1012
DE 014: 2812
DE 022: 810
DE 025: 00
DE 037: 928374829102
DE 041: POS00001
DE 042: MERCH0000000123
DE 043: LOJA VIRTUAL EXEMPLO SAO PAULO BRA
DE 048: CAVV=AAABCBkXW5lSZmRhWVZnAAAAAAA= ECI=05 DS_ID=8c1a93e
DE 049: 986`
  },
  {
    id: "auth_3ds_downgrade",
    name: "0100 Autorização E-Commerce SEM 3DS (Downgrade)",
    category: "Autorização",
    badge: "Downgrade · +45 bps",
    description: "Transação capturada como e-commerce (DE 022=810) mas sem autenticação 3DS e sem CAVV. Gera perda de margem e sem Liability Shift.",
    raw: `MTI: 0100
DE 003: 000000
DE 004: 000000050000
DE 011: 582910
DE 012: 162011
DE 013: 1012
DE 014: 2906
DE 022: 810
DE 025: 00
DE 037: 827401928371
DE 041: WEB00002
DE 042: MERCH0000000999
DE 043: ECOMMERCE SEM SEGURANCA SAO PAULO BRA
DE 048: ECI=07
DE 049: 986`
  },
  {
    id: "auth_soft_decline",
    name: "0110 Resposta com Recusa Soft (Código 51 - Saldo)",
    category: "Resposta / Declines",
    badge: "Soft Decline · Retry OK",
    description: "Recusa por saldo insuficiente. Transação é elegível a retentativas inteligentes segundo as regras Visa Art. 2.11 e Mastercard TPE.",
    raw: `MTI: 0110
DE 003: 000000
DE 004: 000000018000
DE 011: 726192
DE 012: 191244
DE 013: 1012
DE 037: 192837465019
DE 038: 
DE 039: 51
DE 048: RETRY_ELIGIBLE=YES
DE 049: 986`
  },
  {
    id: "auth_hard_decline",
    name: "0110 Resposta com Recusa Hard (Código 05 / 14)",
    category: "Resposta / Declines",
    badge: "Hard Decline · Proibido Retry",
    description: "Recusa definitiva por emissor (Do Not Honor). Qualquer retentativa automática infringe regras de compliance e acarreta multas de USD 0.25-0.50.",
    raw: `MTI: 0110
DE 003: 000000
DE 004: 000000030000
DE 011: 839201
DE 012: 200511
DE 013: 1012
DE 037: 902817263541
DE 038: 
DE 039: 05
DE 048: FRAUD_SUSPECT=YES
DE 049: 986`
  },
  {
    id: "base_ii_tc33",
    name: "Base II — TC 33 Clearing Record (Draft Data Visa)",
    category: "Clearing",
    badge: "Clearing VisaNet",
    description: "Registro de apresentação financeira Base II com Fee Program Indicator (FPI) e atributos de liquidação multilateral.",
    raw: `RECORD_TYPE: TC33
TRANSACTION_CODE: 05
ACCOUNT_NUMBER_PREFIX: 412345
TRANSACTION_AMOUNT: 000000025000
SETTLEMENT_CURRENCY: 986
REIMBURSEMENT_ATTR: 0
FPI: C
USAGE_CODE: 1
SETTLEMENT_DATE: 261013
PROCESSING_CODE: 000000`
  },
  {
    id: "mc_ipm_t112",
    name: "Mastercard IPM — First Presentment T112 com IRD",
    category: "Clearing",
    badge: "Clearing Mastercard",
    description: "Mensagem IPM contendo PDS 0158 com o Interchange Rate Designator derivado pelo GCMS no faturamento.",
    raw: `MTI: 1240
FUNCTION_CODE: 200
DE 003: 000000
DE 004: 000000045000
DE 012: 120510
DE 022: 051
DE 048: PDS0158=HU PDS0025=002
DE 049: 986
DE 050: 986
DE 063: TRACE=MCBS20261012`
  }
];

export function LinterClient() {
  const [rawText, setRawText] = useState<string>(PRESETS[0].raw);
  const [copied, setCopied] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState<string>("all");

  const handleCopy = () => {
    navigator.clipboard.writeText(rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Parser dos campos chave-valor
  const parsedData = useMemo(() => {
    const lines = rawText.split("\n");
    const fieldsMap: Record<string, string> = {};

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return;
      const separatorIdx = trimmed.indexOf(":");
      const equalIdx = trimmed.indexOf("=");
      let key = "";
      let val = "";

      if (separatorIdx !== -1) {
        key = trimmed.substring(0, separatorIdx).trim().toUpperCase();
        val = trimmed.substring(separatorIdx + 1).trim();
      } else if (equalIdx !== -1) {
        key = trimmed.substring(0, equalIdx).trim().toUpperCase();
        val = trimmed.substring(equalIdx + 1).trim();
      }

      if (key) {
        fieldsMap[key] = val;
      }
    });

    return fieldsMap;
  }, [rawText]);

  // Auditoria de Compliance / Linter Engine
  const lintIssues = useMemo(() => {
    const issues: LintIssue[] = [];
    const mti = parsedData["MTI"] || parsedData["RECORD_TYPE"] || "";
    const de3 = parsedData["DE 003"] || parsedData["DE003"] || parsedData["PROCESSING_CODE"] || "";
    const de4 = parsedData["DE 004"] || parsedData["DE004"] || parsedData["TRANSACTION_AMOUNT"] || "";
    const de22 = parsedData["DE 022"] || parsedData["DE022"] || "";
    const de39 = parsedData["DE 039"] || parsedData["DE039"] || "";
    const de48 = parsedData["DE 048"] || parsedData["DE048"] || "";
    const fpi = parsedData["FPI"] || "";

    // 1. Validação de MTI
    if (mti === "0100") {
      issues.push({
        severity: "pass",
        code: "ISO-MTI-0100",
        field: "MTI",
        ruleTitle: "Message Type Indicator Válido",
        message: "MTI 0100: Pedido de autorização padrão originado pela adquirente.",
      });
    } else if (mti === "0110") {
      issues.push({
        severity: "info",
        code: "ISO-MTI-0110",
        field: "MTI",
        ruleTitle: "Resposta de Autorização",
        message: "MTI 0110: Retorno de decisão emitido pelo Emissor/Bandeira.",
      });
    }

    // 2. Validação do DE 003 (Processing Code)
    if (de3) {
      if (de3.startsWith("00")) {
        issues.push({
          severity: "pass",
          code: "DE003-PURCHASE",
          field: "DE 003",
          ruleTitle: "Processing Code: Compra de Mercadorias",
          message: "Operação classificada como compra regular (Purchase). Monitoramento Edit 30 aprovado.",
        });
      } else if (de3.startsWith("20")) {
        issues.push({
          severity: "info",
          code: "DE003-REFUND",
          field: "DE 003",
          ruleTitle: "Processing Code: Devolução / Estorno",
          message: "Operação classificada como Refund. Não pontua taxa de adquirente regular.",
        });
      } else {
        issues.push({
          severity: "warning",
          code: "DE003-UNKNOWN",
          field: "DE 003",
          ruleTitle: "Processing Code Atípico",
          message: `Código ${de3} requer atenção nos edit packages de clearing.`,
        });
      }
    }

    // 3. Validação de E-Commerce & 3-D Secure (DE 022 + DE 048)
    if (de22.startsWith("81")) {
      const hasCavv = de48.includes("CAVV") || de48.includes("AAV") || de48.includes("ECI=05") || de48.includes("ECI=06");
      const hasEci07 = de48.includes("ECI=07") || de48.includes("ECI 07");

      if (hasCavv && !hasEci07) {
        issues.push({
          severity: "pass",
          code: "3DS-AUTH-VERIFIED",
          field: "DE 022 / DE 048",
          ruleTitle: "3-D Secure Conforme & Liability Shift Ativo",
          message: "Autenticação 3DS válida presente. Qualifica para as melhores tarifas de intercâmbio (Tier Prime / Secure). Risco de chargeback por fraude transferido ao emissor.",
          acervoRef: "Visa Core Rules 5.3 / Mastercard Rules 5.11"
        });
      } else {
        issues.push({
          severity: "error",
          code: "3DS-NOAUTH-DOWNGRADE",
          field: "DE 022 / DE 048",
          ruleTitle: "Downgrade Crítico: E-Commerce sem Autenticação 3DS",
          message: "Transação de comércio eletrônico enviada sem credenciais 3DS ou com ECI 07. A transação sofrerá downgrade automático para tabela Standard.",
          financialImpact: "+45 a +60 bps no Intercâmbio + 100% de responsabilidade por chargeback de fraude.",
          acervoRef: "Visa Core Rules Section 5.3 / Elo Circular 24.1"
        });
      }
    } else if (de22.startsWith("05")) {
      issues.push({
        severity: "pass",
        code: "EMV-CHIP-POS",
        field: "DE 022",
        ruleTitle: "Captura com Chip Físico (EMV)",
        message: "POS Entry Mode 05: Leitura de contato com chip EMV. Alta segurança e menor índice de chargeback.",
      });
    } else if (de22.startsWith("01")) {
      issues.push({
        severity: "warning",
        code: "FALLBACK-MAGSTRIPE",
        field: "DE 022",
        ruleTitle: "Alerta de Fallback / Tarja Magnética",
        message: "Captura manual ou tarja. Risco crítico de contestação sob Reason Code 4837 (Fraude Sem Presença do Cartão).",
        financialImpact: "Exposição total a chargebacks irrevogáveis de fraude.",
      });
    }

    // 4. Validação de Códigos de Resposta e Retentativas (DE 039)
    if (de39) {
      if (de39 === "00") {
        issues.push({
          severity: "pass",
          code: "RESP-00-APPROVED",
          field: "DE 039",
          ruleTitle: "Transação Aprovada",
          message: "Autorização concedida pelo emissor com sucesso.",
        });
      } else if (de39 === "51") {
        issues.push({
          severity: "info",
          code: "RETRY-SOFT-51",
          field: "DE 039",
          ruleTitle: "Recusa Soft: Saldo Insuficiente (Código 51)",
          message: "Permite retentativa programada. Regra Visa Art. 2.11 / MC TPE permite até 15 retentativas num intervalo mínimo de 2 horas em 24h.",
          acervoRef: "Visa Core Rules Art 2.11 / Mastercard TPE Manual"
        });
      } else if (["05", "14", "41", "43", "57"].includes(de39)) {
        issues.push({
          severity: "error",
          code: "RETRY-HARD-PROHIBITED",
          field: "DE 039",
          ruleTitle: "Recusa Hard Definitiva: Retentativa Proibida",
          message: `Código de recusa ${de39} (Do Not Honor / Cartão Inválido / Furto). Qualquer retentativa automática constitui infração direta de bandeira.`,
          financialImpact: "Multa de USD 0.25 a USD 0.50 por retentativa indevida faturada em Scheme Fees (MCBS / VSS).",
          acervoRef: "Mastercard TPE Category 3 Declines / Visa Decline Rules"
        });
      }
    }

    // 5. Validação de Clearing Base II (TC 33) & FPI
    if (fpi) {
      issues.push({
        severity: "info",
        code: "BASE2-FPI",
        field: "FPI",
        ruleTitle: `Fee Program Indicator Base II: '${fpi}'`,
        message: `Indicador de cálculo tarifário utilizado no relatório VSS-110 para reconciliação multilateral.`,
      });
    }

    // 6. Validação de Moeda DE 049
    const de49 = parsedData["DE 049"] || parsedData["SETTLEMENT_CURRENCY"] || "";
    if (de49 && de49 !== "986") {
      issues.push({
        severity: "warning",
        code: "CROSS-BORDER-CURRENCY",
        field: "DE 049",
        ruleTitle: "Transação com Moeda Estrangeira (Cross-Border)",
        message: `Moeda ${de49} diverge de BRL (986). Incidência obrigatória de Cross-Border Scheme Fees (ISA / IAF).`,
        financialImpact: "+0.80% a +1.20% de taxas de rede para transação internacional.",
      });
    }

    return issues;
  }, [parsedData]);

  // Lista de campos decodificados para exibição
  const decodedFieldsList = useMemo(() => {
    const list: DecodedField[] = [];
    Object.entries(parsedData).forEach(([key, val]) => {
      let name = key;
      let category: DecodedField["category"] = "identificacao";
      let decodedMeaning = val;
      let status: DecodedField["status"] = "valid";
      let statusNote: string | undefined;

      if (key === "MTI") {
        name = "Message Type Indicator";
        category = "mti";
        decodedMeaning = val === "0100" ? "Authorization Request" :
                         val === "0110" ? "Authorization Response" :
                         val === "1240" ? "Clearing Presentment" : val;
      } else if (key === "DE 003" || key === "DE003" || key === "PROCESSING_CODE") {
        name = "Processing Code";
        category = "canal";
        decodedMeaning = val.startsWith("00") ? "00: Compra Regular de Mercadorias (Purchase)" :
                         val.startsWith("20") ? "20: Estorno / Devolução (Refund)" : val;
      } else if (key === "DE 004" || key === "DE004" || key === "TRANSACTION_AMOUNT") {
        name = "Transaction Amount";
        category = "valor";
        const num = Number(val) / 100;
        decodedMeaning = !isNaN(num) ? `R$ ${num.toFixed(2)} (${val} centavos)` : val;
      } else if (key === "DE 022" || key === "DE022") {
        name = "POS Entry Mode";
        category = "canal";
        if (val.startsWith("81")) {
          decodedMeaning = "81: E-Commerce / Transação Não Presencial (CNP)";
        } else if (val.startsWith("05")) {
          decodedMeaning = "05: Leitura de Chip EMV (Contato)";
        } else if (val.startsWith("07") || val.startsWith("91")) {
          decodedMeaning = "07/91: Contactless / Aproximação (NFC)";
        } else if (val.startsWith("01")) {
          decodedMeaning = "01: Tarja Magnética / Manual (Alto Risco)";
          status = "warning";
          statusNote = "Fallback ou captura sem chip";
        }
      } else if (key === "DE 039" || key === "DE039") {
        name = "Response Code";
        category = "mti";
        if (val === "00") {
          decodedMeaning = "00: Aprovada (Approved)";
        } else if (val === "51") {
          decodedMeaning = "51: Saldo Insuficiente (Insufficient Funds - Soft Decline)";
          status = "warning";
          statusNote = "Elegível a retentativas controladas";
        } else if (val === "05") {
          decodedMeaning = "05: Não Autorizar (Do Not Honor - Hard Decline)";
          status = "error";
          statusNote = "Retentativas automáticas proibidas";
        } else {
          decodedMeaning = `Código de Recusa: ${val}`;
          status = "warning";
        }
      } else if (key === "DE 048" || key === "DE048") {
        name = "Private Additional Data (3DS / PDS)";
        category = "3ds";
        if (val.includes("CAVV")) {
          decodedMeaning = "Contém Criptograma CAVV de Autenticação 3-D Secure.";
        } else if (val.includes("ECI=07")) {
          decodedMeaning = "ECI 07: Transação E-Commerce sem Autenticação 3DS.";
          status = "error";
          statusNote = "Downgrade de taxa garantido";
        }
      } else if (key === "FPI") {
        name = "Fee Program Indicator (Base II)";
        category = "clearing";
        decodedMeaning = `Programa de Tarifa ${val} no VisaNet Settlement Service`;
      }

      list.push({
        tag: key,
        name,
        rawValue: val,
        decodedMeaning,
        category,
        status,
        statusNote
      });
    });

    return list;
  }, [parsedData]);

  const filteredIssues = useMemo(() => {
    if (filterSeverity === "all") return lintIssues;
    return lintIssues.filter(i => i.severity === filterSeverity);
  }, [lintIssues, filterSeverity]);

  const errorCount = lintIssues.filter(i => i.severity === "error").length;
  const warningCount = lintIssues.filter(i => i.severity === "warning").length;
  const passCount = lintIssues.filter(i => i.severity === "pass").length;

  return (
    <div className="space-y-8">
      {/* ── Presets Rápidos ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Sparkles size={14} className="text-blue-400" />
            Cargas de Teste Predefinidas (Presets de Produção)
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            Clique para carregar e inspecionar
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PRESETS.map((p) => {
            const isCurrent = rawText === p.raw;
            return (
              <button
                key={p.id}
                onClick={() => setRawText(p.raw)}
                className={`p-3.5 rounded-xl text-left border transition-all ${
                  isCurrent 
                    ? "bg-blue-950/40 border-blue-500/60 shadow-md shadow-blue-950/30" 
                    : "bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    {p.category}
                  </span>
                  <span className="text-[10px] font-bold text-blue-400">
                    {p.badge}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white line-clamp-1 mb-1">
                  {p.name}
                </h4>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {p.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Área de Edição e Linter ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Painel Esquerdo: Editor Raw (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#0b101b] border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <Terminal size={16} className="text-emerald-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Entrada de Mensagem Raw (ISO / IPM)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-[11px] font-medium flex items-center gap-1.5 transition-all"
                  title="Copiar mensagem"
                >
                  {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  <span>{copied ? "Copiado!" : "Copiar"}</span>
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Edite qualquer linha diretamente. Altere por exemplo <code className="text-emerald-400 bg-slate-800 px-1 rounded">DE 022: 810</code> para <code className="text-amber-400 bg-slate-800 px-1 rounded">DE 022: 010</code> ou o código <code className="text-emerald-400 bg-slate-800 px-1 rounded">DE 039: 00</code> para ver a auditoria de compliance recalcular em tempo real.
            </p>

            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Cole seu payload ISO 8583 ou IPM aqui..."
              className="w-full h-80 bg-[#060a12] border border-slate-800/80 rounded-xl p-4 font-mono text-xs text-emerald-400 placeholder:text-slate-600 focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/60 outline-none transition-all leading-relaxed custom-scrollbar resize-none"
            />

            <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1">
              <span>{Object.keys(parsedData).length} campo(s) identificado(s)</span>
              <span>Padronização ISO 8583-1987 / IPM</span>
            </div>
          </div>
        </div>

        {/* Painel Direito: Resultados do Linter & Diagnóstico (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card Resumo do Linter */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldAlert size={16} className="text-blue-400" />
                  Auditoria de Regras de Rede & Compliance
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Checagem automatizada contra o Rulebook de Release e Cascatas de Intercâmbio.
                </p>
              </div>

              {/* Badges de Contagem */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilterSeverity("error")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono flex items-center gap-1.5 transition-all ${
                    filterSeverity === "error" 
                      ? "bg-red-500 text-white" 
                      : "bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20"
                  }`}
                >
                  <XCircle size={13} />
                  <span>{errorCount} Falhas</span>
                </button>
                <button
                  onClick={() => setFilterSeverity("warning")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono flex items-center gap-1.5 transition-all ${
                    filterSeverity === "warning" 
                      ? "bg-amber-500 text-slate-950 font-black" 
                      : "bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20"
                  }`}
                >
                  <AlertTriangle size={13} />
                  <span>{warningCount} Avisos</span>
                </button>
                <button
                  onClick={() => setFilterSeverity("all")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition-all ${
                    filterSeverity === "all" 
                      ? "bg-blue-600 text-white" 
                      : "bg-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  Todos ({lintIssues.length})
                </button>
              </div>
            </div>

            {/* Lista de Issues */}
            <div className="mt-4 space-y-3 max-h-[380px] overflow-y-auto custom-scrollbar pr-1">
              {filteredIssues.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  Nenhum item encontrado para o filtro selecionado.
                </div>
              ) : (
                filteredIssues.map((issue, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border transition-all ${
                      issue.severity === "error"
                        ? "bg-red-950/20 border-red-500/40 text-red-200"
                        : issue.severity === "warning"
                        ? "bg-amber-950/20 border-amber-500/30 text-amber-200"
                        : issue.severity === "pass"
                        ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-200"
                        : "bg-blue-950/20 border-blue-500/30 text-blue-200"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        {issue.severity === "error" ? (
                          <XCircle size={15} className="text-red-400 shrink-0" />
                        ) : issue.severity === "warning" ? (
                          <AlertTriangle size={15} className="text-amber-400 shrink-0" />
                        ) : issue.severity === "pass" ? (
                          <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                        ) : (
                          <Terminal size={15} className="text-blue-400 shrink-0" />
                        )}
                        <span className="text-xs font-bold text-white">
                          {issue.ruleTitle}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 border border-white/10 shrink-0">
                        {issue.field}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed mb-2">
                      {issue.message}
                    </p>

                    {issue.financialImpact && (
                      <div className="p-2 rounded-lg bg-black/40 border border-red-500/20 text-[11px] text-red-300 flex items-center gap-2 mb-2 font-mono">
                        <span className="font-bold uppercase text-[9px] px-1 py-0.5 rounded bg-red-500/20 text-red-400">
                          Preço do Erro
                        </span>
                        <span>{issue.financialImpact}</span>
                      </div>
                    )}

                    {issue.acervoRef && (
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                        <BookOpen size={11} className="text-blue-400" />
                        <span>Referência: {issue.acervoRef}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Tabela de Dissecação de Campos Decodificados */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Layers size={14} className="text-purple-400" />
              Dissecação Campo a Campo
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 text-[10px] uppercase">
                    <th className="pb-2.5 font-bold">Elemento</th>
                    <th className="pb-2.5 font-bold">Nome</th>
                    <th className="pb-2.5 font-bold">Valor Bruto</th>
                    <th className="pb-2.5 font-bold">Significado Decodificado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {decodedFieldsList.map((f, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors">
                      <td className="py-2.5 text-blue-400 font-bold whitespace-nowrap">
                        {f.tag}
                      </td>
                      <td className="py-2.5 text-slate-300 font-sans font-medium">
                        {f.name}
                      </td>
                      <td className="py-2.5 text-emerald-400 max-w-[140px] truncate" title={f.rawValue}>
                        {f.rawValue}
                      </td>
                      <td className="py-2.5 text-slate-300 font-sans text-[11px] leading-relaxed">
                        {f.decodedMeaning}
                        {f.statusNote && (
                          <span className={`block text-[10px] font-mono mt-0.5 ${
                            f.status === "error" ? "text-red-400" : "text-amber-400"
                          }`}>
                            ⚠️ {f.statusNote}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
