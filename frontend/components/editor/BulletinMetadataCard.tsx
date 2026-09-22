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
  ArrowRight,
  Info,
} from "lucide-react";

export interface BulletinVersionItem {
  version: string;
  date: string;
  description: string;
  isCurrent?: boolean;
}

export interface BulletinDateDetail {
  date: string;
  event: string;
  impactType: "Go-Live" | "Publicação" | "Transição" | "Expiração" | "Deadline";
  explanation: string;
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
  // Versioning & Detailed Dates
  versionHistory?: BulletinVersionItem[];
  dateExplanations?: BulletinDateDetail[];
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
  const [editForm, setEditForm] = useState<BulletinMetadata>(metadata);

  const copyId = () => {
    navigator.clipboard.writeText(metadata.referenceId);
    setIsCopiedId(true);
    setTimeout(() => setIsCopiedId(false), 2000);
  };

  const handleSaveEdit = () => {
    if (onUpdateMetadata) {
      onUpdateMetadata(editForm);
    }
    setIsEditing(false);
  };

  // Brand visual identity
  const getBrandStyling = (brand: string) => {
    switch (brand.toLowerCase()) {
      case "mastercard":
        return {
          badgeBg: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30",
          icon: (
            <div className="flex items-center -space-x-1.5 shrink-0">
              <span className="w-3.5 h-3.5 rounded-full bg-[#EB001B] inline-block shadow-xs" />
              <span className="w-3.5 h-3.5 rounded-full bg-[#F79E1B] inline-block opacity-90 shadow-xs" />
            </div>
          ),
          name: "Mastercard®",
          sub: "Debit Mastercard, Maestro®, Cirrus®",
        };
      case "visa":
        return {
          badgeBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
          icon: <span className="font-black italic text-blue-600 dark:text-blue-400 tracking-tighter text-xs">VISA</span>,
          name: "Visa®",
          sub: "Visa Classic, Gold, Platinum, Infinite",
        };
      case "elo":
        return {
          badgeBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
          icon: (
            <div className="flex items-center space-x-0.5 shrink-0">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span className="w-2 h-2 rounded-full bg-yellow-400" />
              <span className="w-2 h-2 rounded-full bg-blue-500" />
            </div>
          ),
          name: "Elo",
          sub: "Crédito, Débito, Benefícios",
        };
      case "pix":
        return {
          badgeBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
          icon: <span className="font-bold text-emerald-600 text-xs">PIX</span>,
          name: "Arranjo Pix / BACEN",
          sub: "Banco Central do Brasil",
        };
      default:
        return {
          badgeBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30",
          icon: <Building2 size={14} className="text-purple-500" />,
          name: metadata.brandName || "Regulatório / Bandeiras",
          sub: "Ecossistema de Pagamentos",
        };
    }
  };

  const brandStyle = getBrandStyling(metadata.brand);

  const getRiskBadge = (risk: string) => {
    switch (risk.toLowerCase()) {
      case "crítico":
        return "bg-red-500/15 text-red-600 dark:text-red-300 border-red-500/30";
      case "alto":
        return "bg-orange-500/15 text-orange-600 dark:text-orange-300 border-orange-500/30";
      case "médio":
        return "bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30";
      default:
        return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30";
    }
  };

  const getRequirementBadge = (req: string) => {
    switch (req.toLowerCase()) {
      case "mandatório":
        return "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30";
      case "alerta de risco":
        return "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30";
      default:
        return "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30";
    }
  };

  const getDateBadge = (type: string) => {
    switch (type) {
      case "Go-Live":
        return "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30";
      case "Publicação":
        return "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30";
      case "Expiração":
        return "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30";
      default:
        return "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30";
    }
  };

  return (
    <div className="w-full max-w-[850px] mb-6 rounded-2xl border border-border bg-card shadow-lg overflow-hidden transition-all text-foreground">
      {/* ── Top Bar / Header Summary ─────────────────────────────────────────── */}
      <div className="p-4 sm:p-5 border-b border-border/80 bg-muted/30 flex flex-wrap items-center justify-between gap-3">
        
        {/* Brand & Reference */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 rounded-xl bg-card border border-border shadow-xs flex items-center justify-center shrink-0">
            {brandStyle.icon}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-xs tracking-wide uppercase text-foreground">
                {brandStyle.name}
              </span>
              <button
                onClick={copyId}
                className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-muted text-[11px] font-mono font-bold text-blue-600 dark:text-blue-400 border border-border/80 hover:bg-muted/80 transition-colors"
                title="Copiar Código de Referência"
              >
                <span>{metadata.referenceId}</span>
                {isCopiedId ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
              </button>
              <span className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold border ${getRequirementBadge(metadata.requirement)}`}>
                {metadata.requirement.toUpperCase()}
              </span>
            </div>
            <h2 className="text-sm sm:text-base font-bold text-foreground truncate mt-0.5 max-w-xl">
              {metadata.title}
            </h2>
          </div>
        </div>

        {/* Action Controls & Tabs */}
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          {/* Tabs switch */}
          {isExpanded && !isEditing && (
            <div className="hidden sm:flex items-center bg-muted/60 p-1 rounded-xl border border-border/60 text-xs font-semibold">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  activeTab === "overview"
                    ? "bg-card text-foreground shadow-2xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Visão Geral
              </button>
              <button
                onClick={() => setActiveTab("dates")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors ${
                  activeTab === "dates"
                    ? "bg-card text-foreground shadow-2xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <CalendarDays size={12} />
                <span>Datas ({metadata.dateExplanations?.length || 2})</span>
              </button>
              <button
                onClick={() => setActiveTab("versions")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors ${
                  activeTab === "versions"
                    ? "bg-card text-foreground shadow-2xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <History size={12} />
                <span>Versões ({metadata.versionHistory?.length || 3})</span>
              </button>
            </div>
          )}

          {!isReadOnly && (
            <button
              onClick={() => {
                setEditForm(metadata);
                setIsEditing(!isEditing);
              }}
              className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted border border-border/60 transition-colors text-xs font-semibold flex items-center gap-1"
              title="Editar Campos de Metadados"
            >
              <Edit3 size={13} />
              <span className="hidden sm:inline">{isEditing ? "Cancelar" : "Editar"}</span>
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted border border-border/60 transition-colors"
            title={isExpanded ? "Recolher Ficha Cadastral" : "Expandir Ficha Cadastral"}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

      </div>

      {/* ── Mobile Tab Navigation ────────────────────────────────────────────── */}
      {isExpanded && !isEditing && (
        <div className="flex sm:hidden border-b border-border/60 bg-muted/20 px-3 py-1.5 gap-1 text-xs font-medium overflow-x-auto">
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

      {/* ── Expanded Content Grid ────────────────────────────────────────────── */}
      {isExpanded && !isEditing && (
        <div className="p-5 sm:p-6 space-y-5 bg-card/60 backdrop-blur-xs">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <>
              {/* Main KPI / Data Metric Tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                
                {/* Publicação */}
                <div className="p-3 rounded-xl bg-muted/40 border border-border/60 flex flex-col justify-between">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                    <Calendar size={12} className="text-blue-500" />
                    Publicação
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-foreground mt-1">
                    {metadata.publicationDate}
                  </div>
                </div>

                {/* Vigência / Go-Live */}
                <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 flex flex-col justify-between">
                  <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase flex items-center gap-1">
                    <Clock size={12} />
                    Vigência / Go-Live
                  </div>
                  <div className="text-xs sm:text-sm font-extrabold text-amber-600 dark:text-amber-400 mt-1">
                    {metadata.effectiveDate}
                  </div>
                </div>

                {/* Região */}
                <div className="p-3 rounded-xl bg-muted/40 border border-border/60 flex flex-col justify-between">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                    <Globe size={12} className="text-indigo-500" />
                    Região
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-foreground mt-1">
                    {metadata.region}
                  </div>
                </div>

                {/* Nível de Risco */}
                <div className="p-3 rounded-xl bg-muted/40 border border-border/60 flex flex-col justify-between">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                    <ShieldCheck size={12} className="text-emerald-500" />
                    Risco Operacional
                  </div>
                  <div className="mt-1">
                    <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-bold border ${getRiskBadge(metadata.riskLevel)}`}>
                      {metadata.riskLevel}
                    </span>
                  </div>
                </div>

              </div>

              {/* Audience / Rol Impactado & Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                
                {/* Rol Impactado */}
                <div className="p-3.5 rounded-xl bg-muted/20 border border-border/60">
                  <div className="text-[11px] font-bold text-muted-foreground uppercase flex items-center gap-1.5 mb-2">
                    <Users size={13} className="text-blue-500" />
                    Público / Rol Impactado
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {metadata.audience.map((item, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-card text-foreground font-medium text-xs border border-border shadow-2xs"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Tags / Classificação */}
                <div className="p-3.5 rounded-xl bg-muted/20 border border-border/60">
                  <div className="text-[11px] font-bold text-muted-foreground uppercase flex items-center gap-1.5 mb-2">
                    <Tag size={13} className="text-purple-500" />
                    Tags de Classificação
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {metadata.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-300 text-[11px] font-semibold border border-purple-500/20"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

              </div>

              {/* Executive Summary Box */}
              <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 flex items-start gap-3">
                <Sparkles size={16} className="text-blue-500 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-[13px] leading-relaxed text-foreground">
                  <strong className="font-bold text-blue-600 dark:text-blue-400 block mb-0.5">
                    Síntese do Boletim:
                  </strong>
                  {metadata.executiveSummary}
                </div>
              </div>
            </>
          )}

          {/* TAB 2: DATAS & PRAZOS DETALHADOS COM EXPLICAÇÃO */}
          {activeTab === "dates" && (
            <div className="space-y-3">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <CalendarDays size={14} className="text-amber-500" />
                Cronograma de Datas & Explicação Técnica dos Prazos
              </div>

              <div className="space-y-2.5">
                {(metadata.dateExplanations || [
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
                ]).map((d, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-muted/20 border border-border flex flex-col sm:flex-row sm:items-start justify-between gap-3 hover:bg-muted/30 transition-colors"
                  >
                    <div className="min-w-[130px] shrink-0">
                      <div className="font-mono text-xs sm:text-sm font-extrabold text-foreground">
                        {d.date}
                      </div>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${getDateBadge(d.impactType)}`}>
                        {d.impactType}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-foreground">
                        {d.event}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {d.explanation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: HISTÓRICO DE VERSIONAMENTO */}
          {activeTab === "versions" && (
            <div className="space-y-3">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <History size={14} className="text-blue-500" />
                Histórico de Versões & Atualizações do Boletim
              </div>

              <div className="space-y-2.5">
                {(metadata.versionHistory || [
                  {
                    version: "GLB 10362.3",
                    date: "22/09/2026",
                    description: "Atualização da data efetiva de 01/11/2025 para 01/11/2026 em todo o comunicado; extensão da expiração da chave de 1.984 bits de 31/12/2035 para 31/12/2036; atualização da referência ao EMVCo Notice Bulletin nº 30 (Julho/2026); remoção do texto sobre certificação de chaves menores que 1.024 bits.",
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
                ]).map((v, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border transition-all ${
                      v.isCurrent
                        ? "bg-blue-500/5 border-blue-500/30 ring-1 ring-blue-500/20"
                        : "bg-muted/20 border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-foreground">
                          {v.version}
                        </span>
                        {v.isCurrent && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                            VERSÃO ATUAL
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        {v.date}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {v.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* ── Edit Form Modal / Inline Editor ─────────────────────────────────── */}
      {isExpanded && isEditing && (
        <div className="p-5 space-y-4 bg-muted/10 border-t border-border">
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
            <span>Editar Metadados do Boletim</span>
            <span className="text-[11px] text-blue-500 font-normal">Alterações refletem na visualização</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-muted-foreground block mb-1">Título Oficial</label>
              <input
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="w-full text-xs p-2 rounded-xl bg-card border border-border focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-muted-foreground block mb-1">Identificação / Código</label>
              <input
                type="text"
                value={editForm.referenceId}
                onChange={(e) => setEditForm({ ...editForm, referenceId: e.target.value })}
                className="w-full text-xs p-2 rounded-xl bg-card border border-border focus:border-blue-500 outline-none"
              />
            </div>

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
                className="w-full text-xs p-2 rounded-xl bg-card border border-border focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-muted-foreground block mb-1">Resumo Executivo</label>
            <textarea
              rows={3}
              value={editForm.executiveSummary}
              onChange={(e) => setEditForm({ ...editForm, executiveSummary: e.target.value })}
              className="w-full text-xs p-2 rounded-xl bg-card border border-border focus:border-blue-500 outline-none leading-relaxed"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 rounded-xl border border-border text-xs font-semibold hover:bg-muted"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveEdit}
              className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors"
            >
              Salvar Alterações
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
