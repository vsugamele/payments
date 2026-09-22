"use client";

import React, { useState } from "react";
import {
  Calendar,
  Clock,
  ShieldCheck,
  Globe,
  Tag,
  AlertTriangle,
  Users,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Copy,
  Check,
  Building2,
  FileCheck2,
  Edit3,
  History,
  CalendarDays,
  Plus,
  Trash2,
  Layers,
  FileText,
  X,
} from "lucide-react";

export interface BulletinVersionItem {
  id?: string;
  version: string;
  date: string;
  description: string;
  isCurrent?: boolean;
}

export interface BulletinDateDetail {
  id?: string;
  date: string;
  event: string;
  impactType: "Go-Live" | "Publicação" | "Transição" | "Expiração" | "Deadline";
  explanation: string;
}

export interface CustomField {
  id: string;
  label: string;
  value: string;
}

export interface BulletinMetadata {
  brand: "mastercard" | "visa" | "elo" | "amex" | "pix" | "geral";
  brandName?: string;
  title: string;
  referenceId: string;
  publicationDate: string;
  effectiveDate: string;
  keyExpirationDate?: string;
  category: string;
  audience: string[];
  region: string;
  requirement: "Mandatório" | "Informativo" | "Opcional" | "Alerta de Risco";
  riskLevel: "Baixo" | "Médio" | "Alto" | "Crítico";
  tags: string[];
  executiveSummary: string;
  recommendedAction: string;
  versionHistory?: BulletinVersionItem[];
  dateExplanations?: BulletinDateDetail[];
  customFields?: CustomField[];
}

interface BulletinMetadataCardProps {
  metadata: BulletinMetadata;
  onUpdateMetadata?: (updated: BulletinMetadata) => void;
  isReadOnly?: boolean;
}

export default function BulletinMetadataCard({
  metadata,
  onUpdateMetadata,
  isReadOnly = false,
}: BulletinMetadataCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "versions" | "dates">("overview");
  const [isCopiedId, setIsCopiedId] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTab, setEditTab] = useState<"general" | "audience" | "dates" | "versions" | "custom">("general");
  const [editForm, setEditForm] = useState<BulletinMetadata>(metadata);

  // New item inputs
  const [newAudienceInput, setNewAudienceInput] = useState("");
  const [newTagInput, setNewTagInput] = useState("");
  const [newCustomLabel, setNewCustomLabel] = useState("");
  const [newCustomValue, setNewCustomValue] = useState("");

  const copyId = () => {
    navigator.clipboard.writeText(metadata.referenceId);
    setIsCopiedId(true);
    setTimeout(() => setIsCopiedId(false), 2000);
  };

  const handleStartEditing = () => {
    setEditForm(JSON.parse(JSON.stringify(metadata)));
    setIsEditing(true);
    setIsExpanded(true);
  };

  const handleSaveEdit = () => {
    if (onUpdateMetadata) {
      onUpdateMetadata(editForm);
    }
    setIsEditing(false);
  };

  // Audience Handlers
  const handleAddAudience = () => {
    if (!newAudienceInput.trim()) return;
    setEditForm({
      ...editForm,
      audience: [...editForm.audience, newAudienceInput.trim()],
    });
    setNewAudienceInput("");
  };

  const handleRemoveAudience = (index: number) => {
    const updated = editForm.audience.filter((_, i) => i !== index);
    setEditForm({ ...editForm, audience: updated });
  };

  // Tag Handlers
  const handleAddTag = () => {
    if (!newTagInput.trim()) return;
    const clean = newTagInput.trim().replace(/^#/, "");
    setEditForm({
      ...editForm,
      tags: [...editForm.tags, clean],
    });
    setNewTagInput("");
  };

  const handleRemoveTag = (index: number) => {
    const updated = editForm.tags.filter((_, i) => i !== index);
    setEditForm({ ...editForm, tags: updated });
  };

  // Date Handlers
  const handleAddDate = () => {
    const newItem: BulletinDateDetail = {
      id: "date-" + Date.now(),
      date: new Date().toLocaleDateString("pt-BR"),
      event: "Novo Marco / Vigência",
      impactType: "Go-Live",
      explanation: "Descrição do impacto técnico e operacional...",
    };
    setEditForm({
      ...editForm,
      dateExplanations: [...(editForm.dateExplanations || []), newItem],
    });
  };

  const handleUpdateDate = (index: number, field: keyof BulletinDateDetail, value: any) => {
    const list = [...(editForm.dateExplanations || [])];
    list[index] = { ...list[index], [field]: value };
    setEditForm({ ...editForm, dateExplanations: list });
  };

  const handleRemoveDate = (index: number) => {
    const list = [...(editForm.dateExplanations || [])].filter((_, i) => i !== index);
    setEditForm({ ...editForm, dateExplanations: list });
  };

  // Version Handlers
  const handleAddVersion = () => {
    const count = (editForm.versionHistory?.length || 0) + 1;
    const newItem: BulletinVersionItem = {
      id: "ver-" + Date.now(),
      version: `${editForm.referenceId || "GLB"}.${count}`,
      date: new Date().toLocaleDateString("pt-BR"),
      description: "Descrição das alterações implementadas nesta revisão...",
      isCurrent: false,
    };
    setEditForm({
      ...editForm,
      versionHistory: [newItem, ...(editForm.versionHistory || [])],
    });
  };

  const handleUpdateVersion = (index: number, field: keyof BulletinVersionItem, value: any) => {
    const list = [...(editForm.versionHistory || [])];
    if (field === "isCurrent" && value === true) {
      // Uncheck others
      list.forEach((v, i) => {
        v.isCurrent = i === index;
      });
    } else {
      list[index] = { ...list[index], [field]: value };
    }
    setEditForm({ ...editForm, versionHistory: list });
  };

  const handleRemoveVersion = (index: number) => {
    const list = [...(editForm.versionHistory || [])].filter((_, i) => i !== index);
    setEditForm({ ...editForm, versionHistory: list });
  };

  // Custom Fields Handlers
  const handleAddCustomField = () => {
    if (!newCustomLabel.trim()) return;
    const newItem: CustomField = {
      id: "field-" + Date.now(),
      label: newCustomLabel.trim(),
      value: newCustomValue.trim() || "Informação não especificada",
    };
    setEditForm({
      ...editForm,
      customFields: [...(editForm.customFields || []), newItem],
    });
    setNewCustomLabel("");
    setNewCustomValue("");
  };

  const handleUpdateCustomField = (index: number, field: "label" | "value", value: string) => {
    const list = [...(editForm.customFields || [])];
    list[index] = { ...list[index], [field]: value };
    setEditForm({ ...editForm, customFields: list });
  };

  const handleRemoveCustomField = (index: number) => {
    const list = [...(editForm.customFields || [])].filter((_, i) => i !== index);
    setEditForm({ ...editForm, customFields: list });
  };

  // Brand visual identity
  const getBrandStyling = (brand: string) => {
    switch (brand.toLowerCase()) {
      case "mastercard":
        return {
          icon: (
            <div className="flex items-center -space-x-1.5 shrink-0">
              <span className="w-3.5 h-3.5 rounded-full bg-[#EB001B] inline-block shadow-xs" />
              <span className="w-3.5 h-3.5 rounded-full bg-[#F79E1B] inline-block opacity-90 shadow-xs" />
            </div>
          ),
          name: "Mastercard®",
        };
      case "visa":
        return {
          icon: <span className="font-black italic text-blue-600 dark:text-blue-400 tracking-tighter text-xs">VISA</span>,
          name: "Visa®",
        };
      case "elo":
        return {
          icon: (
            <div className="flex items-center space-x-0.5 shrink-0">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span className="w-2 h-2 rounded-full bg-yellow-400" />
              <span className="w-2 h-2 rounded-full bg-blue-500" />
            </div>
          ),
          name: "Elo",
        };
      case "pix":
        return {
          icon: <span className="font-bold text-emerald-600 text-xs">PIX</span>,
          name: "Arranjo Pix / BACEN",
        };
      default:
        return {
          icon: <Building2 size={14} className="text-purple-500" />,
          name: metadata.brandName || "Regulatório / Bandeiras",
        };
    }
  };

  const brandStyle = getBrandStyling(metadata.brand);

  const getRiskBadge = (risk: string) => {
    switch (risk.toLowerCase()) {
      case "crítico":
        return "bg-red-50 dark:bg-red-500/15 text-red-700 dark:text-red-300 border-red-200 dark:border-red-500/30 shadow-2xs";
      case "alto":
        return "bg-orange-50 dark:bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-500/30 shadow-2xs";
      case "médio":
        return "bg-amber-50 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-500/30 shadow-2xs";
      default:
        return "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30 shadow-2xs";
    }
  };

  const getRequirementBadge = (req: string) => {
    switch (req.toLowerCase()) {
      case "mandatório":
        return "bg-red-50 dark:bg-red-500/15 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/30 shadow-2xs";
      case "alerta de risco":
        return "bg-amber-50 dark:bg-amber-500/15 text-amber-800 dark:text-amber-400 border-amber-200 dark:border-amber-500/30 shadow-2xs";
      default:
        return "bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/30 shadow-2xs";
    }
  };

  const getDateBadge = (type: string) => {
    switch (type) {
      case "Go-Live":
        return "bg-amber-50 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-500/30 shadow-2xs";
      case "Publicação":
        return "bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/30 shadow-2xs";
      case "Expiração":
        return "bg-red-50 dark:bg-red-500/15 text-red-700 dark:text-red-300 border-red-200 dark:border-red-500/30 shadow-2xs";
      default:
        return "bg-purple-50 dark:bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-500/30 shadow-2xs";
    }
  };

  return (
    <div className="w-full max-w-[850px] mb-6 rounded-2xl border border-slate-200 dark:border-border bg-white dark:bg-card shadow-md dark:shadow-xl overflow-hidden transition-all text-foreground print:shadow-none print:border print:border-slate-300 print:bg-white print:text-black print:mb-4 print-card-break">
      
      {/* ── Top Bar / Header Summary ─────────────────────────────────────────── */}
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-border/80 bg-slate-50/70 dark:bg-muted/30 flex flex-wrap items-center justify-between gap-3 print:bg-slate-50 print:border-slate-200">
        
        {/* Brand & Reference */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2.5 rounded-xl bg-white dark:bg-card border border-slate-200 dark:border-border shadow-xs flex items-center justify-center shrink-0 print:border-slate-200 print:bg-white">
            {brandStyle.icon}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-xs tracking-wide uppercase text-slate-800 dark:text-foreground print:text-black">
                {brandStyle.name}
              </span>
              <button
                onClick={copyId}
                className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-muted text-[11px] font-mono font-bold text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-border/80 hover:bg-slate-200/70 transition-colors shadow-2xs print:border-slate-300 print:text-blue-700"
                title="Copiar Código de Referência"
              >
                <span>{metadata.referenceId}</span>
                {isCopiedId ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} className="print:hidden" />}
              </button>
              <span className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border ${getRequirementBadge(metadata.requirement)}`}>
                {metadata.requirement.toUpperCase()}
              </span>
            </div>
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-foreground truncate mt-0.5 max-w-xl print:text-black">
              {metadata.title}
            </h2>
          </div>
        </div>

        {/* Action Controls & Tabs (Hidden in Print) */}
        <div className="flex items-center gap-2 shrink-0 ml-auto print:hidden">
          {/* Tabs switch */}
          {isExpanded && !isEditing && (
            <div className="hidden sm:flex items-center bg-slate-100 dark:bg-muted/60 p-1 rounded-xl border border-slate-200 dark:border-border/60 text-xs font-semibold">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeTab === "overview"
                    ? "bg-white dark:bg-card text-slate-900 dark:text-foreground shadow-xs font-bold border border-slate-200/80 dark:border-transparent"
                    : "text-slate-600 dark:text-muted-foreground hover:text-slate-900 dark:hover:text-foreground"
                }`}
              >
                Visão Geral
              </button>
              <button
                onClick={() => setActiveTab("dates")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                  activeTab === "dates"
                    ? "bg-white dark:bg-card text-slate-900 dark:text-foreground shadow-xs font-bold border border-slate-200/80 dark:border-transparent"
                    : "text-slate-600 dark:text-muted-foreground hover:text-slate-900 dark:hover:text-foreground"
                }`}
              >
                <CalendarDays size={13} className="text-amber-500" />
                <span>Datas ({metadata.dateExplanations?.length || 0})</span>
              </button>
              <button
                onClick={() => setActiveTab("versions")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                  activeTab === "versions"
                    ? "bg-white dark:bg-card text-slate-900 dark:text-foreground shadow-xs font-bold border border-slate-200/80 dark:border-transparent"
                    : "text-slate-600 dark:text-muted-foreground hover:text-slate-900 dark:hover:text-foreground"
                }`}
              >
                <History size={13} className="text-blue-500" />
                <span>Versões ({metadata.versionHistory?.length || 0})</span>
              </button>
            </div>
          )}

          {!isReadOnly && (
            <button
              onClick={isEditing ? () => setIsEditing(false) : handleStartEditing}
              className="px-2.5 py-1.5 rounded-xl text-slate-700 dark:text-muted-foreground hover:text-slate-900 dark:hover:text-foreground bg-white dark:bg-card hover:bg-slate-50 dark:hover:bg-muted border border-slate-200 dark:border-border/60 transition-all text-xs font-bold flex items-center gap-1.5 shadow-2xs"
              title="Editar Campos de Metadados"
            >
              <Edit3 size={13} className="text-blue-500" />
              <span className="hidden sm:inline">{isEditing ? "Cancelar" : "Editar Ficha"}</span>
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-xl text-slate-600 dark:text-muted-foreground hover:text-slate-900 dark:hover:text-foreground bg-white dark:bg-card hover:bg-slate-50 dark:hover:bg-muted border border-slate-200 dark:border-border/60 transition-all shadow-2xs"
            title={isExpanded ? "Recolher Ficha Cadastral" : "Expandir Ficha Cadastral"}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

      </div>

      {/* ── Mobile Tab Navigation (Hidden in Print) ───────────────────────────── */}
      {isExpanded && !isEditing && (
        <div className="flex sm:hidden border-b border-border/60 bg-muted/20 px-3 py-1.5 gap-1 text-xs font-medium overflow-x-auto print:hidden">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-3 py-1 rounded-lg ${activeTab === "overview" ? "bg-card text-foreground font-bold" : "text-muted-foreground"}`}
          >
            Visão Geral
          </button>
          <button
            onClick={() => setActiveTab("dates")}
            className={`px-3 py-1 rounded-lg ${activeTab === "dates" ? "bg-card text-foreground font-bold" : "text-muted-foreground"}`}
          >
            Datas & Prazos
          </button>
          <button
            onClick={() => setActiveTab("versions")}
            className={`px-3 py-1 rounded-lg ${activeTab === "versions" ? "bg-card text-foreground font-bold" : "text-muted-foreground"}`}
          >
            Histórico de Versões
          </button>
        </div>
      )}

      {/* ── Expanded Content (View Mode) ──────────────────────────────────────── */}
      {(isExpanded || typeof window !== "undefined") && (
        <div className={`${isExpanded && !isEditing ? "block" : "hidden print:block"} p-5 sm:p-6 space-y-5 bg-card/60 backdrop-blur-xs print:bg-white print:p-4 print:space-y-4`}>
          
          {/* TAB 1: OVERVIEW (Always shown in print) */}
          <div className={activeTab === "overview" ? "space-y-5" : "hidden print:block print:space-y-4"}>
              
              {/* Main KPI / Data Metric Tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 print:grid-cols-4 print:gap-2">
                
                {/* Publicação */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-muted/30 border border-slate-200 dark:border-border/60 shadow-xs hover:border-blue-300 dark:hover:border-border transition-all flex flex-col justify-between print:bg-slate-50 print:border-slate-200 print:p-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-md bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <Calendar size={12} />
                    </div>
                    <span className="text-[10px] font-extrabold text-slate-600 dark:text-muted-foreground uppercase tracking-wider print:text-slate-600">
                      Publicação
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-foreground mt-2 print:text-black">
                    {metadata.publicationDate}
                  </div>
                </div>

                {/* Vigência / Go-Live */}
                <div className="p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 shadow-xs ring-1 ring-amber-400/20 hover:border-amber-400 transition-all flex flex-col justify-between print:bg-amber-50/50 print:border-amber-200 print:p-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-md bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <Clock size={12} />
                    </div>
                    <span className="text-[10px] font-extrabold text-amber-700 dark:text-amber-400 uppercase tracking-wider print:text-amber-800">
                      Vigência / Go-Live
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm font-black text-amber-700 dark:text-amber-400 mt-2 print:text-amber-800">
                    {metadata.effectiveDate}
                  </div>
                </div>

                {/* Região */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-muted/30 border border-slate-200 dark:border-border/60 shadow-xs hover:border-indigo-300 dark:hover:border-border transition-all flex flex-col justify-between print:bg-slate-50 print:border-slate-200 print:p-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-md bg-indigo-100 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <Globe size={12} />
                    </div>
                    <span className="text-[10px] font-extrabold text-slate-600 dark:text-muted-foreground uppercase tracking-wider print:text-slate-600">
                      Região
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-foreground mt-2 leading-tight print:text-black">
                    {metadata.region}
                  </div>
                </div>

                {/* Nível de Risco */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-muted/30 border border-slate-200 dark:border-border/60 shadow-xs hover:border-emerald-300 dark:hover:border-border transition-all flex flex-col justify-between print:bg-slate-50 print:border-slate-200 print:p-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-md bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <ShieldCheck size={12} />
                    </div>
                    <span className="text-[10px] font-extrabold text-slate-600 dark:text-muted-foreground uppercase tracking-wider print:text-slate-600">
                      Risco Operacional
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${getRiskBadge(metadata.riskLevel)}`}>
                      {metadata.riskLevel}
                    </span>
                  </div>
                </div>

              </div>

              {/* Audience / Rol Impactado & Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1 print:grid-cols-2 print:gap-2">
                
                {/* Rol Impactado */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-muted/20 border border-slate-200 dark:border-border/60 shadow-xs hover:border-slate-300 dark:hover:border-border transition-all print:bg-slate-50 print:border-slate-200 print:p-2.5">
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className="w-6 h-6 rounded-lg bg-sky-100 dark:bg-sky-500/15 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                      <Users size={13} />
                    </div>
                    <span className="text-[11px] font-extrabold text-slate-700 dark:text-muted-foreground uppercase tracking-wider print:text-slate-600">
                      Público / Rol Impactado
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {metadata.audience.map((item, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-card text-slate-800 dark:text-foreground font-semibold text-xs border border-slate-200 dark:border-border shadow-2xs hover:border-slate-300 transition-colors print:border-slate-300 print:bg-white print:text-black"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Tags / Classificação */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-muted/20 border border-slate-200 dark:border-border/60 shadow-xs hover:border-slate-300 dark:hover:border-border transition-all print:bg-slate-50 print:border-slate-200 print:p-2.5">
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                      <Tag size={13} />
                    </div>
                    <span className="text-[11px] font-extrabold text-slate-700 dark:text-muted-foreground uppercase tracking-wider print:text-slate-600">
                      Tags de Classificação
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {metadata.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-md bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 text-[11px] font-bold border border-purple-200 dark:border-purple-500/20 shadow-2xs hover:border-purple-300 transition-colors print:border-purple-300 print:text-purple-800"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

              </div>

              {/* Custom Fields Section (if any exist) */}
              {metadata.customFields && metadata.customFields.length > 0 && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-muted/20 border border-slate-200 dark:border-border/60 shadow-xs print:bg-slate-50 print:border-slate-200 print:p-2.5">
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <Layers size={13} />
                    </div>
                    <span className="text-[11px] font-extrabold text-slate-700 dark:text-muted-foreground uppercase tracking-wider print:text-slate-600">
                      Campos & Especificações Adicionais
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {metadata.customFields.map((field) => (
                      <div key={field.id} className="p-3 rounded-xl bg-white dark:bg-card border border-slate-200 dark:border-border/80 shadow-2xs text-xs print:bg-white print:border-slate-200">
                        <span className="font-extrabold text-slate-600 dark:text-muted-foreground block text-[10.5px] uppercase tracking-wider print:text-slate-600">
                          {field.label}:
                        </span>
                        <span className="text-slate-900 dark:text-foreground font-semibold mt-1 block print:text-black">
                          {field.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Executive Summary Box */}
              <div className="p-4.5 rounded-xl bg-blue-50/70 dark:bg-blue-500/5 border border-blue-200/90 dark:border-blue-500/20 shadow-xs flex items-start gap-3.5 print:bg-blue-50/50 print:border-blue-200 print:p-3">
                <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <Sparkles size={16} />
                </div>
                <div className="text-xs sm:text-[13px] leading-relaxed text-slate-700 dark:text-foreground print:text-black">
                  <strong className="font-extrabold text-blue-800 dark:text-blue-400 block mb-1 text-xs sm:text-sm print:text-blue-900">
                    Síntese do Boletim:
                  </strong>
                  {metadata.executiveSummary}
                </div>
              </div>

            </div>

          {/* TAB 2: DATAS & PRAZOS DETALHADOS COM EXPLICAÇÃO */}
          <div className={activeTab === "dates" ? "space-y-3" : "hidden print:block print:space-y-3 print:pt-4 print:border-t print:border-slate-200"}>
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-2 print:text-slate-700">
              <CalendarDays size={14} className="text-amber-500" />
              Cronograma de Datas & Explicação Técnica dos Prazos
            </div>

            <div className="space-y-2.5 print:space-y-2">
              {(metadata.dateExplanations || []).map((d, idx) => (
                <div
                  key={d.id || idx}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-muted/20 border border-slate-200 dark:border-border shadow-xs flex flex-col sm:flex-row sm:items-start justify-between gap-3 hover:border-slate-300 dark:hover:bg-muted/30 transition-all print:bg-slate-50 print:border-slate-200 print:p-2.5 print-card-break"
                >
                  <div className="min-w-[130px] shrink-0">
                    <div className="font-mono text-xs sm:text-sm font-extrabold text-slate-900 dark:text-foreground print:text-black">
                      {d.date}
                    </div>
                    <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${getDateBadge(d.impactType)}`}>
                      {d.impactType}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-foreground print:text-black">
                      {d.event}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-muted-foreground mt-1 leading-relaxed print:text-slate-700">
                      {d.explanation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* TAB 3: HISTÓRICO DE VERSIONAMENTO */}
          <div className={activeTab === "versions" ? "space-y-3" : "hidden print:block print:space-y-3 print:pt-4 print:border-t print:border-slate-200"}>
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-2 print:text-slate-700">
              <History size={14} className="text-blue-500" />
              Histórico de Versões & Atualizações do Boletim
            </div>

            <div className="space-y-2.5 print:space-y-2">
              {(metadata.versionHistory || []).map((v, idx) => (
                <div
                  key={v.id || idx}
                  className={`p-3.5 rounded-xl border transition-all print:bg-white print:border-slate-200 print:p-2.5 print-card-break ${
                    v.isCurrent
                      ? "bg-blue-50/80 dark:bg-blue-500/5 border-blue-300 dark:border-blue-500/30 ring-1 ring-blue-500/20 shadow-xs print:border-blue-400"
                      : "bg-slate-50 dark:bg-muted/20 border-slate-200 dark:border-border shadow-xs hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-foreground print:text-black">
                        {v.version}
                      </span>
                      {v.isCurrent && (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-[10px] font-bold shadow-2xs print:border-emerald-400 print:text-emerald-800">
                          VERSÃO ATUAL
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-muted-foreground font-mono print:text-slate-600">
                      {v.date}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-muted-foreground leading-relaxed print:text-slate-700">
                    {v.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ── Complete Multi-Tab Edit Mode ──────────────────────────────────────── */}
      {isExpanded && isEditing && (
        <div className="p-5 space-y-4 bg-muted/10 border-t border-border print:hidden">
          
          {/* Header & Sub-Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/80 pb-3">
            <div className="text-xs font-extrabold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <Edit3 size={14} className="text-blue-500" />
              <span>Editar Todos os Metadados & Campos do Boletim</span>
            </div>

            <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border/60 text-[11px] font-bold">
              <button
                onClick={() => setEditTab("general")}
                className={`px-2.5 py-1 rounded-lg ${editTab === "general" ? "bg-card text-foreground shadow-2xs font-extrabold" : "text-muted-foreground"}`}
              >
                Gerais & Bandeira
              </button>
              <button
                onClick={() => setEditTab("dates")}
                className={`px-2.5 py-1 rounded-lg ${editTab === "dates" ? "bg-card text-foreground shadow-2xs font-extrabold" : "text-muted-foreground"}`}
              >
                Datas ({editForm.dateExplanations?.length || 0})
              </button>
              <button
                onClick={() => setEditTab("versions")}
                className={`px-2.5 py-1 rounded-lg ${editTab === "versions" ? "bg-card text-foreground shadow-2xs font-extrabold" : "text-muted-foreground"}`}
              >
                Versões ({editForm.versionHistory?.length || 0})
              </button>
              <button
                onClick={() => setEditTab("audience")}
                className={`px-2.5 py-1 rounded-lg ${editTab === "audience" ? "bg-card text-foreground shadow-2xs font-extrabold" : "text-muted-foreground"}`}
              >
                Público & Tags
              </button>
              <button
                onClick={() => setEditTab("custom")}
                className={`px-2.5 py-1 rounded-lg ${editTab === "custom" ? "bg-card text-foreground shadow-2xs font-extrabold" : "text-muted-foreground"}`}
              >
                + Campos Extras ({editForm.customFields?.length || 0})
              </button>
            </div>
          </div>

          {/* EDIT SUB-TAB 1: DADOS GERAIS */}
          {editTab === "general" && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-muted-foreground block mb-1">Bandeira</label>
                  <select
                    value={editForm.brand}
                    onChange={(e) => setEditForm({ ...editForm, brand: e.target.value as any })}
                    className="w-full text-xs p-2 rounded-xl bg-card border border-border focus:border-blue-500 outline-none"
                  >
                    <option value="mastercard">Mastercard®</option>
                    <option value="visa">Visa®</option>
                    <option value="elo">Elo</option>
                    <option value="pix">Pix / Bacen</option>
                    <option value="amex">American Express</option>
                    <option value="geral">Geral / Multibandeira</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-muted-foreground block mb-1">Identificação / Código</label>
                  <input
                    type="text"
                    value={editForm.referenceId}
                    onChange={(e) => setEditForm({ ...editForm, referenceId: e.target.value })}
                    className="w-full text-xs p-2 rounded-xl bg-card border border-border focus:border-blue-500 outline-none"
                    placeholder="Ex: GLB 10362.3"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-muted-foreground block mb-1">Classificação / Requerimento</label>
                  <select
                    value={editForm.requirement}
                    onChange={(e) => setEditForm({ ...editForm, requirement: e.target.value as any })}
                    className="w-full text-xs p-2 rounded-xl bg-card border border-border focus:border-blue-500 outline-none font-bold"
                  >
                    <option value="Mandatório">MANDATÓRIO</option>
                    <option value="Informativo">INFORMATIVO</option>
                    <option value="Opcional">OPCIONAL</option>
                    <option value="Alerta de Risco">ALERTA DE RISCO</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-muted-foreground block mb-1">Título Oficial</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full text-xs p-2 rounded-xl bg-card border border-border focus:border-blue-500 outline-none"
                  placeholder="Título completo do boletim..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-muted-foreground block mb-1">Data de Publicação</label>
                  <input
                    type="text"
                    value={editForm.publicationDate}
                    onChange={(e) => setEditForm({ ...editForm, publicationDate: e.target.value })}
                    className="w-full text-xs p-2 rounded-xl bg-card border border-border focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-muted-foreground block mb-1">Data de Vigência</label>
                  <input
                    type="text"
                    value={editForm.effectiveDate}
                    onChange={(e) => setEditForm({ ...editForm, effectiveDate: e.target.value })}
                    className="w-full text-xs p-2 rounded-xl bg-card border border-border focus:border-blue-500 outline-none font-bold text-amber-600"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-muted-foreground block mb-1">Região</label>
                  <input
                    type="text"
                    value={editForm.region}
                    onChange={(e) => setEditForm({ ...editForm, region: e.target.value })}
                    className="w-full text-xs p-2 rounded-xl bg-card border border-border focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-muted-foreground block mb-1">Nível de Risco</label>
                  <select
                    value={editForm.riskLevel}
                    onChange={(e) => setEditForm({ ...editForm, riskLevel: e.target.value as any })}
                    className="w-full text-xs p-2 rounded-xl bg-card border border-border focus:border-blue-500 outline-none font-bold"
                  >
                    <option value="Baixo">Baixo</option>
                    <option value="Médio">Médio</option>
                    <option value="Alto">Alto</option>
                    <option value="Crítico">Crítico</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-muted-foreground block mb-1">Resumo Executivo / Síntese</label>
                <textarea
                  rows={3}
                  value={editForm.executiveSummary}
                  onChange={(e) => setEditForm({ ...editForm, executiveSummary: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl bg-card border border-border focus:border-blue-500 outline-none leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* EDIT SUB-TAB 2: DATAS & PRAZOS */}
          {editTab === "dates" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground">Prazos & Marcos de Vigência</span>
                <button
                  type="button"
                  onClick={handleAddDate}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors"
                >
                  <Plus size={13} />
                  <span>Adicionar Data</span>
                </button>
              </div>

              <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                {(editForm.dateExplanations || []).map((dateItem, idx) => (
                  <div key={dateItem.id || idx} className="p-3 rounded-xl bg-card border border-border space-y-2 relative group">
                    <div className="flex items-center justify-between gap-2">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
                        <input
                          type="text"
                          value={dateItem.date}
                          onChange={(e) => handleUpdateDate(idx, "date", e.target.value)}
                          placeholder="DD/MM/AAAA"
                          className="text-xs p-1.5 rounded-lg bg-muted border border-border font-mono font-bold"
                        />
                        <input
                          type="text"
                          value={dateItem.event}
                          onChange={(e) => handleUpdateDate(idx, "event", e.target.value)}
                          placeholder="Nome do Evento / Marco"
                          className="text-xs p-1.5 rounded-lg bg-muted border border-border font-semibold"
                        />
                        <select
                          value={dateItem.impactType}
                          onChange={(e) => handleUpdateDate(idx, "impactType", e.target.value)}
                          className="text-xs p-1.5 rounded-lg bg-muted border border-border font-bold"
                        >
                          <option value="Go-Live">Go-Live</option>
                          <option value="Publicação">Publicação</option>
                          <option value="Transição">Transição</option>
                          <option value="Expiração">Expiração</option>
                          <option value="Deadline">Deadline</option>
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveDate(idx)}
                        className="p-1.5 text-muted-foreground hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-colors"
                        title="Excluir este prazo"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <textarea
                      rows={2}
                      value={dateItem.explanation}
                      onChange={(e) => handleUpdateDate(idx, "explanation", e.target.value)}
                      placeholder="Explicação técnica do que acontece nesta data..."
                      className="w-full text-xs p-2 rounded-lg bg-muted border border-border leading-relaxed"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* EDIT SUB-TAB 3: HISTÓRICO DE VERSÕES */}
          {editTab === "versions" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground">Histórico de Revisões do Documento</span>
                <button
                  type="button"
                  onClick={handleAddVersion}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors"
                >
                  <Plus size={13} />
                  <span>Adicionar Versão</span>
                </button>
              </div>

              <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                {(editForm.versionHistory || []).map((verItem, idx) => (
                  <div key={verItem.id || idx} className="p-3 rounded-xl bg-card border border-border space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
                        <input
                          type="text"
                          value={verItem.version}
                          onChange={(e) => handleUpdateVersion(idx, "version", e.target.value)}
                          placeholder="Ex: GLB 10362.3"
                          className="text-xs p-1.5 rounded-lg bg-muted border border-border font-mono font-bold"
                        />
                        <input
                          type="text"
                          value={verItem.date}
                          onChange={(e) => handleUpdateVersion(idx, "date", e.target.value)}
                          placeholder="Data da Revisão"
                          className="text-xs p-1.5 rounded-lg bg-muted border border-border"
                        />
                        <label className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold cursor-pointer">
                          <input
                            type="checkbox"
                            checked={verItem.isCurrent || false}
                            onChange={(e) => handleUpdateVersion(idx, "isCurrent", e.target.checked)}
                            className="rounded"
                          />
                          <span>Versão Atual (Ativa)</span>
                        </label>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveVersion(idx)}
                        className="p-1.5 text-muted-foreground hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-colors"
                        title="Excluir versão"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <textarea
                      rows={2}
                      value={verItem.description}
                      onChange={(e) => handleUpdateVersion(idx, "description", e.target.value)}
                      placeholder="Resumo das mudanças ocorridas nesta versão..."
                      className="w-full text-xs p-2 rounded-lg bg-muted border border-border leading-relaxed"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* EDIT SUB-TAB 4: PÚBLICO & TAGS */}
          {editTab === "audience" && (
            <div className="space-y-4">
              {/* Audience list */}
              <div>
                <label className="text-[11px] font-bold text-muted-foreground block mb-1.5">
                  Público / Rol Impactado
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {editForm.audience.map((item, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-card border border-border text-xs font-medium"
                    >
                      <span>{item}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAudience(idx)}
                        className="text-muted-foreground hover:text-red-500"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newAudienceInput}
                    onChange={(e) => setNewAudienceInput(e.target.value)}
                    placeholder="Adicionar ator (ex: Subadquirentes, Emissores, Terminais)..."
                    className="flex-1 text-xs p-2 rounded-xl bg-card border border-border focus:border-blue-500 outline-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddAudience();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddAudience}
                    className="px-3 py-1.5 rounded-xl bg-muted border border-border hover:bg-muted/80 text-xs font-bold"
                  >
                    + Adicionar
                  </button>
                </div>
              </div>

              {/* Tags list */}
              <div>
                <label className="text-[11px] font-bold text-muted-foreground block mb-1.5">
                  Tags de Classificação
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {editForm.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20 text-xs font-semibold"
                    >
                      <span>#{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(idx)}
                        className="text-purple-600 dark:text-purple-300 hover:text-red-500"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    placeholder="Adicionar tag (ex: capk, emv, 3ds)..."
                    className="flex-1 text-xs p-2 rounded-xl bg-card border border-border focus:border-blue-500 outline-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 py-1.5 rounded-xl bg-muted border border-border hover:bg-muted/80 text-xs font-bold"
                  >
                    + Adicionar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* EDIT SUB-TAB 5: CAMPOS CUSTOMIZADOS (ADICIONAR / DELETAR QUALQUER CAMPO) */}
          {editTab === "custom" && (
            <div className="space-y-3">
              <div className="text-xs text-muted-foreground leading-relaxed">
                Adicione qualquer campo específico do seu sistema (ex: <em>Impactos SubAdquirentes</em>, <em>BRD</em>, <em>Release</em>, <em>Testes/Certificação</em>, <em>Consulta Pública</em>) ou remova os que não se aplicam.
              </div>

              {/* Add new custom field row */}
              <div className="p-3 rounded-xl bg-card border border-blue-500/30 space-y-2">
                <div className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase">
                  + Adicionar Novo Campo Personalizado
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={newCustomLabel}
                    onChange={(e) => setNewCustomLabel(e.target.value)}
                    placeholder="Nome do Campo (ex: BRD, Release...)"
                    className="text-xs p-2 rounded-lg bg-muted border border-border font-bold"
                  />
                  <input
                    type="text"
                    value={newCustomValue}
                    onChange={(e) => setNewCustomValue(e.target.value)}
                    placeholder="Valor / Conteúdo do Campo"
                    className="text-xs p-2 rounded-lg bg-muted border border-border"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddCustomField}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors"
                >
                  Inserir Campo
                </button>
              </div>

              {/* List of custom fields */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {(editForm.customFields || []).map((field, idx) => (
                  <div key={field.id} className="p-2.5 rounded-xl bg-card border border-border flex items-center gap-2">
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => handleUpdateCustomField(idx, "label", e.target.value)}
                      className="w-1/3 text-xs p-1.5 rounded-lg bg-muted border border-border font-bold"
                    />
                    <input
                      type="text"
                      value={field.value}
                      onChange={(e) => handleUpdateCustomField(idx, "value", e.target.value)}
                      className="flex-1 text-xs p-1.5 rounded-lg bg-muted border border-border"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomField(idx)}
                      className="p-1.5 text-muted-foreground hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-colors"
                      title="Deletar este campo"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Save/Cancel Footer */}
          <div className="flex items-center justify-between border-t border-border/80 pt-3">
            <span className="text-[11px] text-muted-foreground">
              💡 As alterações serão aplicadas na visualização da ficha e persistidas no documento.
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 rounded-xl border border-border text-xs font-semibold hover:bg-muted"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors"
              >
                Salvar Alterações
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
