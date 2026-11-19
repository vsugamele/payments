import AdvogadoDigitalClient from "./AdvogadoDigitalClient";
import { DmasTimeline } from "./DmasTimeline";
import { BadgeDollarSign } from "lucide-react";
import RuleReference from "@/components/RuleReference";
import { ModuleTeachDemoHeader } from "@/components/ModuleTeachDemoHeader";

export const metadata = {
  title: "Advogado Digital de Disputas & Chargebacks — VS Payments",
  description:
    "Escolha o Reason Code do chargeback (1. Ensinar) e receba prazo, estratégia de defesa, Compelling Evidence 3.0 e timeline DMAS/VROL (2. Demonstrar).",
};

interface Props {
  searchParams: Promise<{ code?: string }>;
}

export default async function DisputePage({ searchParams }: Props) {
  const params = await searchParams;
  const initialCode = params?.code;

  return (
    <div className="bg-background min-h-screen pb-24">
      <ModuleTeachDemoHeader
        backHref="/compliance"
        backLabel="Voltar para Operação & Simulação"
        categoryPill="Disputas, VROL & MCOM"
        normativeBadge="Visa Dispute Rules (CE 3.0) · Mastercard Chargeback Guide"
        title="Advogado Digital de Disputas & Chargebacks"
        subtitle={
          initialCode
            ? `Analisando Reason Code ${initialCode} — árvore forense de defesa, prazos de reapresentação, Compelling Evidence 3.0 e custos de arbitragem.`
            : "Selecione o Reason Code do chargeback para inspecionar a árvore de decisão normativa, documentos exigidos na reapresentação e risco de arbitragem."
        }
        teachConcept="Quando o titular contesta uma compra, o emissor abre uma disputa via Visa VROL (condições 10.x a 13.x) ou Mastercard MCOM (códigos 48xx). O adquirente tem janela estrita (tipicamente 30 a 45 dias corridos) para reapresentar evidências ou aceitar o débito."
        teachRule="Visa Compelling Evidence 3.0 (regra 10.4) & Mastercard First-Party Trust: permitem reverter fraude amigável comprovando 2 transações históricas não contestadas (>120 dias) com vínculo de Device ID, IP ou endereço de entrega."
        teachPitfall="Escalar uma disputa perdida para Arbitragem na bandeira sem evidência documental obrigatória gera multa de USD/EUR 400 a 500+ por caso para a parte perdedora, superando o valor da venda original."
        demoSteps={[
          "1. Selecione abaixo a Bandeira (Visa ou Mastercard) e o Reason Code (ex: 10.4 Fraude CNP ou 4837 No Cardholder Authorization).",
          "2. Verifique os documentos obrigatórios por ordem de força probatória e os prazos fatais na Timeline DMAS/VROL.",
          "3. Clique em 'Consultar nos 4 Bancos SQLite do Acervo' para buscar a regra literal do Reason Code nos manuais oficiais.",
        ]}
        acervoQuery={
          initialCode
            ? `Reason Code ${initialCode} chargeback reapresentação Compelling Evidence 3.0`
            : "Chargeback Reason Code 10.4 4837 Compelling Evidence 3.0 VROL MCOM"
        }
        lab3dHref="/jornada?track=contestacao_ce3"
        lab3dLabel="Ver Fluxo CE 3.0 no Lab 3D"
      />

      {/* ── Conteúdo Principal ── */}
      <div className="mx-auto max-w-6xl px-6 pt-10 space-y-10">
        <AdvogadoDigitalClient initialCode={initialCode} />

        {/* ── Grid Lado a Lado: Custo da Arbitragem ⇄ Timeline DMAS ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Custo da Arbitragem */}
          <div className="rounded-2xl border border-red-500/25 bg-red-500/5 p-6 space-y-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <BadgeDollarSign size={16} className="text-red-500" />
              O Custo Real da Arbitragem na Bandeira
            </h3>
            <div className="space-y-3 text-sm">
              {[
                {
                  label: "Filing Fee",
                  value: "USD/EUR 150",
                  desc: "Taxa de abertura apenas para o caso ser protocolado no comitê",
                },
                {
                  label: "Review Fee",
                  value: "USD/EUR 250",
                  desc: "Taxa de julgamento cobrada da instituição perdedora da disputa",
                },
                {
                  label: "Withdrawal Fee",
                  value: "USD 100",
                  desc: "Cobrado se houver desistência após abertura do Pre-Arbitration",
                },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-2" />
                  <div>
                    <span className="text-foreground font-semibold">{item.label}:</span>{" "}
                    <span className="font-mono font-semibold text-red-600 dark:text-red-400">
                      {item.value}
                    </span>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3.5 rounded-xl border border-red-500/20 bg-background text-xs text-foreground/90 leading-relaxed">
              <strong>Regra de Ouro:</strong> Nunca escale à Arbitragem se o ticket da disputa for
              inferior a USD 500, salvo se todos os requisitos de Liability Shift (ECI 05/02) ou CE
              3.0 estiverem comprovados nos campos do clearing.{" "}
              <RuleReference
                manual="Mastercard Chargeback Guide"
                chapter="Arbitration & Compliance"
                label="Ver manual"
              />
            </div>
          </div>

          {/* Timeline DMAS Interativa */}
          <DmasTimeline />
        </div>
      </div>
    </div>
  );
}
