import Link from "next/link";
import { ShieldCheck, AlertTriangle, ChevronRight, ArrowLeft } from "lucide-react";
import programsData from "@/data/compliance-programs.json";

export const metadata = {
  title: "Programas de Monitoramento — Compliance VS Payments",
  description: "Referência completa dos programas de monitoramento das bandeiras: VAMP, ECP, EFM, PED, MATCH, BRAM, VIRP, MMP, QMAP. Thresholds e penalidades.",
};

const BAND_COLOR: Record<string, string> = {
  Visa: "rgba(37,99,235,0.15)",
  Mastercard: "rgba(239,68,68,0.12)",
  Elo: "rgba(34,197,94,0.12)",
};
const BAND_TEXT: Record<string, string> = {
  Visa: "#60a5fa",
  Mastercard: "#f87171",
  Elo: "#4ade80",
};
const CAT_COLOR: Record<string, string> = {
  Fraude: "rgba(234,179,8,0.12)",
  Chargeback: "rgba(239,68,68,0.1)",
  Integridade: "rgba(139,92,246,0.1)",
  Risco: "rgba(249,115,22,0.1)",
  MCC: "rgba(20,184,166,0.1)",
};
const CAT_TEXT: Record<string, string> = {
  Fraude: "#fbbf24",
  Chargeback: "#f87171",
  Integridade: "#a78bfa",
  Risco: "#fb923c",
  MCC: "#2dd4bf",
};
const LEVEL_COLOR: Record<string, { bg: string; border: string; text: string }> = {
  yellow: { bg: "rgba(234,179,8,0.07)", border: "rgba(234,179,8,0.2)", text: "#fbbf24" },
  orange: { bg: "rgba(249,115,22,0.07)", border: "rgba(249,115,22,0.2)", text: "#fb923c" },
  red: { bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.2)", text: "#f87171" },
  green: { bg: "rgba(34,197,94,0.07)", border: "rgba(34,197,94,0.2)", text: "#4ade80" },
};

type Program = typeof programsData[number];

function formatCurrency(v: number) {
  if (v === 0) return "—";
  return `US$ ${v.toLocaleString("pt-BR")}`;
}

function ProgramCard({ prog }: { prog: Program }) {
  return (
    <div
      id={prog.sigla.toLowerCase()}
      style={{
        background: "var(--code-bg)",
        border: "1px solid #0f172a",
        borderRadius: "1.25rem",
        overflow: "hidden",
        scrollMarginTop: "5rem",
      }}
    >
      {/* Header */}
      <div style={{ padding: "1.75rem 2rem", borderBottom: "1px solid #0f172a" }}>
        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="tag"
              style={{ background: BAND_COLOR[prog.bandeira], color: BAND_TEXT[prog.bandeira], border: "none" }}
            >
              {prog.bandeira}
            </span>
            <span
              className="tag"
              style={{ background: CAT_COLOR[prog.categoria] ?? "rgba(100,116,139,0.1)", color: CAT_TEXT[prog.categoria] ?? "#94a3b8", border: "none" }}
            >
              {prog.categoria}
            </span>
            <span style={{ fontSize: "0.7rem", color: "var(--border)" }}>{prog.periodicidade}</span>
          </div>
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--border)", fontFamily: "var(--font-geist-mono)" }}>
            {prog.sigla}
          </span>
        </div>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--foreground)", marginBottom: "0.5rem" }}>
          {prog.nome}
        </h2>
        <p style={{ fontSize: "0.85rem", color: "var(--muted-foreground)", lineHeight: 1.7 }}>{prog.descricao}</p>
      </div>

      {/* Formula */}
      {prog.formula && prog.formula !== "—" && (
        <div style={{ padding: "1rem 2rem", borderBottom: "1px solid #0f172a", background: "rgba(255,255,255,0.01)" }}>
          <p style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--border)", marginBottom: "0.4rem" }}>
            Fórmula de cálculo
          </p>
          <code style={{ fontSize: "0.82rem", color: "var(--code-text)", fontFamily: "var(--font-geist-mono)" }}>
            {prog.formula}
          </code>
        </div>
      )}

      {/* Levels */}
      <div style={{ padding: "1.5rem 2rem", borderBottom: "1px solid #0f172a" }}>
        <p style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--border)", marginBottom: "1rem" }}>
          Níveis e penalidades
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          {prog.niveis.map((nivel) => {
            const lc = LEVEL_COLOR[nivel.cor] ?? LEVEL_COLOR.yellow;
            return (
              <div
                key={nivel.nome}
                style={{
                  background: lc.bg,
                  border: `1px solid ${lc.border}`,
                  borderLeft: `3px solid ${lc.text}`,
                  borderRadius: "0.625rem",
                  padding: "1rem 1.25rem",
                }}
              >
                <p style={{ fontSize: "0.875rem", fontWeight: 700, color: lc.text, marginBottom: "0.75rem" }}>
                  {nivel.nome}
                </p>

                {/* Conditions */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {nivel.condicoes.map((c, i) => (
                    <span
                      key={i}
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        borderRadius: "0.375rem",
                        padding: "0.2rem 0.6rem",
                        fontSize: "0.75rem",
                        color: "var(--muted-foreground)",
                        fontFamily: "var(--font-geist-mono)",
                      }}
                    >
                      {c.label}
                    </span>
                  ))}
                </div>

                {/* Penalties */}
                <div className="flex flex-wrap gap-2">
                  {nivel.penalidades.map((pen) => (
                    <div
                      key={pen.mes}
                      style={{
                        background: "rgba(0,0,0,0.2)",
                        border: `1px solid ${lc.border}`,
                        borderRadius: "0.375rem",
                        padding: "0.3rem 0.75rem",
                        fontSize: "0.75rem",
                      }}
                    >
                      <span style={{ color: "var(--muted-foreground)" }}>{pen.mes}: </span>
                      <span style={{ color: pen.valor === 0 ? "#475569" : lc.text, fontWeight: 600 }}>
                        {formatCurrency(pen.valor)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Notes */}
      {prog.observacoes && (
        <div style={{ padding: "1.25rem 2rem" }}>
          <div style={{ display: "flex", gap: "0.625rem", alignItems: "flex-start" }}>
            <AlertTriangle size={14} style={{ color: "var(--muted-foreground)", marginTop: 2, flexShrink: 0 }} />
            <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", lineHeight: 1.7 }}>{prog.observacoes}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProgramasPage() {
  const byBandeira: Record<string, Program[]> = {};
  for (const p of programsData) {
    if (!byBandeira[p.bandeira]) byBandeira[p.bandeira] = [];
    byBandeira[p.bandeira].push(p);
  }

  return (
    <main className="bg-background pb-24">
      {/* Header */}
      <section
        className="dot-grid"
        style={{
          background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(139,92,246,0.1) 0%, transparent 70%)",
          padding: "4rem 1.5rem 3.5rem",
          borderBottom: "1px solid #0f172a",
        }}
      >
        <div className="mx-auto max-w-3xl">
          <Link
            href="/compliance"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", color: "var(--muted-foreground)", marginBottom: "1.5rem" }}
          >
            <ArrowLeft size={13} /> Compliance
          </Link>
          <p className="section-eyebrow mb-3">Diretório</p>
          <h1 className="font-bold text-white mb-4" style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)" }}>
            Programas de Monitoramento
          </h1>
          <p style={{ color: "var(--muted-foreground)", fontSize: "0.95rem", lineHeight: 1.75 }}>
            Referência técnica completa dos programas de monitoramento de Visa, Mastercard e Elo.
            Thresholds, penalidades mensais e notas de remediação.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-6 pt-12">
        {/* Quick nav */}
        <div style={{ background: "#050b18", border: "1px solid #0f172a", borderRadius: "1rem", padding: "1.25rem 1.5rem", marginBottom: "2.5rem" }}>
          <p style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--border)", marginBottom: "0.875rem" }}>
            Ir direto para
          </p>
          <div className="flex flex-wrap gap-2">
            {programsData.map((p) => (
              <a
                key={p.sigla}
                href={`#${p.sigla.toLowerCase()}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  background: BAND_COLOR[p.bandeira],
                  color: BAND_TEXT[p.bandeira],
                  border: "none",
                  borderRadius: "0.375rem",
                  padding: "0.25rem 0.75rem",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                {p.sigla}
              </a>
            ))}
          </div>
        </div>

        {/* Programs by bandeira */}
        {(["Visa", "Mastercard", "Elo"] as const).map((bandeira) => {
          const progs = byBandeira[bandeira] ?? [];
          if (progs.length === 0) return null;
          return (
            <div key={bandeira} className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: BAND_TEXT[bandeira],
                    flexShrink: 0,
                  }}
                />
                <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--foreground)" }}>{bandeira}</h2>
                <div style={{ flex: 1, height: 1, background: "#0f172a" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {progs.map((prog) => (
                  <ProgramCard key={prog.id} prog={prog} />
                ))}
              </div>
            </div>
          );
        })}

        {/* Footer CTA */}
        <div
          style={{
            background: "#050b18",
            border: "1px solid #0f172a",
            borderRadius: "1rem",
            padding: "2rem",
            textAlign: "center",
            marginTop: "2rem",
          }}
        >
          <p style={{ color: "var(--muted-foreground)", fontSize: "0.875rem", marginBottom: "1rem" }}>
            Verifique se seu portfólio está em risco de enquadramento
          </p>
          <Link href="/compliance/risco" className="btn-primary inline-flex items-center gap-2">
            <ShieldCheck size={14} />
            Calculadora de Risco
            <ChevronRight size={13} />
          </Link>
        </div>
      </div>
    </main>
  );
}
