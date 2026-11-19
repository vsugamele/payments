import { Coins, TrendingUp, CreditCard, ArrowRight } from "lucide-react";
import { SimulatorPage } from "@/components/SimulatorPage";
import { DowngradeMarginSimulator } from "@/components/DowngradeMarginSimulator";
import TermTooltip from "@/components/TermTooltip";
import { ModuleTeachDemoHeader } from "@/components/ModuleTeachDemoHeader";

export const metadata = {
  title: "Simulador e Anatomia de Intercâmbio — VS Payments",
  description:
    "Aprenda a mecânica da precificação de Bandeiras (1. Ensinar) e simule taxas reais e downgrades (2. Demonstrar).",
};

export default function SimuladorRoute() {
  return (
    <main className="bg-background pb-24">
      {/* Cabeçalho Padronizado Lado a Lado: 1. Ensinar ⇄ 2. Demonstrar */}
      <ModuleTeachDemoHeader
        backHref="/compliance"
        backLabel="Voltar para Operação & Simulação"
        categoryPill="Motor de Rateio & Pricing"
        normativeBadge="Res. BCB nº 304/2023 · Visa Fee Schedule · MC GCMS"
        title="Arquitetura do Intercâmbio, Cascata & Downgrade"
        subtitle="Entenda como o MDR se divide entre Intercâmbio (Emissor), Scheme Fee (Bandeira) e Spread (Adquirente), e simule em tempo real as 2.103 regras oficiais de banco de dados."
        teachConcept="A cada compra, o sistema de clearing da bandeira (Visa Base II ou Mastercard GCMS) avalia Produto (BIN/PID), Canal de Captura (CP vs CNP + 3DS), MCC e Prazo de Envio para determinar qual IRD/FPI de intercâmbio remunera o banco emissor."
        teachRule="Resolução BCB nº 304/2023 (vigência 01/04/2023): teto de 0,50% no Débito e 0,70% no Pré-pago. Crédito opera em livre mercado por cascata de qualificação."
        teachPitfall="Se faltar o criptograma 3DS (ECI 05/02), o identificador de token ou o envio ocorrer fora da janela de Timeliness, a venda sofre Downgrade silencioso para uma tarifa Standard/Key-Entered até +65 bps mais cara."
        demoSteps={[
          "1. Na calculadora abaixo, escolha Bandeira (Visa, Mastercard ou Elo), Modalidade, Produto (Infinite/Black vs Standard) e MCC (ex: 5411 Supermercado).",
          "2. Compare o IRD/FPI qualificado com o teto regulatório da Res. BCB 304/2023 no débito/pré-pago.",
          "3. Role até o Simulador de Downgrade para medir o impacto em reais na margem líquida quando campos obrigatórios falham no clearing.",
        ]}
        acervoQuery="Regras de qualificação de intercâmbio IRD PDS 0158 FPI downgrade e Resolução BCB 304/2023"
        lab3dHref="/jornada?track=cartao"
        lab3dLabel="Ver Split do Dinheiro no Lab 3D"
      />

      {/* 1. DEMONSTRAR IMEDIATO: Motor de Cascata de Intercâmbio & Downgrade */}
      <section className="mx-auto max-w-7xl px-6 pt-10 space-y-10">
        <SimulatorPage />
        <DowngradeMarginSimulator />
      </section>

      {/* 2. ENSINAR LADO A LADO: Anatomia do MDR ⇄ Tripé de Precificação */}
      <section className="mx-auto max-w-6xl px-6 pt-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Caixinha Esquerda: A Mecânica do MDR */}
          <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-primary font-bold">
                Caixinha 01 · O Rateio de R$ 100
              </span>
              <h2 className="text-lg font-semibold text-foreground mt-1 flex items-center gap-2">
                <Coins size={18} className="text-primary" /> Anatomia de Custos (MDR)
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                Quando o estabelecimento comercial paga 2,50% de{" "}
                <TermTooltip
                  term="MDR"
                  definition="Merchant Discount Rate: taxa final descontada do lojista pelo adquirente ou subcredenciador."
                />
                , essa taxa é fatiada em três partes. A maior parcela vai para o Banco Emissor a
                título de{" "}
                <TermTooltip
                  term="Intercâmbio"
                  definition="Tarifa regulada pela bandeira (e pelo BCB no débito/pré-pago) paga pela Adquirente ao Banco Emissor pelo risco de crédito, funding e benefícios."
                />
                .
              </p>
            </div>

            <div className="rounded-xl border border-border bg-background p-4">
              <h3 className="text-xs font-mono font-bold text-foreground mb-3 uppercase tracking-wider">
                Exemplo de Divisão do MDR (2,50% sobre R$ 100)
              </h3>

              <div className="flex w-full h-8 rounded-full overflow-hidden mb-3 font-mono font-bold text-[10px] text-white">
                <div
                  className="bg-blue-600 flex items-center justify-start pl-3 w-[60%]"
                  title="Banco Emissor (Intercâmbio)"
                >
                  Intercâmbio (1,50%)
                </div>
                <div
                  className="bg-purple-600 flex items-center justify-start pl-2.5 w-[15%]"
                  title="Bandeira (Scheme Fee)"
                >
                  Fee (0,25%)
                </div>
                <div
                  className="bg-emerald-600 flex items-center justify-start pl-2.5 w-[25%]"
                  title="Adquirente (Spread Líquido)"
                >
                  Spread (0,75%)
                </div>
              </div>

              <div className="flex flex-wrap justify-between items-center text-xs text-muted-foreground mt-3 gap-2">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" /> Emissor (R$ 1,50)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block" /> Bandeira (R$ 0,25)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" /> Adquirente (R$ 0,75)
                </span>
              </div>
            </div>
          </div>

          {/* Caixinha Direita: Os 3 Eixos da Cascata */}
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold">
                Caixinha 02 · Árvore de Decisão
              </span>
              <h2 className="text-lg font-semibold text-foreground mt-1 flex items-center gap-2">
                <TrendingUp size={18} className="text-emerald-600 dark:text-emerald-400" /> Tripé de Precificação (As Variáveis)
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                Para definir qual{" "}
                <TermTooltip
                  term="IRD"
                  definition="Interchange Rate Designator (Mastercard PDS 0158) ou Fee Program Indicator (Visa Base II): o código exato da faixa tarifária aplicada no clearing."
                />{" "}
                será aplicado no clearing, o motor avalia três eixos principais:
              </p>
            </div>

            <ul className="text-sm space-y-3">
              <li className="flex gap-3 rounded-xl border border-border bg-background p-3.5">
                <div className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                  <CreditCard size={12} />
                </div>
                <div>
                  <span className="text-foreground font-semibold block text-xs sm:text-sm">
                    1. O Produto (BIN / PID / Funding Source)
                  </span>
                  <span className="text-muted-foreground text-xs leading-relaxed">
                    Cartões Black/Infinite remuneram programas de pontos e têm intercâmbio mais alto
                    no crédito; Débito (0,50%) e Pré-pago (0,70%) respeitam o teto do BCB.
                  </span>
                </div>
              </li>
              <li className="flex gap-3 rounded-xl border border-border bg-background p-3.5">
                <div className="w-6 h-6 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[10px] font-mono font-bold">CNL</span>
                </div>
                <div>
                  <span className="text-foreground font-semibold block text-xs sm:text-sm">
                    2. O Canal & Autenticação (CP EMV/NFC vs CNP 3DS 2.2)
                  </span>
                  <span className="text-muted-foreground text-xs leading-relaxed">
                    Transações presenciais com chip/NFC (EMV) ou e-commerce autenticado via{" "}
                    <TermTooltip
                      term="3DS 2.2 (ECI 05/02)"
                      definition="Autenticação EMV 3-D Secure que ativa Liability Shift e qualifica a venda para tarifas incentivadas."
                    />{" "}
                    qualificam para tiers mais baratos.
                  </span>
                </div>
              </li>
              <li className="flex gap-3 rounded-xl border border-border bg-background p-3.5">
                <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[10px] font-mono font-bold">MCC</span>
                </div>
                <div>
                  <span className="text-foreground font-semibold block text-xs sm:text-sm">
                    3. O Segmento do Lojista (MCC & Número de Parcelas)
                  </span>
                  <span className="text-muted-foreground text-xs leading-relaxed">
                    Supermercados (5411), Postos (5541), Educação (8299) e Saúde contam com tabelas
                    setoriais específicas; parcelado (2-6x vs 7-12x) altera o degrau da tarifa.
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 3. Guia Técnico de Provisionamento D+0 Lado a Lado: Visa vs Mastercard */}
      <section className="mx-auto max-w-6xl px-6 pt-10">
        <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-primary font-bold">
              Provisionamento & Reconciliação D+0
            </span>
            <h2 className="text-lg font-semibold text-foreground mt-1">
              Onde o Intercâmbio Real vem Carimbado nos Arquivos de Clearing
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mt-1">
              A autorização (0100/0110) apenas reserva o limite. O custo real de intercâmbio é
              apurado no arquivo de clearing e conciliado nos relatórios financeiros de liquidação.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Visa VSS */}
            <div className="rounded-xl border border-border bg-background p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold font-mono">
                  V
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm">Visa (Base II / VSS)</h3>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    TC05 Outgoing · Relatórios VSS-110 / VSS-120
                  </span>
                </div>
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm text-muted-foreground">
                <li className="flex gap-2 items-start">
                  <ArrowRight size={14} className="mt-1 text-blue-500 shrink-0" />
                  <span>
                    <strong className="text-foreground">Arquivo de Clearing:</strong> Edit Package /
                    Base II (.CTF de 168 bytes por TCR).
                  </span>
                </li>
                <li className="flex gap-2 items-start">
                  <ArrowRight size={14} className="mt-1 text-blue-500 shrink-0" />
                  <span>
                    <strong className="text-foreground">Motor de Liquidação:</strong> VisaNet
                    Settlement Service (VSS), detalhado nos relatórios{" "}
                    <TermTooltip
                      term="VSS-110 / VSS-120"
                      definition="Relatórios oficiais de settlement da Visa com sumarização de Interchange e Scheme Fees."
                    />
                    .
                  </span>
                </li>
                <li className="flex gap-2 items-start">
                  <ArrowRight size={14} className="mt-1 text-blue-500 shrink-0" />
                  <span>
                    <strong className="text-foreground">Campos Críticos:</strong>{" "}
                    <code>Fee Program Indicator (FPI)</code>, <code>Product ID (PID)</code>,{" "}
                    <code>Account Funding Source (AFS)</code> e{" "}
                    <code>Reimbursement Attribute</code>.
                  </span>
                </li>
              </ul>
            </div>

            {/* Mastercard GCMS */}
            <div className="rounded-xl border border-border bg-background p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold font-mono">
                  M
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm">Mastercard (GCMS / IPM)</h3>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    MTI 1240 Outgoing · T112/T114 & MCBS
                  </span>
                </div>
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm text-muted-foreground">
                <li className="flex gap-2 items-start">
                  <ArrowRight size={14} className="mt-1 text-amber-500 shrink-0" />
                  <span>
                    <strong className="text-foreground">Arquivo de Clearing:</strong> Integrated
                    Product Messages (.IPM codificado em TLV / PDS).
                  </span>
                </li>
                <li className="flex gap-2 items-start">
                  <ArrowRight size={14} className="mt-1 text-amber-500 shrink-0" />
                  <span>
                    <strong className="text-foreground">Motor de Cálculo:</strong> Global Clearing
                    Management System (GCMS), que valida MCC, CVM, 3DS e Timeliness.
                  </span>
                </li>
                <li className="flex gap-2 items-start">
                  <ArrowRight size={14} className="mt-1 text-amber-500 shrink-0" />
                  <span>
                    <strong className="text-foreground">Campos Críticos:</strong>{" "}
                    <code>DE 048</code> e <code>PDS 0158 (Interchange Rate Designator - IRD)</code>{" "}
                    retornado nos arquivos de incoming/acknowledge T112/T114.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
