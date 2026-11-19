import Link from "next/link";
import { ArrowLeft, Route, Layers, Clock, Shield } from "lucide-react";
import JornadaClient from "./JornadaClient";
import { PaygramaInteractiveLab } from "./PaygramaInteractiveLab";

export const metadata = {
  title: "O Pagamento por Dentro — Laboratório 3D, Pix, Regulatório & 2027+ | VS Payments",
  description:
    "Simulador interativo em 3D isométrico e sequência em milissegundos: Cartão (4 Bandeiras), Clearing & Outgoing, Disputas CE 3.0, Pix (SPI/DICT), Pix Automático/NFC, MED 2.0, Open Finance JSR e Regras Regulatórias 2027+.",
};

const PILARES = [
  { icon: Route, label: "8 Trilhas Interativas", desc: "Cartão, Outgoing, Pix, MED 2.0 e 2027+" },
  { icon: Layers, label: "3D Isométrico ⇄ Sequência", desc: "ISO 8583, 168B/TLV e ISO 20022" },
  { icon: Clock, label: "Injeção de Falhas & Tempo", desc: "STIP, 0400, Downgrade e BCB 304" },
  { icon: Shield, label: "Dinheiro, D+1 & LC 214/2025", desc: "Split MDR, Antecipação e Reforma 2027" },
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

      {/* ── Laboratório Interativo 3D Isométrico, Sequência (ms), Pix & Regulatório 2027+ ── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pt-8">
        <PaygramaInteractiveLab />
      </section>

      {/* ── Enciclopédia Detalhada das 8 Fases do Ciclo do Cartão ── */}
      <section style={{ paddingTop: "3.5rem" }}>
        <div className="mx-auto max-w-5xl px-4 sm:px-6 mb-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-5 py-3.5 flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                Guia Enciclopédico das 8 Fases
              </div>
              <h2 className="text-base font-black text-white">
                Anatomia Detalhada por Fase (Apresentação ➔ Gateway ➔ Adquirente ➔ Bandeira ➔ Emissor ➔ Clearing ➔ Settlement ➔ Disputas)
              </h2>
            </div>
            <Link
              href="/glossario"
              className="text-xs font-bold text-blue-400 hover:underline"
            >
              Abrir Glossário Técnico →
            </Link>
          </div>
        </div>
        <JornadaClient />
      </section>
    </main>
  );
}
