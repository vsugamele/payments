import { BookMarked, Layers } from "lucide-react";
import glossario from "@/data/glossario.json";
import GlossarioClient from "./GlossarioClient";

export const metadata = {
  title: "Glossário Técnico de Payments — VS Payments",
  description:
    "Mais de 50 termos técnicos do universo de meios de pagamento: BIN, PAN, DPAN, ECI, TAF, TC40, VAMP, ECP, MDR, Intercâmbio e muito mais. Com definições, impacto operacional e referências normativas.",
};

const categorias = [...new Set(glossario.map((t) => t.categoria))];

export default function GlossarioPage() {
  return (
    <main className="bg-background min-h-screen pb-24">
      {/* ── Hero ── */}
      <section
        className="dot-grid"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(99,102,241,0.1) 0%, transparent 70%)",
          padding: "5rem 1.5rem 4rem",
          borderBottom: "1px solid #0f172a",
        }}
      >
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "rgba(99,102,241,0.1)",
              border: "1px solid rgba(99,102,241,0.25)",
              borderRadius: "9999px",
              padding: "0.35rem 1rem",
              marginBottom: "1.5rem",
            }}
          >
            <BookMarked size={13} style={{ color: "#818cf8" }} />
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                color: "#818cf8",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Dicionário Técnico
            </span>
          </div>

          <h1
            className="font-bold text-white mb-4"
            style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)" }}
          >
            Glossário de Meios de Pagamento
          </h1>
          <p
            style={{
              color: "var(--muted-foreground)",
              fontSize: "1rem",
              lineHeight: 1.8,
              maxWidth: 580,
              margin: "0 auto 2.5rem",
            }}
          >
            Toda sigla, todo conceito e todo protocolo que governa a indústria de
            pagamentos — com definição técnica, impacto operacional real e a
            referência normativa de origem.
          </p>

          {/* Stats */}
          <div
            className="grid grid-cols-3 gap-4 mx-auto"
            style={{ maxWidth: 480 }}
          >
            <div
              style={{
                background: "rgba(0,0,0,0.3)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "0.875rem",
                padding: "1rem",
              }}
            >
              <div
                className="text-2xl font-bold text-white mb-1"
              >
                {glossario.length}
              </div>
              <div className="text-xs text-muted-foreground font-semibold uppercase tracking-widest">
                Termos
              </div>
            </div>
            <div
              style={{
                background: "rgba(0,0,0,0.3)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "0.875rem",
                padding: "1rem",
              }}
            >
              <div className="text-2xl font-bold text-indigo-400 mb-1">
                {categorias.length}
              </div>
              <div className="text-xs text-muted-foreground font-semibold uppercase tracking-widest">
                Categorias
              </div>
            </div>
            <div
              style={{
                background: "rgba(0,0,0,0.3)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "0.875rem",
                padding: "1rem",
              }}
            >
              <div className="text-2xl font-bold text-emerald-400 mb-1">
                100%
              </div>
              <div className="text-xs text-muted-foreground font-semibold uppercase tracking-widest">
                Com Fonte
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Separador de domínios ── */}
      <section className="mx-auto max-w-5xl px-6 pt-10 pb-6">
        <div className="flex items-center gap-2 mb-2">
          <Layers size={15} style={{ color: "#4f46e5" }} />
          <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#4f46e5", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Domínios Cobertos
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {categorias.sort().map((cat) => (
            <span
              key={cat}
              style={{
                fontSize: "0.72rem",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                color: "#64748b",
                padding: "0.25rem 0.65rem",
                borderRadius: "0.375rem",
                fontWeight: 500,
              }}
            >
              {cat}
            </span>
          ))}
        </div>
      </section>

      {/* ── Client Component (busca + filtros + listagem) ── */}
      <GlossarioClient />
    </main>
  );
}
