"use client";

import { useState } from "react";
import {
  AlertTriangle, Info, CheckCircle2, ChevronDown, ChevronUp,
  Terminal, BookOpen, Table2, ListCheck, Layers
} from "lucide-react";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Alerta { tipo: "warning" | "info" | "danger"; texto: string; }
interface Passo { numero: number; nome: string; descricao: string; }
interface Card { titulo: string; cor: string; conteudo: string; }
interface Campo { campo: string; descricao: string; }
interface GrupoDict { titulo: string; headers: string[]; rows: string[][]; }

interface Secao {
  id: string;
  tipo: "intro" | "table" | "steps" | "formula" | "cards" | "dict-table";
  titulo: string;
  descricao?: string;
  conteudo?: string;
  alerta?: Alerta;
  headers?: string[];
  rows?: string[][];
  passos?: Passo[];
  cards?: Card[];
  campos?: Campo[];
  formula?: string;
  grupos?: GrupoDict[];
}

// ─── Componente de Alerta ─────────────────────────────────────────────────────

function AlertBox({ alerta }: { alerta: Alerta }) {
  const cfg = {
    warning: { color: "#f59e0b", bg: "rgba(245,158,11,0.07)", border: "rgba(245,158,11,0.25)", Icon: AlertTriangle },
    info:    { color: "#60a5fa", bg: "rgba(96,165,250,0.07)",  border: "rgba(96,165,250,0.25)",  Icon: Info },
    danger:  { color: "#ef4444", bg: "rgba(239,68,68,0.07)",   border: "rgba(239,68,68,0.25)",   Icon: AlertTriangle },
  }[alerta.tipo];
  const Icon = cfg.Icon;
  return (
    <div style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: "0.75rem", padding: "0.875rem 1.125rem", marginTop: "1rem", display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
      <Icon size={16} style={{ color: cfg.color, flexShrink: 0, marginTop: 2 }} />
      <p style={{ fontSize: "0.82rem", color: cfg.color, lineHeight: 1.65, margin: 0 }}>{alerta.texto}</p>
    </div>
  );
}

// ─── Renderizador de Tabela ───────────────────────────────────────────────────

function ManualTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div style={{ overflowX: "auto", borderRadius: "0.75rem", border: "1px solid #0f1a2e" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
        <thead>
          <tr style={{ background: "#050b18" }}>
            {headers.map((h, i) => (
              <th key={i} style={{ padding: "0.625rem 0.875rem", textAlign: "left", fontWeight: 700, color: "#94a3b8", fontSize: "0.7rem", letterSpacing: "0.05em", textTransform: "uppercase", borderBottom: "1px solid #0f1a2e", whiteSpace: "nowrap" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ borderBottom: ri < rows.length - 1 ? "1px solid #0a1120" : "none" }}
              className="hover:bg-white/[0.015] transition-colors">
              {row.map((cell, ci) => (
                <td key={ci} style={{ padding: "0.625rem 0.875rem", color: ci === 0 ? "#e2e8f0" : "#94a3b8", fontWeight: ci === 0 ? 600 : 400, verticalAlign: "top", lineHeight: 1.55 }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Renderizador de Seção ────────────────────────────────────────────────────

function SecaoRenderer({ secao }: { secao: Secao }) {
  const [open, setOpen] = useState(true);

  const iconMap: Record<string, React.ReactNode> = {
    intro:      <BookOpen size={15} style={{ color: "#a78bfa" }} />,
    table:      <Table2 size={15} style={{ color: "#60a5fa" }} />,
    steps:      <ListCheck size={15} style={{ color: "#4ade80" }} />,
    formula:    <Terminal size={15} style={{ color: "#f59e0b" }} />,
    cards:      <Layers size={15} style={{ color: "#f87171" }} />,
    "dict-table": <Table2 size={15} style={{ color: "#c084fc" }} />,
  };

  return (
    <div style={{ background: "rgba(255,255,255,0.015)", border: "1px solid #0f1a2e", borderRadius: "1rem", overflow: "hidden" }}>
      {/* Header da Seção */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: "100%", padding: "1rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
          {iconMap[secao.tipo] || <BookOpen size={15} />}
          <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "#e2e8f0" }}>{secao.titulo}</span>
        </div>
        {open ? <ChevronUp size={14} style={{ color: "#475569" }} /> : <ChevronDown size={14} style={{ color: "#475569" }} />}
      </button>

      {/* Corpo da Seção */}
      {open && (
        <div style={{ padding: "0 1.25rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          {/* Descrição / Conteúdo introdutório */}
          {(secao.descricao || secao.conteudo) && (
            <p style={{ fontSize: "0.83rem", color: "#94a3b8", lineHeight: 1.7, margin: 0 }}>
              {secao.descricao || secao.conteudo}
            </p>
          )}

          {/* Alerta */}
          {secao.alerta && <AlertBox alerta={secao.alerta} />}

          {/* TIPO: table */}
          {secao.tipo === "table" && secao.headers && secao.rows && (
            <ManualTable headers={secao.headers} rows={secao.rows} />
          )}

          {/* TIPO: steps */}
          {secao.tipo === "steps" && secao.passos && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {secao.passos.map((p) => (
                <div key={p.numero} style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontWeight: 800, fontSize: "0.8rem", color: "#818cf8" }}>{p.numero}</span>
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, color: "#c7d2fe", fontSize: "0.85rem", marginBottom: "0.2rem" }}>{p.nome}</p>
                    <p style={{ fontSize: "0.8rem", color: "#94a3b8", lineHeight: 1.6 }}>{p.descricao}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TIPO: formula */}
          {secao.tipo === "formula" && (
            <>
              {secao.campos && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "0.5rem" }}>
                  {secao.campos.map((c, i) => (
                    <div key={i} style={{ padding: "0.625rem 0.875rem", background: "#050b18", border: "1px solid #0f1a2e", borderRadius: "0.5rem" }}>
                      <span style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "#f59e0b", fontWeight: 700 }}>{c.campo}</span>
                      <p style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.25rem" }}>{c.descricao}</p>
                    </div>
                  ))}
                </div>
              )}
              {secao.formula && (
                <pre style={{ background: "#020810", border: "1px solid #0f1a2e", borderRadius: "0.625rem", padding: "1rem", fontFamily: "monospace", fontSize: "0.78rem", color: "#4ade80", overflowX: "auto", lineHeight: 1.7, margin: 0 }}>
                  {secao.formula}
                </pre>
              )}
            </>
          )}

          {/* TIPO: cards */}
          {secao.tipo === "cards" && secao.cards && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "0.75rem" }}>
              {secao.cards.map((c, i) => (
                <div key={i} style={{ padding: "1rem", background: `${c.cor}08`, border: `1px solid ${c.cor}25`, borderRadius: "0.75rem" }}>
                  <h4 style={{ fontWeight: 700, fontSize: "0.82rem", color: c.cor, marginBottom: "0.5rem" }}>{c.titulo}</h4>
                  <p style={{ fontSize: "0.78rem", color: "#94a3b8", lineHeight: 1.65 }}>{c.conteudo}</p>
                </div>
              ))}
            </div>
          )}

          {/* TIPO: dict-table */}
          {secao.tipo === "dict-table" && (
            <>
              {secao.grupos && secao.grupos.map((grupo, gi) => (
                <div key={gi} style={{ marginBottom: "1rem" }}>
                  <p style={{ fontWeight: 700, fontSize: "0.78rem", color: "#c084fc", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5rem" }}>{grupo.titulo}</p>
                  <ManualTable headers={grupo.headers} rows={grupo.rows} />
                </div>
              ))}
              {/* Fallback para dict-table sem grupos mas com headers/rows diretos */}
              {!secao.grupos && secao.headers && secao.rows && (
                <ManualTable headers={secao.headers} rows={secao.rows} />
              )}
              {secao.alerta && <AlertBox alerta={secao.alerta} />}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function ManualDetailClient({ manual }: { manual: any }) {
  const bandeiraCor = manual.bandeira === "Mastercard" ? "#ef4444" : manual.bandeira === "Visa" ? "#3b82f6" : "#a78bfa";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
      {/* Banner resumo */}
      <div style={{ padding: "1.25rem", background: `${bandeiraCor}08`, border: `1px solid ${bandeiraCor}25`, borderRadius: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.5rem" }}>
          <span style={{ fontWeight: 800, fontSize: "1.05rem", color: bandeiraCor }}>{manual.bandeira}</span>
          <span style={{ fontSize: "0.7rem", fontWeight: 700, color: bandeiraCor, background: `${bandeiraCor}15`, padding: "0.2rem 0.6rem", borderRadius: "9999px", border: `1px solid ${bandeiraCor}30` }}>
            v{manual.versao}
          </span>
        </div>
        <p style={{ fontSize: "0.83rem", color: "#94a3b8", lineHeight: 1.65 }}>{manual.descricao}</p>
      </div>

      {/* Seções */}
      {manual.secoes?.map((secao: Secao) => (
        <SecaoRenderer key={secao.id} secao={secao} />
      ))}
    </div>
  );
}
