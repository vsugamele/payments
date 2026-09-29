"use client";

import React, { useState } from "react";
import {
  Cpu,
  Search,
  Check,
  X,
  FileText,
  ShieldAlert,
  ArrowRight,
  Download,
  AlertTriangle,
  Layers,
  Sparkles,
} from "lucide-react";

export interface BehaviorFieldItem {
  id: string;
  brand: string;
  fieldCode: string;
  subfield?: string;
  name: string;
  phase: "Autorização" | "Clearing / Liquidação" | "Disputa";
  messages: string[];
  format: string;
  functionalDescription: string;
  roles: {
    acquirer: {
      action: "envia" | "valida";
      requirement: "Mandatório" | "Condicional" | "Opcional";
      description: string;
      technicalDetail: string;
    };
    issuer: {
      action: "recebe" | "responde";
      requirement: "Mandatório" | "Condicional";
      description: string;
      technicalDetail: string;
    };
  };
  flow: {
    outbound: string;
    inboundResponse: string;
    clearingImpact: string;
  };
  financialImpact: string;
  bulletins: string[];
}

export const BEHAVIOR_FIELDS_DATA: BehaviorFieldItem[] = [
  {
    id: "MC-DE003-SF1",
    brand: "Mastercard",
    fieldCode: "DE 003",
    subfield: "SF1",
    name: "Processing Code — Cardholder Transaction Type",
    phase: "Autorização",
    messages: ["0100 (Authorization Request)", "0110 (Authorization Response)"],
    format: "n 2 (Numérico fixo de 2 posições)",
    functionalDescription:
      "Identifica o tipo de transação do portador. Valor 20 = Purchase Return/Refund. É o campo de escopo usado pelo Data Integrity Monitoring Program para selecionar quais autorizações entram na fiscalização dos edits de reembolso (Edit 30 e Edit 31).",
    roles: {
      acquirer: {
        action: "envia",
        requirement: "Mandatório",
        description:
          "Enviar corretamente o código 20 quando a transação for reembolso ou estorno de compra, para que o fluxo de autorização e a fiscalização funcionem sobre a base correta.",
        technicalDetail: "Popular DE 3 SF1 = 20 em transações de Purchase Return/Refund.",
      },
      issuer: {
        action: "recebe",
        requirement: "Mandatório",
        description:
          "Reconhecer DE 3 SF1 = 20 como reembolso e responder com código de autorização válido (não declinar indevidamente por saldo insuficiente).",
        technicalDetail:
          "Garantir que o autorizador trate separadamente as transações com DE 3 SF1 = 20 para fins de compliance com os Edits 30/31 do Data Integrity.",
      },
    },
    flow: {
      outbound: "Adquirente ➔ Bandeira ➔ Emissor: Authorization Request (0100) com DE 3 SF1 = 20.",
      inboundResponse:
        "Emissor ➔ Bandeira ➔ Adquirente: Authorization Request Response (0110) com DE 39 fiscalizado pelos Edits 30/31.",
      clearingImpact: "N/A — os edits atuam estritamente no fluxo online de autorização.",
    },
    financialImpact:
      "Emissores que retornam declines indevidos sofrem assessment progressivo mensal sob o código tarifário 2DC0100 (USD 2.500 a USD 25.000/mês).",
    bulletins: ["GLB 6409.2 — Data Integrity Monitoring Program Edits for Purchase Refund Authorizations"],
  },
  {
    id: "MC-DE039",
    brand: "Mastercard",
    fieldCode: "DE 039",
    subfield: "SF1",
    name: "Response Code — Validação de Rejeição de Devoluções",
    phase: "Autorização",
    messages: ["0110 (Authorization Response)"],
    format: "an 2 (Alfanumérico fixo de 2 posições)",
    functionalDescription:
      "Contém o resultado da decisão do emissor sobre a solicitação de autorização. No escopo do Edit 30, os códigos 10 (Partial Approval), 12 (Invalid Tx), 51 (Insufficient Funds) e 57 (Transaction Not Permitted) são tipificados como declínio inválido para transações de reembolso.",
    roles: {
      acquirer: {
        action: "valida",
        requirement: "Mandatório",
        description:
          "Interpretar a resposta do emissor. Se houver recusa em reembolso, acionar fluxo de contingência ou estorno manual no gateway.",
        technicalDetail: "Receber e registrar DE 39 para auditoria e chargebacks.",
      },
      issuer: {
        action: "responde",
        requirement: "Mandatório",
        description:
          "Ajustar a lógica do autorizador para não recusar reembolsos com códigos de falta de saldo (51) ou transação não permitida (57), exceto se for pré-pago não-recarregável.",
        technicalDetail: "Tratar flags TR52/FIT1 para contas pré-pagas.",
      },
    },
    flow: {
      outbound: "N/A (Campo de resposta do emissor).",
      inboundResponse: "Emissor envia DE 39 preenchido com código de aprovação (00) ou recusa justificada.",
      clearingImpact: "Transações recusadas na autorização não geram registros de clearing no IPM.",
    },
    financialImpact:
      "Risco direto de penalidade financeira do Data Integrity para o emissor (Edit 30).",
    bulletins: ["GLB 6409.2", "AN 1430 Revised Standards — Refund Transactions"],
  },
  {
    id: "MC-DE048-SE22",
    brand: "Mastercard",
    fieldCode: "DE 048",
    subfield: "SE 22",
    name: "Private Data — 3DS CAVV & Token Authentication Data",
    phase: "Autorização",
    messages: ["0100 (Auth Request)", "0110 (Auth Response)"],
    format: "ans ...999 (Variável)",
    functionalDescription:
      "Transporta o criptograma do 3D Secure (CAVV/AAV) e os dados de validação de autenticação do portador em compras no comércio eletrônico (CNP).",
    roles: {
      acquirer: {
        action: "envia",
        requirement: "Condicional",
        description:
          "Obrigatório em transações de e-commerce autenticadas via 3DS 2.2+. Garante repasse íntegro do CAVV gerado pelo Directory Server.",
        technicalDetail: "Popular subcampo SE 22 com CAVV, ECI e Protocol Version.",
      },
      issuer: {
        action: "recebe",
        requirement: "Mandatório",
        description:
          "Validar o criptograma junto ao módulo Access Control Server (ACS) e aplicar liability shift em caso de fraude.",
        technicalDetail: "Validar assinatura criptográfica antes de aprovar a transação.",
      },
    },
    flow: {
      outbound: "Adquirente ➔ Bandeira: Envia DE 48 com SE 22 preenchido pelo gateway de pagamento.",
      inboundResponse: "Emissor valida e retorna DE 39 = 00 e DE 48 com aprovação do liability shift.",
      clearingImpact: "O ECI e dados do DE 48 são espelhados no arquivo de clearing (IPM PDS 0022/PDS 0023).",
    },
    financialImpact:
      "A ausência indevida do subcampo em transações autenticadas resulta em Downgrade de Intercâmbio (perda de 0,50% a 0,90% de margem) e perda da proteção contra chargeback de fraude (Reason Code 4837).",
    bulletins: ["GLB 13315.1 — Mastercard Dual Message System Rules"],
  },
  {
    id: "VI-FIELD-108",
    brand: "Visa",
    fieldCode: "Field 108",
    subfield: "DAF Data",
    name: "Digital Authentication Framework (DAF) Trace Data",
    phase: "Autorização",
    messages: ["0100 (Authorization Request)", "Base II Clearing (TC 05)"],
    format: "ans ...255",
    functionalDescription:
      "Campo proprietário da Visa para transportar a comprovação de autenticação delegada do portador (DAF). Permite que pagamentos recorrentes ou de um clique recebam liability shift sem passar por um desafio 3DS completo a cada transação.",
    roles: {
      acquirer: {
        action: "envia",
        requirement: "Condicional",
        description:
          "Garantir envio da tag DAF associada ao token de bandeira ou credencial de autenticação verificada.",
        technicalDetail: "Preencher Field 108 com ID de autenticação delegada e indicador DAF.",
      },
      issuer: {
        action: "recebe",
        requirement: "Mandatório",
        description:
          "Reconhecer a credencial DAF e não declinar a transação sob justificativa de falta de 3DS.",
        technicalDetail: "Tratar liability shift automático no Visa Resolve Online (VROL).",
      },
    },
    flow: {
      outbound: "Gateway ➔ Adquirente ➔ VisaNet: Field 108 populado com DAF Token.",
      inboundResponse: "VisaNet valida regras de elegibilidade e encaminha ao emissor com flag de aprovação prévia.",
      clearingImpact: "Repassado nos registros de clearing TC 05 / TC 15 da Base II.",
    },
    financialImpact:
      "Isenção de tarifas de chargeback de fraude não reconhecida (Reason Code 10.4) e qualificação para tarifas reduzidas de intercâmbio de e-commerce seguro.",
    bulletins: ["Visa Digital Authentication Framework Implementation Guide 2025/2026"],
  },
];

interface BehaviorEngineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertHtml: (html: string) => void;
}

export default function BehaviorEngineModal({
  isOpen,
  onClose,
  onInsertHtml,
}: BehaviorEngineModalProps) {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedField, setSelectedField] = useState<BehaviorFieldItem>(BEHAVIOR_FIELDS_DATA[0]);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const filteredFields = BEHAVIOR_FIELDS_DATA.filter(
    (item) =>
      item.fieldCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const generateFichaHtml = (item: BehaviorFieldItem): string => {
    return `
      <div style="background:#ffffff; border:1px solid #cbd5e1; border-top:5px solid #0f2c59; border-radius:12px; padding:20px; margin:1.5rem 0; font-family:system-ui, -apple-system, sans-serif;">
        <!-- Header da Ficha -->
        <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:1px solid #e2e8f0; padding-bottom:12px; margin-bottom:14px;">
          <div>
            <span style="background:#0f2c59; color:#ffffff; font-size:10px; font-weight:bold; padding:3px 8px; border-radius:4px; text-transform:uppercase;">
              Ficha Técnica de Comportamento • ${item.brand}
            </span>
            <h3 style="margin:6px 0 2px 0; color:#0f172a; font-size:17px; font-weight:800;">
              ${item.fieldCode} ${item.subfield ? `(${item.subfield})` : ""} — ${item.name}
            </h3>
            <div style="font-size:12px; color:#64748b;">
              <strong>ID Catálogo:</strong> ${item.id} &nbsp;•&nbsp; 
              <strong>Fase do Ciclo:</strong> ${item.phase} &nbsp;•&nbsp; 
              <strong>Formato:</strong> <code>${item.format}</code>
            </div>
          </div>
          <span style="background:#eff6ff; color:#1e40af; border:1px solid #bfdbfe; font-size:11px; font-weight:bold; padding:4px 10px; border-radius:99px;">
            ${item.messages[0]}
          </span>
        </div>

        <!-- Descrição Funcional -->
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px; margin-bottom:16px;">
          <strong style="color:#1e293b; font-size:12px; text-transform:uppercase; display:block; margin-bottom:4px;">
            Definição & Comportamento Funcional:
          </strong>
          <p style="margin:0; font-size:12.5px; color:#334155; line-height:1.6;">
            ${item.functionalDescription}
          </p>
        </div>

        <!-- Matriz de Papéis: Quem Envia x Quem Recebe -->
        <h4 style="margin:0 0 8px 0; color:#0f172a; font-size:13px; text-transform:uppercase; letter-spacing:0.5px;">
          1. Distribuição de Responsabilidades por Papel
        </h4>
        <div data-layout="dual-cards" class="dual-cards-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:16px;">
          <!-- Papel Adquirente -->
          <div style="background:#eff6ff; border:1px solid #bfdbfe; border-left:4px solid #2563eb; border-radius:8px; padding:12px;">
            <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
              <strong style="color:#1e40af; font-size:13px;">🏦 Adquirente / Credenciador</strong>
              <span style="font-size:10px; font-weight:bold; background:#2563eb; color:#fff; padding:1px 6px; border-radius:4px; text-transform:uppercase;">
                ${item.roles.acquirer.action} (${item.roles.acquirer.requirement})
              </span>
            </div>
            <p style="margin:0 0 6px 0; font-size:12px; color:#334155; line-height:1.5;">
              ${item.roles.acquirer.description}
            </p>
            <div style="font-size:11px; color:#1e40af; font-family:monospace; background:rgba(37,99,235,0.08); padding:4px 8px; border-radius:4px;">
              <strong>Desenvolver:</strong> ${item.roles.acquirer.technicalDetail}
            </div>
          </div>

          <!-- Papel Emissor -->
          <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-left:4px solid #16a34a; border-radius:8px; padding:12px;">
            <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
              <strong style="color:#166534; font-size:13px;">💳 Emissor / Banco</strong>
              <span style="font-size:10px; font-weight:bold; background:#16a34a; color:#fff; padding:1px 6px; border-radius:4px; text-transform:uppercase;">
                ${item.roles.issuer.action} (${item.roles.issuer.requirement})
              </span>
            </div>
            <p style="margin:0 0 6px 0; font-size:12px; color:#334155; line-height:1.5;">
              ${item.roles.issuer.description}
            </p>
            <div style="font-size:11px; color:#166534; font-family:monospace; background:rgba(22,163,74,0.08); padding:4px 8px; border-radius:4px;">
              <strong>Validar:</strong> ${item.roles.issuer.technicalDetail}
            </div>
          </div>
        </div>

        <!-- Ciclo de Ida e Volta -->
        <h4 style="margin:0 0 8px 0; color:#0f172a; font-size:13px; text-transform:uppercase; letter-spacing:0.5px;">
          2. Rastreamento do Fluxo de Mensageria (Ida & Volta)
        </h4>
        <table style="width:100%; border-collapse:collapse; margin-bottom:16px; font-size:12px;">
          <tbody>
            <tr style="border-bottom:1px solid #e2e8f0; background:#f8fafc;">
              <td style="padding:8px 10px; font-weight:bold; width:130px; color:#1e40af;">Fluxo de Ida:</td>
              <td style="padding:8px 10px; color:#334155;">${item.flow.outbound}</td>
            </tr>
            <tr style="border-bottom:1px solid #e2e8f0;">
              <td style="padding:8px 10px; font-weight:bold; width:130px; color:#16a34a;">Retorno (Response):</td>
              <td style="padding:8px 10px; color:#334155;">${item.flow.inboundResponse}</td>
            </tr>
            <tr style="background:#f8fafc;">
              <td style="padding:8px 10px; font-weight:bold; width:130px; color:#d97706;">Clearing (Liquidação):</td>
              <td style="padding:8px 10px; color:#334155;">${item.flow.clearingImpact}</td>
            </tr>
          </tbody>
        </table>

        <!-- Impacto Financeiro & Boletins de Origem -->
        <div style="background:#fef2f2; border:1px solid #fee2e2; border-radius:8px; padding:12px; margin-bottom:8px;">
          <div style="font-size:12px; color:#991b1b; font-weight:bold; margin-bottom:4px;">
            ⚠️ Impacto Financeiro & Regra de Downgrade / Penalidade:
          </div>
          <p style="margin:0; font-size:12px; color:#7f1d1d; line-height:1.5;">
            ${item.financialImpact}
          </p>
        </div>

        <div style="font-size:11px; color:#64748b; margin-top:8px;">
          <strong>Boletim Oficial de Referência:</strong> ${item.bulletins.join("; ")}
        </div>
      </div>
      <p></p>
    `;
  };

  const handleInsert = () => {
    onInsertHtml(generateFichaHtml(selectedField));
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-card border border-border shadow-2xl rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-foreground">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border bg-muted/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Cpu size={20} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
                <span>Motor de Comportamento de Campos & Regras</span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-semibold">
                  Behavior Engine
                </span>
              </h2>
              <p className="text-xs text-muted-foreground">
                Consulte o comportamento de campos ISO 8583/IPM e injete a ficha técnica de engenharia no documento.
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

        {/* Content Body: Sidebar list + Detail View */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left: Search & Field List */}
          <div className="w-full md:w-80 border-r border-border bg-muted/20 flex flex-col shrink-0">
            <div className="p-3 border-b border-border">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar DE, campo ou boletim..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-card border border-border text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-foreground"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredFields.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedField(item)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex flex-col gap-0.5 ${
                    selectedField.id === item.id
                      ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-semibold"
                      : "hover:bg-muted/60 text-foreground"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold">
                      {item.fieldCode} {item.subfield ? `• ${item.subfield}` : ""}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">
                      {item.brand}
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground truncate">{item.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Selected Field Preview */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            <div className="flex items-start justify-between gap-3 border-b border-border pb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                    {selectedField.brand}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">{selectedField.id}</span>
                </div>
                <h3 className="text-base sm:text-lg font-extrabold text-foreground">
                  {selectedField.fieldCode} {selectedField.subfield ? `(${selectedField.subfield})` : ""} — {selectedField.name}
                </h3>
              </div>

              <span className="text-xs px-2.5 py-1 rounded-md bg-muted text-foreground font-mono shrink-0">
                {selectedField.format}
              </span>
            </div>

            {/* Description */}
            <div className="p-3.5 rounded-xl bg-card border border-border text-xs leading-relaxed text-slate-700 dark:text-slate-300">
              <strong className="text-foreground block mb-1">Definição Operacional:</strong>
              {selectedField.functionalDescription}
            </div>

            {/* Roles Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-blue-500/5 border border-blue-500/20 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <strong className="text-blue-600 dark:text-blue-400">Adquirente (Envio)</strong>
                  <span className="text-[10px] font-bold bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded">
                    {selectedField.roles.acquirer.requirement}
                  </span>
                </div>
                <p className="text-muted-foreground">{selectedField.roles.acquirer.description}</p>
                <div className="text-[11px] font-mono text-blue-600 dark:text-blue-400 pt-1 border-t border-blue-500/20">
                  {selectedField.roles.acquirer.technicalDetail}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <strong className="text-emerald-600 dark:text-emerald-400">Emissor (Resposta)</strong>
                  <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded">
                    {selectedField.roles.issuer.requirement}
                  </span>
                </div>
                <p className="text-muted-foreground">{selectedField.roles.issuer.description}</p>
                <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 pt-1 border-t border-emerald-500/20">
                  {selectedField.roles.issuer.technicalDetail}
                </div>
              </div>
            </div>

            {/* Financial Risk */}
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400">
              <strong className="flex items-center gap-1.5 mb-1 font-bold">
                <AlertTriangle size={14} /> Risco Financeiro & Downgrade:
              </strong>
              {selectedField.financialImpact}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/30 flex items-center justify-between shrink-0">
          <span className="text-xs text-muted-foreground">
            A ficha técnica completa será injetada no cursor com tabela de fluxos e requisitos.
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
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all"
            >
              {isCopied ? <Check size={14} /> : <Download size={14} />}
              <span>{isCopied ? "Ficha Inserida!" : "Inserir Ficha no Documento"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
