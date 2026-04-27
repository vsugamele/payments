import Link from "next/link";
import { ArrowLeft, Calculator, Coins, TrendingUp, CreditCard } from "lucide-react";
import { SimulatorPage } from "@/components/SimulatorPage";
import TermTooltip from "@/components/TermTooltip";

export const metadata = {
  title: "Simulador e Anatomia de Intercâmbio — Compliance VS Payments",
  description: "Aprenda a mecânica da precificação de Bandeiras e simule taxas reais.",
};

export default function SimuladorRoute() {
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
            href="/"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", color: "var(--muted-foreground)", marginBottom: "1.5rem" }}
            className="hover:text-white transition-colors"
          >
            <ArrowLeft size={13} /> Voltar para o Início
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
              <Calculator size={24} style={{ color: "#3b82f6" }} />
            </div>
            <div>
              <p className="section-eyebrow mb-2">Motor de Rateio e Custos</p>
              <h1 className="font-bold text-white mb-3" style={{ fontSize: "clamp(1.6rem, 4vw, 2.4rem)", lineHeight: 1.1 }}>
                Arquitetura do <br className="hidden md:block"/> Intercâmbio & Pricing
              </h1>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl">
                O desconhecimento do ecossistema destrói a margem do Lojista e da Adquirente. Entenda como uma subadquirente absorve custos altíssimos de um <TermTooltip term="PID" definition="Product ID. Identificador na norma ISO que acusa se o plástico é um Black/Infinite ou um Standard. Cartões de alta renda custam mais caro para o Lojista."/> sofisticado e utilize nosso Motor de Regras Real abaixo para simular cascatas que definem os pedágios da rede.
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
                <Coins size={20} className="text-blue-500"/> Anatomia de Custos (MDR)
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Quando seu lojista paga 2.50% de <TermTooltip term="MDR" definition="Merchant Discount Rate: O pedágio final que a maquininha cobra da loja." />, essa taxa é imediatamente fatiada. A maior mordida **não vai** para a Bandeira, e sim para o Banco Emissor, a título de  <TermTooltip term="Intercâmbio" definition="A taxa base paga pela Adquirente ao Banco Emissor (Itaú, Nubank) pelo risco de crédito e financiamento dos Programas de Milhas/Benefícios." />.
              </p>
            </div>

            {/* Diagrama Visual (CSS) */}
            <div className="bg-code-bg border border-border rounded-xl p-5 mt-6">
              <h3 className="text-xs font-bold text-white mb-4 uppercase tracking-wider">A Fatura (R$ 100)</h3>
              
              <div className="flex w-full h-8 rounded-full overflow-hidden mb-3 font-bold text-[10px] text-white">
                <div className="bg-blue-600 flex items-center justify-start pl-3 w-[65%]" title="Banco Emissor (Risco e Milhas)">Intercâmbio (Ex: 1.50%)</div>
                <div className="bg-purple-600 flex items-center justify-start pl-3 w-[15%]" title="Bandeira (Tráfego da Rede)">Fee (0.25%)</div>
                <div className="bg-green-600 flex items-center justify-start pl-3 w-[20%]" title="Adquirente (Lucro da Maquininha)">Markup (0.75%)</div>
              </div>

              <div className="flex justify-between items-center text-xs text-muted-foreground mt-4">
                <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div> Banco Emissor</span>
                <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-purple-600"></div> Bandeira</span>
                <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-green-600"></div> Adquirente</span>
              </div>

            </div>
          </div>

          {/* Lado Direito: Os Eixos */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <TrendingUp size={20} className="text-purple-500"/> Tripé de Precificação (As Variáveis)
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Ao testar o Dicionário de Intercâmbio, você verá a cascata de precificação decidir qual <TermTooltip term="IRD" definition="Interchange Rate Designator. O 'Tier' da tabela onde a transação caiu. (Ex: 'CREDIT PRIME')." /> será executado. Para qual a taxa cai? O sistema mede 3 eixos cruciais na hora em que o JSON trafega:
            </p>
            
            <div className="bg-black/20 border border-border rounded-xl">
              <div className="p-4 border-b border-border">
                <span className="text-xs font-bold text-white uppercase tracking-widest">Variáveis Críticas da Cascata</span>
              </div>
              <ul className="text-sm p-4 space-y-4">
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 mt-0.5"><CreditCard size={12}/></div>
                  <div>
                    <span className="text-white font-medium block">1. O Produto (BIN / PID)</span>
                    <span className="text-muted-foreground text-xs leading-relaxed">Cartões Black/Infinite pagam altas milhas. Como o Banco financia isso? Puxando a taxa de Intercâmbio lá pra cima. O Standard/Classic é mais barato.</span>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0 mt-0.5"><span className="text-xs font-bold">CNL</span></div>
                  <div>
                    <span className="text-white font-medium block">2. O Canal (Captura)</span>
                    <span className="text-muted-foreground text-xs leading-relaxed">E-commerce tem alto risco de chargeback, então custa mais caro. Porém, se você usar <TermTooltip term="3D-Secure / Frictionless" definition="Protocolo de Proteção por Biometria/App. Remove a responsabilidade de fraude do lojista (Liability Shift)." />, a bandeira premia sua conexão com taxas de intercâmbio incrivelmente mais baixas.</span>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center shrink-0 mt-0.5"><span className="text-xs font-bold">MCC</span></div>
                  <div>
                    <span className="text-white font-medium block">3. O Ramo Subvencionado (MCC)</span>
                    <span className="text-muted-foreground text-xs leading-relaxed">Postos de Combustível (5541) e Supermercados (5411) operam com margens de centavos. Para aceitarem cartão, a bandeira possui tabelas subsidiadas por Lei. Preencher o MCC errado arruína sua margem.</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </section>

      {/* Formulário & Motor */}
      <section className="border-t border-border bg-black/40">
        <div className="mx-auto max-w-7xl px-6 pt-12">
           <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl font-bold text-white mb-3">Motor de Cascata de Intercâmbio</h2>
            <p className="text-sm text-muted-foreground">
               Compreendida a arquitetura de Pricing, utilize a calculadora oficial para decifrar, em tempo real, todas as centenas de Tiers (cascatas) da Visa, Mastercard e Maestro com regras oficiais de banco de dados.
            </p>
           </div>
           
           <SimulatorPage />

        </div>
      </section>

    </main>
  );
}
