"use client";
import { useState, useMemo } from "react";
import { Search, X, BookOpen, Fingerprint } from "lucide-react";
import deFields from "@/data/de-fields.json";
import ValidatorTab from "./ValidatorTab";
import AIAssistant from "@/components/AIAssistant";

type Field = typeof deFields[number];

const CAT_COLOR: Record<string, { bg: string; text: string }> = {
  Identificação:    { bg: "rgba(37,99,235,0.12)",   text: "#60a5fa" },
  Transação:        { bg: "rgba(139,92,246,0.1)",    text: "#a78bfa" },
  Valor:            { bg: "rgba(34,197,94,0.1)",     text: "#4ade80" },
  Merchant:         { bg: "rgba(249,115,22,0.1)",    text: "#fb923c" },
  Canal:            { bg: "rgba(20,184,166,0.1)",    text: "#2dd4bf" },
  Autenticação:     { bg: "rgba(234,179,8,0.1)",     text: "#fbbf24" },
  "EMV/Chip":       { bg: "rgba(168,85,247,0.1)",    text: "#c084fc" },
  Resposta:         { bg: "rgba(239,68,68,0.1)",     text: "#f87171" },
  Rede:             { bg: "rgba(100,116,139,0.1)",   text: "#94a3b8" },
  Disputa:          { bg: "rgba(239,68,68,0.12)",    text: "#f87171" },
  Clearing:         { bg: "rgba(56,189,248,0.1)",    text: "#38bdf8" },
  Intercâmbio:      { bg: "rgba(234,179,8,0.1)",     text: "#fbbf24" },
  "Local / Nacional": { bg: "rgba(34,197,94,0.12)", text: "#4ade80" },
  "Data/Hora":      { bg: "rgba(100,116,139,0.08)", text: "#64748b" },
  "Dados Adicionais": { bg: "rgba(99,102,241,0.1)", text: "#818cf8" },
};

const ALL_CATS = Array.from(new Set(deFields.map((f) => f.categoria)));

function highlight(text: string, query: string) {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part)
      ? <mark key={i} style={{ background: "rgba(234,179,8,0.25)", color: "#fbbf24", borderRadius: "2px", padding: "0 1px" }}>{part}</mark>
      : part
  );
}

function FieldCard({ field, query }: { field: Field; query: string }) {
  const [open, setOpen] = useState(false);
  const cat = CAT_COLOR[field.categoria] ?? { bg: "rgba(100,116,139,0.1)", text: "#94a3b8" };

  return (
    <div
      style={{
        background: open ? "#0d1726" : "#0a1120",
        border: "1px solid",
        borderColor: open ? "rgba(37,99,235,0.3)" : "#0f172a",
        borderRadius: "0.875rem",
        overflow: "hidden",
        transition: "border-color 0.2s, background 0.2s",
        cursor: "pointer",
      }}
      onClick={() => setOpen((p) => !p)}
    >
      <div style={{ padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: "0.875rem" }}>
        {/* Number badge */}
        <div
          style={{
            minWidth: 80,
            background: "rgba(37,99,235,0.08)",
            border: "1px solid rgba(37,99,235,0.15)",
            borderRadius: "0.5rem",
            padding: "0.3rem 0.6rem",
            textAlign: "center",
          }}
        >
          <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--code-text)", fontFamily: "var(--font-geist-mono)" }}>
            {field.numero}
          </span>
        </div>

        {/* Name */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--foreground)", lineHeight: 1.3 }}>
            {highlight(field.nome, query)}
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--border)", marginTop: "0.2rem", fontFamily: "var(--font-geist-mono)" }}>
            {field.tipo} · {field.formato}
          </p>
        </div>

        {/* Cat tag */}
        <span
          className="tag"
          style={{ background: cat.bg, color: cat.text, border: "none", fontSize: "0.6rem", flexShrink: 0, display: "none" }}
        >
          {field.categoria}
        </span>
        <span
          style={{
            fontSize: "0.7rem",
            color: cat.text,
            background: cat.bg,
            padding: "0.2rem 0.5rem",
            borderRadius: "0.25rem",
            flexShrink: 0,
            display: "block",
          }}
        >
          {field.categoria}
        </span>
      </div>

      {open && (
        <div
          style={{ padding: "1rem 1.25rem", borderTop: "1px solid var(--border)" }}
          onClick={(e) => e.stopPropagation()}
        >
          <p style={{ fontSize: "0.82rem", color: "var(--muted-foreground)", lineHeight: 1.7, marginBottom: "0.875rem" }}>
            {highlight(field.descricao, query)}
          </p>

          {field.notas && (
            <div
              style={{
                background: "rgba(37,99,235,0.06)",
                border: "1px solid rgba(37,99,235,0.15)",
                borderLeft: "3px solid #2563eb",
                borderRadius: "0.5rem",
                padding: "0.875rem 1rem",
                marginBottom: "0.875rem",
              }}
            >
              <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--code-text)", marginBottom: "0.35rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Notas técnicas
              </p>
              <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", lineHeight: 1.7 }}>
                {highlight(field.notas, query)}
              </p>
            </div>
          )}

          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
            {field.presente_em.length > 0 && (
              <div>
                <p style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--border)", marginBottom: "0.375rem" }}>
                  Presente em
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                  {field.presente_em.map((mti) => (
                    <span
                      key={mti}
                      style={{
                        background: "#050b18",
                        border: "1px solid #0f172a",
                        borderRadius: "0.25rem",
                        padding: "0.15rem 0.5rem",
                        fontSize: "0.7rem",
                        color: "var(--muted-foreground)",
                        fontFamily: "var(--font-geist-mono)",
                      }}
                    >
                      {mti}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {field.clearingField && (
              <div>
                <p style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--border)", marginBottom: "0.375rem" }}>
                  Equivalente no clearing
                </p>
                <span style={{ fontSize: "0.75rem", color: "var(--code-text)", fontFamily: "var(--font-geist-mono)" }}>
                  {field.clearingField}
                </span>
              </div>
            )}
          </div>

          <div style={{ marginTop: "1.25rem", paddingTop: "1rem", borderTop: "1px dashed var(--border)" }}>
            <AIAssistant 
              toolName="Dicionário de Campos"
              triggerLabel={`Consultar Manual para ${field.numero}`}
              context={`Campo: ${field.numero} - ${field.nome}. Descrição: ${field.descricao}. Notas: ${field.notas}. Tipo: ${field.tipo}.`}
              placeholder={`O que os manuais dizem sobre o ${field.numero}?`}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function CamposClient() {
  const [activeTab, setActiveTab] = useState<'dicionario' | 'validador'>('dicionario');
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return deFields.filter((f) => {
      const matchCat = activeCat ? f.categoria === activeCat : true;
      if (!q) return matchCat;
      return matchCat && (
        f.numero.toLowerCase().includes(q) ||
        f.nome.toLowerCase().includes(q) ||
        f.descricao.toLowerCase().includes(q) ||
        (f.notas ?? "").toLowerCase().includes(q) ||
        f.categoria.toLowerCase().includes(q)
      );
    });
  }, [query, activeCat]);

  return (
    <div className="mx-auto max-w-4xl px-6 pt-8" style={{ paddingBottom: "4rem" }}>
      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-border">
        <button 
          onClick={() => setActiveTab('dicionario')}
          className={`pb-3 px-1 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'dicionario' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          <BookOpen size={16} /> Dicionário de Campos
        </button>
        <button 
          onClick={() => setActiveTab('validador')}
          className={`pb-3 px-1 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'validador' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          <Fingerprint size={16} /> Validador ISO 8583
        </button>
      </div>

      {activeTab === 'validador' ? (
        <ValidatorTab />
      ) : (
        <>
          {/* Search bar */}
          <div style={{ position: "relative", marginBottom: "1.25rem" }}>
        <Search size={15} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "var(--border)", pointerEvents: "none" }} />
        <input
          type="text"
          className="input-base"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por número, nome, descrição… ex: DE 48, UCAF, MCC, chargeback"
          style={{ paddingLeft: "2.25rem", paddingRight: query ? "2.25rem" : "0.75rem" }}
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            style={{ position: "absolute", right: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "var(--muted-foreground)", background: "none", border: "none", cursor: "pointer" }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Category filters */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.75rem" }}>
        <button
          onClick={() => setActiveCat(null)}
          style={{
            fontSize: "0.72rem", fontWeight: 600,
            padding: "0.25rem 0.75rem",
            borderRadius: "9999px",
            border: "1px solid",
            borderColor: !activeCat ? "#3b82f6" : "#1e293b",
            background: !activeCat ? "rgba(37,99,235,0.15)" : "#050b18",
            color: !activeCat ? "#60a5fa" : "#475569",
            cursor: "pointer",
          }}
        >
          Todos ({deFields.length})
        </button>
        {ALL_CATS.map((cat) => {
          const c = CAT_COLOR[cat] ?? { bg: "rgba(100,116,139,0.1)", text: "#94a3b8" };
          const isActive = activeCat === cat;
          const count = deFields.filter((f) => f.categoria === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setActiveCat(isActive ? null : cat)}
              style={{
                fontSize: "0.72rem", fontWeight: 600,
                padding: "0.25rem 0.75rem",
                borderRadius: "9999px",
                border: "1px solid",
                borderColor: isActive ? c.text : "#1e293b",
                background: isActive ? c.bg : "#050b18",
                color: isActive ? c.text : "#475569",
                cursor: "pointer",
              }}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Count */}
      <p style={{ fontSize: "0.75rem", color: "var(--border)", marginBottom: "1rem" }}>
        {filtered.length} campo{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
        {query && ` para "${query}"`}
        {activeCat && ` na categoria "${activeCat}"`}
      </p>

      {/* Results */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <Search size={32} style={{ color: "#1e293b", margin: "0 auto 1rem" }} />
          <p style={{ color: "var(--border)", fontSize: "0.9rem" }}>Nenhum campo encontrado para "{query}"</p>
          <p style={{ color: "#1e293b", fontSize: "0.8rem", marginTop: "0.5rem" }}>Tente "DE 22", "UCAF", "MCC", "chargeback" ou "token"</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
          {filtered.map((f) => (
            <FieldCard key={f.id} field={f} query={query} />
          ))}
        </div>
      )}
      </>
      )}
    </div>
  );
}
