import Link from "next/link";
import { BarChart2, ArrowLeft, AlertCircle, ShieldAlert, FileWarning, Zap } from "lucide-react";
import RiscoClient from "./RiscoClient";
import TermTooltip from "@/components/TermTooltip";
import RuleReference from "@/components/RuleReference";

export const metadata = {
  title: "Monitoramento de Risco — Compliance VS Payments",
  description: "Playbook de programas de monitoramento de fraude e disputas (VAMP, ECP, EFM). Aprenda as mecânicas, calcule a exposição do seu portfólio e evite penalidades.",
};

export default function RiscoPage() {
  return (
    <main className="bg-background pb-24">
      {/* Header Playbook */}
      <section
        className="dot-grid"
        style={{
          background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(234,179,8,0.08) 0%, transparent 70%)",
          padding: "4rem 1.5rem 3.5rem",
          borderBottom: "1px solid #0f172a",
        }}
      >
        <div className="mx-auto max-w-5xl">
          <Link
            href="/compliance"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", color: "var(--muted-foreground)", marginBottom: "1.5rem" }}
            className="hover:text-white transition-colors"
          >
            <ArrowLeft size={13} /> Voltar para Compliance
          </Link>
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div
              style={{
                width: 52, height: 52,
                borderRadius: "1rem",
                background: "rgba(234,179,8,0.1)",
                border: "1px solid rgba(234,179,8,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <BarChart2 size={24} style={{ color: "#f59e0b" }} />
            </div>
            <div>
              <p className="section-eyebrow mb-2">Playbook de Monitoramento</p>
              <h1 className="font-bold text-white mb-3" style={{ fontSize: "clamp(1.6rem, 4vw, 2.4rem)", lineHeight: 1.1 }}>
                Risco e <br className="hidden md:block"/> Programas de Bandeira
              </h1>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl">
                O desconhecimento dos limites de Fraude e Disputas custa milhões em multas
                para os adquirentes e lojistas. Entenda como funcionam o{" "}
                <TermTooltip term="VAMP" definition="Visa Acquirer Monitoring Program. Avalia fraudes puras reportadas na rede Visa, não importando se houve chargeback ou não." />
                <RuleReference manual="Visa Core Rules" chapter="Chapter 11: VAMP" />
                , o{" "}
                <TermTooltip term="ECP" definition="Excessive Chargeback Program. Foca na quantidade massiva de estornos (Mastercard)." />
                <RuleReference manual="Mastercard Rules" chapter="Chapter 8: ECP" />
                {" "}e calcule o enquadramento do seu portfólio no painel tático abaixo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Conteúdo Teórico */}
      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          
          {/* Lado Esquerdo: A Mecânica */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <ShieldAlert size={20} className="text-amber-500"/> A Assimetria do Risco
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Diferente do senso comum, as bandeiras não te multam apenas por estornos financeiros concluídos.
                Programas como o VAMP da Visa monitoram o temido{" "}
                <TermTooltip term="TC40" definition="Relatório de fraude TC40 enviado pelo emissor à bandeira assim que o titular avisa que não reconhece a compra, antes mesmo do trânsito de dinheiro do Chargeback." />
                . Isso significa que mesmo se você não perder dinheiro na disputa (por agir rápido), 
                se a transação foi originada como fraude, ela vai sujar sua métrica da bandeira.
              </p>
            </div>

            {/* Diagrama Visual (CSS) */}
            <div className="bg-code-bg border border-border rounded-xl p-5 mt-6">
              <h3 className="text-xs font-bold text-white mb-4 uppercase tracking-wider">A Cascata do Enquadramento</h3>
              <div className="space-y-3 relative before:absolute before:inset-0 before:ml-[15px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                
                {/* Step 1 */}
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    <Zap size={14} />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-3 rounded bg-black/40 border border-border">
                    <div className="font-bold text-orange-400 text-xs mb-1">Transação Fraudulenta</div>
                    <div className="text-muted-foreground text-[11px] leading-tight">O fraudador aprova a compra passando pelos filtros básicos.</div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border border-red-500/30 bg-red-500/10 text-red-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    <FileWarning size={14} />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-3 rounded bg-black/40 border border-border">
                    <div className="font-bold text-red-400 text-xs mb-1">Emissão de TC40 / SAFE</div>
                    <div className="text-muted-foreground text-[11px] leading-tight">Titular liga pro banco. Banco envia código indicando Fraude (D+1). <b>O VAMP já rastreia aqui.</b></div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    <AlertCircle size={14} />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-3 rounded bg-black/40 border border-border">
                    <div className="font-bold text-purple-400 text-xs mb-1">Chargeback Efetivado</div>
                    <div className="text-muted-foreground text-[11px] leading-tight">Dinheiro debita da conta. A Mastercard apanha isso no seu programa ECP após o mês fechar.</div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Lado Direito: Checklist */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <CheckCircle size={20} className="text-green-500"/> Checklist de Evitação
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Seu indicador principal não é só reais, é o <TermTooltip term="BPS" definition="Basis Points. É a forma que a bandeira lê a porcentagem: 100 bps significa 1% (ou 0.01). 50 bps é 0.5%." />.
              Se a calculadora abaixo apontar <b>nível vermelho</b> nestes programas, os C-Levels serão escalados na bandeira e multas começam a rolar trimestralmente. O que fazer?
            </p>
            
            <div className="bg-black/20 border border-border rounded-xl">
              <div className="p-4 border-b border-border">
                <span className="text-xs font-bold text-orange-400 uppercase">Estratégias de Remediação Imediata</span>
              </div>
              <ul className="text-sm p-4 space-y-4">
                <li className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center shrink-0 mt-0.5"><span className="text-xs font-bold">1</span></div>
                  <div>
                    <span className="text-white font-medium block flex items-center gap-2">Ativação forçada de 3DS <RuleReference manual="Mastercard Rules" chapter="Chapter 8: EFM Exemptions" /></span>
                    <span className="text-muted-foreground text-xs leading-relaxed">No EFM (Mastercard), se seu volume de 3DS for superior a 10%, você obtém isenção da multa do programa, mesmo com a taxa de fraude estourada.</span>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center shrink-0 mt-0.5"><span className="text-xs font-bold">2</span></div>
                  <div>
                    <span className="text-white font-medium block">Drenagem Criminosa em MCC Específico</span>
                    <span className="text-muted-foreground text-xs leading-relaxed">Avalie o portfólio para ver se um único <TermTooltip term="MCC" definition="Merchant Category Code. O código Cnae dos pagamentos."/> é responsável por 90% dos seus chargebacks. Pause a aprovação daquele nicho.</span>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center shrink-0 mt-0.5"><span className="text-xs font-bold">3</span></div>
                  <div>
                    <span className="text-white font-medium block">Pre-Auth Risk Check</span>
                    <span className="text-muted-foreground text-xs leading-relaxed">Integrações de Anti-Fraude na "perna de autorização", que barram a transação antes do banco emissor criar o TC40, blindam totalmente o VAMP.</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </section>

      {/* Simulador Interativo */}
      <section className="border-t border-border bg-black/40">
        <div className="mx-auto max-w-5xl px-6 pt-12">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl font-bold text-white mb-3">Calculadora Tática de Portfólio</h2>
            <p className="text-sm text-muted-foreground">
              Alimente com as métricas que você extrai da sua adquirente (ou do seu sub-credenciador) no final do mês. Descubra sua pontuação de BPS e sua exposição legal.
            </p>
          </div>
        </div>
        <RiscoClient />
      </section>

    </main>
  );
}

// Extracted from original context for self-contained use
function CheckCircle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
