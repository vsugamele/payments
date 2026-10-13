import Link from "next/link";
import { FileText, Clock, ChevronRight, AlertTriangle, CheckCircle2 } from "lucide-react";
import consultas from "@/data/consultas-publicas.json";

export const metadata = {
  title: "Consultas Públicas das Bandeiras — VS Payments",
  description: "Acompanhe as consultas públicas abertas de Visa, Mastercard e Elo. Resumos executivos, prazos e sugestões de manifestação.",
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

function diasRestantes(vigencia: string): number {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const venc = new Date(vigencia);
  venc.setHours(0, 0, 0, 0);
  return Math.ceil((venc.getTime() - hoje.getTime()) / 86400000);
}

function StatusBadge({ dias }: { dias: number }) {
  if (dias < 0)
    return (
      <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--muted-foreground)", background: "rgba(71,85,105,0.15)", padding: "0.2rem 0.6rem", borderRadius: "9999px" }}>
        Encerrada
      </span>
    );
  if (dias <= 3)
    return (
      <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#f87171", background: "rgba(239,68,68,0.12)", padding: "0.2rem 0.6rem", borderRadius: "9999px", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
        <AlertTriangle size={10} /> {dias}d restantes
      </span>
    );
  if (dias <= 7)
    return (
      <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#fbbf24", background: "rgba(234,179,8,0.12)", padding: "0.2rem 0.6rem", borderRadius: "9999px" }}>
        {dias}d restantes
      </span>
    );
  return (
    <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#4ade80", background: "rgba(34,197,94,0.1)", padding: "0.2rem 0.6rem", borderRadius: "9999px" }}>
      {dias}d restantes
    </span>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

export default function ConsultasPage() {
  const abertas = consultas.filter((c) => diasRestantes(c.vigencia) >= 0);
  const encerradas = consultas.filter((c) => diasRestantes(c.vigencia) < 0);

  const urgentes = abertas.filter((c) => diasRestantes(c.vigencia) <= 7);

  return (
    <main className="bg-background pb-24">
      {/* Header */}
      <section
        className="dot-grid"
        style={{
          background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(234,179,8,0.1) 0%, transparent 70%)",
          padding: "5rem 1.5rem 4rem",
          textAlign: "center",
          borderBottom: "1px solid #0f172a",
        }}
      >
        <div className="mx-auto max-w-3xl">
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "rgba(234,179,8,0.1)",
              border: "1px solid rgba(234,179,8,0.25)",
              borderRadius: "9999px",
              padding: "0.35rem 1rem",
              marginBottom: "1.5rem",
            }}
          >
            <FileText size={13} style={{ color: "#fbbf24" }} />
            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#fbbf24", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Regulatório
            </span>
          </div>
          <h1 className="font-bold text-white mb-4" style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)" }}>
            Consultas Públicas das Bandeiras
          </h1>
          <p style={{ color: "var(--muted-foreground)", fontSize: "1rem", lineHeight: 1.8, maxWidth: 560, margin: "0 auto" }}>
            Acompanhe as consultas regulatórias abertas de Visa, Mastercard e Elo.
            Resumos executivos e análise crítica das principais mudanças propostas.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-6 pt-12">

        {/* Urgentes banner */}
        {urgentes.length > 0 && (
          <div
            style={{
              background: "rgba(234,179,8,0.07)",
              border: "1px solid rgba(234,179,8,0.25)",
              borderLeft: "3px solid #eab308",
              borderRadius: "0.875rem",
              padding: "1rem 1.25rem",
              marginBottom: "2rem",
              display: "flex",
              gap: "0.75rem",
              alignItems: "flex-start",
            }}
          >
            <AlertTriangle size={16} style={{ color: "#fbbf24", flexShrink: 0, marginTop: 2 }} />
            <div>
              <p style={{ fontWeight: 700, color: "#fbbf24", fontSize: "0.875rem", marginBottom: "0.35rem" }}>
                {urgentes.length} consulta{urgentes.length > 1 ? "s" : ""} com prazo em menos de 7 dias
              </p>
              <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", lineHeight: 1.6 }}>
                {urgentes.map((u) => u.titulo.split("—")[0].trim()).join(" · ")}
              </p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "2.5rem", flexWrap: "wrap" }}>
          {[
            { label: "Consultas abertas", value: abertas.length.toString(), cor: "#4ade80" },
            { label: "Com prazo em 7 dias", value: urgentes.length.toString(), cor: "#fbbf24" },
            { label: "Bandeiras cobertas", value: "3", cor: "#60a5fa" },
          ].map((s) => (
            <div
              key={s.label}
              style={{ background: "var(--code-bg)", border: "1px solid #0f172a", borderRadius: "0.875rem", padding: "1rem 1.5rem", flex: "1 1 140px" }}
            >
              <p style={{ fontSize: "1.5rem", fontWeight: 800, color: s.cor, marginBottom: "0.25rem" }}>{s.value}</p>
              <p style={{ fontSize: "0.75rem", color: "var(--border)" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Abertas */}
        {abertas.length > 0 && (
          <>
            <p className="section-eyebrow mb-5">Em andamento</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem", marginBottom: "3rem" }}>
              {abertas.map((c) => {
                const dias = diasRestantes(c.vigencia);
                return (
                  <Link
                    key={c.slug}
                    href={`/consultas/${c.slug}`}
                    className="card-hover group block"
                    style={{
                      background: "var(--code-bg)",
                      border: "1px solid #0f172a",
                      borderRadius: "1rem",
                      padding: "1.5rem",
                    }}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span
                            className="tag"
                            style={{ background: BAND_COLOR[c.bandeira], color: BAND_TEXT[c.bandeira], border: "none", fontSize: "0.65rem" }}
                          >
                            {c.bandeira}
                          </span>
                          <StatusBadge dias={dias} />
                        </div>
                        <h2 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--foreground)", lineHeight: 1.4, marginBottom: "0.5rem" }}>
                          {c.titulo}
                        </h2>
                        <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", lineHeight: 1.65 }}>
                          {c.resumo.replace(/\n/g, " ").substring(0, 180)}…
                        </p>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem", flexShrink: 0 }}>
                        <div className="flex items-center gap-1" style={{ fontSize: "0.72rem", color: "var(--border)" }}>
                          <Clock size={11} />
                          Vence {formatDate(c.vigencia)}
                        </div>
                        <div className="flex items-center gap-1" style={{ color: "var(--primary)", fontSize: "0.78rem", fontWeight: 600 }}>
                          Ver resumo <ChevronRight size={12} />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}

        {/* Encerradas */}
        {encerradas.length > 0 && (
          <>
            <p className="section-eyebrow mb-5">Encerradas</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "3rem" }}>
              {encerradas.map((c) => (
                <Link
                  key={c.slug}
                  href={`/consultas/${c.slug}`}
                  style={{
                    background: "#050b18",
                    border: "1px solid #0f172a",
                    borderRadius: "0.875rem",
                    padding: "1.25rem 1.5rem",
                    opacity: 0.65,
                    display: "block",
                    textDecoration: "none",
                  }}
                >
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="tag" style={{ background: BAND_COLOR[c.bandeira], color: BAND_TEXT[c.bandeira], border: "none", fontSize: "0.65rem" }}>
                      {c.bandeira}
                    </span>
                    <StatusBadge dias={diasRestantes(c.vigencia)} />
                  </div>
                  <p style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>{c.titulo}</p>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* O que é uma consulta pública */}
        <div
          style={{
            background: "#050b18",
            border: "1px solid #0f172a",
            borderRadius: "1rem",
            padding: "2rem",
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 size={16} style={{ color: "var(--primary)" }} />
            <p style={{ fontWeight: 700, color: "var(--foreground)", fontSize: "0.9rem" }}>O que é uma consulta pública?</p>
          </div>
          <p style={{ fontSize: "0.825rem", color: "var(--muted-foreground)", lineHeight: 1.75 }}>
            As bandeiras de pagamento (Visa, Mastercard, Elo) são obrigadas pelo Banco Central do Brasil a submeter
            alterações relevantes em seus regulamentos a consulta pública antes da vigência. O processo permite que
            participantes do arranjo — adquirentes, emissores, subadquirentes e fintechs — enviem contribuições e
            questionamentos formais. Instituições que não participam perdem a oportunidade de influenciar regras
            que afetarão diretamente sua operação.
          </p>
          <a
            href="https://www.bcb.gov.br/estabilidadefinanceira/supervisaoarranjos"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline inline-flex items-center gap-2 mt-4"
            style={{ padding: "0.5rem 1rem", fontSize: "0.8rem" }}
          >
            Portal de Supervisão do BCB <ChevronRight size={12} />
          </a>
        </div>
      </div>
    </main>
  );
}
