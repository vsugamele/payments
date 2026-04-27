import PCIClient from "./PCIClient";
import RuleReference from "@/components/RuleReference";
import TermTooltip from "@/components/TermTooltip";
import Link from "next/link";
import { ChevronLeft, Shield } from "lucide-react";

export const metadata = {
  title: "Simulador de Escopo PCI DSS v4 | VS Payments",
  description: "Entenda os diferentes níveis de SAQ (Self-Assessment Questionnaire) do PCI DSS v4 e como a arquitetura da sua integração reduz os requisitos.",
};

export default function PCIPage() {
  return (
    <div className="bg-background min-h-screen pb-24">
      <div style={{ borderBottom: "1px solid var(--border)", background: "var(--code-bg)" }} className="py-6 px-6">
        <div className="mx-auto max-w-5xl">
          <Link href="/compliance" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ChevronLeft size={16} /> Voltar ao Hub de Compliance
          </Link>
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/15 border border-red-500/25 text-red-500 flex items-center justify-center shrink-0">
              <Shield size={22} />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <h1 className="text-2xl font-bold text-foreground">Calculadora de Escopo PCI DSS v4</h1>
                <RuleReference
                  manual="PCI DSS v4.0.1"
                  ruleId="Requirement 3: Protect Stored Account Data"
                  description="A proteção de dados de cartão armazenados e o uso de métodos de desvalorização de dados como a Tokenização."
                />
              </div>
              <p className="text-muted-foreground text-sm max-w-3xl leading-relaxed">
                A redução de escopo é a melhor estratégia para o <strong>PCI DSS</strong>. Quanto menos contato a sua infraestrutura tiver com o <TermTooltip term="PAN" definition="Primary Account Number (Os 16 dígitos do cartão)" />, menos você gastará com auditorias <TermTooltip term="QSA" definition="Qualified Security Assessor — O auditor externo certificado pelo PCI Council" />. 
                Use esta ferramenta para visualizar como o seu modelo de arquitetura de pagamentos define o seu <TermTooltip term="SAQ" definition="Self-Assessment Questionnaire: O formulário exigido que os lojistas/sub-adquirentes preencham anualmente." /> e o número absoluto de controles exigidos.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 pt-10 space-y-12">
        <section>
          <h2 className="text-lg font-bold text-foreground mb-6">Mapeamento de Escopo Arquitetural</h2>
          <PCIClient />
        </section>
      </div>
    </div>
  );
}
