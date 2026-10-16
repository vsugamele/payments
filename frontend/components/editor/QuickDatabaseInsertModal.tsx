"use client";

import React, { useState, useEffect } from "react";
import { X, Database, DollarSign, Search, PlusCircle, Terminal } from "lucide-react";
import { buildBillingEventHtmlBlock, buildCampoHtmlBlock } from "@/lib/docStudioBridge";

interface QuickDatabaseInsertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertHtml: (html: string, label: string) => void;
}

export default function QuickDatabaseInsertModal({
  isOpen,
  onClose,
  onInsertHtml
}: QuickDatabaseInsertModalProps) {
  const [tab, setTab] = useState<"billing" | "campos">("billing");
  const [q, setQ] = useState("");
  const [brand, setBrand] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [billingList, setBillingList] = useState<any[]>([]);
  const [camposList, setCamposList] = useState<any[]>([]);

  const runSearch = async (activeTab = tab, query = q, activeBrand = brand) => {
    setLoading(true);
    try {
      if (activeTab === "billing") {
        const res = await fetch("/api/admin/arquivos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "search_billing",
            q: query,
            brand: activeBrand,
            limit: 30
          })
        });
        const data = await res.json();
        if (data.connected) setBillingList(data.results || []);
      } else {
        const res = await fetch("/api/admin/arquivos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "search_campos",
            q: query,
            bandeira: activeBrand,
            limit: 30
          })
        });
        const data = await res.json();
        if (data.connected) setCamposList(data.results || []);
      }
    } catch (e) {
      console.error("Erro ao consultar base para o editor:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      runSearch(tab, q, brand);
    }
  }, [isOpen, tab, brand]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl rounded-2xl bg-[#070d19] border border-blue-500/40 shadow-2xl overflow-hidden text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#040811] border-b border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              Ponte Direta SQLite & JSON → Doc Studio
            </span>
            <h3 className="text-base font-bold text-white">
              Inserir Ficha Técnica Oficial no Documento (13.181 Tarifas MCBS/VSS & 17.106 Campos)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs & Search */}
        <div className="p-5 bg-[#080f1e] border-b border-slate-800 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTab("billing")}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                  tab === "billing"
                    ? "bg-purple-600 text-white"
                    : "bg-slate-900 text-slate-400 hover:text-white"
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Tarifas MCBS Brasil (2.267) & Visa VSS (10.914)</span>
              </button>
              <button
                onClick={() => setTab("campos")}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                  tab === "campos"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-900 text-slate-400 hover:text-white"
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>Campos Posicionais & ISO (`campos.sqlite3` — 17.106)</span>
              </button>
            </div>

            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="bg-[#030711] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            >
              <option value="ALL">Todas as Bandeiras</option>
              <option value="Mastercard">Mastercard</option>
              <option value="Visa">Visa</option>
              {tab === "campos" && <option value="Elo">Elo</option>}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runSearch(tab, q, brand)}
                placeholder={
                  tab === "billing"
                    ? "Digite o Event ID MCBS ou linha Visa (ex: 2AB1006, 2NW0519, 5B1107045, Token, Chargeback)..."
                    : "Digite o campo, tabela MPE ou registro (ex: IP0040T1, Reimbursement, PDS 0158, TC 05)..."
                }
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#030711] border border-slate-800 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <button
              onClick={() => runSearch(tab, q, brand)}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white"
            >
              Buscar
            </button>
          </div>
        </div>

        {/* Results List */}
        <div className="max-h-[55vh] overflow-y-auto p-5 space-y-2.5">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Consultando base oficial...
            </div>
          ) : tab === "billing" ? (
            billingList.map((b, i) => (
              <div
                key={`${b.codigo}-${i}`}
                className="p-3.5 rounded-xl bg-[#0b1324] border border-slate-800 hover:border-purple-500/40 flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono text-xs font-bold">
                      {b.bandeira} · {b.codigo}
                    </span>
                    <span className="text-xs font-bold text-white">{b.nome}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-900 text-[10px] text-cyan-300">
                      {b.quemPaga}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 line-clamp-2">
                    {b.explicacaoPt || b.descricao}
                  </p>
                  {b.rates?.length > 0 && (
                    <div className="text-[11px] font-mono text-emerald-300">
                      {b.rates.slice(0, 2).join(" · ")}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    const html = buildBillingEventHtmlBlock(b);
                    onInsertHtml(html, `Ficha ${b.bandeira} ${b.codigo}`);
                    onClose();
                  }}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shrink-0"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Inserir no Documento</span>
                </button>
              </div>
            ))
          ) : (
            camposList.map((c) => (
              <div
                key={c.id}
                className="p-3.5 rounded-xl bg-[#0b1324] border border-slate-800 hover:border-blue-500/40 flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-xs font-bold">
                      {c.bandeira} · {c.doc_id} (p.{c.pagina})
                    </span>
                    <span className="text-xs font-bold text-white">{c.nome || c.registro}</span>
                    {c.pos_inicio !== null && (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-[10px] font-mono text-emerald-300">
                        Pos {c.pos_inicio}–{c.pos_fim} ({c.tamanho}B)
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-300 line-clamp-2">
                    {c.descricao}
                  </p>
                </div>
                <button
                  onClick={() => {
                    const html = buildCampoHtmlBlock(c);
                    onInsertHtml(html, `Campo ${c.nome || c.registro}`);
                    onClose();
                  }}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shrink-0"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Inserir no Documento</span>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
