import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, AlertTriangle, FileText, ChevronRight } from "lucide-react";
import consultas from "@/data/consultas-publicas.json";

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

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

export async function generateStaticParams() {
  return consultas.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const consulta = consultas.find((c) => c.slug === slug);
  if (!consulta) return {};
  return {
    title: `${consulta.titulo} — VS Payments`,
    description: consulta.resumo.replace(/\n/g, " ").substring(0, 200),
  };
}

/** Converts plain text with \n\n paragraphs into JSX sections */
function ResumoBody({ text }: { text: string }) {
  // Split into blocks at double newlines
  const blocks = text.split(/\n{2,}/);

  return (
    <div className="article-body">
      {blocks.map((block, i) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        // Numbered section header like "I. Introdução" or "II. Resumo"
        if (/^(I{1,3}V?|IV|V|VI|VII|VIII|IX|X)\.\s/.test(trimmed)) {
          return (
            <h2 key={i}>{trimmed}</h2>
          );
        }

        // Numbered item like "1. Governança"
        if (/^\d+\.\s/.test(trimmed) && trimmed.length < 120 && !trimmed.includes("\n")) {
          return <h3 key={i}>{trimmed}</h3>;
        }

        // Bullet list items (single \n separated sub-items)
        if (trimmed.includes("\n") && trimmed.split("\n").every((l) => l.trim().length > 0)) {
          const lines = trimmed.split("\n");
          // If first line looks like a label and rest are sub-items
          if (lines.length > 1 && lines[0].endsWith(":")) {
            return (
              <div key={i}>
                <p style={{ fontWeight: 600, color: "var(--foreground)", marginBottom: "0.5rem" }}>{lines[0]}</p>
                <ul>
                  {lines.slice(1).map((l, j) => <li key={j}>{l.trim()}</li>)}
                </ul>
              </div>
            );
          }
          return (
            <ul key={i}>
              {lines.map((l, j) => <li key={j}>{l.trim()}</li>)}
            </ul>
          );
        }

        return <p key={i}>{trimmed}</p>;
      })}
    </div>
  );
}

export default async function ConsultaDetalhePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const consulta = consultas.find((c) => c.slug === slug);
  if (!consulta) notFound();

  const dias = diasRestantes(consulta.vigencia);
  const aberta = dias >= 0;

  return (
    <main className="bg-background pb-24">
      {/* Back + breadcrumb */}
      <div
        style={{
          borderBottom: "1px solid #0f172a",
          padding: "1rem 1.5rem",
          background: "rgba(3,7,17,0.9)",
          position: "sticky",
          top: 64,
          zIndex: 40,
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="mx-auto max-w-3xl flex items-center gap-3">
          <Link href="/consultas" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
            <ArrowLeft size={13} /> Consultas Públicas
          </Link>
          <span style={{ color: "#1e293b", fontSize: "0.8rem" }}>/</span>
          <span style={{ fontSize: "0.8rem", color: "var(--border)" }} className="truncate">{consulta.bandeira}</span>
        </div>
      </div>

      {/* Hero */}
      <section
        style={{
          padding: "3rem 1.5rem 2.5rem",
          borderBottom: "1px solid #0f172a",
        }}
      >
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span
              className="tag"
              style={{ background: BAND_COLOR[consulta.bandeira], color: BAND_TEXT[consulta.bandeira], border: "none" }}
            >
              {consulta.bandeira}
            </span>
            <span className="tag" style={{ background: "rgba(234,179,8,0.1)", color: "#fbbf24", border: "none" }}>
              Regulatório
            </span>
            {aberta ? (
              dias <= 7 ? (
                <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#f87171", background: "rgba(239,68,68,0.1)", padding: "0.2rem 0.6rem", borderRadius: "9999px", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                  <AlertTriangle size={10} /> {dias}d para encerrar
                </span>
              ) : (
                <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#4ade80", background: "rgba(34,197,94,0.1)", padding: "0.2rem 0.6rem", borderRadius: "9999px" }}>
                  {dias}d para encerrar
                </span>
              )
            ) : (
              <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--muted-foreground)", background: "rgba(71,85,105,0.15)", padding: "0.2rem 0.6rem", borderRadius: "9999px" }}>
                Encerrada
              </span>
            )}
          </div>

          <h1 className="font-bold text-white mb-5" style={{ fontSize: "clamp(1.3rem, 3vw, 1.9rem)", lineHeight: 1.3 }}>
            {consulta.titulo}
          </h1>

          <div className="flex flex-wrap gap-5" style={{ fontSize: "0.8rem", color: "var(--border)" }}>
            <div className="flex items-center gap-1.5">
              <FileText size={12} />
              Publicado em {formatDate(consulta.publicacao)}
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={12} />
              Vigência até {formatDate(consulta.vigencia)}
            </div>
          </div>
        </div>
      </section>

      {/* Alerta prazo */}
      {aberta && dias <= 7 && (
        <div className="mx-auto max-w-3xl px-6 mt-6">
          <div
            style={{
              background: "rgba(239,68,68,0.07)",
              border: "1px solid rgba(239,68,68,0.2)",
              borderLeft: "3px solid #ef4444",
              borderRadius: "0.625rem",
              padding: "0.875rem 1.125rem",
              display: "flex",
              gap: "0.625rem",
              alignItems: "center",
            }}
          >
            <AlertTriangle size={14} style={{ color: "#f87171", flexShrink: 0 }} />
            <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
              Esta consulta encerra em <strong style={{ color: "#f87171" }}>{dias} dia{dias !== 1 ? "s" : ""}</strong>.
              Contribuições devem ser enviadas ao BCB antes de {formatDate(consulta.vigencia)}.
            </p>
          </div>
        </div>
      )}

      {/* Body */}
      <div className="mx-auto max-w-3xl px-6 pt-8">
        <ResumoBody text={consulta.resumo} />

        {/* Footer nav */}
        <div
          style={{
            marginTop: "3rem",
            paddingTop: "2rem",
            borderTop: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <Link href="/consultas" style={{ fontSize: "0.82rem", color: "var(--muted-foreground)", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
            <ArrowLeft size={13} /> Ver todas as consultas
          </Link>
          <Link
            href="/compliance"
            style={{ fontSize: "0.82rem", color: "var(--primary)", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
          >
            Portal de Compliance <ChevronRight size={12} />
          </Link>
        </div>
      </div>
    </main>
  );
}
