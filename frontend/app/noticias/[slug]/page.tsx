import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, FileDown } from "lucide-react";
import { ShareArticleBar } from "@/components/ShareArticleBar";
import { JsonLd } from "@/components/JsonLd";
import {
  buildArticleJsonLd,
  buildArticleTitle,
  buildBreadcrumbJsonLd,
  buildPageMetadata,
} from "@/lib/seo";
import {
  EDITORIAL_POSTS,
  getAllNewsPosts,
  getNewsPostBySlug,
} from "@/data/editorial-posts";

export async function generateStaticParams() {
  return getAllNewsPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getNewsPostBySlug(slug);
  if (!post) return {};
  return buildPageMetadata({
    title: buildArticleTitle(post.title),
    description: post.summary,
    path: `/noticias/${post.slug}`,
    type: "article",
    publishedTime: `${post.dateISO}T12:00:00Z`,
    section: post.category,
  });
}

export default async function NoticiaDetalhePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getNewsPostBySlug(slug);
  if (!post) notFound();

  const otherPosts = EDITORIAL_POSTS.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <main className="bg-background min-h-dvh pb-24">
      <JsonLd
        data={[
          buildArticleJsonLd({
            title: post.title,
            description: post.summary,
            path: `/noticias/${post.slug}`,
            datePublished: `${post.dateISO}T12:00:00Z`,
            section: post.category,
            isNews: true,
          }),
          buildBreadcrumbJsonLd([
            { name: "Início", path: "/" },
            { name: "Notícias", path: "/noticias" },
            { name: post.title, path: `/noticias/${post.slug}` },
          ]),
        ]}
      />
      <article className="mx-auto max-w-3xl px-6">
        {/* Voltar */}
        <div className="pt-8 pb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={13} />
            Voltar para a página inicial
          </Link>
        </div>

        {/* Cabeçalho da matéria */}
        <header className="pb-8 border-b border-border space-y-5">
          {post.series && (
            <p className="section-eyebrow">{post.series}</p>
          )}
          <p className="font-mono text-xs text-muted-foreground">
            {post.category} · {post.dateFull} · {post.readTime} de leitura
          </p>

          <h1
            className="font-semibold text-foreground text-balance"
            style={{
              fontSize: "clamp(1.75rem, 4vw, 2.55rem)",
              lineHeight: 1.15,
              letterSpacing: "-0.025em",
            }}
          >
            {post.title}
          </h1>

          <p className="font-serif text-lg text-muted-foreground leading-relaxed text-pretty">
            {post.summary}
          </p>

          {/* Assinatura limpa do autor */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <Link
              href="/curriculo"
              className="group inline-flex items-center gap-3"
            >
              <div className="relative size-10 rounded-full overflow-hidden border border-border shrink-0">
                <Image
                  src="/vinicius_sugamele.jpg"
                  alt="Vinícius Sugamele"
                  fill
                  sizes="40px"
                  className="object-cover object-top"
                />
              </div>
              <div className="leading-tight">
                <span className="block text-sm font-semibold text-foreground group-hover:underline underline-offset-4">
                  Vinícius Sugamele
                </span>
                <span className="block text-xs text-muted-foreground">
                  Head de Bandeiras · EcommIT
                </span>
              </div>
            </Link>

            {post.effectiveWindow && (
              <span className="font-mono text-[11px] px-3 py-1 rounded-full bg-muted border border-border text-foreground">
                {post.effectiveWindow}
              </span>
            )}
          </div>

          <div className="pt-1">
            <ShareArticleBar title={post.title} path={post.href} />
          </div>
        </header>

        {/* Quadro de síntese rápida */}
        {post.keyTakeaways && post.keyTakeaways.length > 0 && (
          <div className="my-8 editorial-card p-6 space-y-3">
            <p className="section-eyebrow">Em resumo</p>
            <ul className="space-y-2.5 text-sm text-foreground/90 leading-relaxed">
              {post.keyTakeaways.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="font-mono text-xs text-muted-foreground mt-0.5">
                    0{idx + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Corpo editorial (Literata) */}
        <div className="article-body">
          {post.sections?.map((section, idx) => (
            <section key={idx}>
              <h2>{section.heading}</h2>
              {section.paragraphs.map((p, pIdx) => (
                <p key={pIdx}>{p}</p>
              ))}
              {section.bullets && section.bullets.length > 0 && (
                <ul>
                  {section.bullets.map((b, bIdx) => (
                    <li key={bIdx}>{b}</li>
                  ))}
                </ul>
              )}
              {section.callout && (
                <div className="callout">
                  <strong>{section.callout.label}: </strong>
                  {section.callout.text}
                </div>
              )}
            </section>
          ))}
        </div>

        {/* Fonte oficial e vigência */}
        {post.sourceNote && (
          <div className="mt-10 rounded-2xl border border-border bg-muted/60 p-5 space-y-1.5">
            <p className="section-eyebrow">Fonte normativa e referência</p>
            <p className="text-sm text-foreground font-medium">{post.sourceNote}</p>
            {post.effectiveWindow && (
              <p className="font-mono text-xs text-muted-foreground">
                Vigência: {post.effectiveWindow}
              </p>
            )}
          </div>
        )}

        {/* Caixinha Lado a Lado: 1. Ensinar (Resumo Normativo) ⇄ 2. Demonstrar (Simulador 3D) */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="editorial-card p-5 space-y-2">
            <p className="section-eyebrow">1. Ensinar · Regra em foco</p>
            <p className="text-sm font-semibold text-foreground">
              {post.category} ({post.effectiveWindow || post.dateFull})
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {post.keyTakeaways?.[0] || post.summary}
            </p>
          </div>

          <Link
            href={
              post.slug.includes("split-payment")
                ? "/jornada?track=regras_2027_tempo&split2027=1"
                : post.slug.includes("med-2-0")
                ? "/jornada?track=med_seguranca"
                : post.slug.includes("pix-automatico")
                ? "/jornada?track=pix_auto_nfc"
                : post.relatedLabHref || "/jornada"
            }
            className="editorial-card group p-5 flex flex-col justify-between gap-3 hover:border-foreground/40 transition-all"
          >
            <div className="space-y-1.5">
              <p className="section-eyebrow">2. Demonstrar · Ver por dentro em 3D</p>
              <p className="text-sm font-semibold text-foreground group-hover:underline underline-offset-4">
                {post.relatedLabLabel || "Simular este fluxo passo a passo no Laboratório 3D"}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Veja as mensagens trocadas entre os participantes, injete falhas e confira a divisão financeira da operação.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-foreground">
              <span>Abrir Simulador Interativo</span>
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </span>
          </Link>
        </div>

        {/* Mini rodapé do autor com atalho pro CV */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-3.5">
            <div className="relative size-12 rounded-full overflow-hidden border border-border shrink-0">
              <Image
                src="/vinicius_sugamele.jpg"
                alt="Vinícius Sugamele"
                fill
                sizes="48px"
                className="object-cover object-top"
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Vinícius Sugamele</p>
              <p className="text-xs text-muted-foreground">
                16+ anos em gestão de bandeiras, autorização, clearing e tarifas de meios de pagamento.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Link href="/curriculo" className="btn-outline text-xs py-2 px-3.5">
              Ver currículo
            </Link>
            <a
              href="/Curriculo_Vinicius_Sugamele.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline inline-flex items-center gap-1.5 text-xs py-2 px-3.5"
            >
              <FileDown size={13} />
              <span>PDF</span>
            </a>
          </div>
        </div>

        {/* Outras leituras */}
        <section className="mt-12 pt-8 border-t border-border space-y-4">
          <p className="section-eyebrow">Continue lendo</p>
          <div className="divide-y divide-border/70">
            {otherPosts.map((item) => (
              <Link
                key={item.slug}
                href={item.href}
                className="group py-3.5 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4"
              >
                <span className="font-mono text-xs text-muted-foreground w-16 shrink-0">
                  {item.dateShort}
                </span>
                <span className="flex-1 text-sm font-medium text-foreground group-hover:underline underline-offset-4 decoration-border">
                  {item.title}
                </span>
                <span className="font-mono text-[11px] text-muted-foreground shrink-0">
                  {item.readTime}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </article>
    </main>
  );
}
