import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { GUIA_CHAPTERS, getGuiaChapterBySlug } from "@/data/guia-pagamentos";
import { ShareArticleBar } from "@/components/ShareArticleBar";
import { JsonLd } from "@/components/JsonLd";
import {
  buildArticleJsonLd,
  buildArticleTitle,
  buildBreadcrumbJsonLd,
  buildPageMetadata,
} from "@/lib/seo";

export async function generateStaticParams() {
  return GUIA_CHAPTERS.map((ch) => ({ slug: ch.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const chapter = getGuiaChapterBySlug(slug);
  if (!chapter) return {};
  return buildPageMetadata({
    title: buildArticleTitle(`${chapter.shortTitle} — Guia de Pagamentos`),
    description: chapter.summary,
    path: `/guia/${chapter.id}`,
    type: "article",
    section: "Guia de Pagamentos",
  });
}

export default async function GuiaCapituloPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const chapter = getGuiaChapterBySlug(slug);
  if (!chapter) notFound();

  const currentIdx = GUIA_CHAPTERS.findIndex((c) => c.id === chapter.id);
  const prevChapter = currentIdx > 0 ? GUIA_CHAPTERS[currentIdx - 1] : null;
  const nextChapter =
    currentIdx < GUIA_CHAPTERS.length - 1 ? GUIA_CHAPTERS[currentIdx + 1] : null;

  return (
    <main className="bg-background min-h-dvh pb-24">
      <JsonLd
        data={[
          buildArticleJsonLd({
            title: chapter.title,
            description: chapter.summary,
            path: `/guia/${chapter.id}`,
            datePublished: "2026-11-19T12:00:00Z",
            section: "Guia de Meios de Pagamento",
          }),
          buildBreadcrumbJsonLd([
            { name: "Início", path: "/" },
            { name: "Guia", path: "/guia" },
            { name: chapter.shortTitle, path: `/guia/${chapter.id}` },
          ]),
        ]}
      />
      <article className="mx-auto max-w-3xl px-6">
        <div className="pt-8 pb-6 flex items-center justify-between gap-4">
          <Link
            href="/guia"
            className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={13} /> Guia geral ({GUIA_CHAPTERS.length} capítulos)
          </Link>
          <span className="font-mono text-xs text-muted-foreground">
            Capítulo {chapter.number} de 0{GUIA_CHAPTERS.length}
          </span>
        </div>

        {/* Navegação rápida entre capítulos */}
        <nav
          aria-label="Capítulos do guia"
          className="flex flex-wrap gap-1.5 pb-6 border-b border-border"
        >
          {GUIA_CHAPTERS.map((ch) => {
            const active = ch.id === chapter.id;
            return (
              <Link
                key={ch.id}
                href={`/guia/${ch.id}`}
                className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                  active
                    ? "bg-[var(--action-bg)] text-[var(--action-fg)] border-transparent font-medium"
                    : "bg-card text-muted-foreground border-border hover:text-foreground"
                }`}
              >
                {ch.shortTitle}
              </Link>
            );
          })}
        </nav>

        {/* Cabeçalho do capítulo */}
        <header className="py-8 border-b border-border space-y-4">
          <p className="section-eyebrow">Guia de pagamentos · Capítulo {chapter.number}</p>
          <h1
            className="font-semibold text-foreground text-balance"
            style={{
              fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
              lineHeight: 1.15,
              letterSpacing: "-0.025em",
            }}
          >
            {chapter.title}
          </h1>
          <p className="font-serif text-lg text-muted-foreground leading-relaxed text-pretty">
            {chapter.subtitle}
          </p>
          <div className="pt-1">
            <ShareArticleBar title={chapter.title} path={`/guia/${chapter.id}`} />
          </div>
        </header>

        {/* Fluxo */}
        <div className="my-8 rounded-xl border border-border bg-muted/60 px-4 py-3.5 font-mono text-xs text-foreground leading-relaxed">
          <span className="text-muted-foreground mr-2">Fluxo de atores:</span>
          {chapter.actors}
        </div>

        {/* Texto principal */}
        <div className="article-body">
          {chapter.paragraphs.map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
        </div>

        {/* Pontos essenciais */}
        <div className="my-8 editorial-card p-6 space-y-3">
          <p className="section-eyebrow">Pontos essenciais</p>
          <ul className="space-y-2.5 text-sm text-foreground/90 leading-relaxed">
            {chapter.keyPoints.map((pt, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="font-mono text-xs text-muted-foreground mt-0.5">
                  0{idx + 1}
                </span>
                <span>{pt}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Fontes oficiais */}
        <div className="rounded-2xl border border-border bg-muted/60 p-5 space-y-2">
          <p className="section-eyebrow">Fontes oficiais e referência normativa</p>
          <ul className="font-mono text-xs text-foreground/90 space-y-1">
            {chapter.officialSources.map((src) => (
              <li key={src}>{src}</li>
            ))}
          </ul>
        </div>

        {/* Ações: Laboratório + Artigo relacionado */}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href={chapter.labHref}
            className="btn-primary inline-flex items-center gap-2 text-xs"
          >
            <span>{chapter.labLabel}</span>
            <ArrowRight size={13} />
          </Link>
          {chapter.relatedArticleHref && chapter.relatedArticleLabel && (
            <Link
              href={chapter.relatedArticleHref}
              className="btn-outline inline-flex items-center gap-1.5 text-xs"
            >
              <span>{chapter.relatedArticleLabel}</span>
            </Link>
          )}
        </div>

        {/* Anterior / Próximo capítulo */}
        <nav
          aria-label="Navegação entre capítulos"
          className="mt-14 pt-8 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          {prevChapter ? (
            <Link
              href={`/guia/${prevChapter.id}`}
              className="editorial-card p-4 space-y-1 group"
            >
              <span className="font-mono text-[11px] text-muted-foreground inline-flex items-center gap-1">
                <ArrowLeft size={11} /> Capítulo anterior
              </span>
              <p className="text-sm font-semibold text-foreground group-hover:underline underline-offset-4">
                {prevChapter.number} · {prevChapter.shortTitle}
              </p>
            </Link>
          ) : (
            <div />
          )}

          {nextChapter && (
            <Link
              href={`/guia/${nextChapter.id}`}
              className="editorial-card p-4 space-y-1 sm:text-right group"
            >
              <span className="font-mono text-[11px] text-muted-foreground inline-flex items-center gap-1 sm:justify-end">
                Próximo capítulo <ArrowRight size={11} />
              </span>
              <p className="text-sm font-semibold text-foreground group-hover:underline underline-offset-4">
                {nextChapter.number} · {nextChapter.shortTitle}
              </p>
            </Link>
          )}
        </nav>
      </article>
    </main>
  );
}
