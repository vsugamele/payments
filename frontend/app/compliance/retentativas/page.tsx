import RetriesClient from "./RetriesClient";
import RetrySimulator from "@/components/retries/RetrySimulator";
import RuleReference from "@/components/RuleReference";
import Link from "next/link";
import { ChevronLeft, GitCompare, RefreshCw } from "lucide-react";

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

      <div className="mx-auto max-w-6xl px-6 pt-10 space-y-20">
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
