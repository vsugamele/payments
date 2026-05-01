"use client";

import { useState, useEffect } from "react";
import { Sparkles, X, Loader2, BookOpen, AlertCircle, Send, ChevronRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { clsx } from "clsx";

interface Source {
  title: string;
  page: number;
  similarity: number;
}

interface AIAssistantProps {
  context: string;
  title?: string;
  triggerLabel?: string;
  placeholder?: string;
  toolName: string;
}

export default function AIAssistant({ 
  context, 
  title = "Assistente Normativo", 
  triggerLabel = "Analisar com IA", 
  placeholder = "Pergunte sobre as implicações desta transação...",
  toolName 
}: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Auto-trigger when opened if there is no answer yet
  useEffect(() => {
    if (isOpen && !answer && !loading) {
      handleAsk();
    }
  }, [isOpen]);

  const handleAsk = async (customQuery?: string) => {
    setLoading(true);
    setError(null);
    
    const q = customQuery || `Analise este cenário do ${toolName}: ${context}. Quais os riscos normativos e implicações baseados nos manuais?`;

    try {
      const res = await fetch("http://localhost:8000/api/rag/ask_manuals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: q,
          match_threshold: 0.3,
          match_count: 5
        })
      });

      if (!res.ok) throw new Error("Falha ao consultar o cérebro funcional.");

      const data = await res.json();
      if (data.success) {
        setAnswer(data.answer);
        setSources(data.sources || []);
      } else {
        throw new Error(data.detail || "Erro desconhecido");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-xl transition-all font-semibold text-sm group shadow-sm hover:shadow-primary/10"
      >
        <Sparkles size={16} className="group-hover:animate-pulse" />
        {triggerLabel}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/40 backdrop-blur-sm z-[100] animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Side Panel */}
      <div 
        className={clsx(
          "fixed top-0 right-0 h-full w-full max-w-lg bg-background border-l border-border shadow-2xl z-[101] transform transition-transform duration-300 ease-out flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Sparkles size={18} className="text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-foreground text-sm uppercase tracking-wider">{title}</h2>
              <p className="text-[10px] text-muted-foreground font-mono">Powered by Functional Brain RAG</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading && !answer ? (
            <div className="flex flex-col items-center justify-center h-48 space-y-4 text-center">
              <Loader2 size={32} className="animate-spin text-primary opacity-50" />
              <p className="text-sm text-muted-foreground animate-pulse">Consultando manuais normativos...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-3 items-start">
              <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-bold text-red-400 mb-1">Erro na consulta</p>
                <p className="text-red-400/80">{error}</p>
                <button 
                  onClick={() => handleAsk()}
                  className="mt-3 text-[11px] font-bold underline uppercase tracking-widest"
                >
                  Tentar novamente
                </button>
              </div>
            </div>
          ) : answer ? (
            <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
              <div className="article-body">
                <ReactMarkdown>{answer}</ReactMarkdown>
              </div>

              {sources.length > 0 && (
                <div className="space-y-3 pt-6 border-t border-border">
                  <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <BookOpen size={12} /> Fontes Documentais Utilizadas
                  </h3>
                  <div className="grid gap-2">
                    {sources.map((s, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 border border-border/50 text-[11px]">
                        <span className="font-medium text-foreground truncate max-w-[280px]">{s.title}</span>
                        <span className="text-primary font-bold bg-primary/10 px-1.5 py-0.5 rounded">Pág. {s.page}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
             <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground">
               <p className="text-sm">Iniciando análise...</p>
             </div>
          )}
        </div>

        {/* Footer / Input */}
        <div className="p-5 border-t border-border bg-muted/20">
          <form 
            onSubmit={(e) => { e.preventDefault(); if (query.trim()) handleAsk(query); setQuery(""); }}
            className="relative"
          >
            <input 
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="w-full bg-background border border-border rounded-xl pl-4 pr-12 py-3 text-sm focus:border-primary outline-none transition-all shadow-inner"
            />
            <button 
              type="submit"
              disabled={loading || !query.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary text-white rounded-lg disabled:opacity-30 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </form>
          <p className="text-[10px] text-muted-foreground text-center mt-3">
            O assistente analisa o contexto atual e busca respostas fundamentadas nos manuais oficiais.
          </p>
        </div>
      </div>
    </>
  );
}
