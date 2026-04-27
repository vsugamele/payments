"use client";

import { useState, useMemo } from "react";
import { Search, BookOpen, ChevronRight, X, Tag } from "lucide-react";
import glossario from "@/data/glossario.json";

const CATEGORIAS = [
  "Todos",
  "Autorização",
  "Autenticação",
  "Disputas",
  "Fraude",
  "Identificação",
  "Liquidação",
  "Mensageria",
  "Participantes",
  "Canais de Pagamento",
  "Pricing",
  "Programas de Monitoramento",
  "Regulatório",
  "Risco",
  "Segurança",
  "Tokenização",
];

const CAT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Autorização: { bg: "rgba(99,102,241,0.1)", text: "#818cf8", border: "rgba(99,102,241,0.25)" },
  Autenticação: { bg: "rgba(16,185,129,0.1)", text: "#34d399", border: "rgba(16,185,129,0.25)" },
  Disputas: { bg: "rgba(239,68,68,0.1)", text: "#f87171", border: "rgba(239,68,68,0.25)" },
  Fraude: { bg: "rgba(234,179,8,0.1)", text: "#fbbf24", border: "rgba(234,179,8,0.25)" },
  Identificação: { bg: "rgba(20,184,166,0.1)", text: "#2dd4bf", border: "rgba(20,184,166,0.25)" },
  Liquidação: { bg: "rgba(59,130,246,0.1)", text: "#60a5fa", border: "rgba(59,130,246,0.25)" },
  Mensageria: { bg: "rgba(168,85,247,0.1)", text: "#c084fc", border: "rgba(168,85,247,0.25)" },
  Participantes: { bg: "rgba(251,146,60,0.1)", text: "#fb923c", border: "rgba(251,146,60,0.25)" },
  "Canais de Pagamento": { bg: "rgba(236,72,153,0.1)", text: "#f472b6", border: "rgba(236,72,153,0.25)" },
  Pricing: { bg: "rgba(34,197,94,0.1)", text: "#4ade80", border: "rgba(34,197,94,0.25)" },
  "Programas de Monitoramento": { bg: "rgba(245,158,11,0.1)", text: "#f59e0b", border: "rgba(245,158,11,0.25)" },
  Regulatório: { bg: "rgba(100,116,139,0.1)", text: "#94a3b8", border: "rgba(100,116,139,0.25)" },
  Risco: { bg: "rgba(239,68,68,0.1)", text: "#f87171", border: "rgba(239,68,68,0.25)" },
  Segurança: { bg: "rgba(239,68,68,0.12)", text: "#fca5a5", border: "rgba(239,68,68,0.2)" },
  Tokenização: { bg: "rgba(139,92,246,0.1)", text: "#a78bfa", border: "rgba(139,92,246,0.25)" },
};

const ALFABETO = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

type TermoGlossario = typeof glossario[0];

function TermoCard({ t, onExpand, isExpanded }: { t: TermoGlossario; onExpand: () => void; isExpanded: boolean }) {
  const cat = CAT_COLORS[t.categoria] ?? { bg: "rgba(100,116,139,0.08)", text: "#94a3b8", border: "rgba(100,116,139,0.2)" };

  return (
    <div
      onClick={onExpand}
      style={{
        background: isExpanded ? "rgba(99,102,241,0.04)" : "rgba(0,0,0,0.35)",
        border: `1px solid ${isExpanded ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.05)"}`,
        borderRadius: "0.875rem",
        padding: "1.25rem 1.5rem",
        cursor: "pointer",
        transition: "all 0.15s ease",
      }}
      className="hover:border-indigo-500/30 hover:bg-indigo-500/5"
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.5rem", marginBottom: "0.375rem" }}>
            <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "#f1f5f9" }}>
              {t.termo}
            </span>
            {t.sigla && (
              <code style={{
                fontSize: "0.65rem",
                fontWeight: 700,
                background: "rgba(99,102,241,0.15)",
                color: "#818cf8",
                padding: "0.1rem 0.45rem",
                borderRadius: "0.25rem",
                letterSpacing: "0.05em",
              }}>
                {t.sigla}
              </code>
            )}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
            <span style={{
              fontSize: "0.65rem",
              fontWeight: 600,
              background: cat.bg,
              color: cat.text,
              border: `1px solid ${cat.border}`,
              padding: "0.15rem 0.55rem",
              borderRadius: "9999px",
              letterSpacing: "0.04em",
            }}>
              {t.categoria}
            </span>
            {t.bandeiras.map((b) => (
              <span key={b} style={{
                fontSize: "0.6rem",
                fontWeight: 600,
                background: "rgba(255,255,255,0.04)",
                color: "#64748b",
                padding: "0.1rem 0.4rem",
                borderRadius: "0.25rem",
                border: "1px solid rgba(255,255,255,0.06)",
              }}>
                {b}
              </span>
            ))}
          </div>
        </div>
        <ChevronRight
          size={16}
          style={{
            color: "#475569",
            flexShrink: 0,
            transform: isExpanded ? "rotate(90deg)" : "none",
            transition: "transform 0.15s",
            marginTop: 4,
          }}
        />
      </div>

      {/* Definição resumida */}
      {!isExpanded && (
        <p style={{
          marginTop: "0.75rem",
          fontSize: "0.82rem",
          color: "#64748b",
          lineHeight: 1.6,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}>
          {t.definicao}
        </p>
      )}

      {/* Expandido */}
      {isExpanded && (
        <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          <div>
            <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.375rem" }}>Definição</p>
            <p style={{ fontSize: "0.875rem", color: "#94a3b8", lineHeight: 1.75 }}>{t.definicao}</p>
          </div>
          {"impacto" in t && t.impacto && (
            <div style={{ background: "rgba(250,204,21,0.05)", border: "1px solid rgba(250,204,21,0.15)", borderRadius: "0.5rem", padding: "0.75rem 1rem" }}>
              <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "#ca8a04", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.25rem" }}>💡 Impacto Operacional</p>
              <p style={{ fontSize: "0.82rem", color: "#a16207", lineHeight: 1.65 }}>{t.impacto}</p>
            </div>
          )}
          {"referencia" in t && t.referencia && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <BookOpen size={11} style={{ color: "#4f46e5", flexShrink: 0 }} />
              <span style={{ fontSize: "0.72rem", color: "#6366f1", fontWeight: 600 }}>{t.referencia}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function GlossarioClient() {
  const [busca, setBusca] = useState("");
  const [catAtiva, setCatAtiva] = useState("Todos");
  const [letraAtiva, setLetraAtiva] = useState<string | null>(null);
  const [expandido, setExpandido] = useState<string | null>(null);

  const filtrados = useMemo(() => {
    return glossario.filter((t) => {
      const matchBusca =
        busca.trim() === "" ||
        t.termo.toLowerCase().includes(busca.toLowerCase()) ||
        (t.sigla && t.sigla.toLowerCase().includes(busca.toLowerCase())) ||
        t.definicao.toLowerCase().includes(busca.toLowerCase());
      const matchCat = catAtiva === "Todos" || t.categoria === catAtiva;
      const matchLetra =
        !letraAtiva || t.termo.toUpperCase().startsWith(letraAtiva);
      return matchBusca && matchCat && matchLetra;
    });
  }, [busca, catAtiva, letraAtiva]);

  const letrasComTermos = useMemo(
    () => new Set(glossario.map((t) => t.termo[0].toUpperCase())),
    []
  );

  return (
    <div style={{ maxWidth: "1024px", margin: "0 auto", padding: "0 1.5rem 6rem" }}>

      {/* Barra de busca */}
      <div style={{ position: "relative", marginBottom: "1.5rem" }}>
        <Search size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#475569", pointerEvents: "none" }} />
        <input
          type="text"
          placeholder="Buscar por termo, sigla ou definição..."
          value={busca}
          onChange={(e) => { setBusca(e.target.value); setLetraAtiva(null); }}
          style={{
            width: "100%",
            background: "rgba(0,0,0,0.4)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "0.75rem",
            padding: "0.875rem 1rem 0.875rem 3rem",
            color: "#f1f5f9",
            fontSize: "0.9rem",
            outline: "none",
            boxSizing: "border-box",
          }}
          className="focus:border-indigo-500/50 transition-colors"
        />
        {busca && (
          <button onClick={() => setBusca("")} style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)", color: "#475569" }}>
            <X size={16} />
          </button>
        )}
      </div>

      {/* Filtros de Categoria */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "1.5rem" }}>
        {CATEGORIAS.map((cat) => {
          const cc = CAT_COLORS[cat];
          const isActive = catAtiva === cat;
          return (
            <button
              key={cat}
              onClick={() => setCatAtiva(cat)}
              style={{
                fontSize: "0.72rem",
                fontWeight: 600,
                padding: "0.3rem 0.75rem",
                borderRadius: "9999px",
                border: isActive
                  ? `1px solid ${cc?.border ?? "rgba(99,102,241,0.5)"}`
                  : "1px solid rgba(255,255,255,0.07)",
                background: isActive
                  ? (cc?.bg ?? "rgba(99,102,241,0.15)")
                  : "rgba(255,255,255,0.03)",
                color: isActive ? (cc?.text ?? "#818cf8") : "#64748b",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Índice Alfabético */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem", marginBottom: "2rem" }}>
        {ALFABETO.map((l) => {
          const hasTerms = letrasComTermos.has(l);
          const isActive = letraAtiva === l;
          return (
            <button
              key={l}
              onClick={() => {
                setLetraAtiva(isActive ? null : l);
                setBusca("");
              }}
              disabled={!hasTerms}
              style={{
                width: 30,
                height: 30,
                fontSize: "0.72rem",
                fontWeight: 700,
                borderRadius: "0.375rem",
                border: isActive ? "1px solid rgba(99,102,241,0.5)" : "1px solid transparent",
                background: isActive
                  ? "rgba(99,102,241,0.2)"
                  : hasTerms
                  ? "rgba(255,255,255,0.04)"
                  : "transparent",
                color: isActive ? "#818cf8" : hasTerms ? "#64748b" : "#1e293b",
                cursor: hasTerms ? "pointer" : "default",
                transition: "all 0.1s",
              }}
            >
              {l}
            </button>
          );
        })}
        {letraAtiva && (
          <button
            onClick={() => setLetraAtiva(null)}
            style={{ fontSize: "0.72rem", color: "#6366f1", padding: "0 0.5rem", cursor: "pointer", background: "none", border: "none" }}
          >
            <X size={13} style={{ display: "inline", marginRight: 2 }} /> limpar
          </button>
        )}
      </div>

      {/* Resultados */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Tag size={14} style={{ color: "#475569" }} />
          <span style={{ fontSize: "0.8rem", color: "#475569" }}>
            {filtrados.length} {filtrados.length === 1 ? "termo" : "termos"}
            {catAtiva !== "Todos" && <span style={{ color: "#6366f1" }}> em {catAtiva}</span>}
          </span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
        {filtrados.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 0", color: "#475569" }}>
            <Search size={32} style={{ margin: "0 auto 1rem", opacity: 0.4 }} />
            <p style={{ fontSize: "0.9rem" }}>Nenhum termo encontrado para <strong style={{ color: "#64748b" }}>&quot;{busca}&quot;</strong></p>
          </div>
        ) : (
          filtrados.map((t) => (
            <TermoCard
              key={t.termo}
              t={t}
              isExpanded={expandido === t.termo}
              onExpand={() => setExpandido(expandido === t.termo ? null : t.termo)}
            />
          ))
        )}
      </div>
    </div>
  );
}
