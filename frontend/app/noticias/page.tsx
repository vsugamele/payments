import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { EDITORIAL_POSTS } from "@/data/editorial-posts";
import { JsonLd } from "@/components/JsonLd";
import { buildBreadcrumbJsonLd, buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Notícias de Meios de Pagamento e BCB | Vinícius Sugamele",
  description:
    "Radar editorial sobre mudanças de regras de Visa, Mastercard, Elo, Amex, Pix e Banco Central com foco no impacto operacional e financeiro.",
  path: "/noticias",
});

export default function NoticiasPage() {
  const noticias = EDITORIAL_POSTS.filter((p) => p.kind === "noticia");
  const artigos = EDITORIAL_POSTS.filter((p) => p.kind === "artigo");

  return (
    <main className="bg-background min-h-dvh pb-24">
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Início", path: "/" },
          { name: "Notícias e Notas", path: "/noticias" },
        ])}
      />
      <div className="mx-auto max-w-4xl px-6">
        <header className="pt-14 pb-10 border-b border-border space-y-4">
          <p className="section-eyebrow">Radar do setor</p>
          <h1
            className="font-semibold text-foreground text-balance"
            style={{
              fontSize: "clamp(1.9rem, 4vw, 2.75rem)",
              lineHeight: 1.15,
              letterSpacing: "-0.025em",
            }}
          >
            Notícias e mudanças em meios de pagamento
          </h1>
          <p className="font-serif text-base text-muted-foreground leading-relaxed max-w-2xl">
            Notas diretas sobre normas do Banco Central, releases semestrais das bandeiras e
            consultas públicas — sempre separando o que está publicado na fonte oficial do que
            muda na rotina de quem opera.
          </p>
        </header>

        <section className="py-10 space-y-4">
          <p className="section-eyebrow">Notas recentes</p>
          <div className="space-y-4">
            {noticias.map((post) => (
              <Link
                key={post.slug}
                href={post.href}
                className="editorial-card group block p-6 space-y-2.5"
              >
                <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-muted-foreground">
                  <span>{post.dateFull}</span>
                  <span>·</span>
                  <span>{post.category}</span>
                  <span>·</span>
                  <span>{post.readTime}</span>
                </div>
                <h2 className="text-lg font-semibold text-foreground group-hover:underline underline-offset-4 decoration-border leading-snug">
                  {post.title}
                </h2>
                <p className="font-serif text-sm text-muted-foreground leading-relaxed">
                  {post.summary}
                </p>
                {post.sourceNote && (
                  <p className="font-mono text-[11px] text-muted-foreground pt-1">
                    Fonte: {post.sourceNote}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>

        <section className="pt-6 border-t border-border space-y-4">
          <div className="flex items-center justify-between">
            <p className="section-eyebrow">Guias e artigos técnicos</p>
            <Link
              href="/artigos"
              className="text-xs font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              Ver arquivo completo <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-border/70">
            {artigos.map((post) => (
              <Link
                key={post.slug}
                href={post.href}
                className="group py-4 flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-5 hover:bg-card/70 -mx-3 px-3 rounded-xl transition-colors"
              >
                <span className="font-mono text-xs text-muted-foreground w-20 shrink-0">
                  {post.dateShort} {post.year}
                </span>
                <span className="flex-1 text-sm font-semibold text-foreground group-hover:underline underline-offset-4 decoration-border">
                  {post.title}
                </span>
                <span className="font-mono text-[11px] text-muted-foreground shrink-0">
                  {post.readTime}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
