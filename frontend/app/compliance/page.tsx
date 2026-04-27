import Link from "next/link";
import { ShieldCheck, Search, BarChart2, BookOpen, ChevronRight, AlertTriangle, CheckCircle2, Tag, AlertOctagon, Scale, GitCompare, CreditCard, Cpu, DollarSign, Shield, Crosshair, Bitcoin } from "lucide-react";

export const metadata = {
  title: "Compliance de Bandeiras — VS Payments",
  description: "Plataforma de compliance para adquirentes e emissores: programas VAMP, ECP, EFM, PED, MATCH, lookup de campos DE/PDS e calculadora de risco.",
};

const PILLARS = [
  {
    icon: Search,
    href: "/compliance/campos",
    title: "Lookup de Campos",
    subtitle: "DE / PDS / Tags",
    description: "Consulte qualquer Data Element do ISO 8583, campo PDS do IPM Mastercard ou Tag EMV. Descrição técnica, valores possíveis e impacto no intercâmbio.",
    color: "var(--primary)",
    bg: "rgba(37,99,235,0.08)",
    border: "rgba(37,99,235,0.2)",
  },
  {
    icon: BarChart2,
    href: "/compliance/risco",
    title: "Calculadora de Risco",
    subtitle: "VAMP · ECP · EFM · PED · PEF",
    description: "Insira suas métricas mensais e veja instantaneamente se seu portfólio está em risco de enquadramento em programas de monitoramento — com penalidades estimadas.",
    color: "#f59e0b",
    bg: "rgba(234,179,8,0.07)",
    border: "rgba(234,179,8,0.2)",
  },
  {
    icon: BookOpen,
    href: "/compliance/programas",
    title: "Diretório de Programas",
    subtitle: "Visa · Mastercard · Elo",
    description: "Referência completa dos programas de monitoramento: VAMP, ECP, EFM, PED, MATCH, BRAM, VIRP, MMP e mais. Thresholds, penalidades e estratégias de remediação.",
    color: "#a78bfa",
    bg: "rgba(139,92,246,0.08)",
    border: "rgba(139,92,246,0.2)",
  },
  {
    icon: Tag,
    href: "/compliance/mcc",
    title: "Tabela de MCCs",
    subtitle: "1.300+ códigos · Mastercard 2025",
    description: "Pesquise Merchant Category Codes por número, nome ou categoria. Inclui TCC, categoria ISO e dados da listagem oficial Mastercard de novembro 2025.",
    color: "#2dd4bf",
    bg: "rgba(20,184,166,0.07)",
    border: "rgba(20,184,166,0.2)",
  },
  {
    icon: CheckCircle2,
    href: "/compliance/tokenizacao",
    title: "DAF & Tokenização",
    subtitle: "VTS · Apple Pay · Liability Shift",
    description: "Simule cenários de Tokenização Visa e Digital Authentication Framework (DAF). Descubra quando sua transação recebe Liability Shift e Isenção de 3DS.",
    color: "#ec4899",
    bg: "rgba(236,72,153,0.08)",
    border: "rgba(236,72,153,0.2)",
  },
  {
    icon: AlertOctagon,
    href: "/compliance/match",
    title: "MATCH Pro Simulator",
    subtitle: "Risco & Onboarding",
    description: "Simule a API do MATCH Pro da Mastercard. Consulte códigos de razão de rescisão (Reason Codes) e previna o onboarding de Merchants de alto risco.",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.2)",
  },
  {
    icon: Scale,
    href: "/compliance/disputas",
    title: "Simulador Forense de Disputas",
    subtitle: "VROL · Mastercom · CE 3.0",
    description: "Explore o ciclo de vida interativo de um Chargeback (Representment, Arbitration). Use o checklist de Compelling Evidence para defender a Fraude Amigável.",
    color: "#8b5cf6",
    bg: "rgba(139,92,246,0.08)",
    border: "rgba(139,92,246,0.2)",
  },
  {
    icon: GitCompare,
    href: "/canais",
    title: "Matriz de Canais CP/CNP",
    subtitle: "Risco · Intercâmbio · Liability",
    description: "Compare todos os 13 canais de pagamento: Chip+PIN, Contactless, Fallback, E-com 3DS, MOTO, MIT e Network Tokens. Campos ISO 8583, ECI values e condições de Liability Shift.",
    color: "#818cf8",
    bg: "rgba(99,102,241,0.08)",
    border: "rgba(99,102,241,0.2)",
  },
  {
    icon: CreditCard,
    href: "/compliance/credenciais",
    title: "MIT & CIT Framework",
    subtitle: "Stored Credentials · SCOF · 7 Tipos",
    description: "Classifique qualquer transação como Merchant ou Cardholder Initiated. Veja os campos ISO 8583 obrigatórios por tipo (Recurring, Installment, Unscheduled, No-Show, Delayed) e os Reason Codes de risco.",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.07)",
    border: "rgba(245,158,11,0.2)",
  },
  {
    icon: Cpu,
    href: "/compliance/emv",
    title: "Decodificador EMV — TVR",
    subtitle: "Tag 95 · 5 Bytes · 40 Bits",
    description: "Cole o valor hex do Terminal Verification Results (Tag 95) e descubra bit a bit quais verificações EMV falharam: ODA, CVM, Script processing, PIN Try Limit e muito mais.",
    color: "#22d3ee",
    bg: "rgba(34,211,238,0.07)",
    border: "rgba(34,211,238,0.2)",
  },
  {
    icon: DollarSign,
    href: "/compliance/settlement",
    title: "Settlement & Clearing",
    subtitle: "D+0 · D+1 · D+2 · EFA",
    description: "Entenda o que acontece da autorização ao crédito do lojista: captura, IPM/Base II, liquidação via SPB e EFA. Referenciado nos manuais Mastercard, Visa Core Rules e Resolução BCB 150.",
    color: "#4ade80",
    bg: "rgba(74,222,128,0.07)",
    border: "rgba(74,222,128,0.2)",
  },
  {
    icon: ShieldCheck,
    href: "/compliance/3ds",
    title: "Matriz 3DS & ECI",
    subtitle: "Liability Shift · E-commerce",
    description: "Saiba exatamente quando o risco de fraude (RC 4837/10.4) sai do lojista e vai para o emissor. Simule fluxos Frictionless, Challenge e Attempts com os valores ECI da Visa e Mastercard.",
    color: "#4ade80",
    bg: "rgba(74,222,128,0.08)",
    border: "rgba(74,222,128,0.2)",
  },
  {
    icon: Shield,
    href: "/compliance/pci",
    title: "Calculadora de Escopo PCI",
    subtitle: "SAQ A · SAQ D · Req. 3 & 11",
    description: "Entenda os diferentes níveis de questionário do PCI DSS v4 (SAQ) com base na sua arquitetura (iFrame, API, Tokenização) e veja a redução drástica de requisitos e auditorias.",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.2)",
  },
  {
    icon: GitCompare,
    href: "/compliance/retentativas",
    title: "Matriz de Retentativas",
    subtitle: "Hard vs Soft Declines",
    description: "Pesquise por qualquer Response Code (DE 39) de recusa e descubra instantaneamente se a Bandeira proíbe re-tentar de imediato (Hard Decline), e as regras recomendadas de tolerância (Soft Decline) para o Adquirente não levar multa.",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.2)",
  },
  {
    icon: Crosshair,
    href: "/compliance/bram",
    title: "Auditor BRAM e QMAP",
    subtitle: "Risco Legal e Multas",
    description: "Cruze modelos de negócio (Apostas, Adulto, Tabaco) contra os pesados programas de BRAM e Registro Visa/Mastercard (multas partem de $100.000).",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.2)",
  },
  {
    icon: Bitcoin,
    href: "/compliance/quasicash",
    title: "Cripto & Quasi-cash (Funding)",
    subtitle: "Arquitetura e Fluxo de Dinheiro",
    description: "Engenharia sistêmica de transações de Cripto e E-wallets: Saiba usar Payment Account Funding (AFT) e Original Credit (OCT) e proteger MCCs de alto risco contra a lavagem de dinheiro.",
    color: "#eab308",
    bg: "rgba(234,179,8,0.08)",
    border: "rgba(234,179,8,0.2)",
  },
];

const PROGRAMS_PREVIEW = [
  { sigla: "VAMP", bandeira: "Visa", categoria: "Fraude", cor: "#60a5fa" },
  { sigla: "ECP", bandeira: "Mastercard", categoria: "Chargeback", cor: "#f87171" },
  { sigla: "EFM", bandeira: "Mastercard", categoria: "Fraude", cor: "#f87171" },
  { sigla: "PED", bandeira: "Elo", categoria: "Chargeback", cor: "#4ade80" },
  { sigla: "PEF", bandeira: "Elo", categoria: "Fraude", cor: "#4ade80" },
  { sigla: "MATCH", bandeira: "Mastercard", categoria: "Risco", cor: "#f87171" },
  { sigla: "BRAM", bandeira: "Mastercard", categoria: "Integridade", cor: "#f87171" },
  { sigla: "VIRP", bandeira: "Visa", categoria: "Integridade", cor: "#60a5fa" },
  { sigla: "QMAP", bandeira: "Mastercard", categoria: "MCC", cor: "#f87171" },
];

const BAND_COLOR: Record<string, string> = {
  Visa: "rgba(37,99,235,0.15)",
  Mastercard: "rgba(239,68,68,0.12)",
  Elo: "rgba(34,197,94,0.12)",
};
const BAND_TEXT: Record<string, string> = {
  Visa: "#60a5fa",
  Mastercard: "#f87171",
  Elo: "#4ade80",
};

export default function ComplianceLanding() {
  return (
    <main className="bg-background pb-24">
      {/* Hero */}
      <section
        className="dot-grid"
        style={{
          background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(139,92,246,0.12) 0%, transparent 70%)",
          padding: "5rem 1.5rem 4.5rem",
          textAlign: "center",
          borderBottom: "1px solid #0f172a",
        }}
      >
        <div className="mx-auto max-w-3xl">
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "rgba(139,92,246,0.1)",
              border: "1px solid rgba(139,92,246,0.25)",
              borderRadius: "9999px",
              padding: "0.35rem 1rem",
              marginBottom: "1.5rem",
            }}
          >
            <ShieldCheck size={13} style={{ color: "#a78bfa" }} />
            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#a78bfa", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Compliance de Bandeiras
            </span>
          </div>
          <h1 className="font-bold text-white mb-4" style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)" }}>
            Controle seu risco antes que a bandeira controle você
          </h1>
          <p style={{ color: "var(--muted-foreground)", fontSize: "1rem", lineHeight: 1.8, maxWidth: 580, margin: "0 auto 2rem" }}>
            Plataforma técnica de referência para adquirentes e emissores: programas de monitoramento,
            campos ISO 8583 / IPM e calculadora de enquadramento em penalidades.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/compliance/risco" className="btn-primary inline-flex items-center gap-2">
              <BarChart2 size={14} />
              Calcular Risco
            </Link>
            <Link href="/compliance/campos" className="btn-outline inline-flex items-center gap-2">
              <Search size={14} />
              Buscar Campo
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 pt-14">
        {/* 3 Pillars */}
        <p className="section-eyebrow mb-6">Ferramentas</p>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 mb-16">
          {PILLARS.map((p) => {
            const Icon = p.icon;
            return (
              <Link
                key={p.href}
                href={p.href}
                className="card-hover group flex flex-col"
                style={{
                  background: p.bg,
                  border: `1px solid ${p.border}`,
                  borderRadius: "1.25rem",
                  padding: "2rem",
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "0.75rem",
                    background: p.bg,
                    border: `1px solid ${p.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "1.25rem",
                  }}
                >
                  <Icon size={20} style={{ color: p.color }} />
                </div>
                <p style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: p.color, marginBottom: "0.4rem" }}>
                  {p.subtitle}
                </p>
                <h2 className="font-bold text-white mb-3" style={{ fontSize: "1.1rem" }}>
                  {p.title}
                </h2>
                <p style={{ fontSize: "0.85rem", color: "var(--muted-foreground)", lineHeight: 1.7, flex: 1 }}>
                  {p.description}
                </p>
                <div className="flex items-center gap-1.5 mt-5" style={{ color: p.color, fontSize: "0.82rem", fontWeight: 600 }}>
                  Acessar <ChevronRight size={13} />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Programs quick-view */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <p className="section-eyebrow">Programas cobertos</p>
            <Link href="/compliance/programas" style={{ fontSize: "0.8rem", color: "var(--primary)", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
              Ver todos <ChevronRight size={12} />
            </Link>
          </div>
          <div className="flex flex-wrap gap-3">
            {PROGRAMS_PREVIEW.map((prog) => (
              <Link
                key={prog.sigla}
                href={`/compliance/programas#${prog.sigla.toLowerCase()}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  background: "var(--code-bg)",
                  border: "1px solid #0f172a",
                  borderRadius: "0.75rem",
                  padding: "0.6rem 1rem",
                  transition: "border-color 0.2s",
                  cursor: "pointer",
                }}
                className="card-hover"
              >
                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--foreground)" }}>{prog.sigla}</span>
                <span
                  style={{
                    fontSize: "0.65rem",
                    fontWeight: 600,
                    padding: "0.15rem 0.5rem",
                    borderRadius: "9999px",
                    background: BAND_COLOR[prog.bandeira],
                    color: BAND_TEXT[prog.bandeira],
                  }}
                >
                  {prog.bandeira}
                </span>
                <span style={{ fontSize: "0.7rem", color: "var(--border)" }}>{prog.categoria}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Why it matters */}
        <div
          style={{
            background: "#050b18",
            border: "1px solid #0f172a",
            borderRadius: "1.25rem",
            padding: "2.5rem",
            marginBottom: "3rem",
          }}
        >
          <p className="section-eyebrow mb-4">Por que isso importa</p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[
              {
                icon: AlertTriangle,
                cor: "#f59e0b",
                titulo: "Penalidades acumulam rápido",
                texto: "Um único mês em Excessive VAMP pode custar US$ 10.000-30.000. ECP por 6 meses pode chegar a US$ 60.000 por MID.",
              },
              {
                icon: CheckCircle2,
                cor: "#4ade80",
                titulo: "Remediação exige dados corretos",
                texto: "Campos como DE 22, DE 48.61, DE 60.8 e Tag 89 determinam liability shift. Envio incorreto cancela proteção.",
              },
              {
                icon: AlertTriangle,
                cor: "#f87171",
                titulo: "MCC errado gera intercâmbio errado",
                texto: "QMAP e VIRP auditam continuamente. MCC incorreto afeta intercâmbio, benefícios e conformidade regulatória.",
              },
              {
                icon: CheckCircle2,
                cor: "#60a5fa",
                titulo: "MATCH é permanente por 5 anos",
                texto: "Merchant listado não pode ser credenciado por nenhum adquirente. Adquirente que ignora o MATCH responde pelas perdas.",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.titulo} className="flex gap-3" style={{ padding: "1rem", background: "var(--code-bg)", border: "1px solid #0f172a", borderRadius: "0.875rem" }}>
                  <Icon size={18} style={{ color: item.cor, flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <p style={{ fontWeight: 700, color: "var(--foreground)", fontSize: "0.875rem", marginBottom: "0.25rem" }}>{item.titulo}</p>
                    <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", lineHeight: 1.6 }}>{item.texto}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA bottom */}
        <div
          style={{
            background: "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(139,92,246,0.08) 0%, transparent 70%)",
            border: "1px solid rgba(139,92,246,0.15)",
            borderRadius: "1.25rem",
            padding: "3rem",
            textAlign: "center",
          }}
        >
          <ShieldCheck size={32} style={{ color: "#a78bfa", margin: "0 auto 1rem" }} />
          <h2 className="font-bold text-white mb-3" style={{ fontSize: "1.4rem" }}>
            Precisa de suporte em compliance de bandeiras?
          </h2>
          <p style={{ color: "var(--muted-foreground)", fontSize: "0.9rem", marginBottom: "1.75rem", maxWidth: 480, margin: "0 auto 1.75rem" }}>
            Consultoria especializada em VAMP, ECP/EFM, programas Elo e estruturação de processos de monitoramento para adquirentes.
          </p>
          <Link href="/solucoes" className="btn-primary inline-flex items-center gap-2">
            Ver Soluções de Consultoria
            <ChevronRight size={13} />
          </Link>
        </div>
      </div>
    </main>
  );
}
