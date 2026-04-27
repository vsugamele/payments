import Link from "next/link";
import { ArrowLeft, GraduationCap, Compass } from "lucide-react";
import trilhasData from "@/data/trilhas.json";
import { TrilhaCard } from "@/components/TrilhasClient";

export const metadata = {
  title: "Trilhas de Aprendizado — VS Payments",
  description:
    "Currículo estruturado em meios de pagamento. Do ecossistema ao intercâmbio técnico, compliance e risco — aprenda no seu ritmo com trilhas progressivas.",
};

const NIVEL_ORDER = ["Iniciante", "Intermediário", "Avançado"];

export default function TrilhasPage() {
  const sorted = [...trilhasData.trilhas].sort(
    (a, b) => NIVEL_ORDER.indexOf(a.nivel) - NIVEL_ORDER.indexOf(b.nivel)
  );

  return (
    <main className="bg-background min-h-screen pb-24">
      {/* Hero */}
      <section
        className="dot-grid"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(99,102,241,0.1) 0%, transparent 70%)",
          padding: "4rem 1.5rem 3.5rem",
          borderBottom: "1px solid #0f172a",
        }}
      >
        <div className="mx-auto max-w-5xl">
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
                width: 56,
                height: 56,
                borderRadius: "1rem",
                background: "rgba(99,102,241,0.1)",
                border: "1px solid rgba(99,102,241,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <GraduationCap size={26} style={{ color: "#818cf8" }} />
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  background: "rgba(99,102,241,0.1)",
                  border: "1px solid rgba(99,102,241,0.2)",
                  borderRadius: "9999px",
                  padding: "0.3rem 0.9rem",
                  marginBottom: "0.75rem",
                }}
              >
                <Compass size={11} style={{ color: "#818cf8" }} />
                <span
                  style={{
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    color: "#818cf8",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  Aprendizado Estruturado
                </span>
              </div>
              <h1
                className="font-bold text-white"
                style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.2rem)", marginBottom: "0.75rem" }}
              >
                Trilhas de Aprendizado
              </h1>
              <p style={{ fontSize: "0.95rem", color: "var(--muted-foreground)", maxWidth: 580, lineHeight: 1.6 }}>
                Currículo progressivo em meios de pagamento. Cada trilha reúne conceitos, exemplos práticos e
                ligações diretas com o simulador — estude no seu ritmo e acompanhe o progresso.
              </p>
            </div>
          </div>

          {/* Stats */}
          <div
            style={{
              display: "flex",
              gap: "2rem",
              marginTop: "2.5rem",
              flexWrap: "wrap",
            }}
          >
            {[
              { valor: `${trilhasData.trilhas.length}`, label: "trilhas disponíveis" },
              {
                valor: `${trilhasData.trilhas.reduce((acc, t) => acc + t.modulos.reduce((a, m) => a + m.licoes.length, 0), 0)}`,
                label: "lições no total",
              },
              { valor: "~3h", label: "de conteúdo" },
            ].map((s) => (
              <div key={s.label}>
                <p className="font-bold text-white" style={{ fontSize: "1.4rem" }}>
                  {s.valor}
                </p>
                <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Grid de trilhas */}
      <section style={{ padding: "3rem 1.5rem 0" }}>
        <div className="mx-auto max-w-5xl">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {sorted.map((trilha) => (
              <TrilhaCard key={trilha.id} trilha={trilha} />
            ))}
          </div>

          {/* Rodapé educacional */}
          <div
            style={{
              marginTop: "3rem",
              padding: "1.5rem",
              borderRadius: "1rem",
              background: "rgba(255,255,255,0.02)",
              border: "1px solid var(--border)",
              display: "flex",
              alignItems: "flex-start",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            <GraduationCap size={20} style={{ color: "var(--muted-foreground)", flexShrink: 0, marginTop: 2 }} />
            <div>
              <p className="font-semibold text-white" style={{ fontSize: "0.875rem", marginBottom: "0.3rem" }}>
                Como usar as trilhas
              </p>
              <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", lineHeight: 1.6 }}>
                Cada lição traz o conceito explicado do zero, os termos-chave linkados ao glossário e, onde aplicável,
                um botão direto para o simulador com o cenário pré-configurado. O progresso é salvo no seu
                navegador — você pode pausar e retomar a qualquer momento.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
