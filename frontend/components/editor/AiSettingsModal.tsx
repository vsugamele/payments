"use client";

import React, { useState, useEffect } from "react";
import { Settings, Key, Cpu, Sparkles, Check, X } from "lucide-react";

interface AiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  provider: string;
  model: string;
  onSave: (settings: { apiKey: string; provider: string; model: string }) => void;
}

export default function AiSettingsModal({
  isOpen,
  onClose,
  apiKey: initialKey,
  provider: initialProvider,
  model: initialModel,
  onSave,
}: AiSettingsModalProps) {
  const [apiKey, setApiKey] = useState(initialKey);
  const [provider, setProvider] = useState(initialProvider);
  const [model, setModel] = useState(initialModel);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setApiKey(initialKey);
    setProvider(initialProvider);
    setModel(initialModel);
  }, [initialKey, initialProvider, initialModel]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({ apiKey, provider, model });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-background border border-border shadow-2xl rounded-3xl w-full max-w-md overflow-hidden text-foreground ring-1 ring-border">
        
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
              <Settings size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">Configurações de IA Copilot</h2>
              <p className="text-[11px] text-muted-foreground">Conecte sua API Key ou use o motor integrado.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          
          {/* Provider Select */}
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground flex items-center gap-1.5">
              <Cpu size={14} className="text-blue-500" /> Provedor de IA
            </label>
            <select
              value={provider}
              onChange={(e) => {
                setProvider(e.target.value);
                if (e.target.value === "openai") setModel("gpt-4o-mini");
              }}
              className="w-full bg-muted/40 border border-border rounded-xl p-2.5 text-xs text-foreground outline-none focus:border-blue-500"
            >
              <option value="openai">OpenAI (GPT-4o / GPT-4o-mini)</option>
              <option value="builtin">Motor Nativo Integrado (Sem necessidade de Key)</option>
            </select>
          </div>

          {/* Model */}
          {provider === "openai" && (
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-500" /> Modelo
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-muted/40 border border-border rounded-xl p-2.5 text-xs text-foreground outline-none focus:border-blue-500"
              >
                <option value="gpt-4o-mini">GPT-4o-mini (Mais rápido & inteligente)</option>
                <option value="gpt-4o">GPT-4o (Máxima capacidade analítica)</option>
              </select>
            </div>
          )}

          {/* API Key */}
          {provider !== "builtin" && (
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground flex items-center gap-1.5">
                <Key size={14} className="text-emerald-500" /> Chave de API (Opcional se configurada no servidor)
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full bg-muted/40 border border-border rounded-xl p-2.5 text-xs text-foreground outline-none focus:border-blue-500 font-mono"
              />
              <p className="text-[10px] text-muted-foreground">
                Sua chave fica salva apenas localmente no seu navegador.
              </p>
            </div>
          )}

          {/* Info note */}
          <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-600 dark:text-blue-300 leading-relaxed">
            ✨ O editor funciona imediatamente mesmo sem chave configurada, utilizando respostas inteligentes e templates nativos integrados.
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all"
          >
            {savedSuccess ? <Check size={14} /> : null}
            {savedSuccess ? "Salvo com sucesso!" : "Salvar Configurações"}
          </button>
        </div>

      </div>
    </div>
  );
}
