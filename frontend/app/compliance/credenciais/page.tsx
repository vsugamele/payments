import StoredCredentialsClient from "./StoredCredentialsClient";
import TermTooltip from "@/components/TermTooltip";
import RuleReference from "@/components/RuleReference";
import Link from "next/link";
import { ChevronLeft, CreditCard, ArrowRight, AlertTriangle, BookOpen } from "lucide-react";

export const metadata = {
  title: "Stored Credentials: MIT & CIT Framework | VS Payments",
  description: "Classifique transações MIT (Merchant Initiated) e CIT (Cardholder Initiated) conforme os manuais Visa e Mastercard. Campos ISO 8583 obrigatórios e riscos de chargeback por tipo.",
};

export default function StoredCredentialsPage() {
  return (
    <div className="bg-background min-h-screen pb-24">
      {/* ── Header ── */}
      <div style={{ borderBottom: "1px solid var(--border)", background: "var(--code-bg)" }} className="py-6 px-6">
        <div className="mx-auto max-w-6xl">
          <Link href="/compliance" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ChevronLeft size={16} /> Voltar ao Hub de Compliance
          </Link>
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
              <CreditCard size={22} />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <h1 className="text-2xl font-bold text-foreground">Stored Credentials: MIT & CIT Framework</h1>
                <RuleReference
                  manual="Visa Core Rules"
                  ruleId="Section 10.3: Stored Credential Framework"
                  description="Base normativa do framework de credenciais armazenadas para transações recorrentes e merchant-initiated."
                />
              </div>
              <p className="text-muted-foreground text-sm max-w-3xl leading-relaxed">
                O framework de{" "}
                <TermTooltip
                  term="Stored Credentials"
                  definition="Dados de cartão armazenados pelo lojista para uso em cobranças futuras sem a presença do portador, com base em acordo prévio."
                /> define como usar adequadamente um cartão salvo em cobranças subsequentes. A classificação errada é a causa mais frequente de chargebacks RC 4837 e 4853 em e-commerces e SaaS.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 pt-10 space-y-12">

        {/* ── Contextualização Normativa ── */}
        <section>
          <h2 className="text-lg font-bold text-foreground mb-5">Por que isso importa legalmente?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[
              {
                title: "Visa SCOF (2018)",
                color: "#60a5fa",
                bg: "rgba(96,165,250,0.08)",
                border: "rgba(96,165,250,0.2)",
                desc: "Stored Credential Framework da Visa obriga toda transação recorrente a referenciar o networkTransactionId da CIT original. Violação = RC 10.4 (Fraud).",
                manual: "Visa Core Rules",
                ref: "Section 10.3: Stored Credential Framework",
              },
              {
                title: "Mastercard SCOF (2019)",
                color: "#f87171",
                bg: "rgba(248,113,113,0.08)",
                border: "rgba(248,113,113,0.2)",
                desc: "Mastercard exige o DE 48.22 (Stored Credential Use Indicator) preenchido em toda transação MIT. Ausência do campo = Chargeback automático RC 4853.",
                manual: "Mastercard Rules",
                ref: "Section 3.1: Stored Credential Use Indicator",
              },
              {
                title: "7 Tipos de MIT",
                color: "#a78bfa",
                bg: "rgba(167,139,250,0.08)",
                border: "rgba(167,139,250,0.2)",
                desc: "Recurring, Installment, Unscheduled, Incremental, Resubmission, No-Show e Delayed Charge — cada um com campos ISO e janelas de prazo distintos.",
                manual: "Mastercard Chargeback Guide",
                ref: "Section 2: MIT Classification Matrix",
              },
            ].map(card => (
              <div key={card.title} className="p-5 rounded-xl border" style={{ background: card.bg, borderColor: card.border }}>
                <h3 className="font-bold mb-2 text-sm" style={{ color: card.color }}>{card.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">{card.desc}</p>
                <RuleReference manual={card.manual} ruleId={card.ref} description={card.desc} />
              </div>
            ))}
          </div>

          {/* Golden Rule Banner */}
          <div className="flex items-start gap-4 p-5 rounded-2xl border border-amber-500/30 bg-amber-500/5">
            <AlertTriangle size={20} className="text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-300 text-sm mb-1">A Regra de Ouro das Credenciais Armazenadas</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Toda cobrança iniciada pelo lojista (<TermTooltip term="MIT" definition="Merchant Initiated Transaction: transação iniciada pelo lojista sem presença ativa do portador." />) DEVE ter o{" "}
                <TermTooltip term="networkTransactionId" definition="ID único retornado pela rede (Visa/Mastercard) na autorização original (CIT), usado para vincular todas as MITs subsequentes ao acordo do portador." />{" "}
                da primeira transação (<TermTooltip term="CIT" definition="Cardholder Initiated Transaction: a transação inicial onde o portador está presente e autoriza explicitamente o armazenamento do cartão." />) referenciado. Sem essa âncora, o Emissor não tem como validar que o portador autorizou a cobrança — e o chargeback é praticamente automático.
              </p>
            </div>
          </div>
        </section>

        {/* ── Classificador Interativo ── */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-foreground">Classificador & Mapa MIT/CIT</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Use o modo interativo para diagnosticar sua transação ou o mapa completo para referência rápida de todos os campos.
              </p>
            </div>
            <Link
              href="/compliance/disputas"
              className="hidden md:flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground border border-border bg-code-bg px-3 py-2 rounded-lg transition-colors"
            >
              <BookOpen size={13} />
              Ver Gestão de Disputas
              <ArrowRight size={12} />
            </Link>
          </div>
          <StoredCredentialsClient />
        </section>

      </div>
    </div>
  );
}
