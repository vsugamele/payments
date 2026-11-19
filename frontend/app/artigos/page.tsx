import Link from "next/link";
import { ArrowRight } from "lucide-react";

const ARTICLES = [
  {
    slug: "quando-a-ia-responde-quem-realmente-sabe",
    tag: "Análise",
    title: "Quando a IA responde, quem realmente sabe?",
    excerpt:
      "A perda do atrito de aprender, a falsa sensação de domínio técnico e por que times de pagamentos precisam preservar repertório próprio.",
    date: "24 Set 2026",
    readTime: "6 min",
    published: true,
  },
  {
    slug: "intercambio-guia-completo",
    tag: "Intercâmbio",
    title: "Intercâmbio: guia completo para adquirentes e subadquirentes",
    excerpt:
      "A cascata de cinco decisões que define qual tarifa entra em cada compra, por que acontece downgrade em silêncio no clearing e como conferir se a conta fecha.",
    date: "28 Abr 2026",
    readTime: "12 min",
    published: true,
  },
  {
    slug: "compelling-evidence-3-0",
    tag: "Disputas",
    title: "Compelling Evidence 3.0: como a Visa combate fraude amigável",
    excerpt:
      "Critérios de elegibilidade, campos Base II, reason codes 10.4 e 13.1, comparativo com o CE 2.0 e fluxo prático de defesa.",
    date: "28 Abr 2026",
    readTime: "10 min",
    published: true,
  },
  {
    slug: "passo-a-passo-transacao",
    tag: "Infraestrutura",
    title: "Passo a passo de uma transação de pagamento",
    excerpt:
      "Do credenciamento do lojista até a liquidação financeira: ISO 8583, chip EMV, Dual Message, clearing noturno e chargeback explicados do zero.",
    date: "08 Fev 2026",
    readTime: "15 min",
    published: true,
  },
  {
    slug: "vdcap-taf-scof",
    tag: "Autorização",
    title: "Visa VDCAP e Mastercard TAF/SCOF: autenticação silenciosa com token",
    excerpt:
      "Como Visa e Mastercard combinam Network Tokens e credenciais salvas para autenticar compras sem empurrar desafio 3DS ao portador.",
    date: "12 Abr 2025",
    readTime: "12 min",
    published: true,
  },
];

export const metadata = {
  title: "Artigos — Vinícius Sugamele",
  description:
    "Guias e artigos técnicos sobre meios de pagamento, intercâmbio, ISO 8583, EMV, tokenização e chargeback.",
};

export default function ArtigosPage() {
  const [featured, ...rest] = ARTICLES;

  return (
    <main className="bg-background min-h-dvh pb-24">
      <div className="mx-auto max-w-4xl px-6">
        <header className="pt-14 pb-10 border-b border-border space-y-4">
          <p className="section-eyebrow">Arquivo técnico</p>
          <h1
            className="font-semibold text-foreground text-balance"
            style={{
              fontSize: "clamp(1.9rem, 4vw, 2.75rem)",
              lineHeight: 1.15,
              letterSpacing: "-0.025em",
            }}
          >
            Artigos sobre pagamentos
          </h1>
          <p className="font-serif text-base text-muted-foreground leading-relaxed max-w-2xl">
            Guias aprofundados sobre autorização, intercâmbio, tokenização, disputas e o dia a dia
            técnico de quem opera com as bandeiras.
          </p>
        </header>

        {/* Destaque */}
        <section className="py-10 border-b border-border space-y-4">
          <p className="section-eyebrow">Em destaque</p>
          <Link
            href={`/artigos/${featured.slug}`}
            className="editorial-card group block p-6 sm:p-8 space-y-3"
          >
            <p className="font-mono text-xs text-muted-foreground">
              {featured.tag} · {featured.date} · {featured.readTime} de leitura
            </p>
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground group-hover:underline underline-offset-4 decoration-border leading-snug">
              {featured.title}
            </h2>
            <p className="font-serif text-base text-muted-foreground leading-relaxed max-w-2xl">
              {featured.excerpt}
            </p>
            <span className="inline-flex items-center gap-1.5 font-mono text-xs text-foreground pt-2">
              Ler artigo completo <ArrowRight size={13} />
            </span>
          </Link>
        </section>

        {/* Lista completa */}
        <section className="py-10 space-y-5">
          <p className="section-eyebrow">Todos os artigos</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {rest.map((article) => (
              <Link
                key={article.slug}
                href={`/artigos/${article.slug}`}
                className="editorial-card group p-6 flex flex-col justify-between gap-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between font-mono text-xs text-muted-foreground">
                    <span>{article.tag}</span>
                    <span>{article.date}</span>
                  </div>
                  <h3 className="text-base font-semibold text-foreground group-hover:underline underline-offset-4 decoration-border leading-snug">
                    {article.title}
                  </h3>
                  <p className="font-serif text-sm text-muted-foreground leading-relaxed">
                    {article.excerpt}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-border font-mono text-xs text-muted-foreground">
                  <span>{article.readTime} de leitura</span>
                  <span className="text-foreground inline-flex items-center gap-1">
                    Ler <ArrowRight size={12} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Notas recentes */}
        <section className="pt-8 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="font-serif text-sm text-muted-foreground">
            Procurando notas rápidas sobre normas recentes do Banco Central e das bandeiras?
          </p>
          <Link href="/noticias" className="btn-outline text-xs shrink-0">
            Ver notícias e radar →
          </Link>
        </section>
      </div>
    </main>
  );
}
