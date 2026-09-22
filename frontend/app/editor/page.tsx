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
  Image as ImageIcon,
  Lock,
  Unlock,
  PanelLeftClose,
  PanelLeftOpen,
  Bookmark,
  Hash,
} from "lucide-react";
import { exportHtmlToDocx } from "@/components/editor/DocxExporter";
import { DOCUMENT_TEMPLATES, DocumentTemplate } from "@/components/editor/TemplateSelector";
import AiFloatingToolbar from "@/components/editor/AiFloatingToolbar";
import AiCopilotSidebar from "@/components/editor/AiCopilotSidebar";
import DocManagerModal, { SavedDoc } from "@/components/editor/DocManagerModal";
import AiSettingsModal from "@/components/editor/AiSettingsModal";
import BulletinMetadataCard, { BulletinMetadata } from "@/components/editor/BulletinMetadataCard";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export default function DocStudioEditor() {
  // Document State
  const [docId, setDocId] = useState<string>("doc-default");
  const [docTitle, setDocTitle] = useState<string>("Documento Estratégico — Proposta de Pagamentos");
  const [savedDocs, setSavedDocs] = useState<SavedDoc[]>([]);
  const [isSaved, setIsSaved] = useState<boolean>(true);
  const [lastSavedTime, setLastSavedTime] = useState<string>("agora");

  // Read-Only / Public Mode State
  const [isReadOnly, setIsReadOnly] = useState<boolean>(false);

  // Bulletin Metadata Visual Card State (outside A4 document)
  const [showBulletinCard, setShowBulletinCard] = useState<boolean>(true);
  const [bulletinMeta, setBulletinMeta] = useState<BulletinMetadata>({
    brand: "mastercard",
    title: "Updated Payment System Public Keys for M/Chip",
    referenceId: "GLB 10362.3",
    publicationDate: "22/09/2026",
    effectiveDate: "01/11/2026",
    keyExpirationDate: "31/12/2036",
    category: "Operations • Security • Chip & Contactless • POI",
    audience: ["Adquirentes", "Subadquirentes / PSPs", "Emissores", "Processadoras", "Terminais POS / ATM"],
    region: "Global (Doméstico e Internacional)",
    requirement: "Informativo",
    riskLevel: "Baixo",
    tags: ["M/Chip", "CAPK", "RSA 1984-bit", "Offline Auth", "EMV Contactless", "Kernel L2"],
    executiveSummary: "A Mastercard estende por mais 1 ano a validade da Chave Pública do Sistema de Pagamentos de 1.984 bits (passando de 31/12/2035 para 31/12/2036), mantendo o valor da chave inalterado e preservando a vida útil de chaves de emissores sob a mesma raiz.",
    recommendedAction: "Atualizar tabelas CAPK nos sistemas TMS dos adquirentes e solicitar novos certificados para emissores com vigência estendida a partir de 01/11/2026.",
    versionHistory: [
      {
        version: "GLB 10362.3",
        date: "22/09/2026",
        description: "Atualização da data de vigência para 01/11/2026 em todo o comunicado; extensão da data limite de expiração da chave de 1.984 bits de 31/12/2035 para 31/12/2036; atualização da referência ao EMVCo Notice Bulletin nº 30 (Julho/2026); remoção do texto sobre certificação de chaves menores que 1.024 bits.",
        isCurrent: true,
      },
      {
        version: "GLB 10362.2",
        date: "23/09/2025",
        description: "Anúncio prévio da prorrogação da chave pública de 1.984 bits com vigência para emissores e adquirentes.",
        isCurrent: false,
      },
      {
        version: "GLB 10362.1",
        date: "24/09/2024",
        description: "Publicação inicial do boletim de chaves públicas de sistema de pagamentos para M/Chip.",
        isCurrent: false,
      },
    ],
    dateExplanations: [
      {
        date: "22/09/2026",
        event: "Publicação Oficial da Versão .3",
        impactType: "Publicação",
        explanation: "Comunicação formal do boletim técnico aos emissores, adquirentes e processadoras globais.",
      },
      {
        date: "01/11/2026",
        event: "Vigência Operacional / Suporte MPKCS",
        impactType: "Go-Live",
        explanation: "Abertura oficial do portal Mastercard Public Key Certification Service para requisições de certificados de emissor válidos até 2036. Prazo para adquirentes sincronizarem tabelas CAPK em TMS.",
      },
      {
        date: "31/12/2035",
        event: "Expiração Original da Chave 1.984-bit",
        impactType: "Transição",
        explanation: "Data limite anterior de expiração da chave pública de sistema Mastercard (Índice 6) antes da extensão concedida por este comunicado.",
      },
      {
        date: "31/12/2036",
        event: "Nova Data Limite de Expiração da Chave",
        impactType: "Expiração",
        explanation: "Data máxima de validade criptográfica da chave de 1.984 bits, ampliando a vida útil de cartões M/Chip emitidos sob esta raiz.",
      },
    ],
  });

  // Table of Contents (Neste Documento) State
  const [tocList, setTocList] = useState<TocItem[]>([]);
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);
  const [isTocOpen, setIsTocOpen] = useState<boolean>(true);

  // Selection & Floating AI Toolbar State
  const [selectedText, setSelectedText] = useState<string>("");
  const [floatingPos, setFloatingPos] = useState<{ top: number; left: number } | null>(null);
  const savedRangeRef = useRef<Range | null>(null);

  // Dropdown States for Colors, Cards, Tables, Badges, Images
  const [showTextColorPicker, setShowTextColorPicker] = useState<boolean>(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState<boolean>(false);
  const [showTableCellColorPicker, setShowTableCellColorPicker] = useState<boolean>(false);
  const [showCardsMenu, setShowCardsMenu] = useState<boolean>(false);
  const [showTablesMenu, setShowTablesMenu] = useState<boolean>(false);
  const [showBadgesMenu, setShowBadgesMenu] = useState<boolean>(false);
  const [showImageModal, setShowImageModal] = useState<boolean>(false);
  const [imageUrlInput, setImageUrlInput] = useState<string>("");

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

  // DOM Refs
  const editorRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const tocDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = useRef<boolean>(false);

  // Close all popovers
  const closeAllMenus = () => {
    setShowTextColorPicker(false);
    setShowBgColorPicker(false);
    setShowTableCellColorPicker(false);
    setShowCardsMenu(false);
    setShowTablesMenu(false);
    setShowBadgesMenu(false);
  };

  // Extract Headings for Table of Contents with IDs
  const extractTocFromDom = useCallback(() => {
    if (!editorRef.current) return;
    const headings = editorRef.current.querySelectorAll("h1, h2, h3");
    const items: TocItem[] = [];

    headings.forEach((h, idx) => {
      const text = h.textContent?.trim() || `Seção ${idx + 1}`;
      const level = parseInt(h.tagName.replace("H", ""), 10);
      const id = `toc-sec-${idx}`;
      h.setAttribute("id", id);
      h.setAttribute("style", "scroll-margin-top: 100px;");
      items.push({ id, text, level });
    });

    setTocList(items);
  }, []);

  // Smooth Scroll to Section with Visual Glow
  const scrollToHeading = (id: string, index?: number) => {
    setActiveHeadingId(id);
    if (!editorRef.current) return;

    // 1. Find element by ID or by matching index
    let el: HTMLElement | null = editorRef.current.querySelector(`#${id}`);
    if (!el) {
      el = document.getElementById(id);
    }
    if (!el && typeof index === "number") {
      const allHeadings = editorRef.current.querySelectorAll("h1, h2, h3");
      if (allHeadings[index]) {
        el = allHeadings[index] as HTMLElement;
      }
    }

    if (el) {
      // 2. Scroll container directly by computing exact pixel offset
      const container = scrollContainerRef.current;
      if (container) {
        const containerRect = container.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        const targetTop = container.scrollTop + (elRect.top - containerRect.top) - 75;
        container.scrollTo({
          top: Math.max(0, targetTop),
          behavior: "smooth",
        });
      } else {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }

      // 3. High-visibility highlight pulse
      const originalTransition = el.style.transition;
      const originalOutline = el.style.outline;
      const originalOutlineOffset = el.style.outlineOffset;
      const originalBg = el.style.backgroundColor;

      el.style.transition = "all 0.3s ease";
      el.style.outline = "3px solid #8b5cf6";
      el.style.outlineOffset = "4px";
      el.style.backgroundColor = "rgba(139, 92, 246, 0.15)";
      el.style.borderRadius = "6px";

      setTimeout(() => {
        el.style.outline = originalOutline || "";
        el.style.outlineOffset = originalOutlineOffset || "";
        el.style.backgroundColor = originalBg || "";
        el.style.transition = originalTransition || "";
      }, 1600);
    }
  };

  // Update Stats
  const updateStats = useCallback((text: string) => {
    const plainText = text.replace(/<[^>]*>?/gm, " ").trim();
    const words = plainText ? plainText.split(/\s+/).filter(Boolean).length : 0;
    const chars = plainText.length;
    const readTimeMinutes = Math.max(1, Math.ceil(words / 200));
    const estimatedPages = Math.max(1, Math.ceil(words / 450));
    setStats({ words, chars, readTimeMinutes, estimatedPages });
  }, []);

  // Save Document to LocalStorage
  const saveDocument = useCallback((html: string, title: string, id: string) => {
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
  }, []);

  // Handle Uncontrolled Input (NO state update on every keystroke to prevent cursor jump!)
  const handleEditorInput = () => {
    if (!editorRef.current) return;
    setIsSaved(false);

    // Debounced TOC extraction (updates outline smoothly without interrupting typing)
    if (tocDebounceRef.current) clearTimeout(tocDebounceRef.current);
    tocDebounceRef.current = setTimeout(() => {
      extractTocFromDom();
      if (editorRef.current) {
        updateStats(editorRef.current.innerText);
      }
    }, 400);

    // Debounced save
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      if (editorRef.current) {
        saveDocument(editorRef.current.innerHTML, docTitle, docId);
      }
    }, 1200);
  };

  // Initialize once on mount
  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    // Check url params for read-only / public mode
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("view") === "public" || urlParams.get("readonly") === "true") {
        setIsReadOnly(true);
        setIsCopilotOpen(false);
      }
    }

    const storedKey = localStorage.getItem("vs_ai_api_key") || "";
    const storedProvider = localStorage.getItem("vs_ai_provider") || "openai";
    const storedModel = localStorage.getItem("vs_ai_model") || "gpt-4o-mini";
    setAiApiKey(storedKey);
    setAiProvider(storedProvider);
    setAiModel(storedModel);

    const rawDocs = localStorage.getItem("vs_saved_documents");
    let initialContent = DOCUMENT_TEMPLATES[1].content;
    let initialTitle = DOCUMENT_TEMPLATES[1].defaultTitle;
    let initialId = "doc-" + Date.now();

    if (rawDocs) {
      try {
        const parsed: SavedDoc[] = JSON.parse(rawDocs);
        setSavedDocs(parsed);
        if (parsed.length > 0) {
          const first = parsed[0];
          initialId = first.id;
          initialTitle = first.title;
          initialContent = first.content;
        }
      } catch (e) {
        console.error("Error loading saved docs", e);
      }
    }

    setDocId(initialId);
    setDocTitle(initialTitle);
    if (editorRef.current) {
      editorRef.current.innerHTML = initialContent;
      extractTocFromDom();
      updateStats(editorRef.current.innerText);
    }
  }, [extractTocFromDom, updateStats]);

  // Mouse Selection Tracking: Silent tracking without annoying popups on regular clicks/selection
  const handleMouseUp = () => {
    if (isReadOnly) return;
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !editorRef.current) {
      return;
    }

    const text = selection.toString().trim();
    if (text.length > 1) {
      const range = selection.getRangeAt(0);
      savedRangeRef.current = range.cloneRange();
      setSelectedText(text);
    }
  };

  // Right-Click Context Menu: Fast AI Assistant Action on Right Click!
  const handleContextMenu = (e: React.MouseEvent) => {
    if (isReadOnly) return;
    const selection = window.getSelection();
    let text = selection?.toString().trim() || "";

    // If no text was manually highlighted, check if right clicking inside a paragraph/block
    if (!text && editorRef.current) {
      const target = e.target as HTMLElement;
      if (target && target.innerText && target !== editorRef.current) {
        text = target.innerText.trim();
        const range = document.createRange();
        range.selectNodeContents(target);
        selection?.removeAllRanges();
        selection?.addRange(range);
        savedRangeRef.current = range.cloneRange();
      }
    }

    if (text.length > 0) {
      e.preventDefault();
      const range = selection?.getRangeAt(0);
      if (range) savedRangeRef.current = range.cloneRange();
      setSelectedText(text);
      setFloatingPos({
        top: e.clientY + 8,
        left: Math.min(e.clientX, window.innerWidth - 460),
      });
    }
  };

  const execCmd = (command: string, value: string = "") => {
    if (isReadOnly) return;
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
      handleEditorInput();
    }
  };

  // Image Upload / Drag & Drop Handler
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      insertImageHtml(base64);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const insertImageHtml = (src: string, caption: string = "") => {
    const imgHtml = `
      <div style="margin:1.5rem 0; text-align:center;">
        <img src="${src}" alt="Imagem" style="max-width:100%; height:auto; border-radius:12px; box-shadow:0 6px 20px rgba(0,0,0,0.08); border:1px solid #e2e8f0; display:inline-block;" />
        ${caption ? `<p style="font-size:0.8rem; color:#64748b; margin-top:6px; font-style:italic;">${caption}</p>` : ""}
      </div>
      <p></p>
    `;
    execCmd("insertHTML", imgHtml);
    setShowImageModal(false);
    setImageUrlInput("");
  };

  const handleDrop = (e: React.DragEvent) => {
    if (isReadOnly) return;
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target?.result as string;
          insertImageHtml(base64);
        };
        reader.readAsDataURL(file);
      }
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

  // Apply Background Color to Table Cell / Row / Header
  const handleApplyCellColor = (color: string, isDark: boolean = false) => {
    setShowTableCellColorPicker(false);
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;

    let node: Node | null = sel.anchorNode;
    let targetEl: HTMLElement | null = null;

    while (node && node !== editorRef.current) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        const tag = el.tagName.toLowerCase();
        if (tag === "td" || tag === "th") {
          targetEl = el;
          break;
        }
      }
      node = node.parentNode;
    }

    if (targetEl) {
      targetEl.style.backgroundColor = color;
      if (isDark) {
        targetEl.style.color = "#ffffff";
      } else if (color === "transparent" || color === "#ffffff") {
        targetEl.style.color = "";
      }
      handleEditorInput();
    } else {
      execCmd("hiliteColor", color);
    }
  };

  // Insert Styled Table
  const handleInsertStyledTable = (theme: "blue" | "emerald" | "slate" | "purple" | "matrix" | "matrix-dark" | "matrix-emerald") => {
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
        <table style="width:100%; border-collapse:collapse; margin:1.5rem 0; font-size:0.875rem; border:1px solid #a7f3d0; border-radius:8px; overflow:hidden;">
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
              <td style="padding:10px 14px; border:1px solid #a7f3d0;">0.45% (Seguro)</td>
              <td style="padding:10px 14px; border:1px solid #a7f3d0; color:#059669; font-weight:bold;">Isenção total de multas</td>
            </tr>
          </tbody>
        </table>
        <p></p>
      `;
    } else if (theme === "purple") {
      tableHtml = `
        <table style="width:100%; border-collapse:collapse; margin:1.5rem 0; font-size:0.875rem; border:1px solid #e9d5ff; border-radius:8px; overflow:hidden;">
          <thead>
            <tr style="background:#4c1d95; color:#ffffff;">
              <th style="padding:10px 14px; text-align:left; border:1px solid #581c87;">Fase do Projeto</th>
              <th style="padding:10px 14px; text-align:left; border:1px solid #581c87;">Entregável Chave</th>
              <th style="padding:10px 14px; text-align:left; border:1px solid #581c87;">Governança</th>
            </tr>
          </thead>
          <tbody>
            <tr style="background:#faf5ff;">
              <td style="padding:10px 14px; border:1px solid #e9d5ff; font-weight:bold; color:#581c87;">Discovery & Auditoria</td>
              <td style="padding:10px 14px; border:1px solid #e9d5ff;">Relatório de Falhas de Autorização ISO 8583</td>
              <td style="padding:10px 14px; border:1px solid #e9d5ff;"><span style="background:#f3e8ff; color:#6b21a8; padding:3px 8px; border-radius:99px; font-size:11px; font-weight:bold;">Semana 1</span></td>
            </tr>
            <tr style="background:#ffffff;">
              <td style="padding:10px 14px; border:1px solid #e9d5ff; font-weight:bold; color:#581c87;">Implementação Técnica</td>
              <td style="padding:10px 14px; border:1px solid #e9d5ff;">Rollout de Smart Routing & Network Tokens</td>
              <td style="padding:10px 14px; border:1px solid #e9d5ff;"><span style="background:#dbeafe; color:#1e40af; padding:3px 8px; border-radius:99px; font-size:11px; font-weight:bold;">Semana 3</span></td>
            </tr>
          </tbody>
        </table>
        <p></p>
      `;
    } else if (theme === "slate") {
      tableHtml = `
        <table style="width:100%; border-collapse:collapse; margin:1.5rem 0; font-size:0.875rem; border:1px solid #e2e8f0; border-radius:8px; overflow:hidden;">
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
    } else if (theme === "matrix-dark") {
      // 2x2 Matrix Dark
      tableHtml = `
        <table style="width:100%; border-collapse:collapse; margin:1.5rem 0; font-size:0.875rem; border:2px solid #334155; border-radius:8px; overflow:hidden;">
          <thead>
            <tr style="background:#0f172a; color:#f8fafc;">
              <th colspan="2" style="padding:12px; text-align:center; font-size:0.95rem; font-weight:bold; letter-spacing:0.5px;">MATRIZ DE DECISÃO ESTRATÉGICA (2x2)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="width:50%; padding:14px; background:#1e293b; color:#f1f5f9; border:1px solid #334155; vertical-align:top;">
                <strong style="color:#60a5fa; font-size:0.9rem;">🚀 ALTO IMPACTO / BAIXO ESFORÇO (Prioridade 1)</strong>
                <ul style="margin:8px 0 0 16px; padding:0; font-size:0.85rem; color:#cbd5e1;">
                  <li>Ajuste do POS Entry Mode (DE 22 = 81)</li>
                  <li>Ativação de Smart Retries nos horários 06h-09h</li>
                </ul>
              </td>
              <td style="width:50%; padding:14px; background:#1e1b4b; color:#f1f5f9; border:1px solid #334155; vertical-align:top;">
                <strong style="color:#c084fc; font-size:0.9rem;">💎 ALTO IMPACTO / ALTO ESFORÇO (Prioridade 2)</strong>
                <ul style="margin:8px 0 0 16px; padding:0; font-size:0.85rem; color:#cbd5e1;">
                  <li>Integração direta com Network Tokens (VTS/MDES)</li>
                  <li>Motor de Cascata e Roteamento Inteligente</li>
                </ul>
              </td>
            </tr>
            <tr>
              <td style="width:50%; padding:14px; background:#0f172a; color:#f1f5f9; border:1px solid #334155; vertical-align:top;">
                <strong style="color:#94a3b8; font-size:0.9rem;">⚙️ BAIXO IMPACTO / BAIXO ESFORÇO (Quick Wins)</strong>
                <ul style="margin:8px 0 0 16px; padding:0; font-size:0.85rem; color:#94a3b8;">
                  <li>Higienização de cadastros de trials</li>
                  <li>Alertas de webhook em tempo real</li>
                </ul>
              </td>
              <td style="width:50%; padding:14px; background:#2e1065; color:#f1f5f9; border:1px solid #334155; vertical-align:top;">
                <strong style="color:#f87171; font-size:0.9rem;">🚫 BAIXO IMPACTO / ALTO ESFORÇO (Evitar)</strong>
                <ul style="margin:8px 0 0 16px; padding:0; font-size:0.85rem; color:#fca5a5;">
                  <li>Retentativas cegas em cartões cancelados (Hard Declines)</li>
                </ul>
              </td>
            </tr>
          </tbody>
        </table>
        <p></p>
      `;
    } else if (theme === "matrix-emerald") {
      // 2x2 Matrix Emerald & Amber
      tableHtml = `
        <table style="width:100%; border-collapse:collapse; margin:1.5rem 0; font-size:0.875rem; border:2px solid #059669; border-radius:8px; overflow:hidden;">
          <thead>
            <tr style="background:#065f46; color:#ffffff;">
              <th colspan="2" style="padding:12px; text-align:center; font-size:0.95rem; font-weight:bold;">MATRIZ DE PRIORIZAÇÃO FINANCEIRA & RISCO</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="width:50%; padding:14px; background:#ecfdf5; border:1px solid #a7f3d0; vertical-align:top;">
                <strong style="color:#047857; font-size:0.9rem;">🟢 GANHO RÁPIDO DE RECEITA (Execução Imediata)</strong>
                <ul style="margin:8px 0 0 16px; padding:0; font-size:0.85rem; color:#064e3b;">
                  <li>Recuperação de Churn por Account Updater</li>
                  <li>Adequação de regras de 3DS 2.2</li>
                </ul>
              </td>
              <td style="width:50%; padding:14px; background:#eff6ff; border:1px solid #bfdbfe; vertical-align:top;">
                <strong style="color:#1e40af; font-size:0.9rem;">🔵 ESTRUTURAÇÃO DE LONGO PRAZO</strong>
                <ul style="margin:8px 0 0 16px; padding:0; font-size:0.85rem; color:#1e3a8a;">
                  <li>Arquitetura Multiadquirente com Fallback</li>
                  <li>Conciliação automatizada de Intercâmbio MCBS/VSS</li>
                </ul>
              </td>
            </tr>
            <tr>
              <td style="width:50%; padding:14px; background:#fffbeb; border:1px solid #fde68a; vertical-align:top;">
                <strong style="color:#b45309; font-size:0.9rem;">🟡 CONTROLE DE COMPLIANCE & MONITORIA</strong>
                <ul style="margin:8px 0 0 16px; padding:0; font-size:0.85rem; color:#92400e;">
                  <li>Auditoria de limites regulatórios de débito BCB nº 150</li>
                  <li>Revisão mensal de chargebacks por MCC</li>
                </ul>
              </td>
              <td style="width:50%; padding:14px; background:#fef2f2; border:1px solid #fecaca; vertical-align:top;">
                <strong style="color:#b91c1c; font-size:0.9rem;">🔴 VULNERABILIDADE & RISCO CRÍTICO</strong>
                <ul style="margin:8px 0 0 16px; padding:0; font-size:0.85rem; color:#7f1d1d;">
                  <li>Processamento sem parâmetros de token em e-commerce</li>
                </ul>
              </td>
            </tr>
          </tbody>
        </table>
        <p></p>
      `;
    } else {
      // 2x2 Matrix Clássica
      tableHtml = `
        <table style="width:100%; border-collapse:collapse; margin:1.5rem 0; font-size:0.875rem; border:2px solid #cbd5e1; border-radius:8px; overflow:hidden;">
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
    if (editorRef.current) {
      editorRef.current.innerHTML = tmpl.content;
      extractTocFromDom();
      updateStats(tmpl.content);
      editorRef.current.focus();
    }
    saveDocument(tmpl.content, tmpl.defaultTitle, newId);
  };

  const handleSelectDocument = (doc: SavedDoc) => {
    setDocId(doc.id);
    setDocTitle(doc.title);
    if (editorRef.current) {
      editorRef.current.innerHTML = doc.content;
      extractTocFromDom();
      updateStats(doc.content);
    }
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

  const handleSharePublicLink = () => {
    const url = `${window.location.origin}/editor?view=public`;
    navigator.clipboard.writeText(url);
    setCopiedNotification("Link público copiado! Aberto para leitura sem edição.");
    setTimeout(() => setCopiedNotification(null), 3000);
  };

  return (
    <div
      onClick={closeAllMenus}
      className="flex flex-col h-[calc(100vh-64px)] bg-slate-100/60 dark:bg-muted/20 text-foreground overflow-hidden font-sans print:h-auto print:overflow-visible print:bg-white print:text-black print:m-0 print:p-0"
    >
      {/* Hidden file input for local image upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageFileChange}
        className="hidden"
      />

      {/* ── Top Header Bar ──────────────────────────────────────────────────────── */}
      <header className="h-14 border-b border-border bg-background/95 backdrop-blur-md px-4 flex items-center justify-between shrink-0 z-20 print:hidden">
        
        {/* Left: Document Info & Name */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          
          {/* Toggle Outline / TOC */}
          <button
            onClick={() => setIsTocOpen(!isTocOpen)}
            className={`p-2 rounded-xl border transition-colors ${
              isTocOpen ? "bg-purple-500/10 text-purple-600 border-purple-500/20" : "bg-muted/50 text-muted-foreground border-border"
            }`}
            title={isTocOpen ? "Ocultar Sumário 'Neste Documento'" : "Mostrar Sumário 'Neste Documento'"}
          >
            {isTocOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
          </button>

          {!isReadOnly && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDocManagerOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/60 hover:bg-muted text-xs font-semibold text-foreground border border-border transition-colors shrink-0"
              >
                <FolderOpen size={14} className="text-blue-500" />
                <span className="hidden sm:inline">Meus Docs</span>
              </button>

              <button
                onClick={() => setShowBulletinCard(!showBulletinCard)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all shrink-0 ${
                  showBulletinCard
                    ? "bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/30"
                    : "bg-muted/40 text-muted-foreground hover:text-foreground border-border"
                }`}
                title="Mostrar ou ocultar ficha visual de metadados do boletim"
              >
                <Tag size={13} className="text-purple-500" />
                <span className="hidden md:inline">Ficha do Boletim</span>
              </button>
            </>
          )}

          <div className="h-4 w-px bg-border shrink-0" />

          <div className="flex items-center gap-2 min-w-0">
            {isReadOnly ? (
              <span className="font-bold text-xs sm:text-sm text-foreground truncate">{docTitle}</span>
            ) : (
              <input
                type="text"
                value={docTitle}
                onChange={(e) => {
                  setDocTitle(e.target.value);
                  setIsSaved(false);
                }}
                onBlur={() => {
                  if (editorRef.current) saveDocument(editorRef.current.innerHTML, docTitle, docId);
                }}
                className="font-bold text-xs sm:text-sm text-foreground bg-transparent border-b border-transparent hover:border-border focus:border-blue-500 outline-none px-1 py-0.5 max-w-[200px] sm:max-w-md truncate"
                placeholder="Nome do documento..."
              />
            )}
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

        {/* Right: Actions (ReadOnly toggle, Export PDF, DOCX, Settings, Copilot) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          
          {/* Read-Only / Edit Toggle Button */}
          <button
            onClick={() => setIsReadOnly(!isReadOnly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              isReadOnly
                ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                : "bg-muted/40 text-muted-foreground hover:text-foreground border-border"
            }`}
            title={isReadOnly ? "Bloqueado para Leitura / Público. Clique para editar." : "Modo Edição Ativo. Clique para alternar para modo público/leitura."}
          >
            {isReadOnly ? <Lock size={13} className="text-amber-500" /> : <Unlock size={13} />}
            <span className="hidden md:inline">{isReadOnly ? "Modo Leitura (Bloqueado)" : "Modo Edição"}</span>
          </button>

          {/* Share Public Link */}
          <button
            onClick={handleSharePublicLink}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted border border-border/60 transition-colors"
            title="Copiar Link de Compartilhamento Público"
          >
            <Share2 size={15} />
          </button>

          {!isReadOnly && (
            <button
              onClick={() => handleNewDocument()}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-muted/50 hover:bg-muted text-xs font-medium text-foreground transition-colors"
              title="Criar novo documento em branco"
            >
              <Plus size={14} />
              <span className="hidden lg:inline">Novo</span>
            </button>
          )}

          {/* PDF Generation (Direct Print / Save PDF) */}
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600/10 hover:bg-red-600/20 text-red-600 dark:text-red-400 border border-red-500/20 text-xs font-semibold transition-all"
            title="Gerar e Salvar em PDF"
          >
            <Printer size={14} />
            <span className="hidden sm:inline">Gerar PDF</span>
          </button>

          {/* Word Download */}
          <button
            onClick={handleExportDocx}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all"
            title="Baixar em formato Microsoft Word (.docx)"
          >
            <Download size={14} />
            <span className="hidden sm:inline">Baixar .DOCX</span>
          </button>

          <div className="h-4 w-px bg-border" />

          {!isReadOnly && (
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
          )}

          {/* Toggle Right Copilot */}
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
      <div className="flex-1 flex overflow-hidden relative print:overflow-visible print:h-auto print:block">

        {/* ── Left Rail: "NESTE DOCUMENTO" (Table of Contents - Derick Style) ───── */}
        {isTocOpen && (
          <aside className="w-64 border-r border-border bg-card/60 backdrop-blur-md flex flex-col shrink-0 overflow-hidden transition-all select-none print:hidden">
            <div className="p-4 border-b border-border/60 flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground">
                NESTE DOCUMENTO
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-mono">
                {tocList.length}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-2.5 space-y-1">
              {tocList.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground leading-relaxed">
                  Adicione títulos (H1, H2, H3) no texto para gerar o índice automático.
                </div>
              ) : (
                tocList.map((item, idx) => {
                  const num = String(idx + 1).padStart(2, "0");
                  const isActive = activeHeadingId === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => scrollToHeading(item.id, idx)}
                      className={`w-full text-left flex items-start gap-2.5 px-3 py-2 rounded-xl text-xs transition-all ${
                        isActive
                          ? "bg-purple-500/15 text-purple-600 dark:text-purple-300 font-bold border border-purple-500/30 shadow-xs"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50 font-medium"
                      } ${item.level === 2 ? "pl-5 text-[11.5px]" : item.level === 3 ? "pl-7 text-[11px]" : ""}`}
                    >
                      <span
                        className={`font-mono text-[10px] shrink-0 mt-0.5 ${
                          isActive ? "text-purple-600 dark:text-purple-300 font-bold" : "text-muted-foreground/60"
                        }`}
                      >
                        {num}
                      </span>
                      <span className="truncate leading-snug">{item.text}</span>
                    </button>
                  );
                })
              )}
            </div>

            {/* Helper Footer on TOC */}
            <div className="p-3 border-t border-border/50 bg-muted/10 text-[10.5px] text-muted-foreground leading-relaxed">
              💡 <strong>Como criar seções:</strong> Qualquer linha formatada com <strong>H1, H2 ou H3</strong> na barra superior vira automaticamente uma seção numerada aqui.
            </div>
          </aside>
        )}

        {/* Center: Editor Canvas Area */}
        <div
          ref={scrollContainerRef}
          className="flex-1 flex flex-col min-w-0 bg-slate-100/80 dark:bg-muted/30 overflow-y-auto scroll-smooth print:overflow-visible print:h-auto print:bg-white print:p-0 print:block"
        >
          
          {/* Read-Only Alert Banner */}
          {isReadOnly && (
            <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-between text-xs text-amber-700 dark:text-amber-300 print:hidden">
              <span className="flex items-center gap-1.5 font-medium">
                <Lock size={14} />
                <strong>Modo Leitura / Público:</strong> Este documento está protegido contra edição acidental.
              </span>
              <button
                onClick={() => setIsReadOnly(false)}
                className="px-2.5 py-1 rounded-lg bg-amber-500 text-white text-[11px] font-bold hover:bg-amber-600 transition-colors"
              >
                Habilitar Edição
              </button>
            </div>
          )}

          {/* WYSIWYG Ribbon Toolbar (Hidden in Read-Only mode) */}
          {!isReadOnly && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="sticky top-0 z-10 bg-background/90 backdrop-blur-md border-b border-border px-4 py-2 flex flex-wrap items-center gap-1 shadow-xs print:hidden"
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

              {/* Block Styles / Headings */}
              <div className="flex items-center border-r border-border/80 pr-1.5 mr-1 space-x-0.5">
                <button
                  onClick={() => execCmd("formatBlock", "<h1>")}
                  className="px-2 py-1 rounded-lg hover:bg-muted text-xs font-bold text-muted-foreground hover:text-foreground"
                  title="Título Principal 1 (Vira Seção no Índice)"
                >
                  H1
                </button>
                <button
                  onClick={() => execCmd("formatBlock", "<h2>")}
                  className="px-2 py-1 rounded-lg hover:bg-muted text-xs font-bold text-muted-foreground hover:text-foreground"
                  title="Título de Seção 2 (Vira Seção no Índice)"
                >
                  H2
                </button>
                <button
                  onClick={() => execCmd("formatBlock", "<h3>")}
                  className="px-2 py-1 rounded-lg hover:bg-muted text-xs font-bold text-muted-foreground hover:text-foreground"
                  title="Subtítulo 3 (Vira Seção no Índice)"
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

              {/* Direct Section Marker Button */}
              <div className="flex items-center border-r border-border/80 pr-1.5 mr-1">
                <button
                  onClick={() => execCmd("formatBlock", "<h2>")}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-300 text-xs font-semibold transition-colors"
                  title="Definir a linha atual como uma Nova Seção (H2) que aparece no menu 'Neste Documento'"
                >
                  <Bookmark size={13} />
                  <span>+ Seção (H2)</span>
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

              {/* Image Inserter Button */}
              <div className="relative">
                <button
                  onClick={() => setShowImageModal(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold transition-colors"
                  title="Inserir Imagem do Computador ou por Link"
                >
                  <ImageIcon size={14} />
                  <span>+ Imagem</span>
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
                    setShowTableCellColorPicker(false);
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold transition-colors"
                  title="Inserir Tabelas e Matrizes Estilizadas"
                >
                  <TableIcon size={14} />
                  <span>+ Tabela Colorida</span>
                  <ChevronDown size={11} />
                </button>

                {showTablesMenu && (
                  <div className="absolute top-full left-0 mt-1.5 bg-card border border-border shadow-2xl rounded-2xl p-2 z-50 w-64 space-y-1">
                    <div className="text-[10px] font-bold text-muted-foreground px-2 py-1 uppercase tracking-wider">
                      Modelos de Tabela Executiva
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
                      onClick={() => handleInsertStyledTable("purple")}
                      className="w-full text-left p-2 rounded-xl text-xs hover:bg-purple-500/10 hover:text-purple-500 text-foreground transition-colors"
                    >
                      <div className="font-bold">Tabela Roxo & Dourado</div>
                      <div className="text-[10px] text-muted-foreground">Governança e entregáveis</div>
                    </button>

                    <button
                      onClick={() => handleInsertStyledTable("slate")}
                      className="w-full text-left p-2 rounded-xl text-xs hover:bg-muted text-foreground transition-colors"
                    >
                      <div className="font-bold">Tabela Minimalista Slate</div>
                      <div className="text-[10px] text-muted-foreground">Linhas limpas e modernas</div>
                    </button>

                    <div className="border-t border-border/80 my-1 pt-1 text-[10px] font-bold text-muted-foreground px-2 uppercase tracking-wider">
                      Matrizes 2x2 Estratégicas
                    </div>

                    <button
                      onClick={() => handleInsertStyledTable("matrix")}
                      className="w-full text-left p-2 rounded-xl text-xs hover:bg-blue-500/10 hover:text-blue-500 text-foreground transition-colors"
                    >
                      <div className="font-bold">Matriz 2x2 Clássica (Azul & Roxo)</div>
                      <div className="text-[10px] text-muted-foreground">Priorização e 4 quadrantes</div>
                    </button>

                    <button
                      onClick={() => handleInsertStyledTable("matrix-dark")}
                      className="w-full text-left p-2 rounded-xl text-xs hover:bg-slate-800 hover:text-white text-foreground transition-colors"
                    >
                      <div className="font-bold">Matriz 2x2 Dark & Neon</div>
                      <div className="text-[10px] text-muted-foreground">Visual escuro moderno com alto contraste</div>
                    </button>

                    <button
                      onClick={() => handleInsertStyledTable("matrix-emerald")}
                      className="w-full text-left p-2 rounded-xl text-xs hover:bg-emerald-500/10 hover:text-emerald-500 text-foreground transition-colors"
                    >
                      <div className="font-bold">Matriz 2x2 Finanças & Compliance</div>
                      <div className="text-[10px] text-muted-foreground">Foco em ganhos, riscos e alertas</div>
                    </button>
                  </div>
                )}
              </div>

              {/* Table / Cell Background Color Picker */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowTableCellColorPicker(!showTableCellColorPicker);
                    setShowTablesMenu(false);
                    setShowCardsMenu(false);
                    setShowBadgesMenu(false);
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold transition-colors"
                  title="Pintar o Fundo da Célula, Cabeçalho ou Quadrante Selecionado"
                >
                  <Palette size={14} />
                  <span>🎨 Cor da Célula</span>
                  <ChevronDown size={11} />
                </button>

                {showTableCellColorPicker && (
                  <div className="absolute top-full left-0 mt-1.5 bg-card border border-border shadow-2xl rounded-2xl p-3 z-50 w-72 space-y-2.5">
                    <div>
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                        Tons Fortes (Cabeçalhos / Destaques)
                      </div>
                      <div className="grid grid-cols-6 gap-1.5">
                        {[
                          { name: "Azul Marinho", color: "#0f2c59", dark: true },
                          { name: "Slate Escuro", color: "#0f172a", dark: true },
                          { name: "Esmeralda", color: "#065f46", dark: true },
                          { name: "Roxo Real", color: "#4c1d95", dark: true },
                          { name: "Vinho / Vermelho", color: "#7f1d1d", dark: true },
                          { name: "Âmbar Escuro", color: "#78350f", dark: true },
                        ].map((c) => (
                          <button
                            key={c.name}
                            onClick={() => handleApplyCellColor(c.color, c.dark)}
                            className="w-8 h-8 rounded-lg border border-border/80 hover:scale-110 transition-transform flex items-center justify-center shadow-xs"
                            style={{ backgroundColor: c.color }}
                            title={c.name}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-border/80 pt-2">
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                        Tons Suaves (Fundo de Células / Quadrantes)
                      </div>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[
                          { name: "Azul Suave", color: "#eff6ff", label: "Azul" },
                          { name: "Roxo Suave", color: "#faf5ff", label: "Roxo" },
                          { name: "Verde Suave", color: "#ecfdf5", label: "Verde" },
                          { name: "Âmbar Suave", color: "#fffbeb", label: "Âmbar" },
                          { name: "Rosa Alerta", color: "#fff1f2", label: "Alerta" },
                          { name: "Slate Suave", color: "#f8fafc", label: "Slate" },
                          { name: "Branco Puro", color: "#ffffff", label: "Branco" },
                          { name: "Transparente", color: "transparent", label: "Limpar" },
                        ].map((c) => (
                          <button
                            key={c.name}
                            onClick={() => handleApplyCellColor(c.color, false)}
                            className="p-1.5 rounded-lg border border-border/80 hover:border-blue-500 text-[10px] font-bold text-slate-800 transition-all text-center flex items-center justify-center shadow-2xs"
                            style={{ backgroundColor: c.color === "transparent" ? "#fff" : c.color }}
                            title={c.name}
                          >
                            {c.label}
                          </button>
                        ))}
                      </div>
                    </div>
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
          )}

          {/* The A4 Paper Canvas & Metadata Card */}
          <div className="flex-1 py-8 px-4 flex flex-col items-center print:p-0 print:m-0 print:block print:w-full">
            
            {/* Visual Bulletin Metadata Card (Outside the Document) */}
            {showBulletinCard && (
              <BulletinMetadataCard
                metadata={bulletinMeta}
                onUpdateMetadata={(updated) => setBulletinMeta(updated)}
                isReadOnly={isReadOnly}
              />
            )}

            {/* The A4 Paper Card (Parecer Técnico) */}
            <div
              className="w-full max-w-[850px] min-h-[1050px] bg-card text-foreground rounded-2xl shadow-xl border border-border p-10 sm:p-14 transition-all focus-within:ring-2 focus-within:ring-blue-500/30 print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none print:w-full print:bg-white print:text-black"
              style={{
                boxShadow: "0 10px 35px -5px rgba(0, 0, 0, 0.08), 0 0 0 1px var(--border)",
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              {/* Native Uncontrolled contentEditable with smooth typing */}
              <div
                ref={editorRef}
                contentEditable={!isReadOnly}
                suppressContentEditableWarning
                onInput={handleEditorInput}
                onMouseUp={handleMouseUp}
                onKeyUp={handleMouseUp}
                onContextMenu={handleContextMenu}
                className={`outline-none min-h-[950px] leading-relaxed text-[15px] prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-blockquote:my-3 prose-hr:my-4 print:prose-neutral print:text-black print:max-w-none ${
                  isReadOnly ? "cursor-default select-text" : "cursor-text"
                }`}
              />
            </div>

          </div>

          {/* Footer Stats Bar */}
          <footer className="h-8 border-t border-border bg-background/80 px-4 flex items-center justify-between text-[11px] text-muted-foreground shrink-0 select-none print:hidden">
            <div className="flex items-center gap-4">
              <span>{stats.words} palavras</span>
              <span>{stats.chars} caracteres</span>
              <span>~{stats.estimatedPages} pág. A4</span>
              <span>~{stats.readTimeMinutes} min de leitura</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-block w-2 h-2 rounded-full ${isReadOnly ? "bg-amber-500" : "bg-emerald-500"}`} />
              <span>{isReadOnly ? "Modo Leitura (Bloqueado)" : "Modo Executivo & Design System Ativo"}</span>
            </div>
          </footer>

        </div>

        {/* Floating Selection AI Toolbar */}
        {!isReadOnly && (
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
        )}

        {/* Right Side: Derick-style AI Copilot Panel */}
        {isCopilotOpen && (
          <AiCopilotSidebar
            fullDocumentHtml={editorRef.current?.innerHTML || ""}
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

      {/* Image Inserter Modal */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-background border border-border shadow-2xl rounded-3xl w-full max-w-md p-6 text-foreground">
            <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
              <ImageIcon size={18} className="text-indigo-500" />
              Inserir Imagem no Documento
            </h3>

            <div className="space-y-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-4 rounded-2xl border-2 border-dashed border-indigo-500/30 hover:border-indigo-500 hover:bg-indigo-500/5 transition-all text-center group cursor-pointer"
              >
                <Upload size={24} className="mx-auto text-indigo-500 mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold text-foreground">Carregar imagem do computador</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">PNG, JPG, SVG, WebP ou GIF (ou arraste na folha)</div>
              </button>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="flex-1 h-px bg-border" />
                <span>OU VIA LINK WEB</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <div className="space-y-2">
                <input
                  type="url"
                  placeholder="https://exemplo.com/imagem.png"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  className="w-full bg-muted/40 border border-border rounded-xl p-2.5 text-xs text-foreground outline-none focus:border-indigo-500"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setShowImageModal(false)}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium text-muted-foreground hover:bg-muted"
                  >
                    Cancelar
                  </button>
                  <button
                    disabled={!imageUrlInput.trim()}
                    onClick={() => insertImageHtml(imageUrlInput)}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                  >
                    Inserir por Link
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Print Isolation Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: A4 portrait;
            margin: 12mm 15mm 12mm 15mm;
          }
          html, body {
            background-color: #ffffff !important;
            color: #000000 !important;
            overflow: visible !important;
            height: auto !important;
            font-size: 11pt;
          }
          h1, h2, h3, h4 {
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
          table, tr, td, th {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .print-card-break {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}} />

    </div>
  );
}
