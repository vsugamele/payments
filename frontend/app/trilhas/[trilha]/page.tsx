import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock, Lock, BookOpen, ChevronRight } from "lucide-react";
import trilhasData from "@/data/trilhas.json";
import type { Metadata } from "next";

type Props = { params: Promise<{ trilha: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { trilha: slug } = await params;
  const trilha = trilhasData.trilhas.find((t) => t.id === slug);
  if (!trilha) return { title: "Trilha não encontrada" };
  return {
    title: `${trilha.titulo} — Trilhas VS Payments`,
    description: trilha.descricao,
  };
}

export function generateStaticParams() {
  return trilhasData.trilhas.map((t) => ({ trilha: t.id }));
}

// Computa lista plana de lições para navegação prev/next
function licoesPlanosDs(trilha: (typeof trilhasData.trilhas)[0]) {
  return trilha.modulos.flatMap((m) =>
    m.licoes.map((l) => ({ ...l, trilhaId: trilha.id }))
  );
}

export default async function TrilhaPage({ params }: Props) {
  const { trilha: slug } = await params;
  const trilha = trilhasData.trilhas.find((t) => t.id === slug);
  if (!trilha) notFound();

  const todas = licoesPlanosDs(trilha);
  const totalLicoes = todas.length;

  return (
    <main className="bg-background min-h-screen pb-24">
      {/* Hero */}
      <section
        className="dot-grid"
        style={{
          background: `radial-gradient(ellipse 70% 50% at 50% 0%, ${trilha.cor}14 0%, transparent 70%)`,
          padding: "3.5rem 1.5rem 3rem",
          borderBottom: "1px solid #0f172a",
        }}
      >
        <div className="mx-auto max-w-4xl">
          <Link
            href="/trilhas"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              fontSize: "0.8rem",
              color: "var(--muted-foreground)",
              marginBottom: "1.5rem",
            }}
            className="hover:text-white transition-colors"
          >
            <ArrowLeft size={13} /> Todas as trilhas
          </Link>

          <span
            style={{
              display: "inline-block",
              fontSize: "0.65rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: trilha.cor,
              background: trilha.cor_fundo,
              border: `1px solid ${trilha.cor_borda}`,
              borderRadius: "9999px",
              padding: "0.2rem 0.65rem",
              marginBottom: "0.75rem",
            }}
          >
            {trilha.nivel}
          </span>

          <h1
            className="font-bold text-white"
            style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)", marginBottom: "0.75rem" }}
          >
            {trilha.titulo}
          </h1>
          <p
            style={{
              fontSize: "0.95rem",
              color: "var(--muted-foreground)",
              maxWidth: 560,
              lineHeight: 1.65,
              marginBottom: "1.75rem",
            }}
          >
            {trilha.descricao}
          </p>

          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
            <span
              className="flex items-center gap-1.5"
              style={{ fontSize: "0.82rem", color: "var(--muted-foreground)" }}
            >
              <BookOpen size={14} style={{ color: trilha.cor }} />
              {totalLicoes} lições
            </span>
            <span
              className="flex items-center gap-1.5"
              style={{ fontSize: "0.82rem", color: "var(--muted-foreground)" }}
            >
              <Clock size={14} style={{ color: trilha.cor }} />
              {trilha.tempo_total}
            </span>
            <span style={{ fontSize: "0.82rem", color: "var(--muted-foreground)" }}>
              {trilha.modulos.length} módulos
            </span>
          </div>

          {/* CTA principal */}
          <Link
            href={`/trilhas/${trilha.id}/${trilha.modulos[0]?.licoes[0]?.id}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              marginTop: "2rem",
              padding: "0.7rem 1.5rem",
              borderRadius: "0.5rem",
              background: trilha.cor,
              color: "#fff",
              fontSize: "0.875rem",
              fontWeight: 700,
              textDecoration: "none",
            }}
            className="hover:opacity-90 transition-opacity"
          >
            Começar trilha
            <ChevronRight size={15} />
          </Link>
        </div>
      </section>

      {/* Módulos e lições */}
      <section style={{ padding: "3rem 1.5rem 0" }}>
        <div className="mx-auto max-w-4xl">
          <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
            {trilha.modulos.map((modulo, mi) => (
              <div key={modulo.id}>
                {/* Cabeçalho do módulo */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.875rem",
                    marginBottom: "1rem",
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: trilha.cor_fundo,
                      border: `1px solid ${trilha.cor_borda}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.78rem",
                      fontWeight: 800,
                      color: trilha.cor,
                      flexShrink: 0,
                    }}
                  >
                    {modulo.numero}
                  </div>
                  <h2
                    className="font-bold text-white"
                    style={{ fontSize: "1rem" }}
                  >
                    {modulo.titulo}
                  </h2>
                </div>

                {/* Lições do módulo */}
                <div
                  style={{
                    marginLeft: "1rem",
                    borderLeft: `2px solid ${trilha.cor_borda}`,
                    paddingLeft: "1.5rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                  }}
                >
                  {modulo.licoes.map((licao, li) => {
                    const globalIndex =
                      trilha.modulos
                        .slice(0, mi)
                        .reduce((acc, m) => acc + m.licoes.length, 0) + li;
                    const bloqueada = false; // sem bloqueio por ora — todas abertas

                    return (
                      <LicaoRow
                        key={licao.id}
                        licao={licao}
                        trilha={trilha}
                        numero={globalIndex + 1}
                        bloqueada={bloqueada}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function LicaoRow({
  licao,
  trilha,
  numero,
  bloqueada,
}: {
  licao: { id: string; titulo: string; descricao: string; tempo: string; tipo: string };
  trilha: (typeof trilhasData.trilhas)[0];
  numero: number;
  bloqueada: boolean;
}) {
  const tipoColor: Record<string, string> = {
    conceito: "#6366f1",
    pratica: "#10b981",
    referencia: "#f59e0b",
  };

  if (bloqueada) {
    return (
      <div
        style={{
          padding: "1rem 1.25rem",
          borderRadius: "0.75rem",
          background: "rgba(255,255,255,0.02)",
          border: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          opacity: 0.5,
        }}
      >
        <Lock size={16} style={{ color: "var(--muted-foreground)", flexShrink: 0 }} />
        <span style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>
          {licao.titulo}
        </span>
      </div>
    );
  }

  return (
    <Link
      href={`/trilhas/${trilha.id}/${licao.id}`}
      style={{
        padding: "1rem 1.25rem",
        borderRadius: "0.75rem",
        background: "rgba(255,255,255,0.02)",
        border: "1px solid var(--border)",
        display: "flex",
        alignItems: "flex-start",
        gap: "1rem",
        textDecoration: "none",
        transition: "border-color 0.15s, background 0.15s",
      }}
      className="hover:border-white/20 hover:bg-white/[0.04]"
    >
      {/* Número */}
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: "0.375rem",
          background: `${trilha.cor}18`,
          border: `1px solid ${trilha.cor}30`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.72rem",
          fontWeight: 700,
          color: trilha.cor,
          flexShrink: 0,
          marginTop: "0.1rem",
        }}
      >
        {numero}
      </div>

      {/* Conteúdo */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          className="font-semibold text-white"
          style={{ fontSize: "0.875rem", marginBottom: "0.25rem" }}
        >
          {licao.titulo}
        </p>
        <p
          style={{
            fontSize: "0.78rem",
            color: "var(--muted-foreground)",
            lineHeight: 1.5,
          }}
        >
          {licao.descricao}
        </p>
        <div style={{ display: "flex", gap: "0.875rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
          <span
            style={{
              fontSize: "0.68rem",
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: tipoColor[licao.tipo] ?? "var(--muted-foreground)",
            }}
          >
            {licao.tipo}
          </span>
          <span
            className="flex items-center gap-1"
            style={{ fontSize: "0.72rem", color: "var(--muted-foreground)" }}
          >
            <Clock size={11} />
            {licao.tempo}
          </span>
        </div>
      </div>

      <ChevronRight size={15} style={{ color: "var(--muted-foreground)", flexShrink: 0, marginTop: "0.25rem" }} />
    </Link>
  );
}
