import RetriesClient from "./RetriesClient";
import RetrySimulator from "@/components/retries/RetrySimulator";
import { GitCompare, RefreshCw } from "lucide-react";
import { ExecutiveBusinessTriad } from "@/components/ExecutiveBusinessTriad";
import { ModuleTeachDemoHeader } from "@/components/ModuleTeachDemoHeader";

export const metadata = {
  title: "Matriz de Retentativas e Response Codes (DE 39) | VS Payments",
  description:
    "Entenda as regras Visa e Mastercard MAC para Soft vs Hard Declines (1. Ensinar) e simule políticas de retentativa sem multas (2. Demonstrar).",
};

export default function RetriesPage() {
  return (
    <div className="bg-background min-h-screen pb-24">
      <ModuleTeachDemoHeader
        backHref="/compliance"
        backLabel="Voltar para Operação & Simulação"
        categoryPill="Autorização, DE 39 & Scheme Fees"
        normativeBadge="Visa Retry Rules · Mastercard MAC (Cat 1 / Cat 2 / Cat 3)"
        title="Matriz de Retentativas & Response Codes (DE 39)"
        subtitle="Classifique recusas de autorização em Hard Declines vs Soft Declines e evite multas de retentativa excessiva nas faturas Visa VSS e Mastercard MCBS."
        teachConcept="As bandeiras dividem os códigos de retorno da autorização (DE 39) e os Merchant Advice Codes (MAC — DE 48.84 na Mastercard) em recusas definitivas (Hard Declines / Cat 1, onde nova tentativa é proibida) e recusas temporárias (Soft Declines, sujeitas a limite máximo de tentativas e janela de dias)."
        teachRule="Visa Core Rules (Transaction Retry Limits: teto de 15 retentativas em 30 dias corridos para Soft Declines; zero para Hard Declines) & Mastercard Merchant Advice Code (MAC 01/03/21)."
        teachPitfall="Loops automáticos de cobrança recorrente que retentam códigos Hard (ex: 04, 14, 41, 43, 57 ou MAC 01/21) disparam multas por transação em dólar na fatura de rede e derrubam o score de aprovação do MID no emissor."
        demoSteps={[
          "1. No Simulador de Inteligência de Retentativa abaixo, teste uma sequência de tentativas para códigos DE 39 e veja quando a multa é acionada.",
          "2. No Dicionário de Response Codes, pesquise qualquer código (ex: 05, 14, 51, 54, 59, 91) para ver a categoria oficial e a ação recomendada.",
          "3. Clique em 'Consultar nos 4 Bancos SQLite do Acervo' para auditar os códigos de cobrança de Excessive Retry no VSS e MCBS.",
        ]}
        acervoQuery="Regras de retentativa Visa 15 tentativas 30 dias Mastercard MAC DE 48.84 DE 39 Hard Soft Decline"
        lab3dHref="/jornada?track=cartao"
        lab3dLabel="Ver Fluxo 0100/0110 no Lab 3D"
      />

      <div className="mx-auto max-w-6xl px-6 pt-10 space-y-12">
        {/* 1. DEMONSTRAR IMEDIATO: Simulador + Dicionário DE 39 */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5">
            <RefreshCw className="text-amber-500" size={18} />
            <h2 className="text-base font-mono font-bold text-foreground uppercase tracking-wider">
              1. Simulador de Inteligência de Retentativa (Visa & Mastercard MAC)
            </h2>
          </div>
          <RetrySimulator />
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2.5">
            <GitCompare className="text-amber-500" size={18} />
            <h2 className="text-base font-mono font-bold text-foreground uppercase tracking-wider">
              2. Dicionário de Response Codes (DE 39) — Hard vs Soft Decline
            </h2>
          </div>
          <RetriesClient />
        </section>

        {/* 2. ENSINAR APROFUNDADO: Tríade Executiva */}
        <ExecutiveBusinessTriad
          topic="Governança de Retentativas & Multas de Rede"
          subtitle="Como impedir que motores de recorrência transformem tentativas cegas de cobrança em multas silenciosas na fatura da bandeira."
          whatIsIt={{
            lead: "As regras de retentativa definem quais códigos DE 39 podem ser reenviados, com qual backoff mínimo e qual o teto de tentativas em 30 dias.",
            explanation:
              "Recusas Soft (ex: 51 Saldo Insuficiente) permitem nova tentativa em janela apropriada. Recusas Hard (ex: 14 Cartão Inválido, 41/43 Perdido/Roubado) exigem atualização de credencial (Account Updater / novo cartão) antes de qualquer novo envio.",
            analogy:
              "Se o telefone dá ocupado (Soft), ligar mais tarde faz sentido. Se a operadora informa que o número não existe (Hard), rediscar 50 vezes só gera bloqueio por abuso de rede.",
          }}
          painOwner={{
            primaryRole: "Squad de Checkout / Recorrência, Engenharia de Pagamentos & Risco",
            affectedEntities: [
              "Gateways",
              "Adquirentes",
              "Plataformas de Assinatura (SaaS)",
              "E-Commerces com Recorrência",
            ],
            operationalImpact:
              "Crons de cobrança sem filtro por Response Code e MAC acumulam milhares de tentativas proibidas que são tarifadas mensalmente pelas bandeiras.",
          }}
          financialPrice={{
            directPenalty: "Multas por transação excedente nas faturas VSS e MCBS",
            schemeFeesFine: "Encargos de Data Integrity e Excessive Authorization Attempts",
            annualBleedingEstimate:
              "R$ 150.000 a R$ 600.000 / ano em tarifas evitáveis + queda de Approval Rate",
            consequence:
              "Degradação da reputação do MID nos motores antifraude dos bancos emissores.",
          }}
        />
      </div>
    </div>
  );
}
