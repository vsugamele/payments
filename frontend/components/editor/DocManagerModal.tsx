"use client";

import React, { useRef } from "react";
import {
  FileText,
  Plus,
  Trash2,
  Download,
  Upload,
  Clock,
  X,
  Sparkles,
} from "lucide-react";
import { DOCUMENT_TEMPLATES, DocumentTemplate } from "./TemplateSelector";

export interface SavedDoc {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
}

interface DocManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedDocs: SavedDoc[];
  currentDocId: string;
  onSelectDoc: (doc: SavedDoc) => void;
  onNewDoc: (template?: DocumentTemplate) => void;
  onDeleteDoc: (id: string) => void;
  onImportDocs?: (docs: SavedDoc[]) => void;
}

export default function DocManagerModal({
  isOpen,
  onClose,
  savedDocs,
  currentDocId,
  onSelectDoc,
  onNewDoc,
  onDeleteDoc,
  onImportDocs,
}: DocManagerModalProps) {
  const importInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExportBackup = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      source: "VS Payments Doc Studio",
      count: savedDocs.length,
      documents: savedDocs,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `doc-studio-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onImportDocs) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(String(ev.target?.result || "{}"));
        const list = Array.isArray(parsed) ? parsed : parsed?.documents;
        if (Array.isArray(list)) {
          const valid: SavedDoc[] = list.filter(
            (d: any) => d && typeof d.id === "string" && typeof d.content === "string"
          );
          if (valid.length > 0) {
            onImportDocs(valid);
          }
        }
      } catch {
        // arquivo inválido ignorado com segurança
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-background border border-border shadow-2xl rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden text-foreground ring-1 ring-border">
        
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between bg-muted/20">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <FileText size={18} className="text-blue-500" />
              Gerenciador de Documentos & Modelos
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Alterne entre rascunhos salvos ou inicie um novo a partir de modelos executivos.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Section 1: Criar a partir de Modelos */}
          <div>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-500" />
              Modelos Rápidos (Templates)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DOCUMENT_TEMPLATES.map((tmpl) => (
                <div
                  key={tmpl.id}
                  onClick={() => {
                    onNewDoc(tmpl);
                    onClose();
                  }}
                  className="p-3.5 rounded-2xl border border-border hover:border-blue-500/50 hover:bg-blue-500/5 cursor-pointer transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-xs font-bold text-foreground group-hover:text-blue-500 transition-colors">
                        {tmpl.name}
                      </h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                        {tmpl.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                      {tmpl.description}
                    </p>
                  </div>
                  <div className="mt-3 text-[10px] font-semibold text-blue-500 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Usar este modelo →
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Documentos Salvos Recentemente */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Clock size={14} className="text-blue-500" />
                Seus Documentos Salvos ({savedDocs.length})
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  ref={importInputRef}
                  type="file"
                  accept="application/json,.json"
                  onChange={handleImportFile}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={handleExportBackup}
                  disabled={savedDocs.length === 0}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border bg-card hover:bg-muted text-[11px] font-medium text-foreground disabled:opacity-40 cursor-pointer"
                  title="Baixar backup .json de todos os seus documentos"
                >
                  <Download size={12} />
                  <span>Backup .JSON</span>
                </button>
                {onImportDocs && (
                  <button
                    type="button"
                    onClick={() => importInputRef.current?.click()}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border bg-card hover:bg-muted text-[11px] font-medium text-foreground cursor-pointer"
                    title="Restaurar documentos a partir de um arquivo .json"
                  >
                    <Upload size={12} />
                    <span>Importar</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    onNewDoc();
                    onClose();
                  }}
                  className="flex items-center gap-1 text-xs font-semibold text-blue-500 hover:underline cursor-pointer"
                >
                  <Plus size={13} />
                  Criar em Branco
                </button>
              </div>
            </div>

            {savedDocs.length === 0 ? (
              <div className="p-8 border border-dashed border-border rounded-2xl text-center text-xs text-muted-foreground">
                Nenhum documento salvo ainda. Seus textos são salvos automaticamente no navegador conforme você escreve.
              </div>
            ) : (
              <div className="space-y-2">
                {savedDocs.map((doc) => {
                  const isCurrent = doc.id === currentDocId;
                  return (
                    <div
                      key={doc.id}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                        isCurrent
                          ? "border-blue-500 bg-blue-500/10 shadow-sm"
                          : "border-border hover:border-border/80 hover:bg-muted/40"
                      }`}
                    >
                      <div
                        onClick={() => {
                          onSelectDoc(doc);
                          onClose();
                        }}
                        className="flex-1 cursor-pointer min-w-0"
                      >
                        <div className="flex items-center gap-2">
                          <FileText size={15} className={isCurrent ? "text-blue-500" : "text-muted-foreground"} />
                          <h4 className="text-xs font-bold text-foreground truncate">
                            {doc.title || "Sem título"}
                          </h4>
                          {isCurrent && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500 text-white font-semibold">
                              Aberto
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Modificado em: {new Date(doc.updatedAt).toLocaleString("pt-BR")}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onDeleteDoc(doc.id)}
                          title="Excluir documento"
                          className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
