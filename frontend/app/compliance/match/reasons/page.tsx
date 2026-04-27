import MatchReasonCodesClient from "./MatchReasonCodesClient";
import RuleReference from "@/components/RuleReference";
import Link from "next/link";
import { ChevronLeft, FolderLock } from "lucide-react";

export const metadata = {
  title: "Dossiê MATCH Pro: Inclusion Reason Codes | VS Payments",
  description: "Explore detalhadamente a lista negra de banimento (MATCH) e identifique o risco operacional de absorver CNPJs listados sob os códigos de violação Mastercard.",
};

export default function MatchReasonCodesPage() {
  return (
    <div className="bg-background min-h-screen pb-24">
      <div style={{ borderBottom: "1px solid var(--border)", background: "var(--code-bg)" }} className="py-6 px-6">
        <div className="mx-auto max-w-6xl">
          <Link href="/compliance" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ChevronLeft size={16} /> Voltar ao Hub de Risco & Compliance
          </Link>
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-orange-500/15 border border-orange-500/25 text-orange-500 flex items-center justify-center shrink-0">
              <FolderLock size={22} />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <h1 className="text-2xl font-bold text-foreground">Dossiê: MATCH Reason Codes</h1>
                <RuleReference
                  manual="Mastercard MATCH System Manual"
                  ruleId="Inclusion Criteria"
                  description="Os 14 inquéritos oficias usados por adquirentes para reportar lojistas (Terminated Merchants) por justa causa à rede."
                />
              </div>
              <p className="text-muted-foreground text-sm max-w-4xl leading-relaxed mt-2">
                O MATCH (Merchant Alert to Control High-risk Merchants) atua globalmente impedindo que lojistas fraudulentos saltem de credenciador em credenciador. Se um CNPJ bater na pesquisa com status <strong>Exact Match</strong>, a severidade muda drasticamente a depender da razão do reporte original. O Dossiê abaixo traduz as implicações penais e administrativas de cada <em>Reason Code</em> e a responsabilidade (Liability Shift) envolvida se seu painel aprovar o lojista.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 pt-10">
        <section>
          <MatchReasonCodesClient />
        </section>
      </div>
    </div>
  );
}
