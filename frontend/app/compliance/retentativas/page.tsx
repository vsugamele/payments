import RetriesClient from "./RetriesClient";
import RetrySimulator from "@/components/retries/RetrySimulator";
import RuleReference from "@/components/RuleReference";
import Link from "next/link";
import { ChevronLeft, GitCompare, RefreshCw } from "lucide-react";
import { ExecutiveBusinessTriad } from "@/components/ExecutiveBusinessTriad";

export const metadata = {
  title: "Matriz de Retentativas e Response Codes | VS Payments",
  description: "Entenda os motivos de recusa de transações (Soft vs Hard Declines) e as regras rígidas da Visa e Mastercard para retentativas de autorização.",
};

export default function RetriesPage() {
  return (
    <div className="bg-background min-h-screen pb-24">
      <div style={{ borderBottom: "1px solid var(--border)", background: "var(--code-bg)" }} className="py-6 px-6">
        <div className="mx-auto max-w-6xl">
          <Link href="/compliance" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ChevronLeft size={16} /> Voltar ao Hub de Compliance
          </Link>
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/25 text-amber-500 flex items-center justify-center shrink-0">
              <GitCompare size={22} />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <h1 className="text-2xl font-bold text-foreground">Matriz de Retentativas (Declines)</h1>
                <RuleReference
                  manual="Visa Core Rules & Mastercard MAC"
                  ruleId="Issuer Decline Guidelines"
                  description="A disciplina exigida das credenciadoras em cessar transações negadas (Hard Declines) ou aplicar backoff temporal (Soft Declines)."
                />
              </div>
              <p className="text-muted-foreground text-sm max-w-4xl leading-relaxed mt-2">
                O envio contínuo de dados de cartões bloqueados ou sem saldo (Excessive Retries) quebra as regras operacionais das Bandeiras, gerando <strong>multas pesadas em dólares</strong> e degradação da sua Taxa de Aprovação (Approval Rate). Esta ferramenta mapeia os Response Codes (DE 39) de recusa e prescreve o protocolo correto de atuação.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 pt-8 space-y-12">
        <ExecutiveBusinessTriad
          topic="Governança de Retentativas & Multas de Rede"
          subtitle="Como evitar que robôs de retry automáticos transformem centavos de faturamento recuperado em dezenas de milhares de dólares de multas."
          whatIsIt={{
            lead: "A regulação de retentativa estabelece que autorizações negadas só podem ser reenviadas se houver chance real de aprovação e com intervalo mínimo.",
            explanation: "As bandeiras categorizam recusas em Soft (ex: 51 - Saldo Insuficiente, onde um retry após dias faz sentido) e Hard (ex: 05 - Não Autorizar, 14 - Cartão Inválido, 41/43 - Cartão Furtado). Retentar transações Hard gera punição imediata na fatura de rede.",
            analogy: "Se você ligar para um cliente e der ocupado (Soft), você tenta mais tarde. Se você ligar e o número constar como cancelado ou bloqueado pela polícia (Hard), discar 50 vezes seguidas no mesmo dia é considerado assédio e gera bloqueio da sua linha."
          }}
          painOwner={{
            primaryRole: "Squad de Checkout / Engenharia de Pagamentos & Gerente de Risco",
            affectedEntities: ["Gateways", "Adquirentes", "Plataformas de Assinatura (SaaS)", "Grandes E-Commerces"],
            operationalImpact: "Os desenvolvedores ajustam loops cegos de retry no backend para não perder vendas de churn, sem saber que a cada clique além do teto a bandeira debita centavos em dólar na fatura da empresa."
          }}
          financialPrice={{
            directPenalty: "USD 0,25 a USD 0,50 (~R$ 1,40 a R$ 2,80) por retentativa abusiva",
            schemeFeesFine: "Tarifas TPE de Excelência Operacional (Cat 3 Declines)",
            annualBleedingEstimate: "R$ 150.000 a R$ 600.000 / ano faturados silenciosamente em Scheme Fees",
            consequence: "Queda generalizada na taxa de aprovação emissores (Approval Rate) de 85% para <60%, pois os bancos passam a bloquear o MID por suspeita de teste de cartão (card testing)."
          }}
        />

        <section>
          <div className="flex items-center gap-3 mb-8">
            <RefreshCw className="text-amber-500" size={20} />
            <h2 className="text-lg font-bold text-white uppercase tracking-widest">Inteligência de Retentativa (MAC)</h2>
          </div>
          <RetrySimulator />
        </section>

        <section>
          <div className="flex items-center gap-3 mb-8">
            <GitCompare className="text-amber-500" size={20} />
            <h2 className="text-lg font-bold text-white uppercase tracking-widest">Dicionário de Response Codes (DE 39)</h2>
          </div>
          <RetriesClient />
        </section>
      </div>
    </div>
  );
}
