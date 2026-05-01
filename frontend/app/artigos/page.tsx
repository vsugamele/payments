import Link from "next/link";
import { Calendar, Clock, ChevronRight, BookOpen } from "lucide-react";

const ARTICLES = [
  {
    slug: "passo-a-passo-transacao",
    tag: "Educacional",
    title: "Passo a Passo de uma Transação de Pagamento",
    excerpt:
      "Do credenciamento do lojista até a liquidação: fluxo completo de uma transação Mastercard, com ISO 8583, EMV, Dual Message, clearing e chargeback explicados do zero.",
    date: "8 Fev 2026",
    readTime: "15 min",
    featured: true,
    published: true,
  },
  {
    slug: "vdcap-taf-scof",
    tag: "Técnico",
    title: "Visa VDCAP e Mastercard TAF/SCOF: A engenharia da autenticação silenciosa com token",
    excerpt:
      "Como Visa e Mastercard implementam autenticação silenciosa baseada em token, dispensando 3DS sem abrir mão da segurança. VDCAP, TAF e SCOF explicados com campos técnicos.",
    date: "12 Abr 2025",
    readTime: "12 min",
    featured: false,
    published: true,
  },
  {
    slug: "compelling-evidence-3-0",
    tag: "Técnico",
    title: "Compelling Evidence 3.0: Como a Visa Combate Fraude Amigável",
    excerpt:
      "Guia técnico completo do CE 3.0 da Visa: critérios de elegibilidade, campos BASE II (DE 60/PDS), reason codes 10.4 e 13.1, comparativo com CE 2.0 e fluxo prático de submissão.",
    date: "28 Abr 2026",
    readTime: "10 min",
    featured: false,
    published: true,
  },
  {
    slug: "releases-bandeiras-q2-2026",
    tag: "Regulatório",
    title: "O que esperar dos Releases das Bandeiras — Abril/Q2 2026",
    excerpt:
      "Análise antecipada das principais mudanças que Visa, Mastercard e Elo implementarão no próximo release trimestral. Impactos em autorização, intercâmbio e novas funcionalidades.",
    date: "Abr 2026",
    readTime: "6 min",
    featured: false,
    published: false,
  },
  {
    slug: "intercambio-guia-completo",
    tag: "Técnico",
    title: "Intercâmbio: Guia Completo para Adquirentes e Sub-adquirentes",
    excerpt:
      "A cascata de 5 decisões que define qual taxa é aplicada, por que ela pode mudar silenciosamente (downgrade) e como verificar se você está pagando o correto.",
    date: "28 Abr 2026",
    readTime: "12 min",
    featured: true,
    published: true,
  },
  {
    slug: "3ds-autenticacao-ecommerce",
    tag: "Técnico",
    title: "3DS 2.0: Como a Autenticação Mudou o E-commerce",
    excerpt:
      "O protocolo 3DS 2.0 trouxe uma nova abordagem para autenticação de transações online. Entenda as diferenças, o impacto na conversão e as regras de intercâmbio.",
    date: "Em breve",
    readTime: "7 min",
    featured: false,
    published: false,
  },
  {
    slug: "iso-8583-linguagem-pagamentos",
    tag: "Técnico",
    title: "ISO 8583: A Linguagem dos Pagamentos",
    excerpt:
      "O padrão ISO 8583 é a base da comunicação entre adquirentes, bandeiras e emissores. Um guia prático sobre os principais campos, bitmaps e fluxos de autorização.",
    date: "Em breve",
    readTime: "12 min",
    featured: false,
    published: false,
  },
];

const TAG_COLORS: Record<string, string> = {
  "Regulatório": "rgba(234,179,8,0.12)",
  "Técnico":     "rgba(37,99,235,0.15)",
  "Educacional": "rgba(34,197,94,0.12)",
  "Segurança":   "rgba(239,68,68,0.12)",
};
const TAG_TEXT: Record<string, string> = {
  "Regulatório": "#fbbf24",
  "Técnico":     "#60a5fa",
  "Educacional": "#4ade80",
  "Segurança":   "#f87171",
};

export const metadata = {
  title: "Artigos — VS Payments",
  description: "Artigos técnicos e educacionais sobre meios de pagamento, intercâmbio, regulatório, ISO 8583, EMV e mais.",
};

export default function ArtigosPage() {
  const [featured, ...rest] = ARTICLES;

  return (
    <main className="bg-background pb-24">
      {/* Header */}
      <section
        className="dot-grid"
        style={{
          background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(37,99,235,0.15) 0%, transparent 70%)",
          padding: "5rem 1.5rem 4rem",
          textAlign: "center",
          borderBottom: "1px solid #0f172a",
        }}
      >
        <div className="mx-auto max-w-3xl">
          <p className="section-eyebrow mb-4">Conteúdo</p>
          <h1 className="font-bold text-white mb-4" style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)" }}>
            Artigos sobre Pagamentos
          </h1>
          <p style={{ color: "var(--muted-foreground)", fontSize: "1rem", lineHeight: 1.75 }}>
            Conteúdo técnico e educacional sobre o ecossistema de pagamentos,
            regulatório de bandeiras e boas práticas do setor.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 pt-14">
        {/* Featured */}
        <div className="mb-5">
          <p className="section-eyebrow mb-6">Em destaque</p>
          <Link
            href={`/artigos/${featured.slug}`}
            className="card-hover group block"
            style={{
              background: "rgba(37,99,235,0.06)",
              border: "1px solid rgba(37,99,235,0.18)",
              borderRadius: "1.25rem",
              padding: "2.5rem",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              aria-hidden
              style={{
                position: "absolute",
                top: 0, right: 0,
                width: 300,
                height: 300,
                background: "radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <span
                className="tag"
                style={{
                  background: TAG_COLORS[featured.tag] ?? "rgba(37,99,235,0.15)",
                  color: TAG_TEXT[featured.tag] ?? "#60a5fa",
                  border: "none",
                }}
              >
                {featured.tag}
              </span>
              <div className="flex items-center gap-1" style={{ fontSize: "0.75rem", color: "var(--border)" }}>
                <Calendar size={11} />
                {featured.date}
              </div>
              <div className="flex items-center gap-1" style={{ fontSize: "0.75rem", color: "var(--border)" }}>
                <Clock size={11} />
                {featured.readTime} leitura
              </div>
            </div>
            <h2 className="font-bold text-white mb-3" style={{ fontSize: "clamp(1.2rem, 2.5vw, 1.6rem)", maxWidth: 700 }}>
              {featured.title}
            </h2>
            <p style={{ fontSize: "0.95rem", color: "var(--muted-foreground)", lineHeight: 1.7, maxWidth: 680 }}>
              {featured.excerpt}
            </p>
            <div className="flex items-center gap-1.5 mt-6" style={{ color: "var(--primary)", fontSize: "0.875rem", fontWeight: 600 }}>
              <BookOpen size={14} />
              Ler artigo completo
              <ChevronRight size={13} />
            </div>
          </Link>
        </div>

        {/* Rest */}
        <p className="section-eyebrow mb-6 mt-12">Todos os artigos</p>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {rest.map((a) => (
            <Link
              key={a.slug}
              href={a.published ? `/artigos/${a.slug}` : "/artigos"}
              className={`group flex flex-col ${a.published ? "card-hover" : ""}`}
              style={{
                background: "var(--code-bg)",
                border: "1px solid #0f172a",
                borderRadius: "1rem",
                padding: "1.75rem",
                opacity: a.published ? 1 : 0.55,
                cursor: a.published ? "pointer" : "default",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <span
                  className="tag"
                  style={{
                    background: TAG_COLORS[a.tag] ?? "rgba(37,99,235,0.15)",
                    color: TAG_TEXT[a.tag] ?? "#60a5fa",
                    border: "none",
                    borderRadius: "0.375rem",
                  }}
                >
                  {a.tag}
                </span>
                <span style={{ fontSize: "0.7rem", color: "var(--border)" }}>{a.date}</span>
              </div>

              <h3 className="font-semibold text-white mb-2 leading-snug flex-1" style={{ fontSize: "0.95rem" }}>
                {a.title}
              </h3>
              <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", lineHeight: 1.65, marginTop: "0.5rem" }}>
                {a.excerpt.slice(0, 120)}…
              </p>

              <div className="flex items-center justify-between mt-5 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
                <div className="flex items-center gap-1" style={{ fontSize: "0.72rem", color: "var(--border)" }}>
                  <Clock size={11} />
                  {a.readTime} leitura
                </div>
                <div className="flex items-center gap-1" style={{ color: "var(--primary)", fontSize: "0.78rem", fontWeight: 600 }}>
                  Ler <ChevronRight size={12} />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* LinkedIn CTA */}
        <div
          className="mt-16 text-center"
          style={{
            background: "#050b18",
            border: "1px solid #0f172a",
            borderRadius: "1rem",
            padding: "2.5rem",
          }}
        >
          <p style={{ color: "var(--muted-foreground)", fontSize: "0.875rem", marginBottom: "0.75rem" }}>
            Acompanhe mais conteúdo no LinkedIn
          </p>
          <a
            href="https://www.linkedin.com/in/vinicius-sugamele-41136617/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline inline-flex items-center gap-2"
          >
            Seguir no LinkedIn
            <ChevronRight size={13} />
          </a>
        </div>
      </div>
    </main>
  );
}
