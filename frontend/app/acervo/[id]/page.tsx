import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, BookOpen, FileText } from "lucide-react";
import ManualDetailClient from "../ManualDetailClient";

// ─── Import dos manuais detalhados ───────────────────────────────────────────
import mcManual from "@/data/mastercard-manual-detalhado.json";
import viManual from "@/data/visa-manual-detalhado.json";

const MANUAIS_DETALHADOS: Record<string, any> = {
  "mc-interchange-detalhado": mcManual,
  "vi-interchange-detalhado": viManual,
};

// ─── Geração Estática de Rotas ────────────────────────────────────────────────
export function generateStaticParams() {
  return Object.keys(MANUAIS_DETALHADOS).map((id) => ({ id }));
}

// ─── Metadata Dinâmica ────────────────────────────────────────────────────────
export async function generateMetadata({ params }: { params: { id: string } }) {
  const manual = MANUAIS_DETALHADOS[params.id];
  if (!manual) return { title: "Manual não encontrado" };
  return {
    title: `${manual.titulo} | Acervo — VS Payments`,
    description: manual.descricao,
  };
}

// ─── Página ───────────────────────────────────────────────────────────────────
export default function ManualDetailPage({ params }: { params: { id: string } }) {
  const manual = MANUAIS_DETALHADOS[params.id];
  if (!manual) notFound();

  const bandeiraCor =
    manual.bandeira === "Mastercard" ? "#ef4444"
    : manual.bandeira === "Visa"    ? "#3b82f6"
    : "#a78bfa";

  const totalSecoes = manual.secoes?.length ?? 0;

  return (
    <div style={{ background: "#030711", minHeight: "100vh", paddingBottom: "6rem" }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ borderBottom: "1px solid #0f1a2e", background: "#050b18" }}>
        <div className="mx-auto max-w-5xl px-6 py-6">
          <Link
            href="/acervo"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", color: "#64748b", marginBottom: "1.25rem", textDecoration: "none" }}
            className="hover:text-white transition-colors"
          >
            <ChevronLeft size={14} /> Voltar ao Acervo Normativo
          </Link>

          <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
            {/* Ícone */}
            <div style={{
              width: 48, height: 48, borderRadius: "0.875rem", flexShrink: 0,
              background: `${bandeiraCor}12`, border: `1px solid ${bandeiraCor}30`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <BookOpen size={22} style={{ color: bandeiraCor }} />
            </div>

            <div style={{ flex: 1 }}>
              {/* Eyebrow */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", flexWrap: "wrap", marginBottom: "0.4rem" }}>
                <span style={{
                  fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                  color: bandeiraCor, background: `${bandeiraCor}15`, border: `1px solid ${bandeiraCor}30`,
                  padding: "0.2rem 0.6rem", borderRadius: "9999px",
                }}>
                  {manual.bandeira}
                </span>
                <span style={{ fontSize: "0.7rem", color: "#475569" }}>v{manual.versao}</span>
                <span style={{ fontSize: "0.7rem", color: "#334155" }}>·</span>
                <span style={{ fontSize: "0.7rem", color: "#475569" }}>{totalSecoes} seções</span>
              </div>

              {/* Título */}
              <h1 style={{ fontWeight: 800, fontSize: "clamp(1.2rem, 3vw, 1.6rem)", color: "white", lineHeight: 1.2, marginBottom: "0.5rem" }}>
                {manual.titulo}
              </h1>

              {/* Descrição */}
              <p style={{ fontSize: "0.83rem", color: "#64748b", lineHeight: 1.65, maxWidth: 680 }}>
                {manual.descricao}
              </p>
            </div>
          </div>

          {/* Stat chips */}
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "1.25rem" }}>
            {[
              { label: `${totalSecoes} Seções`, color: "#6366f1" },
              { label: "Dados do DOCX original", color: "#10b981" },
              { label: "Campos ISO 8583 / IPM", color: "#f59e0b" },
              { label: manual.bandeira === "Mastercard" ? "GCMS · PDS · IRD" : "Base II · TCR · FPI", color: bandeiraCor },
            ].map((chip) => (
              <span key={chip.label} style={{
                fontSize: "0.68rem", fontWeight: 600, color: chip.color,
                background: `${chip.color}10`, border: `1px solid ${chip.color}25`,
                padding: "0.25rem 0.65rem", borderRadius: "9999px",
              }}>
                {chip.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Conteúdo ───────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-5xl px-6 pt-8">
        <ManualDetailClient manual={manual} />

        {/* Rodapé de navegação */}
        <div style={{
          marginTop: "3rem", padding: "1.25rem 1.5rem",
          background: "rgba(255,255,255,0.02)", border: "1px solid #0f1a2e",
          borderRadius: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <FileText size={16} style={{ color: "#475569" }} />
            <span style={{ fontSize: "0.78rem", color: "#475569" }}>
              Conteúdo extraído dos documentos técnicos internos — atualizado em Mai/2026
            </span>
          </div>
          <Link
            href="/acervo"
            style={{ fontSize: "0.78rem", color: "#6366f1", fontWeight: 600, textDecoration: "none" }}
            className="hover:underline"
          >
            Ver todos os manuais →
          </Link>
        </div>
      </div>

    </div>
  );
}
