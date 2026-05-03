import Link from "next/link";
import { ArrowLeft, GitMerge, Search } from "lucide-react";
import EcosystemClient from "./EcosystemClient";
import GlobalSearch from "@/components/GlobalSearch";

export const metadata = {
  title: "Mapa do Ecossistema de Pagamentos — VS Payments",
  description:
    "Explore a engenharia macro de pagamentos interligada. Do Onboarding do lojista e Prevenção de Fraude até o Clearing, Liquidação CIP e Gestão de Chargebacks.",
};

export default function EcosystemPage() {
  return (
    <main className="bg-background min-h-screen pb-24">
      {/* ── Hero ── */}
      <section
        className="dot-grid"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(99,102,241,0.08) 0%, transparent 60%)",
          padding: "4rem 1.5rem 3.5rem",
          borderBottom: "1px solid #0f172a",
        }}
      >
        <div className="mx-auto max-w-6xl">
          <Link
            href="/"
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
            <ArrowLeft size={13} /> Voltar ao Início
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex flex-col md:flex-row items-start gap-5">
              <div
                style={{
                  width: 56, height: 56,
                  borderRadius: "1rem",
                  background: "rgba(99,102,241,0.1)",
                  border: "1px solid rgba(99,102,241,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <GitMerge size={26} style={{ color: "#818cf8" }} />
              </div>
              <div>
                <p
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    color: "#818cf8",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    marginBottom: "0.4rem",
                  }}
                >
                  Visão Macro Arquitetural
                </p>
                <h1
                  className="font-bold text-white tracking-tight"
                  style={{ fontSize: "clamp(1.6rem, 4vw, 2.4rem)", lineHeight: 1.1, marginBottom: "0.5rem" }}
                >
                  Mapa Lógico do Ecossistema
                </h1>
                <p
                  style={{
                    color: "var(--muted-foreground)",
                    fontSize: "0.95rem",
                    lineHeight: 1.6,
                    maxWidth: 680,
                  }}
                >
                  Como todos os componentes e ferramentas se interligam: do credenciamento e fraude ao roteamento (ISO), cálculo de intercâmbio (clearing) e o ciclo final de contestações.
                </p>
              </div>
            </div>

            {/* Omni-search trigger area (visual) */}
            <div className="w-full md:w-80">
              <GlobalSearch />
            </div>
          </div>
        </div>
      </section>

      {/* ── Client ── */}
      <section className="px-6 pt-12">
        <EcosystemClient />
      </section>
    </main>
  );
}
