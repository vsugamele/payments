"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, CheckCircle2, Clock, BookOpen, Tag, ExternalLink } from "lucide-react";
import { markComplete, isComplete } from "@/lib/progress";

interface NavLicao {
  id: string;
  titulo: string;
  trilhaId: string;
}

interface LicaoLayoutProps {
  trilhaId: string;
  trilhaTitulo: string;
  trilhaCor: string;
  licaoId: string;
  titulo: string;
  tempo: string;
  tipo: string;
  termos?: string[];
  simulador?: { label: string; href: string };
  anterior?: NavLicao;
  proximo?: NavLicao;
  children: React.ReactNode;
}

export function LicaoLayout({
  trilhaId,
  trilhaTitulo,
  trilhaCor,
  licaoId,
  titulo,
  tempo,
  tipo,
  termos = [],
  simulador,
  anterior,
  proximo,
  children,
}: LicaoLayoutProps) {
  const [completo, setCompleto] = useState(false);

  useEffect(() => {
    setCompleto(isComplete(trilhaId, licaoId));
  }, [trilhaId, licaoId]);

  const handleMarcar = useCallback(() => {
    markComplete(trilhaId, licaoId);
    setCompleto(true);
  }, [trilhaId, licaoId]);

  const tipoLabel: Record<string, string> = {
    conceito: "Conceito",
    pratica: "Prática",
    referencia: "Referência",
  };

  return (
    <main className="bg-background min-h-screen pb-24">
      {/* Barra de topo com breadcrumb */}
      <div
        style={{
          borderBottom: "1px solid #0f172a",
          background: "#050b18",
          padding: "0.75rem 1.5rem",
          position: "sticky",
          top: 64,
          zIndex: 40,
        }}
      >
        <div
          className="mx-auto max-w-3xl"
          style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}
        >
          <Link
            href="/trilhas"
            style={{ fontSize: "0.78rem", color: "var(--muted-foreground)" }}
            className="hover:text-white transition-colors"
          >
            Trilhas
          </Link>
          <ChevronRight size={12} style={{ color: "var(--muted-foreground)" }} />
          <Link
            href={`/trilhas/${trilhaId}`}
            style={{ fontSize: "0.78rem", color: "var(--muted-foreground)" }}
            className="hover:text-white transition-colors"
          >
            {trilhaTitulo}
          </Link>
          <ChevronRight size={12} style={{ color: "var(--muted-foreground)" }} />
          <span style={{ fontSize: "0.78rem", color: "var(--foreground)", fontWeight: 500 }}>
            {titulo}
          </span>

          {completo && (
            <span
              className="ml-auto flex items-center gap-1"
              style={{ fontSize: "0.72rem", color: trilhaCor, fontWeight: 600 }}
            >
              <CheckCircle2 size={13} />
              Concluído
            </span>
          )}
        </div>
      </div>

      {/* Header da lição */}
      <div
        className="dot-grid"
        style={{
          padding: "3rem 1.5rem 2.5rem",
          borderBottom: "1px solid #0f172a",
          background: `radial-gradient(ellipse 60% 50% at 50% 0%, ${trilhaCor}14 0%, transparent 70%)`,
        }}
      >
        <div className="mx-auto max-w-3xl">
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1rem", alignItems: "center" }}>
            <span
              style={{
                padding: "0.2rem 0.7rem",
                borderRadius: "9999px",
                fontSize: "0.65rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: trilhaCor,
                background: `${trilhaCor}18`,
                border: `1px solid ${trilhaCor}30`,
              }}
            >
              {tipoLabel[tipo] ?? tipo}
            </span>
            <span
              className="flex items-center gap-1"
              style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}
            >
              <Clock size={12} />
              {tempo} de leitura
            </span>
          </div>
          <h1
            className="font-bold text-white"
            style={{ fontSize: "clamp(1.4rem, 3.5vw, 2rem)", lineHeight: 1.25 }}
          >
            {titulo}
          </h1>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="mx-auto max-w-3xl px-6 pt-10">
        <div className="article-body">{children}</div>

        {/* Termos relacionados */}
        {termos.length > 0 && (
          <div
            style={{
              marginTop: "3rem",
              padding: "1.25rem 1.5rem",
              borderRadius: "0.75rem",
              background: "rgba(255,255,255,0.02)",
              border: "1px solid var(--border)",
            }}
          >
            <div
              className="flex items-center gap-2"
              style={{ marginBottom: "0.875rem" }}
            >
              <Tag size={14} style={{ color: "var(--muted-foreground)" }} />
              <span
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--muted-foreground)",
                }}
              >
                Termos desta lição
              </span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {termos.map((t) => (
                <Link
                  key={t}
                  href={`/glossario?q=${encodeURIComponent(t)}`}
                  style={{
                    padding: "0.3rem 0.75rem",
                    borderRadius: "0.375rem",
                    fontSize: "0.78rem",
                    fontWeight: 500,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid var(--border)",
                    color: "var(--foreground)",
                    textDecoration: "none",
                    transition: "border-color 0.15s, color 0.15s",
                  }}
                  className="hover:border-blue-500/50 hover:text-white"
                >
                  {t}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Botão simulador */}
        {simulador && (
          <div
            style={{
              marginTop: "1.25rem",
              padding: "1.25rem 1.5rem",
              borderRadius: "0.75rem",
              background: `${trilhaCor}0a`,
              border: `1px solid ${trilhaCor}30`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            <div className="flex items-center gap-2">
              <BookOpen size={16} style={{ color: trilhaCor }} />
              <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--foreground)" }}>
                {simulador.label}
              </span>
            </div>
            <Link
              href={simulador.href}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.5rem 1rem",
                borderRadius: "0.5rem",
                background: trilhaCor,
                color: "#fff",
                fontSize: "0.8rem",
                fontWeight: 700,
                textDecoration: "none",
              }}
              className="hover:opacity-90 transition-opacity"
            >
              Abrir simulador
              <ExternalLink size={13} />
            </Link>
          </div>
        )}

        {/* Marcar como concluído */}
        {!completo && (
          <div style={{ marginTop: "2.5rem", textAlign: "center" }}>
            <button
              onClick={handleMarcar}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.7rem 1.75rem",
                borderRadius: "0.5rem",
                background: trilhaCor,
                color: "#fff",
                fontSize: "0.875rem",
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                transition: "opacity 0.15s",
              }}
              className="hover:opacity-90"
            >
              <CheckCircle2 size={16} />
              Marcar lição como concluída
            </button>
          </div>
        )}

        {completo && (
          <div
            style={{
              marginTop: "2.5rem",
              padding: "1rem 1.5rem",
              borderRadius: "0.75rem",
              background: `${trilhaCor}10`,
              border: `1px solid ${trilhaCor}30`,
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <CheckCircle2 size={18} style={{ color: trilhaCor }} />
            <p style={{ fontSize: "0.875rem", color: "var(--foreground)", margin: 0 }}>
              Lição concluída!
              {proximo && (
                <>
                  {" "}
                  Continue para{" "}
                  <Link
                    href={`/trilhas/${proximo.trilhaId}/${proximo.id}`}
                    style={{ color: trilhaCor, fontWeight: 600 }}
                  >
                    {proximo.titulo}
                  </Link>
                  .
                </>
              )}
            </p>
          </div>
        )}

        {/* Navegação prev/next */}
        <div
          style={{
            marginTop: "3rem",
            paddingTop: "2rem",
            borderTop: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            gap: "1rem",
          }}
        >
          {anterior ? (
            <Link
              href={`/trilhas/${anterior.trilhaId}/${anterior.id}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.6rem 1rem",
                borderRadius: "0.5rem",
                border: "1px solid var(--border)",
                fontSize: "0.8rem",
                color: "var(--muted-foreground)",
                textDecoration: "none",
                maxWidth: "48%",
              }}
              className="hover:border-white/20 hover:text-white transition-colors"
            >
              <ChevronLeft size={14} />
              <span className="truncate">{anterior.titulo}</span>
            </Link>
          ) : (
            <Link
              href={`/trilhas/${trilhaId}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.6rem 1rem",
                borderRadius: "0.5rem",
                border: "1px solid var(--border)",
                fontSize: "0.8rem",
                color: "var(--muted-foreground)",
                textDecoration: "none",
              }}
              className="hover:border-white/20 hover:text-white transition-colors"
            >
              <ChevronLeft size={14} />
              Ver trilha
            </Link>
          )}

          {proximo && (
            <Link
              href={`/trilhas/${proximo.trilhaId}/${proximo.id}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.6rem 1rem",
                borderRadius: "0.5rem",
                background: trilhaCor,
                fontSize: "0.8rem",
                color: "#fff",
                fontWeight: 600,
                textDecoration: "none",
                marginLeft: "auto",
                maxWidth: "48%",
              }}
              className="hover:opacity-90 transition-opacity"
            >
              <span className="truncate">{proximo.titulo}</span>
              <ChevronRight size={14} />
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
