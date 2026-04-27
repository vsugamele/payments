import Link from "next/link";
import {
  Calculator,
  ShieldCheck,
  TrendingUp,
  Layers,
  Users,
  Bell,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const SOLUTIONS = [
  {
    icon: Calculator,
    title: "Motor de Intercâmbio",
    desc: "Simulador de taxas em tempo real para Visa, Mastercard e Maestro. Motor com cascata de regras, debug completo e hot-reload de tabelas.",
    items: [
      "Cálculo por PID, AFS, canal e MCC",
      "Cascata de avaliação com debug",
      "Suporte a Visa, Mastercard e Maestro",
      "Atualização de tabelas sem restart",
    ],
    cta: { label: "Acessar Simulador", href: "/simulador" },
    highlight: true,
  },
  {
    icon: ShieldCheck,
    title: "Consultoria em Bandeiras",
    desc: "Interpretação e aplicação de releases trimestrais. Suporte técnico e de negócios no relacionamento com Visa, Mastercard, Elo e Amex.",
    items: [
      "Leitura e interpretação de releases",
      "Relacionamento técnico com bandeiras",
      "Suporte à implementação de novas regras",
      "Gestão de roadmap regulatório",
    ],
    cta: { label: "Falar com especialista", href: "mailto:vsugamele@gmail.com" },
    highlight: false,
  },
  {
    icon: TrendingUp,
    title: "Análise de Custos & Otimização",
    desc: "Identificação de oportunidades de redução de custo em intercâmbio. Análise de portfólio e estratégias de otimização de tarifas.",
    items: [
      "Diagnóstico do portfólio atual",
      "Identificação de perdas em intercâmbio",
      "Estratégias de otimização de tarifas",
      "Relatórios executivos e dashboards",
    ],
    cta: { label: "Solicitar análise", href: "mailto:vsugamele@gmail.com" },
    highlight: false,
  },
  {
    icon: Layers,
    title: "Implementação de Projetos",
    desc: "Liderança técnica em projetos estratégicos de pagamentos: 3DS, QR Code, Tokenização, ABU, Marketplace, Split de Pagamento e Emissão.",
    items: [
      "3DS 2.0 / Visa Secure / Mastercard ID Check",
      "QR Code (Pix e QR proprietário)",
      "Tokenização e ABU",
      "Marketplace e Split de Pagamento",
    ],
    cta: { label: "Ver portfólio", href: "/sobre" },
    highlight: false,
  },
  {
    icon: Users,
    title: "Treinamento & Capacitação",
    desc: "Formação de equipes técnicas e de negócios em meios de pagamento. ISO 8583, EMV, PCI DSS, fluxo de autorização e liquidação.",
    items: [
      "Treinamento em ISO 8583 e EMV",
      "Fluxo end-to-end de pagamentos",
      "PCI DSS e segurança em cartões",
      "Workshops customizados por área",
    ],
    cta: { label: "Solicitar treinamento", href: "mailto:vsugamele@gmail.com" },
    highlight: false,
  },
  {
    icon: Bell,
    title: "Inteligência Regulatória",
    desc: "Monitoramento contínuo de releases e atualizações das bandeiras. Alertas proativos sobre mudanças que impactam o seu negócio.",
    items: [
      "Acompanhamento de releases trimestrais",
      "Alertas de mudanças regulatórias",
      "Resumos executivos por bandeira",
      "Análise de impacto nos sistemas",
    ],
    cta: { label: "Saber mais", href: "mailto:vsugamele@gmail.com" },
    highlight: false,
  },
];

export const metadata = {
  title: "Soluções — VS Payments",
  description: "Soluções especializadas em meios de pagamento: simulador de intercâmbio, consultoria em bandeiras, análise de custos, implementação de projetos e treinamento.",
};

export default function SolucoesPage() {
  return (
    <main className="bg-background pb-24">
      {/* Header */}
      <section
        className="dot-grid relative"
        style={{
          background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(37,99,235,0.18) 0%, transparent 70%)",
          padding: "5rem 1.5rem 4rem",
          textAlign: "center",
          borderBottom: "1px solid #0f172a",
        }}
      >
        <div className="mx-auto max-w-3xl">
          <p className="section-eyebrow mb-4">O que ofereço</p>
          <h1 className="font-bold text-white mb-4" style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)" }}>
            Soluções em Meios de Pagamento
          </h1>
          <p style={{ color: "var(--muted-foreground)", fontSize: "1rem", lineHeight: 1.75 }}>
            Do cálculo de intercâmbio até a estratégia com bandeiras. Ferramentas técnicas e
            consultoria especializada para adquirentes, emissores e bandeiras.
          </p>
        </div>
      </section>

      {/* Solutions grid */}
      <section className="mx-auto max-w-7xl px-6 pt-16">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {SOLUTIONS.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.title}
                className="card-hover flex flex-col"
                style={{
                  background: s.highlight ? "rgba(37,99,235,0.07)" : "#0a1120",
                  border: s.highlight ? "1px solid rgba(37,99,235,0.3)" : "1px solid #0f172a",
                  borderRadius: "1rem",
                  padding: "2rem",
                  position: "relative",
                }}
              >
                {s.highlight && (
                  <div
                    style={{
                      position: "absolute",
                      top: "-1px",
                      left: "1.5rem",
                      right: "1.5rem",
                      height: "2px",
                      background: "linear-gradient(90deg, transparent, #3b82f6, transparent)",
                      borderRadius: "0 0 2px 2px",
                    }}
                  />
                )}

                {/* Icon */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: 48,
                    width: 48,
                    borderRadius: "0.75rem",
                    background: "rgba(37,99,235,0.12)",
                    border: "1px solid rgba(37,99,235,0.2)",
                    marginBottom: "1.25rem",
                  }}
                >
                  <Icon size={22} style={{ color: "var(--code-text)" }} />
                </div>

                <h2 className="font-semibold text-white mb-2" style={{ fontSize: "1.05rem" }}>
                  {s.title}
                </h2>
                <p style={{ fontSize: "0.875rem", color: "var(--muted-foreground)", lineHeight: 1.65, marginBottom: "1.25rem" }}>
                  {s.desc}
                </p>

                {/* Items */}
                <ul className="space-y-1.5 flex-1">
                  {s.items.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle2 size={13} style={{ color: "#22d3ee", marginTop: 2, flexShrink: 0 }} />
                      <span style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>{item}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <div className="mt-6 pt-5" style={{ borderTop: "1px solid var(--border)" }}>
                  <Link
                    href={s.cta.href}
                    className="flex items-center gap-1.5"
                    style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--primary)" }}
                  >
                    {s.cta.label}
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="mx-auto max-w-3xl px-6 pt-20 text-center">
        <h2 className="font-bold text-white mb-3" style={{ fontSize: "1.5rem" }}>
          Precisa de algo personalizado?
        </h2>
        <p style={{ color: "var(--muted-foreground)", fontSize: "0.95rem", lineHeight: 1.7, marginBottom: "1.75rem" }}>
          Cada empresa tem um desafio único. Vamos conversar sobre o seu caso específico.
        </p>
        <a
          href="mailto:vsugamele@gmail.com"
          className="btn-primary inline-flex items-center gap-2"
        >
          Enviar mensagem
          <ArrowRight size={14} />
        </a>
      </section>
    </main>
  );
}
