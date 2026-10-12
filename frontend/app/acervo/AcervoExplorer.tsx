"use client";

import React, { useState } from "react";
import {
  Search,
  BookOpen,
  FileText,
  Copy,
  Check,
  Loader2,
  Database,
  Hash,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Filter,
} from "lucide-react";

export interface AcervoItem {
  file: string;
  sha256: string;
  physicalPage: number | null;
  unitLabel: string;
  excerpt: string;
  locator: string;
  alerts: string[];
}

const QUICK_FILTERS = [
  { label: "Todos", query: "" },
  { label: "VisaNet VSS", query: "VisaNet Settlement Service VSS" },
  { label: "Mastercard Edit 30", query: "Edit 30 refund purchase return" },
  { label: "Mastercard SMS Guide", query: "Single Message System Guide" },
  { label: "Visa TC 33", query: "TC 33 Acquirer Capture File" },
  { label: "MCBS TN3A Invoice", query: "GLB 12332 Invoice Detail Data Report" },
  { label: "Address Verification (AVS)", query: "Address Verification Service LAC" },
  { label: "Excessive Retries", query: "Excessive authorization retries DE 39" },
];

export default function AcervoExplorer() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<AcervoItem[]>([]);
  const [totalCandidates, setTotalCandidates] = useState(0);
  const [searchedQuery, setSearchedQuery] = useState("");
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleSearch = async (term?: string) => {
    const q = (term !== undefined ? term : searchTerm).trim();
    if (!q) return;

    try {
      setIsLoading(true);
      setSearchedQuery(q);

      const res = await fetch("/api/acervo/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pergunta: q,
          limite: 8,
        }),
      });

      if (!res.ok) {
        throw new Error("Falha na consulta ao acervo.");
      }

      const data = await res.json();
      setResults(data.evidence || []);
      setTotalCandidates(data.totalCandidates || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1200);
  };

  return (
    <div className="space-y-6">
      {/* Search Input Box */}
      <div className="bg-card border border-border/80 rounded-2xl p-5 md:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Pesquise em 35.336 documentos normativos (ex: GLB 12332, VSS 110, TC 33, Edit 30)..."
              className="w-full bg-background border border-border rounded-xl pl-11 pr-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          <button
            onClick={() => handleSearch()}
            disabled={isLoading || !searchTerm.trim()}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-sm px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shrink-0"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Buscando no RAG...</span>
              </>
            ) : (
              <>
                <Database size={16} />
                <span>Consultar Acervo</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Filter Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-muted-foreground mr-1 flex items-center gap-1">
            <Filter size={12} />
            Consultas Frequentes:
          </span>
          {QUICK_FILTERS.map((f, i) => (
            <button
              key={i}
              onClick={() => {
                if (f.query) {
                  setSearchTerm(f.query);
                  handleSearch(f.query);
                } else {
                  setSearchTerm("");
                  setResults([]);
                  setSearchedQuery("");
                }
              }}
              className="text-xs px-2.5 py-1 rounded-lg border border-border/60 bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground font-medium transition-colors"
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Section */}
      {isLoading && (
        <div className="py-16 text-center space-y-3 bg-card/40 border border-border rounded-2xl p-8">
          <Loader2 size={32} className="animate-spin text-blue-500 mx-auto" />
          <div className="text-sm font-bold text-foreground">
            Buscando no banco offline (acervo.sqlite3)...
          </div>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Correlacionando 517.297 unidades FTS com extração precisa de página física e citações literais.
          </p>
        </div>
      )}

      {!isLoading && results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground px-2">
            <span>
              Mostrando <strong>{results.length}</strong> evidências encontradas para &quot;
              <strong className="text-foreground">{searchedQuery}</strong>&quot;
              {totalCandidates > 0 && ` (${totalCandidates} unidades candidatas analisadas)`}.
            </span>
            <span className="text-emerald-500 font-semibold">● Motor RAG Conectado</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {results.map((item, idx) => (
              <div
                key={idx}
                className="bg-card border border-border rounded-2xl p-5 md:p-6 space-y-3 shadow-md hover:border-blue-500/40 transition-all"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-blue-500 shrink-0" />
                    <span className="font-bold text-sm text-foreground">{item.file}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.physicalPage && (
                      <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-500/20">
                        Página Física: {item.physicalPage}
                      </span>
                    )}
                    {item.sha256 && (
                      <span className="bg-muted text-muted-foreground font-mono text-[11px] px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Hash size={11} />
                        {item.sha256.substring(0, 10)}…
                      </span>
                    )}
                  </div>
                </div>

                <blockquote className="text-xs sm:text-sm leading-relaxed text-foreground/90 bg-muted/30 border-l-2 border-blue-500 p-3.5 rounded-r-xl font-mono whitespace-pre-wrap max-h-56 overflow-y-auto">
                  {item.excerpt}
                </blockquote>

                <div className="flex items-center justify-between pt-1">
                  <div className="text-[11px] text-muted-foreground">
                    {item.locator && (
                      <span className="truncate block max-w-md">
                        <strong>Origem:</strong> {item.locator}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleCopy(item.excerpt, idx)}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/80 hover:bg-muted transition-colors font-medium"
                  >
                    {copiedIdx === idx ? (
                      <>
                        <Check size={13} className="text-emerald-500" />
                        <span className="text-emerald-500 font-bold">Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        <span>Copiar Citação</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
