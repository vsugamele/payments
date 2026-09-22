"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Flame,
  Scissors,
  Maximize2,
  CheckCircle2,
  Send,
  Loader2,
  X,
  RefreshCw,
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react";

interface AiFloatingToolbarProps {
  selectedText: string;
  onApplyReplacement: (newHtml: string) => void;
  onInsertBelow: (newHtml: string) => void;
  onClose: () => void;
  position: { top: number; left: number } | null;
  apiKey?: string;
  provider?: string;
  model?: string;
}

export default function AiFloatingToolbar({
  selectedText,
  onApplyReplacement,
  onInsertBelow,
  onClose,
  position,
  apiKey,
  provider,
  model,
}: AiFloatingToolbarProps) {
  const [customPrompt, setCustomPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [previewResult, setPreviewResult] = useState<string | null>(null);
  const [currentAction, setCurrentAction] = useState<string | null>(null);
  const [showToneSelect, setShowToneSelect] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  if (!position || !selectedText.trim()) return null;

  const handleAction = async (action: string, customTextPrompt?: string, tone?: string) => {
    setIsLoading(true);
    setCurrentAction(action);
    setPreviewResult(null);

    try {
      const res = await fetch("/api/editor/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          text: selectedText,
          prompt: customTextPrompt || customPrompt,
          tone,
          apiKey,
          provider,
          model,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPreviewResult(data.result);
      } else {
        setPreviewResult(`<p style="color:red">Erro: ${data.error || "Falha ao processar"}</p>`);
      }
    } catch (err: any) {
      setPreviewResult(`<p style="color:red">Erro de conexão com o serviço de IA.</p>`);
    } finally {
      setIsLoading(false);
    }
  };

  const tones = [
    { label: "Executivo / Formal", value: "Executivo e Formal" },
    { label: "Persuasivo (Vendas/Copy)", value: "Persuasivo de Alta Conversão" },
    { label: "Técnico / Especialista", value: "Técnico e Preciso" },
    { label: "Didático / Explicativo", value: "Didático e Acessível" },
    { label: "Direto ao Ponto (Conciso)", value: "Ultra Conciso e Direto" },
  ];

  return (
    <div
      ref={containerRef}
      className="fixed z-50 transition-all duration-150 animate-in fade-in zoom-in-95 print:hidden"
      style={{
        top: Math.max(10, position.top),
        left: Math.max(20, Math.min(position.left, window.innerWidth - 480)),
      }}
    >
      <div className="bg-background/95 backdrop-blur-xl border border-blue-500/30 shadow-2xl rounded-2xl p-2 w-[440px] text-foreground ring-1 ring-blue-500/20">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-2 py-1 mb-1 border-b border-border/50">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-500 dark:text-blue-400">
            <Sparkles size={14} className="animate-pulse" />
            <span>Copilot de Texto (IA)</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X size={13} />
          </button>
        </div>

        {/* Action Buttons Grid */}
        {!previewResult && !isLoading && (
          <div className="space-y-2 p-1">
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => handleAction("improve")}
                className="flex items-center gap-2 p-2 rounded-xl text-xs font-medium bg-muted/50 hover:bg-blue-600/10 hover:text-blue-500 hover:border-blue-500/30 border border-transparent transition-all text-left"
              >
                <Sparkles size={14} className="text-blue-400 shrink-0" />
                <div>
                  <div className="font-semibold text-foreground">Melhorar Escrita</div>
                  <div className="text-[10px] text-muted-foreground">Mais claro e elegante</div>
                </div>
              </button>

              <button
                onClick={() => handleAction("persuasive")}
                className="flex items-center gap-2 p-2 rounded-xl text-xs font-medium bg-muted/50 hover:bg-amber-600/10 hover:text-amber-500 hover:border-amber-500/30 border border-transparent transition-all text-left"
              >
                <Flame size={14} className="text-amber-500 shrink-0" />
                <div>
                  <div className="font-semibold text-foreground">Tornar Persuasivo</div>
                  <div className="text-[10px] text-muted-foreground">Ganchos & benefícios</div>
                </div>
              </button>

              <button
                onClick={() => handleAction("shorten")}
                className="flex items-center gap-2 p-2 rounded-xl text-xs font-medium bg-muted/50 hover:bg-emerald-600/10 hover:text-emerald-500 hover:border-emerald-500/30 border border-transparent transition-all text-left"
              >
                <Scissors size={14} className="text-emerald-400 shrink-0" />
                <div>
                  <div className="font-semibold text-foreground">Encurtar / Sintetizar</div>
                  <div className="text-[10px] text-muted-foreground">Direto ao essencial</div>
                </div>
              </button>

              <button
                onClick={() => handleAction("expand")}
                className="flex items-center gap-2 p-2 rounded-xl text-xs font-medium bg-muted/50 hover:bg-violet-600/10 hover:text-violet-500 hover:border-violet-500/30 border border-transparent transition-all text-left"
              >
                <Maximize2 size={14} className="text-violet-400 shrink-0" />
                <div>
                  <div className="font-semibold text-foreground">Expandir Texto</div>
                  <div className="text-[10px] text-muted-foreground">Mais dados e detalhes</div>
                </div>
              </button>
            </div>

            {/* Change Tone Menu */}
            <div className="relative">
              <button
                onClick={() => setShowToneSelect(!showToneSelect)}
                className="w-full flex items-center justify-between p-2 rounded-xl text-xs font-medium bg-muted/30 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/60 transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <SlidersHorizontal size={13} />
                  Ajustar Tom de Voz...
                </span>
                <ChevronDown size={13} className={showToneSelect ? "rotate-180" : ""} />
              </button>

              {showToneSelect && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border shadow-xl rounded-xl p-1 z-50 space-y-0.5">
                  {tones.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => {
                        setShowToneSelect(false);
                        handleAction("tone", undefined, t.value);
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-xs hover:bg-primary/10 hover:text-primary transition-colors text-foreground font-medium"
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Custom Prompt Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (customPrompt.trim()) {
                  handleAction("custom_prompt", customPrompt);
                }
              }}
              className="flex items-center gap-1.5 pt-1"
            >
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Ou digite o que fazer com este trecho..."
                className="flex-1 bg-muted/40 border border-border/80 focus:border-blue-500 rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 outline-none"
              />
              <button
                type="submit"
                disabled={!customPrompt.trim()}
                className="p-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 text-white rounded-xl transition-colors shrink-0"
              >
                <Send size={13} />
              </button>
            </form>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="py-8 flex flex-col items-center justify-center gap-2 text-center text-xs text-muted-foreground">
            <Loader2 size={24} className="animate-spin text-blue-500" />
            <p className="font-medium text-foreground">Reescrevendo com inteligência...</p>
            <p className="text-[10px]">Avaliando ritmo, vocabulário e clareza</p>
          </div>
        )}

        {/* Preview & Confirmation State */}
        {previewResult && !isLoading && (
          <div className="space-y-3 p-1">
            <div className="text-[11px] font-semibold text-muted-foreground flex items-center justify-between">
              <span>Sugestão da IA:</span>
              <button
                onClick={() => handleAction(currentAction || "improve")}
                className="flex items-center gap-1 text-blue-400 hover:underline text-[10px]"
              >
                <RefreshCw size={10} />
                Regerar
              </button>
            </div>

            <div
              className="p-3 max-h-48 overflow-y-auto rounded-xl bg-muted/40 border border-border text-xs text-foreground leading-relaxed prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: previewResult }}
            />

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => {
                  onApplyReplacement(previewResult);
                  onClose();
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all"
              >
                <CheckCircle2 size={14} />
                Substituir Seleção
              </button>

              <button
                onClick={() => {
                  onInsertBelow(previewResult);
                  onClose();
                }}
                className="py-2 px-3 bg-muted hover:bg-muted/80 text-foreground rounded-xl text-xs font-semibold border border-border transition-colors"
              >
                Inserir Abaixo
              </button>

              <button
                onClick={() => setPreviewResult(null)}
                className="p-2 text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted transition-colors"
              >
                Voltar
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
