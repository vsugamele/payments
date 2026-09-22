"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  Sparkles,
  Loader2,
  FileCheck,
  FileText,
  PenTool,
  Copy,
  Check,
  CornerDownLeft,
  Trash2,
  Minimize2,
  Maximize2,
  RefreshCw,
} from "lucide-react";

interface AiCopilotSidebarProps {
  fullDocumentHtml: string;
  onInsertContent: (html: string) => void;
  onReplaceContent: (html: string) => void;
  apiKey?: string;
  provider?: string;
  model?: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  rawHtml?: string;
}

export default function AiCopilotSidebar({
  fullDocumentHtml,
  onInsertContent,
  onReplaceContent,
  apiKey,
  provider,
  model,
}: AiCopilotSidebarProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Olá! Sou o seu **Copilot de Inteligência Documental** (A Máquina).
Tenho visão completa do que você está escrevendo no editor ao lado.

💡 **O que posso fazer:**
- **Auditar o documento** em busca de furos lógicos e oportunidades.
- **Gerar sumários executivos** e conclusões de alto impacto.
- **Continuar redigindo** novas seções com base no contexto.
- **Tirar dúvidas** ou sugerir dados técnicos.`,
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (promptText?: string, actionType: string = "copilot_chat") => {
    const textToSend = promptText || inputPrompt;
    if (!textToSend.trim() && actionType === "copilot_chat") return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: textToSend,
    };

    if (actionType === "copilot_chat") {
      setMessages((prev) => [...prev, userMsg]);
      setInputPrompt("");
    } else {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "user",
          content: `Comando Rápido: ${
            actionType === "audit_document"
              ? "Auditar Documento Completo"
              : actionType === "executive_summary"
              ? "Gerar Sumário Executivo"
              : "Continuar Escrevendo a Próxima Seção"
          }`,
        },
      ]);
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/editor/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: actionType,
          fullDocument: fullDocumentHtml,
          prompt: textToSend,
          apiKey,
          provider,
          model,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: data.result,
            rawHtml: data.result,
          },
        ]);
      } else {
        throw new Error(data.error || "Falha ao gerar resposta");
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Ocorreu um erro ao consultar o Copilot. Verifique as configurações de IA ou tente novamente.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text.replace(/<[^>]*>?/gm, ""));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <aside className="w-96 flex flex-col h-full bg-card/60 backdrop-blur-md border-l border-border transition-all">
      {/* Header */}
      <div className="p-3.5 border-b border-border flex items-center justify-between bg-muted/20">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20">
            <Bot size={16} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-foreground">Copilot Documental</h3>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Sparkles size={10} className="text-blue-400" /> A Máquina (Visão Total)
            </p>
          </div>
        </div>

        <button
          onClick={() => setMessages([messages[0]])}
          title="Limpar conversa"
          className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors text-xs"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Quick Action Chips */}
      <div className="p-3 border-b border-border/60 bg-muted/10 space-y-1.5">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          Ações Rápidas em 1 Clique
        </p>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => handleSendMessage(undefined, "audit_document")}
            disabled={isLoading}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 dark:text-blue-400 border border-blue-500/20 text-[11px] font-medium transition-colors"
          >
            <FileCheck size={12} />
            Auditar Documento
          </button>

          <button
            onClick={() => handleSendMessage(undefined, "executive_summary")}
            disabled={isLoading}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[11px] font-medium transition-colors"
          >
            <FileText size={12} />
            Sumário Executivo
          </button>

          <button
            onClick={() => handleSendMessage(undefined, "continue_writing")}
            disabled={isLoading}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-medium transition-colors"
          >
            <PenTool size={12} />
            Continuar Seção
          </button>
        </div>
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3.5">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`space-y-1.5 ${
              msg.role === "user" ? "ml-auto max-w-[85%]" : "w-full"
            }`}
          >
            <div
              className={`p-3 rounded-2xl text-xs leading-relaxed ${
                msg.role === "user"
                  ? "bg-blue-600 text-white font-medium rounded-tr-none ml-auto"
                  : "bg-muted/50 border border-border/80 text-foreground rounded-tl-none prose prose-xs dark:prose-invert max-w-none"
              }`}
            >
              {msg.rawHtml ? (
                <div dangerouslySetInnerHTML={{ __html: msg.rawHtml }} />
              ) : (
                <div className="whitespace-pre-wrap">{msg.content}</div>
              )}
            </div>

            {/* Assistant Actions (Insert / Copy) */}
            {msg.role === "assistant" && msg.id !== "welcome" && msg.rawHtml && (
              <div className="flex items-center gap-1 pl-1">
                <button
                  onClick={() => onInsertContent(msg.rawHtml!)}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 transition-colors"
                >
                  <CornerDownLeft size={10} />
                  Inserir no Documento
                </button>

                <button
                  onClick={() => handleCopy(msg.id, msg.content)}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  {copiedId === msg.id ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                  {copiedId === msg.id ? "Copiado!" : "Copiar"}
                </button>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-muted/40 border border-border text-xs text-muted-foreground">
            <Loader2 size={14} className="animate-spin text-blue-500" />
            <span>Processando com base no documento...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-3 border-t border-border bg-background/80">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative flex items-end bg-muted/40 border border-border/80 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/30 rounded-xl p-1.5 transition-all"
        >
          <textarea
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Pergunte ao documento ou peça para redigir..."
            className="flex-1 bg-transparent border-none outline-none text-xs text-foreground placeholder:text-muted-foreground/60 resize-none max-h-24 min-h-[38px] p-1.5"
            rows={1}
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isLoading}
            className="p-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-20 text-white rounded-lg transition-colors shrink-0 mb-0.5"
          >
            <Send size={13} />
          </button>
        </form>
        <p className="text-center text-[9px] text-muted-foreground/60 mt-1.5">
          Pressione Enter para enviar ou Shift+Enter para quebra de linha.
        </p>
      </div>
    </aside>
  );
}
