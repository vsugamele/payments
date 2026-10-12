"use client";

import React, { useState } from "react";
import {
  Search,
  BookOpen,
  FileText,
  Copy,
  Check,
  X,
  Sparkles,
  Loader2,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  Database,
  Hash,
} from "lucide-react";

export interface AcervoEvidenceItem {
  file: string;
  sha256: string;
  physicalPage: number | null;
  unitLabel: string;
  excerpt: string;
  locator: string;
  alerts: string[];
  impactAnalysis: any;
}

interface AcervoSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertHtml: (html: string) => void;
}

const QUICK_QUERIES = [
  { label: "AVS Mandate LAC", query: "Address Verification Service LAC" },
  { label: "MCBS TN3A Invoice", query: "GLB 12332 Invoice Detail Data Report TN3A" },
  { label: "Mastercard Edit 30 Refund", query: "Edit 30 Purchase Return Refund" },
  { label: "Visa TC 33 Acquirer", query: "Changes to TC 33 Acquirer Capture File" },
  { label: "Excessive Retries", query: "Excessive Authorization Attempts DE 39" },
  { label: "Mastercard SMS Guide", query: "Single Message System Guide Payout" },
];

export default function AcervoSearchModal({
  isOpen,
  onClose,
  onInsertHtml,
}: AcervoSearchModalProps) {
  const [query, setQuery] = useState("");
  const [brandFilter, setBrandFilter] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<AcervoEvidenceItem[]>([]);
  const [totalCandidates, setTotalCandidates] = useState<number>(0);
  const [timings, setTimings] = useState<Record<string, number>>({});
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [insertedIndex, setInsertedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleSearch = async (searchTerm?: string) => {
    const q = (searchTerm !== undefined ? searchTerm : query).trim();
    if (!q) return;

    try {
      setIsLoading(true);
      setError(null);

      const res = await fetch("/api/acervo/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pergunta: q,
          bandeira: brandFilter || undefined,
          papel: roleFilter || undefined,
          limite: 6,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Erro ao consultar acervo normativo.");
      }

      const data = await res.json();
      setResults(data.evidence || []);
      setTotalCandidates(data.totalCandidates || 0);
      setTimings(data.timingsMs || {});
    } catch (err: any) {
      console.error("Erro na busca do acervo:", err);
      setError(err.message || "Falha na comunicação com o banco do acervo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInsertQuote = (item: AcervoEvidenceItem, index: number) => {
    const pageStr = item.physicalPage ? `Pág. ${item.physicalPage}` : "Página não informada";
    const shortHash = item.sha256 ? item.sha256.substring(0, 12) : "";

    const htmlSnippet = `
      <div style="background:#f8fafc; border:1px solid #cbd5e1; border-left:4px solid #0f2c59; border-radius:8px; padding:14px 18px; margin:1.5rem 0; font-family:system-ui, -apple-system, sans-serif;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <div style="display:flex; align-items:center; gap:6px;">
            <span style="font-size:11px; font-weight:bold; background:#0f2c59; color:#ffffff; padding:2px 8px; border-radius:4px; text-transform:uppercase;">
              Citação Normativa Oficial
            </span>
            <span style="font-size:11px; color:#475569; font-weight:600;">
              ${item.file} &nbsp;•&nbsp; <strong style="color:#0f172a;">${pageStr}</strong>
            </span>
          </div>
          ${shortHash ? `<span style="font-family:monospace; font-size:10px; color:#94a3b8; background:#e2e8f0; padding:2px 6px; border-radius:4px;">SHA: ${shortHash}…</span>` : ""}
        </div>
        <blockquote style="margin:0 0 10px 0; padding:8px 12px; background:#ffffff; border-left:3px solid #3b82f6; border-radius:4px; font-size:12.5px; line-height:1.6; color:#1e293b; font-style:italic;">
          "${item.excerpt}"
        </blockquote>
        <div style="font-size:11px; color:#64748b;">
          <strong>Fonte Primária no Acervo:</strong> <code>${item.file}</code> (${pageStr})
        </div>
      </div>
      <p></p>
    `;

    onInsertHtml(htmlSnippet);
    setInsertedIndex(index);
    setTimeout(() => {
      setInsertedIndex(null);
      onClose();
    }, 600);
  };

  const handleCopyText = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-card border border-border shadow-2xl rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-foreground animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border bg-muted/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Database size={20} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
                <span>Consulta ao Acervo Oficial de Bandeiras (RAG)</span>
                <span className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-semibold">
                  35.336 Documentos
                </span>
              </h2>
              <p className="text-xs text-muted-foreground">
                Pesquise no acervo indexado offline (5,24 GB FTS) com citação de página, SHA-256 e trechos literais.
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

        {/* Search Bar & Filters */}
        <div className="p-4 border-b border-border bg-background/50 space-y-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Digite palavras-chave, código de boletim (ex: GLB 12332, TC 33) ou campo (ex: DE 126, AVS LAC)..."
                className="w-full bg-card border border-border rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={() => handleSearch()}
              disabled={isLoading || !query.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
            >
              {isLoading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Buscando...</span>
                </>
              ) : (
                <>
                  <Search size={15} />
                  <span>Consultar</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Query Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold text-muted-foreground mr-1">
              Exemplos Rápidos:
            </span>
            {QUICK_QUERIES.map((q, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuery(q.query);
                  handleSearch(q.query);
                }}
                className="text-[11px] bg-muted/60 hover:bg-muted hover:text-foreground text-muted-foreground px-2.5 py-0.5 rounded-lg border border-border transition-colors font-medium"
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Falha na consulta:</strong>
                <span>{error}</span>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="py-16 text-center space-y-3">
              <Loader2 size={32} className="animate-spin text-blue-500 mx-auto" />
              <div className="text-sm font-semibold text-foreground">
                Pesquisando em 35.336 manuais e boletins indexados...
              </div>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Consultando o banco offline (acervo.sqlite3) com correspondência de páginas físicas e offsets.
              </p>
            </div>
          )}

          {!isLoading && results.length === 0 && !error && (
            <div className="py-14 text-center space-y-3">
              <div className="p-3 bg-muted/40 rounded-full w-fit mx-auto text-muted-foreground">
                <BookOpen size={24} />
              </div>
              <div className="text-sm font-bold text-foreground">
                {query ? "Nenhum trecho normativo correspondente" : "Inicie uma busca no acervo"}
              </div>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                {query
                  ? "Tente buscar por termos em inglês, códigos oficiais de boletim (ex: GLB, AN, GTLIG) ou nomes de campos ISO (ex: DE 48, TC 33)."
                  : "Digite qualquer termo técnico ou escolha um dos atalhos acima para extrair citações com valor probatório de compliance."}
              </p>
            </div>
          )}

          {!isLoading && results.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                <span>
                  Encontradas <strong>{results.length}</strong> evidências no acervo
                  {totalCandidates > 0 && ` (${totalCandidates} unidades candidatas analisadas)`}.
                </span>
                {timings.total_retrieval_ms && (
                  <span>Tempo de busca: {Math.round(timings.total_retrieval_ms)}ms</span>
                )}
              </div>

              {results.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-card border border-border rounded-xl p-4 sm:p-5 hover:border-blue-500/40 transition-all space-y-3 shadow-xs"
                >
                  {/* Top line: file name & page */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                    <div className="flex items-center gap-2">
                      <FileText size={15} className="text-blue-500 shrink-0" />
                      <span className="font-bold text-xs sm:text-sm text-foreground">
                        {item.file}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {item.physicalPage && (
                        <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[11px] font-bold px-2 py-0.5 rounded-md">
                          Pág. {item.physicalPage}
                        </span>
                      )}
                      {item.sha256 && (
                        <span className="bg-muted text-muted-foreground font-mono text-[10px] px-1.5 py-0.5 rounded-md flex items-center gap-1">
                          <Hash size={10} />
                          {item.sha256.substring(0, 8)}…
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Excerpt quote */}
                  <blockquote className="text-xs sm:text-[13px] leading-relaxed text-foreground/90 bg-muted/30 border-l-2 border-blue-500 p-3 rounded-r-lg font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {item.excerpt}
                  </blockquote>

                  {/* Action buttons */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => handleCopyText(item.excerpt, idx)}
                      className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check size={12} className="text-emerald-500" />
                          <span className="text-emerald-500 font-semibold">Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          <span>Copiar Trecho</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleInsertQuote(item, idx)}
                      className="bg-blue-600/10 hover:bg-blue-600 hover:text-white text-blue-600 dark:text-blue-400 font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all"
                    >
                      {insertedIndex === idx ? (
                        <>
                          <Check size={13} className="text-emerald-400" />
                          <span>Inserido!</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={13} />
                          <span>Inserir Citação com Fonte</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-border bg-muted/20 flex items-center justify-between text-xs text-muted-foreground shrink-0">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block"></span>
            <span>RAG Offline Conectado (acervo.sqlite3)</span>
          </div>

          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground font-semibold px-3 py-1"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
