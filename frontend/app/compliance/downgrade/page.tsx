import DowngradeClient from "./DowngradeClient";
import { TrendingDown, ChevronLeft, Info } from "lucide-react";
import Link from "next/link";
import { ExecutiveBusinessTriad } from "@/components/ExecutiveBusinessTriad";

export const metadata = {
  title: "Downgrade Lab: Otimização de Intercâmbio — VS Payments",
  description: "Descubra quanto sua operação perde por ineficiência técnica. Simule downgrades de intercâmbio e aprenda a proteger sua margem de lucro.",
};

export default function DowngradePage() {
  return (
    <div style={{ background: "#030711", minHeight: "100vh" }} className="pb-20">
      {/* ── Header ── */}
      <div 
        className="dot-grid"
        style={{ 
          borderBottom: "1px solid #0f1a2e",
          background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(239,68,68,0.1) 0%, transparent 65%)",
          padding: "4rem 1.5rem 3.5rem"
        }}
      >
        <div className="mx-auto max-w-6xl">
          <Link 
            href="/compliance" 
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-6 transition-colors"
          >
            <ChevronLeft size={14} /> Voltar ao Command Center
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex items-start gap-4">
              <div 
                style={{ 
                  width: 56, height: 56, borderRadius: "1.2rem", flexShrink: 0,
                  background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}
              >
                <TrendingDown size={28} style={{ color: "#f87171" }} />
              </div>
              <div>
                <p className="section-eyebrow mb-1" style={{ color: "#f87171" }}>Interchange Optimization</p>
                <h1 className="font-bold text-white text-3xl md:text-4xl mb-2" style={{ letterSpacing: "-0.02em" }}>
                  Downgrade Lab <br className="hidden md:block" /> & Recuperação de Margem
                </h1>
                <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
                  Aprenda a caçar as perdas invisíveis. Descubra como erros de mensageria e atrasos no clearing corroem o lucro real da adquirente.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-slate-800">
               <Info size={16} className="text-slate-500" />
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                 Diferença entre o Lucro e o Prejuízo
               </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Conteúdo ── */}
      <div className="mx-auto max-w-6xl px-6 pt-6">
        <ExecutiveBusinessTriad
          topic="Downgrade de Intercâmbio & Perda de Margem"
          subtitle="O que todo CEO, CFO e Líder de Pagamentos precisa saber sobre o pedágio invisível que corrói o spread da operação."
          whatIsIt={{
            lead: "O Downgrade ocorre quando uma transação falha em cumprir 100% dos requisitos técnicos da bandeira, caindo automaticamente para o pior tier tarifário.",
            explanation: "As bandeiras oferecem tarifas com desconto (Tier Prime/Secure) para incentivar autenticação biométrica (3DS) e clearing rápido (D+1). Quando a adquirente atrasa o arquivo Base II ou omite o CAVV no DE 048, a bandeira cobra a taxa balcão punitiva.",
            analogy: "É como despachar uma carga com frete promocional pré-pago: se faltar um carimbo ou a entrega atrasar duas horas, a transportadora cancela o desconto e cobra a tarifa de emergência em dobro."
          }}
          painOwner={{
            primaryRole: "CFO / Diretor de Tesouraria & Head de Adquirência",
            affectedEntities: ["Adquirentes", "Subadquirentes", "Gateways de Pagamento", "Grandes E-Commerces"],
            operationalImpact: "A tesouraria só percebe a perda no fechamento mensal dos relatórios VSS 110 ou MCBS, quando o spread já foi evaporado e o lojista já foi liquidado pelo valor antigo."
          }}
          financialPrice={{
            directPenalty: "+35 a +115 bps (+0.35% a +1.15%) de Intercâmbio",
            schemeFeesFine: "Tarifas extras de reprocessamento manual de clearing",
            annualBleedingEstimate: "R$ 420.000 a R$ 1.380.000 / ano a cada R$ 100M processados",
            consequence: "Aniquilação completa do markup da adquirente/sub (que costuma ser de 30 a 50 bps), fazendo a empresa pagar para processar o cliente."
          }}
        />

        <DowngradeClient />
      </div>
    </div>
  );
}
