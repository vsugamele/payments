import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";

export const metadata = {
  title: "Leituras e Referências — Vinícius Sugamele",
  description:
    "Normas do Banco Central, manuais técnicos das bandeiras e livros de operação e liderança que realmente uso como referência em meios de pagamento.",
};

const BCB_NORMS = [
  {
    code: "Lei nº 12.865/2013",
    title: "Marco legal dos arranjos e instituições de pagamento",
    note: "A base de tudo que veio depois no Brasil: abriu espaço regulatório para instituições de pagamento, subcredenciadores e a supervisão do Banco Central sobre as bandeiras.",
    url: "https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2013/lei/l12865.htm",
  },
  {
    code: "Resolução BCB nº 304/2023",
    title: "Tetos de intercâmbio no débito (0,50%) e pré-pago (0,70%)",
    note: "Leitura obrigatória para qualquer discussão de precificação ou MDR no Brasil. Define o limite que mudou a economia do débito e dos cartões pré-pagos.",
    url: "https://www.bcb.gov.br/estabilidadefinanceira/exibenormativo?tipo=Resolu%C3%A7%C3%A3o%20BCB&numero=304",
  },
  {
    code: "Resolução BCB nº 264/2022",
    title: "Registro obrigatório de recebíveis de cartão (B3, CERC e TAG)",
    note: "Explica a mecânica das Unidades de Recebíveis (URs), interoperabilidade entre registradoras e por que a agenda deixou de ficar presa em um único domicílio bancário.",
    url: "https://www.bcb.gov.br/estabilidadefinanceira/exibenormativo?tipo=Resolu%C3%A7%C3%A3o%20BCB&numero=264",
  },
  {
    code: "Resolução BCB nº 406/2024",
    title: "Open Finance — Jornada Sem Redirecionamento (JSR)",
    note: "A norma que viabilizou o Pix por aproximação em carteiras digitais sem empurrar o cliente para o app do banco na hora de pagar.",
    url: "https://www.bcb.gov.br/estabilidadefinanceira/exibenormativo?tipo=Resolu%C3%A7%C3%A3o%20BCB&numero=406",
  },
  {
    code: "Resolução BCB nº 493/2025",
    title: "MED 2.0 — rastreamento multinível de fraudes no Pix",
    note: "Evolução direta da segurança do Pix: sai do bloqueio isolado na primeira conta e passa a percorrer o grafo de transferências seguintes.",
    url: "https://www.bcb.gov.br/estabilidadefinanceira/exibenormativo?tipo=Resolu%C3%A7%C3%A3o%20BCB&numero=493",
  },
  {
    code: "Lei Complementar nº 214/2025",
    title: "Reforma Tributária — Split Payment (Arts. 31 a 35)",
    note: "O texto que todo time de liquidação, agenda de recebíveis e captura precisa ler antes de 2027 — em especial o Art. 34 sobre base livre para cessão e antecipação.",
    url: "https://www.planalto.gov.br/ccivil_03/leis/lcp/Lcp214.htm",
  },
];

const TECHNICAL_MANUALS = [
  {
    org: "Visa",
    title: "Visa Core Rules, Base II Clearing & VSS User Guide",
    note: "O trio que resolve 90% dos incidentes de autorização, rejeição no clearing (.CTF de 168 bytes) e auditoria de faturas VSS-110/120.",
  },
  {
    org: "Mastercard",
    title: "Transaction Processing Rules (TPR), GCMS IPM & MCBS",
    note: "Onde ficam as regras de processamento, a estrutura TLV/PDS do IPM e o mapeamento de cobranças e eventos do Consolidated Billing System.",
  },
  {
    org: "Elo",
    title: "Manual de Autorização, Serviço 10 (Liquidação) e Guia TQS",
    note: "Referência prática para certificação, leitura de registros de crítica (Reg 09 / TE01) e alinhamento entre emissores e credenciadores domésticos.",
  },
  {
    org: "EMVCo",
    title: "EMV 3-D Secure 2.2 & Payment Tokenisation Specifications",
    note: "Ajuda a entender o porquê de cada campo de autenticação (ECI, CAVV/TAVV, UCAF) em vez de decorar tabela sem contexto.",
  },
];

const BOOKS = [
  {
    title: "Team Topologies",
    author: "Matthew Skelton & Manuel Pais",
    note: "Excelente para pensar como separar times que mexem em core crítico de liquidação de times que iteram rápido em canais e conversão.",
  },
  {
    title: "Extreme Ownership",
    author: "Jocko Willink & Leif Babin",
    note: "Direto ao ponto sobre responsabilidade de liderança: em operação de pagamentos, quando algo quebra entre áreas, apontar culpado nunca resolve o incidente.",
  },
  {
    title: "Management 3.0",
    author: "Jurgen Appelo",
    note: "Boa base para liderar times transversais sem microgerenciamento — especialmente quando produto, engenharia, risco e operações precisam remar na mesma direção.",
  },
  {
    title: "Designing Data-Intensive Applications",
    author: "Martin Kleppmann",
    note: "Mesmo para quem não programa todo dia, ajuda a conversar de igual para igual com arquitetura sobre consistência, filas, idempotência e conciliação.",
  },
];

export default function LeiturasPage() {
  return (
    <main className="bg-background min-h-dvh pb-24">
      <div className="mx-auto max-w-4xl px-6">
        <div className="pt-8 pb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={13} /> Voltar para a página inicial
          </Link>
        </div>

        <header className="pb-10 border-b border-border space-y-4">
          <p className="section-eyebrow">Curadoria</p>
          <h1
            className="font-semibold text-foreground text-balance"
            style={{
              fontSize: "clamp(1.9rem, 4vw, 2.75rem)",
              lineHeight: 1.15,
              letterSpacing: "-0.025em",
            }}
          >
            Leituras e referências
          </h1>
          <p className="font-serif text-base text-muted-foreground leading-relaxed max-w-2xl">
            Normas do Banco Central, manuais técnicos das bandeiras e livros que voltam para a
            minha mesa com frequência — com uma nota curta sobre o porquê de cada um estar aqui.
          </p>
        </header>

        {/* Prateleira 1: Normas do BCB */}
        <section className="py-12 border-b border-border space-y-6">
          <div>
            <p className="section-eyebrow mb-1.5">01 · Regulação no Brasil</p>
            <h2 className="text-xl font-semibold text-foreground">
              Normas oficiais para manter nos favoritos
            </h2>
          </div>

          <div className="divide-y divide-border/80">
            {BCB_NORMS.map((item) => (
              <div
                key={item.code}
                className="py-5 first:pt-0 last:pb-0 grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-6 items-start"
              >
                <div className="sm:col-span-4 space-y-1">
                  <p className="font-mono text-xs font-medium text-foreground">{item.code}</p>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground hover:text-foreground underline underline-offset-4 decoration-border"
                  >
                    Texto oficial <ExternalLink size={11} />
                  </a>
                </div>
                <div className="sm:col-span-8 space-y-1">
                  <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                  <p className="font-serif text-sm text-[var(--body-text)] leading-relaxed">
                    {item.note}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Prateleira 2: Manuais técnicos */}
        <section className="py-12 border-b border-border space-y-6">
          <div>
            <p className="section-eyebrow mb-1.5">02 · Fonte primária das redes</p>
            <h2 className="text-xl font-semibold text-foreground">
              Manuais que realmente resolvem incidente
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {TECHNICAL_MANUALS.map((m) => (
              <div key={m.title} className="editorial-card p-5 space-y-2">
                <span className="font-mono text-[11px] uppercase text-muted-foreground">
                  {m.org}
                </span>
                <h3 className="text-sm font-semibold text-foreground leading-snug">{m.title}</h3>
                <p className="font-serif text-sm text-muted-foreground leading-relaxed">
                  {m.note}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Prateleira 3: Livros */}
        <section className="pt-12 space-y-6">
          <div>
            <p className="section-eyebrow mb-1.5">03 · Operação, times e sistemas</p>
            <h2 className="text-xl font-semibold text-foreground">
              Livros que ajudam fora do rulebook
            </h2>
          </div>

          <div className="divide-y divide-border/80">
            {BOOKS.map((book) => (
              <div
                key={book.title}
                className="py-5 first:pt-0 last:pb-0 grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-6"
              >
                <div className="sm:col-span-4">
                  <h3 className="text-sm font-semibold text-foreground">{book.title}</h3>
                  <p className="font-mono text-xs text-muted-foreground mt-0.5">{book.author}</p>
                </div>
                <p className="sm:col-span-8 font-serif text-sm text-[var(--body-text)] leading-relaxed">
                  {book.note}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
