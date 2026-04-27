import DisputeClient from "./DisputeClient";
import TermTooltip from "@/components/TermTooltip";
import { Scale, ChevronLeft, Handshake, ShieldAlert, BadgeDollarSign, ArrowRight } from "lucide-react";
import Link from "next/link";
import RuleReference from "@/components/RuleReference";

export const metadata = {
  title: "Playbook: Mastercom & VROL Disputas | VS Payments",
  description: "Entenda as fases de um chargeback na Mastercard (DMAS) e Visa (VROL), e descubra o ROI de seguir para Arbitragem.",
};

export default function DisputePage() {
  return (
    <div className="bg-background min-h-screen pb-20">
      {/* ── Header Narrativo ── */}
      <div style={{ borderBottom: "1px solid var(--border)", background: "var(--code-bg)" }} className="py-6 px-6">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/compliance"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ChevronLeft size={16} /> Voltar ao Hub
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-500 flex items-center justify-center">
              <Scale size={20} />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              Playbook: Gestão de Disputas & Chargebacks
            </h1>
          </div>
          <p className="text-muted-foreground text-sm max-w-3xl leading-relaxed">
            Neste playbook completo revelamos como recuperar dinheiro perdido. Traduzimos as complexas siglas das APIs 
            <strong> Mastercom (DMAS)</strong> e <strong>Visa Resolve Online (VROL)</strong> e ensinamos 
            que defesa protocolar (<em>Compelling Evidence</em>) em um cenário de Erro Físico vs Fraude Amigável.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 pt-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Lado Esquerdo: O Conteúdo Narrativo */}
        <div className="lg:col-span-12 xl:col-span-8 flex flex-col gap-10">
          
          {/* Seção Teórica: Mastercom x VROL */}
          <section>
            <h2 className="text-lg font-bold text-foreground mb-4">O Fim da Confusão de Nomenclatura</h2>
            <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed space-y-4">
              <p>
                Quando um portador reclama de uma transação, as bandeiras intermediam a disputa. Na Mastercard o sistema chama-se <TermTooltip term="DMAS / Mastercom" definition="Dispute Management API Service. Plataforma de mediação oficial da Mastercard." /> e na Visa chama-se <TermTooltip term="VROL" definition="Visa Resolve Online. API e Portal de disputas exclusivo da Visa." />.
              </p>
              <p>
                As nomenclaturas não batem. O que a Mastercard chama de <TermTooltip term="First Chargeback" definition="O primeiro repto financeiro iniciado pelo Banco Emissor contra o Adquirente." />, a Visa chama de *Dispute*. O que a Master chama de *Representment* (sua resposta/defesa), a Visa chama de *Dispute Response*. Entender isso é vital para conectar seu gateway corretamente as duas bandeiras.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                 {/* Card Visa */}
                 <div className="bg-blue-500/5 border border-blue-500/20 p-5 rounded-xl">
                    <h3 className="text-blue-500 font-bold mb-2 flex flex-wrap items-center gap-2">
                      <ArrowRight size={14} className="mt-0.5" /> 
                      Visa: Allocation vs Collaboration
                      <RuleReference manual="Visa Core Rules" chapter="Chapter 11: Dispute Resolution Framework" label="Ch 11: Dispute Framework" />
                    </h3>
                    <p className="text-xs text-foreground mb-2">A Visa em 2018 dividiu os problemas em 2 fluxos lógicos pela ferramenta VCR:</p>
                    <ul className="text-xs space-y-1 list-disc ml-4 opacity-80">
                      <li><strong>Allocation:</strong> Usado para Fraude <RuleReference manual="Visa Core Rules" chapter="Dispute Condition 10.4: Other Fraud" label="Cond: 10.4" />. O Liability Shift é automatizado pelo VROL. Evidência só pode ser enviada uma vez (sem ping-pong).</li>
                      <li><strong>Collaboration:</strong> Usado para Processamento (mercadoria não entregue). Exige envio de provas entre lojista e portador para a rede checar.</li>
                    </ul>
                 </div>
                 {/* Card Mastercard */}
                 <div className="bg-orange-500/5 border border-orange-500/20 p-5 rounded-xl">
                    <h3 className="text-orange-500 font-bold mb-2 flex flex-wrap items-center gap-2">
                       <ArrowRight size={14} className="mt-0.5" /> 
                       Master: DMAS Workflow
                       <RuleReference manual="Mastercard Chargeback Guide" chapter="Reason Code 4837: No Cardholder Authorization" label="RC 4837" />
                    </h3>
                    <p className="text-xs text-foreground mb-2">Um fluxo linear (ping-pong) para todos os reason codes:</p>
                    <ul className="text-xs space-y-1 ml-2 opacity-80">
                      <li>1. First Chargeback (Emissor)</li>
                      <li>2. Representment (Adquirente / Lojista envia as provas)</li>
                      <li>3. Pre-Arbitration (Emissor recusa provas)</li>
                      <li>4. Arbitration (Bandeira dá veredito)</li>
                    </ul>
                 </div>
              </div>
            </div>
          </section>

          {/* O Simulador Interativo */}
          <section className="mt-8 pt-8 border-t border-border">
             <h2 className="text-2xl font-bold text-foreground mb-2">Motor Tático: DMAS & VROL</h2>
             <p className="text-sm text-muted-foreground mb-8">
               Selecione abaixo um Motivo de Disputa (Fraud, Auth, etc). Nosso motor indicará quais Provas Convictas (Compelling Evidence) você precisa gerar e a Viabilidade Financeira (ROI) de tentar ganhar este caso sem perder mais com Taxas de Arbitragem.
             </p>
             <div className="w-full">
               <DisputeClient />
             </div>
          </section>

        </div>

        {/* Lado Direito: Sidebars (Vocabulário / Custo da Arbitragem) */}
        <div className="lg:col-span-12 xl:col-span-4 flex flex-col gap-6">
          <div className="bg-code-bg border border-border rounded-2xl p-6 shadow-sm sticky top-8">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
               <BadgeDollarSign className="text-red-500" size={16}/> O Custo Doloroso da Arbitragem
            </h3>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
               Na emoção, lojistas e adquirentes lutam por qualquer chargeback para não perderem receitas. No entanto, se o emissor "dobrar a aposta" e empurrar o caso para o Estágio 4 (Arbitragem):
            </p>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="mt-1 w-2 h-2 rounded-full bg-red-500 shrink-0"></div>
                <label className="text-sm text-foreground">Filing Fee: <span className="text-muted-foreground">Usd/Eur 150* (Apenas para o caso ser lido pela Master/Visa)</span></label>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 w-2 h-2 rounded-full bg-red-500 shrink-0"></div>
                <label className="text-sm text-foreground">Review Fee: <span className="text-muted-foreground">Usd/Eur 250* (Taxa cobrada do perdedor da disputa)</span></label>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 w-2 h-2 rounded-full bg-yellow-500 shrink-0"></div>
                <label className="text-sm text-foreground">Withdrawal Fee: <span className="text-muted-foreground">Se você desistir durante o pre-arb pode pagar taxa reduzida de Usd 100*.</span></label>
              </li>
            </ul>
            <div className="w-full mt-6 p-4 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-lg text-xs leading-relaxed font-medium">
               <strong>A Regra de Ouro:</strong> Nunca leve um chargeback para a última instância (Arbitration) se o valor em disputa for inferior a $ 500, a menos que você tenha 100% de confiança na sua Evidência. O custo da derrota supera o produto vendido. <RuleReference manual="Mastercard Chargeback Guide" chapter="Arbitration & Compliance" label="Arbitragem" />
            </div>
            <p className="text-[10px] text-muted-foreground mt-4 opacity-50">* Os valores de fee variam por Network e por Região do adquirente.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
