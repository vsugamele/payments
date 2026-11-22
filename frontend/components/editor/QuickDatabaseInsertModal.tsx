"use client";

import React, { useState, useEffect } from "react";
import { X, Database, DollarSign, Search, PlusCircle } from "lucide-react";
import { buildBillingEventHtmlBlock, buildCampoHtmlBlock } from "@/lib/docStudioBridge";

interface QuickDatabaseInsertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertHtml: (html: string, label: string) => void;
}

export default function QuickDatabaseInsertModal({
  isOpen,
  onClose,
  onInsertHtml,
}: QuickDatabaseInsertModalProps) {
  const [tab, setTab] = useState<"billing" | "campos">("billing");
  const [q, setQ] = useState("");
  const [brand, setBrand] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [sourceMode, setSourceMode] = useState<"sqlite" | "canonico">("canonico");
  const [billingList, setBillingList] = useState<any[]>([]);
  const [camposList, setCamposList] = useState<any[]>([]);

  const runSearch = async (activeTab = tab, query = q, activeBrand = brand) => {
    setLoading(true);
    try {
      let foundLocal = false;
      try {
        const res = await fetch("/api/admin/arquivos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            activeTab === "billing"
              ? { action: "search_billing", q: query, brand: activeBrand, limit: 30 }
              : { action: "search_campos", q: query, bandeira: activeBrand, limit: 30 }
          ),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.connected && Array.isArray(data.results) && data.results.length > 0) {
            if (activeTab === "billing") setBillingList(data.results);
            else setCamposList(data.results);
            setSourceMode("sqlite");
            foundLocal = true;
          }
        }
      } catch {
        foundLocal = false;
      }

      if (!foundLocal) {
        // Fallback garantido (Vercel / nuvem): consulta o motor unificado /api/acervo/search
        const defaultQuery =
          query.trim() ||
          (activeTab === "billing"
            ? "MCBS VSS tarifas 2AB1006 2AB1706 2AB1790 Fee Schedule"
            : "TCR 0 DE 62.2 PDS 0158 DE 22 DE 48 Reg 01");
        const fallbackRes = await fetch("/api/acervo/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pergunta: defaultQuery,
            bandeira: activeBrand === "ALL" ? undefined : activeBrand.toLowerCase(),
            tool: activeTab === "billing" ? "consultar_tarifa" : "consultar_campo",
            limite: 25,
          }),
        });
        const fbData = await fallbackRes.json();
        setSourceMode(fbData.liveEngineConnected ? "sqlite" : "canonico");

        if (activeTab === "billing") {
          const mappedBilling = (fbData.tarifasMatched || []).map((t: any, idx: number) => ({
            bandeira: t.bandeira || "Bandeira",
            codigo: t.billing_line || t.codigo || `FEE-${idx + 1}`,
            nome: t.nome || t.descricao || "Evento de Faturamento",
            quemPaga: t.quem_paga || t.papel || "Adquirente / Emissor",
            explicacaoPt: t.descricao || t.observacao || "",
            descricao: t.descricao || "",
            rates: [t.valor_brl || t.valor_usd || t.tarifa].filter(Boolean),
          }));
          setBillingList(mappedBilling);
        } else {
          const mappedCampos = (fbData.camposMatched || []).map((c: any, idx: number) => ({
            id: `fb-${idx}`,
            bandeira: c.bandeira || "ISO",
            doc_id: c.documento || c.arquivo || "Manual Oficial",
            pagina: c.pagina || 1,
            nome: c.nome || c.de_pds || c.registro,
            registro: c.registro || c.de_pds || "",
            pos_inicio: c.posicao || null,
            pos_fim: null,
            tamanho: c.tamanho || "",
            descricao: c.descricao || "",
          }));
          setCamposList(mappedCampos);
        }
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

  const activeItems = tab === "billing" ? billingList : camposList;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl rounded-2xl bg-card border border-border shadow-2xl overflow-hidden text-foreground"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-muted/40 border-b border-border flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-primary">
                Inserir Ficha Técnica no Documento
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 font-mono text-[10px] text-emerald-600 dark:text-emerald-400">
                {sourceMode === "sqlite" ? "SQLite Local Ativo" : "Base Canônica Ativa"}
              </span>
            </div>
            <h3 className="text-base font-semibold text-foreground mt-0.5">
              Tarifas MCBS/VSS &amp; Campos Posicionais ISO / Clearing
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal"
            className="p-1.5 rounded-lg bg-background border border-border text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs & Search */}
        <div className="p-5 bg-background border-b border-border space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTab("billing")}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
                  tab === "billing"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Tarifas MCBS &amp; Visa VSS</span>
              </button>
              <button
                type="button"
                onClick={() => setTab("campos")}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
                  tab === "campos"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>Campos Posicionais &amp; ISO</span>
              </button>
            </div>

            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="bg-card border border-border rounded-xl px-3 py-2 text-xs text-foreground"
            >
              <option value="ALL">Todas as Bandeiras</option>
              <option value="Mastercard">Mastercard</option>
              <option value="Visa">Visa</option>
              {tab === "campos" && <option value="Elo">Elo</option>}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runSearch(tab, q, brand)}
                placeholder={
                  tab === "billing"
                    ? "Buscar evento MCBS ou Visa VSS (ex: 2AB1006, Token, 3DS, Chargeback)..."
                    : "Buscar campo ou registro (ex: DE 62.2, PDS 0158, TCR 0, Reg 01, IP0040T1)..."
                }
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-xs text-foreground focus:border-primary focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => runSearch(tab, q, brand)}
              className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground hover:opacity-90 text-xs font-semibold cursor-pointer"
            >
              Buscar
            </button>
          </div>
        </div>

        {/* Results List */}
        <div className="max-h-[55vh] overflow-y-auto p-5 space-y-2.5 bg-muted/20">
          {loading ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              Consultando base oficial…
            </div>
          ) : activeItems.length === 0 ? (
            <div className="py-10 text-center space-y-3">
              <p className="text-xs text-muted-foreground">
                Nenhum item encontrado para &ldquo;{q}&rdquo;. Experimente um dos termos abaixo:
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {(tab === "billing"
                  ? ["2AB1006", "2AB1706", "3DS", "Token"]
                  : ["DE 62.2", "PDS 0158", "TCR 0", "DE 22"]
                ).map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => {
                      setQ(term);
                      runSearch(tab, term, brand);
                    }}
                    className="px-3 py-1.5 rounded-full border border-border bg-card text-xs font-mono hover:border-primary cursor-pointer"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : tab === "billing" ? (
            billingList.map((b, i) => (
              <div
                key={`${b.codigo}-${i}`}
                className="p-3.5 rounded-xl bg-card border border-border hover:border-primary/40 flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-mono text-xs font-semibold">
                      {b.bandeira} · {b.codigo}
                    </span>
                    <span className="text-xs font-semibold text-foreground">{b.nome}</span>
                    {b.quemPaga && (
                      <span className="px-2 py-0.5 rounded bg-muted text-[10px] text-muted-foreground">
                        {b.quemPaga}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2">
                    {b.explicacaoPt || b.descricao}
                  </p>
                  {b.rates?.length > 0 && (
                    <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                      {b.rates.slice(0, 2).join(" · ")}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const html = buildBillingEventHtmlBlock(b);
                    onInsertHtml(html, `Ficha ${b.bandeira} ${b.codigo}`);
                    onClose();
                  }}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Inserir no Documento</span>
                </button>
              </div>
            ))
          ) : (
            camposList.map((c, idx) => (
              <div
                key={c.id || idx}
                className="p-3.5 rounded-xl bg-card border border-border hover:border-primary/40 flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-mono text-xs font-semibold">
                      {c.bandeira} · {c.doc_id} (p.{c.pagina})
                    </span>
                    <span className="text-xs font-semibold text-foreground">
                      {c.nome || c.registro}
                    </span>
                    {c.pos_inicio != null && (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                        Pos {c.pos_inicio}
                        {c.pos_fim ? `–${c.pos_fim}` : ""} {c.tamanho ? `(${c.tamanho})` : ""}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2">{c.descricao}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const html = buildCampoHtmlBlock(c);
                    onInsertHtml(html, `Campo ${c.nome || c.registro}`);
                    onClose();
                  }}
                  className="px-3.5 py-2 rounded-xl bg-primary text-primary-foreground hover:opacity-90 text-xs font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer"
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
