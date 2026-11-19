import ThreeDSMatrixClient from "./ThreeDSMatrixClient";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ExecutiveBusinessTriad } from "@/components/ExecutiveBusinessTriad";
import { ModuleTeachDemoHeader } from "@/components/ModuleTeachDemoHeader";

export const metadata = {
  title: "Matriz 3DS Liability Shift & ECI | VS Payments",
  description:
    "Descubra qual o valor ECI retornado pelo fluxo 3-D Secure (1. Ensinar) e simule quando o Liability Shift é ativado a favor do lojista (2. Demonstrar).",
};

export default function ThreeDSPage() {
  return (
    <div className="bg-background min-h-screen pb-24">
      <ModuleTeachDemoHeader
        backHref="/compliance"
        backLabel="Voltar para Operação & Simulação"
        categoryPill="Autenticação & E-Commerce"
        normativeBadge="EMV 3-D Secure 2.2 · Visa DE 60.8 · Mastercard DE 48.42 (UCAF)"
        title="Matriz 3DS 2.2, ECI & Liability Shift"
        subtitle="Simule cenários Frictionless, Challenge e Attempts no 3-D Secure 2.2 e descubra exatamente quando o risco de fraude CNP sai do lojista e passa ao banco emissor."
        teachConcept="O protocolo EMV 3-D Secure 2.2 autentica o portador perante o banco emissor durante o checkout online. Ao concluir a autenticação, o Directory Server devolve o indicador ECI (05/06 na Visa; 02/01 na Mastercard) e o criptograma CAVV/AAV."
        teachRule="Visa Core Rules & Mastercard Transaction Processing Rules (Liability Shift Matrix): transações com ECI 05/02 (Autenticado) ou ECI 06/01 elegível (Attempt / Emissor não participante) transferem o ônus de chargeback de fraude (RC 10.4 / 4837) para o emissor."
        teachPitfall="Autenticar o cliente no 3DS Server mas esquecer de repassar o ECI e o CAVV/AAV na mensagem ISO 8583 de autorização (0100) e no arquivo de clearing (TC05 / IPM) anula o Liability Shift e gera downgrade de intercâmbio."
        demoSteps={[
          "1. No Simulador logo abaixo, escolha a Bandeira (Visa ou Mastercard) e o resultado da jornada 3DS (Frictionless, Challenge, Attempt, Failed ou Bypassed).",
          "2. Verifique o código ECI gerado, quem assume o prejuízo em caso de fraude (Lojista vs Emissor) e o impacto na tarifa de intercâmbio.",
          "3. Clique em 'Consultar nos 4 Bancos SQLite do Acervo' para auditar onde o ECI e o CAVV/AAV entram na ISO 8583 e no clearing.",
        ]}
        acervoQuery="3DS 2.2 Liability Shift ECI 05 06 02 01 CAVV AAV DE 60.8 DE 48.42 UCAF"
        lab3dHref="/jornada?track=contestacao_ce3"
        lab3dLabel="Ver 3DS & CE 3.0 no Lab 3D"
      />

      <div className="mx-auto max-w-5xl px-6 pt-10 space-y-12">
        {/* 1. DEMONSTRAR IMEDIATO: Simulador de ECI e Risco */}
        <section>
          <ThreeDSMatrixClient />
        </section>

        {/* 2. ENSINAR LADO A LADO: ISO 8583 Visa vs Mastercard ⇄ Tokenização Cloud */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card border border-border p-6 rounded-2xl space-y-4">
            <span className="font-mono text-[10px] uppercase tracking-wider text-primary font-bold">
              Caixinha 01 · Mapeamento ISO 8583
            </span>
            <h3 className="font-semibold text-foreground text-base">
              Como Trafegar o ECI e o Criptograma na Autorização
            </h3>
            <div className="space-y-3">
              <div className="rounded-xl border border-border bg-background p-3.5">
                <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                  VISA (DE 60.8 + DE 126.9 / Tag CAVV)
                </span>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  O ECI (05, 06 ou 07) trafega no subcampo <code>DE 60.8</code> (MOTO/ECI Indicator),
                  acompanhado do valor de 20 bytes do <code>CAVV</code> e do <code>3DS Server Trans ID</code>.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-background p-3.5">
                <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                  MASTERCARD (DE 48 SE 42/43 — UCAF & AAV)
                </span>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  A Mastercard trafega o indicador UCAF/ECI (02, 01 ou 00), o criptograma{" "}
                  <code>AAV</code> e o <code>Directory Server Transaction ID (PDS 0212)</code> no
                  clearing IPM.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border p-6 rounded-2xl flex flex-col justify-between gap-4">
            <div className="space-y-3">
              <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold">
                Caixinha 02 · Tokenização & DAF
              </span>
              <h3 className="font-semibold text-foreground text-base">
                Quando a Carteira Digital Dispensa o Desafio 3DS
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Em pagamentos via <strong>Apple Pay</strong> e <strong>Google Pay</strong> com
                Network Tokens (VTS / MDES), a biometria nativa do dispositivo gera um criptograma
                EMV/TAVV que concede Liability Shift automático sem abrir tela de desafio OTP.
              </p>
            </div>
            <Link
              href="/compliance/tokenizacao"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline w-fit"
            >
              Ver Bancada de DAF & Tokenização <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* 3. Tríade Executiva */}
        <ExecutiveBusinessTriad
          topic="3-D Secure & Inversão do Ônus de Fraude (Liability Shift)"
          subtitle="A blindagem normativa que transfere o prejuízo de chargebacks de fraude CNP para o banco emissor."
          whatIsIt={{
            lead: "3DS 2.2 é o protocolo EMVCo que autentica o portador perante o seu banco durante o checkout digital.",
            explanation:
              "Quando a autenticação é concluída com sucesso (ou quando o emissor não suporta desafio mas responde Attempt elegível), o protocolo gera o criptograma CAVV/AAV e o ECI (05/06 ou 02/01), transferindo o risco de fraude para o emissor.",
            analogy:
              "É o equivalente digital à validação do chip com senha presencial: se o emissor atestou a identidade, o lojista fica protegido contra alegação de compra não reconhecida.",
          }}
          painOwner={{
            primaryRole:
              "Head de E-Commerce, Diretor de Riscos / Fraude & Product Manager de Checkout",
            affectedEntities: [
              "Lojistas Virtuais",
              "Marketplaces",
              "Subadquirentes",
              "Gateways de Pagamento",
            ],
            operationalImpact:
              "Desligar 3DS de forma indiscriminada expõe a operação a 100% dos chargebacks de fraude e a tarifas de intercâmbio CNP não autenticadas mais altas.",
          }}
          financialPrice={{
            directPenalty: "+45 a +60 bps no Intercâmbio e scheme fees de CNP não autenticado",
            schemeFeesFine: "Exposição direta a perdas sob Reason Code 10.4 (Visa) e 4837 (Mastercard)",
            annualBleedingEstimate: "0,70% a 2,00% do GMV comprometido em disputas e custos de fraude",
            consequence:
              "Risco de enquadramento nos programas Visa VAMP e Mastercard ECP/EFM.",
          }}
        />
      </div>
    </div>
  );
}
