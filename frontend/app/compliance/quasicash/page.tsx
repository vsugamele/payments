import QuasiCashClient from "./QuasiCashClient";
import RuleReference from "@/components/RuleReference";
import Link from "next/link";
import { ChevronLeft, Bitcoin } from "lucide-react";

export const metadata = {
  title: "Arquitetura Quasi-Cash & Criptomoedas | VS Payments",
  description: "Entenda a arquitetura técnica de Account Funding Transactions (AFT) e Original Credit Transactions (OCT) exigidas por Bandeiras para Cripto e Carteiras Virtuais.",
};

export default function QuasiCashPage() {
  return (
    <div className="bg-background min-h-screen pb-24">
      <div style={{ borderBottom: "1px solid var(--border)", background: "var(--code-bg)" }} className="py-6 px-6">
        <div className="mx-auto max-w-6xl">
          <Link href="/compliance" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ChevronLeft size={16} /> Voltar ao Hub de Risco & Compliance
          </Link>
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/25 text-amber-500 flex items-center justify-center shrink-0">
              <Bitcoin size={22} />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <h1 className="text-2xl font-bold text-foreground">Arquitetura Quasi-Cash (Funding)</h1>
                <RuleReference
                  manual="Visa Core Rules & Mastercard Transaction Processing"
                  ruleId="AFT & OCT Mandates"
                  description="Transações sistêmicas que não representam compra de bens físicos, mas o 'carregamento' de saldo ou transferência de fundos eletrônicos de/para origens sensíveis."
                />
              </div>
              <p className="text-muted-foreground text-sm max-w-4xl leading-relaxed mt-2">
                Cartões de crédito foram criados primariamente para aquisição de bens. Quando usados para "comprar dinheiro" (Exchanges Cripto, Casas de Aposta, E-Wallets), as transações assumem o status de Quasi-Cash. Bandeiras determinam fluxos arquiteturais estritos separando a Entrada de Dinheiro (Account Funding Transaction - <strong>AFT</strong>) da Saída de Dinheiro (Original Credit - <strong>OCT/Mastercard Send</strong>) baseadas unicamente no MCC 6051 ou 6540.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 pt-10">
        <section>
          <QuasiCashClient />
        </section>
      </div>
    </div>
  );
}
