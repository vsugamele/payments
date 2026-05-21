import Link from "next/link";
import TermTooltip from "@/components/TermTooltip";
import {
  ArrowRight,
  Calculator,
  BookOpen,
  ShieldCheck,
  Users,
  Zap,
  ChevronRight,
  Route,
  Map,
  LayoutTemplate,
  BarChart2,
  BookMarked,
  Sparkles,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  FileText,
} from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────

// ─── Hub ──────────────────────────────────────────────────────────────────────

const HUB = [
  {
    step: "01",
    category: "Aprenda",
    color: "#6366f1",
    bg: "rgba(99,102,241,0.08)",
    border: "rgba(99,102,241,0.2)",
    tools: [
      { icon: TrendingDown,  label: "Fluxo de Dinheiro",     href: "/mdr",       desc: "MDR → intercâmbio → emissor" },
      { icon: AlertTriangle, label: "Chargeback",            href: "/chargeback",desc: "Ciclo de disputa e reason codes" },
      { icon: BookOpen,      label: "Trilhas",               href: "/trilhas",   desc: "Do básico ao Visa Deep Dive" },
      { icon: Map,           label: "Mapa do Conhecimento",  href: "/mapa",      desc: "39 conceitos interligados" },
      { icon: Route,         label: "Jornada da Transação",  href: "/jornada",   desc: "POS → clearing → settlement" },
      { icon: BookMarked,    label: "Glossário",             href: "/glossario", desc: "Termos e siglas" },
    ],
  },
  {
    step: "02",
    category: "Explore",
    color: "#0ea5e9",
    bg: "rgba(14,165,233,0.08)",
    border: "rgba(14,165,233,0.2)",
    tools: [
      { icon: Calculator,    label: "Simulador",             href: "/simulador",   desc: "Intercâmbio em tempo real" },
      { icon: BarChart2,     label: "Matriz de Intercâmbio", href: "/matrix",      desc: "Decisão de taxa passo a passo" },
      { icon: LayoutTemplate,label: "Arquitetura",           href: "/arquitetura", desc: "Tour guiado Visa × MC" },
      { icon: BarChart2,     label: "Comparativo",           href: "/comparativo", desc: "BASE II vs IPM lado a lado" },
      { icon: ShieldCheck,   label: "Regras & CP 522",       href: "/comparativo/facilitadores", desc: "Facilitadores, split e regulação" },
    ],
  },
  {
    step: "03",
    category: "Consulte",
    color: "#10b981",
    bg: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.2)",
    tools: [
      { icon: ShieldCheck,   label: "Compliance",            href: "/compliance", desc: "VAMP, ECP, 3DS, disputas" },
      { icon: DollarSign,    label: "MCBS / Scheme Fees",    href: "/mcbs",       desc: "Tarifas de bandeira consolidadas" },
      { icon: BookOpen,      label: "Consultas",             href: "/consultas",  desc: "Lookup de campos e regras" },
      { icon: BookOpen,      label: "Acervo Normativo",      href: "/acervo",     desc: "Docs oficiais compilados" },
      { icon: FileText,      label: "Artigos",               href: "/artigos",    desc: "Técnico, educacional e regulatório" },
    ],
  },
];

const STATS = [
  { value: "16+",    label: "Anos de experiência"    },
  { value: "4",      label: "Bandeiras dominadas"    },
  { value: "15+",    label: "Projetos estratégicos"  },
  { value: "3",      label: "Adquirentes / Bandeiras" },
];

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Plataforma de Compliance",
    desc: (
      <>
        <TermTooltip term="VAMP" definition="Visa Acquirer Monitoring Program: programa global para monitoramento de fraudes." />, ECP, EFM, PED e mais: calculadora de risco, diretório de programas e lookup de campos DE/PDS.
      </>
    ),
    href: "/compliance",
    badge: "Plataforma",
  },
  {
    icon: Calculator,
    title: "Simulador de Intercâmbio",
    desc: (
      <>
        Calcule <TermTooltip term="Intercâmbio" definition="Taxa base paga pelo Adquirente ao Banco Emissor para custear os benefícios e riscos do cartão." /> em tempo real para Visa, Mastercard e Maestro. Motor com cascata de regras e debug completo.
      </>
    ),
    href: "/simulador",
    badge: "Ferramenta",
  },
  {
    icon: BookOpen,
    title: "Acervo Normativo",
    desc: (
      <>
        O 'Cérebro Funcional' da arquitetura. Acesse a biblioteca normativa que compila regras da Visa, Mastercard e <TermTooltip term="ISO 8583" definition="Padrão internacional de mensageria para sistemas que trocam transações eletrônicas com cartão." />.
      </>
    ),
    href: "/acervo",
    badge: "Biblioteca",
  },
  {
    icon: Route,
    title: "Jornada da Transação",
    desc: (
      <>
        Mapa visual interativo do ciclo completo de um pagamento: da apresentação do cartão até o <TermTooltip term="Settlement" definition="Transferência financeira efetiva (liquidação) entre Emissor, Bandeira e Adquirente." /> e o ciclo de <TermTooltip term="Disputa" definition="Processo iniciado quando o portador do cartão não reconhece uma compra (podendo gerar um Chargeback)." />.
      </>
    ),
    href: "/jornada",
    badge: "Educacional",
  },
];

const TAG_COLORS: Record<string, { bg: string; text: string }> = {
  "Técnico":     { bg: "rgba(37,99,235,0.15)",  text: "#60a5fa" },
  "Educacional": { bg: "rgba(34,197,94,0.12)",  text: "#4ade80" },
  "Regulatório": { bg: "rgba(234,179,8,0.12)",  text: "#fbbf24" },
  "Segurança":   { bg: "rgba(239,68,68,0.12)",  text: "#f87171" },
};

const ARTICLES_PREVIEW = [
  {
    tag: "Técnico",
    title: "Intercâmbio: Guia Completo para Adquirentes e Sub-adquirentes",
    excerpt:
      "A cascata de 5 decisões que define qual taxa é aplicada, por que ela pode mudar silenciosamente (downgrade) e como verificar se você está pagando o correto.",
    date: "28 Abr 2026",
    readTime: "12 min",
    featured: true,
    href: "/artigos/intercambio-guia-completo",
  },
  {
    tag: "Educacional",
    title: "Passo a Passo de uma Transação de Pagamento",
    excerpt:
      "Do credenciamento do lojista até a liquidação: fluxo completo de uma transação Mastercard, com ISO 8583, EMV, clearing e chargeback explicados do zero.",
    date: "8 Fev 2026",
    readTime: "15 min",
    featured: false,
    href: "/artigos/passo-a-passo-transacao",
  },
  {
    tag: "Técnico",
    title: "Visa VDCAP e Mastercard TAF/SCOF: A engenharia da autenticação silenciosa com token",
    excerpt:
      "Como Visa e Mastercard implementam autenticação silenciosa baseada em token, dispensando 3DS sem abrir mão da segurança.",
    date: "12 Abr 2025",
    readTime: "12 min",
    featured: false,
    href: "/artigos/vdcap-taf-scof",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <main style={{ background: "#030711" }}>

      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <section
        className="dot-grid relative overflow-hidden"
        style={{ minHeight: "88vh", display: "flex", alignItems: "center" }}
      >
        {/* Glow bg */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(37,99,235,0.22) 0%, transparent 70%), " +
              "radial-gradient(ellipse 40% 40% at 85% 40%, rgba(124,58,237,0.12) 0%, transparent 60%)",
            pointerEvents: "none",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-6 py-24 text-center">
          {/* Eyebrow */}
          <div className="flex justify-center mb-6">
            <span className="tag tag-blue">
              <Zap size={10} />
              Especialista em Meios de Pagamento · São Paulo, Brasil
            </span>
          </div>

          {/* Headline */}
          <h1
            className="font-bold leading-tight tracking-tight"
            style={{ fontSize: "clamp(2.25rem, 5vw, 3.75rem)", maxWidth: 780, margin: "0 auto 1.5rem" }}
          >
            A Inovação em Pagamentos{" "}
            <span className="gradient-text">Começa com os Dados Certos</span>
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: "clamp(1rem, 1.8vw, 1.2rem)",
              color: "var(--muted-foreground)",
              maxWidth: 600,
              margin: "0 auto 2.5rem",
              lineHeight: 1.7,
            }}
          >
            Plataforma de inteligência em intercâmbio e regulatório para bandeiras,
            adquirentes e emissores. Motor de cálculo em tempo real + consultoria especializada.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/simulador" className="btn-primary flex items-center gap-2">
              Acessar o Simulador
              <ArrowRight size={15} />
            </Link>
            <Link href="/solucoes" className="btn-outline flex items-center gap-2">
              Ver Soluções
              <ChevronRight size={14} />
            </Link>
          </div>

          {/* Brands */}
          <div className="flex flex-wrap justify-center items-center gap-6 mt-14">
            {["Visa", "Mastercard", "Elo", "American Express", "Maestro"].map((b) => (
              <span
                key={b}
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  color: "var(--border)",
                  textTransform: "uppercase",
                }}
              >
                {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────────────────────── */}
      <section style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid #0f172a", background: "#050b18" }}>
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p
                  className="gradient-text font-bold"
                  style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", lineHeight: 1 }}
                >
                  {s.value}
                </p>
                <p className="mt-1.5 text-xs" style={{ color: "var(--muted-foreground)" }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Hub ───────────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-center mb-14">
          <div className="flex justify-center mb-4">
            <span className="tag tag-blue">
              <Sparkles size={10} />
              Por onde começar
            </span>
          </div>
          <h2
            className="font-bold text-white"
            style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)" }}
          >
            Tudo que você precisa, em três movimentos
          </h2>
          <p className="mt-3 text-sm" style={{ color: "var(--muted-foreground)", maxWidth: 500, margin: "0.75rem auto 0" }}>
            Trilhas de aprendizado, ferramentas interativas e referência técnica — integrados em uma só plataforma.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {HUB.map((col) => (
            <div
              key={col.step}
              style={{
                background: col.bg,
                border: `1px solid ${col.border}`,
                borderRadius: "1.25rem",
                padding: "1.75rem",
              }}
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-5">
                <span
                  style={{
                    fontSize: "0.65rem",
                    fontWeight: 800,
                    letterSpacing: "0.15em",
                    color: col.color,
                    background: `${col.color}15`,
                    border: `1px solid ${col.color}30`,
                    borderRadius: "999px",
                    padding: "0.25rem 0.6rem",
                  }}
                >
                  {col.step}
                </span>
                <h3
                  className="font-bold text-white"
                  style={{ fontSize: "1.05rem" }}
                >
                  {col.category}
                </h3>
              </div>

              {/* Tool list */}
              <div className="space-y-1.5">
                {col.tools.map((t) => {
                  const Icon = t.icon;
                  return (
                    <Link
                      key={t.href}
                      href={t.href}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all hover:bg-white/5 group"
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "0.5rem",
                          background: `${col.color}15`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Icon size={14} style={{ color: col.color }} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-white leading-none mb-0.5">
                          {t.label}
                        </div>
                        <div
                          className="text-xs truncate"
                          style={{ color: "var(--muted-foreground)" }}
                        >
                          {t.desc}
                        </div>
                      </div>
                      <ChevronRight
                        size={13}
                        className="ml-auto shrink-0 opacity-0 group-hover:opacity-60 transition-opacity"
                        style={{ color: col.color }}
                      />
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── About teaser ──────────────────────────────────────────────────────── */}
      <section
        style={{
          background: "#050b18",
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid #0f172a",
        }}
      >
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 items-center">
            {/* Text */}
            <div>
              <p className="section-eyebrow mb-4">Quem está por trás</p>
              <h2
                className="font-bold text-white mb-5"
                style={{ fontSize: "clamp(1.4rem, 2.5vw, 2rem)" }}
              >
                Vinícius Sugamele
              </h2>
              <p style={{ fontSize: "0.95rem", color: "var(--muted-foreground)", lineHeight: 1.75, marginBottom: "1rem" }}>
                Head de Bandeiras na EcommIT Integrated Solutions, com mais de 16 anos de experiência
                em meios de pagamento. Passagem por Verifone/Amex, Getnet e Bandeira Elo.
              </p>
              <p style={{ fontSize: "0.95rem", color: "var(--muted-foreground)", lineHeight: 1.75 }}>
                Especialista em autorização, liquidação, chargeback, prevenção a fraudes e
                relacionamento com bandeiras (Visa, Mastercard, Elo, Amex). MBA em Liderança
                e Inovação pela PUCRS.
              </p>
              <div className="mt-8">
                <Link href="/sobre" className="btn-outline inline-flex items-center gap-2">
                  Conheça minha trajetória
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>

            {/* Expertise chips */}
            <div className="flex flex-wrap gap-2">
              {[
                "ISO 8583", "EMV Contactless", "PCI DSS", "3DS / Visa Secure",
                "Chargeback", "Liquidação", "Autorização", "Prevenção a Fraudes",
                "QR Code", "Tokenização", "ABU", "Marketplace", "Split de Pagamento",
                "Releases de Bandeiras", "Consultoria Técnica", "Treinamento de Equipes",
              ].map((skill) => (
                <span
                  key={skill}
                  style={{
                    padding: "0.35rem 0.75rem",
                    borderRadius: "0.375rem",
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    background: "var(--code-bg)",
                    border: "1px solid #0f172a",
                    color: "var(--muted-foreground)",
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Articles preview ──────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="section-eyebrow mb-3">Conteúdo</p>
            <h2 className="font-bold text-white" style={{ fontSize: "clamp(1.4rem, 2.5vw, 2rem)" }}>
              Últimos artigos
            </h2>
          </div>
          <Link
            href="/artigos"
            className="hidden sm:flex items-center gap-1.5 text-sm font-semibold"
            style={{ color: "var(--primary)" }}
          >
            Ver todos <ChevronRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {ARTICLES_PREVIEW.map((a) => {
            const tc = TAG_COLORS[a.tag] ?? { bg: "rgba(37,99,235,0.15)", text: "#60a5fa" };
            return (
              <Link
                key={a.title}
                href={a.href}
                className="card-hover group flex flex-col"
                style={{
                  background: a.featured ? "rgba(37,99,235,0.06)" : "var(--code-bg)",
                  border: a.featured ? "1px solid rgba(37,99,235,0.22)" : "1px solid #0f172a",
                  borderRadius: "1rem",
                  padding: "1.75rem",
                  position: "relative",
                }}
              >
                {a.featured && (
                  <span
                    style={{
                      position: "absolute",
                      top: "1rem",
                      right: "1rem",
                      fontSize: "0.6rem",
                      fontWeight: 800,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "#60a5fa",
                      background: "rgba(37,99,235,0.15)",
                      border: "1px solid rgba(37,99,235,0.25)",
                      borderRadius: "999px",
                      padding: "0.2rem 0.55rem",
                    }}
                  >
                    Destaque
                  </span>
                )}
                <div className="flex items-center gap-2 mb-4">
                  <span
                    className="tag"
                    style={{ background: tc.bg, color: tc.text, border: "none" }}
                  >
                    {a.tag}
                  </span>
                  {a.date && (
                    <span style={{ fontSize: "0.7rem", color: "var(--border)" }}>{a.date}</span>
                  )}
                </div>
                <h3 className="font-semibold text-white mb-2 leading-snug flex-1" style={{ fontSize: "0.95rem" }}>
                  {a.title}
                </h3>
                <p style={{ fontSize: "0.825rem", color: "var(--muted-foreground)", lineHeight: 1.65, marginTop: "0.25rem" }}>
                  {a.excerpt.length > 110 ? a.excerpt.slice(0, 110) + "…" : a.excerpt}
                </p>
                <div
                  className="flex items-center justify-between mt-5 pt-4"
                  style={{ borderTop: "1px solid var(--border)" }}
                >
                  <span style={{ fontSize: "0.7rem", color: "var(--border)" }}>{a.readTime} leitura</span>
                  <div className="flex items-center gap-1" style={{ color: "var(--primary)", fontSize: "0.78rem", fontWeight: 600 }}>
                    Ler <ChevronRight size={12} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── CTA final ─────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div
          style={{
            background: "linear-gradient(135deg, rgba(37,99,235,0.12) 0%, rgba(124,58,237,0.08) 100%)",
            border: "1px solid rgba(37,99,235,0.2)",
            borderRadius: "1.5rem",
            padding: "clamp(2.5rem, 5vw, 4rem)",
            textAlign: "center",
          }}
        >
          <div className="flex justify-center mb-5">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: 56,
                width: 56,
                borderRadius: "1rem",
                background: "rgba(37,99,235,0.15)",
                border: "1px solid rgba(37,99,235,0.25)",
              }}
            >
              <Users size={24} style={{ color: "var(--code-text)" }} />
            </div>
          </div>
          <h2
            className="font-bold text-white mb-4"
            style={{ fontSize: "clamp(1.4rem, 2.5vw, 2rem)" }}
          >
            Vamos conversar sobre pagamentos?
          </h2>
          <p style={{ color: "var(--muted-foreground)", fontSize: "0.95rem", maxWidth: 480, margin: "0 auto 2rem", lineHeight: 1.7 }}>
            Tem um projeto, dúvida técnica ou quer entender melhor o ecossistema de intercâmbio?
            Estou disponível.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="mailto:vsugamele@gmail.com"
              className="btn-primary flex items-center gap-2"
            >
              <BookOpen size={15} />
              Entrar em contato
            </a>
            <Link href="/simulador" className="btn-outline flex items-center gap-2">
              <Calculator size={14} />
              Testar o Simulador
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
