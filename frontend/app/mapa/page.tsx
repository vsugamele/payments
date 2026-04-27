import Link from "next/link";
import { ArrowLeft, Network, Info } from "lucide-react";
import MapaWrapper from "./MapaWrapper";

export const metadata = {
  title: "Mapa de Conhecimento — VS Payments",
  description:
    "Grafo visual interativo do ecossistema de pagamentos. Explore como Portador, Emissor, Intercâmbio, IRD, MCC, VAMP e dezenas de outros conceitos se conectam.",
};

export default function MapaPage() {
  return (
    <main className="bg-background flex flex-col" style={{ height: "calc(100vh - 64px)" }}>
      {/* Header compacto */}
      <div
        style={{
          borderBottom: "1px solid #0f172a",
          background: "#050b18",
          padding: "0.75rem 1.5rem",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          flexShrink: 0,
          flexWrap: "wrap",
        }}
      >
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            fontSize: "0.78rem",
            color: "var(--muted-foreground)",
          }}
          className="hover:text-white transition-colors"
        >
          <ArrowLeft size={13} />
          Início
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Network size={16} style={{ color: "#818cf8" }} />
          <span className="font-semibold text-white" style={{ fontSize: "0.875rem" }}>
            Mapa de Conhecimento
          </span>
          <span
            style={{
              fontSize: "0.65rem",
              fontWeight: 700,
              color: "#818cf8",
              background: "rgba(99,102,241,0.12)",
              border: "1px solid rgba(99,102,241,0.25)",
              borderRadius: "9999px",
              padding: "0.15rem 0.5rem",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            Interativo
          </span>
        </div>

        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            fontSize: "0.72rem",
            color: "var(--muted-foreground)",
          }}
        >
          <Info size={12} />
          Clique num nó para ver detalhes · Scroll para zoom · Arraste para navegar
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Link
            href="/trilhas"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "#818cf8",
              padding: "0.35rem 0.75rem",
              borderRadius: "0.375rem",
              background: "rgba(99,102,241,0.1)",
              border: "1px solid rgba(99,102,241,0.2)",
              textDecoration: "none",
            }}
            className="hover:opacity-80 transition-opacity"
          >
            Ver Trilhas
          </Link>
          <Link
            href="/glossario"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "var(--muted-foreground)",
              padding: "0.35rem 0.75rem",
              borderRadius: "0.375rem",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              textDecoration: "none",
            }}
            className="hover:text-white transition-colors"
          >
            Ver Glossário
          </Link>
        </div>
      </div>

      {/* Grafo — ocupa o restante da tela */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        <MapaWrapper />
      </div>
    </main>
  );
}
