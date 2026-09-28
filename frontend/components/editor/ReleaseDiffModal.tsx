"use client";

import React, { useState } from "react";
import {
  GitCompare,
  ArrowRight,
  Plus,
  Minus,
  AlertTriangle,
  Clock,
  DollarSign,
  Layers,
  FileText,
  Check,
  X,
  Sparkles,
  Download,
  UploadCloud,
  FileUp,
  Loader2,
  Trash2,
  File as FileIcon,
} from "lucide-react";

export interface ReleaseDiffData {
  title: string;
  sourceRelease: string;
  targetRelease: string;
  brand: string;
  category: string;
  fieldsChanges: {
    status: "novo" | "alterado" | "removido";
    field: string;
    subfield?: string;
    name: string;
    description: string;
    impact: "Alto" | "Médio" | "Baixo";
  }[];
  mandates: {
    rule: string;
    pilotDate: string;
    effectiveDate: string;
    penaltyDate?: string;
    isMandatory: boolean;
    description: string;
  }[];
  feesImpact: {
    code: string;
    name: string;
    type: "Novo Fee" | "Aumento" | "Penalidade";
    amount: string;
    condition: string;
  }[];
  rolesImpact: {
    role: "Adquirente" | "Emissor" | "Gateway / Processadora";
    actions: string[];
    risk: "Alto" | "Médio" | "Baixo";
  }[];
}

const PRESET_DIFFS: Record<string, ReleaseDiffData> = {
  mastercard_data_integrity: {
    title: "Mastercard Data Integrity Edits (Edit 30/31) — V1 vs V2",
    sourceRelease: "GLB 6409.1 (Maio/2022)",
    targetRelease: "GLB 6409.2 (Novembro/2024 - V2)",
    brand: "Mastercard",
    category: "Data Integrity & Autorização",
    fieldsChanges: [
      {
        status: "alterado",
        field: "DE 39",
        name: "Response Code",
        description: "Adicionado código 57 (Transaction not permitted) como decline inválido em compras de reembolso (DE 3 SF1 = 20), exceto em cartões pré-pagos não recarregáveis.",
        impact: "Alto",
      },
      {
        status: "alterado",
        field: "DE 3 SF1",
        name: "Processing Code — Subfield 1",
        description: "Recalibração do filtro de escopo para transações de Purchase Return/Refund (valor 20).",
        impact: "Médio",
      },
      {
        status: "novo",
        field: "DE 22 SF1",
        name: "POS Entry Mode",
        description: "Valor 91 (contactless magnetic stripe) passa a ser exceção formal e não conta na penalidade do Edit 30.",
        impact: "Baixo",
      },
    ],
    mandates: [
      {
        rule: "Novo Critério & Baseline Edit 30 (Threshold 99%)",
        pilotDate: "01/04/2025 (Início Monitoramento)",
        effectiveDate: "01/07/2025 (Comply-by novos não-conformes)",
        penaltyDate: "31/08/2025 (Início dos Assessments)",
        isMandatory: true,
        description: "Emissores com mais de 100 refunds/mês devem atingir 99% de aprovação ou justificativas válidas.",
      },
      {
        rule: "Registro Obrigatório na ferramenta Data Integrity Online",
        pilotDate: "Imediato",
        effectiveDate: "01/05/2025",
        penaltyDate: "Sob Notificação",
        isMandatory: true,
        description: "Todo ICA number e Processor ID deve estar registrado no portal Mastercard Connect.",
      },
    ],
    feesImpact: [
      {
        code: "2DC0100",
        name: "Data Integrity Noncompliance Assessment",
        type: "Penalidade",
        amount: "USD 2.500 a USD 25.000 / mês por ICA",
        condition: "Cobrado se a taxa de conformidade ficar abaixo de 99% após a data de comply-by.",
      },
    ],
    rolesImpact: [
      {
        role: "Emissor",
        actions: [
          "Revisar o motor de resposta (DE 39) para não retornar 10, 12, 51 ou 57 em autorizações de refund.",
          "Identificar flag TR52/FIT1 para validar exceção de pré-pago não-recarregável.",
          "Cadastrar ICAs no portal Data Integrity Online.",
        ],
        risk: "Alto",
      },
      {
        role: "Adquirente",
        actions: [
          "Garantir envio rigoroso de DE 3 SF1 = 20 em reembolsos para evitar chargebacks indevidos.",
          "Monitorar taxa de aceitação de refund dos emissores.",
        ],
        risk: "Médio",
      },
      {
        role: "Gateway / Processadora",
        actions: [
          "Mapear subcampos de contactless e manter repasse íntegro do DE 22 SF1 = 91.",
        ],
        risk: "Baixo",
      },
    ],
  },

  capk_key_extension: {
    title: "Mastercard M/Chip CAPK Key Extension — 2025 vs 2026",
    sourceRelease: "GLB 10362.2 (Setembro/2025)",
    targetRelease: "GLB 10362.3 (Setembro/2026)",
    brand: "Mastercard",
    category: "Criptografia & EMV L2",
    fieldsChanges: [
      {
        status: "alterado",
        field: "CAPK Index 06",
        name: "Public Key 1984-bit Expiration",
        description: "Data de expiração estendida de 31/12/2035 para 31/12/2036. O valor da chave permanece idêntico.",
        impact: "Médio",
      },
      {
        status: "removido",
        field: "CAPK < 1024-bit",
        name: "Chaves Históricas Inferiores a 1024 bits",
        description: "Remoção definitiva de quaisquer referências de suporte a chaves RSA menores que 1024 bits.",
        impact: "Baixo",
      },
    ],
    mandates: [
      {
        rule: "Abertura de Emissão de Certificados MPKCS 2036",
        pilotDate: "22/09/2026",
        effectiveDate: "01/11/2026",
        penaltyDate: "N/A",
        isMandatory: true,
        description: "Emissores já podem gerar certificados com validade máxima até 31/12/2036.",
      },
    ],
    feesImpact: [
      {
        code: "N/A",
        name: "Extensão Administrativa de Certificado",
        type: "Novo Fee",
        amount: "Sem custo tarifário adicional",
        condition: "Processamento via portal Mastercard Public Key Certification Service.",
      },
    ],
    rolesImpact: [
      {
        role: "Adquirente",
        actions: [
          "Sincronizar tabelas CAPK nos terminais POS / Pinpads via TMS para aceitar a nova data limite.",
        ],
        risk: "Médio",
      },
      {
        role: "Emissor",
        actions: [
          "Emitir lotes de cartões M/Chip com validade estendida até 2036 sem risco de rejeição em transação offline.",
        ],
        risk: "Baixo",
      },
      {
        role: "Gateway / Processadora",
        actions: [
          "Garantir suporte à especificação EMVCo Notice Bulletin nº 30 nos módulos criptográficos HSM.",
        ],
        risk: "Médio",
      },
    ],
  },

  visa_daf_tokenization: {
    title: "Visa Digital Authentication Framework (DAF) & 3DS Enhancement — 2025 vs 2026",
    sourceRelease: "Visa Release 24.2 (Outubro/2024)",
    targetRelease: "Visa Release 25.1 / 2026 Mandate",
    brand: "Visa",
    category: "E-Commerce, Fraude & 3DS",
    fieldsChanges: [
      {
        status: "novo",
        field: "Field 108",
        subfield: "Tag DAF",
        name: "Digital Authentication Framework Trace & Data",
        description: "Presença de credencial de autenticação delegada com token de sessão assinado.",
        impact: "Alto",
      },
      {
        status: "alterado",
        field: "DE 48",
        subfield: "SE 22",
        name: "3DS Merchant & CAVV Verification",
        description: "Obrigatoriedade de repasse integral do CAVV com verificação de versionamento 3DS 2.2+.",
        impact: "Alto",
      },
    ],
    mandates: [
      {
        rule: "Mandatório DAF em Transações Recorrentes e Credenciais Armazenadas (COF)",
        pilotDate: "01/02/2025",
        effectiveDate: "18/10/2025",
        penaltyDate: "01/01/2026",
        isMandatory: true,
        description: "Adquirentes devem sinalizar corretamente transações elegíveis a DAF para usufruir de liability shift.",
      },
    ],
    feesImpact: [
      {
        code: "V-DAF-NONCOMP",
        name: "Assessment por Ausência de Autenticação Segura E-Commerce",
        type: "Penalidade",
        amount: "USD 0,05 por transação desqualificada",
        condition: "Aplica-se a transações de e-commerce sem 3DS/DAF em MCCs de alto risco.",
      },
    ],
    rolesImpact: [
      {
        role: "Adquirente",
        actions: [
          "Implementar envio de Field 108 estruturado e repasse de CAVV na autorização.",
          "Habilitar suporte a credenciais DAF para grandes subadquirentes e marketplaces.",
        ],
        risk: "Alto",
      },
      {
        role: "Emissor",
        actions: [
          "Reconhecer tokens DAF e aplicar liability shift favorável ao credenciador.",
        ],
        risk: "Médio",
      },
      {
        role: "Gateway / Processadora",
        actions: [
          "Atualizar SDKs de checkout e certificar versões 3DS 2.2 / 2.3.",
        ],
        risk: "Alto",
      },
    ],
  },
};

interface ReleaseDiffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertHtml: (html: string) => void;
}

export default function ReleaseDiffModal({
  isOpen,
  onClose,
  onInsertHtml,
}: ReleaseDiffModalProps) {
  const [selectedPresetKey, setSelectedPresetKey] = useState<string>("mastercard_data_integrity");
  const [activeTab, setActiveTab] = useState<"overview" | "fields" | "mandates" | "fees" | "roles">("overview");
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Upload & Drag-and-Drop state
  const [mode, setMode] = useState<"presets" | "upload">("presets");
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [customDiffData, setCustomDiffData] = useState<ReleaseDiffData | null>(null);

  const currentDiff =
    mode === "upload" && customDiffData
      ? customDiffData
      : PRESET_DIFFS[selectedPresetKey] || PRESET_DIFFS.mastercard_data_integrity;

  const handleAnalyzePdfs = async () => {
    if (!fileB) {
      setAnalysisError("Selecione pelo menos o PDF da nova versão.");
      return;
    }

    try {
      setIsAnalyzing(true);
      setAnalysisError(null);

      const formData = new FormData();
      if (fileA) formData.append("fileA", fileA);
      formData.append("fileB", fileB);

      const res = await fetch("/api/editor/parse-pdf", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Falha ao analisar os PDFs.");
      }

      const data: ReleaseDiffData = await res.json();
      setCustomDiffData(data);
      setActiveTab("overview");
    } catch (err: any) {
      console.error("Erro na análise de PDFs:", err);
      setAnalysisError(err.message || "Erro inesperado ao processar os arquivos.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!isOpen) return null;

  // Generates clean HTML to insert into document
  const generateDiffHtml = (): string => {
    return `
      <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:12px; padding:20px; margin:1.5rem 0; font-family:system-ui, -apple-system, sans-serif;">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #e2e8f0; padding-bottom:12px; margin-bottom:16px;">
          <div>
            <span style="background:#2563eb; color:#ffffff; font-size:10px; font-weight:bold; padding:3px 8px; border-radius:6px; text-transform:uppercase;">Relatório Comparativo de Release</span>
            <h3 style="margin:6px 0 2px 0; color:#0f172a; font-size:16px; font-weight:800;">${currentDiff.title}</h3>
            <div style="font-size:12px; color:#64748b;">
              <strong>Bandeira:</strong> ${currentDiff.brand} &nbsp;•&nbsp; 
              <span style="color:#dc2626; font-weight:bold;">${currentDiff.sourceRelease}</span> ➔ 
              <span style="color:#16a34a; font-weight:bold;">${currentDiff.targetRelease}</span>
            </div>
          </div>
        </div>

        <h4 style="margin:12px 0 6px 0; color:#1e293b; font-size:13px; text-transform:uppercase; letter-spacing:0.5px;">1. Modificações em Campos & Subcampos ISO / IPM</h4>
        <table style="width:100%; border-collapse:collapse; margin-bottom:16px; font-size:12px;">
          <thead>
            <tr style="background:#0f2c59; color:#ffffff;">
              <th style="padding:8px 10px; text-align:left; border:1px solid #1e3a8a;">Status</th>
              <th style="padding:8px 10px; text-align:left; border:1px solid #1e3a8a;">Campo / Tag</th>
              <th style="padding:8px 10px; text-align:left; border:1px solid #1e3a8a;">Nome Técnico</th>
              <th style="padding:8px 10px; text-align:left; border:1px solid #1e3a8a;">Descrição da Alteração</th>
              <th style="padding:8px 10px; text-align:center; border:1px solid #1e3a8a;">Impacto</th>
            </tr>
          </thead>
          <tbody>
            ${currentDiff.fieldsChanges
              .map(
                (f) => `
              <tr style="background:#ffffff; border-bottom:1px solid #e2e8f0;">
                <td style="padding:8px 10px; font-weight:bold; color:${f.status === "novo" ? "#16a34a" : f.status === "alterado" ? "#d97706" : "#dc2626"};">
                  ${f.status.toUpperCase()}
                </td>
                <td style="padding:8px 10px; font-family:monospace; font-weight:bold;">${f.field} ${f.subfield || ""}</td>
                <td style="padding:8px 10px;">${f.name}</td>
                <td style="padding:8px 10px; color:#334155;">${f.description}</td>
                <td style="padding:8px 10px; text-align:center;">
                  <span style="padding:2px 6px; border-radius:4px; font-weight:bold; font-size:11px; background:${f.impact === "Alto" ? "#fee2e2" : f.impact === "Médio" ? "#fef3c7" : "#f1f5f9"}; color:${f.impact === "Alto" ? "#b91c1c" : f.impact === "Médio" ? "#b45309" : "#475569"};">
                    ${f.impact}
                  </span>
                </td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>

        <h4 style="margin:12px 0 6px 0; color:#1e293b; font-size:13px; text-transform:uppercase; letter-spacing:0.5px;">2. Cronograma de Vigências & Mandatórios</h4>
        <table style="width:100%; border-collapse:collapse; margin-bottom:16px; font-size:12px;">
          <thead>
            <tr style="background:#1e293b; color:#ffffff;">
              <th style="padding:8px 10px; text-align:left;">Regra / Mandato</th>
              <th style="padding:8px 10px; text-align:left;">Início / Piloto</th>
              <th style="padding:8px 10px; text-align:left;">Vigência Obrigatória</th>
              <th style="padding:8px 10px; text-align:left;">Penalidade (Assessment)</th>
            </tr>
          </thead>
          <tbody>
            ${currentDiff.mandates
              .map(
                (m) => `
              <tr style="background:#ffffff; border-bottom:1px solid #e2e8f0;">
                <td style="padding:8px 10px; font-weight:bold; color:#0f172a;">${m.rule}</td>
                <td style="padding:8px 10px; color:#475569;">${m.pilotDate}</td>
                <td style="padding:8px 10px; font-weight:bold; color:#2563eb;">${m.effectiveDate}</td>
                <td style="padding:8px 10px; color:#dc2626; font-weight:bold;">${m.penaltyDate || "N/A"}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>

        <h4 style="margin:12px 0 6px 0; color:#1e293b; font-size:13px; text-transform:uppercase; letter-spacing:0.5px;">3. Matriz de Impacto por Ator</h4>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          ${currentDiff.rolesImpact
            .map(
              (r) => `
            <div style="background:#ffffff; border:1px solid #e2e8f0; border-left:4px solid ${r.risk === "Alto" ? "#dc2626" : r.risk === "Médio" ? "#d97706" : "#2563eb"}; border-radius:8px; padding:12px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <strong style="color:#0f172a; font-size:13px;">${r.role}</strong>
                <span style="font-size:10px; font-weight:bold; color:${r.risk === "Alto" ? "#dc2626" : r.risk === "Médio" ? "#d97706" : "#2563eb"};">Risco ${r.risk}</span>
              </div>
              <ul style="margin:0; padding-left:16px; font-size:11.5px; color:#475569; line-height:1.5;">
                ${r.actions.map((act) => `<li>${act}</li>`).join("")}
              </ul>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
      <p></p>
    `;
  };

  const handleInsert = () => {
    onInsertHtml(generateDiffHtml());
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-card border border-border shadow-2xl rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-foreground">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-border bg-muted/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <GitCompare size={20} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
                <span>Diff Automático de Releases & Boletins</span>
                <span className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-semibold">
                  Release Comparer
                </span>
              </h2>
              <p className="text-xs text-muted-foreground">
                Compare versões de comunicados e extraia alterações de campos, mandatórios e tarifas.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Mode Switcher: Presets vs Drag-and-Drop Upload */}
        <div className="px-5 py-2.5 border-b border-border bg-muted/40 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 p-1 bg-card border border-border rounded-xl">
            <button
              onClick={() => setMode("presets")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                mode === "presets"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Modelos Prontos (Presets)
            </button>
            <button
              onClick={() => setMode("upload")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                mode === "upload"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <UploadCloud size={13} />
              <span>Subir 2 PDFs (Drag & Drop)</span>
            </button>
          </div>

          {mode === "upload" && customDiffData && (
            <button
              onClick={() => {
                setCustomDiffData(null);
                setFileA(null);
                setFileB(null);
              }}
              className="text-xs text-blue-500 hover:underline font-semibold flex items-center gap-1"
            >
              <FileUp size={13} />
              <span>+ Analisar Outros Arquivos</span>
            </button>
          )}
        </div>

        {/* Presets Mode Bar */}
        {mode === "presets" && (
          <div className="px-5 py-3 border-b border-border bg-background/50 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">Selecione o Comparativo:</span>
              <select
                value={selectedPresetKey}
                onChange={(e) => setSelectedPresetKey(e.target.value)}
                className="bg-card border border-border rounded-xl px-3 py-1.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="mastercard_data_integrity">
                  Mastercard: Data Integrity Edits 30/31 (V1 vs V2)
                </option>
                <option value="capk_key_extension">
                  Mastercard: CAPK M/Chip Key Extension (2025 vs 2026)
                </option>
                <option value="visa_daf_tokenization">
                  Visa: DAF & 3DS E-Commerce Mandates (2024 vs 2026)
                </option>
              </select>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-red-500 font-semibold">{currentDiff.sourceRelease}</span>
              <ArrowRight size={13} className="text-muted-foreground" />
              <span className="text-emerald-500 font-bold">{currentDiff.targetRelease}</span>
            </div>
          </div>
        )}

        {/* Upload Mode Dropzones when not yet analyzed */}
        {mode === "upload" && !customDiffData && (
          <div className="p-6 bg-card border-b border-border space-y-5">
            <div className="text-center max-w-lg mx-auto">
              <h3 className="text-sm font-bold text-foreground">Arraste e Solte os Boletins em PDF</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Envie o PDF da versão anterior (base) e o PDF da nova versão (alvo). O motor analisará campos ISO, mandatórios e taxas automaticamente.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Dropzone A: Versão Anterior */}
              <div
                className={`relative border-2 border-dashed rounded-2xl p-5 text-center transition-all ${
                  fileA ? "border-blue-500/50 bg-blue-500/5" : "border-border hover:border-blue-500/40 hover:bg-muted/30"
                }`}
              >
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setFileA(e.target.files?.[0] || null)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="flex flex-col items-center justify-center pointer-events-none">
                  <div className="p-3 rounded-full bg-muted text-muted-foreground mb-2">
                    <FileIcon size={20} />
                  </div>
                  <span className="text-xs font-bold text-foreground">PDF 1: Versão Anterior (Base)</span>
                  <span className="text-[11px] text-muted-foreground mt-0.5">Opcional para comparação delta</span>
                  {fileA ? (
                    <div className="mt-3 px-3 py-1 rounded-lg bg-blue-500/10 text-blue-500 text-xs font-semibold flex items-center gap-1.5 max-w-full truncate">
                      <Check size={12} />
                      <span className="truncate">{fileA.name}</span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-blue-500 mt-2 font-semibold">Clique ou arraste o PDF aqui</span>
                  )}
                </div>
              </div>

              {/* Dropzone B: Versão Nova */}
              <div
                className={`relative border-2 border-dashed rounded-2xl p-5 text-center transition-all ${
                  fileB ? "border-emerald-500/50 bg-emerald-500/5" : "border-border hover:border-emerald-500/40 hover:bg-muted/30"
                }`}
              >
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setFileB(e.target.files?.[0] || null)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="flex flex-col items-center justify-center pointer-events-none">
                  <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-2">
                    <FileUp size={20} />
                  </div>
                  <span className="text-xs font-bold text-foreground">PDF 2: Versão Nova (Alvo)</span>
                  <span className="text-[11px] text-muted-foreground mt-0.5">Obrigatório para extração</span>
                  {fileB ? (
                    <div className="mt-3 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 text-xs font-semibold flex items-center gap-1.5 max-w-full truncate">
                      <Check size={12} />
                      <span className="truncate">{fileB.name}</span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-emerald-500 mt-2 font-semibold">Clique ou arraste o PDF aqui</span>
                  )}
                </div>
              </div>
            </div>

            {analysisError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-500 flex items-center gap-2">
                <AlertTriangle size={14} className="shrink-0" />
                <span>{analysisError}</span>
              </div>
            )}

            <div className="flex justify-center pt-2">
              <button
                disabled={!fileB || isAnalyzing}
                onClick={handleAnalyzePdfs}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 text-white text-xs font-bold shadow-lg shadow-blue-500/25 transition-all transform active:scale-95"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Extraindo e Comparando Textos dos PDFs...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={15} />
                    <span>Analisar e Gerar Diff Automático</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-border px-5 bg-muted/20 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-2.5 px-3 border-b-2 transition-colors ${
              activeTab === "overview"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Visão Geral & Mudanças
          </button>
          <button
            onClick={() => setActiveTab("fields")}
            className={`py-2.5 px-3 border-b-2 transition-colors ${
              activeTab === "fields"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Campos ISO ({currentDiff.fieldsChanges.length})
          </button>
          <button
            onClick={() => setActiveTab("mandates")}
            className={`py-2.5 px-3 border-b-2 transition-colors ${
              activeTab === "mandates"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Prazos & Mandatórios ({currentDiff.mandates.length})
          </button>
          <button
            onClick={() => setActiveTab("fees")}
            className={`py-2.5 px-3 border-b-2 transition-colors ${
              activeTab === "fees"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Tarifas & Assessments ({currentDiff.feesImpact.length})
          </button>
          <button
            onClick={() => setActiveTab("roles")}
            className={`py-2.5 px-3 border-b-2 transition-colors ${
              activeTab === "roles"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Impacto por Ator ({currentDiff.rolesImpact.length})
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {activeTab === "overview" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs sm:text-sm">
                <span className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5 mb-1">
                  <Sparkles size={15} /> Resumo Executivo das Diferenças
                </span>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  Comparação direta entre as versões do regulamento de <strong>{currentDiff.brand}</strong>. Foram detectadas{" "}
                  <strong>{currentDiff.fieldsChanges.length} alterações estruturais de campos</strong>,{" "}
                  <strong>{currentDiff.mandates.length} novos marcos de vigência obrigatória</strong> e{" "}
                  <strong>{currentDiff.feesImpact.length} impactos tarifários ou penalidades</strong>.
                </p>
              </div>

              {/* Highlights 3-col */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl border border-border bg-card">
                  <div className="text-xs text-muted-foreground font-medium mb-1">Campos Modificados</div>
                  <div className="text-2xl font-black text-amber-500">{currentDiff.fieldsChanges.length}</div>
                  <div className="text-[11px] text-muted-foreground mt-1">ISO 8583 / IPM / EMV</div>
                </div>
                <div className="p-3.5 rounded-xl border border-border bg-card">
                  <div className="text-xs text-muted-foreground font-medium mb-1">Regras Mandatórias</div>
                  <div className="text-2xl font-black text-blue-500">{currentDiff.mandates.length}</div>
                  <div className="text-[11px] text-muted-foreground mt-1">Com datas de Comply-by</div>
                </div>
                <div className="p-3.5 rounded-xl border border-border bg-card">
                  <div className="text-xs text-muted-foreground font-medium mb-1">Impactos Tarifários</div>
                  <div className="text-2xl font-black text-red-500">{currentDiff.feesImpact.length}</div>
                  <div className="text-[11px] text-muted-foreground mt-1">Assessments / Penalidades</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "fields" && (
            <div className="space-y-3">
              {currentDiff.fieldsChanges.map((f, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-border bg-card flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                          f.status === "novo"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : f.status === "alterado"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                            : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                        }`}
                      >
                        {f.status}
                      </span>
                      <span className="font-mono font-bold text-sm text-foreground">
                        {f.field} {f.subfield ? `• ${f.subfield}` : ""}
                      </span>
                      <span className="text-xs text-muted-foreground font-medium">({f.name})</span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{f.description}</p>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-md shrink-0 ${
                      f.impact === "Alto"
                        ? "bg-red-500/10 text-red-500 border border-red-500/30"
                        : f.impact === "Médio"
                        ? "bg-amber-500/10 text-amber-500 border border-amber-500/30"
                        : "bg-slate-500/10 text-slate-400 border border-slate-500/30"
                    }`}
                  >
                    Impacto {f.impact}
                  </span>
                </div>
              ))}
            </div>
          )}

          {activeTab === "mandates" && (
            <div className="space-y-3">
              {currentDiff.mandates.map((m, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-border bg-card space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-foreground">{m.rule}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20 uppercase">
                      Mandatório
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{m.description}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-border/60 text-xs">
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-bold block">Início / Piloto:</span>
                      <span className="font-semibold text-foreground">{m.pilotDate}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-bold block">Vigência Final:</span>
                      <span className="font-semibold text-blue-500">{m.effectiveDate}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-bold block">Penalidades a partir de:</span>
                      <span className="font-semibold text-red-500">{m.penaltyDate || "N/A"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "fees" && (
            <div className="space-y-3">
              {currentDiff.feesImpact.map((fee, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-border bg-card space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-muted text-foreground">
                        {fee.code}
                      </span>
                      <span className="text-sm font-bold text-foreground">{fee.name}</span>
                    </div>
                    <span className="text-xs font-bold text-red-500">{fee.type}</span>
                  </div>
                  <div className="text-base font-extrabold text-red-600 dark:text-red-400">
                    {fee.amount}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <strong>Gatilho de Cobrança:</strong> {fee.condition}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "roles" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentDiff.rolesImpact.map((r, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-border bg-card flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-bold text-foreground">{r.role}</h4>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          r.risk === "Alto"
                            ? "bg-red-500/10 text-red-500"
                            : r.risk === "Médio"
                            ? "bg-amber-500/10 text-amber-500"
                            : "bg-blue-500/10 text-blue-500"
                        }`}
                      >
                        Risco {r.risk}
                      </span>
                    </div>
                    <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside leading-relaxed">
                      {r.actions.map((act, i) => (
                        <li key={i}>{act}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-border bg-muted/30 flex items-center justify-between shrink-0">
          <span className="text-xs text-muted-foreground">
            O comparativo será inserido como tabela executiva no documento.
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleInsert}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
            >
              {isCopied ? <Check size={14} /> : <Download size={14} />}
              <span>{isCopied ? "Inserido com Sucesso!" : "Inserir Relatório no Documento"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
