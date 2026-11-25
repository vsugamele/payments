import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, AlertTriangle, FileText } from "lucide-react";
import consultas from "@/data/consultas-publicas.json";
import { JsonLd } from "@/components/JsonLd";
import {
  buildArticleJsonLd,
  buildArticleTitle,
  buildBreadcrumbJsonLd,
  buildPageMetadata,
} from "@/lib/seo";

function diasRestantes(vigencia: string): number {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const venc = new Date(vigencia);
  venc.setHours(0, 0, 0, 0);
  return Math.ceil((venc.getTime() - hoje.getTime()) / 86400000);
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export async function generateStaticParams() {
  return consultas.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const consulta = consultas.find((c) => c.slug === slug);
  if (!consulta) return {};
  return buildPageMetadata({
    title: buildArticleTitle(`${consulta.bandeira}: ${consulta.titulo}`),
    description: consulta.resumo.replace(/\n/g, " "),
    path: `/consultas/${consulta.slug}`,
    type: "article",
    publishedTime: `${consulta.publicacao}T12:00:00Z`,
    section: `Consulta Pública · ${consulta.bandeira}`,
  });
}

function ResumoBody({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/);

  return (
    <div className="article-body">
      {blocks.map((block, i) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        if (/^(I{1,3}V?|IV|V|VI|VII|VIII|IX|X)[\.\-\s]/.test(trimmed) && trimmed.length < 130) {
          return <h2 key={i}>{trimmed}</h2>;
        }

        if (/^\d+\.\s/.test(trimmed) && trimmed.length < 120 && !trimmed.includes("\n")) {
          return <h3 key={i}>{trimmed}</h3>;
        }

        if (trimmed.includes("\n") && trimmed.split("\n").every((l) => l.trim().length > 0)) {
          const lines = trimmed.split("\n");
          if (lines.length > 1 && lines[0].endsWith(":")) {
            return (
              <div key={i}>
                <p>
                  <strong>{lines[0]}</strong>
                </p>
                <ul>
                  {lines.slice(1).map((l, j) => (
                    <li key={j}>{l.replace(/^\*\s*/, "").trim()}</li>
                  ))}
                </ul>
              </div>
            );
          }
          return (
            <ul key={i}>
              {lines.map((l, j) => (
                <li key={j}>{l.replace(/^\*\s*/, "").trim()}</li>
              ))}
            </ul>
          );
        }

        return <p key={i}>{trimmed}</p>;
      })}
    </div>
  );
}

export default async function ConsultaDetalhePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const consulta = consultas.find((c) => c.slug === slug);
  if (!consulta) notFound();

  const dias = diasRestantes(consulta.vigencia);
  const aberta = dias >= 0;

  return (
    <main className="bg-background min-h-dvh pb-24">
      <JsonLd
        data={[
          buildArticleJsonLd({
            title: `${consulta.bandeira} — ${consulta.titulo}`,
            description: consulta.resumo.replace(/\n/g, " "),
            path: `/consultas/${consulta.slug}`,
            datePublished: `${consulta.publicacao}T12:00:00Z`,
            section: `Consulta Pública · ${consulta.bandeira}`,
          }),
          buildBreadcrumbJsonLd([
            { name: "Início", path: "/" },
            { name: "Consultas Públicas", path: "/consultas" },
            { name: consulta.titulo, path: `/consultas/${consulta.slug}` },
          ]),
        ]}
      />
      <article className="mx-auto max-w-3xl px-6">
        <div className="pt-8 pb-6">
          <Link
            href="/consultas"
            className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={13} />
            Todas as consultas públicas
          </Link>
        </div>

        <header className="pb-8 border-b border-border space-y-4">
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{consulta.bandeira}</span>
            <span>·</span>
            <span>Consulta pública</span>
            <span>·</span>
            {aberta ? (
              <span className="inline-flex items-center gap-1 text-foreground">
                {dias <= 7 && <AlertTriangle size={11} className="text-[#c81e1e]" />}
                {dias}d para encerrar
              </span>
            ) : (
              <span>Encerrada</span>
            )}
          </div>

          <h1
            className="font-semibold text-foreground leading-tight text-balance"
            style={{
              fontSize: "clamp(1.5rem, 3.6vw, 2.25rem)",
              letterSpacing: "-0.025em",
            }}
          >
            {consulta.titulo}
          </h1>

          <div className="flex flex-wrap gap-5 font-mono text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <FileText size={12} />
              Publicada em {formatDate(consulta.publicacao)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock size={12} />
              Vigência prevista: {formatDate(consulta.vigencia)}
            </span>
          </div>
        </header>

        <div className="pt-10">
          <ResumoBody text={consulta.resumo} />

          <div className="mt-14 pt-8 border-t border-border flex flex-wrap justify-between items-center gap-4">
            <Link
              href="/consultas"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={14} /> Ver todas as consultas
            </Link>
            <Link href="/curriculo" className="btn-outline text-xs py-2 px-3.5">
              Sobre o autor
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}
