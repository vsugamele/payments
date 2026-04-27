import Link from "next/link";
import { ChevronLeft, Calendar, Clock, ExternalLink } from "lucide-react";

interface ArticleLayoutProps {
  title: string;
  tag: string;
  tagColor: string;
  tagText: string;
  date: string;
  readTime: string;
  children: React.ReactNode;
}

export function ArticleLayout({
  title,
  tag,
  tagColor,
  tagText,
  date,
  readTime,
  children,
}: ArticleLayoutProps) {
  return (
    <main className="bg-background pb-24">
      {/* Back */}
      <div
        style={{
          borderBottom: "1px solid #0f172a",
          background: "#050b18",
          padding: "0.875rem 1.5rem",
        }}
      >
        <div className="mx-auto max-w-3xl">
          <Link
            href="/artigos"
            className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
            style={{ color: "var(--muted-foreground)" }}
          >
            <ChevronLeft size={14} />
            Todos os artigos
          </Link>
        </div>
      </div>

      {/* Header */}
      <div
        className="dot-grid"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(37,99,235,0.15) 0%, transparent 70%)",
          borderBottom: "1px solid #0f172a",
          padding: "3.5rem 1.5rem",
        }}
      >
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <span
              style={{
                padding: "0.25rem 0.75rem",
                borderRadius: "9999px",
                fontSize: "0.72rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                background: tagColor,
                color: tagText,
              }}
            >
              {tag}
            </span>
            <span className="flex items-center gap-1" style={{ fontSize: "0.78rem", color: "var(--border)" }}>
              <Calendar size={12} />
              {date}
            </span>
            <span className="flex items-center gap-1" style={{ fontSize: "0.78rem", color: "var(--border)" }}>
              <Clock size={12} />
              {readTime} de leitura
            </span>
          </div>

          <h1
            className="font-bold text-white leading-tight"
            style={{ fontSize: "clamp(1.6rem, 4vw, 2.5rem)", marginBottom: "1.5rem" }}
          >
            {title}
          </h1>

          {/* Author */}
          <div className="flex items-center gap-3">
            <div
              style={{
                height: 40,
                width: 40,
                borderRadius: "0.625rem",
                background: "linear-gradient(135deg, #1e3a5f, #2563eb)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.8rem",
                fontWeight: 800,
                color: "#93c5fd",
                flexShrink: 0,
              }}
            >
              VS
            </div>
            <div>
              <p className="font-semibold text-white" style={{ fontSize: "0.875rem" }}>
                Vinícius Sugamele
              </p>
              <p style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", marginTop: "0.125rem" }}>
                Especialista em Meios de Pagamento · Head de Bandeiras, EcommIT
              </p>
            </div>
            <a
              href="https://www.linkedin.com/in/vinicius-sugamele-41136617/"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto flex items-center gap-1.5 transition-colors"
              style={{ fontSize: "0.78rem", color: "var(--primary)" }}
            >
              <ExternalLink size={12} />
              LinkedIn
            </a>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-6 pt-12">
        <div className="article-body">{children}</div>

        {/* Footer */}
        <div
          style={{
            marginTop: "4rem",
            paddingTop: "2rem",
            borderTop: "1px solid var(--border)",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
          }}
        >
          <Link
            href="/artigos"
            className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
            style={{ color: "var(--muted-foreground)" }}
          >
            <ChevronLeft size={14} />
            Ver todos os artigos
          </Link>
          <a
            href="https://www.linkedin.com/in/vinicius-sugamele-41136617/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline inline-flex items-center gap-2"
            style={{ padding: "0.5rem 1rem", fontSize: "0.8rem" }}
          >
            <ExternalLink size={13} />
            Seguir no LinkedIn
          </a>
        </div>
      </div>
    </main>
  );
}
