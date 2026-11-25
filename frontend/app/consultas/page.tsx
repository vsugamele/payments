import Link from "next/link";
import { ArrowRight, Clock, AlertTriangle } from "lucide-react";
import consultas from "@/data/consultas-publicas.json";
import { JsonLd } from "@/components/JsonLd";
import { buildBreadcrumbJsonLd, buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Consultas Públicas das Bandeiras | Vinícius Sugamele",
  description:
    "Resumos executivos e pontos de atenção das consultas públicas de Visa, Mastercard e Elo submetidas ao mercado brasileiro.",
  path: "/consultas",
});

function diasRestantes(vigencia: string): number {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const venc = new Date(vigencia);
  venc.setHours(0, 0, 0, 0);
  return Math.ceil((venc.getTime() - hoje.getTime()) / 86400000);
}

function StatusBadge({ dias }: { dias: number }) {
  if (dias < 0) {
    return (
      <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
        Encerrada
      </span>
    );
  }
  if (dias <= 7) {
    return (
      <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-[#c81e1e]/10 text-[#c81e1e] dark:text-red-400 border border-[#c81e1e]/25 inline-flex items-center gap-1">
        <AlertTriangle size={10} /> {dias}d restantes
      </span>
    );
  }
  return (
    <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-[#1e6b73]/10 text-[#1e6b73] dark:text-teal-300 border border-[#1e6b73]/25">
      {dias}d restantes
    </span>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function ConsultasPage() {
  const abertas = consultas.filter((c) => diasRestantes(c.vigencia) >= 0);
  const encerradas = consultas.filter((c) => diasRestantes(c.vigencia) < 0);

  return (
    <main className="bg-background min-h-dvh pb-24">
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Início", path: "/" },
          { name: "Consultas Públicas", path: "/consultas" },
        ])}
      />
      <div className="mx-auto max-w-4xl px-6">
        <header className="pt-14 pb-10 border-b border-border space-y-4">
          <p className="section-eyebrow">Regulatório · Bandeiras</p>
          <h1
            className="font-semibold text-foreground text-balance"
            style={{
              fontSize: "clamp(1.9rem, 4vw, 2.75rem)",
              lineHeight: 1.15,
              letterSpacing: "-0.025em",
            }}
          >
            Consultas públicas das bandeiras
          </h1>
          <p className="font-serif text-base text-muted-foreground leading-relaxed max-w-2xl">
            Resumos executivos e pontos críticos das alterações regulamentares submetidas a consulta
            pública por Visa, Mastercard e Elo no Brasil.
          </p>
        </header>

        {/* Números limpos */}
        <div className="grid grid-cols-3 gap-4 py-8 border-b border-border">
          <div className="editorial-card p-4">
            <p className="font-mono text-2xl font-semibold text-foreground tabular-nums">
              {consultas.length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Consultas analisadas</p>
          </div>
          <div className="editorial-card p-4">
            <p className="font-mono text-2xl font-semibold text-foreground tabular-nums">
              {abertas.length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Em andamento</p>
          </div>
          <div className="editorial-card p-4">
            <p className="font-mono text-2xl font-semibold text-foreground tabular-nums">
              {encerradas.length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Histórico encerrado</p>
          </div>
        </div>

        {/* Em andamento */}
        {abertas.length > 0 && (
          <section className="py-10 space-y-4">
            <p className="section-eyebrow">Em andamento</p>
            <div className="space-y-4">
              {abertas.map((c) => {
                const dias = diasRestantes(c.vigencia);
                return (
                  <Link
                    key={c.slug}
                    href={`/consultas/${c.slug}`}
                    className="editorial-card group block p-6 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-medium text-foreground">
                          {c.bandeira}
                        </span>
                        <StatusBadge dias={dias} />
                      </div>
                      <span className="font-mono text-xs text-muted-foreground inline-flex items-center gap-1">
                        <Clock size={12} /> Prazo {formatDate(c.vigencia)}
                      </span>
                    </div>
                    <h2 className="text-base font-semibold text-foreground group-hover:underline underline-offset-4 decoration-border">
                      {c.titulo}
                    </h2>
                    <p className="font-serif text-sm text-muted-foreground leading-relaxed">
                      {c.resumo.replace(/\n/g, " ").substring(0, 210)}…
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Encerradas */}
        {encerradas.length > 0 && (
          <section className="py-10 space-y-4">
            <p className="section-eyebrow">Arquivo de consultas</p>
            <div className="space-y-4">
              {encerradas.map((c) => (
                <Link
                  key={c.slug}
                  href={`/consultas/${c.slug}`}
                  className="editorial-card group block p-6 space-y-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-medium text-foreground">
                        {c.bandeira}
                      </span>
                      <StatusBadge dias={diasRestantes(c.vigencia)} />
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">
                      Publicada em {formatDate(c.publicacao)}
                    </span>
                  </div>
                  <h2 className="text-base font-semibold text-foreground group-hover:underline underline-offset-4 decoration-border">
                    {c.titulo}
                  </h2>
                  <p className="font-serif text-sm text-muted-foreground leading-relaxed line-clamp-2">
                    {c.resumo.replace(/\n/g, " ").substring(0, 220)}…
                  </p>
                  <span className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground group-hover:text-foreground">
                    Ler resumo executivo <ArrowRight size={12} />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Nota explicativa */}
        <section className="mt-4 editorial-card p-6 space-y-3">
          <p className="section-eyebrow">Contexto</p>
          <h2 className="text-base font-semibold text-foreground">
            Por que acompanhar consultas públicas das bandeiras?
          </h2>
          <p className="font-serif text-sm text-muted-foreground leading-relaxed">
            No Brasil, o Banco Central exige que instituidores de arranjos de pagamento submetam
            alterações relevantes de regulamento a consulta pública antes da entrada em vigor. É o
            momento em que adquirentes, emissores, subadquirentes e fintechs conseguem registrar
            impactos operacionais e pedir ajustes antes que a regra passe a valer.
          </p>
          <a
            href="https://www.bcb.gov.br/estabilidadefinanceira/supervisaoarranjos"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-mono text-xs text-foreground underline underline-offset-4 decoration-border hover:decoration-foreground pt-1"
          >
            Portal de supervisão de arranjos do Banco Central <ArrowRight size={12} />
          </a>
        </section>
      </div>
    </main>
  );
}
