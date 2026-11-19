import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ExternalLink, FileDown } from "lucide-react";

interface ArticleLayoutProps {
  title: string;
  tag: string;
  tagColor?: string;
  tagText?: string;
  date: string;
  readTime: string;
  children: React.ReactNode;
}

export function ArticleLayout({
  title,
  tag,
  date,
  readTime,
  children,
}: ArticleLayoutProps) {
  return (
    <main className="bg-background min-h-dvh pb-24">
      <article className="mx-auto max-w-3xl px-6">
        {/* Voltar */}
        <div className="pt-8 pb-6">
          <Link
            href="/artigos"
            className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={13} />
            Todos os artigos
          </Link>
        </div>

        {/* Cabeçalho limpo */}
        <header className="pb-8 border-b border-border space-y-5">
          <p className="font-mono text-xs text-muted-foreground">
            {tag} · {date} · {readTime} de leitura
          </p>

          <h1
            className="font-semibold text-foreground leading-tight text-balance"
            style={{
              fontSize: "clamp(1.7rem, 4vw, 2.5rem)",
              letterSpacing: "-0.025em",
            }}
          >
            {title}
          </h1>

          {/* Autor */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
            <Link href="/curriculo" className="group inline-flex items-center gap-3">
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

            <a
              href="https://www.linkedin.com/in/vinicius-sugamele-41136617/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink size={12} />
              <span>LinkedIn</span>
            </a>
          </div>
        </header>

        {/* Conteúdo em Literata */}
        <div className="pt-10">
          <div className="article-body">{children}</div>

          {/* Rodapé do artigo */}
          <div className="mt-16 pt-8 border-t border-border flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/artigos"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={14} />
              Ver todos os artigos
            </Link>
            <div className="flex items-center gap-2">
              <Link href="/curriculo" className="btn-outline text-xs py-2 px-3.5">
                Currículo
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
        </div>
      </article>
    </main>
  );
}
