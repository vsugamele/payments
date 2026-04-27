"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Clock, BookOpen, ChevronRight } from "lucide-react";
import { getTrilhaStats } from "@/lib/progress";

interface Licao {
  id: string;
}
interface Modulo {
  licoes: Licao[];
}
interface Trilha {
  id: string;
  titulo: string;
  subtitulo: string;
  descricao: string;
  nivel: string;
  cor: string;
  cor_fundo: string;
  cor_borda: string;
  tempo_total: string;
  modulos: Modulo[];
}

function totalLicoes(trilha: Trilha): number {
  return trilha.modulos.reduce((acc, m) => acc + m.licoes.length, 0);
}

function primeiraLicao(trilha: Trilha): string {
  const primeiroModulo = trilha.modulos[0];
  if (!primeiroModulo?.licoes[0]) return `/trilhas/${trilha.id}`;
  return `/trilhas/${trilha.id}/${primeiroModulo.licoes[0].id}`;
}

export function TrilhaCard({ trilha }: { trilha: Trilha }) {
  const total = totalLicoes(trilha);
  const [stats, setStats] = useState({ completed: 0, percent: 0 });

  useEffect(() => {
    setStats(getTrilhaStats(trilha.id, total));
  }, [trilha.id, total]);

  const started = stats.completed > 0;
  const done = stats.percent === 100;

  return (
    <div
      style={{
        background: trilha.cor_fundo,
        border: `1px solid ${trilha.cor_borda}`,
        borderRadius: "1rem",
        padding: "1.75rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.25rem",
        transition: "border-color 0.2s, box-shadow 0.2s",
      }}
      className="hover:shadow-lg"
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
        <div>
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
              marginBottom: "0.6rem",
            }}
          >
            {trilha.nivel}
          </span>
          <h2
            className="font-bold text-white"
            style={{ fontSize: "1.15rem", lineHeight: 1.3, marginBottom: "0.3rem" }}
          >
            {trilha.titulo}
          </h2>
          <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", lineHeight: 1.5 }}>
            {trilha.subtitulo}
          </p>
        </div>
        {done && (
          <CheckCircle2
            size={22}
            style={{ color: trilha.cor, flexShrink: 0, marginTop: "0.25rem" }}
          />
        )}
      </div>

      {/* Meta */}
      <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap" }}>
        <span
          className="flex items-center gap-1"
          style={{ fontSize: "0.78rem", color: "var(--muted-foreground)" }}
        >
          <BookOpen size={13} style={{ color: trilha.cor }} />
          {total} lições
        </span>
        <span
          className="flex items-center gap-1"
          style={{ fontSize: "0.78rem", color: "var(--muted-foreground)" }}
        >
          <Clock size={13} style={{ color: trilha.cor }} />
          {trilha.tempo_total}
        </span>
        <span style={{ fontSize: "0.78rem", color: "var(--muted-foreground)" }}>
          {trilha.modulos.length} módulos
        </span>
      </div>

      {/* Progress bar */}
      {started && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
            <span style={{ fontSize: "0.72rem", color: "var(--muted-foreground)" }}>
              {stats.completed}/{total} lições concluídas
            </span>
            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: trilha.cor }}>
              {stats.percent}%
            </span>
          </div>
          <div
            style={{
              height: 4,
              borderRadius: 9999,
              background: "rgba(255,255,255,0.08)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${stats.percent}%`,
                background: trilha.cor,
                borderRadius: 9999,
                transition: "width 0.4s ease",
              }}
            />
          </div>
        </div>
      )}

      {/* CTA */}
      <Link
        href={started ? `/trilhas/${trilha.id}` : primeiraLicao(trilha)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.4rem",
          padding: "0.6rem 1.25rem",
          borderRadius: "0.5rem",
          background: trilha.cor,
          color: "#fff",
          fontSize: "0.83rem",
          fontWeight: 700,
          textDecoration: "none",
          transition: "opacity 0.15s",
          marginTop: "auto",
        }}
        className="hover:opacity-90"
      >
        {done ? "Revisar trilha" : started ? "Continuar" : "Começar"}
        <ChevronRight size={15} />
      </Link>
    </div>
  );
}
