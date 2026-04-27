"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Sparkles, X, ChevronDown, ChevronUp, BookOpen } from "lucide-react";
import ReactMarkdown from "react-markdown";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: { title: string; page: number; similarity: number }[];
};

export default function RagChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Olá! Sou o **Cérebro Normativo** da VS Payments. Posso responder dúvidas técnicas sobre os manuais de intercâmbio, regras Visa/Mastercard e Chargebacks. Como posso ajudar hoje?"
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), role: "user", content: input };
    // captura historico ANTES de adicionar a mensagem atual
    const history = messages
      .filter(m => m.id !== "1") // remove mensagem de boas-vindas
      .map(m => ({ role: m.role, content: m.content }));

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/rag/ask_manuals", {
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
            sources: data.sources
          }
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
          content: "Desculpe, ocorreu um erro ao consultar os manuais. Verifique se o backend está rodando e tente novamente."
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-1 z-50 flex items-center gap-2 group"
      >
        <Sparkles size={24} className="group-hover:animate-pulse" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap font-medium pr-1">
          Pergunte à IA
        </span>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-0 right-0 md:bottom-6 md:right-6 bg-black/90 backdrop-blur-xl border border-white/10 shadow-2xl flex flex-col z-50 transition-all duration-300 ease-in-out ${isMaximized ? 'w-full h-full md:w-[600px] md:h-[80vh] md:rounded-2xl' : 'w-full h-[60vh] md:w-[400px] md:h-[600px] md:rounded-2xl'}`}>
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-indigo-950/30 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400 border border-indigo-500/30">
            <Bot size={18} />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Cérebro Normativo</h3>
            <p className="text-[10px] text-indigo-300/80 uppercase tracking-wider flex items-center gap-1">
              <Sparkles size={10} /> RAG GPT-4o-mini
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsMaximized(!isMaximized)} className="p-1.5 text-muted-foreground hover:text-white hover:bg-white/10 rounded-md transition-colors hidden md:block">
            {isMaximized ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
          <button onClick={() => setIsOpen(false)} className="p-1.5 text-muted-foreground hover:text-white hover:bg-red-500/20 rounded-md transition-colors">
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 max-w-[90%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
            
            <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center border ${msg.role === 'user' ? 'bg-muted/30 border-white/10 text-muted-foreground' : 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400'}`}>
              {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
            </div>

            <div className={`space-y-2 flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`text-sm p-3 shadow-md ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-sm' : 'bg-white/5 border border-white/10 text-foreground rounded-2xl rounded-tl-sm'}`}>
                {msg.role === 'assistant' ? (
                  <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-a:text-indigo-400 prose-code:text-indigo-300 prose-code:bg-indigo-500/10 prose-code:px-1 prose-code:rounded">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  msg.content
                )}
              </div>

              {/* Sources */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {msg.sources.map((src, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[10px] text-muted-foreground hover:text-indigo-300 hover:border-indigo-500/30 cursor-default transition-colors">
                      <BookOpen size={10} />
                      {src.title.replace(".pdf", "")} - p.{src.page}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 max-w-[80%]">
            <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center border bg-indigo-500/20 border-indigo-500/30 text-indigo-400">
              <Bot size={14} />
            </div>
            <div className="flex items-center p-3 bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm text-indigo-400">
               <Loader2 size={16} className="animate-spin mr-2" />
               <span className="text-xs">Consultando manuais...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/10 bg-black/50">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex items-end gap-2 bg-white/5 border border-white/10 rounded-xl focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all p-1"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Pergunte sobre regras, chargebacks, 3DS..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-white resize-none max-h-32 min-h-[44px] p-3 placeholder:text-muted-foreground/60 scrollbar-thin"
            rows={1}
          />
          <button 
            type="submit"
            disabled={!input.trim() || isLoading}
            className="shrink-0 p-3 mb-0.5 mr-0.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-white/5 disabled:text-white/20 text-white rounded-lg transition-colors flex items-center justify-center"
          >
            <Send size={16} />
          </button>
        </form>
        <p className="text-center text-[9px] text-muted-foreground/50 mt-2">
          IA pode cometer erros. Sempre valide as informações no manual original indicado.
        </p>
      </div>

    </div>
  );
}
