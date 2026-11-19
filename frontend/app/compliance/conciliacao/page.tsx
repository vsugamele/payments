import Link from "next/link";
import { ConciliacaoClient } from "./ConciliacaoClient";
import { ExecutiveBusinessTriad } from "@/components/ExecutiveBusinessTriad";
import { ModuleTeachDemoHeader } from "@/components/ModuleTeachDemoHeader";

export const metadata = {
  title: "Playbook de Conciliação Financeira: VSS 110, MCBS & CIP — VS Payments",
  description:
    "Roteiro canônico de batimento em três pontas (1. Ensinar) e bancada interativa de conciliação Captura vs Bandeira vs SLC/CIP (2. Demonstrar).",
};

export default function ConciliacaoPage() {
  return (
    <main className="bg-background pb-24">
      <ModuleTeachDemoHeader
        backHref="/compliance"
        backLabel="Voltar para Operação & Simulação"
        categoryPill="Tesouraria & Reconciliação"
        normativeBadge="Visa VSS-110/120 · Mastercard T140/MCBS · CIP SLC (ASLC026)"
        title="Conciliação Financeira em 3 e 4 Pontas (VSS, MCBS & CIP/SLC)"
        subtitle="Cruze a captura interna com o clearing da bandeira (VSS 110/120 e GCMS/MCBS), o registro de URs (B3/CERC) e a liquidação multilateral na CIP/Núclea e STR."
        teachConcept="A conciliação de pagamentos exige bater cada centavo entre: (1) Ledger interno de captura, (2) Relatório de liquidação da bandeira (VSS-110/120 na Visa e T140/MCBS na Mastercard), (3) Agenda registrada na Registradora (Res. BCB 264) e (4) Grade financeira na CIP/SLC (ASLC026/031)."
        teachRule="Resolução BCB nº 264/2022 (Unidades de Recebíveis e trava/ônus) + Grade SLC/Núclea + Regras de Settlement Visa VSS e Mastercard Consolidated Billing System."
        teachPitfall="Confiar apenas no arquivo enviado no Outgoing sem conciliar o retorno (EP747 / T112 / VSS-110) esconde rejeições T+0, downgrades de intercâmbio e débitos automáticos de tarifas MCBS/VSS."
        demoSteps={[
          "1. Na bancada interativa abaixo, inspecione o fluxo de batimento entre Captura, Clearing da Bandeira e Liquidação CIP/STR.",
          "2. Compare como divergências de Intercâmbio (Downgrade), Chargeback ou Scheme Fee aparecem em cada relatório.",
          "3. Clique em 'Consultar nos 4 Bancos SQLite do Acervo' para auditar os campos de VSS-110, T140 e arquivos ASLC026/028/031.",
        ]}
        acervoQuery="Conciliação financeira VSS-110 VSS-120 MCBS T140 e grade CIP SLC ASLC026 ASLC031"
        lab3dHref="/jornada?track=clearing_slc"
        lab3dLabel="Ver Liquidação SLC/B3 no Lab 3D"
      />

      {/* ── Plataforma de Conciliação Interativa (2. Demonstrar em destaque) ── */}
      <section className="mx-auto max-w-6xl px-6 pt-8">
        <ConciliacaoClient />
      </section>

      {/* ── Tríade Executiva de Negócios (1. Ensinar aprofundado) ── */}
      <section className="mx-auto max-w-6xl px-6 pt-10">
        <ExecutiveBusinessTriad
          topic="Conciliação Financeira & Batimento em Três Pontas"
          subtitle="O processo diário que impede que a diferença entre o que o sistema acha que processou e o que a bandeira liquidou vire perda contábil."
          whatIsIt={{
            lead: "A conciliação em três pontas é a conferência cruzada entre: 1) Captura interna (POS/Gateway), 2) Clearing da bandeira (VSS 110 / MCBS) e 3) Liquidação bancária (CIP / Bacen STR).",
            explanation:
              "As adquirentes autorizam transações em tempo real, mas o dinheiro só é compensado em lotes multilaterais. Se houver divergência de intercâmbio (downgrade), rejeição de registro ou cobrança na fatura de rede, apenas o batimento aponta a discrepância antes do fechamento contábil.",
            analogy:
              "É como auditar uma operação comparando os pedidos emitidos no caixa, o demonstrativo da processadora e o extrato bancário onde o depósito líquido caiu.",
          }}
          painOwner={{
            primaryRole: "Head de Conciliação Financeira, Controller & Diretor de Tesouraria",
            affectedEntities: [
              "Adquirentes",
              "Subadquirentes",
              "Grandes Lojistas / Marketplaces",
              "Instituições de Pagamento",
            ],
            operationalImpact:
              "Se a equipe não identificar divergências dentro da janela regulamentar da bandeira, o direito de contestação operacional preclui e a instituição absorve a perda.",
          }}
          financialPrice={{
            directPenalty:
              "Vazamento cumulativo de centavos por transação em downgrades e rejeições não reprocessadas",
            schemeFeesFine:
              "Tarifas de rede duplicadas ou penalidades operacionais de Data Integrity não auditadas",
            annualBleedingEstimate:
              "R$ 480.000 a R$ 2.400.000 / ano em perda invisível para operações de médio e grande porte",
            consequence:
              "Ressalva em auditoria contábil, descasamento de saldo em conta de liquidação e risco regulatório perante o Banco Central.",
          }}
        />
      </section>

      {/* ── Navegação de Aprofundamento ── */}
      <section className="mx-auto max-w-6xl px-6 pt-10 mt-10 border-t border-border">
        <h3 className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest mb-4">
          Ferramentas & Mapas Relacionados
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/mapa/liquidacao"
            className="p-4 rounded-xl bg-card border border-border hover:border-primary/40 transition-all group"
          >
            <div className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors mb-1">
              Atlas de Liquidação VisaNet & MCBS
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Diagramas interativos completos de ciclos D+0 a D+3 e fluxos multilaterais.
            </p>
          </Link>
          <Link
            href="/compliance/outgoing"
            className="p-4 rounded-xl bg-card border border-border hover:border-primary/40 transition-all group"
          >
            <div className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors mb-1">
              Especificação de Outgoing & Conciliação 4 Pontas
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Simule o batimento de 4 pontas (Autorização × Outgoing × Retorno × SLC/B3) no Lab Suite.
            </p>
          </Link>
          <Link
            href="/simulador"
            className="p-4 rounded-xl bg-card border border-border hover:border-primary/40 transition-all group"
          >
            <div className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors mb-1">
              Simulador de Intercâmbio & Downgrade
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Calcule taxas e projete o impacto financeiro de downgrades em tempo real.
            </p>
          </Link>
        </div>
      </section>
    </main>
  );
}
