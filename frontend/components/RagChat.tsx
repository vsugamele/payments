"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Send, User, Loader2, X, ChevronDown, ChevronUp, BookOpen } from "lucide-react";
import ReactMarkdown from "react-markdown";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: { title: string; page: number; similarity: number }[];
};

export default function RagChat() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Consulta interna aos manuais indexados (Visa, Mastercard, Elo, GCMS, Base II e normas do BCB). Digite um campo, código ou dúvida técnica para buscar nas fontes.",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hasCookie =
      typeof document !== "undefined" &&
      document.cookie.split(";").some((c) => c.trim().startsWith("vs_internal_pass=1"));
    setIsOwner(hasCookie);
  }, [pathname]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  useEffect(() => {
    const handleOpenChat = (e: CustomEvent<{ query: string }>) => {
      setIsOpen(true);
      if (e.detail?.query) {
        setInput(e.detail.query);
      }
    };

    window.addEventListener("open-rag-chat", handleOpenChat as EventListener);
    return () => window.removeEventListener("open-rag-chat", handleOpenChat as EventListener);
  }, []);

  // Só aparece para o proprietário logado e nunca nas rotas editoriais públicas principais
  if (
    !isOwner ||
    pathname === "/editor" ||
    pathname === "/" ||
    pathname === "/curriculo" ||
    pathname === "/sobre"
  ) {
    return null;
  }

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), role: "user", content: input };
    const history = messages
      .filter((m) => m.id !== "1")
      .map((m) => ({ role: m.role, content: m.content }));

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/rag/ask_manuals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: userMessage.content,
          match_threshold: 0.3,
          match_count: 5,
          chat_history: history,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: data.answer,
            sources: data.sources,
          },
        ]);
      } else {
        throw new Error(data.detail || "Erro desconhecido");
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Não foi possível consultar os manuais no momento.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 px-4 py-2.5 rounded-full bg-[var(--action-bg)] text-[var(--action-fg)] border border-border shadow-md hover:opacity-90 transition-opacity z-40 flex items-center gap-2 text-xs font-medium"
        aria-label="Abrir consulta aos manuais"
      >
        <BookOpen size={15} />
        <span>Consultar manuais</span>
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-0 right-0 md:bottom-6 md:right-6 bg-card border border-border shadow-xl flex flex-col z-50 transition-all duration-200 ${
        isMaximized
          ? "w-full h-full md:w-[600px] md:h-[80vh] md:rounded-2xl"
          : "w-full h-[60vh] md:w-[400px] md:h-[580px] md:rounded-2xl"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/60 md:rounded-t-2xl">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-full bg-card border border-border flex items-center justify-center text-foreground">
            <BookOpen size={15} />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm leading-tight">
              Consulta aos Manuais
            </h3>
            <p className="font-mono text-[10px] text-muted-foreground">
              Acervo interno indexado
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsMaximized(!isMaximized)}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors hidden md:block"
            aria-label={isMaximized ? "Restaurar tamanho" : "Expandir janela"}
          >
            {isMaximized ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
            aria-label="Fechar consulta"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2.5 max-w-[92%] ${
              msg.role === "user" ? "ml-auto flex-row-reverse" : ""
            }`}
          >
            <div className="shrink-0 size-7 rounded-full flex items-center justify-center border border-border bg-muted text-muted-foreground">
              {msg.role === "user" ? <User size={13} /> : <BookOpen size={13} />}
            </div>

            <div
              className={`space-y-1.5 flex flex-col ${
                msg.role === "user" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`text-sm p-3 leading-relaxed ${
                  msg.role === "user"
                    ? "bg-[var(--action-bg)] text-[var(--action-fg)] rounded-2xl rounded-tr-sm"
                    : "bg-muted/70 border border-border text-foreground rounded-2xl rounded-tl-sm"
                }`}
              >
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  msg.content
                )}
              </div>

              {msg.sources && msg.sources.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {msg.sources.map((src, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-muted border border-border rounded font-mono text-[10px] text-muted-foreground"
                    >
                      <BookOpen size={10} />
                      {src.title.replace(".pdf", "")} · p.{src.page}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-2.5 max-w-[80%]">
            <div className="shrink-0 size-7 rounded-full flex items-center justify-center border border-border bg-muted text-muted-foreground">
              <BookOpen size={13} />
            </div>
            <div className="flex items-center p-3 bg-muted/70 border border-border rounded-2xl rounded-tl-sm text-muted-foreground">
              <Loader2 size={15} className="animate-spin mr-2" />
              <span className="text-xs">Consultando manuais...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border bg-muted/40">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-end gap-2 bg-card border border-border rounded-xl focus-within:border-foreground transition-colors p-1"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Pergunte sobre regras, campos ISO, chargebacks..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-foreground resize-none max-h-32 min-h-[40px] p-2.5 placeholder:text-muted-foreground"
            rows={1}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="shrink-0 p-2.5 mb-0.5 mr-0.5 bg-[var(--action-bg)] text-[var(--action-fg)] disabled:opacity-30 rounded-lg transition-opacity flex items-center justify-center"
            aria-label="Enviar consulta"
          >
            <Send size={15} />
          </button>
        </form>
        <p className="text-center font-mono text-[10px] text-muted-foreground mt-2">
          Conferir sempre no manual original citado.
        </p>
      </div>
    </div>
  );
}
