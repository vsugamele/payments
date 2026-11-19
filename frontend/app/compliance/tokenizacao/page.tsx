import TokenLifecycleClient from "./TokenLifecycleClient";
import DafSimulator from "@/components/DafSimulator";
import TermTooltip from "@/components/TermTooltip";
import { BookOpen, ShieldCheck } from "lucide-react";
import RuleReference from "@/components/RuleReference";
import { ModuleTeachDemoHeader } from "@/components/ModuleTeachDemoHeader";

export const metadata = {
  title: "Tokenização & Ciclo de Vida (VTS/MDES) | VS Payments",
  description:
    "Aprenda por que o Token de rede é vivo (1. Ensinar) e simule ciclo de vida e DAF Liability Shift (2. Demonstrar).",
};

export default function TokenizacaoPage() {
  return (
    <div className="bg-background min-h-screen pb-24">
      <ModuleTeachDemoHeader
        backHref="/compliance"
        backLabel="Voltar para Operação & Simulação"
        categoryPill="Segurança & Aprovação"
        normativeBadge="EMVCo Tokenisation · Visa VTS · Mastercard MDES"
        title="Tokenização de Rede & Ciclo de Vida (VTS / MDES)"
        subtitle="Substitua o PAN estático por DPANs/Tokens de rede com criptograma TAVV/CAVV dinâmico, elevando a aprovação em recorrência e ativando Liability Shift via DAF."
        teachConcept="Na tokenização de rede (Visa Token Service e Mastercard Digital Enablement Service), o número real do cartão (FPAN) é substituído por um token restrito ao domínio (Merchant, Device ou COF), acompanhado de um criptograma dinâmico por transação."
        teachRule="Visa Core Rules Cap. 8 (VTS / DAF) & Mastercard MDES Rules: tokens sobrevivem à reemissão do plástico físico via Account Updater automático no cofre da bandeira."
        teachPitfall="Tentar processar uma cobrança inicial com token sem enviar o criptograma TAVV/DSRP ou omitir o TIDI (Token ID Indicator) nas recorrências subsequentes derruba a aprovação e perde a qualificação de tarifa."
        demoSteps={[
          "1. No Módulo 1 abaixo, alterne os estados do Token (Active, Suspended, Resumed, Updated, Deleted) e veja o comportamento da autorização.",
          "2. No Módulo 2, simule o DAF (Digital Authentication Framework) com biometria do dispositivo para verificar o Liability Shift imediato.",
          "3. Clique em 'Consultar nos 4 Bancos SQLite do Acervo' para inspecionar as tags DE 48/DE 55 e tarifas MCBS (2AB1706 / 2AB2600).",
        ]}
        acervoQuery="Tokenização VTS MDES criptograma TAVV DSRP TIDI e tarifas MCBS 2AB1706 2AB2600"
        lab3dHref="/jornada?track=cartao"
        lab3dLabel="Ver Tokenização no Lab 3D"
      />

      <div className="mx-auto max-w-6xl px-6 pt-10 space-y-16">
        {/* ── Módulo 1: O Ciclo de Vida Interativo ── */}
        <section className="space-y-4">
          <div className="max-w-3xl">
            <span className="font-mono text-[11px] uppercase tracking-wider text-primary font-bold">
              Caixinha 01 · Estados do Cofre VTS / MDES
            </span>
            <h2 className="text-xl font-semibold text-foreground mt-1 flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-primary" />
              1. Laboratório de Ciclo de Vida do Token
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mt-1">
              Diferente de um número de cartão físico, um token pode ser{" "}
              <strong className="text-foreground">suspenso</strong>,{" "}
              <strong className="text-foreground">reativado</strong> ou{" "}
              <strong className="text-foreground">atualizado</strong> sem que o portador precise
              redigitar o cartão no checkout.
            </p>
          </div>
          <TokenLifecycleClient />
        </section>

        {/* ── Módulo 2: DAF & Isenção de 3DS ── */}
        <section className="pt-10 border-t border-border space-y-4">
          <div className="max-w-3xl">
            <span className="font-mono text-[11px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold">
              Caixinha 02 · Carteiras Digitais & Biometria
            </span>
            <h2 className="text-xl font-semibold text-foreground mt-1 flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              2. Simulador DAF (Digital Authentication Framework)
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mt-1">
              O DAF permite que transações de carteiras digitais (Apple Pay / Google Pay) e
              credenciais biométricas obtenham{" "}
              <strong className="text-foreground">Liability Shift</strong> imediato sem fricção de
              OTP.
            </p>
          </div>
          <DafSimulator />
        </section>

        {/* ── Seção de Referência Normativa Lado a Lado ── */}
        <section className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-2.5">
            <BookOpen className="text-primary" size={18} />
            <h3 className="text-xs font-mono font-bold text-foreground uppercase tracking-wider">
              Resumo Lado a Lado: Fundamentos vs Regra de Ouro (TIDI / TAF)
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-muted-foreground leading-relaxed">
            <div className="space-y-3 rounded-xl border border-border bg-background p-5">
              <p>
                <strong className="text-foreground">O Fim do PAN em Claro:</strong> No e-commerce
                tradicional, o lojista armazena ou trafega o{" "}
                <TermTooltip term="PAN" definition="Primary Account Number (16 dígitos do plástico)" />.
                Quando o cartão vence ou é reemitido por perda, a recorrência falha com código{" "}
                <code>54 (Expired Card)</code> ou <code>14 (Invalid Card)</code>.
              </p>
              <p>
                <strong className="text-foreground">Criptograma por Transação:</strong> Com VTS e
                MDES, o emissor vincula o token ao Merchant ID (MID) ou ao Device e valida o
                criptograma dinâmico na autorização.
              </p>
            </div>
            <div className="space-y-3 rounded-xl border border-border bg-background p-5">
              <div className="flex items-center gap-2 text-primary font-semibold">
                <ShieldCheck size={16} /> Regra de Ouro em Recorrência (CIT ➔ MIT)
              </div>
              <p className="text-xs sm:text-sm leading-relaxed">
                Na primeira transação iniciada pelo titular (CIT), trafegue o criptograma de
                provisionamento e guarde o <strong>Transaction Identifier (TID / Trace ID)</strong>.
                Nas cobranças recorrentes iniciadas pelo lojista (MIT), envie o indicador{" "}
                <strong>TIDI / Cit-Mit Framework</strong> na ISO 8583 para preservar a taxa de
                aprovação.{" "}
                <RuleReference
                  manual="Visa Core Rules"
                  chapter="Chapter 8: Tokenization"
                  label="VCR: Tokenization"
                />
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
