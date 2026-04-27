import Link from "next/link";
import { ArrowLeft, Route, Layers, Clock, Shield, Zap } from "lucide-react";
import JornadaClient from "./JornadaClient";

export const metadata = {
  title: "Jornada de uma Transação — VS Payments",
  description:
    "Visualize de forma interativa o ciclo completo de um pagamento com cartão: da apresentação ao portador até a liquidação financeira e o ciclo de disputa. Cada fase com atores, campos ISO 8583, tempos e impactos.",
};

const PILARES = [
  { icon: Route, label: "8 Fases do Ciclo", desc: "Do POS ao Settlement" },
  { icon: Layers, label: "Campos ISO 8583", desc: "DEs e MTIs documentados" },
  { icon: Clock, label: "Tempos reais", desc: "< 1.5s Autorização total" },
  { icon: Shield, label: "Alertas operacionais", desc: "O que evitar em cada etapa" },
];

export default function JornadaPage() {
  return (
    <main className="bg-background min-h-screen pb-24">
      {/* ── Hero ── */}
      <section
        className="dot-grid"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(16,185,129,0.08) 0%, transparent 70%)",
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
            <ArrowLeft size={13} /> Voltar ao Início
          </Link>

          <div style={{ display: "flex", alignItems: "flex-start", gap: "1.25rem", flexWrap: "wrap" }}>
            <div
              style={{
                width: 56, height: 56,
                borderRadius: "1rem",
                background: "rgba(16,185,129,0.1)",
                border: "1px solid rgba(16,185,129,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Route size={26} style={{ color: "#34d399" }} />
            </div>
            <div style={{ flex: 1 }}>
              <p
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  color: "#34d399",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: "0.4rem",
                }}
              >
                Mapa Interativo
              </p>
              <h1
                className="font-bold text-white"
                style={{ fontSize: "clamp(1.6rem, 4vw, 2.4rem)", lineHeight: 1.1, marginBottom: "0.875rem" }}
              >
                A Jornada Completa de um Pagamento
              </h1>
              <p
                style={{
                  color: "var(--muted-foreground)",
                  fontSize: "0.95rem",
                  lineHeight: 1.8,
                  maxWidth: 680,
                }}
              >
                Em menos de 1.5 segundos, um pagamento percorre 5 sistemas, 3 países (potencialmente) e gera
                decisões que afetam intercâmbio, risco e liquidação. Clique em cada fase para entender
                os atores, os campos ISO 8583 e os custos envolvidos.
              </p>
            </div>
          </div>

          {/* Pilares */}
          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-3"
            style={{ marginTop: "2rem" }}
          >
            {PILARES.map((p) => {
              const PIco = p.icon;
              return (
                <div
                  key={p.label}
                  style={{
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: "0.875rem",
                    padding: "1rem",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.75rem",
                  }}
                >
                  <PIco size={16} style={{ color: "#34d399", flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#f1f5f9", marginBottom: "0.1rem" }}>
                      {p.label}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "#475569" }}>{p.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Client ── */}
      <section style={{ paddingTop: "2.5rem" }}>
        <JornadaClient />
      </section>
    </main>
  );
}
