"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Undo,
  Redo,
  Sparkles,
  Download,
  FileText,
  Printer,
  Copy,
  Plus,
  FolderOpen,
  Settings,
  Highlighter,
  Table as TableIcon,
  Minus,
  Quote,
  CheckCircle2,
  Bot,
  PanelRightClose,
  PanelRightOpen,
  Upload,
  Clock,
  Eye,
  Check,
  AlertCircle,
  HelpCircle,
  Code,
  Share2,
  Palette,
  LayoutGrid,
  Tag,
  ChevronDown,
  Layers,
  Box,
} from "lucide-react";
import { exportHtmlToDocx } from "@/components/editor/DocxExporter";
import { DOCUMENT_TEMPLATES, DocumentTemplate } from "@/components/editor/TemplateSelector";
import AiFloatingToolbar from "@/components/editor/AiFloatingToolbar";
import AiCopilotSidebar from "@/components/editor/AiCopilotSidebar";
import DocManagerModal, { SavedDoc } from "@/components/editor/DocManagerModal";
import AiSettingsModal from "@/components/editor/AiSettingsModal";

export default function DocStudioEditor() {
  // Document State
  const [docId, setDocId] = useState<string>("doc-default");
  const [docTitle, setDocTitle] = useState<string>("Documento Estratégico — Proposta de Pagamentos");
  const [contentHtml, setContentHtml] = useState<string>("");
  const [savedDocs, setSavedDocs] = useState<SavedDoc[]>([]);
  const [isSaved, setIsSaved] = useState<boolean>(true);
  const [lastSavedTime, setLastSavedTime] = useState<string>("agora");

  // Selection & Floating AI Toolbar State
  const [selectedText, setSelectedText] = useState<string>("");
  const [floatingPos, setFloatingPos] = useState<{ top: number; left: number } | null>(null);
  const savedRangeRef = useRef<Range | null>(null);

  // Dropdown States for Colors, Cards, Tables, Badges
  const [showTextColorPicker, setShowTextColorPicker] = useState<boolean>(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState<boolean>(false);
  const [showCardsMenu, setShowCardsMenu] = useState<boolean>(false);
  const [showTablesMenu, setShowTablesMenu] = useState<boolean>(false);
  const [showBadgesMenu, setShowBadgesMenu] = useState<boolean>(false);

  // UI Modals & Sidebar State
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(true);
  const [isDocManagerOpen, setIsDocManagerOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  // AI Configuration State
  const [aiApiKey, setAiApiKey] = useState<string>("");
  const [aiProvider, setAiProvider] = useState<string>("openai");
  const [aiModel, setAiModel] = useState<string>("gpt-4o-mini");

  // Word Counts
  const [stats, setStats] = useState({ words: 0, chars: 0, readTimeMinutes: 1, estimatedPages: 1 });

  const editorRef = useRef<HTMLDivElement>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Close all popovers when clicking outside
  const closeAllMenus = () => {
    setShowTextColorPicker(false);
    setShowBgColorPicker(false);
    setShowCardsMenu(false);
    setShowTablesMenu(false);
    setShowBadgesMenu(false);
  };

  // Initialize from LocalStorage or Default Template
  useEffect(() => {
    const storedKey = localStorage.getItem("vs_ai_api_key") || "";
    const storedProvider = localStorage.getItem("vs_ai_provider") || "openai";
    const storedModel = localStorage.getItem("vs_ai_model") || "gpt-4o-mini";
    setAiApiKey(storedKey);
    setAiProvider(storedProvider);
    setAiModel(storedModel);

    const rawDocs = localStorage.getItem("vs_saved_documents");
    if (rawDocs) {
      try {
        const parsed: SavedDoc[] = JSON.parse(rawDocs);
        setSavedDocs(parsed);
        if (parsed.length > 0) {
          const first = parsed[0];
          setDocId(first.id);
          setDocTitle(first.title);
          setContentHtml(first.content);
          if (editorRef.current) {
            editorRef.current.innerHTML = first.content;
          }
          return;
        }
      } catch (e) {
        console.error("Error loading saved docs", e);
      }
    }

    const defaultTmpl = DOCUMENT_TEMPLATES[1]; // Proposta de pagamentos
    setDocId("doc-" + Date.now());
    setDocTitle(defaultTmpl.defaultTitle);
    setContentHtml(defaultTmpl.content);
    if (editorRef.current) {
      editorRef.current.innerHTML = defaultTmpl.content;
    }
  }, []);

  const updateStats = useCallback((text: string) => {
    const plainText = text.replace(/<[^>]*>?/gm, " ").trim();
    const words = plainText ? plainText.split(/\s+/).filter(Boolean).length : 0;
    const chars = plainText.length;
    const readTimeMinutes = Math.max(1, Math.ceil(words / 200));
    const estimatedPages = Math.max(1, Math.ceil(words / 450));
    setStats({ words, chars, readTimeMinutes, estimatedPages });
  }, []);

  const handleEditorInput = () => {
    if (!editorRef.current) return;
    const newHtml = editorRef.current.innerHTML;
    setContentHtml(newHtml);
    setIsSaved(false);
    updateStats(newHtml);

    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      saveDocument(newHtml, docTitle, docId);
    }, 1200);
  };

  const saveDocument = (html: string, title: string, id: string) => {
    const now = new Date().toISOString();
    setSavedDocs((prev) => {
      const existingIdx = prev.findIndex((d) => d.id === id);
      let updated: SavedDoc[];
      if (existingIdx >= 0) {
        updated = [...prev];
        updated[existingIdx] = { id, title, content: html, updatedAt: now };
      } else {
        updated = [{ id, title, content: html, updatedAt: now }, ...prev];
      }
      localStorage.setItem("vs_saved_documents", JSON.stringify(updated));
      return updated;
    });
    setIsSaved(true);
    setLastSavedTime(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
  };

  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !editorRef.current) {
      setFloatingPos(null);
      setSelectedText("");
      savedRangeRef.current = null;
      return;
    }

    const text = selection.toString().trim();
    if (text.length > 2) {
      const range = selection.getRangeAt(0);
      savedRangeRef.current = range.cloneRange();
      const rect = range.getBoundingClientRect();
      setSelectedText(text);
      setFloatingPos({
        top: rect.top - 60,
        left: rect.left,
      });
    } else {
      setFloatingPos(null);
      setSelectedText("");
    }
  };

  const execCmd = (command: string, value: string = "") => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
      handleEditorInput();
    }
  };

  // Color Palettes
  const textColors = [
    { name: "Padrão", color: "#1e293b" },
    { name: "Azul Real", color: "#2563eb" },
    { name: "Azul Marinho", color: "#0f2c59" },
    { name: "Verde Esmeralda", color: "#059669" },
    { name: "Roxo", color: "#7c3aed" },
    { name: "Âmbar", color: "#d97706" },
    { name: "Vermelho", color: "#dc2626" },
    { name: "Cinza", color: "#64748b" },
  ];

  const bgHighlightColors = [
    { name: "Amarelo Suave", color: "#fef08a" },
    { name: "Verde Menta", color: "#bbf7d0" },
    { name: "Azul Céu", color: "#bfdbfe" },
    { name: "Lavanda", color: "#e9d5ff" },
    { name: "Rosa Pastel", color: "#fbcfe8" },
    { name: "Laranja Pêssego", color: "#fed7aa" },
    { name: "Sem Destaque", color: "transparent" },
  ];

  // Insert Card / Callout Box
  const handleInsertCard = (style: "blue" | "green" | "amber" | "purple" | "dark" | "gradient") => {
    closeAllMenus();
    let cardHtml = "";

    switch (style) {
      case "blue":
        cardHtml = `
          <div style="background:#eff6ff; border:1px solid #bfdbfe; border-left:5px solid #2563eb; border-radius:12px; padding:16px 20px; margin:1.25rem 0;">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px; color:#1e40af; font-weight:bold; font-size:0.95rem;">
              <span>💡</span>
              <span>INSIGHT EXECUTIVO & ESTRATÉGIA</span>
            </div>
            <p style="margin:0; color:#1e293b; font-size:0.9rem; line-height:1.6;">
              Insira aqui a diretriz executiva, oportunidade de receita ou resumo estratégico desta seção...
            </p>
          </div>
          <p></p>
        `;
        break;

      case "green":
        cardHtml = `
          <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-left:5px solid #16a34a; border-radius:12px; padding:16px 20px; margin:1.25rem 0;">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px; color:#15803d; font-weight:bold; font-size:0.95rem;">
              <span>📈</span>
              <span>MÉTRICAS & IMPACTO FINANCEIRO (ROI)</span>
            </div>
            <p style="margin:0; color:#1e293b; font-size:0.9rem; line-height:1.6;">
              <strong>Resultado Projetado:</strong> Aumento de <strong>+3.4%</strong> na taxa de autorização e recuperação estimada de <strong>R$ 120.000/mês</strong> em churn involuntário.
            </p>
          </div>
          <p></p>
        `;
        break;

      case "amber":
        cardHtml = `
          <div style="background:#fffbeb; border:1px solid #fde68a; border-left:5px solid #d97706; border-radius:12px; padding:16px 20px; margin:1.25rem 0;">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px; color:#b45309; font-weight:bold; font-size:0.95rem;">
              <span>⚠️</span>
              <span>ATENÇÃO, REGRAS & COMPLIANCE</span>
            </div>
            <p style="margin:0; color:#1e293b; font-size:0.9rem; line-height:1.6;">
              Requisito mandatório das Bandeiras (Visa/Mastercard) e conformidade estrita com os limites de monitoria de chargeback.
            </p>
          </div>
          <p></p>
        `;
        break;

      case "purple":
        cardHtml = `
          <div style="background:#faf5ff; border:1px solid #e9d5ff; border-left:5px solid #9333ea; border-radius:12px; padding:16px 20px; margin:1.25rem 0;">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px; color:#7e22ce; font-weight:bold; font-size:0.95rem;">
              <span>⚡</span>
              <span>MECANISMO ÚNICO & ARQUITETURA TÉCNICA</span>
            </div>
            <p style="margin:0; color:#1e293b; font-size:0.9rem; line-height:1.6;">
              Implementação de orquestração desacoplada com mensageria ISO 8583 otimizada e tokenização nativa na origem.
            </p>
          </div>
          <p></p>
        `;
        break;

      case "dark":
        cardHtml = `
          <div style="background:#0f172a; color:#f8fafc; border:1px solid #334155; border-radius:14px; padding:20px 24px; margin:1.25rem 0; box-shadow:0 4px 15px rgba(0,0,0,0.15);">
            <div style="color:#38bdf8; font-weight:bold; font-size:1rem; margin-bottom:8px; letter-spacing:0.5px;">
              🛡️ DIRETRIZ DE SEGURANÇA & LIABILTY SHIFT
            </div>
            <p style="margin:0; color:#cbd5e1; font-size:0.9rem; line-height:1.6;">
              Garantia de transferência de responsabilidade contra fraudes não reconhecidas através do protocolo 3DS 2.2 com autenticação biométrica e ECI 05.
            </p>
          </div>
          <p></p>
        `;
        break;

      case "gradient":
        cardHtml = `
          <div style="background:linear-gradient(135deg, rgba(37,99,235,0.08) 0%, rgba(124,58,237,0.08) 100%); border:1.5px solid #818cf8; border-radius:16px; padding:20px 24px; margin:1.25rem 0;">
            <div style="color:#4f46e5; font-weight:800; font-size:1rem; margin-bottom:6px;">
              ✨ RESUMO EXECUTIVO DE ALTO IMPACTO
            </div>
            <p style="margin:0; color:#1e293b; font-size:0.925rem; line-height:1.6;">
              Visão holística combinando tecnologia de ponta, governança normativa e escala financeira acelerada.
            </p>
          </div>
          <p></p>
        `;
        break;
    }

    execCmd("insertHTML", cardHtml);
  };

  // Insert Styled Table
  const handleInsertStyledTable = (theme: "blue" | "emerald" | "slate" | "matrix") => {
    closeAllMenus();
    let tableHtml = "";

    if (theme === "blue") {
      tableHtml = `
        <table style="width:100%; border-collapse:collapse; margin:1.5rem 0; font-size:0.875rem; border:1px solid #cbd5e1; border-radius:8px; overflow:hidden;">
          <thead>
            <tr style="background:#0f2c59; color:#ffffff;">
              <th style="padding:10px 14px; text-align:left; font-weight:bold; border:1px solid #1e3a8a;">Iniciativa / Alavanca</th>
              <th style="padding:10px 14px; text-align:left; font-weight:bold; border:1px solid #1e3a8a;">Tecnologia Aplicada</th>
              <th style="padding:10px 14px; text-align:left; font-weight:bold; border:1px solid #1e3a8a;">Prazo</th>
              <th style="padding:10px 14px; text-align:left; font-weight:bold; border:1px solid #1e3a8a;">Impacto Esperado</th>
            </tr>
          </thead>
          <tbody>
            <tr style="background:#f8fafc;">
              <td style="padding:10px 14px; border:1px solid #cbd5e1; font-weight:600; color:#0f2c59;">Network Tokens</td>
              <td style="padding:10px 14px; border:1px solid #cbd5e1;">VTS, MDES e Elo Token</td>
              <td style="padding:10px 14px; border:1px solid #cbd5e1;">Semana 2</td>
              <td style="padding:10px 14px; border:1px solid #cbd5e1; color:#16a34a; font-weight:600;">+2% a 4% Aprovação</td>
            </tr>
            <tr style="background:#ffffff;">
              <td style="padding:10px 14px; border:1px solid #cbd5e1; font-weight:600; color:#0f2c59;">Smart Retries</td>
              <td style="padding:10px 14px; border:1px solid #cbd5e1;">Matriz por Decline Code</td>
              <td style="padding:10px 14px; border:1px solid #cbd5e1;">Semana 3</td>
              <td style="padding:10px 14px; border:1px solid #cbd5e1; color:#16a34a; font-weight:600;">-25% Churn Involuntário</td>
            </tr>
            <tr style="background:#f8fafc;">
              <td style="padding:10px 14px; border:1px solid #cbd5e1; font-weight:600; color:#0f2c59;">Account Updater</td>
              <td style="padding:10px 14px; border:1px solid #cbd5e1;">VAU (Visa) e ABU (Mastercard)</td>
              <td style="padding:10px 14px; border:1px solid #cbd5e1;">Semana 4</td>
              <td style="padding:10px 14px; border:1px solid #cbd5e1; color:#16a34a; font-weight:600;">Zero perda em cartões trocados</td>
            </tr>
          </tbody>
        </table>
        <p></p>
      `;
    } else if (theme === "emerald") {
      tableHtml = `
        <table style="width:100%; border-collapse:collapse; margin:1.5rem 0; font-size:0.875rem; border:1px solid #a7f3d0;">
          <thead>
            <tr style="background:#065f46; color:#ffffff;">
              <th style="padding:10px 14px; text-align:left; border:1px solid #047857;">Métrica Financeira</th>
              <th style="padding:10px 14px; text-align:left; border:1px solid #047857;">Antes da Otimização</th>
              <th style="padding:10px 14px; text-align:left; border:1px solid #047857;">Meta Pós-Rollout</th>
              <th style="padding:10px 14px; text-align:left; border:1px solid #047857;">Ganho Mensal Estimado</th>
            </tr>
          </thead>
          <tbody>
            <tr style="background:#ecfdf5;">
              <td style="padding:10px 14px; border:1px solid #a7f3d0; font-weight:bold;">Taxa de Autorização</td>
              <td style="padding:10px 14px; border:1px solid #a7f3d0;">84.5%</td>
              <td style="padding:10px 14px; border:1px solid #a7f3d0; font-weight:bold; color:#047857;">88.2%</td>
              <td style="padding:10px 14px; border:1px solid #a7f3d0; color:#059669; font-weight:bold;">+ R$ 95.000,00</td>
            </tr>
            <tr style="background:#ffffff;">
              <td style="padding:10px 14px; border:1px solid #a7f3d0; font-weight:bold;">Índice de Chargeback</td>
              <td style="padding:10px 14px; border:1px solid #a7f3d0;">1.20% (Zona de Alerta)</td>
              <td style="padding:10px 14px; border:1px solid #a7f3d0; font-weight:bold; color:#047857;">0.45% (Seguro)</td>
              <td style="padding:10px 14px; border:1px solid #a7f3d0; color:#059669; font-weight:bold;">Isenção total de multas</td>
            </tr>
          </tbody>
        </table>
        <p></p>
      `;
    } else if (theme === "slate") {
      tableHtml = `
        <table style="width:100%; border-collapse:collapse; margin:1.5rem 0; font-size:0.875rem; border:1px solid #e2e8f0;">
          <thead>
            <tr style="background:#1e293b; color:#ffffff;">
              <th style="padding:10px 14px; text-align:left;">Componente</th>
              <th style="padding:10px 14px; text-align:left;">Responsável</th>
              <th style="padding:10px 14px; text-align:left;">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom:1px solid #e2e8f0;">
              <td style="padding:10px 14px; font-weight:600;">Parametrização ISO 8583 (DE 22)</td>
              <td style="padding:10px 14px;">Engenharia de Pagamentos</td>
              <td style="padding:10px 14px;"><span style="background:#dcfce7; color:#166534; padding:3px 8px; border-radius:99px; font-size:11px; font-weight:bold;">Concluído</span></td>
            </tr>
            <tr style="border-bottom:1px solid #e2e8f0;">
              <td style="padding:10px 14px; font-weight:600;">Homologação VTS com Adquirente</td>
              <td style="padding:10px 14px;">Operações / Bandeiras</td>
              <td style="padding:10px 14px;"><span style="background:#dbeafe; color:#1e40af; padding:3px 8px; border-radius:99px; font-size:11px; font-weight:bold;">Em Andamento</span></td>
            </tr>
          </tbody>
        </table>
        <p></p>
      `;
    } else {
      // 2x2 Matrix
      tableHtml = `
        <table style="width:100%; border-collapse:collapse; margin:1.5rem 0; font-size:0.875rem; border:2px solid #cbd5e1;">
          <thead>
            <tr style="background:#0f2c59; color:#fff;">
              <th colspan="2" style="padding:10px; text-align:center; font-size:0.95rem;">MATRIZ DE DECISÃO ESTRATÉGICA (2x2)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="width:50%; padding:14px; background:#eff6ff; border:1px solid #cbd5e1; vertical-align:top;">
                <strong style="color:#1e40af; font-size:0.9rem;">🚀 ALTO IMPACTO / BAIXO ESFORÇO (Prioridade 1)</strong>
                <ul style="margin:8px 0 0 16px; padding:0; font-size:0.85rem;">
                  <li>Ajuste do POS Entry Mode (DE 22 = 81)</li>
                  <li>Ativação de Smart Retries nos horários 06h-09h</li>
                </ul>
              </td>
              <td style="width:50%; padding:14px; background:#faf5ff; border:1px solid #cbd5e1; vertical-align:top;">
                <strong style="color:#7e22ce; font-size:0.9rem;">💎 ALTO IMPACTO / ALTO ESFORÇO (Prioridade 2)</strong>
                <ul style="margin:8px 0 0 16px; padding:0; font-size:0.85rem;">
                  <li>Integração direta com Network Tokens (VTS/MDES)</li>
                  <li>Motor de Cascata e Roteamento Multigenerativo</li>
                </ul>
              </td>
            </tr>
            <tr>
              <td style="width:50%; padding:14px; background:#f8fafc; border:1px solid #cbd5e1; vertical-align:top;">
                <strong style="color:#64748b; font-size:0.9rem;">⚙️ BAIXO IMPACTO / BAIXO ESFORÇO (Quick Wins)</strong>
                <ul style="margin:8px 0 0 16px; padding:0; font-size:0.85rem;">
                  <li>Higienização de cadastros de trials</li>
                  <li>Alertas de webhook em tempo real</li>
                </ul>
              </td>
              <td style="width:50%; padding:14px; background:#fff1f2; border:1px solid #cbd5e1; vertical-align:top;">
                <strong style="color:#be123c; font-size:0.9rem;">🚫 BAIXO IMPACTO / ALTO ESFORÇO (Evitar)</strong>
                <ul style="margin:8px 0 0 16px; padding:0; font-size:0.85rem;">
                  <li>Retentativas cegas em cartões cancelados (Hard Declines)</li>
                </ul>
              </td>
            </tr>
          </tbody>
        </table>
        <p></p>
      `;
    }

    execCmd("insertHTML", tableHtml);
  };

  // Insert Status Badge
  const handleInsertBadge = (label: string, bg: string, text: string, border: string) => {
    closeAllMenus();
    const badgeHtml = `&nbsp;<span style="display:inline-block; background:${bg}; color:${text}; border:1px solid ${border}; padding:2px 8px; border-radius:99px; font-size:0.75rem; font-weight:bold; letter-spacing:0.3px; vertical-align:middle;">${label}</span>&nbsp;`;
    execCmd("insertHTML", badgeHtml);
  };

  // Apply AI Replacement
  const handleApplyReplacement = (replacementHtml: string) => {
    if (savedRangeRef.current) {
      const range = savedRangeRef.current;
      range.deleteContents();
      const el = document.createElement("div");
      el.innerHTML = replacementHtml;
      const frag = document.createDocumentFragment();
      let node: Node | null;
      let lastNode: Node | null = null;
      while ((node = el.firstChild)) {
        lastNode = frag.appendChild(node);
      }
      range.insertNode(frag);
      if (lastNode) {
        range.setStartAfter(lastNode);
        range.collapse(true);
      }
      handleEditorInput();
    } else {
      execCmd("insertHTML", replacementHtml);
    }
    setFloatingPos(null);
    setSelectedText("");
  };

  const handleInsertBelow = (replacementHtml: string) => {
    if (savedRangeRef.current) {
      const range = savedRangeRef.current;
      range.collapse(false);
      const el = document.createElement("div");
      el.innerHTML = `<br/>${replacementHtml}`;
      range.insertNode(el);
      handleEditorInput();
    } else {
      execCmd("insertHTML", `<br/>${replacementHtml}`);
    }
    setFloatingPos(null);
    setSelectedText("");
  };

  const handleCopilotInsert = (html: string) => {
    if (editorRef.current) {
      editorRef.current.innerHTML += `<br/>${html}`;
      handleEditorInput();
    }
  };

  const handleCopilotReplace = (html: string) => {
    if (editorRef.current) {
      editorRef.current.innerHTML = html;
      handleEditorInput();
    }
  };

  const handleNewDocument = (template?: DocumentTemplate) => {
    const tmpl = template || DOCUMENT_TEMPLATES[0];
    const newId = "doc-" + Date.now();
    setDocId(newId);
    setDocTitle(tmpl.defaultTitle);
    setContentHtml(tmpl.content);
    if (editorRef.current) {
      editorRef.current.innerHTML = tmpl.content;
      editorRef.current.focus();
    }
    saveDocument(tmpl.content, tmpl.defaultTitle, newId);
    updateStats(tmpl.content);
  };

  const handleSelectDocument = (doc: SavedDoc) => {
    setDocId(doc.id);
    setDocTitle(doc.title);
    setContentHtml(doc.content);
    if (editorRef.current) {
      editorRef.current.innerHTML = doc.content;
    }
    updateStats(doc.content);
    setIsSaved(true);
  };

  const handleDeleteDocument = (id: string) => {
    setSavedDocs((prev) => {
      const updated = prev.filter((d) => d.id !== id);
      localStorage.setItem("vs_saved_documents", JSON.stringify(updated));
      return updated;
    });
    if (docId === id) {
      handleNewDocument(DOCUMENT_TEMPLATES[0]);
    }
  };

  const handleExportDocx = async () => {
    if (!editorRef.current) return;
    await exportHtmlToDocx(editorRef.current.innerHTML, docTitle);
  };

  const handleCopyFormatted = () => {
    if (!editorRef.current) return;
    navigator.clipboard.writeText(editorRef.current.innerText);
    setCopiedNotification("Texto copiado para a área de transferência!");
    setTimeout(() => setCopiedNotification(null), 2500);
  };

  return (
    <div
      onClick={closeAllMenus}
      className="flex flex-col h-[calc(100vh-64px)] bg-muted/20 text-foreground overflow-hidden font-sans"
    >
      
      {/* ── Top Header Bar ──────────────────────────────────────────────────────── */}
      <header className="h-14 border-b border-border bg-background/95 backdrop-blur-md px-4 flex items-center justify-between shrink-0 z-20">
        
        {/* Left: Document Info & Name */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsDocManagerOpen(true);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/60 hover:bg-muted text-xs font-semibold text-foreground border border-border transition-colors shrink-0"
          >
            <FolderOpen size={14} className="text-blue-500" />
            <span className="hidden sm:inline">Meus Documentos</span>
          </button>

          <div className="h-4 w-px bg-border shrink-0" />

          <div className="flex items-center gap-2 min-w-0">
            <input
              type="text"
              value={docTitle}
              onChange={(e) => {
                setDocTitle(e.target.value);
                setIsSaved(false);
              }}
              onBlur={() => saveDocument(contentHtml, docTitle, docId)}
              className="font-bold text-xs sm:text-sm text-foreground bg-transparent border-b border-transparent hover:border-border focus:border-blue-500 outline-none px-1 py-0.5 max-w-[240px] sm:max-w-md truncate"
              placeholder="Nome do documento..."
            />
            <span className="text-[10px] text-muted-foreground flex items-center gap-1 shrink-0">
              {isSaved ? (
                <>
                  <Check size={12} className="text-emerald-500" />
                  <span className="hidden md:inline">Salvo {lastSavedTime}</span>
                </>
              ) : (
                <span className="text-amber-500 font-medium">Salvando...</span>
              )}
            </span>
          </div>
        </div>

        {/* Right: Actions (Export, New, AI Settings, Toggle Copilot) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          
          <button
            onClick={() => handleNewDocument()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-muted/50 hover:bg-muted text-xs font-medium text-foreground transition-colors"
            title="Criar novo documento em branco"
          >
            <Plus size={14} />
            <span className="hidden lg:inline">Novo</span>
          </button>

          <button
            onClick={handleExportDocx}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all"
            title="Baixar em formato Microsoft Word (.docx)"
          >
            <Download size={14} />
            <span className="hidden sm:inline">Baixar .DOCX</span>
          </button>

          <button
            onClick={() => window.print()}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Imprimir ou Salvar em PDF"
          >
            <Printer size={16} />
          </button>

          <button
            onClick={handleCopyFormatted}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Copiar texto puro"
          >
            <Copy size={16} />
          </button>

          <div className="h-4 w-px bg-border" />

          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsSettingsOpen(true);
            }}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Configurações de IA Copilot"
          >
            <Settings size={16} />
          </button>

          <button
            onClick={() => setIsCopilotOpen(!isCopilotOpen)}
            className={`p-2 rounded-xl transition-all ${
              isCopilotOpen
                ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
            title={isCopilotOpen ? "Ocultar Copilot Lateral" : "Abrir Copilot Lateral"}
          >
            {isCopilotOpen ? <PanelRightClose size={18} /> : <Bot size={18} />}
          </button>
        </div>

      </header>

      {/* ── Main Workspace Body ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* Center: Editor Canvas Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-muted/30 overflow-y-auto">
          
          {/* WYSIWYG Ribbon Toolbar */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="sticky top-0 z-10 bg-background/90 backdrop-blur-md border-b border-border px-4 py-2 flex flex-wrap items-center gap-1 shadow-xs"
          >
            
            {/* History */}
            <div className="flex items-center border-r border-border/80 pr-1.5 mr-1 space-x-0.5">
              <button
                onClick={() => execCmd("undo")}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                title="Desfazer (Ctrl+Z)"
              >
                <Undo size={14} />
              </button>
              <button
                onClick={() => execCmd("redo")}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                title="Refazer (Ctrl+Y)"
              >
                <Redo size={14} />
              </button>
            </div>

            {/* Block Styles */}
            <div className="flex items-center border-r border-border/80 pr-1.5 mr-1 space-x-0.5">
              <button
                onClick={() => execCmd("formatBlock", "<h1>")}
                className="px-2 py-1 rounded-lg hover:bg-muted text-xs font-bold text-muted-foreground hover:text-foreground"
                title="Título 1 (H1)"
              >
                H1
              </button>
              <button
                onClick={() => execCmd("formatBlock", "<h2>")}
                className="px-2 py-1 rounded-lg hover:bg-muted text-xs font-bold text-muted-foreground hover:text-foreground"
                title="Título 2 (H2)"
              >
                H2
              </button>
              <button
                onClick={() => execCmd("formatBlock", "<h3>")}
                className="px-2 py-1 rounded-lg hover:bg-muted text-xs font-bold text-muted-foreground hover:text-foreground"
                title="Título 3 (H3)"
              >
                H3
              </button>
              <button
                onClick={() => execCmd("formatBlock", "<p>")}
                className="px-2 py-1 rounded-lg hover:bg-muted text-xs font-medium text-muted-foreground hover:text-foreground"
                title="Parágrafo Normal"
              >
                P
              </button>
            </div>

            {/* Inline Formats */}
            <div className="flex items-center border-r border-border/80 pr-1.5 mr-1 space-x-0.5">
              <button
                onClick={() => execCmd("bold")}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                title="Negrito (Ctrl+B)"
              >
                <Bold size={14} />
              </button>
              <button
                onClick={() => execCmd("italic")}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                title="Itálico (Ctrl+I)"
              >
                <Italic size={14} />
              </button>
              <button
                onClick={() => execCmd("underline")}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                title="Sublinhado (Ctrl+U)"
              >
                <Underline size={14} />
              </button>
              <button
                onClick={() => execCmd("strikeThrough")}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                title="Tachado"
              >
                <Strikethrough size={14} />
              </button>

              {/* Text Color Picker */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowTextColorPicker(!showTextColorPicker);
                    setShowBgColorPicker(false);
                  }}
                  className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground flex items-center gap-0.5"
                  title="Cor da Fonte"
                >
                  <Palette size={14} className="text-blue-500" />
                  <ChevronDown size={10} />
                </button>
                {showTextColorPicker && (
                  <div className="absolute top-full left-0 mt-1.5 bg-card border border-border shadow-xl rounded-xl p-2 z-50 grid grid-cols-4 gap-1.5 w-44">
                    {textColors.map((c) => (
                      <button
                        key={c.name}
                        onClick={() => {
                          execCmd("foreColor", c.color);
                          setShowTextColorPicker(false);
                        }}
                        className="w-8 h-8 rounded-lg border border-border/60 hover:scale-110 transition-transform flex items-center justify-center text-[10px] font-bold"
                        style={{ backgroundColor: c.color, color: c.color === "#f8fafc" ? "#000" : "#fff" }}
                        title={c.name}
                      >
                        A
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Background Highlight Picker */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowBgColorPicker(!showBgColorPicker);
                    setShowTextColorPicker(false);
                  }}
                  className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground flex items-center gap-0.5"
                  title="Cor de Fundo / Marca-Texto"
                >
                  <Highlighter size={14} className="text-amber-500" />
                  <ChevronDown size={10} />
                </button>
                {showBgColorPicker && (
                  <div className="absolute top-full left-0 mt-1.5 bg-card border border-border shadow-xl rounded-xl p-2 z-50 grid grid-cols-4 gap-1.5 w-44">
                    {bgHighlightColors.map((c) => (
                      <button
                        key={c.name}
                        onClick={() => {
                          execCmd("hiliteColor", c.color);
                          setShowBgColorPicker(false);
                        }}
                        className="w-8 h-8 rounded-lg border border-border/60 hover:scale-110 transition-transform flex items-center justify-center text-[9px] font-bold text-slate-800"
                        style={{ backgroundColor: c.color === "transparent" ? "#fff" : c.color }}
                        title={c.name}
                      >
                        {c.color === "transparent" ? "∅" : "ab"}
                      </button>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Alignments */}
            <div className="flex items-center border-r border-border/80 pr-1.5 mr-1 space-x-0.5">
              <button
                onClick={() => execCmd("justifyLeft")}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                title="Alinhar à Esquerda"
              >
                <AlignLeft size={14} />
              </button>
              <button
                onClick={() => execCmd("justifyCenter")}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                title="Centralizar"
              >
                <AlignCenter size={14} />
              </button>
              <button
                onClick={() => execCmd("justifyRight")}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                title="Alinhar à Direita"
              >
                <AlignRight size={14} />
              </button>
              <button
                onClick={() => execCmd("justifyFull")}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                title="Justificar"
              >
                <AlignJustify size={14} />
              </button>
            </div>

            {/* Lists */}
            <div className="flex items-center border-r border-border/80 pr-1.5 mr-1 space-x-0.5">
              <button
                onClick={() => execCmd("insertUnorderedList")}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                title="Lista com Marcadores"
              >
                <List size={14} />
              </button>
              <button
                onClick={() => execCmd("insertOrderedList")}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                title="Lista Numerada"
              >
                <ListOrdered size={14} />
              </button>
            </div>

            {/* Visual Components: Quadros / Cards & Callouts */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowCardsMenu(!showCardsMenu);
                  setShowTablesMenu(false);
                  setShowBadgesMenu(false);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold transition-colors"
                title="Inserir Quadros e Caixas Temáticas"
              >
                <Box size={14} />
                <span>+ Quadro / Card</span>
                <ChevronDown size={11} />
              </button>

              {showCardsMenu && (
                <div className="absolute top-full left-0 mt-1.5 bg-card border border-border shadow-2xl rounded-2xl p-2 z-50 w-64 space-y-1">
                  <div className="text-[10px] font-bold text-muted-foreground px-2 py-1 uppercase tracking-wider">
                    Modelos de Quadros Visuais
                  </div>
                  <button
                    onClick={() => handleInsertCard("blue")}
                    className="w-full text-left p-2 rounded-xl text-xs hover:bg-blue-500/10 hover:text-blue-500 text-foreground transition-colors flex items-center gap-2"
                  >
                    <span className="w-3 h-3 rounded-full bg-blue-500 shrink-0" />
                    <div>
                      <div className="font-bold">Quadro Azul (Insight)</div>
                      <div className="text-[10px] text-muted-foreground">Fundo azul claro e borda royal</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleInsertCard("green")}
                    className="w-full text-left p-2 rounded-xl text-xs hover:bg-emerald-500/10 hover:text-emerald-500 text-foreground transition-colors flex items-center gap-2"
                  >
                    <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
                    <div>
                      <div className="font-bold">Quadro Verde (Métricas & ROI)</div>
                      <div className="text-[10px] text-muted-foreground">Foco em números e ganhos</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleInsertCard("amber")}
                    className="w-full text-left p-2 rounded-xl text-xs hover:bg-amber-500/10 hover:text-amber-500 text-foreground transition-colors flex items-center gap-2"
                  >
                    <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
                    <div>
                      <div className="font-bold">Quadro Âmbar (Alerta & Compliance)</div>
                      <div className="text-[10px] text-muted-foreground">Normas, riscos e regras</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleInsertCard("purple")}
                    className="w-full text-left p-2 rounded-xl text-xs hover:bg-purple-500/10 hover:text-purple-500 text-foreground transition-colors flex items-center gap-2"
                  >
                    <span className="w-3 h-3 rounded-full bg-purple-500 shrink-0" />
                    <div>
                      <div className="font-bold">Quadro Roxo (Arquitetura & Mecanismo)</div>
                      <div className="text-[10px] text-muted-foreground">Tecnologia e diferenciais</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleInsertCard("dark")}
                    className="w-full text-left p-2 rounded-xl text-xs hover:bg-slate-800 hover:text-white text-foreground transition-colors flex items-center gap-2"
                  >
                    <span className="w-3 h-3 rounded-full bg-slate-900 border border-slate-700 shrink-0" />
                    <div>
                      <div className="font-bold">Quadro Dark Executivo</div>
                      <div className="text-[10px] text-muted-foreground">Fundo escuro premium</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleInsertCard("gradient")}
                    className="w-full text-left p-2 rounded-xl text-xs hover:bg-indigo-500/10 hover:text-indigo-500 text-foreground transition-colors flex items-center gap-2"
                  >
                    <span className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 shrink-0" />
                    <div>
                      <div className="font-bold">Quadro Gradiente Premium</div>
                      <div className="text-[10px] text-muted-foreground">Borda colorida moderna</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Visual Components: Tabelas Estilizadas */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowTablesMenu(!showTablesMenu);
                  setShowCardsMenu(false);
                  setShowBadgesMenu(false);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold transition-colors"
                title="Inserir Tabelas Estilizadas"
              >
                <TableIcon size={14} />
                <span>+ Tabela Colorida</span>
                <ChevronDown size={11} />
              </button>

              {showTablesMenu && (
                <div className="absolute top-full left-0 mt-1.5 bg-card border border-border shadow-2xl rounded-2xl p-2 z-50 w-60 space-y-1">
                  <div className="text-[10px] font-bold text-muted-foreground px-2 py-1 uppercase tracking-wider">
                    Estilos de Tabela
                  </div>
                  <button
                    onClick={() => handleInsertStyledTable("blue")}
                    className="w-full text-left p-2 rounded-xl text-xs hover:bg-blue-500/10 hover:text-blue-500 text-foreground transition-colors"
                  >
                    <div className="font-bold">Tabela Azul Executiva</div>
                    <div className="text-[10px] text-muted-foreground">Cabeçalho marinho e zebrada</div>
                  </button>

                  <button
                    onClick={() => handleInsertStyledTable("emerald")}
                    className="w-full text-left p-2 rounded-xl text-xs hover:bg-emerald-500/10 hover:text-emerald-500 text-foreground transition-colors"
                  >
                    <div className="font-bold">Tabela Esmeralda (ROI & Métricas)</div>
                    <div className="text-[10px] text-muted-foreground">Cabeçalho verde financeiro</div>
                  </button>

                  <button
                    onClick={() => handleInsertStyledTable("slate")}
                    className="w-full text-left p-2 rounded-xl text-xs hover:bg-muted text-foreground transition-colors"
                  >
                    <div className="font-bold">Tabela Minimalista Slate</div>
                    <div className="text-[10px] text-muted-foreground">Linhas limpas e modernas</div>
                  </button>

                  <button
                    onClick={() => handleInsertStyledTable("matrix")}
                    className="w-full text-left p-2 rounded-xl text-xs hover:bg-purple-500/10 hover:text-purple-500 text-foreground transition-colors"
                  >
                    <div className="font-bold">Matriz de Decisão 2x2</div>
                    <div className="text-[10px] text-muted-foreground">4 quadrantes estratégicos</div>
                  </button>
                </div>
              )}
            </div>

            {/* Badges / Status Pills */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowBadgesMenu(!showBadgesMenu);
                  setShowCardsMenu(false);
                  setShowTablesMenu(false);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold transition-colors"
                title="Inserir Pílulas / Badges de Status"
              >
                <Tag size={13} />
                <span>+ Tag / Badge</span>
                <ChevronDown size={11} />
              </button>

              {showBadgesMenu && (
                <div className="absolute top-full left-0 mt-1.5 bg-card border border-border shadow-2xl rounded-2xl p-2 z-50 w-56 space-y-1">
                  <div className="text-[10px] font-bold text-muted-foreground px-2 py-1 uppercase tracking-wider">
                    Pílulas de Status
                  </div>
                  <button
                    onClick={() => handleInsertBadge("APROVADO", "#dcfce7", "#166534", "#86efac")}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-muted flex items-center justify-between"
                  >
                    <span>Aprovado</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      APROVADO
                    </span>
                  </button>

                  <button
                    onClick={() => handleInsertBadge("EM ANÁLISE", "#dbeafe", "#1e40af", "#93c5fd")}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-muted flex items-center justify-between"
                  >
                    <span>Em Análise</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                      EM ANÁLISE
                    </span>
                  </button>

                  <button
                    onClick={() => handleInsertBadge("CRÍTICO", "#fee2e2", "#991b1b", "#fca5a5")}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-muted flex items-center justify-between"
                  >
                    <span>Crítico</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                      CRÍTICO
                    </span>
                  </button>

                  <button
                    onClick={() => handleInsertBadge("COMPLIANCE BACEN", "#f3e8ff", "#6b21a8", "#d8b4fe")}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-muted flex items-center justify-between"
                  >
                    <span>Compliance Bacen</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                      BACEN
                    </span>
                  </button>

                  <button
                    onClick={() => handleInsertBadge("RELEASE MANDATÓRIO", "#fef3c7", "#92400e", "#fde68a")}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-muted flex items-center justify-between"
                  >
                    <span>Release Mandatório</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      MANDATÓRIO
                    </span>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => execCmd("insertHorizontalRule")}
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
              title="Linha Divisória"
            >
              <Minus size={14} />
            </button>

          </div>

          {/* The A4 Paper Canvas */}
          <div className="flex-1 py-8 px-4 flex justify-center">
            
            {/* The A4 Paper Card */}
            <div
              className="w-full max-w-[850px] min-h-[1050px] bg-card text-foreground rounded-2xl shadow-xl border border-border p-10 sm:p-14 transition-all focus-within:ring-2 focus-within:ring-blue-500/30"
              style={{
                boxShadow: "0 10px 35px -5px rgba(0, 0, 0, 0.08), 0 0 0 1px var(--border)",
              }}
            >
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={handleEditorInput}
                onMouseUp={handleMouseUp}
                onKeyUp={handleMouseUp}
                className="outline-none min-h-[950px] leading-relaxed text-[15px] prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-blockquote:my-3 prose-hr:my-4"
              />
            </div>

          </div>

          {/* Footer Stats Bar */}
          <footer className="h-8 border-t border-border bg-background/80 px-4 flex items-center justify-between text-[11px] text-muted-foreground shrink-0 select-none">
            <div className="flex items-center gap-4">
              <span>{stats.words} palavras</span>
              <span>{stats.chars} caracteres</span>
              <span>~{stats.estimatedPages} pág. A4</span>
              <span>~{stats.readTimeMinutes} min de leitura</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
              <span>Modo Executivo & Design System Ativo</span>
            </div>
          </footer>

        </div>

        {/* Floating Selection AI Toolbar */}
        <AiFloatingToolbar
          selectedText={selectedText}
          onApplyReplacement={handleApplyReplacement}
          onInsertBelow={handleInsertBelow}
          onClose={() => {
            setFloatingPos(null);
            setSelectedText("");
          }}
          position={floatingPos}
          apiKey={aiApiKey}
          provider={aiProvider}
          model={aiModel}
        />

        {/* Right Side: Derick-style AI Copilot Panel */}
        {isCopilotOpen && (
          <AiCopilotSidebar
            fullDocumentHtml={contentHtml}
            onInsertContent={handleCopilotInsert}
            onReplaceContent={handleCopilotReplace}
            apiKey={aiApiKey}
            provider={aiProvider}
            model={aiModel}
          />
        )}

      </div>

      {/* ── Modals ─────────────────────────────────────────────────────────────── */}
      <DocManagerModal
        isOpen={isDocManagerOpen}
        onClose={() => setIsDocManagerOpen(false)}
        savedDocs={savedDocs}
        currentDocId={docId}
        onSelectDoc={handleSelectDocument}
        onNewDoc={handleNewDocument}
        onDeleteDoc={handleDeleteDocument}
      />

      <AiSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={aiApiKey}
        provider={aiProvider}
        model={aiModel}
        onSave={({ apiKey, provider, model }) => {
          setAiApiKey(apiKey);
          setAiProvider(provider);
          setAiModel(model);
          localStorage.setItem("vs_ai_api_key", apiKey);
          localStorage.setItem("vs_ai_provider", provider);
          localStorage.setItem("vs_ai_model", model);
        }}
      />

      {/* Toast Notification */}
      {copiedNotification && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{copiedNotification}</span>
        </div>
      )}

    </div>
  );
}
