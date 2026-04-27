import Link from "next/link";
import { ArrowLeft, GitCompare, ShieldCheck, TrendingUp, CreditCard, Wifi } from "lucide-react";
import CanaisClient from "./CanaisClient";

export const metadata = {
  title: "Matriz de Canais de Pagamento CP vs CNP — VS Payments",
  description:
    "Comparação técnica completa de todos os canais de pagamento: Chip+PIN, Contactless, Fallback, E-commerce com/sem 3DS, MOTO, Recorrência, Apple Pay e Network Tokens. Risco, intercâmbio, liability e campos ISO 8583.",
};

const CANAIS_RESUMO = [
  { nome: "Chip + PIN", cor: "#22c55e", tipo: "CP" },
  { nome: "Contactless NFC", cor: "#4ade80", tipo: "CP" },
  { nome: "Fallback Magstripe", cor: "#f97316", tipo: "CP" },
  { nome: "E-com + 3DS (ECI 05)", cor: "#22c55e", tipo: "CNP" },
  { nome: "E-com sem 3DS", cor: "#ef4444", tipo: "CNP" },
  { nome: "MOTO", cor: "#ef4444", tipo: "CNP" },
  { nome: "MIT / Recorrência", cor: "#fbbf24", tipo: "CNP" },
  { nome: "Apple Pay / DPAN", cor: "#22c55e", tipo: "CNP" },
  { nome: "Network Token", cor: "#818cf8", tipo: "CNP" },
];

export default function CanaisPage() {
  return (
    <main className="bg-background min-h-screen pb-24">
      {/* ── Hero ── */}
      <section
        className="dot-grid"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(99,102,241,0.09) 0%, transparent 70%)",
          padding: "4rem 1.5rem 3.5rem",
          borderBottom: "1px solid #0f172a",
        }}
      >
        <div className="mx-auto max-w-4xl">
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
            <ArrowLeft size={13} /> Voltar
          </Link>

          <div style={{ display: "flex", alignItems: "flex-start", gap: "1.25rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
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
              <GitCompare size={26} style={{ color: "#818cf8" }} />
            </div>
            <div>
              <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "#818cf8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.4rem" }}>
                Matriz Técnica — CP vs CNP
              </p>
              <h1
                className="font-bold text-white"
                style={{ fontSize: "clamp(1.6rem, 4vw, 2.4rem)", lineHeight: 1.1, marginBottom: "0.875rem" }}
              >
                Canais de Pagamento:<br className="hidden md:block" /> Risco, Intercâmbio e Liability
              </h1>
              <p style={{ color: "var(--muted-foreground)", fontSize: "0.95rem", lineHeight: 1.8, maxWidth: 680 }}>
                A decisão de qual canal usar define diretamente o custo de intercâmbio, o risco de fraude e
                quem paga de volta em caso de chargeback. Esta matriz compara tecnicamente todos os 13 canais —
                com campos ISO 8583, ECI values e condições reais de liability shift.
              </p>
            </div>
          </div>

          {/* Grid de canais */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {CANAIS_RESUMO.map((c) => (
              <div
                key={c.nome}
                style={{
                  display: "flex", alignItems: "center", gap: "0.5rem",
                  background: "rgba(0,0,0,0.3)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "0.5rem",
                  padding: "0.4rem 0.8rem",
                }}
              >
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: c.cor }} />
                <span style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: 500 }}>{c.nome}</span>
                <span style={{ fontSize: "0.6rem", fontWeight: 700, color: c.tipo === "CP" ? "#60a5fa" : "#c084fc" }}>
                  {c.tipo}
                </span>
              </div>
            ))}
          </div>

          {/* Insight cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3" style={{ marginTop: "1.75rem" }}>
            {[
              { icon: ShieldCheck, titulo: "Liability Shift", desc: "3DS (ECI 05/02) ou DAF transfere 100% do risco de fraude para o Emissor", cor: "#22c55e" },
              { icon: TrendingUp, titulo: "Custo vs Segurança", desc: "Canal CNP sem 3DS paga intercâmbio alto E mantém o Liability. O pior dos mundos.", cor: "#ef4444" },
              { icon: CreditCard, titulo: "Network Token", desc: "Combina segurança tokenizada + aprovação 3-8% maior + churn zero em renovação.", cor: "#818cf8" },
            ].map((card) => {
              const Ico = card.icon;
              return (
                <div key={card.titulo} style={{
                  background: "rgba(0,0,0,0.3)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "0.875rem",
                  padding: "1rem 1.25rem",
                  display: "flex", gap: "0.75rem",
                }}>
                  <Ico size={16} style={{ color: card.cor, flexShrink: 0, marginTop: 3 }} />
                  <div>
                    <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#f1f5f9", marginBottom: "0.25rem" }}>{card.titulo}</div>
                    <div style={{ fontSize: "0.75rem", color: "#64748b", lineHeight: 1.6 }}>{card.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Client Component ── */}
      <section style={{ paddingTop: "2.5rem" }}>
        <CanaisClient />
      </section>
    </main>
  );
}
