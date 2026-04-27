import Link from "next/link";
import {
  MapPin,
  Mail,
  ExternalLink,
  GraduationCap,
  Briefcase,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const EXPERIENCE = [
  {
    role: "Head de Bandeiras",
    company: "EcommIT Integrated Solutions",
    period: "Out 2023 – Presente",
    duration: "2+ anos",
    desc: "Liderança no relacionamento técnico e de negócios com bandeiras. Responsável por releases, novos produtos, estratégia de intercâmbio e integração de parceiros.",
    tags: ["Visa", "Mastercard", "Elo", "Amex", "Releases"],
  },
  {
    role: "Especialista de Operações",
    company: "Bandeira Elo",
    period: "Ago 2020 – Out 2023",
    duration: "3 anos",
    desc: "Multiplicador das soluções e serviços Elo para adquirentes. Desenvolvimento do novo Portal Elo, monitoramento de autorização e liquidação, facilitador entre Emissores, Credenciadores e Processadoras.",
    tags: ["Elo", "Qlik Sense", "Tableau", "Autorização", "Liquidação"],
  },
  {
    role: "Analista Sênior / Coordenador de Liquidação",
    company: "Getnet",
    period: "Set 2017 – Out 2020",
    duration: "3 anos",
    desc: "Responsável pelo desenvolvimento de projetos de Release das Bandeiras (Elo, Visa, Mastercard, Amex, Hipercard). Projetos: QR Code, 3DS, ABU, MarketPlace, Token, Emissão, Consulta BIN.",
    tags: ["3DS", "QR Code", "ABU", "Token", "Releases"],
  },
  {
    role: "Analista de Produção / Negócios",
    company: "Verifone / American Express",
    period: "Ago 2009 – Set 2017",
    duration: "8 anos",
    desc: "Homologação de implementações, criação do processo EDI, implementação de monitorias de autorização/captura. Participação na migração dos servidores globais da Amex para o Bradesco (2014) e no projeto Multivan.",
    tags: ["Amex", "EDI", "ISO 8583", "Autorização"],
  },
];

const SKILLS = [
  { category: "Protocolos & Padrões", items: ["ISO 8583", "EMV Contactless", "PCI DSS", "PIN Security", "3DS 2.0"] },
  { category: "Produtos", items: ["Crédito / Débito", "Pré-pago", "Voucher", "QR Code", "Tokenização", "ABU"] },
  { category: "Processos", items: ["Autorização", "Liquidação", "Chargeback", "Prevenção a Fraudes", "Split de Pagamento"] },
  { category: "Bandeiras", items: ["Visa", "Mastercard", "Elo", "American Express", "Maestro", "Hipercard"] },
  { category: "Ferramentas", items: ["Qlik Sense", "Tableau", "DBeaver", "Hue"] },
  { category: "Gestão", items: ["Projetos", "Treinamento de Equipes", "Elaboração de Manuais", "Relatórios Executivos"] },
];

export const metadata = {
  title: "Sobre — Vinícius Sugamele · VS Payments",
  description: "Head de Bandeiras com 16+ anos de experiência em meios de pagamento: Visa, Mastercard, Elo, Amex. Especialista em intercâmbio, autorização, liquidação e releases.",
};

export default function SobrePage() {
  return (
    <main className="bg-background pb-24">

      {/* ── Hero bio ──────────────────────────────────────────────────────────── */}
      <section
        className="dot-grid"
        style={{
          background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(37,99,235,0.15) 0%, transparent 70%)",
          borderBottom: "1px solid #0f172a",
          padding: "5rem 1.5rem 4rem",
        }}
      >
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-[auto_1fr] items-start">
            {/* Avatar */}
            <div
              style={{
                width: 100,
                height: 100,
                borderRadius: "1.25rem",
                background: "linear-gradient(135deg, #1e3a5f, #2563eb)",
                border: "2px solid rgba(37,99,235,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2.5rem",
                fontWeight: 800,
                color: "#93c5fd",
                flexShrink: 0,
              }}
            >
              VS
            </div>

            {/* Info */}
            <div>
              <p className="section-eyebrow mb-3">Especialista em Meios de Pagamento</p>
              <h1
                className="font-bold text-white mb-2"
                style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)", lineHeight: 1.1 }}
              >
                Vinícius Sugamele
              </h1>
              <p className="mb-5" style={{ fontSize: "1rem", color: "var(--muted-foreground)", fontStyle: "italic" }}>
                "A Inovação em pagamentos é a ponte entre o presente e o futuro do mercado."
              </p>

              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-1.5" style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
                  <MapPin size={13} style={{ color: "var(--primary)" }} />
                  São Paulo, Brasil
                </div>
                <a
                  href="mailto:vsugamele@gmail.com"
                  className="flex items-center gap-1.5 hover:text-blue-400 transition-colors"
                  style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}
                >
                  <Mail size={13} style={{ color: "var(--primary)" }} />
                  vsugamele@gmail.com
                </a>
                <a
                  href="https://www.linkedin.com/in/vinicius-sugamele-41136617/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-blue-400 transition-colors"
                  style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}
                >
                  <ExternalLink size={13} style={{ color: "var(--primary)" }} />
                  LinkedIn
                </a>
              </div>

              <p style={{ fontSize: "0.95rem", color: "var(--muted-foreground)", lineHeight: 1.75, maxWidth: 680 }}>
                Head de Bandeiras na <strong style={{ color: "var(--muted-foreground)" }}>EcommIT Integrated Solutions</strong> com
                mais de 16 anos de experiência em meios de pagamento. Passagem por Verifone/American Express,
                Getnet e Bandeira Elo. Especialista em autorização, liquidação, chargeback, prevenção a fraudes
                e relacionamento técnico com bandeiras. MBA em Liderança, Inovação e Gestão 3.0 pela PUCRS.
              </p>

              <div className="flex flex-wrap gap-3 mt-6">
                <a href="mailto:vsugamele@gmail.com" className="btn-primary inline-flex items-center gap-2">
                  Entrar em contato
                  <ArrowRight size={14} />
                </a>
                <a
                  href="https://www.linkedin.com/in/vinicius-sugamele-41136617/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline inline-flex items-center gap-2"
                >
                  <ExternalLink size={14} />
                  Ver LinkedIn
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6">

        {/* ── Experience ─────────────────────────────────────────────────────── */}
        <section className="pt-16">
          <div className="flex items-center gap-3 mb-10">
            <div
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                height: 36, width: 36, borderRadius: "0.5rem",
                background: "rgba(37,99,235,0.12)", border: "1px solid rgba(37,99,235,0.2)",
              }}
            >
              <Briefcase size={16} style={{ color: "var(--code-text)" }} />
            </div>
            <h2 className="font-bold text-white" style={{ fontSize: "1.25rem" }}>Experiência</h2>
          </div>

          <div className="space-y-5">
            {EXPERIENCE.map((e, i) => (
              <div
                key={i}
                style={{
                  background: "var(--code-bg)",
                  border: "1px solid #0f172a",
                  borderRadius: "1rem",
                  padding: "1.75rem",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {i === 0 && (
                  <div
                    style={{
                      position: "absolute", top: 0, left: 0, right: 0,
                      height: 2,
                      background: "linear-gradient(90deg, #2563eb, #7c3aed)",
                    }}
                  />
                )}
                <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-semibold text-white" style={{ fontSize: "1rem" }}>{e.role}</h3>
                    <p style={{ fontSize: "0.875rem", color: "var(--primary)", marginTop: "0.125rem" }}>{e.company}</p>
                  </div>
                  <div className="text-right">
                    <p style={{ fontSize: "0.78rem", color: "var(--border)" }}>{e.period}</p>
                    <p style={{ fontSize: "0.75rem", color: "#1e3a5f", marginTop: "0.125rem" }}>{e.duration}</p>
                  </div>
                </div>
                <p style={{ fontSize: "0.875rem", color: "var(--muted-foreground)", lineHeight: 1.65, marginBottom: "1rem" }}>
                  {e.desc}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {e.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        padding: "0.2rem 0.625rem",
                        borderRadius: "0.375rem",
                        fontSize: "0.7rem",
                        fontWeight: 500,
                        background: "#0d1117",
                        border: "1px solid #1e293b",
                        color: "var(--border)",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Education ──────────────────────────────────────────────────────── */}
        <section className="pt-14">
          <div className="flex items-center gap-3 mb-8">
            <div
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                height: 36, width: 36, borderRadius: "0.5rem",
                background: "rgba(37,99,235,0.12)", border: "1px solid rgba(37,99,235,0.2)",
              }}
            >
              <GraduationCap size={16} style={{ color: "var(--code-text)" }} />
            </div>
            <h2 className="font-bold text-white" style={{ fontSize: "1.25rem" }}>Formação Acadêmica</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              {
                title: "MBA — Liderança, Inovação e Gestão 3.0",
                institution: "PUCRS",
                year: "2020",
              },
              {
                title: "Gestão da Tecnologia da Informação",
                institution: "UNIP — Universidade Paulista",
                year: "2011",
              },
            ].map((ed) => (
              <div
                key={ed.title}
                style={{
                  background: "var(--code-bg)",
                  border: "1px solid #0f172a",
                  borderRadius: "0.875rem",
                  padding: "1.5rem",
                }}
              >
                <p className="font-semibold text-white mb-1" style={{ fontSize: "0.9rem" }}>{ed.title}</p>
                <p style={{ fontSize: "0.8rem", color: "var(--primary)" }}>{ed.institution}</p>
                <p style={{ fontSize: "0.75rem", color: "var(--border)", marginTop: "0.25rem" }}>Conclusão: {ed.year}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Skills ─────────────────────────────────────────────────────────── */}
        <section className="pt-14">
          <h2 className="font-bold text-white mb-8" style={{ fontSize: "1.25rem" }}>
            Competências
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SKILLS.map((s) => (
              <div
                key={s.category}
                style={{
                  background: "var(--code-bg)",
                  border: "1px solid #0f172a",
                  borderRadius: "0.875rem",
                  padding: "1.5rem",
                }}
              >
                <p className="section-eyebrow mb-4">{s.category}</p>
                <ul className="space-y-1.5">
                  {s.items.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <CheckCircle2 size={12} style={{ color: "#22d3ee", flexShrink: 0 }} />
                      <span style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ── Languages ──────────────────────────────────────────────────────── */}
        <section className="pt-14">
          <h2 className="font-bold text-white mb-6" style={{ fontSize: "1.25rem" }}>Idiomas</h2>
          <div className="flex flex-wrap gap-4">
            {[
              { lang: "Português", level: "Nativo" },
              { lang: "Inglês",    level: "Avançado" },
              { lang: "Espanhol",  level: "Intermediário" },
            ].map((l) => (
              <div
                key={l.lang}
                style={{
                  padding: "1rem 1.5rem",
                  background: "var(--code-bg)",
                  border: "1px solid #0f172a",
                  borderRadius: "0.75rem",
                  textAlign: "center",
                }}
              >
                <p className="font-semibold text-white" style={{ fontSize: "0.9rem" }}>{l.lang}</p>
                <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", marginTop: "0.25rem" }}>{l.level}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Contact CTA ────────────────────────────────────────────────────── */}
        <section className="pt-16">
          <div
            style={{
              background: "linear-gradient(135deg, rgba(37,99,235,0.1), rgba(124,58,237,0.07))",
              border: "1px solid rgba(37,99,235,0.18)",
              borderRadius: "1.25rem",
              padding: "2.5rem",
              textAlign: "center",
            }}
          >
            <h2 className="font-bold text-white mb-3" style={{ fontSize: "1.4rem" }}>
              Disponível para novos projetos
            </h2>
            <p style={{ color: "var(--muted-foreground)", fontSize: "0.95rem", maxWidth: 460, margin: "0 auto 1.75rem", lineHeight: 1.7 }}>
              Consultoria, implementação, treinamento ou uma conversa técnica — estou disponível.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <a href="mailto:vsugamele@gmail.com" className="btn-primary inline-flex items-center gap-2">
                <Mail size={14} />
                vsugamele@gmail.com
              </a>
              <Link href="/simulador" className="btn-outline inline-flex items-center gap-2">
                Testar o Simulador
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
