import { AlertCircle, ShieldAlert, FileWarning, Zap, CheckCircle2 } from "lucide-react";
import RiscoClient from "./RiscoClient";
import TermTooltip from "@/components/TermTooltip";
import RuleReference from "@/components/RuleReference";
import { ModuleTeachDemoHeader } from "@/components/ModuleTeachDemoHeader";

export const metadata = {
  title: "Monitoramento de Risco (VAMP, ECP & EFM) — VS Payments",
  description:
    "Playbook de programas de monitoramento de fraude e disputas (1. Ensinar) e calculadora tática de BPS do portfólio (2. Demonstrar).",
};

export default function RiscoPage() {
  return (
    <main className="bg-background pb-24">
      <ModuleTeachDemoHeader
        backHref="/compliance"
        backLabel="Voltar para Operação & Simulação"
        categoryPill="Risco, Fraude & Programas de Rede"
        normativeBadge="Visa VAMP (TC40 + TC15) · Mastercard ECP / EFM (SAFE)"
        title="Monitoramento de Risco & Programas de Bandeira (VAMP / ECP)"
        subtitle="Calcule o índice em Basis Points (bps) do seu portfólio e entenda como relatórios de fraude (TC40/SAFE) e disputas disparam penalidades nas bandeiras."
        teachConcept="Os programas de monitoramento das bandeiras (Visa Acquirer Monitoring Program — VAMP e Mastercard Excessive Chargeback / Fraud Program — ECP/EFM) medem a proporção mensal de fraudes reportadas (TC40/SAFE) e disputas (TC15/48xx) sobre o volume de vendas."
        teachRule="Visa Core Rules Cap. 11 (VAMP unifica fraude TC40 + disputas não-fraude TC15 em um único ratio em bps) & Mastercard Security Rules Cap. 8 (ECP e EFM com isenção por adoção de 3DS 2.2)."
        teachPitfall="Acreditar que reembolsar o cliente após a autorização evita o VAMP: uma vez que o banco emissor transmite o aviso de fraude TC40 ou SAFE, o evento já entra no numerador do índice da bandeira mesmo sem chargeback financeiro."
        demoSteps={[
          "1. Na Calculadora Tática logo abaixo, informe o volume mensal de transações e a quantidade de fraudes (TC40/SAFE) e chargebacks.",
          "2. Verifique o score em Basis Points (bps) e se o portfólio cai em faixa Normal, Early Warning ou Enquadramento com multa.",
          "3. Clique em 'Consultar nos 4 Bancos SQLite do Acervo' para auditar os limiares atualizados do Visa VAMP e Mastercard ECP.",
        ]}
        acervoQuery="Visa VAMP TC40 TC15 basis points limiares e Mastercard ECP EFM SAFE"
        lab3dHref="/jornada?track=contestacao_ce3"
        lab3dLabel="Ver Fluxo de Disputa e VAMP no Lab 3D"
      />

      {/* 1. DEMONSTRAR IMEDIATO: Calculadora Tática de Portfólio */}
      <section className="mx-auto max-w-6xl px-6 pt-10">
        <RiscoClient />
      </section>

      {/* 2. ENSINAR LADO A LADO: Assimetria do Risco (TC40) ⇄ Checklist de Evitação */}
      <section className="mx-auto max-w-6xl px-6 pt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Lado Esquerdo: A Mecânica */}
          <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold">
                Caixinha 01 · Como a Bandeira Conta
              </span>
              <h2 className="text-lg font-semibold text-foreground mt-1 flex items-center gap-2">
                <ShieldAlert size={18} className="text-amber-500" /> A Assimetria do Risco (TC40 & SAFE)
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                As bandeiras não monitoram apenas estornos financeiros concluídos. O VAMP da Visa e
                o EFM da Mastercard contabilizam o{" "}
                <TermTooltip
                  term="TC40 / SAFE"
                  definition="Notificação de fraude enviada pelo banco emissor à bandeira quando o titular reporta compra não reconhecida, independentemente do chargeback."
                />
                {" "}assim que o emissor registra a ocorrência.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-background p-4 space-y-3">
              <h3 className="text-xs font-mono font-bold text-foreground uppercase tracking-wider">
                A Linha do Tempo do Enquadramento
              </h3>

              <div className="space-y-2.5">
                <div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card">
                  <div className="w-7 h-7 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0 mt-0.5">
                    <Zap size={13} />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground text-xs">
                      1. Transação Aprovada sem 3DS
                    </div>
                    <div className="text-muted-foreground text-xs leading-relaxed">
                      Compra CNP passa sem autenticação 3DS 2.2 (sem Liability Shift).
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card">
                  <div className="w-7 h-7 rounded-full border border-red-500/30 bg-red-500/10 text-red-500 flex items-center justify-center shrink-0 mt-0.5">
                    <FileWarning size={13} />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground text-xs">
                      2. Emissão de TC40 (Visa) / SAFE (Mastercard)
                    </div>
                    <div className="text-muted-foreground text-xs leading-relaxed">
                      Titular contesta no banco. Emissor envia registro de fraude em D+1.{" "}
                      <strong className="text-foreground">O VAMP já contabiliza aqui.</strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card">
                  <div className="w-7 h-7 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0 mt-0.5">
                    <AlertCircle size={13} />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground text-xs">
                      3. Chargeback Financeiro (TC15 / MTI 1442)
                    </div>
                    <div className="text-muted-foreground text-xs leading-relaxed">
                      Débito financeiro no clearing. Contabilizado nos limiares mensais de ECP e
                      VAMP.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lado Direito: Checklist de Evitação */}
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold">
                Caixinha 02 · Plano de Contenção
              </span>
              <h2 className="text-lg font-semibold text-foreground mt-1 flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-500" /> Alavancas de Mitigação Imediata
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                O indicador oficial é medido em{" "}
                <TermTooltip
                  term="BPS"
                  definition="Basis Points: 100 bps equivalem a 1,00% (0,01). 90 bps equivalem a 0,90%."
                />
                . Para reduzir a razão antes do fechamento mensal:
              </p>
            </div>

            <ul className="text-sm space-y-3">
              <li className="flex gap-3 rounded-xl border border-border bg-background p-3.5">
                <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-mono text-xs font-bold">
                  1
                </div>
                <div>
                  <span className="text-foreground font-semibold block text-xs sm:text-sm flex items-center gap-2 flex-wrap">
                    Roteamento seletivo para 3DS 2.2{" "}
                    <RuleReference
                      manual="Mastercard Rules"
                      chapter="Chapter 8: EFM Exemptions"
                    />
                  </span>
                  <span className="text-muted-foreground text-xs leading-relaxed">
                    Transações autenticadas com sucesso no 3DS 2.2 (ECI 05 / 02) transferem o
                    Liability Shift ao emissor e protegem os indicadores de fraude CNP.
                  </span>
                </div>
              </li>
              <li className="flex gap-3 rounded-xl border border-border bg-background p-3.5">
                <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-mono text-xs font-bold">
                  2
                </div>
                <div>
                  <span className="text-foreground font-semibold block text-xs sm:text-sm">
                    Isolamento por Sub-Merchant / MCC Crítico
                  </span>
                  <span className="text-muted-foreground text-xs leading-relaxed">
                    Em PayFacs e adquirentes, frequentemente poucos MIDs ou{" "}
                    <TermTooltip
                      term="MCCs"
                      definition="Merchant Category Code: código ISO 18245 do ramo de atividade."
                    />{" "}
                    concentram mais de 70% dos TC40. Audite o ranking semanalmente.
                  </span>
                </div>
              </li>
              <li className="flex gap-3 rounded-xl border border-border bg-background p-3.5">
                <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-mono text-xs font-bold">
                  3
                </div>
                <div>
                  <span className="text-foreground font-semibold block text-xs sm:text-sm">
                    Pre-Dispute Alerts (Verifi RDR / Ethoca) & CE 3.0
                  </span>
                  <span className="text-muted-foreground text-xs leading-relaxed">
                    Resolver contestações no pré-disputa evita a geração do TC15/chargeback formal,
                    enquanto o Compelling Evidence 3.0 reverte fraude amigável elegível.
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
