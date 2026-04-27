import Link from "next/link";
import { Search, ArrowLeft, Network, ShieldClose, ServerCrash, KeyRound } from "lucide-react";
import CamposClient from "./CamposClient";
import TermTooltip from "@/components/TermTooltip";
import RuleReference from "@/components/RuleReference";

export const metadata = {
  title: "Autorização & ISO 8583 — Compliance VS Payments",
  description: "Playbook completo da fisiologia transacional na rede VIP/Banknet. Aprenda como montar pacotes resilientes e evite quedas silenciosas por Stand-In.",
};

export default function CamposPage() {
  return (
    <main className="bg-background pb-24">
      {/* Header Playbook */}
      <section
        className="dot-grid"
        style={{
          background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(37,99,235,0.08) 0%, transparent 70%)",
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
                background: "rgba(37,99,235,0.1)",
                border: "1px solid rgba(37,99,235,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Network size={24} style={{ color: "#3b82f6" }} />
            </div>
            <div>
              <p className="section-eyebrow mb-2">Engenharia de Intercâmbio</p>
              <h1 className="font-bold text-white mb-3" style={{ fontSize: "clamp(1.6rem, 4vw, 2.4rem)", lineHeight: 1.1 }}>
                Fisiologia da Autorização <br className="hidden md:block"/> ISO-8583
              </h1>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl">
                O desconhecimento do ecossistema de liquidação causa perdas massivas de aprovação. Entenda a jornada da requisição{" "}
                <TermTooltip term="0100" definition="Message Type Indicator (MTI) que indica um Pedido de Autorização originado pelo Adquirente." />
                , o impacto de cada Campo de Dados ({" "}
                <TermTooltip term="DE / Data Element" definition="Data Element representa posições contidas nos Bitmaps da norma ISO 8583-1987. Ex: DE 2 é o PAN, DE 39 é a reposta." />
                {" "}), e verifique no Validador Tático abaixo a solidez técnica da sua mensagem financeira.
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
                <Network size={20} className="text-blue-500"/> O Caminho Crítico (Submilissegundos)
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Toda requisição deve cruzar o firewall de segurança da Adquirente, da Bandeira 
                e, por fim, do Emissor. A morte prematura da transação (conhecida como <TermTooltip term="Stand-In Decline" definition="Quando a bandeira barra sua tentativa de compra (System Decline) logo na largada, sequer enviando pro Emissor avaliar o limite. Causado por ISO mal formado." />) 
                acontece pela rejeição imediata da mensagem. <RuleReference manual="Mastercard Rules" chapter="Chapter 2: Authorization Server" />
              </p>
            </div>

            {/* Diagrama Visual (CSS) */}
            <div className="bg-code-bg border border-border rounded-xl p-5 mt-6">
              <h3 className="text-xs font-bold text-white mb-4 uppercase tracking-wider">Topologia do Pedido 0100</h3>
              <div className="space-y-3 relative before:absolute before:inset-0 before:ml-[15px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                
                {/* Step 1 */}
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    <KeyRound size={14} />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-3 rounded bg-black/40 border border-border">
                    <div className="font-bold text-blue-400 text-xs mb-1">Montagem Base na Adquirente</div>
                    <div className="text-muted-foreground text-[11px] leading-tight">O PSP injeta o DE 2 (PAN) e o  <TermTooltip term="DE 22" definition="Entry Mode (como o PAN chegou à base). 81 para E-commerce, 05 para Chip."/> vital para taxas TAF/SCOF.</div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    <ServerCrash size={14} />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-3 rounded bg-black/40 border border-border">
                    <div className="font-bold text-purple-400 text-xs mb-1">Switching da Bandeira</div>
                    <div className="text-muted-foreground text-[11px] leading-tight">Banknet (Master) ou VIP (Visa) inspecionam o JSON. Faltou <TermTooltip term="ARQC" definition="Tag criptográfica essencial do Chip no DE 55."/>? A Bandeira ejeta. Transação não avança.</div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border border-red-500/30 bg-red-500/10 text-red-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    <ShieldClose size={14} />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-3 rounded bg-black/40 border border-border">
                    <div className="font-bold text-red-400 text-xs mb-1">Crivo de Risco do Emissor</div>
                    <div className="text-muted-foreground text-[11px] leading-tight">Banco Emissor processa (Autoriza ou gera <TermTooltip term="DE 39" definition="O Response Code que assombra os lojistas. Traz o número da recusa."/> de negação). É gerada a MTI de Volta 0110.</div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Lado Direito: Checklist */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <CheckCircle size={20} className="text-green-500"/> Troubleshooting de Respostas (DE 39)
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Cada adquirente repassa ao Lojista o erro 8583. Entenda cirurgicamente como lidar com recusas brutais baseando-se nas regras de Retry de rede.
            </p>
            
            <div className="bg-black/20 border border-border rounded-xl">
              <div className="p-4 border-b border-border">
                <span className="text-xs font-bold text-blue-400 uppercase">Classificação Tática Restritiva</span>
              </div>
              <ul className="text-sm p-4 space-y-4">
                <li className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center shrink-0 mt-0.5"><span className="text-xs font-bold">51</span></div>
                  <div>
                    <span className="text-white font-medium block flex items-center gap-2">Not Sufficient Funds (NSF) <RuleReference manual="ISO 8583-1:1987" chapter="Data Element 39" /></span>
                    <span className="text-muted-foreground text-xs leading-relaxed">Emissor barrou por limite. <b>Amigável a Retentativas.</b> As redes permitem retry programado em D+1 sem aplicar tarifa punitiva.</span>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0 mt-0.5"><span className="text-xs font-bold">05</span></div>
                  <div>
                    <span className="text-white font-medium block flex items-center gap-2">Do Not Honor (Recusa Genérica) <RuleReference manual="Visa Core Rules" chapter="Condition 10.4: Do Not Honor" /></span>
                    <span className="text-muted-foreground text-xs leading-relaxed">O Banco Emissor simplesmente não quer te dizer por que barrou. <b>Recomendação:</b> Solicitar ao cliente outro plástico imediatamente. NUNCA faça looping de retrys ou você tomará o threshold do programa "Excessive Authorization".</span>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center shrink-0 mt-0.5"><span className="text-xs font-bold">04</span></div>
                  <div>
                    <span className="text-white font-medium block">Pick-up Card (Atenção Máxima)</span>
                    <span className="text-muted-foreground text-xs leading-relaxed">Indica cartão marcado como Extraviado ou Roubado ativamente pelas polícias/emissor. <b>Risco Letal</b>. Jogue esse BIN/CPF incontestavelmente para a blocklist do seu anti-fraude.</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </section>

      {/* Dicionário & Validador Técnico */}
      <section className="border-t border-border bg-black/40">
        <div className="mx-auto max-w-5xl px-6 pt-12 text-center max-w-2xl mx-auto mb-6">
           <h2 className="text-2xl font-bold text-white mb-3">Lookup Tools & Verificação</h2>
           <p className="text-sm text-muted-foreground">
              Utilize nossa engine de busca para dissecar cada elemento (DE) exigido pela liquidação da Master/Visa ou insira seu JSON pre-auth no Validator para checar a saúde dos tipos primitivos antes de tomar um 'System Decline'.
           </p>
        </div>
        <CamposClient />
      </section>

    </main>
  );
}

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
