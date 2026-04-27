"use client";

import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import mccData from "@/data/mcc-list.json";

type MccEntry = typeof mccData[number];

const ALL_CATS = Array.from(new Set(mccData.map((m) => m.categoria).filter(Boolean))).sort();

const TCC_LABEL: Record<string, string> = {
  A: "Auto/Vehicle Rental",
  F: "Food & Restaurant",
  H: "Hotel/Motel",
  L: "Liquor Store",
  O: "Oil Company",
  R: "Retail",
  T: "Travel Agency",
  U: "Unknown",
  X: "Transport/Airline",
};

function pad(n: number) {
  return String(n).padStart(4, "0");
}

function highlight(text: string, query: string) {
  if (!query.trim()) return <>{text}</>;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} style={{ background: "rgba(234,179,8,0.25)", color: "#fbbf24", borderRadius: "2px", padding: "0 1px" }}>
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

export default function MccClient() {
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const PER_PAGE = 60;

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    setPage(0);
    return mccData.filter((m) => {
      const matchCat = activeCat ? m.categoria === activeCat : true;
      if (!q) return matchCat;
      return (
        matchCat &&
        (pad(m.mcc).includes(q) ||
          m.nome.toLowerCase().includes(q) ||
          (m.mcName ?? "").toLowerCase().includes(q) ||
          (m.categoria ?? "").toLowerCase().includes(q) ||
          (m.tccNome ?? "").toLowerCase().includes(q))
      );
    });
  }, [query, activeCat]);

  const visible = filtered.slice(0, (page + 1) * PER_PAGE);
  const hasMore = visible.length < filtered.length;

  return (
    <div className="mx-auto max-w-6xl px-6 pt-8" style={{ paddingBottom: "4rem" }}>
      {/* Search */}
      <div style={{ position: "relative", marginBottom: "1rem" }}>
        <Search size={15} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "var(--border)", pointerEvents: "none" }} />
        <input
          type="text"
          className="input-base"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(0); }}
          placeholder="Buscar por código (ex: 5411), nome (ex: grocery, restaurant, airline)…"
          style={{ paddingLeft: "2.25rem", paddingRight: query ? "2.25rem" : "0.75rem" }}
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setPage(0); }}
            style={{ position: "absolute", right: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "var(--muted-foreground)", background: "none", border: "none", cursor: "pointer" }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Category filters */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "1.5rem" }}>
        <button
          onClick={() => { setActiveCat(null); setPage(0); }}
          style={{
            fontSize: "0.7rem", fontWeight: 600,
            padding: "0.2rem 0.65rem",
            borderRadius: "9999px",
            border: "1px solid",
            borderColor: !activeCat ? "#3b82f6" : "#1e293b",
            background: !activeCat ? "rgba(37,99,235,0.15)" : "#050b18",
            color: !activeCat ? "#60a5fa" : "#475569",
            cursor: "pointer",
          }}
        >
          Todos ({mccData.length})
        </button>
        {ALL_CATS.map((cat) => {
          const count = mccData.filter((m) => m.categoria === cat).length;
          const isActive = activeCat === cat;
          return (
            <button
              key={cat}
              onClick={() => { setActiveCat(isActive ? null : cat); setPage(0); }}
              style={{
                fontSize: "0.7rem", fontWeight: 600,
                padding: "0.2rem 0.65rem",
                borderRadius: "9999px",
                border: "1px solid",
                borderColor: isActive ? "#60a5fa" : "#1e293b",
                background: isActive ? "rgba(37,99,235,0.12)" : "#050b18",
                color: isActive ? "#60a5fa" : "#475569",
                cursor: "pointer",
              }}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Count */}
      <p style={{ fontSize: "0.72rem", color: "var(--border)", marginBottom: "1rem" }}>
        {filtered.length.toLocaleString("pt-BR")} MCC{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
        {query && ` para "${query}"`}
      </p>

      {/* Table */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <Search size={32} style={{ color: "#1e293b", margin: "0 auto 1rem" }} />
          <p style={{ color: "var(--border)" }}>Nenhum MCC encontrado para "{query}"</p>
        </div>
      ) : (
        <>
          <div
            style={{
              background: "var(--code-bg)",
              border: "1px solid #0f172a",
              borderRadius: "1rem",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "80px 1fr 140px 80px",
                gap: "0",
                background: "#050b18",
                borderBottom: "1px solid #0f172a",
                padding: "0.625rem 1rem",
              }}
            >
              {["MCC", "Descrição", "Categoria", "TCC"].map((h) => (
                <p key={h} style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--border)" }}>
                  {h}
                </p>
              ))}
            </div>

            {/* Rows */}
            {visible.map((m, i) => (
              <div
                key={m.mcc}
                style={{
                  display: "grid",
                  gridTemplateColumns: "80px 1fr 140px 80px",
                  borderBottom: i < visible.length - 1 ? "1px solid #0a0f1e" : "none",
                  padding: "0.6rem 1rem",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "")}
              >
                <span style={{ fontFamily: "var(--font-geist-mono)", fontSize: "0.82rem", fontWeight: 700, color: "var(--code-text)" }}>
                  {highlight(pad(m.mcc), query)}
                </span>
                <div>
                  <p style={{ fontSize: "0.82rem", color: "var(--foreground)", lineHeight: 1.3 }}>
                    {highlight(m.nome, query)}
                  </p>
                  {m.mcName && (
                    <p style={{ fontSize: "0.72rem", color: "var(--border)", marginTop: "0.15rem" }}>
                      {highlight(m.mcName, query)}
                    </p>
                  )}
                </div>
                <span style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", lineHeight: 1.4 }}>
                  {highlight(m.categoria ?? "", query)}
                </span>
                <div>
                  {m.tcc ? (
                    <span
                      title={TCC_LABEL[m.tcc] ?? m.tcc}
                      style={{
                        fontFamily: "var(--font-geist-mono)",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        color: "#a78bfa",
                        background: "rgba(139,92,246,0.1)",
                        padding: "0.15rem 0.4rem",
                        borderRadius: "0.25rem",
                      }}
                    >
                      {m.tcc}
                    </span>
                  ) : (
                    <span style={{ color: "#1e293b", fontSize: "0.72rem" }}>—</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {hasMore && (
            <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
              <button
                onClick={() => setPage((p) => p + 1)}
                className="btn-outline"
                style={{ fontSize: "0.8rem", padding: "0.5rem 1.5rem" }}
              >
                Carregar mais ({filtered.length - visible.length} restantes)
              </button>
            </div>
          )}
        </>
      )}

      {/* TCC legend */}
      <div style={{ marginTop: "2.5rem", background: "#050b18", border: "1px solid #0f172a", borderRadius: "0.875rem", padding: "1.25rem 1.5rem" }}>
        <p style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--border)", marginBottom: "0.875rem" }}>
          Transaction Category Code (TCC)
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {Object.entries(TCC_LABEL).map(([code, label]) => (
            <div key={code} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <span style={{ fontFamily: "var(--font-geist-mono)", fontSize: "0.72rem", fontWeight: 700, color: "#a78bfa", background: "rgba(139,92,246,0.1)", padding: "0.15rem 0.4rem", borderRadius: "0.25rem" }}>
                {code}
              </span>
              <span style={{ fontSize: "0.72rem", color: "var(--border)" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
